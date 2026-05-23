module.exports = {
  name: "randomanime",
  alias: ["anime", "neko"],
  category: "anime",
  description: "Random anime image by tag",
  usage: "/randomanime [tag]",

  async run({ bot, chatId, args }) {
    try {
      const tag = args?.[0] || "maid";

      const msg = await bot.sendMessage(
        chatId,
        `🎌 Mengambil gambar anime [${tag}]...`,
      );

      const apiResponse = await fetch(
        `https://api.waifu.im/images?included_tags=${encodeURIComponent(tag)}`,
      );

      if (apiResponse.status === 404 || apiResponse.status === 400) {
        await bot.deleteMessage(chatId, msg.message_id).catch(() => {});
        return bot.sendMessage(
          chatId,
          `❌ Tag *"${tag}"* tidak ditemukan.\n\n` +
            `📋 *Tag yang tersedia:*\n` +
            `maid, uniform, selfies, ass, milf, oral, paizuri, hentai`,
          { parse_mode: "Markdown" },
        );
      }

      if (!apiResponse.ok) {
        throw new Error(`API error: ${apiResponse.status}`);
      }

      const data = await apiResponse.json();
      const imageData = data?.items?.[0];

      if (!imageData?.url) {
        throw new Error("Gambar tidak ditemukan dalam respons API.");
      }

      const imgResponse = await fetch(imageData.url);

      if (!imgResponse.ok) {
        throw new Error(`Gagal download gambar: ${imgResponse.status}`);
      }

      const buffer = Buffer.from(await imgResponse.arrayBuffer());

      const caption =
        `✨ Random Anime — *${tag}*\n` +
        `🔗 Source: ${imageData.source || "Unknown"}`;

      const MAX_PHOTO_SIZE = 10 * 1024 * 1024; // 10MB

      if (buffer.length > MAX_PHOTO_SIZE) {
        await bot.sendDocument(
          chatId,
          buffer,
          {
            caption,
            parse_mode: "Markdown",
          },
          {
            filename: `anime_${tag}.jpg`,
            contentType: "image/jpeg",
          },
        );
      } else {
        await bot.sendPhoto(chatId, buffer, {
          caption,
          parse_mode: "Markdown",
        });
      }

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
