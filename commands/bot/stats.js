const { ownerGuard } = require("../../middleware/guards");
const { getAllUsers } = require("../../database/db");

function pad(str, len) {
  const s = String(str);
  return s + " ".repeat(Math.max(0, len - s.length));
}

module.exports = {
  name: "stats",
  alias: ["statistik"],
  category: "owner",
  description: "Statistik keseluruhan bot",

  async run({ bot, chatId, msg }) {
    await new Promise((resolve) => {
      ownerGuard(bot, msg, async () => {
        const users = getAllUsers();
        const total = users.length;
        const premium = users.filter((u) => u.isPremium).length;
        const banned = users.filter((u) => u.isBanned).length;
        const free = total - premium - banned;
        const active = users.filter((u) => u.usageToday > 0).length;

        const W = 20;
        const line = "─".repeat(W + 14);
        const top = `┌${line}┐`;
        const mid = `├${line}┤`;
        const end = `└${line}┘`;
        const row = (label, value) =>
          `│  ${pad(label, 12)}  ${pad(String(value), W)}│`;

        const card = [
          top,
          `│${pad("  📊  STATISTIK BOT", W + 15)}│`,
          mid,
          row("Total User", total),
          row("Free", `👤 ${free}`),
          row("Premium", `💎 ${premium}`),
          row("Banned", `🚫 ${banned}`),
          mid,
          row("Aktif Hari ini", `⚡ ${active} user`),
          end,
        ].join("\n");

        await bot.sendMessage(chatId, `\`\`\`\n${card}\n\`\`\``, {
          parse_mode: "Markdown",
        });
        resolve();
      });
    });
  },
};
