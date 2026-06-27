import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const CORE_EXERCISES = [
  {
    name: "Barbell Bench Press",
    bodyPart: "Chest",
    targetMuscles: JSON.stringify(["Pectoralis Major", "Anterior Deltoids"]),
    secondaryMuscles: JSON.stringify(["Triceps Brachii"]),
    equipment: "Barbell, Bench",
    difficulty: "Medium",
    setupAnimationUrl: "http://localhost:3000/exercises/bench_press/setup.mp4",
    gripAnimationUrl: "http://localhost:3000/exercises/bench_press/grip.mp4",
    postureAnimationUrl: "http://localhost:3000/exercises/bench_press/posture.mp4",
    movementAnimationUrl: "http://localhost:3000/exercises/bench_press/movement.mp4",
    loopAnimationUrl: "http://localhost:3000/exercises/bench_press/loop.mp4",
    instructions: JSON.stringify([
      "Lie flat on the bench with feet planted firmly on the ground.",
      "Grip the bar slightly wider than shoulder-width.",
      "Lower the bar slowly to your mid-chest.",
      "Push the bar back up to the starting position."
    ])
  },
  {
    name: "Barbell Back Squat",
    bodyPart: "Legs",
    targetMuscles: JSON.stringify(["Quadriceps", "Gluteus Maximus"]),
    secondaryMuscles: JSON.stringify(["Hamstrings", "Calves", "Core"]),
    equipment: "Barbell, Squat Rack",
    difficulty: "Hard",
    setupAnimationUrl: "http://localhost:3000/animations/barbell_squat.json",
    gripAnimationUrl: "http://localhost:3000/animations/barbell_squat.json",
    postureAnimationUrl: "http://localhost:3000/animations/barbell_squat.json",
    movementAnimationUrl: "http://localhost:3000/animations/barbell_squat.json",
    loopAnimationUrl: "http://localhost:3000/animations/barbell_squat.json",
    instructions: JSON.stringify([
      "Rest the barbell across your upper back/shoulders.",
      "Stand with feet shoulder-width apart.",
      "Push your hips back and bend your knees to squat down.",
      "Drive through your heels to return to standing."
    ])
  },
  {
    name: "Conventional Deadlift",
    bodyPart: "Back",
    targetMuscles: JSON.stringify(["Erector Spinae", "Gluteus Maximus"]),
    secondaryMuscles: JSON.stringify(["Hamstrings", "Quadriceps", "Trapezius", "Forearms"]),
    equipment: "Barbell",
    difficulty: "Hard",
    setupAnimationUrl: "http://localhost:3000/animations/deadlift.json",
    gripAnimationUrl: "http://localhost:3000/animations/deadlift.json",
    postureAnimationUrl: "http://localhost:3000/animations/deadlift.json",
    movementAnimationUrl: "http://localhost:3000/animations/deadlift.json",
    loopAnimationUrl: "http://localhost:3000/animations/deadlift.json",
    instructions: JSON.stringify([
      "Stand with mid-foot under the bar.",
      "Bend over and grip the bar outside your knees.",
      "Bend your knees until your shins touch the bar.",
      "Lift your chest and straighten your lower back.",
      "Stand up with the weight, pulling it close to your body."
    ])
  },
  {
    name: "Pull-up",
    bodyPart: "Back",
    targetMuscles: JSON.stringify(["Latissimus Dorsi", "Biceps Brachii"]),
    secondaryMuscles: JSON.stringify(["Rhomboids", "Core"]),
    equipment: "Pull-up Bar",
    difficulty: "Medium",
    setupAnimationUrl: "https://assets4.lottiefiles.com/packages/lf20_zyquagfl.json",
    gripAnimationUrl: "https://assets4.lottiefiles.com/packages/lf20_zyquagfl.json",
    postureAnimationUrl: "https://assets4.lottiefiles.com/packages/lf20_zyquagfl.json",
    movementAnimationUrl: "https://assets4.lottiefiles.com/packages/lf20_zyquagfl.json",
    loopAnimationUrl: "https://assets4.lottiefiles.com/packages/lf20_zyquagfl.json",
    instructions: JSON.stringify([
      "Grip the bar with palms facing away from you, wider than shoulder-width.",
      "Hang with arms fully extended.",
      "Pull yourself up until your chin clears the bar.",
      "Lower yourself back down with control."
    ])
  },
  {
    name: "Overhead Press",
    bodyPart: "Shoulders",
    targetMuscles: JSON.stringify(["Anterior Deltoids", "Medial Deltoids"]),
    secondaryMuscles: JSON.stringify(["Triceps Brachii", "Core"]),
    equipment: "Barbell",
    difficulty: "Medium",
    setupAnimationUrl: "https://assets4.lottiefiles.com/packages/lf20_zyquagfl.json",
    gripAnimationUrl: "https://assets4.lottiefiles.com/packages/lf20_zyquagfl.json",
    postureAnimationUrl: "https://assets4.lottiefiles.com/packages/lf20_zyquagfl.json",
    movementAnimationUrl: "https://assets4.lottiefiles.com/packages/lf20_zyquagfl.json",
    loopAnimationUrl: "https://assets4.lottiefiles.com/packages/lf20_zyquagfl.json",
    instructions: JSON.stringify([
      "Hold the barbell at shoulder level with a pronated grip.",
      "Brace your core and squeeze your glutes.",
      "Press the bar straight up overhead until arms are locked.",
      "Lower it back to your shoulders with control."
    ])
  },
  {
    name: "Dumbbell Bicep Curl",
    bodyPart: "Arms",
    targetMuscles: JSON.stringify(["Biceps Brachii"]),
    secondaryMuscles: JSON.stringify(["Brachialis", "Forearms"]),
    equipment: "Dumbbells",
    difficulty: "Easy",
    setupAnimationUrl: "https://assets4.lottiefiles.com/packages/lf20_zyquagfl.json",
    gripAnimationUrl: "https://assets4.lottiefiles.com/packages/lf20_zyquagfl.json",
    postureAnimationUrl: "https://assets4.lottiefiles.com/packages/lf20_zyquagfl.json",
    movementAnimationUrl: "https://assets4.lottiefiles.com/packages/lf20_zyquagfl.json",
    loopAnimationUrl: "https://assets4.lottiefiles.com/packages/lf20_zyquagfl.json",
    instructions: JSON.stringify([
      "Stand holding a dumbbell in each hand, arms fully extended.",
      "Keeping your elbows close to your torso, curl the weights up.",
      "Squeeze your biceps at the top.",
      "Slowly lower the dumbbells back down."
    ])
  },
  {
    name: "Triceps Pushdown",
    bodyPart: "Arms",
    targetMuscles: JSON.stringify(["Triceps Brachii"]),
    secondaryMuscles: JSON.stringify(["Core"]),
    equipment: "Cable Machine",
    difficulty: "Easy",
    setupAnimationUrl: "https://assets4.lottiefiles.com/packages/lf20_zyquagfl.json",
    gripAnimationUrl: "https://assets4.lottiefiles.com/packages/lf20_zyquagfl.json",
    postureAnimationUrl: "https://assets4.lottiefiles.com/packages/lf20_zyquagfl.json",
    movementAnimationUrl: "https://assets4.lottiefiles.com/packages/lf20_zyquagfl.json",
    loopAnimationUrl: "https://assets4.lottiefiles.com/packages/lf20_zyquagfl.json",
    instructions: JSON.stringify([
      "Attach a rope or straight bar to the high pulley.",
      "Grip the attachment and keep your elbows tucked at your sides.",
      "Push the weight down until your arms are fully extended.",
      "Slowly return to the starting position."
    ])
  },
  {
    name: "Leg Press",
    bodyPart: "Legs",
    targetMuscles: JSON.stringify(["Quadriceps", "Gluteus Maximus"]),
    secondaryMuscles: JSON.stringify(["Hamstrings", "Calves"]),
    equipment: "Leg Press Machine",
    difficulty: "Easy",
    setupAnimationUrl: "http://localhost:3000/animations/leg_press.json",
    gripAnimationUrl: "http://localhost:3000/animations/leg_press.json",
    postureAnimationUrl: "http://localhost:3000/animations/leg_press.json",
    movementAnimationUrl: "http://localhost:3000/animations/leg_press.json",
    loopAnimationUrl: "http://localhost:3000/animations/leg_press.json",
    instructions: JSON.stringify([
      "Sit on the machine and place your feet on the sled shoulder-width apart.",
      "Lower the safety bars and press the weight up until legs are extended (do not lock knees).",
      "Lower the sled slowly until your knees are at 90 degrees.",
      "Press back up to the starting position."
    ])
  },
  {
    name: "Lat Pulldown",
    bodyPart: "Back",
    targetMuscles: JSON.stringify(["Latissimus Dorsi"]),
    secondaryMuscles: JSON.stringify(["Biceps Brachii", "Rhomboids"]),
    equipment: "Cable Machine",
    difficulty: "Easy",
    setupAnimationUrl: "http://localhost:3000/animations/lat_pulldown.json",
    gripAnimationUrl: "http://localhost:3000/animations/lat_pulldown.json",
    postureAnimationUrl: "http://localhost:3000/animations/lat_pulldown.json",
    movementAnimationUrl: "http://localhost:3000/animations/lat_pulldown.json",
    loopAnimationUrl: "http://localhost:3000/animations/lat_pulldown.json",
    instructions: JSON.stringify([
      "Sit at the pulldown machine and adjust the knee pad.",
      "Grip the bar wider than shoulder-width.",
      "Pull the bar down to your upper chest.",
      "Slowly let the bar back up to a full stretch."
    ])
  },
  {
    name: "Dumbbell Lateral Raise",
    bodyPart: "Shoulders",
    targetMuscles: JSON.stringify(["Medial Deltoids"]),
    secondaryMuscles: JSON.stringify(["Trapezius"]),
    equipment: "Dumbbells",
    difficulty: "Easy",
    setupAnimationUrl: "https://assets4.lottiefiles.com/packages/lf20_zyquagfl.json",
    gripAnimationUrl: "https://assets4.lottiefiles.com/packages/lf20_zyquagfl.json",
    postureAnimationUrl: "https://assets4.lottiefiles.com/packages/lf20_zyquagfl.json",
    movementAnimationUrl: "https://assets4.lottiefiles.com/packages/lf20_zyquagfl.json",
    loopAnimationUrl: "https://assets4.lottiefiles.com/packages/lf20_zyquagfl.json",
    instructions: JSON.stringify([
      "Stand holding a dumbbell in each hand by your sides.",
      "Keeping a slight bend in your elbows, raise your arms out to the sides.",
      "Stop when your arms are parallel to the floor.",
      "Lower the weights slowly back down."
    ])
  }
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
    await prisma.exercise.create({
      data: ex
    });
  }
  console.log('Seeding completed successfully!');
}

main()
  .catch(e => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
