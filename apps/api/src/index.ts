import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';

import { initCronJobs } from './reflection';

// Routers
import authRoutes from './routes/auth.routes';
import onboardingRoutes from './routes/onboarding.routes';
import plansRoutes from './routes/plans.routes';
import mealsRoutes from './routes/meals.routes';
import workoutsRoutes from './routes/workouts.routes';
import progressRoutes from './routes/progress.routes';
import chatRoutes from './routes/chat.routes';
import agentsRoutes from './routes/agents.routes';
import dashboardRoutes from './routes/dashboard.routes';
import eventsRoutes from './routes/events.routes';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// ─── Health Check ─────────────────────────────
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', service: 'athelya-api' });
});

// ─── Apply Routes ─────────────────────────────
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/onboarding', onboardingRoutes);
app.use('/api/v1/plans', plansRoutes);
app.use('/api/v1/meals', mealsRoutes);
app.use('/api/v1/workouts', workoutsRoutes);
app.use('/api/v1/progress', progressRoutes);
app.use('/api/v1/chat', chatRoutes); // /api/v1/chat is the base, but we also had /api/v1/agents/cooking in chatRoutes. Let's adjust chatRoutes mounting. Wait, in chatRoutes, it's defined as `/`, `/voice`, `/agents/cooking`. So mounting it at `/api/v1/chat` means the cooking route becomes `/api/v1/chat/agents/cooking`. That breaks the frontend.
// Actually, let me map them manually to match exactly.

app.use('/api/v1/dashboard', dashboardRoutes);
app.use('/api/v1/events', eventsRoutes);

// For chat/agents:
app.use('/api/v1/chat', chatRoutes);
app.use('/api/v1/agents', agentsRoutes);

// ─── Start Server ─────────────────────────────
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Global Error Handler caught:', err);
  if (err instanceof SyntaxError && 'body' in err) {
    res.status(400).json({ error: 'Bad JSON format in request body', details: err.message });
  } else {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(port, () => {
  console.log(`✓ Athelya API running on http://localhost:${port}`);
  initCronJobs();
});
