const fs = require("fs");
const path = require("path");
const os = require("os");
const { getInfo, downloadVideo } = require("../../utils/ytdlp");

const MAX_SIZE = Number(process.env.MAX_FILE_SIZE || 50 * 1024 * 1024);

module.exports = {
  name: "tt",
  alias: ["tiktok"],
  category: "public",
  description: "Download video TikTok tanpa watermark",
  usage: "/tt <url>",
  useLimit: true,

  async run({ bot, chatId, fullArgs }) {
    const url = fullArgs?.trim();

    if (!url) {
      return bot.sendMessage(
        chatId,
        "❌ Masukkan URL TikTok!\n\nContoh:\n/tt https://vt.tiktok.com/xxxx",
      );
    }

    if (!url.includes("tiktok.com")) {
      return bot.sendMessage(chatId, "❌ URL harus dari TikTok!");
    }

    const statusMsg = await bot.sendMessage(
      chatId,
      "⏳ Mengambil video TikTok...",
    );

    const tmpFile = path.join(os.tmpdir(), `tt_${Date.now()}.mp4`);

    try {
      const info = await getInfo(url);

      const title = (info.title || "TikTok Video")
        .replace(/[<>:"/\\|?*]/g, "")
        .trim();

      await bot.editMessageText(`⬇️ Mendownload:\n${title.slice(0, 60)}...`, {
        chat_id: chatId,
        message_id: statusMsg.message_id,
      });

      await downloadVideo(url, tmpFile);

      const size = fs.statSync(tmpFile).size;

      if (size > MAX_SIZE) {
        fs.unlinkSync(tmpFile);

        return bot.editMessageText(
          `❌ File terlalu besar (${(size / 1024 / 1024).toFixed(1)}MB)`,
          {
            chat_id: chatId,
            message_id: statusMsg.message_id,
          },
        );
      }

      await bot.sendVideo(chatId, tmpFile, {
        caption: `🎵 ${title}`,
      });

      await bot.deleteMessage(chatId, statusMsg.message_id).catch(() => {});
    } catch (err) {
      console.error("TT ERROR:", err);

      await bot.editMessageText(
        `❌ Gagal download\n${String(err.message).slice(0, 150)}`,
        {
          chat_id: chatId,
          message_id: statusMsg.message_id,
        },
      );
    } finally {
      if (fs.existsSync(tmpFile)) fs.unlinkSync(tmpFile);
    }
  },
};
