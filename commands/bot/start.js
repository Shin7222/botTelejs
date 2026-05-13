module.exports = {
  name: "start",
  alias: [],
  category: "public",
  description: "Mulai bot & registrasi akun",
  usage: "/start",

  async run({ bot, chatId, msg }) {
    const db = require("../../database/db");
    const user = db.getUser(msg.from.id);

    const firstName = msg.from.first_name || "User";
    const isNewUser = !user;

    let startText = "";

    if (isNewUser) {
      startText = `
👋 Halo ${firstName}!

Selamat datang di *Telegram Bot* 🤖

Aku adalah bot yang bisa membantu kamu:
📥 Download video dari YouTube, TikTok, Instagram
🎵 Konversi musik & video
🔍 Cari informasi & definisi kata
💰 Konversi mata uang & satuan
✨ Dan masih banyak lagi!

*🚀 Quick Start:*
• /help - Lihat daftar semua command
• /info - Lihat profil kamu
• /yt [URL] - Download YouTube
• /tt [URL] - Download TikTok
• /ig [URL] - Download Instagram

*💡 Info:*
• Kamu punya 10 command gratis per hari
• Limit reset setiap tengah malam
• Upgrade ke Premium untuk unlimited

Pilih menu di bawah atau ketik /help! 👇
      `.trim();
    } else {
      const role = user?.isPremium ? "💎 Premium" : "🔓 Free";
      const usage = user?.usageToday || 0;
      const limit = user?.limit || 10;
      const percentage = Math.round((usage / limit) * 100);
      const progressBar = this.createProgressBar(percentage);

      startText = `
👋 Selamat datang kembali, ${firstName}!

*📊 Status Kamu:*
Role: ${role}
Usage: ${progressBar} ${percentage}%
Penggunaan: ${usage}/${limit}
Sisa: ${Math.max(0, limit - usage)} command

*📌 Popular Commands:*
• /yt [URL] - Download YouTube
• /tt [URL] - Download TikTok
• /ig [URL] - Download Instagram
• /help - Lihat semua command

Pilih menu di bawah atau ketik command! 👇
      `.trim();
    }

    await bot.sendMessage(chatId, startText, {
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [
          [
            { text: "📖 Lihat Commands", callback_data: "show_help" },
            { text: "👤 Profil Saya", callback_data: "show_profile" },
          ],
          [
            { text: "💎 Info Premium", callback_data: "show_premium" },
            { text: "🔄 Refresh", callback_data: "back_to_start" },
          ],
        ],
      },
    });
  },

  createProgressBar(percentage) {
    const filled = Math.round(percentage / 10);
    const empty = 10 - filled;
    return `[${filled > 0 ? "█".repeat(filled) : ""}${empty > 0 ? "░".repeat(empty) : ""}]`;
  },
};
