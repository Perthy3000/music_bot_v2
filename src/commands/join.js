const { joinVoiceChannel } = require("@discordjs/voice");
const { VoiceConnectionStatus, entersState } = require("@discordjs/voice");
const Queue = require("../utils/Queue");
const Track = require("../utils/Track");

module.exports = {
    name: "join",
    description: "",
    async execute(message, args, client) {
        const guildMember = await message.guild.members.fetch(
            message.author.id
        );
        const channel = guildMember.voice.channel;
        if (!channel)
            return message.reply("You are not connected to voice channel");

        const player = client.player;
        let queue = player.getQueue(message.guildId);
        if (!queue) {
            queue = player.createQueue(message.guild, {
                metadata: {
                    channel: message.channel,
                },
            });
        }
        // queue.join(channel);
        // queue.addTrack(new Track("hello", "world", "alabama"));

        // const connection = joinVoiceChannel({
        //     channelId: channel.id,
        //     guildId: channel.guildId,
        //     adapterCreator: channel.guild.voiceAdapterCreator,
        // });

        // connection.on(
        //     VoiceConnectionStatus.Disconnected,
        //     async (oldState, newState) => {
        //         try {
        //             await Promise.race([
        //                 entersState(
        //                     connection,
        //                     VoiceConnectionStatus.Signalling,
        //                     5_000
        //                 ),
        //                 entersState(
        //                     connection,
        //                     VoiceConnectionStatus.Connecting,
        //                     5_000
        //                 ),
        //             ]);
        //             // Seems to be reconnecting to a new channel - ignore disconnect
        //         } catch (error) {
        //             // Seems to be a real disconnect which SHOULDN'T be recovered from
        //             connection.destroy();
        //             console.log("Voice disconnected");
        //         }
        //     }
        // );
        message.reply(`Connected to voice channel`);
    },
};
