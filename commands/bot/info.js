module.exports = {
  name: "info",
  alias: ["profile", "me"],
  category: "public",
  description: "Lihat profil & status akun kamu",
  usage: "/info",

  async run({ bot, chatId, msg }) {
    const db = require("../../database/db");
    const user = db.getUser(msg.from.id);
    const isOwner = process.env.OWNER_ID === msg.from.id.toString();

    // Format data
    const name =
      msg.from.first_name +
      (msg.from.last_name ? " " + msg.from.last_name : "");
    const username = msg.from.username ? `@${msg.from.username}` : "—";
    const userId = msg.from.id;
    const chatId_ = msg.chat.id;

    // Role
    let role = "🔓 Free";
    let roleEmoji = "🔓";
    if (isOwner) {
      role = "👑 Owner";
      roleEmoji = "👑";
    } else if (user?.isPremium) {
      role = "💎 Premium";
      roleEmoji = "💎";
    }

    // Status
    let statusText = "✅ Aktif";
    if (user?.isBanned) {
      statusText = "⛔ Dibanned";
    }

    // Limit
    const totalLimit = user?.limit || 10;
    const usageToday = user?.usageToday || 0;
    const remaining = Math.max(0, totalLimit - usageToday);
    const percentage = Math.round((usageToday / totalLimit) * 100);
    const progressBar = this.createProgressBar(percentage);

    // Joined date
    const joinedDate = user?.joinedAt
      ? new Date(user.joinedAt).toLocaleDateString("id-ID", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : "—";

    // Box drawing
    const top = "┌─────────────────────────────────────┐";
    const mid = "├─────────────────────────────────────┤";
    const bot_ = "└─────────────────────────────────────┘";

    let infoText = "";
    infoText += `${top}\n`;
    infoText += `│ 👤 *PROFIL AKUN*\n`;
    infoText += `${mid}\n`;
    infoText += `│ Nama: ${name.substring(0, 28)}\n`;
    infoText += `│ Username: ${username}\n`;
    infoText += `│ User ID: ${userId}\n`;
    infoText += `│ Chat ID: ${chatId_}\n`;
    infoText += `${mid}\n`;
    infoText += `│ ${roleEmoji} Role: ${role}\n`;
    infoText += `│ ${statusText}\n`;
    infoText += `${mid}\n`;
    infoText += `│ 📊 *DAILY LIMIT*\n`;
    infoText += `│ ${progressBar} ${percentage}%\n`;
    infoText += `│ Penggunaan: ${usageToday}/${totalLimit}\n`;

    if (totalLimit === 999999) {
      infoText += `│ Status: ∞ Unlimited\n`;
    } else {
      infoText += `│ Sisa: ${remaining} command\n`;
    }

    infoText += `${mid}\n`;
    infoText += `│ 📅 Bergabung: ${joinedDate}\n`;
    infoText += `${bot_}`;

    await bot.sendMessage(chatId, infoText, {
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [
          [{ text: "← Kembali ke Menu", callback_data: "back_to_start" }],
        ],
      },
    });
  },

  createProgressBar(percentage) {
    const filled = Math.round(percentage / 10);
    const empty = 10 - filled;
    const bar = "█".repeat(filled) + "░".repeat(empty);
    return `[${bar}]`;
  },
};
