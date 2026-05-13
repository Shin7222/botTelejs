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

    const isAudio = command === "ytmp3" || command === "ytaudio";

    const statusMsg = await bot.sendMessage(
      chatId,
      "⏳ Mengambil info video...",
    );

    const ext = isAudio ? "mp3" : "mp4";

    const tmpFile = path.join(os.tmpdir(), `yt_${Date.now()}.${ext}`);

    try {
      // =========================
      // GET INFO
      // =========================
      const info = await getInfo(url);

      const title = (info.title || "YouTube Video")
        .replace(/[<>:"/\\|?*]/g, "")
        .trim();

      const duration = Number(info.duration || 0);

      // =========================
      // DURATION LIMIT
      // =========================
      if (duration > MAX_DURATION) {
        return bot.editMessageText(
          `❌ Durasi terlalu panjang (${Math.floor(
            duration / 60,
          )} menit)\nMaksimal 10 menit.`,
          {
            chat_id: chatId,
            message_id: statusMsg.message_id,
          },
        );
      }

      // =========================
      // DOWNLOAD PROGRESS
      // =========================
      let lastUpdate = 0;
      let lastPercent = "0";

      const progressCallback = async (text) => {
        try {
          const match = text.match(/(\d+(?:\.\d+)?)%/);

          if (!match) return;

          const percent = match[1];

          // skip duplicate
          if (percent === lastPercent) return;

          // anti spam
          if (Date.now() - lastUpdate < 2500) return;

          lastPercent = percent;
          lastUpdate = Date.now();

          // progress bar
          const progressNum = Math.floor(Number(percent) / 10);

          const bar = "█".repeat(progressNum) + "░".repeat(10 - progressNum);

          await bot.editMessageText(
            `⬇️ Downloading...\n\n` +
              `🎬 ${title.slice(0, 40)}\n\n` +
              `${bar} ${percent}%`,
            {
              chat_id: chatId,
              message_id: statusMsg.message_id,
            },
          );
        } catch {}
      };

      // =========================
      // DOWNLOAD
      // =========================
      if (isAudio) {
        await downloadAudio(url, tmpFile, progressCallback);
      } else {
        await downloadVideo(url, tmpFile, progressCallback);
      }

      // =========================
      // CHECK FILE
      // =========================
      if (!fs.existsSync(tmpFile)) {
        throw new Error("File gagal dibuat");
      }

      const size = fs.statSync(tmpFile).size;

      // =========================
      // SIZE LIMIT
      // =========================
      if (size > MAX_SIZE) {
        fs.unlinkSync(tmpFile);

        return bot.editMessageText(
          `❌ File terlalu besar (${(size / 1024 / 1024).toFixed(
            1,
          )}MB)\nMaksimal 50MB.`,
          {
            chat_id: chatId,
            message_id: statusMsg.message_id,
          },
        );
      }

      // =========================
      // SENDING
      // =========================
      await bot.editMessageText("📤 Mengirim file...", {
        chat_id: chatId,
        message_id: statusMsg.message_id,
      });

      // =========================
      // SEND FILE
      // =========================
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

      // =========================
      // DELETE STATUS
      // =========================
      await bot.deleteMessage(chatId, statusMsg.message_id).catch(() => {});
    } catch (err) {
      console.error("YT ERROR:", err);

      await bot
        .editMessageText(
          `❌ Gagal download\n\n${String(err.message).slice(0, 200)}`,
          {
            chat_id: chatId,
            message_id: statusMsg.message_id,
          },
        )
        .catch(() => {});
    } finally {
      // =========================
      // CLEANUP
      // =========================
      if (fs.existsSync(tmpFile)) {
        try {
          fs.unlinkSync(tmpFile);
        } catch {}
      }
    }
  },
};
