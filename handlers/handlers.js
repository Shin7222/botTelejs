const messageHandler = require('./messageHandler');

module.exports = function registerHandlers(bot) {
    messageHandler(bot);
};
