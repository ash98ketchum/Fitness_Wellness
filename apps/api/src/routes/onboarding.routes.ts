import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { upload } from '../middleware/upload';
import { processMedicalReport } from '../document-intelligence';

const router = Router();
const prisma = new PrismaClient();

// ─── Onboarding: Upload Medical Report ────────
router.post('/upload', authMiddleware, upload.single('report'), async (req: AuthRequest, res: Response) => {
  try {
    const file = req.file;
    const userId = req.userId!;
    
    if (!file) {
      res.status(400).json({ error: 'No file uploaded' });
      return;
    }

    // Pass to Document Intelligence Pipeline
    const extractedData = await processMedicalReport(file.path, userId, file.originalname);

    res.json({ 
      success: true, 
      fileUrl: `/uploads/${file.filename}`,
      extractedData 
    });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── Onboarding: Finalize ─────────────────────
router.post('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const data = req.body;

    const profile = await prisma.onboardingProfile.upsert({
      where: { userId },
      update: {
        personalInfo: JSON.stringify({
          age: data.age,
          gender: data.gender,
          weight: data.weightKg,
          height: data.heightCm,
          bodyFatPct: data.bodyFatPercentage,
          activityLevel: data.activityLevel,
        }),
        fitnessGoals: JSON.stringify({
          goal: data.primaryGoal,
          targetWeight: data.targetWeightKg,
          timeframe: '12 weeks'
        }),
        foodPreferences: JSON.stringify({
          dietPreference: data.dietaryPreference,
          allergies: data.allergies || [],
          dislikedFoods: data.dislikedFoods || [],
        }),
        lifestyle: JSON.stringify({
          mealsPerDay: data.mealsPerDay,
          cookingSkill: data.cookingSkill,
          budget: data.budgetPref,
        }),
        healthData: JSON.stringify({
          medicalConditions: data.medicalConditions || [],
        })
      },
      create: {
        userId,
        personalInfo: JSON.stringify({
          age: data.age,
          gender: data.gender,
          weight: data.weightKg,
          height: data.heightCm,
          bodyFatPct: data.bodyFatPercentage,
          activityLevel: data.activityLevel,
        }),
        fitnessGoals: JSON.stringify({
          goal: data.primaryGoal,
          targetWeight: data.targetWeightKg,
          timeframe: '12 weeks'
        }),
        foodPreferences: JSON.stringify({
          dietPreference: data.dietaryPreference,
          allergies: data.allergies || [],
          dislikedFoods: data.dislikedFoods || [],
        }),
        lifestyle: JSON.stringify({
          mealsPerDay: data.mealsPerDay,
          cookingSkill: data.cookingSkill,
          budget: data.budgetPref,
        }),
        healthData: JSON.stringify({
          medicalConditions: data.medicalConditions || [],
        })
      },
    });

    res.json({ success: true, profile });
  } catch (err) {
    console.error('Onboarding error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── Onboarding: Get Status ───────────────────
router.get('/me', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const profile = await prisma.onboardingProfile.findUnique({ where: { userId } });
    if (!profile) {
      res.status(404).json({ error: 'Profile not found' });
      return;
    }
    res.json({ profile });
  } catch (err) {
    console.error('Onboarding info error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
