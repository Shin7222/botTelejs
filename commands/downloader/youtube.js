const fs = require("fs");
const path = require("path");
const os = require("os");
const { getInfo, downloadVideo, downloadAudio } = require("../../utils/ytdlp");

const MAX_SIZE = Number(process.env.MAX_FILE_SIZE || 50 * 1024 * 1024);
const MAX_DURATION = Number(process.env.MAX_DURATION || 600);

module.exports = {
  name: "yt",
  alias: ["youtube", "ytmp3", "ytmp4"],
  category: "public",
  description: "Download YouTube video/audio",
  usage: "/yt <url> | /ytmp3 <url>",
  useLimit: true,

  async run({ bot, chatId, msg, fullArgs }) {
    const url = fullArgs?.trim();

    if (!url) {
      return bot.sendMessage(
        chatId,
        "❌ Masukkan URL YouTube!\n\nContoh:\n/yt https://youtu.be/xxxx\n/ytmp3 https://youtu.be/xxxx",
      );
    }

    if (!url.includes("youtube.com") && !url.includes("youtu.be")) {
      return bot.sendMessage(chatId, "❌ URL harus dari YouTube!");
    }

    const command = msg.text.split(" ")[0].replace("/", "").toLowerCase();
    const isAudio = command === "ytmp3";

    const statusMsg = await bot.sendMessage(
      chatId,
      "⏳ Mengambil info video...",
    );

    const ext = isAudio ? "mp3" : "mp4";
    const tmpFile = path.join(os.tmpdir(), `yt_${Date.now()}.${ext}`);

    try {
      const info = await getInfo(url);

      const title = (info.title || "YouTube Video")
        .replace(/[<>:"/\\|?*]/g, "")
        .trim();

      const duration = Number(info.duration || 0);

      if (duration > MAX_DURATION) {
        return bot.editMessageText(
          `❌ Durasi terlalu panjang (${Math.floor(duration / 60)} menit)\nMaksimal 10 menit.`,
          {
            chat_id: chatId,
            message_id: statusMsg.message_id,
          },
        );
      }

      await bot.editMessageText(`⬇️ Mendownload:\n${title.slice(0, 60)}...`, {
        chat_id: chatId,
        message_id: statusMsg.message_id,
      });

      if (isAudio) {
        await downloadAudio(url, tmpFile);
      } else {
        await downloadVideo(url, tmpFile);
      }

      if (!fs.existsSync(tmpFile)) {
        throw new Error("File gagal dibuat");
      }

      const size = fs.statSync(tmpFile).size;

      if (size > MAX_SIZE) {
        fs.unlinkSync(tmpFile);

        return bot.editMessageText(
          `❌ File terlalu besar (${(size / 1024 / 1024).toFixed(1)}MB)\nMaksimal 50MB.`,
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

      if (isAudio) {
        await bot.sendAudio(chatId, tmpFile, {
          title,
          caption: `🎵 ${title}`,
        });
      } else {
        await bot.sendVideo(chatId, tmpFile, {
          caption: `🎬 ${title}`,
        });
      }

      await bot.deleteMessage(chatId, statusMsg.message_id).catch(() => {});
    } catch (err) {
      console.error("YT ERROR:", err);

      await bot
        .editMessageText(
          `❌ Gagal download\n${String(err.message).slice(0, 150)}`,
          {
            chat_id: chatId,
            message_id: statusMsg.message_id,
          },
        )
        .catch(() => {});
    } finally {
      if (fs.existsSync(tmpFile)) {
        try {
          fs.unlinkSync(tmpFile);
        } catch {}
      }
    }
  },
};
