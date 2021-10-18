const { Channel } = require("../dbObjects");

module.exports = {
    name: "setup",
    description: "",
    /**
     *
     * @param {*} message
     * @param {string[]} args
     * @param {*} client
     */
    async execute(message, args, client) {
        const channelManager = message.guild.channels;
        if (args.length == 0) return message.reply(`Please specify channel`);
        const channel = await channelManager.create(args[0]);
        const main_message = await channel.send("woohoo");
        Channel.upsert({
            server_fk: message.guild.id,
            channel_id: channel.id,
            channel_name: channel.name,
            message_id: main_message.id,
        }).catch((err) => console.log(err));

        message.reply(`Setup channel successful`);
    },
};
