const axios = require("axios");
const path = require("path");
const os = require("os");
const fs = require("fs");

const MAX_SIZE = 50 * 1024 * 1024;

module.exports = {
  name: "tw",
  alias: ["twitter", "x", "tweet"],
  category: "public",
  description: "Download video/foto dari Twitter/X",
  usage: "/tw <URL>",
  useLimit: true,

  async run({ bot, chatId, msg, fullArgs }) {
    if (!fullArgs) {
      return bot.sendMessage(
        chatId,
        `
❌ Masukkan URL Twitter/X!

*Contoh:*
\`/tw https://twitter.com/user/status/1234567890\`
\`/tw https://x.com/user/status/1234567890\`
      `.trim(),
        { parse_mode: "Markdown" },
      );
    }

    const url = fullArgs.trim();

    if (!url.includes("twitter.com") && !url.includes("x.com")) {
      return bot.sendMessage(chatId, "❌ URL harus dari Twitter/X!");
    }

    const statusMsg = await bot.sendMessage(chatId, "⏳ Mengambil tweet...");

    try {
      const mediaInfo = await this.getMedia(url);

      if (!mediaInfo || !mediaInfo.url) {
        return bot.editMessageText(
          "❌ Gagal mengambil media. Pastikan URL valid dan tweet tidak private.",
          { chat_id: chatId, message_id: statusMsg.message_id },
        );
      }

      await bot.editMessageText(`⬇️ Mendownload...`, {
        chat_id: chatId,
        message_id: statusMsg.message_id,
      });

      const tmpFile = path.join(
        os.tmpdir(),
        `tw_${Date.now()}.${mediaInfo.ext}`,
      );
      await this.downloadFile(mediaInfo.url, tmpFile);

      const { size } = fs.statSync(tmpFile);
      if (size > MAX_SIZE) {
        fs.unlinkSync(tmpFile);
        return bot.editMessageText(
          `❌ File terlalu besar (${(size / 1024 / 1024).toFixed(1)}MB). Maksimal 50MB.`,
          { chat_id: chatId, message_id: statusMsg.message_id },
        );
      }

      await bot.editMessageText("📤 Mengirim...", {
        chat_id: chatId,
        message_id: statusMsg.message_id,
      });

      if (mediaInfo.type === "video") {
        await bot.sendVideo(chatId, tmpFile, {
          caption: `🐦 *Twitter/X Video*`,
          parse_mode: "Markdown",
        });
      } else {
        await bot.sendPhoto(chatId, tmpFile, {
          caption: `🐦 *Twitter/X Foto*`,
          parse_mode: "Markdown",
        });
      }

      await bot.deleteMessage(chatId, statusMsg.message_id).catch(() => {});
    } catch (err) {
      await bot
        .editMessageText(`❌ Error: ${err.message.slice(0, 100)}`, {
          chat_id: chatId,
          message_id: statusMsg.message_id,
        })
        .catch(() => {});
    } finally {
      const tmpFile = path.join(os.tmpdir(), `tw_${Date.now()}.*`);
      // Cleanup
      fs.readdirSync(os.tmpdir())
        .filter((f) => f.startsWith("tw_"))
        .forEach((f) => {
          try {
            fs.unlinkSync(path.join(os.tmpdir(), f));
          } catch {}
        });
    }
  },

  async getMedia(url) {
    try {
      // API 1: twitsave.com
      try {
        const response = await axios.post(
          "https://twitsave.com/info",
          {
            url: url,
          },
          {
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            timeout: 15000,
          },
        );

        const html = response.data;
        const videoMatch = html.match(/href="(https:\/\/[^"]*\.mp4)"/);
        const photoMatch = html.match(
          /href="(https:\/\/[^"]*(?:jpg|jpeg|png|webp))"/,
        );

        if (videoMatch) {
          return { url: videoMatch[1], type: "video", ext: "mp4" };
        }
        if (photoMatch) {
          return { url: photoMatch[1], type: "photo", ext: "jpg" };
        }
      } catch {}

      // API 2: twitter-video-downloader
      try {
        const response = await axios.get("https://api.twitter.com/2/tweets", {
          params: { ids: this.extractTweetId(url) },
          headers: { Authorization: "Bearer fake" },
          timeout: 10000,
        });

        if (response.data?.data?.[0]?.attachments?.media_keys) {
          return { url: "", type: "video", ext: "mp4" };
        }
      } catch {}

      // API 3: nitter (public Twitter alternative)
      try {
        const tweetUrl = url
          .replace("twitter.com", "nitter.net")
          .replace("x.com", "nitter.net");
        const response = await axios.get(tweetUrl, { timeout: 15000 });

        const videoMatch = response.data.match(/src="([^"]*video[^"]*)"/);
        if (videoMatch) {
          return { url: videoMatch[1], type: "video", ext: "mp4" };
        }
      } catch {}

      throw new Error("Semua API gagal");
    } catch (err) {
      throw new Error(`Gagal get media: ${err.message}`);
    }
  },

  extractTweetId(url) {
    const match = url.match(/status\/(\d+)/);
    return match ? match[1] : null;
  },

  async downloadFile(url, dest) {
    return new Promise((resolve, reject) => {
      const file = fs.createWriteStream(dest);

      axios
        .get(url, {
          responseType: "stream",
          timeout: 60000,
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          },
        })
        .then((response) => {
          response.data.pipe(file);
          file.on("finish", () => file.close(resolve));
        })
        .catch((err) => {
          fs.unlink(dest, () => {});
          reject(err);
        });
    });
  },
};
