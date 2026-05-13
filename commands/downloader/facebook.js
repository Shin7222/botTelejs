const axios = require("axios");
const path = require("path");
const os = require("os");
const fs = require("fs");

const MAX_SIZE = 50 * 1024 * 1024; // 50MB

module.exports = {
  name: "fb",
  alias: ["facebook", "fbdl"],
  category: "public",
  description: "Download video Facebook",
  usage: "/fb <URL>",
  useLimit: true,

  async run({ bot, chatId, msg, fullArgs }) {
    if (!fullArgs) {
      return bot.sendMessage(
        chatId,
        `
❌ Masukkan URL Facebook!

*Contoh:*
\`/fb https://www.facebook.com/video.php?v=xxxxx\`
\`/fb https://fb.watch/xxxxx\`
      `.trim(),
        { parse_mode: "Markdown" },
      );
    }

    const url = fullArgs.trim();

    if (!url.includes("facebook.com") && !url.includes("fb.watch")) {
      return bot.sendMessage(chatId, "❌ URL harus dari Facebook!");
    }

    const statusMsg = await bot.sendMessage(
      chatId,
      "⏳ Mengambil info video Facebook...",
    );

    try {
      // Ambil video info via API
      const videoInfo = await this.getVideoInfo(url);

      if (!videoInfo || !videoInfo.url) {
        return bot.editMessageText(
          "❌ Gagal mengambil video. Pastikan URL valid dan video tidak private.",
          { chat_id: chatId, message_id: statusMsg.message_id },
        );
      }

      const videoUrl = videoInfo.url;
      const title = videoInfo.title || "Facebook Video";

      await bot.editMessageText(`⬇️ Mendownload *${title}*...`, {
        chat_id: chatId,
        message_id: statusMsg.message_id,
        parse_mode: "Markdown",
      });

      // Download file
      const tmpFile = path.join(os.tmpdir(), `fb_${Date.now()}.mp4`);
      await this.downloadFile(videoUrl, tmpFile);

      // Cek ukuran
      const { size } = fs.statSync(tmpFile);
      if (size > MAX_SIZE) {
        fs.unlinkSync(tmpFile);
        return bot.editMessageText(
          `❌ File terlalu besar (${(size / 1024 / 1024).toFixed(1)}MB). Maksimal 50MB.`,
          { chat_id: chatId, message_id: statusMsg.message_id },
        );
      }

      await bot.editMessageText("📤 Mengirim video...", {
        chat_id: chatId,
        message_id: statusMsg.message_id,
      });

      await bot.sendVideo(chatId, tmpFile, {
        caption: `📘 *${title}*`,
        parse_mode: "Markdown",
      });

      await bot.deleteMessage(chatId, statusMsg.message_id).catch(() => {});
    } catch (err) {
      await bot
        .editMessageText(
          `❌ Gagal download:\n\`${err.message.slice(0, 150)}\``,
          {
            chat_id: chatId,
            message_id: statusMsg.message_id,
            parse_mode: "Markdown",
          },
        )
        .catch(() => {});
    } finally {
      const tmpFile = path.join(os.tmpdir(), `fb_${Date.now()}.mp4`);
      if (fs.existsSync(tmpFile)) fs.unlinkSync(tmpFile);
    }
  },

  async getVideoInfo(url) {
    try {
      // Try API 1: fbdown.net
      try {
        const response = await axios.post(
          "https://fbdown.net/api/v1/video",
          {
            url: url,
          },
          {
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
            timeout: 15000,
          },
        );

        if (response.data?.result?.url) {
          return {
            url: response.data.result.url,
            title: response.data.result.title || "Facebook Video",
          };
        }
      } catch {}

      // Try API 2: saveface.tv
      try {
        const response = await axios.get(
          "https://api.savefacebook.net/api/video",
          {
            params: { url: url },
            timeout: 15000,
          },
        );

        if (response.data?.video) {
          return {
            url: response.data.video,
            title: "Facebook Video",
          };
        }
      } catch {}

      // Try API 3: facebook-api
      try {
        const response = await axios.get("https://fbapi.dapaink.com", {
          params: { url: url },
          timeout: 15000,
        });

        if (response.data?.url) {
          return {
            url: response.data.url,
            title: response.data.title || "Facebook Video",
          };
        }
      } catch {}

      throw new Error("Semua API gagal");
    } catch (err) {
      throw new Error(`Gagal mendapatkan info video: ${err.message}`);
    }
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
