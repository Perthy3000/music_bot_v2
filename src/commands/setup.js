const ChannelModel = require("../models/Channel");
const { MessageEmbed, MessageActionRow, MessageButton } = require("discord.js");

const startup_embeds = new MessageEmbed()
    .setColor("#0099ff")
    .setTitle("Now Playing: -")
    .setImage("https://i.redd.it/8hkekbti9a221.jpg")
    .setTimestamp()
    .setFooter("Toppiiz © 2021 อิอิ");
const startup_content = "__**Queue list:**__";
const row = new MessageActionRow().addComponents([
    new MessageButton()
        .setCustomId("playpause")
        .setStyle("SUCCESS")
        .setEmoji("861867897902989312")
        .setDisabled(true),
    new MessageButton()
        .setCustomId("skip")
        .setStyle("SECONDARY")
        .setEmoji("861867897860784129")
        .setDisabled(true),
    new MessageButton()
        .setCustomId("stop")
        .setStyle("DANGER")
        .setEmoji("861867898044809236")
        .setDisabled(true),
    new MessageButton()
        .setCustomId("loop")
        .setStyle("SUCCESS")
        .setEmoji("861867897924354058")
        .setDisabled(true),
    // new MessageButton().setCustomId("clear").setStyle("DANGER").setEmoji("✖️"),
]);

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
        const main_message = await channel.send({
            content: startup_content,
            embeds: [startup_embeds],
            components: [row],
        });
        ChannelModel.create(
            {
                server_fk: message.guild.id,
                channel_id: channel.id,
                channel_name: channel.name,
                message_id: main_message.id,
            },
            (err) => {
                if (err) console.log(err);
            }
        );

        message.reply(`Setup channel successful`);
    },
};
