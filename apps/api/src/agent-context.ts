import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function buildAgentContext(userId: string): Promise<string> {
  const [
    transformation,
    healthProfile,
    onboarding,
    recentWorkouts,
    recentMeals,
    memory,
    streaks
  ] = await Promise.all([
    prisma.transformationState.findUnique({ where: { userId } }),
    prisma.userHealthProfile.findUnique({ where: { userId } }),
    prisma.onboardingProfile.findUnique({ where: { userId } }),
    prisma.workoutSession.findMany({
      where: { userId, date: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } },
      orderBy: { date: 'desc' },
      take: 7
    }),
    prisma.mealLog.findMany({
      where: { userId, createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } },
      orderBy: { createdAt: 'desc' },
      include: { meal: true },
      take: 21
    }),
    prisma.userMemory.findUnique({ where: { userId } }),
    prisma.streak.findUnique({ where: { userId } })
  ]);

  if (!transformation || !onboarding) {
    throw new Error('User missing critical transformation state or onboarding data');
  }

  const injuries = healthProfile?.activeInjuries || '[]';
  const recoveryScore = transformation.recoveryScore || healthProfile?.recoveryScore || 100;
  
  const diseases = onboarding.diseases || 'None reported';
  const medicalReports = onboarding.medicalReports ? 'User has uploaded medical reports.' : 'No uploaded reports.';

  const contextData = {
    CurrentTransformation: {
      goal: transformation.goal,
      currentWeight: transformation.currentWeight,
      targetWeight: transformation.targetWeight,
      phase: transformation.currentPhase,
      weeklyAdherence: `${transformation.weeklyAdherence}%`,
      recoveryScore: `${recoveryScore}%`,
      confidenceScore: `${transformation.confidenceScore}%`,
    },
    Health: {
      injuries: JSON.parse(injuries),
      diseases: diseases !== 'None reported' ? JSON.parse(diseases) : [],
      bloodGroup: onboarding.bloodGroup || 'Unknown',
      medicalReports,
    },
    RecentWorkouts: recentWorkouts.map(w => ({
      title: w.title,
      status: w.status,
      date: w.date.toISOString().split('T')[0]
    })),
    RecentNutrition: {
      mealsLoggedLast7Days: recentMeals.length,
      // More detailed metrics can be aggregated here
    },
    Memory: {
      favoriteFoods: memory?.favoriteFoods ? JSON.parse(memory.favoriteFoods) : [],
      dislikes: memory?.dislikes ? JSON.parse(memory.dislikes) : [],
      sicknessMode: memory?.sicknessMode || false
    },
    Consistency: streaks ? {
      overall: streaks.overallConsistency,
      workoutStreak: streaks.workoutStreak,
      nutritionStreak: streaks.nutritionStreak
    } : null
  };

  return JSON.stringify(contextData, null, 2);
}
