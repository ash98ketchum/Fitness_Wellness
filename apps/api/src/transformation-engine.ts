import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class TransformationEngine {
  
  // Calculate BMR using Mifflin-St Jeor Equation
  static calculateBMR(weightKg: number, heightCm: number, age: number, gender: 'Male' | 'Female' | 'Other'): number {
    let bmr = (10 * weightKg) + (6.25 * heightCm) - (5 * age);
    if (gender === 'Male') {
      bmr += 5;
    } else if (gender === 'Female') {
      bmr -= 161;
    } else {
      // Average for 'Other'
      bmr -= 78;
    }
    return bmr;
  }

  // Calculate Total Daily Energy Expenditure
  static calculateTDEE(bmr: number, activityLevel: string): number {
    const multipliers: Record<string, number> = {
      'Sedentary': 1.2,
      'Lightly Active': 1.375,
      'Moderately Active': 1.55,
      'Very Active': 1.725,
      'Extremely Active': 1.9
    };
    return bmr * (multipliers[activityLevel] || 1.2);
  }

  // Forecast Completion Date based on deficit/surplus
  static forecastCompletionDate(
    currentWeight: number, 
    targetWeight: number, 
    dailyDeficit: number
  ): Date {
    const kgToLose = currentWeight - targetWeight;
    
    // Roughly 7700 calories = 1 kg of fat
    const totalCaloriesToBurn = kgToLose * 7700;
    
    if (dailyDeficit === 0 || (kgToLose > 0 && dailyDeficit < 0) || (kgToLose < 0 && dailyDeficit > 0)) {
      // Invalid goal/deficit mapping
      return new Date(); // Unable to forecast
    }

    const daysToGoal = Math.abs(totalCaloriesToBurn / dailyDeficit);
    
    const completionDate = new Date();
    completionDate.setDate(completionDate.getDate() + daysToGoal);
    return completionDate;
  }

  // Predict Readiness Score (1-100)
  static calculateReadiness(
    sleepHours: number, 
    stressLevel: string, 
    recentWorkoutIntensity: number
  ): number {
    let score = 100;
    
    // Sleep impact
    if (sleepHours < 6) score -= 30;
    else if (sleepHours < 7) score -= 15;
    
    // Stress impact
    if (stressLevel === 'Very High') score -= 25;
    else if (stressLevel === 'High') score -= 15;
    else if (stressLevel === 'Moderate') score -= 5;
    
    // Fatigue impact
    score -= (recentWorkoutIntensity * 10);

    return Math.max(10, Math.min(100, score));
  }

  static async initializeState(userId: string) {
    const profile = await prisma.onboardingProfile.findUnique({ where: { userId } });
    if (!profile) throw new Error("Onboarding profile required to initialize Transformation State");

    const p = JSON.parse(profile.personalInfo);
    const g = JSON.parse(profile.fitnessGoals);

    const weight = parseFloat(p.weight) || 70;
    const height = parseFloat(p.height) || 170;
    const age = parseInt(p.age, 10) || 30;
    const target = parseFloat(g.targetWeight) || weight;

    const bmr = this.calculateBMR(weight, height, age, p.gender || 'Other');
    const tdee = this.calculateTDEE(bmr, p.activityLevel || 'Moderately Active');

    // Basic logic for deficit
    const isLoss = target < weight;
    const dailyDeficit = isLoss ? 500 : (target > weight ? -300 : 0); 
    const targetCalories = tdee - dailyDeficit;

    let forecastedDate = this.forecastCompletionDate(weight, target, dailyDeficit);
    if (isNaN(forecastedDate.getTime())) {
      forecastedDate = new Date();
    }

    await prisma.transformationState.upsert({
      where: { userId },
      create: {
        userId,
        currentPhase: isLoss ? 'FAT_LOSS' : (target > weight ? 'MUSCLE_GAIN' : 'MAINTENANCE'),
        currentWeight: weight,
        targetWeight: target,
        goal: g.goal || 'General Health',
        estimatedCompletion: forecastedDate,
        weeklyCalorieBudget: (Math.round(targetCalories) || 2000) * 7,
        remainingCalories: (Math.round(targetCalories) || 2000) * 7,
        recoveryScore: 100,
        weeklyAdherence: 100,
        confidenceScore: 85, // Starts high, adjusts if user skips days
        musclePriority: '[]'
      },
      update: {
        currentPhase: isLoss ? 'FAT_LOSS' : (target > weight ? 'MUSCLE_GAIN' : 'MAINTENANCE'),
        currentWeight: weight,
        targetWeight: target,
        goal: g.goal || 'General Health',
        estimatedCompletion: forecastedDate,
        weeklyCalorieBudget: (Math.round(targetCalories) || 2000) * 7,
        musclePriority: '[]'
      }
    });

    console.log(`[Transformation Engine] Initialized state for User ${userId}`);
  }
}
