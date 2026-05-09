const { execFile } = require("child_process");
const path = require("path");
const os = require("os");
const fs = require("fs");

const BIN_DIR = path.join(process.cwd(), "bin");
const isWindows = os.platform() === "win32";

const YTDLP_PATH = isWindows
  ? path.join(BIN_DIR, "yt-dlp.exe")
  : path.join(BIN_DIR, "yt-dlp");

let YTDLP_BIN = null;

function findBinary() {
  if (YTDLP_BIN) return YTDLP_BIN;

  if (fs.existsSync(YTDLP_PATH)) {
    YTDLP_BIN = YTDLP_PATH;
    console.log(`✅ yt-dlp ditemukan: ${YTDLP_PATH}`);
    return YTDLP_BIN;
  }

  YTDLP_BIN = isWindows ? "yt-dlp.exe" : "yt-dlp";
  return YTDLP_BIN;
}

// Flags untuk bypass "Sign in to confirm" tanpa cookies
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
  "2",
  "--ffmpeg-location",
  BIN_DIR,
  "--cache-dir",
  path.join(process.cwd(), "cache"),

  // Bypass "Sign in to confirm" strategy
  "--extractor-args",
  "youtube:skip=hls/dash/translated_subs,player_client=web_creator",

  // Disable age gate
  "--age-limit",
  "18",

  // User agent agar tidak terdeteksi bot
  "--user-agent",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",

  // IP rotation (jika available)
  "--socket-timeout",
  "30",

  // Prefer format yang tidak butuh merge
  "--prefer-free-formats",

  // Disable video info parsing yang ketat
  "--no-warnings",
];

function runYtDlp(args = []) {
  const bin = findBinary();

  return new Promise((resolve, reject) => {
    execFile(
      bin,
      [...BASE_FLAGS, ...args],
      {
        timeout: 1000 * 60 * 5,
        windowsHide: isWindows,
        maxBuffer: 1024 * 1024 * 50,
      },
      (err, stdout, stderr) => {
        if (err) {
          const errMsg = (stderr || stdout || err.message).trim();

          // Handle khusus untuk berbagai error
          if (errMsg.includes("Sign in to confirm")) {
            console.log(
              "⚠️  Video ini di-protect YouTube (age/region restricted)",
            );
            console.log("💡 Solusi: Gunakan proxy atau VPN untuk change IP");
            return reject(new Error("Video protected - IP change required"));
          }

          if (errMsg.includes("not available")) {
            return reject(new Error("Video tidak tersedia di region ini"));
          }

          if (errMsg.includes("private")) {
            return reject(new Error("Video private"));
          }

          if (errMsg.includes("deleted")) {
            return reject(new Error("Video sudah dihapus"));
          }

          return reject(new Error(errMsg));
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
  // Coba berbagai format tanpa merge untuk bypass
  const formats = [
    // Format yang sudah merged (tidak perlu decode)
    "best[height<=720]",
    "best[height<=480]",
    "best",
    // Fallback: merge manual
    "bv*+ba/b",
    "bestvideo+bestaudio/best",
  ];

  let lastError;

  for (const format of formats) {
    try {
      console.log(`📥 Trying format: ${format}`);
      await runYtDlp(["-f", format, "-o", output, url]);
      console.log(`✅ Download berhasil`);
      return true;
    } catch (err) {
      lastError = err;
      console.log(`⚠️  Format gagal: ${format}`);
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
  BIN_DIR,
  runYtDlp,
  getInfo,
  downloadVideo,
  downloadAudio,
};
