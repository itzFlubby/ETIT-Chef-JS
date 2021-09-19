const Settings = require("./helper/settings.js");
const settings = new Settings.Settings();

const Discord = require("discord.js");
const commandHelper = require("./helper/commands.js");
const embedHelper = require("./helper/embed.js");
let helpCommand = null;
settings.ready().then(() => { helpCommand = require("./commands/help.js"); });
const ids = require("./private/ids.js");
const links = require("./private/links.js");
const md = require("./helper/md.js");
const slashHelper = require("./helper/slash.js");
const sendErrorMessageHelper = require("./helper/sendErrorMessage.js");
const timestampHelper = require("./helper/timestamp.js");
const tokens = require("./private/tokens.js");
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
		.setTitle(md.noStyle("=-=-= Online =-=-="))
		.addFields(
			{ name: "Discord.js Version", value: Discord.version, inline: true },
			{ name: "Server", value: `${os.type()} (${os.arch()}) ${os.release()}`, inline: true },
			{ name: "Latenz", value: `${client.ws.ping} ms`, inline: true },
			{ name: "Intens", value: `${client.options.intents}`, inline: true },
			{ name: "Nutzer", value: `${client.users.cache.size}`, inline: true },
			{ name: "NodeJS", value: `${process.version}`, inline: true },
		)
		.setFooter(`Insgesamt ${commands.length} Befehle!\nGestartet am ${timestampHelper.formatTimestamp(client.readyTimestamp)}`, links.RASPI_ICON);

	client.channels.cache.get(ids.BOT_TEST_LOBBY).send({ 
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
	
	let found_command = false;
	for (let command in commands) {
		if (commands[command].name === message.content.split(" ")[0].substring(1)) {
			require("./commands/" + commands[command].name + ".js").run(client, message);
			found_command = true;
		}
	}
	
	if(!found_command){
		sendErrorMessageHelper.sendErrorMessage(
			client, 
			message, 
			`Error: Unbekannter Befehl: ${md.noStyle(message.content.split(" ")[0])}`, 
			`Dieser Befehl existiert nicht.\nSchau dir mit \`${settings.prefix}help\` eine Hilfe an!`
		);
	}
});

client.login(tokens.BOT_TOKEN);

module.exports = {
	settings
};