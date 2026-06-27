import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { chatWithDietician, chatWithCookingAssistant } from '../groq';
import { buildAgentContext } from '../agent-context';
import { AIGateway } from '../ai-gateway';
import { MasterCoach } from '../master-coach';

const router = Router();
const prisma = new PrismaClient();

// ─── Chatbot (Dietician) ──────────────────────
router.post('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
      res.status(400).json({ error: 'Messages array is required' });
      return;
    }

    const profile = await prisma.onboardingProfile.findUnique({ where: { userId } });
    const plan = await prisma.dietPlan.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: { meals: true },
    });

    let profileData: any = {};
    if (profile) {
      const p = JSON.parse(profile.personalInfo);
      const g = JSON.parse(profile.fitnessGoals);
      const f = JSON.parse(profile.foodPreferences);
      const l = JSON.parse(profile.lifestyle);
      const h = JSON.parse(profile.healthData);
      profileData = { ...p, ...g, ...f, ...l, ...h };
    }

    const aiRes = await chatWithDietician(messages, profileData, plan || {});
    
    // If the AI detected a weight update, run regeneration in the background
    if (aiRes.weightUpdateDetected && aiRes.newWeightKg) {
      console.log(`[Dietician Chat] Weight update detected for ${userId}: ${aiRes.newWeightKg}kg`);
      
      // Update DB asynchronously so the user gets a fast chat response
      (async () => {
        try {
          // Update TransformationState
          await prisma.transformationState.upsert({
            where: { userId },
            update: { currentWeight: aiRes.newWeightKg, lastWeightUpdate: new Date() },
            create: { userId, goal: 'Maintenance', currentWeight: aiRes.newWeightKg, musclePriority: '[]' }
          });

          // Update OnboardingProfile personalInfo JSON
          if (profile) {
            const p = JSON.parse(profile.personalInfo);
            p.weight = aiRes.newWeightKg;
            await prisma.onboardingProfile.update({
              where: { userId },
              data: { personalInfo: JSON.stringify(p) }
            });
            profileData = { ...profileData, ...p }; // Update local for generation
          }

          console.log(`[Dietician Chat] Triggering Plan Regeneration for ${userId}...`);

          // Regenerate Diet
          const { generateDietPlan, generateWorkoutPlan } = require('../groq');
          
          const dietPlan = await prisma.dietPlan.create({ data: { userId, status: 'GENERATING' } });
          const newDiet = await generateDietPlan(profileData);
          for (const meal of newDiet.meals) {
            await prisma.meal.create({
              data: {
                dietPlanId: dietPlan.id,
                name: meal.name,
                description: meal.description,
                time: meal.time,
                calories: meal.calories,
                macros: JSON.stringify(meal.macros),
                ingredients: JSON.stringify(meal.ingredients),
                prepTime: meal.prepTime,
                difficulty: meal.difficulty,
                portionSizes: JSON.stringify(meal.portionSizes || {}),
                recipeSteps: JSON.stringify(meal.recipeSteps || []),
              },
            });
          }
          await prisma.dietPlan.update({ where: { id: dietPlan.id }, data: { status: 'ACTIVE' } });
          
          // Regenerate Workout
          const userWithHealth = await prisma.user.findUnique({
            where: { id: userId },
            include: { healthProfile: true }
          });
          const availableExercises = await prisma.exercise.findMany();
          
          const workoutData = await generateWorkoutPlan({
            profile: JSON.stringify(profileData),
            injuries: userWithHealth?.healthProfile?.activeInjuries ? JSON.parse(userWithHealth.healthProfile.activeInjuries) : [],
            fatigueLevel: userWithHealth?.healthProfile?.fatigueLevel || 'LOW',
            availableExercises: availableExercises.map(ex => ({
              id: ex.id, name: ex.name, targetMuscles: ex.targetMuscles, equipment: ex.equipment
            }))
          });

          const session = await prisma.workoutSession.create({
            data: {
              userId,
              date: new Date(),
              title: workoutData.title,
              durationMinutes: workoutData.durationMinutes,
              caloriesBurned: workoutData.caloriesBurned,
            }
          });

          for (let i = 0; i < workoutData.exercises.length; i++) {
            const exGen = workoutData.exercises[i];
            const exDb = availableExercises.find(e => e.name === exGen.exerciseName);
            if (exDb) {
              await prisma.workoutExercise.create({
                data: {
                  workoutId: session.id,
                  exerciseId: exDb.id,
                  order: i,
                  setsTarget: exGen.setsTarget,
                  repsTarget: exGen.repsTarget,
                  restSeconds: exGen.restSeconds,
                  tempo: exGen.tempo,
                  intensity: exGen.intensity,
                  suggestedWeight: exGen.suggestedWeight
                }
              });
            }
          }
          
          // Also let Master Coach evaluate it for consistency
          const { MasterCoach } = require('../master-coach');
          MasterCoach.evaluateEvent(userId, 'WEIGHT_UPDATE', { newWeightKg: aiRes.newWeightKg })
            .catch((e: any) => console.error(e));
          
          console.log(`[Dietician Chat] Regeneration complete for ${userId}`);
        } catch (err) {
          console.error('[Dietician Chat] Async generation failed:', err);
        }
      })();
    }

    res.json({ reply: aiRes.reply });
  } catch (err) {
    console.error('Chat error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── Voice Chat / Walkie-Talkie ───────────────
router.post('/voice', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { text } = req.body;

    if (!text) {
      res.status(400).json({ error: 'Text input required' });
      return;
    }

    // Context
    const contextStr = await buildAgentContext(userId);

    // AI Response
    const aiResponse = await AIGateway.generateJson<{
      response: string;
      shouldTriggerEvent: boolean;
      detectedEventType?: string;
      detectedEventData?: any;
    }>({
      messages: [
        {
          role: 'system',
          content: `You are Athelya, a voice-first health AI OS. Respond concisely and conversationally like a real coach. You can also detect if the user's message constitutes an 'event' (e.g., 'I ate a pizza', 'I skipped my workout'). Return your response in JSON format.`
        },
        {
          role: 'user',
          content: `Context:\n${contextStr}\n\nUser Message (Voice Transcribed):\n"${text}"`
        }
      ]
    });

    // If the AI detects an event from the natural language, feed it to MasterCoach
    if (aiResponse.shouldTriggerEvent && aiResponse.detectedEventType) {
      MasterCoach.evaluateEvent(userId, aiResponse.detectedEventType, aiResponse.detectedEventData || {}).catch(e => console.error('[Voice Chat] Event Error:', e));
    }

    res.json({ success: true, text: aiResponse.response, eventTriggered: aiResponse.shouldTriggerEvent });
  } catch (err) {
    console.error('Voice chat error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});



export default router;
