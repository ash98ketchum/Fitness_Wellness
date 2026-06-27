import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { generateDietPlan } from '../groq';

const router = Router();
const prisma = new PrismaClient();

// ─── Plans: Generate ──────────────────────────
router.post('/generate', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;

    // Get onboarding profile
    const profile = await prisma.onboardingProfile.findUnique({ where: { userId } });
    let profileData: any = {};
    if (profile) {
      const p = JSON.parse(profile.personalInfo);
      const g = JSON.parse(profile.fitnessGoals);
      const f = JSON.parse(profile.foodPreferences);
      const l = JSON.parse(profile.lifestyle);
      const h = JSON.parse(profile.healthData);
      profileData = { ...p, ...g, ...f, ...l, ...h };
    }

    // Create plan record
    const plan = await prisma.dietPlan.create({
      data: { userId, status: 'GENERATING' },
    });

    // Run the multi-agent pipeline
    const result = await generateDietPlan(profileData);

    // Save meals
    for (const meal of result.meals) {
      await prisma.meal.create({
        data: {
          dietPlanId: plan.id,
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

    // Save verification report
    await prisma.verificationReport.create({
      data: {
        dietPlanId: plan.id,
        confidenceScore: result.confidenceScore,
        issuesFound: JSON.stringify(result.issuesFound),
        correctionsApplied: JSON.stringify([result.aiInsight, ...result.correctionsApplied]),
        agent1Raw: result.agent1Raw,
        agent2Raw: result.agent2Raw,
        agent3Raw: result.agent3Raw,
      },
    });

    // Update plan status and macros
    await prisma.dietPlan.update({
      where: { id: plan.id },
      data: {
        status: 'READY',
        totalCalories: result.totalCalories,
        proteinG: result.proteinG,
        carbsG: result.carbsG,
        fatsG: result.fatsG,
      },
    });

    res.json({ planId: plan.id, status: 'READY' });
  } catch (err) {
    console.error('Plan generation error:', err);
    res.status(500).json({ error: 'Plan generation failed' });
  }
});

// ─── Plans: Get Latest ────────────────────────
router.get('/latest', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const plan = await prisma.dietPlan.findFirst({
      where: { userId, status: 'READY' },
      orderBy: { createdAt: 'desc' },
      include: { meals: { orderBy: { createdAt: 'asc' } }, report: true },
    });

    if (!plan) {
      res.json({ plan: null });
      return;
    }

    // Optionally get user details for the report rendering if needed
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { name: true } });

    res.json({ plan, user });
  } catch (err) {
    console.error('Fetch plan error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── Plans: Add Meal to Latest Plan ───────────
router.post('/latest/meals/add', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { name, calories, proteinG, carbsG, fatsG } = req.body;

    const plan = await prisma.dietPlan.findFirst({
      where: { userId, status: 'READY' },
      orderBy: { createdAt: 'desc' },
    });

    if (!plan) {
      res.status(404).json({ error: 'No active plan found' });
      return;
    }

    const meal = await prisma.meal.create({
      data: {
        dietPlanId: plan.id,
        name: name || 'Custom Meal',
        description: 'User added custom meal',
        time: 'Custom',
        calories: calories || 0,
        macros: JSON.stringify({ protein: proteinG || 0, carbs: carbsG || 0, fats: fatsG || 0 }),
        ingredients: JSON.stringify([]),
        portionSizes: JSON.stringify({}),
        recipeSteps: JSON.stringify([]),
      },
    });

    // Update total macros of plan
    await prisma.dietPlan.update({
      where: { id: plan.id },
      data: {
        totalCalories: plan.totalCalories + (calories || 0),
        proteinG: plan.proteinG + (proteinG || 0),
        carbsG: plan.carbsG + (carbsG || 0),
        fatsG: plan.fatsG + (fatsG || 0),
      }
    });

    res.json({ success: true, meal });
  } catch (err) {
    console.error('Add meal error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
