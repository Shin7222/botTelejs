const {
  getReferralInfo,
  getReferralList,
  claimReferralBonus,
} = require("../../utils/referral");

module.exports = {
  name: "referral",
  alias: ["ref", "invite"],
  category: "public",
  description: "Lihat & manage referral kamu",
  usage: "/referral [claim|list]",

  async run({ bot, chatId, msg, args }) {
    const userId = msg.from.id;
    const subcommand = args?.[0]?.toLowerCase();

    if (subcommand === "claim") {
      // Claim bonus
      const result = claimReferralBonus(userId);
      const text = result.success
        ? `✅ ${result.message}\n\n💰 Bonus: ${result.bonus} coins`
        : `❌ ${result.message}`;

      return bot.sendMessage(chatId, text);
    }

    if (subcommand === "list") {
      // Show referral list
      const referrals = getReferralList(userId);

      if (referrals.length === 0) {
        return bot.sendMessage(
          chatId,
          "📭 Belum ada orang yang join dari referral kamu",
        );
      }

      let text = `👥 *Orang yang join dari referral kamu:*\n\n`;
      referrals.forEach((ref, i) => {
        const status = ref.isPremium ? "💎" : "🔓";
        const date = new Date(ref.joinedAt).toLocaleDateString("id-ID");
        text += `${i + 1}. ${status} ${ref.name} (${date})\n`;
      });

      text += `\n📊 Total: ${referrals.length} orang`;

      return bot.sendMessage(chatId, text, { parse_mode: "Markdown" });
    }

    // Default: show referral info
    const info = getReferralInfo(userId);

    if (!info) {
      return bot.sendMessage(chatId, "❌ User tidak ditemukan");
    }

    const top = "┌─────────────────────────────────────┐";
    const mid = "├─────────────────────────────────────┤";
    const bot_ = "└─────────────────────────────────────┘";

    let text = "";
    text += `${top}\n`;
    text += `│ 👥 *REFERRAL PROGRAM*\n`;
    text += `${mid}\n`;
    text += `│ Kode Referral: \`${info.referralCode}\`\n`;
    text += `│ Share ke teman & dapatkan bonus!\n`;
    text += `${mid}\n`;
    text += `│ 📊 *STATISTIK*\n`;
    text += `│ Total Referral: ${info.totalReferrals} orang\n`;
    text += `│ Bonus Pending: ${info.totalBonus} coins\n`;
    text += `│ Dirujuk oleh: ${info.referredBy}\n`;
    text += `${bot_}`;

    text += `\n*Perintah:*\n`;
    text += `• /referral list - Lihat daftar referral\n`;
    text += `• /referral claim - Klaim bonus\n\n`;

    text += `💡 *Cara kerja:*\n`;
    text += `1. Share kode referral ke teman\n`;
    text += `2. Teman join bot dengan kode kamu\n`;
    text += `3. Kamu dapat 100 coins per referral\n`;
    text += `4. Klaim bonus kapan saja`;

    await bot.sendMessage(chatId, text, {
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "📋 Lihat Referral List",
              callback_data: "show_referral_list",
            },
          ],
          [{ text: "💰 Klaim Bonus", callback_data: "claim_referral_bonus" }],
        ],
      },
    });
  },
};
