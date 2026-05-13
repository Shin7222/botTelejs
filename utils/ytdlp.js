const { execFile } = require("child_process");
const path = require("path");
const fs = require("fs");
const os = require("os");

const BIN_DIR = path.join(process.cwd(), "bin");

const YTDLP_PATH =
  os.platform() === "win32"
    ? path.join(BIN_DIR, "yt-dlp.exe")
    : path.join(BIN_DIR, "yt-dlp");

if (!fs.existsSync(YTDLP_PATH)) {
  throw new Error(
    `yt-dlp tidak ditemukan:\n${YTDLP_PATH}\nPastikan file ada di folder bin/`,
  );
}

const BASE_FLAGS = [
  "--no-playlist",
  "--no-check-certificate",
  "--no-check-formats",
  "--ignore-errors",
  "--no-warnings",

  // retry
  "--extractor-retries",
  "5",

  "--retries",
  "10",

  "--fragment-retries",
  "10",

  "--socket-timeout",
  "30",

  // anti spam request
  "--sleep-requests",
  "1",

  // cache
  "--cache-dir",
  path.join(process.cwd(), "cache"),

  // ffmpeg lokal
  "--ffmpeg-location",
  BIN_DIR,

  // youtube fallback clients
  "--extractor-args",
  "youtube:player_client=android,web_creator,web",

  // paksa ipv4
  "-4",
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

async function findDownloadedFile(outputTemplate) {
  const dir = path.dirname(outputTemplate);

  const base = path.basename(outputTemplate).split(".")[0];

  const files = fs.readdirSync(dir).filter((f) => f.startsWith(base));

  if (!files.length) {
    throw new Error("File gagal dibuat");
  }

  return path.join(dir, files[0]);
}

async function downloadVideo(url, output) {
  const formats = ["bv*+ba/b", "bestvideo+bestaudio/best", "best"];

  let lastError;

  for (const format of formats) {
    try {
      await runYtDlp([
        "-f",
        format,

        "--merge-output-format",
        "mp4",

        "--remux-video",
        "mp4",

        "-o",
        output,
        url,
      ]);

      return await findDownloadedFile(output);
    } catch (err) {
      lastError = err;
      console.log("Format gagal:", format);
    }
  }

  throw lastError;
}

async function downloadAudio(url, output) {
  await runYtDlp([
    "-x",

    "--audio-format",
    "mp3",

    "--audio-quality",
    "0",

    "-o",
    output,
    url,
  ]);

  return await findDownloadedFile(output);
}

module.exports = {
  BIN_DIR,
  runYtDlp,
  getInfo,
  downloadVideo,
  downloadAudio,
};
