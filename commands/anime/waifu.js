const axios = require("axios");

module.exports = {
  name: "waifu",
  alias: ["anime"],
  category: "anime",
  description: "Random anime image",
  usage: "/waifu",
  useLimit: true,

  async run({ bot, chatId }) {
    try {
      const msg = await bot.sendMessage(chatId, "🎌 Mengambil gambar anime...");

      // Menggunakan API nekos.best yang bebas blokir Cloudflare
      const api = await axios.get("https://nekos.best/api/v2/waifu", {
        timeout: 10000,
      });

      const imageData = api.data?.results?.[0];

      if (!imageData?.url) {
        throw new Error("Gambar tidak ditemukan dalam respons API.");
      }

      // Kirim langsung URL gambarnya ke Telegram (Lebih hemat RAM server kamu)
      await bot.sendPhoto(chatId, imageData.url, {
        caption: `✨ Random Anime Waifu\n🎨 Artist: ${imageData.artist_name || "Unknown"}`,
      });

      // Hapus pesan loading
      await bot.deleteMessage(chatId, msg.message_id).catch(() => {});
    } catch (err) {
      console.error("WAIFU ERROR:", err);

      await bot.sendMessage(
        chatId,
        `❌ Gagal mengambil gambar anime\n\n${String(err.message).slice(0, 120)}`,
      );
    }
  },
};
