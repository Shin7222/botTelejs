const { ownerGuard } = require("../../middleware/guards");
const { updateUser } = require("../../database/db");

module.exports = {
  name: "removepremium",
  category: "owner",
  description: "Cabut status premium user",
  usage: "/removepremium <id>",

  async run({ bot, chatId, msg, args }) {
    await new Promise((resolve) => {
      ownerGuard(bot, msg, async () => {
        const targetId = args[0];
        if (!targetId) {
          await bot.sendMessage(chatId, "❌ Gunakan: `/removepremium <id>`", {
            parse_mode: "Markdown",
          });
          return resolve();
        }

        updateUser(targetId, { isPremium: false });
        await bot.sendMessage(
          chatId,
          `👤 Premium user \`${targetId}\` dicabut.`,
          { parse_mode: "Markdown" },
        );
        bot
          .sendMessage(targetId, `ℹ️ Status Premium kamu telah dicabut.`)
          .catch(() => {});
        resolve();
      });
    });
  },
};
