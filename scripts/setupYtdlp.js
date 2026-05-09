const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const os = require("os");

const isWindows = os.platform() === "win32";
const isMac = os.platform() === "darwin";
const isLinux = os.platform() === "linux";

console.log(`🔍 Checking yt-dlp (${os.platform()})...\n`);

// Windows: cek di project root atau PATH
if (isWindows) {
  const projectYtdlp = path.join(__dirname, "..", "bin", "yt-dlp.exe");
  if (fs.existsSync(projectYtdlp)) {
    console.log("✅ yt-dlp.exe sudah ada di folder bin/");
    process.exit(0);
  }

  try {
    const result = execSync("yt-dlp --version", { encoding: "utf-8" });
    console.log("✅ yt-dlp sudah terinstall:", result.trim());
    process.exit(0);
  } catch {
    console.log("⚠️  yt-dlp tidak ditemukan di Windows\n");
    console.log("📥 Install dengan salah satu cara:\n");
    console.log("   1. via winget:");
    console.log("      winget install yt-dlp\n");
    console.log("   2. Download manual:");
    console.log(
      "      https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp.exe",
    );
    console.log(
      "      Taruh di folder: " + path.join(__dirname, "..", "bin") + "\n",
    );
    process.exit(0);
  }
}

// Linux/Mac: install via package manager
if (isLinux || isMac) {
  try {
    const result = execSync("yt-dlp --version", { encoding: "utf-8" });
    console.log("✅ yt-dlp sudah terinstall:", result.trim());
    process.exit(0);
  } catch {
    console.log("❌ yt-dlp tidak ditemukan, sedang menginstall...\n");
  }

  try {
    if (isLinux) {
      // Try apt (Debian/Ubuntu)
      try {
        console.log("📥 Trying apt...");
        execSync("sudo apt-get update && sudo apt-get install -y yt-dlp", {
          stdio: "inherit",
        });
      } catch {
        // Try pip
        console.log("📥 Trying pip...");
        execSync("pip install yt-dlp --break-system-packages", {
          stdio: "inherit",
        });
      }
    } else if (isMac) {
      // Try brew
      console.log("📥 Trying homebrew...");
      execSync("brew install yt-dlp", { stdio: "inherit" });
    }
    console.log("\n✅ yt-dlp berhasil diinstall!");
  } catch {
    console.log("❌ Instalasi gagal");
    console.log("🔗 Install manual: pip install yt-dlp");
    process.exit(1);
  }
}
