const { execFile } = require("child_process");
const fs = require("fs");
const path = require("path");
const os = require("os");

const YTDLP_PATH =
  os.platform() === "win32"
    ? path.join(process.cwd(), "bin", "yt-dlp.exe")
    : path.join(process.cwd(), "bin", "yt-dlp");

const MAX_SIZE = 50 * 1024 * 1024; // 50MB
const MAX_DURATION = 600; // 10 menit

function runYtDlp(args) {
  return new Promise((resolve, reject) => {
    execFile(YTDLP_PATH, args, (error, stdout, stderr) => {
      if (error) return reject(stderr || error.message);
      resolve(stdout);
    });
  });
}

module.exports = {
  name: "yt",
  alias: ["youtube", "ytmp3", "ytmp4"],
  category: "public",
  description: "Download YouTube video/audio (yt-dlp.exe)",
  usage: "/yt <url> | /ytmp3 <url>",
  useLimit: true,

  async run({ bot, chatId, msg, fullArgs }) {
    const url = fullArgs ? fullArgs.trim() : "";

    if (!url) {
      return bot.sendMessage(
        chatId,
        "❌ Masukkan URL YouTube!\nContoh: /yt https://youtube.com/watch?v=xxxx",
      );
    }

    const command = msg.text.split(" ")[0].replace("/", "").toLowerCase();
    const isAudio = command === "ytmp3";

    const statusMsg = await bot.sendMessage(
      chatId,
      "⏳ Mengambil info video...",
    );

    let tmpFile;

    try {
      // 1. Ambil metadata video (JSON)
      const infoRaw = await runYtDlp([url, "--dump-json", "--no-playlist"]);

      const info = JSON.parse(infoRaw);

      const title = (info.title || "video").replace(/[<>:"/\\|?*]/g, "").trim();

      const duration = info.duration || 0;

      // 2. validasi durasi
      if (duration > MAX_DURATION) {
        return bot.editMessageText(
          `❌ Durasi terlalu panjang: ${Math.floor(duration / 60)} menit\nMaksimal 10 menit.`,
          {
            chat_id: chatId,
            message_id: statusMsg.message_id,
          },
        );
      }

      await bot.editMessageText(`⬇️ Downloading: ${title.slice(0, 50)}...`, {
        chat_id: chatId,
        message_id: statusMsg.message_id,
      });

      // 3. file temp
      tmpFile = path.join(
        os.tmpdir(),
        `yt_${Date.now()}.${isAudio ? "mp3" : "mp4"}`,
      );

      // 4. download video/audio
      const format = isAudio ? "bestaudio/best" : "best[ext=mp4]/best";

      await runYtDlp([url, "-f", format, "-o", tmpFile, "--no-playlist"]);

      // 5. cek file size
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

      await bot.editMessageText("📤 Mengirim file ke Telegram...", {
        chat_id: chatId,
        message_id: statusMsg.message_id,
      });

      // 6. kirim ke telegram
      if (isAudio) {
        await bot.sendAudio(chatId, tmpFile, {
          caption: `🎵 ${title}`,
        });
      } else {
        await bot.sendVideo(chatId, tmpFile, {
          caption: `🎬 ${title}`,
        });
      }

      // 7. cleanup
      fs.unlinkSync(tmpFile);
      await bot.deleteMessage(chatId, statusMsg.message_id).catch(() => {});
    } catch (err) {
      console.error("YT ERROR:", err);

      if (tmpFile && fs.existsSync(tmpFile)) {
        fs.unlinkSync(tmpFile);
      }

      await bot
        .editMessageText(`❌ Error: ${String(err).slice(0, 120)}`, {
          chat_id: chatId,
          message_id: statusMsg.message_id,
        })
        .catch(() => {});
    }
  },
};
