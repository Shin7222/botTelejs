const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const os = require("os");

const isWindows = os.platform() === "win32";
const isMac = os.platform() === "darwin";
const isLinux = os.platform() === "linux";

const binDir = path.join(__dirname, "..", "bin");

console.log(`🔍 Checking FFmpeg (${os.platform()})...\n`);

// Cek apakah sudah ada di bin folder
const ffmpegPath = isWindows
  ? path.join(binDir, "ffmpeg.exe")
  : path.join(binDir, "ffmpeg");
if (fs.existsSync(ffmpegPath)) {
  console.log(`✅ FFmpeg sudah ada di folder bin/`);
  process.exit(0);
}

// Windows
if (isWindows) {
  try {
    const result = execSync("ffmpeg -version", { encoding: "utf-8" });
    console.log("✅ FFmpeg sudah terinstall");
    process.exit(0);
  } catch {
    console.log("⚠️  FFmpeg tidak ditemukan di Windows\n");
    console.log("📥 Install dengan salah satu cara:\n");
    console.log("   1. via winget:");
    console.log("      winget install ffmpeg\n");
    console.log("   2. Download manual:");
    console.log("      https://ffmpeg.org/download.html");
    console.log("      Extract dan taruh ffmpeg.exe di: " + binDir + "\n");
    process.exit(0);
  }
}

// Linux/Mac
if (isLinux || isMac) {
  try {
    const result = execSync("ffmpeg -version", { encoding: "utf-8" });
    console.log("✅ FFmpeg sudah terinstall");
    process.exit(0);
  } catch {
    console.log("❌ FFmpeg tidak ditemukan, sedang menginstall...\n");
  }

  try {
    if (isLinux) {
      // Try apt (Debian/Ubuntu)
      try {
        console.log("📥 Trying apt...");
        execSync("sudo apt-get update && sudo apt-get install -y ffmpeg", {
          stdio: "inherit",
        });
      } catch {
        // Try yum (CentOS/RHEL)
        console.log("📥 Trying yum...");
        execSync("sudo yum install -y ffmpeg", { stdio: "inherit" });
      }
    } else if (isMac) {
      // Try brew
      console.log("📥 Trying homebrew...");
      execSync("brew install ffmpeg", { stdio: "inherit" });
    }
    console.log("\n✅ FFmpeg berhasil diinstall!");
  } catch {
    console.log("❌ Instalasi gagal");
    if (isLinux) {
      console.log("🔗 Install manual: sudo apt-get install ffmpeg");
    } else if (isMac) {
      console.log("🔗 Install manual: brew install ffmpeg");
    }
    process.exit(1);
  }
}
