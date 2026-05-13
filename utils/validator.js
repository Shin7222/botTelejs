/**
 * Input validation & sanitization
 */

// Validate URL
function isValidUrl(url) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

// Validate media URL
function isValidMediaUrl(url, allowedDomains = []) {
  if (!isValidUrl(url)) return false;

  const urlObj = new URL(url);
  const hostname = urlObj.hostname.toLowerCase();

  // Default allowed domains
  const defaults = [
    "youtube.com",
    "youtu.be",
    "tiktok.com",
    "vt.tiktok.com",
    "instagram.com",
    "facebook.com",
    "fb.watch",
  ];

  const all = [...defaults, ...allowedDomains];
  return all.some((domain) => hostname.includes(domain));
}

// Sanitize text input
function sanitizeText(text, maxLength = 500) {
  if (typeof text !== "string") return "";

  return text
    .trim()
    .slice(0, maxLength)
    .replace(/[<>]/g, "") // Remove HTML tags
    .replace(/\\/g, "\\\\") // Escape backslash
    .replace(/"/g, '\\"'); // Escape quotes
}

// Validate user ID
function isValidUserId(id) {
  return Number.isInteger(id) && id > 0;
}

// Validate chat ID
function isValidChatId(id) {
  return Number.isInteger(id);
}

// Rate limit check (in-memory simple version)
const rateLimits = new Map();

function checkRateLimit(userId, action, limit = 5, windowMs = 60000) {
  const key = `${userId}:${action}`;
  const now = Date.now();

  if (!rateLimits.has(key)) {
    rateLimits.set(key, []);
  }

  const timestamps = rateLimits.get(key);

  // Remove old timestamps outside window
  const validTimestamps = timestamps.filter((ts) => now - ts < windowMs);

  if (validTimestamps.length >= limit) {
    const oldestTs = validTimestamps[0];
    const waitTime = Math.ceil((windowMs - (now - oldestTs)) / 1000);
    return {
      allowed: false,
      message: `Terlalu cepat! Tunggu ${waitTime} detik.`,
    };
  }

  validTimestamps.push(now);
  rateLimits.set(key, validTimestamps);

  return { allowed: true };
}

// Validate command arguments
function validateArgs(args, schema) {
  /**
   * schema = {
   *   type: 'string|number|url',
   *   required: true,
   *   minLength: 5,
   *   maxLength: 500,
   * }
   */

  if (schema.required && (!args || args.trim().length === 0)) {
    return { valid: false, error: "Argument required" };
  }

  if (!args) return { valid: true };

  args = args.trim();

  if (schema.minLength && args.length < schema.minLength) {
    return {
      valid: false,
      error: `Minimum ${schema.minLength} characters`,
    };
  }

  if (schema.maxLength && args.length > schema.maxLength) {
    return {
      valid: false,
      error: `Maximum ${schema.maxLength} characters`,
    };
  }

  if (schema.type === "url") {
    if (!isValidUrl(args)) {
      return { valid: false, error: "Invalid URL format" };
    }
    if (
      schema.allowedDomains &&
      !isValidMediaUrl(args, schema.allowedDomains)
    ) {
      return { valid: false, error: "Domain not allowed" };
    }
  }

  if (schema.type === "number") {
    const num = parseInt(args);
    if (isNaN(num)) {
      return { valid: false, error: "Must be a number" };
    }
  }

  return { valid: true };
}

module.exports = {
  isValidUrl,
  isValidMediaUrl,
  sanitizeText,
  isValidUserId,
  isValidChatId,
  checkRateLimit,
  validateArgs,
};
