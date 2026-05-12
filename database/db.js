const fs = require("fs");
const path = require("path");

const DB_PATH = path.join(__dirname, "db.json");
const DEFAULT_DB = { users: {} };

// ── Read & Write ──────────────────────────────────────────────────────────────

function readDb() {
  // Auto-create db.json kalau belum ada
  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify(DEFAULT_DB, null, 2));
    console.log("📄 db.json dibuat otomatis.");
  }

  const raw = fs.readFileSync(DB_PATH, "utf-8");
  return JSON.parse(raw);
}

function writeDb(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

// ── User ──────────────────────────────────────────────────────────────────────

const DEFAULT_LIMIT = 10;

function getUser(chatId) {
  const db = readDb();
  const id = String(chatId);

  if (!db.users[id]) {
    db.users[id] = {
      id,
      name: "",
      isPremium: false,
      isBanned: false,
      limit: DEFAULT_LIMIT,
      usageToday: 0,
      lastReset: todayDate(),
      joinedAt: new Date().toISOString(),
    };
    writeDb(db);
  }

  return db.users[id];
}

function updateUser(chatId, fields) {
  const db = readDb();
  const id = String(chatId);

  if (!db.users[id]) getUser(chatId);
  const fresh = readDb();
  fresh.users[id] = { ...fresh.users[id], ...fields };
  writeDb(fresh);
  return fresh.users[id];
}

function getAllUsers() {
  const db = readDb();
  return Object.values(db.users);
}

// ── Limit ─────────────────────────────────────────────────────────────────────

function todayDate() {
  return new Date().toISOString().split("T")[0];
}

function checkAndConsumeLimit(chatId) {
  const user = getUser(chatId);

  if (user.lastReset !== todayDate()) {
    updateUser(chatId, { usageToday: 0, lastReset: todayDate() });
    user.usageToday = 0;
  }

  if (user.isPremium) return { allowed: true, remaining: "∞" };

  if (user.usageToday >= user.limit) {
    return { allowed: false, remaining: 0 };
  }

  updateUser(chatId, { usageToday: user.usageToday + 1 });
  return { allowed: true, remaining: user.limit - user.usageToday - 1 };
}

module.exports = {
  getUser,
  updateUser,
  getAllUsers,
  checkAndConsumeLimit,
  DEFAULT_LIMIT,
};
