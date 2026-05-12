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

  // retry
  "--extractor-retries",
  "5",

  "--retries",
  "10",

  "--fragment-retries",
  "10",

  "--socket-timeout",
  "30",

  // anti rate limit
  "--sleep-requests",
  "1",

  // force ipv4
  "-4",

  // ffmpeg
  "--ffmpeg-location",
  BIN_DIR,

  // cache
  "--cache-dir",
  path.join(process.cwd(), "cache"),

  // IMPORTANT
  // multi client fallback tanpa cookies
  "--extractor-args",
  "youtube:player_client=android,web,ios",

  // user agent
  "--user-agent",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",

  "--no-warnings",
];

function runYtDlp(args = []) {
  return new Promise((resolve, reject) => {
    execFile(
      YTDLP_PATH,
      [...BASE_FLAGS, ...args],
      {
        timeout: 1000 * 60 * 5,
        windowsHide: true,
        maxBuffer: 1024 * 1024 * 100,
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
  const raw = await runYtDlp(["--dump-single-json", url]);

  return JSON.parse(raw);
}

async function downloadVideo(url, output) {
  const formats = ["bv*+ba/b", "bestvideo+bestaudio/best", "best"];

  let lastError;

  for (const format of formats) {
    try {
      console.log(`📥 Trying format: ${format}`);

      await runYtDlp(["-f", format, "-o", output, url]);

      console.log("✅ Download berhasil");

      return true;
    } catch (err) {
      lastError = err;
      console.log(`⚠️ Format gagal: ${format}`);
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
