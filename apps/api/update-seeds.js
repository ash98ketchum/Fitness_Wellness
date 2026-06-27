const fs = require('fs');
let c = fs.readFileSync('src/seed-exercises.ts', 'utf8');

const updates = [
  { name: 'Barbell Bench Press', url: 'http://localhost:3000/animations/bench_press.json' },
  { name: 'Barbell Back Squat', url: 'http://localhost:3000/animations/barbell_squat.json' },
  { name: 'Conventional Deadlift', url: 'http://localhost:3000/animations/deadlift.json' },
  { name: 'Lat Pulldown', url: 'http://localhost:3000/animations/lat_pulldown.json' },
  { name: 'Leg Press', url: 'http://localhost:3000/animations/leg_press.json' }
];

updates.forEach(({ name, url }) => {
  const regex = new RegExp(`name: "${name}",[\\s\\S]*?loopAnimationUrl: "[^"]+"`, 'g');
  c = c.replace(regex, (match) => {
    return match.replace(/http:\/\/localhost:3000\/exercises\/[^"]+\.png/g, url)
                .replace(/https:\/\/assets4\.lottiefiles\.com[^"]+/g, url);
  });
});

fs.writeFileSync('src/seed-exercises.ts', c);
console.log('Seed file updated!');
