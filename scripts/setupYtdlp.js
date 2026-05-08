const https = require("https");
const fs = require("fs");
const path = require("path");
const os = require("os");

const BIN_DIR = path.join(process.cwd(), "bin");

if (!fs.existsSync(BIN_DIR)) {
  fs.mkdirSync(BIN_DIR, { recursive: true });
}

function getBinaryInfo() {
  const platform = os.platform();

  if (platform === "win32") {
    return {
      url: "https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp.exe",
      file: "yt-dlp.exe",
    };
  }

  if (platform === "linux") {
    return {
      url: "https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp",
      file: "yt-dlp",
    };
  }

  if (platform === "darwin") {
    return {
      url: "https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp_macos",
      file: "yt-dlp",
    };
  }

  throw new Error(`OS tidak didukung: ${platform}`);
}

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);

    https
      .get(url, (res) => {
        if (
          res.statusCode >= 300 &&
          res.statusCode < 400 &&
          res.headers.location
        ) {
          file.close();
          fs.unlinkSync(dest);
          return download(res.headers.location, dest)
            .then(resolve)
            .catch(reject);
        }

        if (res.statusCode !== 200) {
          return reject(new Error(`HTTP ${res.statusCode}`));
        }

        res.pipe(file);

        file.on("finish", () => {
          file.close(resolve);
        });
      })
      .on("error", reject);
  });
}

(async () => {
  try {
    const { url, file } = getBinaryInfo();
    const out = path.join(BIN_DIR, file);

    if (fs.existsSync(out)) {
      console.log("✓ yt-dlp already exists");
      process.exit(0);
    }

    console.log("Downloading yt-dlp...");
    await download(url, out);

    if (os.platform() !== "win32") {
      fs.chmodSync(out, 0o755);
    }

    console.log("✓ yt-dlp installed:", out);
  } catch (err) {
    console.error("Failed install yt-dlp:", err.message);
    process.exit(1);
  }
})();
