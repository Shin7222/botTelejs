const { ownerGuard } = require("../../middleware/guards");
const { updateUser } = require("../../database/db");

module.exports = {
  name: "ban",
  category: "owner",
  description: "Ban user dari bot",
  usage: "/ban <id>",

  async run({ bot, chatId, msg, args }) {
    await new Promise((resolve) => {
      ownerGuard(bot, msg, async () => {
        const targetId = args[0];
        if (!targetId) {
          await bot.sendMessage(chatId, "❌ Gunakan: `/ban <id>`", {
            parse_mode: "Markdown",
          });
          return resolve();
        }

        updateUser(targetId, { isBanned: true });
        await bot.sendMessage(chatId, `🚫 User \`${targetId}\` telah di-ban.`, {
          parse_mode: "Markdown",
        });
        bot
          .sendMessage(targetId, `🚫 Akun kamu telah di-ban dari bot ini.`)
          .catch(() => {});
        resolve();
      });
    });
  },
};
