import { Router, Response } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { MasterCoach } from '../master-coach';

const router = Router();

// ─── Events: Log User Action ──────────────────
router.post('/log', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { eventType, eventData } = req.body;

    if (!eventType) {
      res.status(400).json({ error: 'eventType is required' });
      return;
    }

    // Fire and forget Master Coach Evaluation
    MasterCoach.evaluateEvent(userId, eventType, eventData).catch(err => {
      console.error('[Master Coach Async Error]', err);
    });

    res.json({ success: true, message: 'Event logged successfully' });
  } catch (err) {
    console.error('Event log error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
