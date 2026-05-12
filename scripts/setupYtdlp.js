const fs = require("fs");
const path = require("path");
const os = require("os");
const axios = require("axios");

const BIN_DIR = path.join(process.cwd(), "bin");
const isWindows = os.platform() === "win32";
const isLinux = os.platform() === "linux";
const isMac = os.platform() === "darwin";

const YTDLP_PATH = isWindows
  ? path.join(BIN_DIR, "yt-dlp.exe")
  : path.join(BIN_DIR, "yt-dlp");

console.log("🔍 Checking yt-dlp...\n");

// Cek di bin folder
if (fs.existsSync(YTDLP_PATH)) {
  console.log(`✅ yt-dlp found: ${YTDLP_PATH}`);
  process.exit(0);
}

console.log("❌ yt-dlp not found, downloading...\n");

(async () => {
  try {
    // Buat bin folder
    if (!fs.existsSync(BIN_DIR)) {
      fs.mkdirSync(BIN_DIR, { recursive: true });
    }

    // Tentukan URL berdasarkan OS
    let downloadUrl;
    if (isWindows) {
      downloadUrl =
        "https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp.exe";
    } else if (isLinux) {
      downloadUrl =
        "https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp_linux";
    } else if (isMac) {
      downloadUrl =
        "https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp_macos";
    }

    console.log(`📥 Platform: ${os.platform()}`);
    console.log(`📥 Downloading from: ${downloadUrl}`);

    const response = await axios.get(downloadUrl, {
      responseType: "arraybuffer",
      timeout: 60000,
    });

    fs.writeFileSync(YTDLP_PATH, response.data);

    // Make executable (Linux/Mac)
    if (!isWindows) {
      fs.chmodSync(YTDLP_PATH, 0o755);
    }

    console.log(`✅ yt-dlp downloaded: ${YTDLP_PATH}`);
    console.log(`📝 Size: ${(response.data.length / 1024 / 1024).toFixed(2)} MB\n`);
  } catch (err) {
    console.error("❌ Failed to download yt-dlp:", err.message);
    console.log("\n📋 Manual download:");
    console.log("   https://github.com/yt-dlp/yt-dlp/releases/latest");
    console.log(`   Save as: ${YTDLP_PATH}\n`);
    process.exit(1);
  }
})();