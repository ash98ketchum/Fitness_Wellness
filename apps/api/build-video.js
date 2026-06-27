const ffmpeg = require('ffmpeg-static');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const brainDir = 'C:\\Users\\aniru\\.gemini\\antigravity-ide\\brain\\929cd2ee-6398-4e95-8af3-cd68099c2ff7';
const outDir = path.join(__dirname, 'public', 'exercises', 'bench_press');

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

function runFFmpeg(args) {
  console.log(`Running FFmpeg: ${args}`);
  execSync(`"${ffmpeg}" -y ${args}`, { stdio: 'inherit' });
}

// 1. Setup MP4/WebM (loop static image for 3 seconds)
runFFmpeg(`-loop 1 -i "${brainDir}\\bench_setup_1782187489961.png" -c:v libx264 -t 3 -pix_fmt yuv420p "${path.join(outDir, 'setup.mp4')}"`);
runFFmpeg(`-loop 1 -i "${brainDir}\\bench_setup_1782187489961.png" -c:v libvpx-vp9 -t 3 -pix_fmt yuva420p "${path.join(outDir, 'setup.webm')}"`);

// 2. Grip MP4/WebM
runFFmpeg(`-loop 1 -i "${brainDir}\\bench_grip_1782187522375.png" -c:v libx264 -t 3 -pix_fmt yuv420p "${path.join(outDir, 'grip.mp4')}"`);
runFFmpeg(`-loop 1 -i "${brainDir}\\bench_grip_1782187522375.png" -c:v libvpx-vp9 -t 3 -pix_fmt yuva420p "${path.join(outDir, 'grip.webm')}"`);

// 3. Posture MP4/WebM
runFFmpeg(`-loop 1 -i "${brainDir}\\bench_posture_1782187587598.png" -c:v libx264 -t 3 -pix_fmt yuv420p "${path.join(outDir, 'posture.mp4')}"`);
runFFmpeg(`-loop 1 -i "${brainDir}\\bench_posture_1782187587598.png" -c:v libvpx-vp9 -t 3 -pix_fmt yuva420p "${path.join(outDir, 'posture.webm')}"`);

// 4. Movement Sequence MP4/WebM
fs.mkdirSync(path.join(outDir, 'temp_move'), { recursive: true });
fs.copyFileSync(`${brainDir}\\bench_move_1_1782187622249.png`, path.join(outDir, 'temp_move', '01.jpg'));
fs.copyFileSync(`${brainDir}\\bench_move_2_1782187648914.png`, path.join(outDir, 'temp_move', '02.jpg'));
fs.copyFileSync(`${brainDir}\\bench_move_3_1782187661188.png`, path.join(outDir, 'temp_move', '03.jpg'));
fs.copyFileSync(`${brainDir}\\bench_move_4_1782187673874.png`, path.join(outDir, 'temp_move', '04.jpg'));
runFFmpeg(`-framerate 1 -i "${path.join(outDir, 'temp_move', '%02d.jpg')}" -c:v libx264 -r 30 -pix_fmt yuv420p "${path.join(outDir, 'movement.mp4')}"`);
runFFmpeg(`-framerate 1 -i "${path.join(outDir, 'temp_move', '%02d.jpg')}" -c:v libvpx-vp9 -r 30 -pix_fmt yuva420p "${path.join(outDir, 'movement.webm')}"`);

// 5. Loop Sequence MP4/WebM
fs.mkdirSync(path.join(outDir, 'temp_loop'), { recursive: true });
fs.copyFileSync(`${brainDir}\\bench_loop_1_1782187717868.png`, path.join(outDir, 'temp_loop', '01.jpg'));
fs.copyFileSync(`${brainDir}\\bench_loop_2_1782187728634.png`, path.join(outDir, 'temp_loop', '02.jpg'));
fs.copyFileSync(`${brainDir}\\bench_loop_3_1782187738999.png`, path.join(outDir, 'temp_loop', '03.jpg'));
fs.copyFileSync(`${brainDir}\\bench_loop_4_1782187751398.png`, path.join(outDir, 'temp_loop', '04.jpg'));
fs.copyFileSync(`${brainDir}\\bench_loop_5_1782187762019.png`, path.join(outDir, 'temp_loop', '05.jpg'));
runFFmpeg(`-framerate 2 -i "${path.join(outDir, 'temp_loop', '%02d.jpg')}" -c:v libx264 -r 30 -pix_fmt yuv420p "${path.join(outDir, 'loop.mp4')}"`);
runFFmpeg(`-framerate 2 -i "${path.join(outDir, 'temp_loop', '%02d.jpg')}" -c:v libvpx-vp9 -r 30 -pix_fmt yuva420p "${path.join(outDir, 'loop.webm')}"`);

// 6. Thumbnail and Poster
fs.copyFileSync(`${brainDir}\\bench_setup_1782187489961.png`, path.join(outDir, 'thumbnail.png'));
fs.copyFileSync(`${brainDir}\\bench_setup_1782187489961.png`, path.join(outDir, 'poster.png'));

// 7. metadata.json
const metadata = {
  id: "bench_press",
  name: "Barbell Bench Press",
  phases: ["setup", "grip", "posture", "movement", "loop"],
  assets: {
    setup: { mp4: "setup.mp4", webm: "setup.webm" },
    grip: { mp4: "grip.mp4", webm: "grip.webm" },
    posture: { mp4: "posture.mp4", webm: "posture.webm" },
    movement: { mp4: "movement.mp4", webm: "movement.webm" },
    loop: { mp4: "loop.mp4", webm: "loop.webm" }
  },
  thumbnail: "thumbnail.png",
  poster: "poster.png"
};
fs.writeFileSync(path.join(outDir, 'metadata.json'), JSON.stringify(metadata, null, 2));

console.log("Done generating assets!");
