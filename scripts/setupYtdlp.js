const fs = require("fs");
const path = require("path");
const axios = require("axios");
const unzipper = require("unzipper");

const BIN_DIR = path.join(process.cwd(), "bin");

if (!fs.existsSync(BIN_DIR)) {
  fs.mkdirSync(BIN_DIR);
}

// =========================
// DOWNLOAD FUNCTION (FIX 302)
// =========================
async function download(url, dest) {
  const writer = fs.createWriteStream(dest);

  const response = await axios({
    method: "GET",
    url,
    responseType: "stream",
    maxRedirects: 10,
  });

  return new Promise((resolve, reject) => {
    response.data.pipe(writer);

    writer.on("finish", resolve);
    writer.on("error", reject);
  });
}

// =========================
// SETUP
// =========================
async function setup() {
  console.log("📦 Setup bot downloader dimulai...");

  try {
    // =========================
    // YT-DLP
    // =========================
    console.log("⬇ Download yt-dlp...");
    await download(
      "https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp.exe",
      path.join(BIN_DIR, "yt-dlp.exe"),
    );

    // =========================
    // FFMPEG ZIP
    // =========================
    console.log("⬇ Download ffmpeg...");

    const ffmpegUrl =
      "https://www.gyan.dev/ffmpeg/builds/ffmpeg-release-essentials.zip";

    const zipPath = path.join(BIN_DIR, "ffmpeg.zip");

    await download(ffmpegUrl, zipPath);

    console.log("📦 Extracting ffmpeg...");

    await fs
      .createReadStream(zipPath)
      .pipe(unzipper.Extract({ path: BIN_DIR }))
      .promise();

    fs.unlinkSync(zipPath);

    console.log("✅ FFmpeg berhasil di-extract");

    console.log("\n🎉 SETUP SELESAI");
    console.log("📁 Folder bin:");
    console.log(BIN_DIR);

    console.log("\n⚠ Pastikan file ini ada:");
    console.log("- yt-dlp.exe");
    console.log("- ffmpeg.exe");
    console.log("- ffprobe.exe");
  } catch (err) {
    console.error("❌ Setup gagal:", err.message);
  }
}

setup();
