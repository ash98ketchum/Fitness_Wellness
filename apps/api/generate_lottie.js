const fs = require('fs');

function createLottie(name, color, type) {
  const json = {
    "v": "5.5.2",
    "fr": 60,
    "ip": 0,
    "op": 120,
    "w": 800,
    "h": 600,
    "nm": name,
    "ddd": 0,
    "assets": [],
    "layers": [
      {
        "ddd": 0,
        "ind": 1,
        "ty": 4,
        "nm": "Animated Shape",
        "sr": 1,
        "ks": {
          "o": { "a": 0, "k": 100, "ix": 11 },
          "r": { "a": 0, "k": 0, "ix": 10 },
          "p": {
            "a": 1,
            "k": [
              { "i": { "x": 0.833, "y": 0.833 }, "o": { "x": 0.167, "y": 0.167 }, "t": 0, "s": [400, 200, 0], "to": [0, 50, 0], "ti": [0, -50, 0] },
              { "i": { "x": 0.833, "y": 0.833 }, "o": { "x": 0.167, "y": 0.167 }, "t": 60, "s": [400, 500, 0], "to": [0, -50, 0], "ti": [0, 50, 0] },
              { "t": 120, "s": [400, 200, 0] }
            ],
            "ix": 2
          },
          "a": { "a": 0, "k": [0, 0, 0], "ix": 1 },
          "s": { "a": 0, "k": [100, 100, 100], "ix": 6 }
        },
        "ao": 0,
        "shapes": [
          {
            "ty": "rc",
            "d": 1,
            "s": { "a": 0, "k": [400, 30], "ix": 2 },
            "p": { "a": 0, "k": [0, 0], "ix": 3 },
            "r": { "a": 0, "k": 0, "ix": 4 },
            "nm": "Rectangle Path 1",
            "mn": "ADBE Vector Shape - Rect",
            "hd": false
          },
          {
            "ty": "fl",
            "c": { "a": 0, "k": color, "ix": 4 },
            "o": { "a": 0, "k": 100, "ix": 5 },
            "r": 1,
            "bm": 0,
            "nm": "Fill 1",
            "mn": "ADBE Vector Graphic - Fill",
            "hd": false
          }
        ],
        "ip": 0,
        "op": 120,
        "st": 0,
        "bm": 0
      }
    ]
  };
  return JSON.stringify(json);
}

const exercises = [
  { file: 'bench_press.json', color: [0.1, 0.8, 0.4, 1] },
  { file: 'barbell_squat.json', color: [0.2, 0.5, 0.9, 1] },
  { file: 'deadlift.json', color: [0.9, 0.2, 0.2, 1] },
  { file: 'lat_pulldown.json', color: [0.9, 0.8, 0.1, 1] },
  { file: 'leg_press.json', color: [0.6, 0.2, 0.8, 1] }
];

if (!fs.existsSync('public/animations')) {
  fs.mkdirSync('public/animations', { recursive: true });
}

exercises.forEach(ex => {
  fs.writeFileSync(`public/animations/${ex.file}`, createLottie(ex.file, ex.color, 'barbell'));
});

console.log("Lottie files generated.");
