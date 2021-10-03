let helpCommand, sendErrorMessageHelper = null;
const Settings = require("./helper/settings.js");
const settings = new Settings.Settings();

settings.ready().then(() => { 
	process.env.TZ = settings.timezone;
	helpCommand = require("./commands/help.js"); 
	sendErrorMessageHelper = require("./helper/sendErrorMessage.js");
	settings.path = process.argv[1].replace("ETIT-Chef.js", "");
});

const Discord = require("discord.js");
const commandHelper = require("./helper/commands.js");
const embedHelper = require("./helper/embed.js");
const id = require("./private/id.js");
const url = require("./private/url.js");
const mdHelper = require("./helper/md.js");
const permissionHelper = require("./helper/permissions.js");
const slashHelper = require("./helper/slash.js");

const timestampHelper = require("./helper/timestamp.js");
const loginData = require("./private/loginData.js");
const os = require("os");

let commands = null;

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

client.on('ready', async () => {
	console.log(`Logged in as ${client.user.tag}!`);
	
	commands = await commandHelper.register_commands(client);
	
	const embed = embedHelper.constructDefaultEmbed(client)
		.setColor("#00FF00")
		.setTitle(mdHelper.noStyle("=-=-= Online =-=-="))
		.addFields(
			{ name: "Discord.js Version", value: Discord.version, inline: true },
			{ name: "Server", value: `${os.type()} (${os.arch()}) ${os.release()}`, inline: true },
			{ name: "Latenz", value: `${client.ws.ping} ms`, inline: true },
			{ name: "Intens", value: `${client.options.intents}`, inline: true },
			{ name: "Nutzer", value: `${client.users.cache.size}`, inline: true },
			{ name: "NodeJS", value: `${process.version}`, inline: true },
		)
		.setFooter(`Insgesamt ${commands.length} Befehle!\nGestartet am ${timestampHelper.formatTimestamp(client.readyTimestamp)}`, url.RASPI_ICON);

	client.channels.cache.get(id.BOT_TEST_LOBBY).send({ 
		embeds: [ embed ], 
	});
});

client.on('interactionCreate', async interaction => {
	if (interaction.isButton()) {
		helpCommand.editHelpEmbed(client, interaction.message, interaction, parseInt(interaction.customId));
	} else if (interaction.isCommand()){
		for (let command in commands) {
			if (commands[command].name === interaction.commandName) {
				require("./commands/" + commands[command].name + ".js").slash(client, interaction);
			}
		}
	}
});

client.on('messageCreate', async message => {
	if (message.content[0] !== settings.prefix || message.author === client.user){ return; }
	
	if (!message.guild) {
		sendErrorMessageHelper.sendErrorMessage(
			client, 
			message, 
			`Error: Kein Server`, 
			`Befehle funktionieren leider nur auf einem Server.`
		);
		return;
	}
	
	let found_command = false;
	for (let commandIndex in commands) {
		if (commands[commandIndex].name === message.content.split(" ")[0].substring(1)) {
			found_command = true;
			const command = require("./commands/" + commands[commandIndex].name + ".js");
			if(permissionHelper.checkPermissionLevel(message.member, command.permissionLevel, command.userPermissionBypass)){
				command.run(client, message);
			} else {
				sendErrorMessageHelper.sendErrorMessage(
					client, 
					message, 
					`Error: Fehlende Berechtigung für ${mdHelper.noStyle(message.content.split(" ")[0])}`, 
					`Leider fehlt dir zur Ausführung dieses Befehls die Berechtigung.\nMelde dich bei <@!${id.ITZFLUBBY}>, wenn du glaubst, dass dies ein Fehler ist.`
				);
			}
		}
	}
	
	if(!found_command){
		sendErrorMessageHelper.sendErrorMessage(
			client, 
			message, 
			`Error: Unbekannter Befehl ${mdHelper.noStyle(message.content.split(" ")[0])}`, 
			`Dieser Befehl existiert nicht.\nSchau dir mit \`${settings.prefix}help\` eine Hilfe an!`
		);
	}
});

process.on('unhandledRejection', async function(error) {
	await sendErrorMessageHelper.sendErrorMessageToChannel(
		client, 
		client.channels.cache.get(id.BOT_TEST_LOBBY), 
		`Error:`, 
		`${mdHelper.withStyle("js", error)}`
	);
	await client.channels.cache.get(id.BOT_TEST_LOBBY).send(`:warning: **Trace**${mdHelper.withStyle("js", error.stack)}`);
	
	console.log(error.stack);
});

client.login(loginData.BOT_TOKEN);

module.exports = {
	settings
};