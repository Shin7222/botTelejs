const { getRegistry } = require("../commands");
const { isOwner } = require("../../middleware/guards");
const { getUser } = require("../../database/db");

module.exports = {
  name: "start",
  category: "public",
  description: "Pesan selamat datang",

  async run({ bot, chatId, msg }) {
    const nama = msg.from.first_name;
    const registry = getRegistry();
    const user = getUser(chatId);
    const owner = isOwner(chatId);

    // Hitung jumlah command yang bisa diakses
    const allowed = ["public"];
    if (user.isPremium || owner) allowed.push("premium");
    if (owner) allowed.push("owner");

    const total = allowed
      .flatMap((cat) => registry[cat] || [])
      .filter(
        (c, i, arr) => arr.findIndex((x) => x.name === c.name) === i,
      ).length;

    const roleLabel = owner
      ? "👑 Owner"
      : user.isPremium
        ? "💎 Premium"
        : "🔓 Free";

    await bot.sendMessage(
      chatId,
      `
👋 Halo, *${nama}*!

Status kamu: *${roleLabel}*
Akses command: *${total} command*

Ketik /help untuk melihat daftar lengkap.
Ketik /info untuk melihat detail akunmu.
    `.trim(),
      { parse_mode: "Markdown" },
    );
  },
};
