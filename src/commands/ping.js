module.exports = {
    name: "ping",
    description: "",
    async execute(message, args, client) {
        message.reply(`Ping: ${client.ws.ping} ms.`)
    }
}