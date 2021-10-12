require('dotenv').config()
const fs = require('fs')
const {Client, Collection, Intents} = require('discord.js')
const config = require('./config.json')
// TOKEN = config.token

const TOKEN = process.env.TOKEN

// Create a new client instance
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_VOICE_STATES, Intents.FLAGS.GUILD_MESSAGES] });

client.commands = new Collection();
const commandFiles = fs.readdirSync('./src/commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = require(`./src/commands/${file}`);
	// Set a new item in the Collection
	// With the key as the command name and the value as the exported module
	client.commands.set(command.name, command);
}

// When the client is ready, run this code (only once)
client.once('ready', () => {
	console.log('Ready!');
});

client.on('messageCreate', (message) => {
    if(!message.content.startsWith(config.prefix)) return

    const [opr, ...args] = message.content.substring(config.prefix.length).split(' ')
    const command = client.commands.find(cmd => opr === cmd.name)

    if(!command) return message.reply(`\`${opr}\` is not a valid command`)
    
    command.execute(message, args, client)
})

// Login to Discord with your client's token
client.login(TOKEN);