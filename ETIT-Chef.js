const tokens = require("./private/tokens.js");
const ids = require("./private/ids.js");
const slash = require("./helper/slash.js");

const { Client, Intents } = require('discord.js');
const client = new Client({ intents: [Intents.FLAGS.GUILDS] });

client.on('ready', () => {
	slash.register_slash_command(client, ids.ETIT_KIT, "ping", "pong");
	console.log(`Logged in as ${client.user.tag}!`);
});

client.on('interactionCreate', async interaction => {
	if (!interaction.isCommand()) return;

	if (interaction.commandName === 'ping') {
		await interaction.reply('Pong!');
	}
});

client.login(tokens.BOT_TOKEN);
