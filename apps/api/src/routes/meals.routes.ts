import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { regenerateMeal } from '../groq';

const router = Router();
const prisma = new PrismaClient();

// ─── Meals: Get Single Meal ───────────────────
router.get('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const mealId = req.params.id as string;
    const meal = await prisma.meal.findUnique({
      where: { id: mealId },
      include: { dietPlan: true }
    }) as any;

    if (!meal || meal.dietPlan.userId !== req.userId) {
      res.status(404).json({ error: 'Meal not found' });
      return;
    }

    res.json({
      meal: {
        ...meal,
        macros: JSON.parse(meal.macros),
        ingredients: JSON.parse(meal.ingredients),
        portionSizes: meal.portionSizes ? JSON.parse(meal.portionSizes) : {},
        recipeSteps: meal.recipeSteps ? JSON.parse(meal.recipeSteps) : [],
      }
    });
  } catch (err) {
    console.error('Fetch meal error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── Meals: Regenerate Single Meal ────────────
router.post('/:id/regenerate', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const mealId = req.params.id as string;
    const { type } = req.body;
    
    const meal = await prisma.meal.findUnique({
      where: { id: mealId },
      include: { dietPlan: true }
    }) as any;

    if (!meal || meal.dietPlan.userId !== req.userId) {
      res.status(404).json({ error: 'Meal not found' });
      return;
    }

    const profile = await prisma.onboardingProfile.findUnique({
      where: { userId: req.userId }
    });
    
    if (!profile) {
      res.status(400).json({ error: 'Profile not found' });
      return;
    }

    // Call Groq to generate a new meal with the exact calories of the old one
    const generated = await regenerateMeal(profile as any, type || 'Meal', meal.calories);

    // Update DB
    const updatedMeal = await prisma.meal.update({
      where: { id: meal.id },
      data: {
        name: generated.name,
        time: generated.time,
        calories: generated.calories,
        macros: JSON.stringify(generated.macros),
        ingredients: JSON.stringify(generated.ingredients),
        description: generated.description,
        prepTime: generated.prepTime,
        difficulty: generated.difficulty,
        portionSizes: JSON.stringify(generated.portionSizes),
        recipeSteps: JSON.stringify(generated.recipeSteps),
      }
    });

    res.json({
      meal: {
        ...updatedMeal,
        macros: JSON.parse(updatedMeal.macros),
        ingredients: JSON.parse(updatedMeal.ingredients),
        portionSizes: updatedMeal.portionSizes ? JSON.parse(updatedMeal.portionSizes) : {},
        recipeSteps: updatedMeal.recipeSteps ? JSON.parse(updatedMeal.recipeSteps) : [],
      }
    });
  } catch (err) {
    console.error('Regenerate meal error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
