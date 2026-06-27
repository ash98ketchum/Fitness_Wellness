import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { generateWorkoutPlan, chatWithTrainer, askGymCoach } from '../groq';

const router = Router();
const prisma = new PrismaClient();

// ─── Workouts ───────────────────────────────
router.post('/generate', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    
    // Gather user state
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { onboardingProfile: true, healthProfile: true }
    });

    if (!user) return res.status(404).json({ error: 'User not found' });

    // Ensure health profile exists
    if (!user.healthProfile) {
      await prisma.userHealthProfile.create({
        data: { userId, activeInjuries: '[]', fatigueLevel: 'LOW' }
      });
    }

    const availableExercises = await prisma.exercise.findMany();

    // Call Groq
    const workoutData = await generateWorkoutPlan({
      profile: user.onboardingProfile?.personalInfo || 'Standard User',
      injuries: user.healthProfile?.activeInjuries ? JSON.parse(user.healthProfile.activeInjuries) : [],
      fatigueLevel: user.healthProfile?.fatigueLevel || 'LOW',
      availableExercises: availableExercises.map(ex => ({
        id: ex.id,
        name: ex.name,
        targetMuscles: ex.targetMuscles,
        equipment: ex.equipment
      }))
    });

    // Save to DB
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
            suggestedWeight: exGen.suggestedWeight,
            tempo: exGen.tempo,
            intensity: exGen.intensity
          }
        });
      }
    }

    res.json({ success: true, sessionId: session.id });
  } catch (err) {
    console.error('Workout generation error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/today', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    
    // Find the latest active or planned session for today
    const session = await prisma.workoutSession.findFirst({
      where: { userId },
      orderBy: { date: 'desc' },
      include: {
        exercises: {
          include: { exercise: true, sets: true },
          orderBy: { order: 'asc' }
        }
      }
    });

    if (!session) {
      return res.json({ session: null });
    }

    res.json({ session });
  } catch (err) {
    console.error('Fetch workout error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/log-set', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { workoutExerciseId, setNumber, repsCompleted, weightUsed } = req.body;
    
    if (!workoutExerciseId || setNumber == null) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if the set already exists
    const existingSet = await prisma.workoutSet.findFirst({
      where: { workoutExerciseId, setNumber }
    });

    let workoutSet;
    if (existingSet) {
      workoutSet = await prisma.workoutSet.update({
        where: { id: existingSet.id },
        data: {
          repsCompleted: Number(repsCompleted) || 0,
          weightUsed: Number(weightUsed) || 0,
          isCompleted: true
        }
      });
    } else {
      workoutSet = await prisma.workoutSet.create({
        data: {
          workoutExerciseId,
          setNumber,
          repsCompleted: Number(repsCompleted) || 0,
          weightUsed: Number(weightUsed) || 0,
          isCompleted: true
        }
      });
    }

    res.json({ success: true, workoutSet });
  } catch (err) {
    console.error('Log set error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/trainer-chat', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { messages, exerciseId } = req.body;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { onboardingProfile: true }
    });

    const currentExercise = await prisma.exercise.findUnique({
      where: { id: exerciseId }
    });

    if (!currentExercise || !user) {
      return res.status(404).json({ error: 'Data not found' });
    }

    const reply = await chatWithTrainer(messages, currentExercise, user.onboardingProfile?.personalInfo || '');
    res.json({ reply });
  } catch (err) {
    console.error('Trainer Chat error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/coach-chat', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { messages, exerciseId } = req.body;
    
    if (!messages || !exerciseId) {
      res.status(400).json({ error: 'Missing messages or exerciseId' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { onboardingProfile: true, healthProfile: true }
    });

    const currentExercise = await prisma.exercise.findUnique({
      where: { id: exerciseId }
    });

    if (!currentExercise || !user) {
      res.status(404).json({ error: 'Data not found' });
      return;
    }

    let profileInfo = user.onboardingProfile?.personalInfo || '';
    if (user.healthProfile) {
      profileInfo += `\nInjuries: ${user.healthProfile.activeInjuries}`;
    }

    const reply = await askGymCoach(messages, currentExercise, profileInfo);
    res.json({ reply });
  } catch (err) {
    console.error('Coach Chat error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
