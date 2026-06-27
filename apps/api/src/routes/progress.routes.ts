import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// ─── Goal Tracker: Progress ─────────────────
router.get('/today', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const date = new Date().toISOString().split('T')[0];

    let progress = await prisma.dailyProgress.findUnique({
      where: { userId_date: { userId, date } }
    });

    if (!progress) {
      // Find active diet plan total calories
      const plan = await prisma.dietPlan.findFirst({
        where: { userId, status: 'READY' },
        orderBy: { createdAt: 'desc' },
      });
      const targetCalories = plan?.totalCalories || 2000;
      progress = await prisma.dailyProgress.create({
        data: { userId, date, caloriesConsumed: 0, caloriesRemaining: targetCalories }
      });
    }

    // Get today's logs
    const mealLogs = await prisma.mealLog.findMany({
      where: { userId, createdAt: { gte: new Date(date) } },
      include: { meal: true }
    });

    res.json({ progress, mealLogs });
  } catch (err) {
    console.error('Progress error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/log', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { mealId } = req.body;
    const date = new Date().toISOString().split('T')[0];

    const meal = await prisma.meal.findUnique({ where: { id: mealId } });
    if (!meal) {
      res.status(404).json({ error: 'Meal not found' });
      return;
    }

    // Create log
    const log = await prisma.mealLog.create({
      data: { userId, mealId, status: 'COMPLETED' }
    });

    // Update Daily Progress
    let progress = await prisma.dailyProgress.findUnique({
      where: { userId_date: { userId, date } }
    });

    if (progress) {
      await prisma.dailyProgress.update({
        where: { id: progress.id },
        data: {
          caloriesConsumed: progress.caloriesConsumed + meal.calories,
          caloriesRemaining: Math.max(0, progress.caloriesRemaining - meal.calories)
        }
      });
    }

    res.json({ success: true, log });
  } catch (err) {
    console.error('Log error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
