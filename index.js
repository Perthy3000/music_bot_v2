require("dotenv").config();
const fs = require("fs");
const { Client, Collection, Intents } = require("discord.js");
const ServerModel = require("./src/models/Server");
const ChannelModel = require("./src/models/Channel");
const { connectDb } = require("./src/dbConnect");
const Player = require("./src/utils/Player");
connectDb();

const config = require("./config.json");
const {
    addSong,
    playPause,
    skip,
    stop,
    loop,
} = require("./src/functions/addSong");

const TOKEN = process.env.TOKEN;

// Create a new client instance
const client = new Client({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_VOICE_STATES,
        Intents.FLAGS.GUILD_MESSAGES,
    ],
});

const player = new Player(client, {
    ytdlOptions: {
        quality: "highestaudio",
        highWaterMark: 1 << 25,
    },
});

client.commands = new Collection();
client.player = player;

const commandFiles = fs
    .readdirSync("./src/commands")
    .filter((file) => file.endsWith(".js"));
for (const file of commandFiles) {
    const command = require(`./src/commands/${file}`);
    client.commands.set(command.name, command);
}

// When the client is ready, run this code (only once)
client.once("ready", () => {
    console.log("Ready!");
    add_server();
});

client.on("messageCreate", async (message) => {
    if (message.author.bot) return;
    if (!message.content.startsWith(config.prefix)) {
        const foundChannel = await registeredChannel(message);
        if (foundChannel) {
            const waiting = await message.reply(
                `Please wait. Now adding song(s)`
            );
            addSong(message, foundChannel).then(() => {
                message.delete();
                waiting.delete();
            });
            return;
        }
        return;
    }

    const [opr, ...args] = message.content
        .substring(config.prefix.length)
        .split(" ");
    const command = client.commands.find((cmd) => opr === cmd.name);

    // setTimeout(() => {
    //     if (!message.deleted) message.delete();
    // }, 5000);

    if (!command) return message.reply(`\`${opr}\` is not a valid command`);

    command.execute(message, args, client);
});

client.on("interactionCreate", (interaction) => {
    if (!interaction.isButton()) return;

    if (interaction.customId === "playpause") {
        playPause(interaction);
    } else if (interaction.customId === "skip") {
        skip(interaction);
    } else if (interaction.customId === "stop") {
        stop(interaction);
    } else if (interaction.customId === "loop") {
        loop(interaction);
    }
});

async function add_server() {
    const all = await client.guilds.fetch();
    all.each(async (guild) => {
        const founded = await ServerModel.findOne({ server_id: guild.id });
        if (!founded) {
            ServerModel.create({
                server_id: guild.id,
                server_name: guild.name,
            });
        }
    });
}

async function registeredChannel(message) {
    const channelId = message.channelId;
    const found = await ChannelModel.findOne({ channel_id: channelId });
    return found;
}

// Login to Discord with your client's token
client.login(TOKEN);
