import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// ─── Dashboard: Fetch Live State ──────────────
router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    
    const [transformation, streaks, recentLog] = await Promise.all([
      prisma.transformationState.findUnique({ where: { userId } }),
      prisma.streak.findUnique({ where: { userId } }),
      prisma.aIDecisionLog.findFirst({ 
        where: { userId },
        orderBy: { createdAt: 'desc' }
      })
    ]);

    let dailySummary = "Ready to conquer the day?";
    if (recentLog) {
      try {
        const parsed = JSON.parse(recentLog.decision);
        if (parsed.motivation) dailySummary = parsed.motivation;
      } catch (e) {
        dailySummary = recentLog.decision; // fallback to raw string if not JSON
      }
    }

    res.json({
      success: true,
      transformation,
      streaks,
      dailySummary
    });
  } catch (err) {
    console.error('Dashboard error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
