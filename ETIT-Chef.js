const Discord = require("discord.js");
const commandHelper = require("./helper/commands.js");
const embedHelper = require("./helper/embed.js");
const ids = require("./private/ids.js");
const md = require("./helper/md.js");
const Settings = require("./helper/settings.js");
const slash = require("./helper/slash.js");
const timestampHelper = require("./helper/timestamp.js");
const tokens = require("./private/tokens.js");
const os = require("os");

const settings = new Settings.Settings();

const commands = commandHelper.register_commands();

const client = new Discord.Client({
		intents: [
			Discord.Intents.FLAGS.DIRECT_MESSAGES,
			Discord.Intents.FLAGS.GUILDS,
			Discord.Intents.FLAGS.GUILD_BANS,
			Discord.Intents.FLAGS.GUILD_EMOJIS_AND_STICKERS,
			Discord.Intents.FLAGS.GUILD_INVITES,
			Discord.Intents.FLAGS.GUILD_MEMBERS,
			Discord.Intents.FLAGS.GUILD_MESSAGES,
			Discord.Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
			Discord.Intents.FLAGS.GUILD_PRESENCES
		],
		partials: [
			"MESSAGE",
			"CHANNEL",
			"REACTION"
		]
});

client.on('ready', () => {
	console.log(`Logged in as ${client.user.tag}!`);
	
	slash.register_slash_command(client, ids.ETIT_KIT, "ping", "pong");
	
	const embed = embedHelper.constructDefaultEmbed(client)
		.setColor("#00FF00")
		.setTitle(md.noStyle("=-=-= Online =-=-="))
		.addFields(
			{ name: "Discord.js Version", value: Discord.version, inline: true },
			{ name: "Server", value: `${os.type()} (${os.arch()}) ${os.release()}`, inline: true },
			{ name: "Latenz", value: `${client.ws.ping} ms`, inline: true },
			{ name: "Intens", value: `${client.options.intents}`, inline: true },
			{ name: "Nutzer", value: `${client.users.cache.size}`, inline: true },
			{ name: "NodeJS", value: `${process.version}`, inline: true },
		)
		.setFooter(`Gestartet am ${timestampHelper.formatTimestamp(client.readyTimestamp)}`, "attachment://raspi.png");

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
});

client.on('messageCreate', async message => {
	if (message.content[0] !== settings.prefix || message.author === client.user){ return; }
	
	if(message.content === ";slash"){
		let command = await slash.get_slash_command(client, message.guild.id, "fuckery");
		console.log(command);
	}
	
	let found_command = false;
	for (let command in commands) {
		if (commands[command].name === message.content.split(" ")[0].substring(1)) {
			require("./commands/" + commands[command].name + ".js").run();
			found_command = true;
		}
	}
	
	if(!found_command){
		const embed = embedHelper.constructDefaultEmbed(client)
			.setColor("#CC0000")
			.setTitle(`Unbekannter Befehl: ${md.noStyle(message.content.split(" ")[0])}`)
			.setDescription(`Dieser Befehl existiert nicht.\nSchau dir mit \`${settings.prefix}help\` eine Hilfe an!`);
			
		message.channel.send({ 
			embeds: [ embed ], 
			files: [
				new Discord.MessageAttachment("private/images/nodejs_white.png", "nodejs_white.png"),
				new Discord.MessageAttachment("private/images/raspi.png", "raspi.png")
			] 
		});
	}

});

client.login(tokens.BOT_TOKEN);

module.exports = {
	settings
};