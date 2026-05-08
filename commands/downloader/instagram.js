const { execFile } = require("child_process");
const fs = require("fs");
const path = require("path");
const os = require("os");

const YTDLP_PATH = "D:\\project\\botTele\\yt-dlp.exe";
const MAX_SIZE = 50 * 1024 * 1024;

function runYtDlp(args) {
  return new Promise((resolve, reject) => {
    execFile(YTDLP_PATH, args, (err, stdout, stderr) => {
      if (err) return reject(stderr || err.message);
      resolve(stdout);
    });
  });
}

module.exports = {
  name: "ig",
  alias: ["instagram", "reels"],
  category: "public",
  description: "Download Instagram Reels/Post (yt-dlp)",
  usage: "/ig <url>",
  useLimit: true,

  async run({ bot, chatId, fullArgs }) {
    if (!fullArgs) {
      return bot.sendMessage(
        chatId,
        "❌ Masukkan URL Instagram!\nContoh: /ig https://www.instagram.com/reel/xxxx",
      );
    }

    const url = fullArgs.trim();

    if (!url.includes("instagram.com")) {
      return bot.sendMessage(chatId, "❌ URL harus dari Instagram!");
    }

    const statusMsg = await bot.sendMessage(
      chatId,
      "⏳ Mengambil konten Instagram...",
    );

    const tmpFile = path.join(os.tmpdir(), `ig_${Date.now()}.mp4`);

    try {
      // 1. ambil title (optional)
      let title = "Instagram Content";
      try {
        title = await runYtDlp([url, "--print", "%(title)s"]);
      } catch {}

      await bot.editMessageText(`⬇️ Downloading: ${title.slice(0, 60)}...`, {
        chat_id: chatId,
        message_id: statusMsg.message_id,
      });

      // 2. download
      await runYtDlp([url, "-f", "best", "-o", tmpFile]);

      if (!fs.existsSync(tmpFile)) {
        throw new Error("File tidak berhasil dibuat");
      }

      // 3. size check
      const size = fs.statSync(tmpFile).size;

      if (size > MAX_SIZE) {
        fs.unlinkSync(tmpFile);
        return bot.editMessageText(
          `❌ File terlalu besar: ${(size / 1024 / 1024).toFixed(1)}MB`,
          {
            chat_id: chatId,
            message_id: statusMsg.message_id,
          },
        );
      }

      await bot.editMessageText("📤 Mengirim file...", {
        chat_id: chatId,
        message_id: statusMsg.message_id,
      });

      // 4. send video
      await bot.sendVideo(chatId, tmpFile, {
        caption: `📸 Instagram\n\n${title}`,
      });

      // 5. cleanup
      await bot.deleteMessage(chatId, statusMsg.message_id).catch(() => {});
      fs.unlinkSync(tmpFile);
    } catch (err) {
      console.error("IG ERROR:", err);

      await bot
        .editMessageText(
          `❌ Gagal download:\n${String(err.message).slice(0, 150)}`,
          {
            chat_id: chatId,
            message_id: statusMsg.message_id,
          },
        )
        .catch(() => {});

      if (fs.existsSync(tmpFile)) fs.unlinkSync(tmpFile);
    }
  },
};
