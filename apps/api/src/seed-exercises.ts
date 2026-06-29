import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const CORE_EXERCISES = [
  {
    name: "Barbell Bench Press",
    bodyPart: "Chest",
    targetMuscles: '["Primary Muscle"]',
    secondaryMuscles: '["Secondary Muscle"]',
    equipment: "Gym Equipment",
    difficulty: "Medium",
    setupAnimationUrl: "http://localhost:3000/animations/barbell_bench_press.json",
    gripAnimationUrl: "http://localhost:3000/animations/barbell_bench_press.json",
    postureAnimationUrl: "http://localhost:3000/animations/barbell_bench_press.json",
    movementAnimationUrl: "http://localhost:3000/animations/barbell_bench_press.json",
    loopAnimationUrl: "http://localhost:3000/animations/barbell_bench_press.json",
    instructions: '["Step 1: Setup","Step 2: Execute movement","Step 3: Return to start"]'
  },
  {
    name: "Barbell Back Squat",
    bodyPart: "Legs",
    targetMuscles: '["Primary Muscle"]',
    secondaryMuscles: '["Secondary Muscle"]',
    equipment: "Gym Equipment",
    difficulty: "Medium",
    setupAnimationUrl: "http://localhost:3000/animations/barbell_back_squat.json",
    gripAnimationUrl: "http://localhost:3000/animations/barbell_back_squat.json",
    postureAnimationUrl: "http://localhost:3000/animations/barbell_back_squat.json",
    movementAnimationUrl: "http://localhost:3000/animations/barbell_back_squat.json",
    loopAnimationUrl: "http://localhost:3000/animations/barbell_back_squat.json",
    instructions: '["Step 1: Setup","Step 2: Execute movement","Step 3: Return to start"]'
  },
  {
    name: "Conventional Deadlift",
    bodyPart: "Back",
    targetMuscles: '["Primary Muscle"]',
    secondaryMuscles: '["Secondary Muscle"]',
    equipment: "Gym Equipment",
    difficulty: "Medium",
    setupAnimationUrl: "http://localhost:3000/animations/conventional_deadlift.json",
    gripAnimationUrl: "http://localhost:3000/animations/conventional_deadlift.json",
    postureAnimationUrl: "http://localhost:3000/animations/conventional_deadlift.json",
    movementAnimationUrl: "http://localhost:3000/animations/conventional_deadlift.json",
    loopAnimationUrl: "http://localhost:3000/animations/conventional_deadlift.json",
    instructions: '["Step 1: Setup","Step 2: Execute movement","Step 3: Return to start"]'
  },
  {
    name: "Pull-up",
    bodyPart: "Back",
    targetMuscles: '["Primary Muscle"]',
    secondaryMuscles: '["Secondary Muscle"]',
    equipment: "Gym Equipment",
    difficulty: "Medium",
    setupAnimationUrl: "http://localhost:3000/animations/pull_up.json",
    gripAnimationUrl: "http://localhost:3000/animations/pull_up.json",
    postureAnimationUrl: "http://localhost:3000/animations/pull_up.json",
    movementAnimationUrl: "http://localhost:3000/animations/pull_up.json",
    loopAnimationUrl: "http://localhost:3000/animations/pull_up.json",
    instructions: '["Step 1: Setup","Step 2: Execute movement","Step 3: Return to start"]'
  },
  {
    name: "Overhead Press",
    bodyPart: "Shoulders",
    targetMuscles: '["Primary Muscle"]',
    secondaryMuscles: '["Secondary Muscle"]',
    equipment: "Gym Equipment",
    difficulty: "Medium",
    setupAnimationUrl: "http://localhost:3000/animations/overhead_press.json",
    gripAnimationUrl: "http://localhost:3000/animations/overhead_press.json",
    postureAnimationUrl: "http://localhost:3000/animations/overhead_press.json",
    movementAnimationUrl: "http://localhost:3000/animations/overhead_press.json",
    loopAnimationUrl: "http://localhost:3000/animations/overhead_press.json",
    instructions: '["Step 1: Setup","Step 2: Execute movement","Step 3: Return to start"]'
  },
  {
    name: "Barbell Row",
    bodyPart: "Back",
    targetMuscles: '["Primary Muscle"]',
    secondaryMuscles: '["Secondary Muscle"]',
    equipment: "Gym Equipment",
    difficulty: "Medium",
    setupAnimationUrl: "http://localhost:3000/animations/barbell_row.json",
    gripAnimationUrl: "http://localhost:3000/animations/barbell_row.json",
    postureAnimationUrl: "http://localhost:3000/animations/barbell_row.json",
    movementAnimationUrl: "http://localhost:3000/animations/barbell_row.json",
    loopAnimationUrl: "http://localhost:3000/animations/barbell_row.json",
    instructions: '["Step 1: Setup","Step 2: Execute movement","Step 3: Return to start"]'
  },
  {
    name: "Lat Pulldown",
    bodyPart: "Back",
    targetMuscles: '["Primary Muscle"]',
    secondaryMuscles: '["Secondary Muscle"]',
    equipment: "Gym Equipment",
    difficulty: "Medium",
    setupAnimationUrl: "http://localhost:3000/animations/lat_pulldown.json",
    gripAnimationUrl: "http://localhost:3000/animations/lat_pulldown.json",
    postureAnimationUrl: "http://localhost:3000/animations/lat_pulldown.json",
    movementAnimationUrl: "http://localhost:3000/animations/lat_pulldown.json",
    loopAnimationUrl: "http://localhost:3000/animations/lat_pulldown.json",
    instructions: '["Step 1: Setup","Step 2: Execute movement","Step 3: Return to start"]'
  },
  {
    name: "Leg Press",
    bodyPart: "Legs",
    targetMuscles: '["Primary Muscle"]',
    secondaryMuscles: '["Secondary Muscle"]',
    equipment: "Gym Equipment",
    difficulty: "Medium",
    setupAnimationUrl: "http://localhost:3000/animations/leg_press.json",
    gripAnimationUrl: "http://localhost:3000/animations/leg_press.json",
    postureAnimationUrl: "http://localhost:3000/animations/leg_press.json",
    movementAnimationUrl: "http://localhost:3000/animations/leg_press.json",
    loopAnimationUrl: "http://localhost:3000/animations/leg_press.json",
    instructions: '["Step 1: Setup","Step 2: Execute movement","Step 3: Return to start"]'
  },
  {
    name: "Leg Extension",
    bodyPart: "Legs",
    targetMuscles: '["Primary Muscle"]',
    secondaryMuscles: '["Secondary Muscle"]',
    equipment: "Gym Equipment",
    difficulty: "Medium",
    setupAnimationUrl: "http://localhost:3000/animations/leg_extension.json",
    gripAnimationUrl: "http://localhost:3000/animations/leg_extension.json",
    postureAnimationUrl: "http://localhost:3000/animations/leg_extension.json",
    movementAnimationUrl: "http://localhost:3000/animations/leg_extension.json",
    loopAnimationUrl: "http://localhost:3000/animations/leg_extension.json",
    instructions: '["Step 1: Setup","Step 2: Execute movement","Step 3: Return to start"]'
  },
  {
    name: "Leg Curl",
    bodyPart: "Legs",
    targetMuscles: '["Primary Muscle"]',
    secondaryMuscles: '["Secondary Muscle"]',
    equipment: "Gym Equipment",
    difficulty: "Medium",
    setupAnimationUrl: "http://localhost:3000/animations/leg_curl.json",
    gripAnimationUrl: "http://localhost:3000/animations/leg_curl.json",
    postureAnimationUrl: "http://localhost:3000/animations/leg_curl.json",
    movementAnimationUrl: "http://localhost:3000/animations/leg_curl.json",
    loopAnimationUrl: "http://localhost:3000/animations/leg_curl.json",
    instructions: '["Step 1: Setup","Step 2: Execute movement","Step 3: Return to start"]'
  },
];

async function main() {
  console.log('Clearing existing workout data to prevent FK constraint errors...');
  await prisma.workoutSet.deleteMany();
  await prisma.workoutExercise.deleteMany();
  await prisma.workoutSession.deleteMany();
  console.log('Clearing existing exercises...');
  await prisma.exercise.deleteMany();
  console.log(`Seeding ${CORE_EXERCISES.length} core exercises...`);
  for (const ex of CORE_EXERCISES) {
    await prisma.exercise.create({ data: ex });
  }
  console.log('Seeding completed successfully!');
}

main().catch(e => console.error(e)).finally(async () => await prisma.$disconnect());
