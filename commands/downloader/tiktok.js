const { execFile } = require("child_process");
const fs = require("fs");
const path = require("path");
const os = require("os");

const YTDLP_PATH = "D:\\project\\botTele\\yt-dlp.exe";
const MAX_SIZE = 50 * 1024 * 1024;

const FLAGS = ["--no-check-certificate", "--no-playlist", "--quiet"];

function ytdlp(args) {
  return new Promise((resolve, reject) => {
    execFile(YTDLP_PATH, [...FLAGS, ...args], (err, stdout, stderr) => {
      if (err) return reject(new Error(stderr || err.message));
      resolve(stdout.trim());
    });
  });
}

module.exports = {
  name: "tt",
  alias: ["tiktok"],
  category: "public",
  description: "Download TikTok video (yt-dlp)",
  usage: "/tt <url>",
  useLimit: true,

  async run({ bot, chatId, fullArgs }) {
    if (!fullArgs) {
      return bot.sendMessage(
        chatId,
        "❌ Masukkan URL TikTok!\nContoh: /tt https://vt.tiktok.com/xxxx",
      );
    }

    const url = fullArgs.trim();

    if (!url.includes("tiktok.com")) {
      return bot.sendMessage(chatId, "❌ URL harus dari TikTok!");
    }

    const statusMsg = await bot.sendMessage(
      chatId,
      "⏳ Mengambil info TikTok...",
    );

    const tmpFile = path.join(os.tmpdir(), `tt_${Date.now()}.mp4`);

    try {
      // 1. ambil metadata
      let title = "TikTok Video";
      try {
        title = await ytdlp(["--print", "%(title)s", url]);
      } catch {}

      await bot.editMessageText(`⬇️ Downloading: ${title.slice(0, 60)}...`, {
        chat_id: chatId,
        message_id: statusMsg.message_id,
      });

      // 2. download video
      await ytdlp([url, "-f", "best[ext=mp4]/best", "-o", tmpFile]);

      if (!fs.existsSync(tmpFile)) {
        throw new Error("File tidak berhasil dibuat");
      }

      // 3. cek size
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

      await bot.editMessageText("📤 Mengirim video...", {
        chat_id: chatId,
        message_id: statusMsg.message_id,
      });

      // 4. kirim video
      await bot.sendVideo(chatId, tmpFile, {
        caption: `🎵 ${title}`,
      });

      // 5. cleanup
      await bot.deleteMessage(chatId, statusMsg.message_id).catch(() => {});
      fs.unlinkSync(tmpFile);
    } catch (err) {
      console.error("TT ERROR:", err);

      await bot
        .editMessageText(
          `❌ Gagal download:\n${String(err.message).slice(0, 150)}`,
          {
            chat_id: chatId,
            message_id: statusMsg.message_id,
          },
        )
        .catch(() => {});
    } finally {
      if (fs.existsSync(tmpFile)) fs.unlinkSync(tmpFile);
    }
  },
};
