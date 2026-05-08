process.env.YTDL_NO_UPDATE = "1"; // suppress ytdl-core update check

require("dotenv").config();
const TelegramBot = require("node-telegram-bot-api");
const { registerCommands } = require("./commands/commands");
const registerHandlers = require("./handlers/handlers");

const TOKEN = process.env.BOT_TOKEN;

if (!TOKEN) {
  console.error("❌ BOT_TOKEN tidak ditemukan! Cek file .env kamu.");
  process.exit(1);
}

const bot = new TelegramBot(TOKEN, { polling: true });
console.log("🤖 Bot Telegram berjalan...");

registerCommands(bot);
registerHandlers(bot);

bot.on("polling_error", (error) => {
  console.error("❌ Polling error:", error.message);
});

process.on("SIGINT", () => {
  console.log("\n👋 Bot dihentikan.");
  bot.stopPolling();
  process.exit(0);
});
