const fs = require("fs");
const path = require("path");
const os = require("os");
const { getInfo, downloadVideo } = require("../../utils/ytdlp");

const MAX_SIZE = Number(process.env.MAX_FILE_SIZE || 50 * 1024 * 1024);

module.exports = {
  name: "ig",
  alias: ["instagram", "reels"],
  category: "public",
  description: "Download Instagram Post / Reels",
  usage: "/ig <url>",
  useLimit: true,

  async run({ bot, chatId, fullArgs }) {
    const url = fullArgs?.trim();

    if (!url) {
      return bot.sendMessage(
        chatId,
        "❌ Masukkan URL Instagram!\n\nContoh:\n/ig https://www.instagram.com/reel/xxxx",
      );
    }

    if (!url.includes("instagram.com")) {
      return bot.sendMessage(chatId, "❌ URL harus dari Instagram!");
    }

    const statusMsg = await bot.sendMessage(
      chatId,
      "⏳ Mengambil konten Instagram...",
    );

    const tmpFile = path.join(os.tmpdir(), `ig_${Date.now()}.mp4`);

    try {
      const info = await getInfo(url);

      const title = (info.title || "Instagram Video")
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
        caption: `📸 ${title}`,
      });

      await bot.deleteMessage(chatId, statusMsg.message_id).catch(() => {});
    } catch (err) {
      console.error("IG ERROR:", err);

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
