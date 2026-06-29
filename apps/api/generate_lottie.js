const fs = require('fs');

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
  { file: 'barbell_bench_press.json', color: [0.76, 0.43, 0.66, 1] },
  { file: 'barbell_back_squat.json', color: [0.47, 0.51, 0.82, 1] },
  { file: 'conventional_deadlift.json', color: [0.34, 0.78, 0.62, 1] },
  { file: 'pull_up.json', color: [0.23, 0.03, 0.95, 1] },
  { file: 'overhead_press.json', color: [0.44, 0.86, 0.99, 1] },
  { file: 'barbell_row.json', color: [0.54, 0.98, 0.48, 1] },
  { file: 'lat_pulldown.json', color: [0.82, 0.07, 0.63, 1] },
  { file: 'leg_press.json', color: [0.86, 0.45, 0.69, 1] },
  { file: 'leg_extension.json', color: [0.32, 0.31, 0.16, 1] },
  { file: 'leg_curl.json', color: [0.55, 0.21, 0.94, 1] },
  { file: 'calf_raise.json', color: [0.55, 0.83, 0.12, 1] },
  { file: 'dumbbell_curl.json', color: [0.25, 0.89, 0.47, 1] },
  { file: 'tricep_extension.json', color: [0.39, 0.04, 0.45, 1] },
  { file: 'lateral_raise.json', color: [0.69, 0.56, 0.52, 1] },
  { file: 'front_raise.json', color: [0.70, 0.37, 0.53, 1] },
  { file: 'shrugs.json', color: [0.14, 0.06, 0.16, 1] },
  { file: 'incline_bench_press.json', color: [0.62, 0.90, 0.64, 1] },
  { file: 'decline_bench_press.json', color: [0.68, 0.36, 0.05, 1] },
  { file: 'dumbbell_fly.json', color: [0.24, 0.22, 0.78, 1] },
  { file: 'cable_crossover.json', color: [0.98, 0.32, 0.59, 1] },
  { file: 'hack_squat.json', color: [0.92, 0.53, 0.04, 1] },
  { file: 'bulgarian_split_squat.json', color: [0.58, 0.64, 0.26, 1] },
  { file: 'romanian_deadlift.json', color: [0.57, 0.96, 0.32, 1] },
  { file: 'lunges.json', color: [0.27, 0.44, 0.38, 1] },
  { file: 'glute_bridge.json', color: [0.11, 0.86, 0.37, 1] },
  { file: 'hip_thrust.json', color: [0.05, 0.92, 0.73, 1] },
  { file: 'seated_cable_row.json', color: [0.22, 0.07, 0.88, 1] },
  { file: 't_bar_row.json', color: [0.54, 0.03, 0.18, 1] },
  { file: 'face_pull.json', color: [0.03, 0.79, 0.95, 1] },
  { file: 'arnold_press.json', color: [0.89, 0.03, 0.78, 1] },
  { file: 'upright_row.json', color: [0.95, 0.54, 0.28, 1] },
  { file: 'preacher_curl.json', color: [0.14, 0.49, 0.09, 1] },
  { file: 'hammer_curl.json', color: [0.17, 0.30, 0.80, 1] },
  { file: 'skull_crusher.json', color: [0.88, 0.49, 0.55, 1] },
  { file: 'tricep_pushdown.json', color: [0.13, 0.99, 0.55, 1] },
  { file: 'dips.json', color: [0.35, 0.43, 0.40, 1] },
  { file: 'close_grip_bench_press.json', color: [0.10, 0.62, 0.54, 1] },
  { file: 'crunches.json', color: [0.36, 0.72, 0.20, 1] },
  { file: 'leg_raises.json', color: [0.43, 0.62, 0.21, 1] },
  { file: 'plank.json', color: [0.86, 0.83, 0.11, 1] },
  { file: 'russian_twist.json', color: [0.58, 0.13, 0.73, 1] },
  { file: 'ab_wheel_rollout.json', color: [0.51, 0.65, 0.68, 1] },
  { file: 'cable_crunch.json', color: [0.59, 0.93, 0.16, 1] },
  { file: 'woodchopper.json', color: [0.34, 0.12, 0.73, 1] },
  { file: 'box_jump.json', color: [0.20, 0.01, 0.39, 1] },
  { file: 'kettlebell_swing.json', color: [0.57, 0.63, 0.97, 1] },
  { file: 'farmer_s_walk.json', color: [0.13, 0.06, 0.19, 1] },
  { file: 'back_extension.json', color: [0.34, 0.55, 0.35, 1] },
  { file: 'machine_fly.json', color: [0.77, 0.84, 0.37, 1] },
  { file: 'reverse_pec_deck.json', color: [0.09, 0.94, 0.66, 1] }
];

if (!fs.existsSync('public/animations')) {
  fs.mkdirSync('public/animations', { recursive: true });
}

exercises.forEach(ex => {
  fs.writeFileSync(`public/animations/${ex.file}`, createLottie(ex.file, ex.color, 'barbell'));
});
console.log("Lottie files generated for 50 exercises.");
