const { ownerGuard } = require("../../middleware/guards");
const { updateUser } = require("../../database/db");

module.exports = {
  name: "setlimit",
  category: "owner",
  description: "Set limit harian user",
  usage: "/setlimit <id> <jumlah>",

  async run({ bot, chatId, msg, args }) {
    await new Promise((resolve) => {
      ownerGuard(bot, msg, async () => {
        const [targetId, jumlah] = args;
        if (!targetId || !jumlah) {
          await bot.sendMessage(
            chatId,
            "❌ Gunakan: `/setlimit <id> <jumlah>`",
            { parse_mode: "Markdown" },
          );
          return resolve();
        }

        updateUser(targetId, { limit: parseInt(jumlah) });
        await bot.sendMessage(
          chatId,
          `✅ Limit \`${targetId}\` diset ke *${jumlah}x/hari*`,
          { parse_mode: "Markdown" },
        );
        resolve();
      });
    });
  },
};
