const Discord = require("discord.js");
const { Collection } = require("discord.js");
const Queue = require("./Queue");

module.exports = class Player {
    queues = new Collection();

    /**
     * Player constructor
     * @param {Discord.Client} client
     * @param {Object} options
     */
    constructor(client, options = {}) {
        this.client = client;
        this.options = options;
    }

    getQueue(guildId) {
        return this.queues.get(guildId);
    }

    createQueue(guild, options) {
        const n_queue = new Queue(guild, options);
        this.queues.set(guild.id, n_queue);
        return n_queue;
    }
};
