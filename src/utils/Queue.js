const Discord = require("discord.js");
const {
    createAudioPlayer,
    createAudioResource,
    joinVoiceChannel,
} = require("@discordjs/voice");

module.exports = class Queue {
    tracks = [];
    audioPlayer = createAudioPlayer();
    connection;
    voiceChannel;

    /**
     * Queue constructor
     * @param {Discord.guild} guild
     * @param {Object} options
     */
    constructor(guild, options = {}) {
        this.guild = guild;
        this.options = options;
    }

    join(voiceChannel) {
        this.voiceChannel = voiceChannel;
        this.connection = joinVoiceChannel({
            channelId: this.voiceChannel.id,
            guildId: this.voiceChannel.guildId,
            adapterCreator: this.guild.voiceAdapterCreator,
        });
        this.connection.subscribe(this.audioPlayer);
    }

    addTrack(track) {
        console.log(track);
        if (Array.isArray(track)) {
            this.tracks = this.tracks.concat(track);
        } else {
            this.tracks.push(track);
        }
    }

    play() {
        if (this.audioPlayer.state.status == "idle") {
            const resource = createAudioResource(this.tracks[0].url);
            audioPlayer.play(resource);
        }
    }
};
