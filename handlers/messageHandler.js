const { autoRegister } = require("../middleware/guards");

module.exports = function messageHandler(bot) {
  bot.on("message", (msg) => {
    const text = msg.text;

    if (!text || !text.startsWith("/")) return;

    autoRegister(msg);

    return;
  });
};
