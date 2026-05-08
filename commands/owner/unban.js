const { ownerGuard } = require("../../middleware/guards");
const { updateUser } = require("../../database/db");

module.exports = {
  name: "unban",
  category: "owner",
  description: "Unban user",
  usage: "/unban <id>",

  async run({ bot, chatId, msg, args }) {
    await new Promise((resolve) => {
      ownerGuard(bot, msg, async () => {
        const targetId = args[0];
        if (!targetId) {
          await bot.sendMessage(chatId, "❌ Gunakan: `/unban <id>`", {
            parse_mode: "Markdown",
          });
          return resolve();
        }

        updateUser(targetId, { isBanned: false });
        await bot.sendMessage(
          chatId,
          `✅ User \`${targetId}\` telah di-unban.`,
          { parse_mode: "Markdown" },
        );
        bot
          .sendMessage(
            targetId,
            `✅ Kamu telah di-unban. Selamat datang kembali!`,
          )
          .catch(() => {});
        resolve();
      });
    });
  },
};
