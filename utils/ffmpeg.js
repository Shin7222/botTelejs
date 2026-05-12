const { execFile } = require("child_process");
const path = require("path");
const fs = require("fs");

const BIN_DIR = path.join(process.cwd(), "bin");
const FFMPEG_PATH = path.join(BIN_DIR, "ffmpeg.exe");

if (!fs.existsSync(FFMPEG_PATH)) {
  console.warn(
    `⚠️  ffmpeg.exe tidak ditemukan: ${FFMPEG_PATH}\nJalankan: npm install`,
  );
}

function run(inputFile, outputFile, args = []) {
  return new Promise((resolve, reject) => {
    execFile(
      FFMPEG_PATH,
      ["-i", inputFile, ...args, outputFile],
      {
        timeout: 300000,
        windowsHide: true,
      },
      (err, stdout, stderr) => {
        if (err) return reject(new Error(stderr || err.message));
        resolve(stdout);
      },
    );
  });
}

async function convertVideo(inputFile, outputFile, format = "mp4") {
  const formatArgs = {
    mp4: ["-c:v", "libx264", "-preset", "fast", "-c:a", "aac"],
    mp3: ["-q:a", "0", "-map", "a"],
  };

  const args = formatArgs[format] || [];
  return await run(inputFile, outputFile, args);
}

async function mergeVideoAudio(videoFile, audioFile, outputFile) {
  const args = ["-c:v", "copy", "-c:a", "aac", "-shortest"];
  return await run(videoFile, outputFile, ["-i", audioFile, ...args]);
}

module.exports = { run, convertVideo, mergeVideoAudio };
