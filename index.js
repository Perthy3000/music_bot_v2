require("dotenv").config();
const fs = require("fs");
const { Client, Collection, Intents } = require("discord.js");
const Sequelize = require("sequelize");

const config = require("./config.json");

const TOKEN = process.env.TOKEN;

const sequelize = new Sequelize("sqlite:./db/server.db", {
    logging: false,
});

const Servers = sequelize.define(
    "servers",
    {
        server_id: {
            type: Sequelize.STRING,
            primaryKey: true,
        },
        server_name: Sequelize.STRING,
        channel: {
            type: Sequelize.STRING,
            defaultValue: null,
        },
    },
    {
        createdAt: false,
        updatedAt: false,
    }
);

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
    Servers.sync({ alter: true });
    add_server();
});

client.on("messageCreate", (message) => {
    if (!message.content.startsWith(config.prefix)) return;

    const [opr, ...args] = message.content
        .substring(config.prefix.length)
        .split(" ");
    const command = client.commands.find((cmd) => opr === cmd.name);

    if (opr === "server") {
        // const
        getAll();
    } else {
        if (!command) return message.reply(`\`${opr}\` is not a valid command`);

        command.execute(message, args, client);
    }
});

async function add_server() {
    const all = await client.guilds.fetch();
    all.each(async (guild) => {
        const found = await Servers.findOne({ where: { server_id: guild.id } });
        if (found !== null) return;
        Servers.create({
            server_id: guild.id,
            server_name: guild.name,
        }).catch((error) => {
            console.log(error.name);
        });
        // if (error.name === 'SequelizeUniqueConstraintError') {
        //     return console.log('Server already existed')
        // }
        // return console.log('Something went wrong with adding a server.');
    });
}

async function getAll() {
    const all = await Servers.findAll();
    all.forEach((element) => {
        console.log(element.dataValues);
    });
}

// Login to Discord with your client's token
client.login(TOKEN);
