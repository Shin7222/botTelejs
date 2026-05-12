const { ownerGuard } = require("../../middleware/guards");
const { getAllUsers } = require("../../database/db");

module.exports = {
  name: "users",
  category: "owner",
  description: "Lihat semua user terdaftar",

  async run({ bot, chatId, msg }) {
    await new Promise((resolve) => {
      ownerGuard(bot, msg, async () => {
        const users = getAllUsers();

        if (users.length === 0) {
          await bot.sendMessage(chatId, "📭 Belum ada user terdaftar.");
          return resolve();
        }

        const list = users
          .map((u, i) => {
            const badge = u.isBanned ? "🚫" : u.isPremium ? "💎" : "👤";
            const limit = u.isPremium ? "∞" : `${u.usageToday}/${u.limit}`;
            return `${i + 1}. ${badge} *${u.name || "Tanpa Nama"}*\n   ID: \`${u.id}\` | Limit: ${limit}`;
          })
          .join("\n\n");

        await bot.sendMessage(
          chatId,
          `👥 *Daftar User* (${users.length})\n\n${list}`,
          { parse_mode: "Markdown" },
        );
        resolve();
      });
    });
  },
};
