require("dotenv").config();
const fs = require("fs");
const { Client, Collection, Intents } = require("discord.js");
const { Server } = require("./src/dbObjects");

const config = require("./config.json");

const TOKEN = process.env.TOKEN;

// Create a new client instance
const client = new Client({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_VOICE_STATES,
        Intents.FLAGS.GUILD_MESSAGES,
    ],
});

client.commands = new Collection();

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

client.on("messageCreate", (message) => {
    if (!message.content.startsWith(config.prefix)) return;

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

async function add_server() {
    const all = await client.guilds.fetch();
    all.each(async (guild) => {
        Server.upsert({
            server_id: guild.id,
            server_name: guild.name,
        }).catch((error) => {
            console.log(error.name);
        });
    });
}

// async function getAll() {
//     const all = await Servers.findAll();
//     all.forEach((element) => {
//         console.log(element.dataValues);
//     });
// }

// Login to Discord with your client's token
client.login(TOKEN);
