const https = require("https");

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { "Accept": "application/json" } }, (res) => {
      let data = "";
      res.on("data", chunk => data += chunk);
      res.on("end", () => {
        try { resolve(JSON.parse(data)); }
        catch { reject(new Error("Gagal parse response")); }
      });
    }).on("error", reject);
  });
}

module.exports = {
  name: "random",
  alias: ["acak"],
  category: "public",
  description: "Quote atau joke acak",
  usage: "/random quote | /random joke",
  useLimit: true,

  async run({ bot, chatId, fullArgs }) {
    const tipe = (fullArgs || "quote").toLowerCase().trim();

    if (tipe === "joke") {
      // jokeapi.dev — masih aktif
      const data = await fetchJson(
        "https://v2.jokeapi.dev/joke/Any?blacklistFlags=nsfw,racist,sexist&type=single"
      );

      if (data.error) throw new Error("Gagal ambil joke");

      await bot.sendMessage(chatId, `
😂 *Joke Acak*

${data.joke}

_Kategori: ${data.category}_
      `.trim(), { parse_mode: "Markdown" });

    } else {
      // zenquotes.io — pengganti quotable.io, gratis & aktif
      const data = await fetchJson("https://zenquotes.io/api/random");
      const quote = Array.isArray(data) ? data[0] : null;

      if (!quote || !quote.q) throw new Error("Gagal ambil quote");

      await bot.sendMessage(chatId, `
💬 *Quote Acak*

_"${quote.q}"_

— *${quote.a}*
      `.trim(), { parse_mode: "Markdown" });
    }
  },
};