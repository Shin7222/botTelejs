const { execFile } = require("child_process");
const path = require("path");
const os = require("os");
const fs = require("fs");

const BIN_DIR = path.join(process.cwd(), "bin");

const YTDLP_PATH =
  os.platform() === "win32"
    ? path.join(BIN_DIR, "yt-dlp.exe")
    : path.join(BIN_DIR, "yt-dlp");

if (!fs.existsSync(YTDLP_PATH)) {
  throw new Error(`yt-dlp tidak ditemukan: ${YTDLP_PATH}`);
}

const BASE_FLAGS = [
  "--no-playlist",
  "--no-check-certificate",
  "--no-check-formats",

  "--extractor-retries",
  "5",
  "--retries",
  "10",
  "--fragment-retries",
  "10",

  "--socket-timeout",
  "30",
  "--sleep-requests",
  "1",

  "--ffmpeg-location",
  BIN_DIR,

  "--extractor-args",
  "youtube:player_client=web",

  "--cache-dir",
  path.join(process.cwd(), "cache"),
];

function runYtDlp(args = []) {
  return new Promise((resolve, reject) => {
    execFile(
      YTDLP_PATH,
      [...BASE_FLAGS, ...args],
      {
        timeout: 1000 * 60 * 5,
        windowsHide: true,
        maxBuffer: 1024 * 1024 * 50,
      },
      (err, stdout, stderr) => {
        if (err) {
          return reject(new Error((stderr || stdout || err.message).trim()));
        }
        resolve((stdout || "").trim());
      },
    );
  });
}

async function getInfo(url) {
  const raw = await runYtDlp(["--dump-single-json", "--no-warnings", url]);

  return JSON.parse(raw);
}

async function downloadVideo(url, output) {
  const formats = [
    "bv*+ba/b", // best merge
    "bestvideo+bestaudio/best", // fallback
    "best", // fallback universal
  ];

  let lastError;

  for (const format of formats) {
    try {
      await runYtDlp(["-f", format, "-o", output, url]);

      return true;
    } catch (err) {
      lastError = err;
      console.log("Format gagal:", format);
    }
  }

  throw lastError;
}

async function downloadAudio(url, output) {
  return runYtDlp([
    "-x",
    "--audio-format",
    "mp3",
    "--audio-quality",
    "0",
    "-o",
    output,
    url,
  ]);
}

module.exports = {
  runYtDlp,
  getInfo,
  downloadVideo,
  downloadAudio,
};
