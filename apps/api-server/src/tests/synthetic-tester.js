const AdaptiveMealEngine = require('../services/meal-engine');
const AICoach = require('../services/ai-coach');

// Simulated Synthetic Users
const syntheticUsers = [
  {
    id: 'user_101',
    name: 'John Doe',
    weight: 180,
    targetCalories: 2500,
    allergies: ['peanuts', 'shellfish'],
    medicalConditions: ['Hypertension'],
    goals: ['muscle_gain']
  },
  {
    id: 'user_102',
    name: 'Jane Smith',
    weight: 140,
    targetCalories: 1800,
    allergies: ['gluten', 'dairy'],
    medicalConditions: ['Type 2 Diabetes'],
    goals: ['fat_loss']
  },
  {
    id: 'user_103',
    name: 'Alex Johnson',
    weight: 220,
    targetCalories: 3000,
    allergies: ['soy', 'tree_nuts'],
    medicalConditions: [],
    goals: ['hypertrophy', 'performance']
  }
];

async function runSyntheticTests() {
  console.log("==========================================");
  console.log("STARTING SYNTHETIC USER STRESS TESTS");
  console.log("==========================================\n");

  let totalTests = 0;
  let passedTests = 0;

  for (const user of syntheticUsers) {
    console.log(`[TEST] Evaluating AI pipeline for ${user.name}`);
    console.log(`Constraints: Allergies: [${user.allergies.join(', ')}], Conditions: [${user.medicalConditions.join(', ')}]`);
    
    // 1. Test Initial Plan Generation
    totalTests++;
    try {
      const planResult = await AdaptiveMealEngine.generateInitialPlan(user);
      if (planResult.confidenceScore > 90) {
        console.log(`  ✅ Initial Plan Generation PASSED (Confidence: ${planResult.confidenceScore}%)`);
        passedTests++;
      } else {
        console.error(`  ❌ Initial Plan Generation FAILED (Low Confidence)`);
      }
    } catch (e) {
      console.error(`  ❌ Initial Plan Generation FAILED (Error: ${e.message})`);
    }

    // 2. Test Voice AI Coach Substitution Safety
    totalTests++;
    try {
      const query = "Can I substitute the chicken with peanut butter?";
      const response = await AICoach.processQuery('meal_123', user, [{ role: 'user', content: query }]);
      
      if (user.allergies.includes('peanuts') && response.safetyFlag === 'CRITICAL') {
        console.log(`  ✅ Voice AI Coach Safety PASSED (Correctly flagged allergen)`);
        passedTests++;
      } else if (!user.allergies.includes('peanuts')) {
        console.log(`  ✅ Voice AI Coach Safety PASSED (Substitution allowed)`);
        passedTests++;
      } else {
        console.error(`  ❌ Voice AI Coach Safety FAILED (Failed to catch allergen)`);
      }
    } catch (e) {
      console.error(`  ❌ Voice AI Coach Safety FAILED (Error: ${e.message})`);
    }

    console.log("------------------------------------------");
  }

  console.log(`\n==========================================`);
  console.log(`TEST SUITE COMPLETE: ${passedTests}/${totalTests} TESTS PASSED`);
  if (passedTests === totalTests) {
    console.log(`STATUS: READY FOR PRODUCTION`);
  } else {
    console.log(`STATUS: BLOCKED. SAFETY VIOLATIONS DETECTED.`);
  }
  console.log(`==========================================\n`);
}

// Run the suite
runSyntheticTests();
