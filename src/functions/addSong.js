const { Collection } = require("@discordjs/collection");
const { MessageEmbed } = require("discord.js");
const youtubedl = require("youtube-dl-exec");
const yts = require("yt-search");
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

ydl_opts = {
    format: "bestaudio/best",
    "postprocessor-args": [
        {
            key: "FFmpegExtractAudio",
            preferredcodec: "mp3",
            preferredquality: "192",
        },
    ],
    dumpSingleJson: true,
    skipDownload: true,
};

const startupEmbeds = new MessageEmbed()
    .setColor("#0099ff")
    .setTitle("Now Playing: -")
    .setImage("https://i.redd.it/8hkekbti9a221.jpg")
    .setTimestamp()
    .setFooter("Toppiiz © 2021 อิอิ");
const startupContent = "__**Queue list:**__";

const queue = new Collection();

async function addSong(message, foundChannel) {
    var song, vidURL;
    if (message.content.includes("http") || message.content.includes("www")) {
        vidURL = message.content;
    } else {
        const searchResults = await yts(message.content);
        if (searchResults.videos.length > 0) {
            vidURL = searchResults.videos[0].url;
        }
    }
    if (!vidURL)
        return message.channel
            .send("Video not available")
            .then((msg) => setTimeout(() => msg.delete(), 5000));
    song = await youtubedl(vidURL, ydl_opts);
    const server_queue = queue.get(message.guildId);

    if (!server_queue) {
        const channel = message.member.voice.channel;
        if (!channel)
            return message.channel
                .send("You are not connected to voice channel")
                .then((msg) => setTimeout(() => msg.delete(), 5000));

        const queueConstructor = {
            voiceChannel: null,
            player: null,
            songs: [],
            loop: false,
        };

        queue.set(message.guildId, queueConstructor);

        var timerId = null;
        const connection = joinVoiceChannel({
            channelId: channel.id,
            guildId: channel.guildId,
            adapterCreator: channel.guild.voiceAdapterCreator,
        });
        const player = createAudioPlayer();
        const resource = createAudioResource(song.url);
        player.play(resource);

        connection.subscribe(player);

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
                    disconnect(
                        connection,
                        player,
                        message,
                        foundChannel.dataValues.message_id
                    );
                    console.log("Voice disconnected");
                }
            }
        );

        player.on(AudioPlayerStatus.Idle, () => {
            if (!queueConstructor.loop) queueConstructor.songs.shift();
            updateMessage(
                message,
                foundChannel.dataValues.message_id,
                queueConstructor
            );
            if (queueConstructor.songs.length > 0) {
                const song = queueConstructor.songs[0];
                const resource = createAudioResource(song.url);
                player.play(resource);
            } else {
                console.log("Idle!");
                timerId = setTimeout(() => {
                    try {
                        disconnect(
                            connection,
                            player,
                            message,
                            foundChannel.dataValues.message_id
                        );
                    } catch (err) {
                        console.log(err);
                    }
                }, 30000);
            }
        });

        player.on(AudioPlayerStatus.Playing, () => {
            if (timerId) {
                console.log("Clear timer!");
                clearTimeout(timerId);
                timerId = null;
            }
        });

        queueConstructor.voiceChannel = channel;
        queueConstructor.player = player;
        queueConstructor.songs.push({
            title: song.title,
            url: song.url,
            thumbnail: song.thumbnail,
        });

        updateMessage(
            message,
            foundChannel.dataValues.message_id,
            queueConstructor
        );
    } else {
        server_queue.songs.push({
            title: song.title,
            url: song.url,
            thumbnail: song.thumbnail,
        });
        updateMessage(
            message,
            foundChannel.dataValues.message_id,
            server_queue
        );

        const player = server_queue.player;
        if (player.state.status == "idle") {
            const resource = createAudioResource(song.url);
            player.play(resource);
        }
    }
}

function playPause(interaction) {
    const server_queue = queue.get(interaction.guildId);

    if (server_queue) {
        var embed = interaction.message.embeds[0];
        var title = embed.title;
        if (server_queue.player.state.status == "paused") {
            server_queue.player.unpause();
            title = title.replace("【Paused】", "Now Playing");
        } else {
            server_queue.player.pause();
            title = title.replace("Now Playing", "【Paused】");
        }
        embed.setTitle(title);
        interaction.update({ embeds: [embed] });
    }
}

function skip(interaction) {
    const server_queue = queue.get(interaction.guildId);

    if (server_queue) {
        if (server_queue.loop) {
            server_queue.songs.shift();
        }
        server_queue.player.stop();
        interaction.update({});
    }
}

function stop(interaction) {
    const server_queue = queue.get(interaction.guildId);

    if (server_queue) {
        server_queue.songs = [];
        server_queue.player.stop();
        interaction.update({});
    }
}

function loop(interaction) {
    const server_queue = queue.get(interaction.guildId);

    if (server_queue) {
        var embed = interaction.message.embeds[0];
        var title = embed.title;
        if (server_queue.loop) {
            title = title.replace("Now Playing【Loop】", "Now Playing");
        } else {
            title = title.replace("Now Playing", "Now Playing【Loop】");
        }
        server_queue.loop = !server_queue.loop;
        embed.setTitle(title);
        interaction.update({ embeds: [embed] });
    }
}

module.exports = { addSong, playPause, skip, stop, loop };

async function updateMessage(message, messageId, queueConstructor) {
    const rows = (await message.channel.messages.fetch(messageId)).components;
    const buttons = rows[0].components;
    var editedEmbed, editedContent;
    if (!queueConstructor || queueConstructor.songs.length == 0) {
        editedContent = startupContent;
        editedEmbed = startupEmbeds;
        buttons.forEach((button) => {
            if (button.customId !== "clear") button.setDisabled(true);
        });
    } else {
        const currentSong = queueConstructor.songs[0];
        var editedEmbed = new MessageEmbed()
            .setColor("#0099ff")
            .setTitle(
                `Now Playing${queueConstructor.loop ? "【Loop】" : ""}: **\`${
                    currentSong.title
                }\`**`
            )
            .setImage(currentSong.thumbnail)
            .setTimestamp()
            .setFooter("Toppiiz © 2021 อิอิ");
        var editedContent = startupContent;
        for (var i = queueConstructor.songs.length - 1; i > 0; i--) {
            editedContent +=
                "\n" + `\`${i}.\` **${queueConstructor.songs[i].title}**`;
        }
        buttons.forEach((button) => {
            if (button.disabled) button.setDisabled(false);
        });
    }
    message.channel.messages.edit(messageId, {
        content: editedContent,
        embeds: [editedEmbed],
        components: rows,
    });
}

function disconnect(connection, player, message, messageId) {
    connection.destroy();
    player.stop();
    queue.delete(message.guildId);
    updateMessage(message, messageId, null);
}
