module.exports = {
  name: "stats",
  alias: ["statistic", "stat"],
  category: "public",
  description: "Lihat statistik bot",
  usage: "/stats",

  async run({ bot, chatId }) {
    const db = require("../../database/db");
    const users = db.getAllUsers();

    // Hitung statistik
    const totalUsers = users.length;
    const premiumUsers = users.filter((u) => u.isPremium).length;
    const freeUsers = totalUsers - premiumUsers;
    const bannedUsers = users.filter((u) => u.isBanned).length;
    const activeToday = users.filter((u) => {
      const lastReset = u.lastReset || new Date().toISOString().split("T")[0];
      const today = new Date().toISOString().split("T")[0];
      return lastReset === today && u.usageToday > 0;
    }).length;

    // Box drawing
    const top = "┌──────────────────────────────────────┐";
    const mid = "├──────────────────────────────────────┤";
    const bot_ = "└──────────────────────────────────────┘";

    let statsText = "";
    statsText += `${top}\n`;
    statsText += `│ 📊 *BOT STATISTICS*\n`;
    statsText += `${mid}\n`;

    // Total users
    statsText += `│ 👥 Total Pengguna: ${totalUsers}\n`;
    statsText += `│    🔓 Free: ${freeUsers} | 💎 Premium: ${premiumUsers}\n`;
    statsText += `│    ⛔ Banned: ${bannedUsers}\n`;

    statsText += `${mid}\n`;
    statsText += `│ 📈 Aktivitas Hari Ini\n`;
    statsText += `│    🟢 Aktif: ${activeToday} user\n`;

    // Memory usage
    const memUsage = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);
    statsText += `│ 💾 Memory: ${memUsage} MB\n`;

    // Uptime
    const uptime = Math.floor(process.uptime() / 60);
    const hours = Math.floor(uptime / 60);
    const minutes = uptime % 60;
    statsText += `│ ⏱️ Uptime: ${hours}h ${minutes}m\n`;

    statsText += `${mid}\n`;
    statsText += `│ 🕐 Last Updated: ${new Date().toLocaleString("id-ID")}\n`;
    statsText += `${bot_}`;

    await bot.sendMessage(chatId, statsText, {
      parse_mode: "Markdown",
    });
  },
};
