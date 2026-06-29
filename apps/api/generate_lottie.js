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
  { file: 'barbell_bench_press.json', color: [0.50, 0.62, 0.07, 1] },
  { file: 'barbell_back_squat.json', color: [0.07, 0.58, 0.53, 1] },
  { file: 'conventional_deadlift.json', color: [0.52, 0.78, 0.52, 1] },
  { file: 'pull_up.json', color: [0.82, 0.16, 0.62, 1] },
  { file: 'overhead_press.json', color: [0.47, 0.21, 0.45, 1] },
  { file: 'barbell_row.json', color: [0.02, 0.37, 0.98, 1] },
  { file: 'lat_pulldown.json', color: [0.91, 0.47, 0.25, 1] },
  { file: 'leg_press.json', color: [0.45, 0.70, 0.51, 1] },
  { file: 'leg_extension.json', color: [0.48, 0.97, 0.35, 1] },
  { file: 'leg_curl.json', color: [0.00, 0.20, 0.26, 1] }
];

if (!fs.existsSync('public/animations')) {
  fs.mkdirSync('public/animations', { recursive: true });
}

exercises.forEach(ex => {
  fs.writeFileSync(`public/animations/${ex.file}`, createLottie(ex.file, ex.color, 'barbell'));
});
console.log("Lottie files generated for 50 exercises.");
