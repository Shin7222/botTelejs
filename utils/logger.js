const fs = require("fs");
const path = require("path");

const LOG_DIR = path.join(process.cwd(), "logs");

// Create logs directory if not exists
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

const logLevels = {
  ERROR: "ERROR",
  WARN: "WARN",
  INFO: "INFO",
  DEBUG: "DEBUG",
};

function formatLog(level, message, data = {}) {
  const timestamp = new Date().toISOString();
  const dataStr = Object.keys(data).length > 0 ? JSON.stringify(data) : "";
  return `[${timestamp}] [${level}] ${message} ${dataStr}`;
}

function writeLog(level, message, data) {
  const logMessage = formatLog(level, message, data);

  // Console output
  const colors = {
    ERROR: "\x1b[31m", // Red
    WARN: "\x1b[33m", // Yellow
    INFO: "\x1b[36m", // Cyan
    DEBUG: "\x1b[35m", // Magenta
  };
  const reset = "\x1b[0m";

  console.log(`${colors[level]}${logMessage}${reset}`);

  // File output
  const logFile = path.join(
    LOG_DIR,
    `${new Date().toISOString().split("T")[0]}.log`,
  );
  fs.appendFileSync(logFile, logMessage + "\n");
}

const logger = {
  error: (message, data) => writeLog(logLevels.ERROR, message, data),
  warn: (message, data) => writeLog(logLevels.WARN, message, data),
  info: (message, data) => writeLog(logLevels.INFO, message, data),
  debug: (message, data) => writeLog(logLevels.DEBUG, message, data),

  // Log command execution
  logCommand: (userId, userName, command, args, status = "success") => {
    logger.info("Command executed", {
      userId,
      userName,
      command,
      args: args?.slice(0, 50), // Limit arg length
      status,
      timestamp: new Date().toISOString(),
    });
  },

  // Log user action
  logAction: (userId, action, details = {}) => {
    logger.info("User action", {
      userId,
      action,
      ...details,
      timestamp: new Date().toISOString(),
    });
  },

  // Log error with context
  logError: (error, context = {}) => {
    logger.error("Exception caught", {
      message: error.message,
      stack: error.stack?.split("\n")[0],
      ...context,
    });
  },
};

module.exports = logger;
