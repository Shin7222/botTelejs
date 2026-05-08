const { ownerGuard } = require("../../middleware/guards");
const { updateUser } = require("../../database/db");

module.exports = {
  name: "setpremium",
  alias: ["addprem"],
  category: "owner",
  description: "Jadikan user premium",
  usage: "/setpremium <id>",

  async run({ bot, chatId, msg, args }) {
    await new Promise((resolve) => {
      ownerGuard(bot, msg, async () => {
        const targetId = args[0];
        if (!targetId) {
          await bot.sendMessage(chatId, "❌ Gunakan: `/setpremium <id>`", {
            parse_mode: "Markdown",
          });
          return resolve();
        }

        updateUser(targetId, { isPremium: true });
        await bot.sendMessage(
          chatId,
          `💎 User \`${targetId}\` sekarang *Premium*!`,
          { parse_mode: "Markdown" },
        );
        bot
          .sendMessage(
            targetId,
            `🎉 Akun kamu telah di-upgrade ke *Premium*!\n\n✅ Limit unlimited`,
            { parse_mode: "Markdown" },
          )
          .catch(() => {});
        resolve();
      });
    });
  },
};
