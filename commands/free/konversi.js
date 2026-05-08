module.exports = {
  name: "konversi",
  alias: ["convert", "ubah"],
  category: "public",
  description: "Konversi mata uang dan satuan",
  usage: "/konversi <nilai> <dari> <ke>  contoh: /konversi 100 usd idr",
  useLimit: true,

  async run({ bot, chatId, args, fullArgs }) {
    if (!fullArgs) {
      return bot.sendMessage(
        chatId,
        `
❌ Format salah!

*Mata uang:*
\`/konversi 100 usd idr\`
\`/konversi 50 eur usd\`

*Suhu:*
\`/konversi 100 c f\`
\`/konversi 212 f c\`
\`/konversi 300 k c\`

*Jarak:*
\`/konversi 10 km m\`
\`/konversi 5 mi km\`

*Berat:*
\`/konversi 70 kg lb\`
\`/konversi 154 lb kg\`
      `.trim(),
        { parse_mode: "Markdown" },
      );
    }

    const [nilaiStr, dari, ke] = args;
    const nilai = parseFloat(nilaiStr);

    if (isNaN(nilai) || !dari || !ke) {
      return bot.sendMessage(
        chatId,
        "❌ Format: `/konversi <nilai> <dari> <ke>`",
        { parse_mode: "Markdown" },
      );
    }

    const d = dari.toLowerCase();
    const k = ke.toLowerCase();

    // ── Konversi Suhu ──────────────────────────────────────────────────────
    const suhu = konversiSuhu(nilai, d, k);
    if (suhu !== null) {
      return bot.sendMessage(
        chatId,
        `🌡️ *Konversi Suhu*\n\n\`${nilai}° ${d.toUpperCase()} = ${suhu}° ${k.toUpperCase()}\``,
        { parse_mode: "Markdown" },
      );
    }

    // ── Konversi Jarak ─────────────────────────────────────────────────────
    const jarak = konversiSatuan(nilai, d, k, JARAK);
    if (jarak !== null) {
      return bot.sendMessage(
        chatId,
        `📏 *Konversi Jarak*\n\n\`${nilai} ${d} = ${jarak} ${k}\``,
        { parse_mode: "Markdown" },
      );
    }

    // ── Konversi Berat ─────────────────────────────────────────────────────
    const berat = konversiSatuan(nilai, d, k, BERAT);
    if (berat !== null) {
      return bot.sendMessage(
        chatId,
        `⚖️ *Konversi Berat*\n\n\`${nilai} ${d} = ${berat} ${k}\``,
        { parse_mode: "Markdown" },
      );
    }

    // ── Konversi Mata Uang via API ─────────────────────────────────────────
    const matauang = await konversiMataUang(nilai, d, k);
    if (matauang !== null) {
      return bot.sendMessage(
        chatId,
        `💰 *Konversi Mata Uang*\n\n\`${nilai} ${d.toUpperCase()} = ${matauang} ${k.toUpperCase()}\`\n\n_Rate dari exchangerate-api.com_`,
        { parse_mode: "Markdown" },
      );
    }

    await bot.sendMessage(
      chatId,
      `❌ Tidak bisa mengkonversi *${d}* ke *${k}*.\n\nKetik \`/konversi\` untuk lihat format yang didukung.`,
      { parse_mode: "Markdown" },
    );
  },
};

// ── Suhu ───────────────────────────────────────────────────────────────────────
function konversiSuhu(nilai, dari, ke) {
  if (dari === "c" && ke === "f") return bulatkan((nilai * 9) / 5 + 32);
  if (dari === "f" && ke === "c") return bulatkan(((nilai - 32) * 5) / 9);
  if (dari === "c" && ke === "k") return bulatkan(nilai + 273.15);
  if (dari === "k" && ke === "c") return bulatkan(nilai - 273.15);
  if (dari === "f" && ke === "k")
    return bulatkan(((nilai - 32) * 5) / 9 + 273.15);
  if (dari === "k" && ke === "f")
    return bulatkan(((nilai - 273.15) * 9) / 5 + 32);
  return null;
}

// ── Satuan (ke satuan dasar) ───────────────────────────────────────────────────
const JARAK = {
  km: 1000,
  m: 1,
  cm: 0.01,
  mm: 0.001,
  mi: 1609.34,
  ft: 0.3048,
  in: 0.0254,
};
const BERAT = {
  kg: 1,
  g: 0.001,
  mg: 0.000001,
  lb: 0.453592,
  oz: 0.0283495,
  ton: 1000,
};

function konversiSatuan(nilai, dari, ke, tabel) {
  if (!tabel[dari] || !tabel[ke]) return null;
  return bulatkan((nilai * tabel[dari]) / tabel[ke]);
}

// ── Mata Uang via API ──────────────────────────────────────────────────────────
async function konversiMataUang(nilai, dari, ke) {
  const https = require("https");

  return new Promise((resolve) => {
    const url = `https://open.er-api.com/v6/latest/${dari.toUpperCase()}`;

    https
      .get(url, (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          try {
            const json = JSON.parse(data);
            if (json.result !== "success") return resolve(null);
            const rate = json.rates[ke.toUpperCase()];
            if (!rate) return resolve(null);
            resolve(bulatkan(nilai * rate));
          } catch {
            resolve(null);
          }
        });
      })
      .on("error", () => resolve(null));
  });
}

function bulatkan(n) {
  return Math.round(n * 10000) / 10000;
}
