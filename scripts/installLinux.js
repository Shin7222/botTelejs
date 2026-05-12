const { execSync } = require("child_process");
const path = require("path");
const fs = require("fs");
const os = require("os");

const isLinux = os.platform() === "linux";

if (!isLinux) {
  console.log("⏭️  Skipping Linux setup (not running on Linux)");
  process.exit(0);
}

console.log("🔍 Linux Setup Started\n");

const SETUP_SCRIPT = path.join(__dirname, "setup-linux.sh");

// Cek apakah script ada
if (!fs.existsSync(SETUP_SCRIPT)) {
  console.error("❌ setup-linux.sh not found!");
  process.exit(1);
}

try {
  // Jalankan shell script
  execSync(`bash "${SETUP_SCRIPT}"`, { stdio: "inherit" });
  console.log("\n✅ Linux setup completed!");
} catch (err) {
  console.error("\n❌ Setup failed:", err.message);
  process.exit(1);
}
