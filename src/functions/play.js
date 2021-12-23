const Discord = require("discord.js");

/**
 *
 * @param {Discord.Message} message
 * @param {Discord.Client} client
 * @param {*} foundChannel
 *
 */
module.exports = async function play(message, client, foundChannel) {
    const player = client.player;
    const guildMember = await message.guild.members.fetch(message.author.id);
    const channel = guildMember.voice.channel;

    if (!channel)
        return message.reply("You are not connected to voice channel");
    if (
        message.guild.me.voice.channelId &&
        channel.id !== message.guild.me.voice.channelId
    )
        return message.reply({
            content: "You are not in my voice channel",
            ephemeral: true,
        });

    const query = message.content;
    let queue = player.getQueue(message.guildId);
    if (!queue) {
        queue = player.createQueue(message.guild, {
            metadata: {
                channel: message.channel,
                bannerId: foundChannel.message_id,
                pausedStatus: false,
            },
        });
    }

    // verify vc connection
    try {
        if (!queue.connection) await queue.join(message.member.voice.channel);
    } catch {
        return message.reply({
            content: "Could not join your voice channel",
            ephemeral: true,
        });
    }

    return player.search(query).then((searchResult) => {
        if (!searchResult)
            return message.channel.send({
                content: `❌ | Track **${query}** not found!`,
            });

        queue.addTrack(searchResult);

        if (queue.audioPlayer.state.status == "idle") queue.play();
    });
};
