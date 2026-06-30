const fs = require('fs');
const path = require('path');

const exerciseNames = [
  "Barbell Bench Press", "Barbell Back Squat", "Conventional Deadlift", "Pull-up", "Overhead Press",
  "Barbell Row", "Lat Pulldown", "Leg Press", "Leg Extension", "Leg Curl",
  "Calf Raise", "Dumbbell Curl", "Tricep Extension", "Lateral Raise", "Front Raise",
  "Shrugs", "Incline Bench Press", "Decline Bench Press", "Dumbbell Fly", "Cable Crossover",
  "Hack Squat", "Bulgarian Split Squat", "Romanian Deadlift", "Lunges", "Glute Bridge",
  "Hip Thrust", "Seated Cable Row", "T-Bar Row", "Face Pull", "Arnold Press",
  "Upright Row", "Preacher Curl", "Hammer Curl", "Skull Crusher", "Tricep Pushdown",
  "Dips", "Close Grip Bench Press", "Crunches", "Leg Raises", "Plank",
  "Russian Twist", "Ab Wheel Rollout", "Cable Crunch", "Woodchopper", "Box Jump",
  "Kettlebell Swing", "Farmer's Walk", "Back Extension", "Machine Fly", "Reverse Pec Deck"
];

function getBodyPart(name) {
  const n = name.toLowerCase();
  if (n.includes('press') && !n.includes('leg') && !n.includes('overhead')) return "Chest";
  if (n.includes('fly') || n.includes('pec')) return "Chest";
  if (n.includes('squat') || n.includes('leg') || n.includes('lunge') || n.includes('calf') || n.includes('glute') || n.includes('thrust')) return "Legs";
  if (n.includes('deadlift') || n.includes('row') || n.includes('pull') || n.includes('extension') && n.includes('back')) return "Back";
  if (n.includes('curl')) return "Arms";
  if (n.includes('tricep') || n.includes('crusher') || n.includes('dip')) return "Arms";
  if (n.includes('raise') || n.includes('overhead') || n.includes('arnold') || n.includes('shrug')) return "Shoulders";
  if (n.includes('crunch') || n.includes('plank') || n.includes('twist') || n.includes('rollout') || n.includes('woodchopper')) return "Core";
  return "Full Body";
}

const exercises = exerciseNames.slice(0, 10).map(name => {
  const id = name.toLowerCase().replace(/[^a-z0-9]/g, '_');
  return {
    name,
    id,
    bodyPart: getBodyPart(name),
    targetMuscles: JSON.stringify(["Primary Muscle"]),
    secondaryMuscles: JSON.stringify(["Secondary Muscle"]),
    equipment: "Gym Equipment",
    difficulty: "Medium",
    setupAnimationUrl: `http://localhost:3000/animations/${id}.json`,
    gripAnimationUrl: `http://localhost:3000/animations/${id}.json`,
    postureAnimationUrl: `http://localhost:3000/animations/${id}.json`,
    movementAnimationUrl: `http://localhost:3000/animations/${id}.json`,
    loopAnimationUrl: `http://localhost:3000/animations/${id}.json`,
    instructions: JSON.stringify(["Step 1: Setup", "Step 2: Execute movement", "Step 3: Return to start"])
  };
});

// Update seed-exercises.ts
let seedContent = `import { PrismaClient } from '@prisma/client';\n\nconst prisma = new PrismaClient();\n\nconst CORE_EXERCISES = [\n`;
exercises.forEach(ex => {
  seedContent += `  {\n`;
  seedContent += `    name: "${ex.name}",\n`;
  seedContent += `    bodyPart: "${ex.bodyPart}",\n`;
  seedContent += `    targetMuscles: '${ex.targetMuscles}',\n`;
  seedContent += `    secondaryMuscles: '${ex.secondaryMuscles}',\n`;
  seedContent += `    equipment: "${ex.equipment}",\n`;
  seedContent += `    difficulty: "${ex.difficulty}",\n`;
  seedContent += `    setupAnimationUrl: "${ex.setupAnimationUrl}",\n`;
  seedContent += `    gripAnimationUrl: "${ex.gripAnimationUrl}",\n`;
  seedContent += `    postureAnimationUrl: "${ex.postureAnimationUrl}",\n`;
  seedContent += `    movementAnimationUrl: "${ex.movementAnimationUrl}",\n`;
  seedContent += `    loopAnimationUrl: "${ex.loopAnimationUrl}",\n`;
  seedContent += `    instructions: '${ex.instructions}'\n`;
  seedContent += `  },\n`;
});
seedContent += `];\n\n`;
seedContent += `async function main() {\n`;
seedContent += `  console.log('Clearing existing workout data to prevent FK constraint errors...');\n`;
seedContent += `  await prisma.workoutSet.deleteMany();\n`;
seedContent += `  await prisma.workoutExercise.deleteMany();\n`;
seedContent += `  await prisma.workoutSession.deleteMany();\n`;
seedContent += `  console.log('Clearing existing exercises...');\n`;
seedContent += `  await prisma.exercise.deleteMany();\n`;
seedContent += `  console.log(\`Seeding \${CORE_EXERCISES.length} core exercises...\`);\n`;
seedContent += `  for (const ex of CORE_EXERCISES) {\n`;
seedContent += `    await prisma.exercise.create({ data: ex });\n`;
seedContent += `  }\n`;
seedContent += `  console.log('Seeding completed successfully!');\n`;
seedContent += `}\n\n`;
seedContent += `main().catch(e => console.error(e)).finally(async () => await prisma.$disconnect());\n`;

fs.writeFileSync(path.join(__dirname, 'src', 'seed-exercises.ts'), seedContent);
console.log('Updated seed-exercises.ts');

// Update generate_lottie.js
const lottieContent = `const fs = require('fs');

function createLottie(name, color, type) {
  const json = {
    "v": "5.5.2", "fr": 60, "ip": 0, "op": 120, "w": 800, "h": 600, "nm": name, "ddd": 0, "assets": [],
    "layers": [
      {
        "ddd": 0, "ind": 1, "ty": 4, "nm": "Animated Shape", "sr": 1,
        "ks": {
          "o": { "a": 0, "k": 100, "ix": 11 }, "r": { "a": 0, "k": 0, "ix": 10 },
          "p": {
            "a": 1,
            "k": [
              { "i": { "x": 0.833, "y": 0.833 }, "o": { "x": 0.167, "y": 0.167 }, "t": 0, "s": [400, 200, 0], "to": [0, 50, 0], "ti": [0, -50, 0] },
              { "i": { "x": 0.833, "y": 0.833 }, "o": { "x": 0.167, "y": 0.167 }, "t": 60, "s": [400, 500, 0], "to": [0, -50, 0], "ti": [0, 50, 0] },
              { "t": 120, "s": [400, 200, 0] }
            ],
            "ix": 2
          },
          "a": { "a": 0, "k": [0, 0, 0], "ix": 1 }, "s": { "a": 0, "k": [100, 100, 100], "ix": 6 }
        },
        "ao": 0,
        "shapes": [
          { "ty": "rc", "d": 1, "s": { "a": 0, "k": [400, 30], "ix": 2 }, "p": { "a": 0, "k": [0, 0], "ix": 3 }, "r": { "a": 0, "k": 0, "ix": 4 }, "nm": "Rectangle Path 1", "mn": "ADBE Vector Shape - Rect", "hd": false },
          { "ty": "fl", "c": { "a": 0, "k": color, "ix": 4 }, "o": { "a": 0, "k": 100, "ix": 5 }, "r": 1, "bm": 0, "nm": "Fill 1", "mn": "ADBE Vector Graphic - Fill", "hd": false }
        ],
        "ip": 0, "op": 120, "st": 0, "bm": 0
      }
    ]
  };
  return JSON.stringify(json);
}

const exercises = [
${exercises.map((ex, i) => `  { file: '${ex.id}.json', color: [${Math.random().toFixed(2)}, ${Math.random().toFixed(2)}, ${Math.random().toFixed(2)}, 1] }`).join(',\n')}
];

if (!fs.existsSync('public/animations')) {
  fs.mkdirSync('public/animations', { recursive: true });
}

exercises.forEach(ex => {
  fs.writeFileSync(\`public/animations/\${ex.file}\`, createLottie(ex.file, ex.color, 'barbell'));
});
console.log("Lottie files generated for 50 exercises.");
`;

fs.writeFileSync(path.join(__dirname, 'generate_lottie.js'), lottieContent);
console.log('Updated generate_lottie.js');
