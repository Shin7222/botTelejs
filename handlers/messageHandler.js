const { randomPick } = require("../utils/halpers");
const { autoRegister, banGuard } = require("../middleware/guards");

const BALASAN = [
  (text) =>
    `💬 Kamu bilang: *"${text}"*\n\nCoba ketik /help untuk melihat perintah yang tersedia!`,
  (text) =>
    `🤔 Hmm, aku tidak mengerti *"${text}"*\n\nKetik /start untuk lihat menu!`,
  () =>
    `📨 Pesan diterima!\nGunakan perintah yang ada ya, ketik /help untuk daftar lengkapnya.`,
];

module.exports = function messageHandler(bot) {
  bot.on("message", (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    if (!text) return;

    // Auto-register & update nama user
    autoRegister(msg);

    // Skip command, biarkan ditangani masing-masing handler
    if (text.startsWith("/")) return;

    // Cek ban sebelum balas
    banGuard(bot, msg, () => {
      const balasan = randomPick(BALASAN)(text);
      bot.sendMessage(chatId, balasan, { parse_mode: "Markdown" });
    });
  });
};
