const Discord = require("discord.js");
const {
    createAudioPlayer,
    createAudioResource,
    joinVoiceChannel,
    AudioPlayerStatus,
    VoiceConnectionStatus,
    entersState,
} = require("@discordjs/voice");

module.exports = class Queue {
    tracks = [];
    audioPlayer = createAudioPlayer();
    connection;
    voiceChannel;
    loop;

    /**
     * Queue constructor
     * @param {Discord.guild} guild
     * @param {Object} options
     */
    constructor(guild, player, options = {}) {
        this.guild = guild;
        this.options = options;
        this.player = player;
    }

    join(voiceChannel) {
        this.voiceChannel = voiceChannel;
        this.connection = joinVoiceChannel({
            channelId: this.voiceChannel.id,
            guildId: this.voiceChannel.guildId,
            adapterCreator: this.guild.voiceAdapterCreator,
        });
        this.#registerEvent();
    }

    addTrack(track) {
        // console.log(track);
        if (Array.isArray(track)) {
            this.tracks = this.tracks.concat(track);
        } else {
            this.tracks.push(track);
        }
        this.player.emit("trackUpdate", this);
    }

    play() {
        if (this.audioPlayer.state.status == "idle") {
            const resource = createAudioResource(this.tracks[0].url);
            this.audioPlayer.play(resource);
            this.player.emit("trackUpdate", this);
        }
    }

    setPaused() {
        if (this.audioPlayer.state.status == "paused") {
            this.audioPlayer.unpause();
            return false;
        } else {
            this.audioPlayer.pause();
            return true;
        }
    }

    setLoop() {
        this.loop = !this.loop;
        return this.loop;
    }

    skip() {
        let prevSong = this.tracks[0];
        if (this.loop) this.tracks.push(prevSong);
        this.audioPlayer.stop();
        if (this.audioPlayer.state.status == "paused") {
            this.audioPlayer.unpause();
        }
    }

    stop() {
        this.tracks = [];
        this.audioPlayer.stop();
    }

    #registerEvent() {
        let timerId;
        this.connection.subscribe(this.audioPlayer);

        this.connection.on(VoiceConnectionStatus.Disconnected, async () => {
            try {
                await Promise.race([
                    entersState(
                        this.connection,
                        VoiceConnectionStatus.Signalling,
                        5_000
                    ),
                    entersState(
                        this.connection,
                        VoiceConnectionStatus.Connecting,
                        5_000
                    ),
                ]);
                // Seems to be reconnecting to a new channel - ignore disconnect
            } catch (error) {
                // Seems to be a real disconnect which SHOULDN'T be recovered from
                this.#disconnect();
                console.log("Voice disconnected");
            }
        });

        this.audioPlayer.on(AudioPlayerStatus.Idle, () => {
            let prevSong = this.tracks.shift();
            if (this.loop && prevSong) this.tracks.push(prevSong);
            this.player.emit("trackUpdate", this);
            if (this.tracks.length > 0) {
                const resource = createAudioResource(this.tracks[0].url);
                this.audioPlayer.play(resource);
            } else {
                console.log("Idle!");
                timerId = setTimeout(() => {
                    try {
                        this.#disconnect();
                    } catch (err) {
                        console.log(err);
                    }
                }, 5 * 60 * 1000);
            }
        });

        this.audioPlayer.on(AudioPlayerStatus.Playing, () => {
            if (timerId) {
                console.log("Clear timer!");
                clearTimeout(timerId);
                timerId = null;
            }
        });
    }

    #disconnect() {
        this.connection.destroy();
        this.audioPlayer.stop();
        this.tracks = [];
        this.player.emit("trackUpdate", this);
    }
};
