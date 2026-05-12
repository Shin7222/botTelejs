const { ownerGuard } = require("../../middleware/guards");
const { getAllUsers } = require("../../database/db");

module.exports = {
  name: "broadcast",
  alias: ["bc"],
  category: "owner",
  description: "Kirim pesan ke semua user",
  usage: "/broadcast <pesan>",

  async run({ bot, chatId, msg, fullArgs }) {
    await new Promise((resolve) => {
      ownerGuard(bot, msg, async () => {
        if (!fullArgs) {
          await bot.sendMessage(
            chatId,
            "❌ Masukkan pesan!\n\nContoh: `/broadcast Halo semua!`",
            { parse_mode: "Markdown" },
          );
          return resolve();
        }

        const users = getAllUsers();
        if (users.length === 0) {
          await bot.sendMessage(chatId, "📭 Belum ada user terdaftar.");
          return resolve();
        }

        const statusMsg = await bot.sendMessage(
          chatId,
          `📡 Mengirim ke *${users.length} user*...`,
          { parse_mode: "Markdown" },
        );

        let berhasil = 0;
        let gagal = 0;

        for (const user of users) {
          try {
            await bot.sendMessage(
              user.id,
              `📢 *Pesan dari Owner*\n\n${fullArgs}`,
              { parse_mode: "Markdown" },
            );
            berhasil++;
          } catch {
            gagal++;
          }

          // Delay kecil agar tidak kena rate limit Telegram
          await new Promise((r) => setTimeout(r, 100));
        }

        await bot.editMessageText(
          `✅ *Broadcast selesai!*\n\n📨 Terkirim: *${berhasil}*\n❌ Gagal: *${gagal}*`,
          {
            chat_id: chatId,
            message_id: statusMsg.message_id,
            parse_mode: "Markdown",
          },
        );

        resolve();
      });
    });
  },
};
