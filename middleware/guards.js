const { getUser, checkAndConsumeLimit } = require("../database/db");

const OWNER_ID = String(process.env.OWNER_ID || "");

// ── Cek apakah pengirim adalah owner ─────────────────────────────────────────
function isOwner(chatId) {
  return String(chatId) === OWNER_ID;
}

// ── Guard: blokir user yang di-ban ───────────────────────────────────────────
function banGuard(bot, msg, next) {
  const user = getUser(msg.chat.id);

  if (user.isBanned) {
    bot.sendMessage(msg.chat.id, "🚫 Kamu telah di-ban dan tidak bisa menggunakan bot ini.");
    return;
  }

  next();
}

// ── Guard: cek & konsumsi limit harian ───────────────────────────────────────
function limitGuard(bot, msg, next) {
  const { allowed, remaining } = checkAndConsumeLimit(msg.chat.id);

  if (!allowed) {
    bot.sendMessage(
      msg.chat.id,
      `⛔ *Limit harian habis!*\n\nKamu sudah mencapai batas penggunaan hari ini.\nLimit akan reset otomatis tengah malam 🕛\n\n💎 Upgrade ke *Premium* untuk limit unlimited!`,
      { parse_mode: "Markdown" }
    );
    return;
  }

  next(remaining);
}

// ── Guard: hanya premium yang boleh ──────────────────────────────────────────
function premiumGuard(bot, msg, next) {
  const user = getUser(msg.chat.id);

  if (!user.isPremium && !isOwner(msg.chat.id)) {
    bot.sendMessage(
      msg.chat.id,
      `💎 *Fitur Premium*\n\nCommand ini hanya tersedia untuk pengguna Premium.\n\nHubungi owner untuk upgrade akun kamu!`,
      { parse_mode: "Markdown" }
    );
    return;
  }

  next();
}

// ── Guard: hanya owner yang boleh ────────────────────────────────────────────
function ownerGuard(bot, msg, next) {
  if (!isOwner(msg.chat.id)) {
    bot.sendMessage(msg.chat.id, "🔒 Command ini hanya bisa digunakan oleh owner.");
    return;
  }

  next();
}

// ── Auto-register user saat pertama pakai bot ─────────────────────────────────
function autoRegister(msg) {
  const user = getUser(msg.chat.id);
  const nama = `${msg.from.first_name || ""} ${msg.from.last_name || ""}`.trim();
  if (user.name !== nama) {
    const { updateUser } = require("../database/db");
    updateUser(msg.chat.id, { name: nama });
  }
}

module.exports = { isOwner, banGuard, limitGuard, premiumGuard, ownerGuard, autoRegister };