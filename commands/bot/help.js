module.exports = {
  name: "help",
  alias: ["h", "bantuan"],
  category: "public",
  description: "Tampilkan daftar semua command",
  usage: "/help",

  async run({ bot, chatId, msg }) {
    const { getRegistry } = require("../commands");
    const registry = getRegistry();

    // Box drawing characters
    const topLeft = "┌";
    const topRight = "┐";
    const bottomLeft = "└";
    const bottomRight = "┘";
    const horizontal = "─";
    const vertical = "│";
    const tJunction = "├";
    const rightJunction = "┤";

    // Get user info untuk tampilkan role
    const db = require("../../database/db");
    const userInfo = db.getUser(msg.from.id);
    const isOwner = process.env.OWNER_ID === msg.from.id.toString();
    const isPremium = userInfo?.isPremium;

    let role = "🔓 Free";
    if (isOwner) role = "👑 Owner";
    else if (isPremium) role = "💎 Premium";

    // Build help message
    let helpText = "";

    // Header
    helpText += `${topLeft}${horizontal.repeat(48)}${topRight}\n`;
    helpText += `${vertical} 🤖 TELEGRAM BOT - Command List         ${vertical}\n`;
    helpText += `${vertical} Role: ${role.padEnd(41)}${vertical}\n`;
    helpText += `${tJunction}${horizontal.repeat(48)}${rightJunction}\n\n`;

    // Public Commands
    if (registry.public && registry.public.length > 0) {
      helpText += `📌 *PUBLIC COMMANDS*\n`;
      helpText += `${tJunction}${horizontal.repeat(48)}${rightJunction}\n`;

      for (const cmd of registry.public) {
        const useLimit = cmd.useLimit ? " ⚡" : "";
        const cmdName = `/${cmd.name}`;
        const desc = cmd.description || "No description";
        const spaces = " ".repeat(Math.max(0, 12 - cmdName.length));

        helpText += `${vertical} ${cmdName}${spaces}${desc}${useLimit}\n`;
      }
      helpText += "\n";
    }

    // Premium Commands
    if (registry.premium && registry.premium.length > 0) {
      helpText += `💎 *PREMIUM COMMANDS*\n`;
      helpText += `${tJunction}${horizontal.repeat(48)}${rightJunction}\n`;

      if (isPremium || isOwner) {
        for (const cmd of registry.premium) {
          const useLimit = cmd.useLimit ? " ⚡" : "";
          const cmdName = `/${cmd.name}`;
          const desc = cmd.description || "No description";
          const spaces = " ".repeat(Math.max(0, 12 - cmdName.length));

          helpText += `${vertical} ${cmdName}${spaces}${desc}${useLimit}\n`;
        }
      } else {
        helpText += `${vertical} 🔒 Upgrade ke Premium untuk akses     ${vertical}\n`;
      }
      helpText += "\n";
    }

    // Owner Commands
    if (registry.owner && registry.owner.length > 0 && isOwner) {
      helpText += `👑 *OWNER COMMANDS*\n`;
      helpText += `${tJunction}${horizontal.repeat(48)}${rightJunction}\n`;

      for (const cmd of registry.owner) {
        const useLimit = cmd.useLimit ? " ⚡" : "";
        const cmdName = `/${cmd.name}`;
        const desc = cmd.description || "No description";
        const spaces = " ".repeat(Math.max(0, 12 - cmdName.length));

        helpText += `${vertical} ${cmdName}${spaces}${desc}${useLimit}\n`;
      }
      helpText += "\n";
    }

    // Footer with legend
    helpText += `${tJunction}${horizontal.repeat(48)}${rightJunction}\n`;
    helpText += `${vertical} ⚡ = Command menggunakan daily limit       ${vertical}\n`;
    helpText += `${vertical} 💎 = Premium only                         ${vertical}\n`;
    helpText += `${vertical} 🔓 = Free to use                          ${vertical}\n`;
    helpText += `${bottomLeft}${horizontal.repeat(48)}${bottomRight}\n`;

    // Info tambahan
    helpText += "\n📝 *Info Tambahan:*\n";
    helpText += `• Daily Limit: ${userInfo?.limit || 10}/hari\n`;
    helpText += `• Terpakai: ${userInfo?.usageToday || 0} command\n`;
    helpText += `• Status: ${role}\n\n`;

    helpText += "💡 *Tips:*\n";
    helpText += "• Limit reset setiap tengah malam\n";

    await bot.sendMessage(chatId, helpText, {
      parse_mode: "Markdown",
      disable_web_page_preview: true,
      reply_markup: {
        inline_keyboard: [
          [{ text: "← Kembali ke Menu", callback_data: "back_to_start" }],
        ],
      },
    });
  },
};
