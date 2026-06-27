import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('password', 12);
  const user = await prisma.user.upsert({
    where: { email: 'test@test.com' },
    update: { passwordHash, name: 'Test User' },
    create: { email: 'test@test.com', passwordHash, name: 'Test User' },
  });
  
  await prisma.onboardingProfile.upsert({
    where: { userId: user.id },
    create: {
      userId: user.id,
      personalInfo: JSON.stringify({ age: 28, gender: 'Male', weight: 80, height: 180, bodyFatPct: 15, activityLevel: 'MODERATE' }),
      fitnessGoals: JSON.stringify({ goal: 'BUILD_MUSCLE', targetWeight: 85, targetBodyFat: 12, timeframe: '6_MONTHS' }),
      foodPreferences: JSON.stringify({ dietPreference: 'ANY', allergies: [], dislikedFoods: [] }),
      lifestyle: JSON.stringify({ mealsPerDay: 4, cookingSkill: 'INTERMEDIATE', budget: 'MODERATE' }),
      healthData: JSON.stringify({ waterIntake: 3, sleepHours: 7, stressLevel: 'LOW', supplements: [], medicalConditions: [] })
    },
    update: {}
  });

  console.log('User test@test.com seeded successfully!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
