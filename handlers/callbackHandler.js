const { autoRegister } = require("../middleware/guards");
const path = require("path");

module.exports = function registerCallbackHandlers(bot) {
  // Handle callback queries dari inline buttons
  bot.on("callback_query", async (query) => {
    try {
      const chatId = query.message?.chat?.id || query.from.id;
      const userId = query.from.id;
      const callbackData = query.data;
      const messageId = query.message?.message_id;

      // Auto-register user jika belum ada
      if (query.message) {
        await autoRegister(query.message);
      }

      // Buat fake msg object
      const fakeMsg = {
        from: query.from,
        chat: { id: chatId },
        message_id: messageId,
      };

      // Handle berbagai callback
      if (callbackData === "show_help") {
        try {
          const helpPath = path.join(
            __dirname,
            "..",
            "commands",
            "bot",
            "help.js",
          );
          const help = require(helpPath);

          await help.run({
            bot,
            chatId,
            msg: fakeMsg,
          });

          if (messageId) {
            await bot
              .editMessageReplyMarkup(
                {
                  inline_keyboard: [
                    [
                      {
                        text: "← Kembali ke Menu",
                        callback_data: "back_to_start",
                      },
                    ],
                  ],
                },
                { chat_id: chatId, message_id: messageId },
              )
              .catch(() => {});
          }
        } catch (err) {
          console.error("Error loading help command:", err.message);
          await bot.sendMessage(chatId, "❌ Gagal membuka command /help");
        }
      } else if (callbackData === "show_profile") {
        try {
          const infoPath = path.join(
            __dirname,
            "..",
            "commands",
            "bot",
            "info.js",
          );
          const info = require(infoPath);

          await info.run({
            bot,
            chatId,
            msg: fakeMsg,
          });

          if (messageId) {
            await bot
              .editMessageReplyMarkup(
                {
                  inline_keyboard: [
                    [
                      {
                        text: "← Kembali ke Menu",
                        callback_data: "back_to_start",
                      },
                    ],
                  ],
                },
                { chat_id: chatId, message_id: messageId },
              )
              .catch(() => {});
          }
        } catch (err) {
          console.error("Error loading info command:", err.message);
          await bot.sendMessage(chatId, "❌ Gagal membuka command /info");
        }
      } else if (callbackData === "show_premium") {
        const premiumText = `
💎 *UPGRADE PREMIUM*

Dapatkan akses unlimited ke semua fitur!

*Benefit Premium:*
• ∞ Unlimited daily commands
• 🎯 Priority support
• 📥 Download quality HD
• ⚡ Faster download speed

Hubungi owner untuk upgrade: /contact
        `.trim();

        if (messageId) {
          await bot
            .editMessageText(premiumText, {
              chat_id: chatId,
              message_id: messageId,
              parse_mode: "Markdown",
              reply_markup: {
                inline_keyboard: [
                  [
                    {
                      text: "← Kembali ke Menu",
                      callback_data: "back_to_start",
                    },
                  ],
                ],
              },
            })
            .catch(() => {
              bot.sendMessage(chatId, premiumText, {
                parse_mode: "Markdown",
                reply_markup: {
                  inline_keyboard: [
                    [
                      {
                        text: "← Kembali ke Menu",
                        callback_data: "back_to_start",
                      },
                    ],
                  ],
                },
              });
            });
        } else {
          await bot.sendMessage(chatId, premiumText, {
            parse_mode: "Markdown",
            reply_markup: {
              inline_keyboard: [
                [{ text: "← Kembali ke Menu", callback_data: "back_to_start" }],
              ],
            },
          });
        }
      } else if (callbackData === "back_to_start") {
        try {
          const startPath = path.join(
            __dirname,
            "..",
            "commands",
            "bot",
            "start.js",
          );
          const start = require(startPath);

          await start.run({
            bot,
            chatId,
            msg: fakeMsg,
          });

          if (messageId) {
            await bot
              .editMessageReplyMarkup(
                {
                  inline_keyboard: [
                    [
                      { text: "📖 Lihat Commands", callback_data: "show_help" },
                      { text: "👤 Profil Saya", callback_data: "show_profile" },
                    ],
                    [
                      {
                        text: "💎 Info Premium",
                        callback_data: "show_premium",
                      },
                      { text: "🔄 Refresh", callback_data: "back_to_start" },
                    ],
                  ],
                },
                { chat_id: chatId, message_id: messageId },
              )
              .catch(() => {});
          }
        } catch (err) {
          console.error("Error loading start command:", err.message);
          await bot.sendMessage(chatId, "❌ Gagal membuka command /start");
        }
      }

      // Answer callback query
      await bot.answerCallbackQuery(query.id, {
        show_alert: false,
      });
    } catch (err) {
      console.error("❌ Callback handler error:", err.message);

      try {
        await bot.answerCallbackQuery(query.id, {
          text: "❌ Error: " + err.message.slice(0, 50),
          show_alert: true,
        });
      } catch {}
    }
  });
};
