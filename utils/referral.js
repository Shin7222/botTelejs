const db = require("../database/db");

/**
 * Referral System
 * - Generate unique referral code
 * - Track referrer & referred
 * - Reward system
 */

// Generate unique referral code
function generateReferralCode(userId) {
  // Format: USER-XXXXX (5 random chars)
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 5; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return `USER-${code}`;
}

// Register referral (when new user joins with code)
function registerReferral(newUserId, referralCode) {
  try {
    // Cari user dengan referral code ini
    const allUsers = db.getAllUsers();
    const referrer = allUsers.find((u) => u.referralCode === referralCode);

    if (!referrer) {
      return { success: false, message: "Referral code tidak valid" };
    }

    const newUser = db.getUser(newUserId);
    if (!newUser) {
      return { success: false, message: "User tidak ditemukan" };
    }

    // Update referral data
    db.updateUser(newUserId, {
      referredBy: referrer.id,
      referralCode: generateReferralCode(newUserId),
    });

    // Update referrer stats
    const referrerData = db.getUser(referrer.id);
    const referrals = referrerData.referralCount || 0;
    const totalBonus = referrerData.referralBonus || 0;

    db.updateUser(referrer.id, {
      referralCount: referrals + 1,
      referralBonus: totalBonus + 100, // Bonus 100 coins per referral
    });

    return {
      success: true,
      message: `Terima kasih! Kamu berhasil join dari referral ${referrer.name}`,
    };
  } catch (err) {
    console.error("Referral error:", err);
    return { success: false, message: "Error: " + err.message };
  }
}

// Get referral info
function getReferralInfo(userId) {
  const user = db.getUser(userId);

  if (!user) {
    return null;
  }

  const referrer = user.referredBy ? db.getUser(user.referredBy) : null;

  return {
    referralCode: user.referralCode || "N/A",
    referredBy: referrer ? referrer.name : "—",
    totalReferrals: user.referralCount || 0,
    totalBonus: user.referralBonus || 0,
  };
}

// Get referral list (who referred by you)
function getReferralList(userId) {
  const allUsers = db.getAllUsers();
  const myReferrals = allUsers.filter((u) => u.referredBy === userId);

  return myReferrals.map((u) => ({
    id: u.id,
    name: u.name,
    joinedAt: u.joinedAt,
    isPremium: u.isPremium,
  }));
}

// Reward system (dapat bonus)
function claimReferralBonus(userId) {
  const user = db.getUser(userId);

  if (!user) {
    return { success: false, message: "User tidak ditemukan" };
  }

  const bonus = user.referralBonus || 0;

  if (bonus === 0) {
    return { success: false, message: "Bonus 0, tidak ada yang bisa diklaim" };
  }

  // Claim bonus
  db.updateUser(userId, {
    referralBonus: 0,
    referralBonusClaimed: (user.referralBonusClaimed || 0) + bonus,
  });

  return {
    success: true,
    message: `✅ Berhasil claim ${bonus} bonus coins!`,
    bonus: bonus,
  };
}

module.exports = {
  generateReferralCode,
  registerReferral,
  getReferralInfo,
  getReferralList,
  claimReferralBonus,
};
