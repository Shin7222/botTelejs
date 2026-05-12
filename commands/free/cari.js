const https = require("https");

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, { headers: { Accept: "application/json" } }, (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          try {
            resolve(JSON.parse(data));
          } catch {
            reject(new Error("Gagal parse response"));
          }
        });
      })
      .on("error", reject);
  });
}

module.exports = {
  name: "cari",
  alias: ["search"],
  category: "public",
  description: "Cari definisi kata (bahasa Inggris)",
  usage: "/cari <kata>  contoh: /cari algorithm",
  useLimit: true,

  async run({ bot, chatId, fullArgs }) {
    if (!fullArgs) {
      return bot.sendMessage(
        chatId,
        "❌ Masukkan kata yang ingin dicari!\n\nContoh: `/cari algorithm`",
        { parse_mode: "Markdown" },
      );
    }

    const kata = fullArgs.trim().toLowerCase();
    const loadingMsg = await bot.sendMessage(
      chatId,
      `🔍 Mencari *"${kata}"*...`,
      { parse_mode: "Markdown" },
    );

    const data = await fetchJson(
      `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(kata)}`,
    );

    if (data.title === "No Definitions Found") {
      return bot.editMessageText(`❌ Kata *"${kata}"* tidak ditemukan.`, {
        chat_id: chatId,
        message_id: loadingMsg.message_id,
        parse_mode: "Markdown",
      });
    }

    const entry = data[0];
    const phonetic = entry.phonetic || entry.phonetics?.[0]?.text || "";
    const meanings = entry.meanings.slice(0, 2); // Ambil max 2 part of speech

    let hasil = `📖 *${entry.word}* ${phonetic ? `_(${phonetic})_` : ""}\n\n`;

    for (const m of meanings) {
      hasil += `*${m.partOfSpeech}*\n`;
      const defs = m.definitions.slice(0, 2);
      for (const [i, d] of defs.entries()) {
        hasil += `${i + 1}. ${d.definition}\n`;
        if (d.example) hasil += `   _Contoh: "${d.example}"_\n`;
      }
      hasil += "\n";
    }

    await bot.editMessageText(hasil.trim(), {
      chat_id: chatId,
      message_id: loadingMsg.message_id,
      parse_mode: "Markdown",
    });
  },
};
