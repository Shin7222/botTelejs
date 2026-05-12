const { getUser } = require("../../database/db");
const { isOwner } = require("../../middleware/guards");

function pad(str, len) {
  const s = String(str);
  return s + " ".repeat(Math.max(0, len - s.length));
}

module.exports = {
  name: "info",
  alias: ["profil", "whoami", "status"],
  category: "public",
  description: "Tampilkan profil dan status akun",

  async run({ bot, chatId, msg }) {
    const user = getUser(chatId);
    const tg = msg.from;

    const owner = isOwner(chatId);
    const role = user.isPremium ? "💎 Premium" : "🔓 Free";
    const banned = user.isBanned ? "🚫 Ya" : "✅ Tidak";
    const remaining = user.limit - user.usageToday;
    const limit =
      user.isPremium || owner
        ? "∞ Unlimited"
        : `${remaining}/${user.limit} (terpakai ${user.usageToday})`;
    const nama = `${tg.first_name}${tg.last_name ? " " + tg.last_name : ""}`;
    const uname = tg.username ? `@${tg.username}` : "—";
    const joined = new Date(user.joinedAt).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });

    const W = 28;
    const line = "─".repeat(W + 14);
    const top = `┌${line}┐`;
    const mid = `├${line}┤`;
    const end = `└${line}┘`;
    const row = (label, value) => `│  ${pad(label, 12)}  ${pad(value, W)}│`;

    const statusRows = [
      row("Role", role),
      ...(owner ? [row("Owner", "👑 Ya")] : []),
      row("Banned", banned),
      row("Limit", limit),
      row("Bergabung", joined),
    ];

    const card = [
      top,
      `│${pad("  👤  PROFIL AKUN", W + 15)}│`,
      mid,
      row("Nama", nama),
      row("Username", uname),
      row("User ID", String(tg.id)),
      row("Chat ID", String(chatId)),
      mid,
      `│${pad("  📊  STATUS", W + 15)}│`,
      mid,
      ...statusRows,
      end,
    ].join("\n");

    await bot.sendMessage(chatId, `\`\`\`\n${card}\n\`\`\``, {
      parse_mode: "Markdown",
    });
  },
};
