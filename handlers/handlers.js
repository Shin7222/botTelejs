const messageHandler = require("./messageHandler");
const callbackHandler = require("./callbackHandler");

module.exports = function registerHandlers(bot) {
  // Register message handler
  messageHandler(bot);

  // Register callback handler untuk inline buttons
  callbackHandler(bot);

  console.log("✅ All handlers registered");
};
