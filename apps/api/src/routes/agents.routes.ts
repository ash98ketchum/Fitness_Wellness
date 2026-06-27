import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { chatWithCookingAssistant } from '../groq';

const router = Router();
const prisma = new PrismaClient();

// ─── Cooking Assistant ────────────────────────
router.post('/cooking', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { messages, mealId } = req.body;

    if (!messages || !Array.isArray(messages) || !mealId) {
      res.status(400).json({ error: 'Messages array and mealId are required' });
      return;
    }

    const meal = await prisma.meal.findUnique({
      where: { id: mealId },
    });

    if (!meal) {
      res.status(404).json({ error: 'Meal not found' });
      return;
    }

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

    const mealData = {
      name: meal.name,
      time: meal.time,
      calories: meal.calories,
      macros: JSON.parse(meal.macros),
      ingredients: JSON.parse(meal.ingredients),
      description: meal.description,
      prepTime: meal.prepTime,
      difficulty: meal.difficulty,
      portionSizes: meal.portionSizes ? JSON.parse(meal.portionSizes) : {},
      recipeSteps: meal.recipeSteps ? JSON.parse(meal.recipeSteps) : [],
    };

    const reply = await chatWithCookingAssistant(messages, mealData, profileData);
    res.json({ reply });
  } catch (err) {
    console.error('Cooking Chat error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
