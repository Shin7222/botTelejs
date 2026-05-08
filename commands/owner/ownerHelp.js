const { ownerGuard } = require("../../middleware/guards");

module.exports = {
  name: "ownerhelp",
  category: "owner",
  description: "Tampilkan panel owner",

  async run({ bot, chatId, msg }) {
    await new Promise((resolve) => {
      ownerGuard(bot, msg, async () => {
        await bot.sendMessage(
          chatId,
          `
👑 *Owner Panel*

*User Management:*
• \`/users\` — Lihat semua user
• \`/setpremium <id>\` — Jadikan premium
• \`/removepremium <id>\` — Cabut premium
• \`/setlimit <id> <n>\` — Set limit harian
• \`/ban <id>\` — Ban user
• \`/unban <id>\` — Unban user
        `.trim(),
          { parse_mode: "Markdown" },
        );
        resolve();
      });
    });
  },
};
