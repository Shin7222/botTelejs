const { getRegistry } = require("../commands");
const { isOwner } = require("../../middleware/guards");
const { getUser } = require("../../database/db");

const CATEGORY_LABEL = {
  public: "🔓 Umum",
  premium: "💎 Premium",
  owner: "👑 Owner",
  general: "📦 Lainnya",
};

const SKIP_NAMES = [
  "menu",
  "bantuan",
  "h",
  "acak",
  "search",
  "ubah",
  "convert",
  "profil",
  "whoami",
  "status",
  "statistik",
  "bc",
];

module.exports = {
  name: "help",
  alias: ["menu", "bantuan"],
  category: "public",
  description: "Tampilkan daftar semua command",

  async run({ bot, chatId, msg }) {
    const registry = getRegistry();
    const user = getUser(chatId);
    const owner = isOwner(chatId);
    const roleLabel = owner
      ? "👑 Owner"
      : user.isPremium
        ? "💎 Premium"
        : "🔓 Free";

    const lines = [];
    let totalCmd = 0;

    // Tampilkan semua kategori untuk semua user
    for (const cat of ["public", "premium", "owner"]) {
      const commands = (registry[cat] || []).filter(
        (c) => !SKIP_NAMES.includes(c.name),
      );
      if (commands.length === 0) continue;

      lines.push(`\n${CATEGORY_LABEL[cat]}`);
      lines.push("─".repeat(30));

      for (const cmd of commands) {
        const aliases = cmd.alias
          .filter((a) => !SKIP_NAMES.includes(a))
          .map((a) => `/${a}`)
          .join(", ");
        const aliasStr = aliases ? ` _(${aliases})_` : "";
        const limitTag = cmd.useLimit ? " ⚡" : "";
        lines.push(`• \`/${cmd.name}\`${aliasStr}${limitTag}`);
        lines.push(`  ${cmd.description}`);
        totalCmd++;
      }
    }

    await bot.sendMessage(
      chatId,
      `
📋 *Daftar Command* (${totalCmd} command)
Status: *${roleLabel}*
${lines.join("\n")}

_⚡ = mengurangi limit harian_
    `.trim(),
      { parse_mode: "Markdown" },
    );
  },
};
