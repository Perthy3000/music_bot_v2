module.exports = {
    name: "ping",
    description: "",
    async execute(message, args, client) {
        message.reply(
            `Ping: ${client.ws.ping} ms. <a:BOOBAsword:871739455512412180>`
        );
    },
};
