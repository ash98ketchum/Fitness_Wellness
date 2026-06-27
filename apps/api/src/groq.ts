import Groq from 'groq-sdk';
import dotenv from 'dotenv';
dotenv.config();

const MODEL = 'llama-3.3-70b-versatile';

// Retrieve keys from environment variables and filter out undefined/empty ones
const apiKeys = [
  process.env.GROQ_API_KEY_1,
  process.env.GROQ_API_KEY_2,
  process.env.GROQ_API_KEY_3,
].filter(Boolean) as string[];

if (apiKeys.length === 0) {
  console.warn('[Groq] No API keys configured in .env. Will fall back to mock data.');
}

/**
 * Returns a dynamically initialized Groq client using a randomly selected API key.
 * This effectively load-balances requests across the available keys.
 */
function getGroqClient(): Groq {
  const selectedKey = apiKeys[Math.floor(Math.random() * apiKeys.length)];
  return new Groq({ apiKey: selectedKey });
}

interface OnboardingData {
  age?: string;
  gender?: string;
  weight?: string;
  height?: string;
  bodyFatPct?: string;
  activityLevel?: string;
  goal?: string;
  targetWeight?: string;
  targetBodyFat?: string;
  timeframe?: string;
  dietPreference?: string;
  allergies?: string;
  dislikedFoods?: string;
  mealsPerDay?: string;
  cookingSkill?: string;
  budget?: string;
  waterIntake?: string;
  sleepHours?: string;
  stressLevel?: string;
  supplements?: string;
  medicalConditions?: string;
}

interface GeneratedMeal {
  name: string;
  time: string;
  calories: number;
  macros: { protein: number; carbs: number; fats: number };
  ingredients: string[];
  description: string;
  prepTime: number;
  difficulty: string;
  portionSizes: Record<string, string>;
  recipeSteps: string[];
}

interface GeneratedPlan {
  totalCalories: number;
  proteinG: number;
  carbsG: number;
  fatsG: number;
  meals: GeneratedMeal[];
  confidenceScore: number;
  issuesFound: string[];
  correctionsApplied: string[];
  aiInsight: string;
  agent1Raw: string;
  agent2Raw: string;
  agent3Raw: string;
}

function buildProfileSummary(data: OnboardingData): string {
  return `
Client Profile:
- Age: ${data.age || 'Not specified'}, Gender: ${data.gender || 'Not specified'}
- Weight: ${data.weight || '?'}kg, Height: ${data.height || '?'}cm
- Body Fat: ${data.bodyFatPct ? data.bodyFatPct + '%' : 'Not specified'}
- Activity Level: ${data.activityLevel || 'Not specified'}
- Primary Goal: ${data.goal || 'Not specified'}
- Target Weight: ${data.targetWeight ? data.targetWeight + 'kg' : 'Not specified'}
- Target Body Fat: ${data.targetBodyFat ? data.targetBodyFat + '%' : 'Not specified'}
- Timeframe: ${data.timeframe || 'Not specified'}
- Dietary Preference: ${data.dietPreference || 'No restrictions'}
- Allergies: ${data.allergies || 'None'}
- Disliked Foods: ${data.dislikedFoods || 'None'}
- Meals Per Day: ${data.mealsPerDay || '3 meals'}
- Cooking Skill: ${data.cookingSkill || 'Intermediate'}
- Budget: ${data.budget || 'Moderate'}
- Water Intake: ${data.waterIntake ? data.waterIntake + 'L/day' : 'Not specified'}
- Sleep: ${data.sleepHours ? data.sleepHours + ' hours' : 'Not specified'}
- Stress Level: ${data.stressLevel || 'Not specified'}
- Supplements: ${data.supplements || 'None'}
- Medical Conditions: ${data.medicalConditions || 'None'}
`.trim();
}

async function callGroq(systemPrompt: string, userPrompt: string): Promise<string> {
  if (apiKeys.length === 0) return '{}';
  
  const client = getGroqClient();
  try {
    const response = await client.chat.completions.create({
      model: MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.1, // Reduced temperature for strict adherence
      max_tokens: 4000,
      response_format: { type: 'json_object' },
    });
    return response.choices[0]?.message?.content || '{}';
  } catch (error) {
    console.error('[Groq API Error]:', error);
    throw error;
  }
}

export async function regenerateMeal(profileData: OnboardingData, mealType: string, targetCalories: number): Promise<GeneratedMeal> {
  const profile = buildProfileSummary(profileData);
  
  if (apiKeys.length === 0) {
    return getFallbackPlan().meals[0]; // fallback
  }

  const prompt = `You are a sports nutritionist AI. Generate a SINGLE ${mealType} meal strictly according to user data.
The meal MUST be roughly ${targetCalories} calories.

ABSOLUTE RULES:
1. You MUST return ONLY a valid, parseable JSON object. No markdown wrapping.
2. Dietary Preference: ${profileData.dietPreference || 'None'}.
3. Fatal Allergies & Dislikes: MUST NOT include ${profileData.allergies || 'None'} or ${profileData.dislikedFoods || 'None'}.

Return JSON EXACTLY matching this structure:
{
  "name": "<meal name>",
  "time": "<time like 08:00 AM>",
  "calories": ${targetCalories},
  "macros": { "protein": <number>, "carbs": <number>, "fats": <number> },
  "ingredients": ["ingredient 1"],
  "description": "<brief cooking instruction>",
  "prepTime": <number>,
  "difficulty": "<Easy, Medium, or Hard>",
  "portionSizes": { "ingredient 1": "100g" },
  "recipeSteps": ["Step 1"]
}`;

  try {
    const raw = await callGroq(prompt, profile);
    const parsed = JSON.parse(raw);
    if (!parsed.name) throw new Error("Invalid generated meal");
    return parsed as GeneratedMeal;
  } catch (err) {
    console.error('[Groq] regenerateMeal error:', err);
    return getFallbackPlan().meals[0];
  }
}

export async function generateDietPlan(profileData: OnboardingData): Promise<GeneratedPlan> {
  const profile = buildProfileSummary(profileData);
  const mealsPerDay = parseInt(profileData.mealsPerDay || '4') || 4;

  if (apiKeys.length === 0) {
    return getFallbackPlan();
  }

  // ──────────────────────────────────────────────
  // AGENT 1: Generator
  // ──────────────────────────────────────────────
  console.log('[Groq] Agent 1: Generating initial meal plan...');
  const generatorPrompt = `You are an elite, highly precise sports nutritionist AI algorithm. You generate flawless daily meal plans strictly according to user data.

ABSOLUTE RULES (FAILURE IS UNACCEPTABLE):
1. You MUST return ONLY a valid, parseable JSON object matching the requested schema. No markdown wrapping, no extra text.
2. The number of meals MUST exactly equal ${mealsPerDay}.
3. The sum of the calories from all individual meals MUST exactly equal the \`totalCalories\` field.
4. The sum of the macros (protein, carbs, fats) from all individual meals MUST exactly equal the \`proteinG\`, \`carbsG\`, and \`fatsG\` fields.
5. Dietary Restrictions: You must respect the dietary preference (${profileData.dietPreference || 'None'}).
6. Fatal Allergens & Dislikes: You MUST NOT include any ingredients listed in Allergies (${profileData.allergies || 'None'}) or Disliked Foods (${profileData.dislikedFoods || 'None'}).
7. Do NOT hallucinate ingredients or create physically impossible meals.

Return JSON EXACTLY matching this structure:
{
  "totalCalories": <number>,
  "proteinG": <number>,
  "carbsG": <number>,
  "fatsG": <number>,
  "meals": [
    {
      "name": "<meal name>",
      "time": "<time like 08:00 AM>",
      "calories": <number>,
      "macros": { "protein": <number>, "carbs": <number>, "fats": <number> },
      "ingredients": ["ingredient 1", "ingredient 2"],
      "description": "<brief cooking instruction>",
      "prepTime": <number in minutes>,
      "difficulty": "<Easy, Medium, or Hard>",
      "portionSizes": { "ingredient 1": "100g", "ingredient 2": "1 cup" },
      "recipeSteps": ["Step 1: Do this", "Step 2: Do that"]
    }
  ]
}`;

  let generatedRaw = '';
  let generatedPlan: any = {};
  try {
    generatedRaw = await callGroq(generatorPrompt, profile);
    generatedPlan = JSON.parse(generatedRaw);
  } catch {
    console.error('[Groq] Agent 1 parse error or API failure, using fallback');
    return getFallbackPlan();
  }

  // ──────────────────────────────────────────────
  // AGENT 2: Reviewer
  // ──────────────────────────────────────────────
  console.log('[Groq] Agent 2: Reviewing nutritional accuracy...');
  const reviewerPrompt = `You are a ruthless, highly critical Quality Assurance AI for clinical nutrition. Your sole job is to interrogate a meal plan against a client profile and find mathematical or dietary violations.

ABSOLUTE RULES:
1. You MUST return ONLY valid JSON.
2. Verify that the sum of the meal macros exactly matches the total plan macros. If it does not, you must document it in "issuesFound".
3. Verify that zero ingredients violate the client's allergies (${profileData.allergies || 'None'}) or dislikes (${profileData.dislikedFoods || 'None'}). If there is a violation, document it in "issuesFound".
4. Evaluate if the portion sizes and calorie density make logical sense.

Return JSON EXACTLY matching this structure:
{
  "confidenceScore": <integer 0-100>,
  "issuesFound": ["string describing specific issue 1", "string describing specific issue 2"],
  "suggestions": ["string detailing how to fix issue 1"]
}`;

  let reviewRaw = '';
  let review: any = {};
  try {
    reviewRaw = await callGroq(reviewerPrompt, `${profile}\n\nMeal Plan to Review:\n${JSON.stringify(generatedPlan, null, 2)}`);
    review = JSON.parse(reviewRaw);
  } catch {
    reviewRaw = '{"confidenceScore": 85, "issuesFound": [], "suggestions": []}';
    review = { confidenceScore: 85, issuesFound: [], suggestions: [] };
  }

  // ──────────────────────────────────────────────
  // AGENT 3: Optimizer
  // ──────────────────────────────────────────────
  console.log('[Groq] Agent 3: Optimizing macros & timing...');
  const optimizerPrompt = `You are the master Synthesizer AI. You receive the original meal plan and the QA report from the Reviewer AI. Your job is to produce the final, perfect JSON response.

ABSOLUTE RULES:
1. You MUST return ONLY valid JSON.
2. You MUST fix ALL issues listed in the Review Feedback. If macros didn't add up, recalculate them perfectly. If an allergen was found, replace the meal.
3. Your output JSON must contain the \`meals\` array identical in structure to Agent 1's output.
4. You must provide a personalized \`aiInsight\` paragraph (3-4 sentences) speaking directly to the client, explaining the nutritional logic of their plan based on their specific goals.

Return JSON EXACTLY matching this structure:
{
  "totalCalories": <number>,
  "proteinG": <number>,
  "carbsG": <number>,
  "fatsG": <number>,
  "meals": [
    {
      "name": "<meal name>",
      "time": "<time like 08:00 AM>",
      "calories": <number>,
      "macros": { "protein": <number>, "carbs": <number>, "fats": <number> },
      "ingredients": ["ingredient 1", "ingredient 2"],
      "description": "<brief instruction>",
      "prepTime": <number in minutes>,
      "difficulty": "<Easy, Medium, or Hard>",
      "portionSizes": { "ingredient 1": "100g", "ingredient 2": "1 cup" },
      "recipeSteps": ["Step 1: Do this", "Step 2: Do that"]
    }
  ],
  "correctionsApplied": ["string detailing correction 1"],
  "aiInsight": "<personalized paragraph>"
}`;

  let optimizedRaw = '';
  let optimized: any = {};
  try {
    optimizedRaw = await callGroq(
      optimizerPrompt,
      `${profile}\n\nOriginal Plan:\n${JSON.stringify(generatedPlan, null, 2)}\n\nReview Feedback:\n${JSON.stringify(review, null, 2)}`
    );
    optimized = JSON.parse(optimizedRaw);
  } catch {
    console.error('[Groq] Agent 3 parse error, using Agent 1 output as fallback');
    optimizedRaw = 'Failed to optimize. Reverting to Agent 1 output.';
    optimized = generatedPlan;
  }

  console.log('[Groq] Pipeline complete ✓');

  return {
    totalCalories: optimized.totalCalories || generatedPlan.totalCalories || 2000,
    proteinG: optimized.proteinG || generatedPlan.proteinG || 150,
    carbsG: optimized.carbsG || generatedPlan.carbsG || 200,
    fatsG: optimized.fatsG || generatedPlan.fatsG || 60,
    meals: (optimized.meals || generatedPlan.meals || []).map((m: any) => ({
      name: m.name || 'Meal',
      time: m.time || '12:00 PM',
      calories: m.calories || 500,
      macros: m.macros || { protein: 30, carbs: 40, fats: 15 },
      ingredients: m.ingredients || [],
      description: m.description || '',
      prepTime: m.prepTime || 15,
      difficulty: m.difficulty || 'Easy',
      portionSizes: m.portionSizes || {},
      recipeSteps: m.recipeSteps || ['Serve and enjoy.'],
    })),
    confidenceScore: review.confidenceScore || 90,
    issuesFound: review.issuesFound || [],
    correctionsApplied: optimized.correctionsApplied || [],
    aiInsight: optimized.aiInsight || 'Your plan has been optimized for your specific goals and dietary requirements.',
    agent1Raw: generatedRaw,
    agent2Raw: reviewRaw,
    agent3Raw: optimizedRaw
  };
}

function getFallbackPlan(): GeneratedPlan {
  const dummyPlan = JSON.stringify({ message: "Generated static fallback plan due to missing API keys or failure." });
  return {
    totalCalories: 2400,
    proteinG: 160,
    carbsG: 220,
    fatsG: 65,
    meals: [
      { name: 'High-Protein Oatmeal', time: '08:00 AM', calories: 450, macros: { protein: 30, carbs: 55, fats: 10 }, ingredients: ['Oats', 'Whey protein', 'Banana', 'Almond milk'], description: 'Mix oats with protein powder and top with sliced banana.', prepTime: 5, difficulty: 'Easy', portionSizes: { 'Oats': '50g', 'Whey protein': '1 scoop', 'Banana': '1 medium', 'Almond milk': '200ml' }, recipeSteps: ['Step 1: Heat almond milk.', 'Step 2: Stir in oats and cook for 3 mins.', 'Step 3: Mix in whey protein.', 'Step 4: Top with banana.'] },
      { name: 'Grilled Chicken Salad', time: '12:30 PM', calories: 600, macros: { protein: 50, carbs: 25, fats: 22 }, ingredients: ['Chicken breast', 'Mixed greens', 'Avocado', 'Cherry tomatoes', 'Olive oil'], description: 'Grill chicken and serve over fresh greens.', prepTime: 15, difficulty: 'Medium', portionSizes: { 'Chicken': '150g', 'Greens': '2 cups', 'Avocado': 'half', 'Tomatoes': '1 cup' }, recipeSteps: ['Step 1: Season and grill chicken.', 'Step 2: Chop veggies.', 'Step 3: Toss all ingredients with olive oil.'] },
      { name: 'Greek Yogurt & Berries', time: '03:30 PM', calories: 300, macros: { protein: 25, carbs: 30, fats: 5 }, ingredients: ['Greek yogurt', 'Mixed berries', 'Honey'], description: 'Combine yogurt with berries and a drizzle of honey.', prepTime: 2, difficulty: 'Easy', portionSizes: { 'Yogurt': '200g', 'Berries': '1 cup', 'Honey': '1 tbsp' }, recipeSteps: ['Step 1: Scoop yogurt into bowl.', 'Step 2: Top with berries and honey.'] },
      { name: 'Salmon & Quinoa Bowl', time: '07:00 PM', calories: 750, macros: { protein: 45, carbs: 65, fats: 25 }, ingredients: ['Salmon fillet', 'Quinoa', 'Roasted vegetables', 'Lemon'], description: 'Bake salmon and serve with quinoa and roasted veggies.', prepTime: 25, difficulty: 'Medium', portionSizes: { 'Salmon': '150g', 'Quinoa': '1 cup cooked', 'Veggies': '2 cups' }, recipeSteps: ['Step 1: Bake salmon at 400F for 15 mins.', 'Step 2: Cook quinoa.', 'Step 3: Serve salmon over quinoa with veggies.'] },
    ],
    confidenceScore: 95,
    issuesFound: [],
    correctionsApplied: ['Optimized protein distribution across meals'],
    aiInsight: 'Your plan has been optimized for balanced macro distribution throughout the day, with emphasis on post-workout protein timing.',
    agent1Raw: dummyPlan,
    agent2Raw: dummyPlan,
    agent3Raw: dummyPlan
  };
}

export async function chatWithDietician(
  messages: { role: 'user' | 'assistant', content: string }[],
  profileData: Record<string, any>,
  planData: Record<string, any>
): Promise<{ reply: string, weightUpdateDetected: boolean, newWeightKg: number | null }> {
  const profile = buildProfileSummary(profileData);
  const planSummary = JSON.stringify(planData, null, 2);

  const systemPrompt = `You are Athelya, a highly intelligent and supportive personal AI Dietician.
You are aware of the user's clinical profile and their active diet plan.

User Profile:
${profile}

User's Current Active Diet Plan:
${planSummary}

ABSOLUTE RULES:
1. Answer their questions based ONLY on the data provided above.
2. If they ask to substitute an ingredient, suggest something that strictly fits their macros and avoids their allergies/dislikes.
3. Be conversational, empathetic, and concise (max 3-4 sentences per response). 
4. DO NOT use markdown headers, just use clean plain text formatting.
5. IMPORTANT: You MUST return a valid JSON object EXACTLY matching this structure:
   {
     "reply": "Your conversational response",
     "weightUpdateDetected": true or false,
     "newWeightKg": 75 (if they mentioned a new weight, else null)
   }
If the user mentions their current weight, body fat, or requests to update their physical metrics, set weightUpdateDetected to true and extract the newWeightKg.`;

  if (apiKeys.length === 0) return { reply: 'Mock AI: I see your profile and plan! How can I help you swap meals today?', weightUpdateDetected: false, newWeightKg: null };

  const client = getGroqClient();
  try {
    const response = await client.chat.completions.create({
      model: MODEL,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages.map(m => ({ role: m.role as 'user' | 'assistant', content: m.content })),
      ],
      temperature: 0.5,
      max_tokens: 500,
    });
    
    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error("Empty response");
    
    const parsed = JSON.parse(content);
    return {
      reply: parsed.reply || "I'm sorry, I couldn't process that request.",
      weightUpdateDetected: !!parsed.weightUpdateDetected,
      newWeightKg: parsed.newWeightKg || null
    };
  } catch (error) {
    console.error('[Groq Chat Error]:', error);
    return { reply: "I'm currently experiencing high load. Please try again in a moment.", weightUpdateDetected: false, newWeightKg: null };
  }
}

export async function chatWithCookingAssistant(
  messages: { role: 'user' | 'assistant', content: string }[],
  mealData: Record<string, any>,
  profileData: Record<string, any>
): Promise<string> {
  const profile = buildProfileSummary(profileData);
  const mealSummary = JSON.stringify(mealData, null, 2);

  const systemPrompt = `You are a Contextual AI Cooking Assistant for a specific meal.
The user is preparing the following meal:
${mealSummary}

User Profile (Allergies, preferences, goals):
${profile}

RULES:
1. Explain cooking instructions in human-friendly, conversational steps.
2. If the user asks for an ingredient substitution (e.g. "I don't have almonds" or "Can I use olive oil?"), you MUST structure your answer to categorize options as:
   - GOOD substitutions
   - ACCEPTABLE substitutions
   - BAD substitutions
   ...along with their nutritional consequences (how it affects calories or macros).
3. Be highly aware of their allergies and medical conditions. Warn them explicitly and refuse if a substitution they propose is dangerous.
4. Keep answers conversational and helpful. Do not use markdown headers, just plain text formatting with dashes for bullet points.`;

  if (apiKeys.length === 0) return 'Mock AI: I see your meal! What do you need help with?';

  const client = getGroqClient();
  try {
    const response = await client.chat.completions.create({
      model: MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages.map(m => ({ role: m.role as 'user' | 'assistant', content: m.content })),
      ],
      temperature: 0.3,
      max_tokens: 600,
    });
    return response.choices[0]?.message?.content || "I'm sorry, I couldn't process that request.";
  } catch (error) {
    console.error('[Groq Chat Error]:', error);
    return "I'm currently experiencing high load. Please try again in a moment.";
  }
}

// ─────────────────────────────────────────────────────────
// PHASE 3: WORKOUT GENERATION ENGINE
// ─────────────────────────────────────────────────────────

export interface WorkoutGenRequest {
  profile: string;
  injuries: string[];
  fatigueLevel: string;
  availableExercises: { id: string; name: string; targetMuscles: string; equipment: string }[];
}

export async function generateWorkoutPlan(req: WorkoutGenRequest) {
  const { profile, injuries, fatigueLevel, availableExercises } = req;
  
  const systemPrompt = `You are an elite, highly precise sports AI Personal Trainer. You generate safe, progressive, and dynamic workout sessions based on the user's profile, injuries, and recovery state.

ABSOLUTE RULES (FAILURE IS UNACCEPTABLE):
1. Return ONLY a valid, parseable JSON object. No markdown, no extra text.
2. Select 4-6 exercises exclusively from the "Available Exercises" list provided.
3. INJURY GUARDRAIL: Do NOT select exercises that target injured muscles: ${injuries.length > 0 ? injuries.join(', ') : 'None'}.
4. FATIGUE GUARDRAIL: The user's fatigue level is ${fatigueLevel}. If HIGH, reduce sets and volume.
5. Provide realistic "suggestedWeight" in kg based on standard beginner/intermediate strength levels, erring on the side of safety.
6. The exact "exerciseName" in the output MUST exactly match a name from the Available Exercises list.

Available Exercises:
${JSON.stringify(availableExercises, null, 2)}

User Profile:
${profile}

Return JSON EXACTLY matching this structure:
{
  "title": "<e.g., Push Day, Full Body, Upper Body>",
  "durationMinutes": <number>,
  "caloriesBurned": <number>,
  "exercises": [
    {
      "exerciseName": "<exact name from available list>",
      "setsTarget": <integer>,
      "repsTarget": "<string like '8-12'>",
      "restSeconds": <integer like 90>,
      "tempo": "<string like '3-1-1'>",
      "intensity": "<string like 'Moderate' or 'RPE 8'>",
      "suggestedWeight": <float in kg>
    }
  ]
}`;

  if (apiKeys.length === 0) {
    // Fallback if no API key
    return {
      title: "Full Body Strength",
      durationMinutes: 45,
      caloriesBurned: 300,
      exercises: [
        {
          exerciseName: "Barbell Back Squat",
          setsTarget: 3,
          repsTarget: "8-10",
          restSeconds: 90,
          tempo: "3-1-1",
          intensity: "Moderate",
          suggestedWeight: 40
        },
        {
          exerciseName: "Barbell Bench Press",
          setsTarget: 3,
          repsTarget: "8-10",
          restSeconds: 90,
          tempo: "3-1-1",
          intensity: "Moderate",
          suggestedWeight: 30
        }
      ]
    };
  }

  const client = getGroqClient();
  try {
    const response = await client.chat.completions.create({
      model: MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: 'Generate today\'s optimal workout session based on my state.' },
      ],
      temperature: 0.2, // low temp for schema adherence
      max_tokens: 2500,
      response_format: { type: 'json_object' },
    });
    
    return JSON.parse(response.choices[0]?.message?.content || '{}');
  } catch (error) {
    console.error('[Groq Workout Gen Error]:', error);
    throw new Error('Failed to generate workout plan');
  }
}

export async function chatWithTrainer(messages: any[], currentExercise: any, profile: string) {
  const systemPrompt = `You are a hype, supportive, and highly knowledgeable AI Personal Trainer.
Your current client is working on this exercise: ${currentExercise.name} (${currentExercise.targetMuscles}).
They have to do ${currentExercise.setsTarget} sets of ${currentExercise.repsTarget} reps at ${currentExercise.intensity}.
Client Profile: ${profile}

Your job is to:
1. Provide form cues if they ask.
2. Suggest regressions (easier) or progressions (harder) if they are struggling or find it too easy.
3. Hype them up and motivate them during their rest periods.
Keep your responses very short, punchy, and conversational (like a real trainer speaking). Max 2-3 sentences.`;

  if (apiKeys.length === 0) return "Mock Trainer: Keep that core tight and push through! You got this!";

  const client = getGroqClient();
  try {
    const response = await client.chat.completions.create({
      model: MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages.map(m => ({ role: m.role as 'user' | 'assistant', content: m.content })),
      ],
      temperature: 0.7,
      max_tokens: 300,
    });
    return response.choices[0]?.message?.content || "Let's keep moving!";
  } catch (error) {
    console.error('[Groq Trainer Chat Error]:', error);
    return "I'm experiencing a bit of lag, but keep that form tight!";
  }
}

export async function askGymCoach(
  messages: any[],
  currentExercise: any,
  profile: string
) {
  const systemPrompt = `You are a biomechanics expert and elite AI Gym Coach.
Your current client is working on: ${currentExercise.name} (${currentExercise.targetMuscles}).
Client Profile: ${profile}

ABSOLUTE RULES:
1. When the user asks a form, mechanics, or substitution question (e.g., "Where should my hands go?" or "How wide should I grip?"), you MUST structure your answer into exactly three categories:
   - GOOD technique: Explain the optimal, safest way to do it.
   - ACCEPTABLE technique: Explain a safe variation or minor deviation.
   - BAD technique: Explain what they must avoid to prevent injury.
2. Provide human reasoning for WHY each is good/bad based on anatomy and biomechanics.
3. If they ask about substitutions, use the same format (GOOD substitution, ACCEPTABLE substitution, BAD substitution).
4. Do not use markdown headers (# or ##), just bold text and bullet points.`;

  if (apiKeys.length === 0) return "Mock Coach: GOOD technique is perfect alignment. BAD technique causes injury.";

  const client = getGroqClient();
  try {
    const response = await client.chat.completions.create({
      model: MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages.map(m => ({ role: m.role as 'user' | 'assistant', content: m.content })),
      ],
      temperature: 0.3,
      max_tokens: 800,
    });
    return response.choices[0]?.message?.content || "Focus on form and safety.";
  } catch (error) {
    console.error('[Groq Gym Coach Error]:', error);
    return "I'm currently experiencing high load. Please focus on slow, controlled movements.";
  }
}
