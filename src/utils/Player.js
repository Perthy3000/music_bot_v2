const Discord = require("discord.js");
const { Collection } = require("discord.js");
const Queue = require("./Queue");
const yts = require("yt-search");
const youtubedl = require("youtube-dl-exec");
const EventEmitter = require("events");

const ydl_opts = {
    format: "bestaudio/best",
    "postprocessor-args": [
        {
            key: "FFmpegExtractAudio",
            preferredcodec: "mp3",
            preferredquality: "192",
        },
    ],
    postprocessorArgs: [
        "-vn",
        "-reconnect 1 -reconnect_streamed 1 -reconnect_delay_max 5",
    ],
    dumpSingleJson: true,
    skipDownload: true,
};

const vid_regex = {
    youtubeVid: /^((?:https?:)\/\/)?((?:www|m)\.)?((?:youtube\.com|youtu.be))((?!channel)(?!user)\/(?:[\w\-]+\?v=|embed\/|v\/)?)((?!channel)(?!user)[\w\-]+)(((.*(\?|\&)t=(\d+))(\D?|\S+?))|\D?|\S+?)$/,
    youtubePlaylist: /^((?:https?:)\/\/)?((?:www|m)\.)?((?:youtube\.com)).*(youtu.be\/|list=)([^#&?]*).*/
}

module.exports = class Player extends EventEmitter {
    queues = new Collection();

    /**
     * Player constructor
     * @param {Discord.Client} client
     * @param {Object} options
     */
    constructor(client, options = {}) {
        super();
        this.client = client;
        this.options = options;
    }

    getQueue(guildId) {
        return this.queues.get(guildId);
    }

    createQueue(guild, options) {
        const n_queue = new Queue(guild, this, options);
        this.queues.set(guild.id, n_queue);
        return n_queue;
    }

    search(content) {
        let youtubeLink = vid_regex.youtubeVid.test(content)
        let playlistLink = vid_regex.youtubePlaylist.test(content)
        if (youtubeLink) {
            return youtubedl(content, ydl_opts);
        } else if(playlistLink) {
            return youtubedl(content, ydl_opts);
        } else {
            return yts(content).then((searchResults) => {
                if (searchResults.videos.length > 0) {
                    let vidURL = searchResults.videos[0].url;
                    if (vidURL) return youtubedl(vidURL, ydl_opts);
                }
            });
        }
    }
};
