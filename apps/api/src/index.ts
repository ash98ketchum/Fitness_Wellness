import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { generateDietPlan, chatWithDietician } from './groq';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

app.use(cors());
app.use(express.json());

// ─── Auth Middleware ──────────────────────────
interface AuthRequest extends Request {
  userId?: string;
}

function authMiddleware(req: AuthRequest, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'No token provided' });
    return;
  }
  try {
    const decoded = jwt.verify(header.split(' ')[1], JWT_SECRET) as { userId: string };
    req.userId = decoded.userId;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}

// ─── Health Check ─────────────────────────────
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', service: 'luminafit-api' });
});

// ─── Auth: Signup ─────────────────────────────
app.post('/api/v1/auth/signup', async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      res.status(400).json({ error: 'Name, email, and password are required' });
      return;
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      res.status(409).json({ error: 'Email already registered' });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { name, email, passwordHash },
    });

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({
      token,
      user: { id: user.id, email: user.email, name: user.name },
    });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── Auth: Login ──────────────────────────────
app.post('/api/v1/auth/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
    res.json({
      token,
      user: { id: user.id, email: user.email, name: user.name },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── Onboarding: Save Profile ─────────────────
app.post('/api/v1/onboarding', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const data = req.body;
    const userId = req.userId!;

    const personalInfo = JSON.stringify({
      age: data.age,
      gender: data.gender,
      weight: data.weight,
      height: data.height,
      bodyFatPct: data.bodyFatPct,
      activityLevel: data.activityLevel,
    });

    const fitnessGoals = JSON.stringify({
      goal: data.goal,
      targetWeight: data.targetWeight,
      targetBodyFat: data.targetBodyFat,
      timeframe: data.timeframe,
    });

    const foodPreferences = JSON.stringify({
      dietPreference: data.dietPreference,
      allergies: data.allergies,
      dislikedFoods: data.dislikedFoods,
    });

    const lifestyle = JSON.stringify({
      mealsPerDay: data.mealsPerDay,
      cookingSkill: data.cookingSkill,
      budget: data.budget,
    });

    const healthData = JSON.stringify({
      waterIntake: data.waterIntake,
      sleepHours: data.sleepHours,
      stressLevel: data.stressLevel,
      supplements: data.supplements,
      medicalConditions: data.medicalConditions,
    });

    await prisma.onboardingProfile.upsert({
      where: { userId },
      create: { userId, personalInfo, fitnessGoals, foodPreferences, lifestyle, healthData },
      update: { personalInfo, fitnessGoals, foodPreferences, lifestyle, healthData },
    });

    res.json({ success: true });
  } catch (err) {
    console.error('Onboarding error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── Plans: Generate ──────────────────────────
app.post('/api/v1/plans/generate', authMiddleware, async (req: AuthRequest, res: Response) => {
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
app.get('/api/v1/plans/latest', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const plan = await prisma.dietPlan.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        meals: true,
        verificationReport: true,
      },
    });

    if (!plan) {
      res.status(404).json({ error: 'No plan found' });
      return;
    }

    // Parse JSON fields for meals
    const meals = plan.meals.map(m => ({
      ...m,
      macros: JSON.parse(m.macros),
      ingredients: JSON.parse(m.ingredients),
    }));

    const verificationReport = plan.verificationReport ? {
      ...plan.verificationReport,
      issuesFound: JSON.parse(plan.verificationReport.issuesFound),
      correctionsApplied: JSON.parse(plan.verificationReport.correctionsApplied),
    } : null;

    res.json({
      plan: {
        ...plan,
        meals,
        verificationReport,
      },
    });
  } catch (err) {
    console.error('Fetch plan error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── Onboarding: Get Profile ─────────────────
app.get('/api/v1/onboarding/me', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const profile = await prisma.onboardingProfile.findUnique({ where: { userId } });
    if (!profile) {
      res.status(404).json({ error: 'Profile not found' });
      return;
    }
    res.json({ profile });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── Chatbot ──────────────────────────────────
app.post('/api/v1/chat', authMiddleware, async (req: AuthRequest, res: Response) => {
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

    const reply = await chatWithDietician(messages, profileData, plan || {});
    res.json({ reply });
  } catch (err) {
    console.error('Chat error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── Start Server ─────────────────────────────
app.listen(port, () => {
  console.log(`✓ LuminaFit API running on http://localhost:${port}`);
});
