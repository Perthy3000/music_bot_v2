const youtubedl = require("youtube-dl-exec");
const {
    createAudioPlayer,
    createAudioResource,
    joinVoiceChannel,
} = require("@discordjs/voice");
const {
    AudioPlayerStatus,
    VoiceConnectionStatus,
    entersState,
} = require("@discordjs/voice");

ffmpeg_options = {
    options: "-vn",
    before_options: "-reconnect 1 -reconnect_streamed 1 -reconnect_delay_max 5",
};

ydl_opts = {
    format: "bestaudio/best",
    "postprocessor-args": [
        {
            key: "FFmpegExtractAudio",
            preferredcodec: "mp3",
            preferredquality: "192",
        },
    ],
    // quiet: true,
    // printJson: true,
    dumpSingleJson: true,
    skipDownload: true,
};

module.exports = {
    name: "play",
    description: "",
    async execute(message, args, client) {
        const guildMember = await message.guild.members.fetch(
            message.author.id
        );
        const channel = guildMember.voice.channel;
        if (!channel)
            return message.reply("You are not connected to voice channel");
        const connection = joinVoiceChannel({
            channelId: channel.id,
            guildId: channel.guildId,
            adapterCreator: channel.guild.voiceAdapterCreator,
        });
        const player = createAudioPlayer();
        const url = (await youtubedl(args[0], ydl_opts)).url;

        const resource = createAudioResource(url);
        player.play(resource);

        connection.subscribe(player);

        player.on(AudioPlayerStatus.Idle, () => {
            console.log("Idle!");
            setTimeout(() => {
                connection.destroy();
                player.stop();
            }, 20000);
        });

        connection.on(
            VoiceConnectionStatus.Disconnected,
            async (oldState, newState) => {
                try {
                    await Promise.race([
                        entersState(
                            connection,
                            VoiceConnectionStatus.Signalling,
                            5_000
                        ),
                        entersState(
                            connection,
                            VoiceConnectionStatus.Connecting,
                            5_000
                        ),
                    ]);
                    // Seems to be reconnecting to a new channel - ignore disconnect
                } catch (error) {
                    // Seems to be a real disconnect which SHOULDN'T be recovered from
                    connection.destroy();
                    player.stop();
                    console.log("Voice disconnected");
                }
            }
        );
        message.reply(`Connected to voice channel`);
    },
};
