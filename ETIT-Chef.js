const Discord = require('discord.js');
const ids = require("./private/ids.js");
const md = require("./helper/md.js");
const Settings = require("./helper/settings.js");
const slash = require("./helper/slash.js");
const timestamp = require("./helper/timestamp.js");
const tokens = require("./private/tokens.js");
const os = require("os");

const settings = new Settings.Settings();

const client = new Discord.Client({
		intents: [
			Discord.Intents.FLAGS.GUILDS, 
			Discord.Intents.FLAGS.GUILD_MEMBERS, 
			Discord.Intents.FLAGS.GUILD_MESSAGES
		]
});

client.on('ready', () => {
	console.log(`Logged in as ${client.user.tag}!`);
	
	slash.register_slash_command(client, ids.ETIT_KIT, "ping", "pong");
	
	const embed = new Discord.MessageEmbed()
		.setColor("#00FF00")
		.setTitle(md.noStyle("=-=-= Online =-=-="))
		.setAuthor(`${client.user.username}#${client.user.discriminator}`, client.user.displayAvatarURL())
		.setThumbnail("attachment://nodejs_white.png")
		.addFields(
			{ name: "Discord.js Version", value: Discord.version, inline: true },
			{ name: "Server", value: `${os.type()} (${os.arch()}) ${os.release()}`, inline: true },
			{ name: "Latenz", value: `${client.ws.ping} ms`, inline: true },
			{ name: "Intens", value: `${client.options.intents}`, inline: true },
			{ name: "Nutzer", value: `${client.users.cache.size}`, inline: true },
			{ name: "NodeJS", value: `${process.version}`, inline: true },
		)
		.setFooter(`Gestartet am ${timestamp.formatTimestamp(client.readyTimestamp)}`, "attachment://raspi.png");

	client.channels.cache.get(ids.BOT_TEST_LOBBY).send({ 
		embeds: [ embed ], 
		files: [
			new Discord.MessageAttachment("private/images/nodejs_white.png", "nodejs_white.png"),
			new Discord.MessageAttachment("private/images/raspi.png", "raspi.png")
		] 
	});
});

client.on('interactionCreate', async interaction => {
	if (!interaction.isCommand()) return;

	if (interaction.commandName === 'ping') {
		await interaction.reply('Pong!');
	}
});

client.login(tokens.BOT_TOKEN);
