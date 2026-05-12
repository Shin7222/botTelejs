const fs = require("fs");
const path = require("path");
const os = require("os");
const axios = require("axios");
const unzipper = require("unzipper");

const BIN_DIR = path.join(process.cwd(), "bin");
const isWindows = os.platform() === "win32";
const isLinux = os.platform() === "linux";
const isMac = os.platform() === "darwin";

const FFMPEG_PATH = isWindows
  ? path.join(BIN_DIR, "ffmpeg.exe")
  : path.join(BIN_DIR, "ffmpeg");

console.log("🔍 Checking FFmpeg...\n");

// Cek di bin folder
if (fs.existsSync(FFMPEG_PATH)) {
  console.log(`✅ FFmpeg found: ${FFMPEG_PATH}`);
  process.exit(0);
}

console.log("❌ FFmpeg not found, downloading...\n");

(async () => {
  try {
    // Buat bin folder
    if (!fs.existsSync(BIN_DIR)) {
      fs.mkdirSync(BIN_DIR, { recursive: true });
    }

    let downloadUrl;
    let isZip = false;

    if (isWindows) {
      downloadUrl =
        "https://github.com/BtbN/FFmpeg-Builds/releases/download/latest/ffmpeg-master-latest-win64-gpl.zip";
      isZip = true;
    } else if (isLinux) {
      downloadUrl =
        "https://github.com/BtbN/FFmpeg-Builds/releases/download/latest/ffmpeg-master-latest-linux64-gpl.tar.xz";
    } else if (isMac) {
      downloadUrl =
        "https://github.com/BtbN/FFmpeg-Builds/releases/download/latest/ffmpeg-master-latest-macos64-gpl.zip";
      isZip = true;
    }

    console.log(`📥 Platform: ${os.platform()}`);
    console.log(`📥 Downloading from: ${downloadUrl}`);
    console.log("⏳ This may take a few minutes...\n");

    const response = await axios.get(downloadUrl, {
      responseType: "stream",
      timeout: 120000,
    });

    if (isZip) {
      // Extract ZIP
      console.log("📦 Extracting ZIP...");

      await new Promise((resolve, reject) => {
        response.data
          .pipe(unzipper.Extract({ path: BIN_DIR }))
          .on("close", resolve)
          .on("error", reject);
      });

      // Find ffmpeg di extracted folder
      const ffmpegBin = findFile(BIN_DIR, "ffmpeg.exe");

      if (ffmpegBin && ffmpegBin !== FFMPEG_PATH) {
        fs.copyFileSync(ffmpegBin, FFMPEG_PATH);
        deleteFolder(path.dirname(ffmpegBin));
      }
    } else {
      // Extract TAR.XZ untuk Linux
      const { execSync } = require("child_process");
      const tempFile = path.join(BIN_DIR, "ffmpeg.tar.xz");
      const writeStream = fs.createWriteStream(tempFile);

      console.log("📦 Extracting TAR.XZ...");

      await new Promise((resolve, reject) => {
        response.data.pipe(writeStream);
        writeStream.on("close", resolve);
        writeStream.on("error", reject);
      });

      try {
        execSync(`cd ${BIN_DIR} && tar -xf ffmpeg.tar.xz`, {
          stdio: "ignore",
        });

        const ffmpegBin = findFile(BIN_DIR, "ffmpeg");
        if (ffmpegBin && ffmpegBin !== FFMPEG_PATH) {
          fs.copyFileSync(ffmpegBin, FFMPEG_PATH);
          fs.chmodSync(FFMPEG_PATH, 0o755);
          deleteFolder(path.dirname(ffmpegBin));
        }
      } catch {}

      try {
        fs.unlinkSync(tempFile);
      } catch {}
    }

    if (fs.existsSync(FFMPEG_PATH)) {
      console.log(`✅ FFmpeg downloaded: ${FFMPEG_PATH}\n`);
    } else {
      throw new Error("FFmpeg not found in extraction");
    }
  } catch (err) {
    console.error("❌ Failed to download FFmpeg:", err.message);
    console.log("\n📋 Manual download:");
    console.log("   https://ffmpeg.org/download.html");
    console.log(`   Save as: ${FFMPEG_PATH}\n`);
    process.exit(1);
  }
})();

function findFile(dir, filename) {
  try {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      if (stat.isDirectory()) {
        const found = findFile(filePath, filename);
        if (found) return found;
      } else if (file === filename) {
        return filePath;
      }
    }
  } catch {}
  return null;
}

function deleteFolder(folderPath) {
  try {
    if (fs.existsSync(folderPath)) {
      fs.rmSync(folderPath, { recursive: true, force: true });
    }
  } catch {}
}