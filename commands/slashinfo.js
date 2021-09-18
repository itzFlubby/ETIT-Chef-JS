const Discord = require("discord.js");
const embedHelper = require("../helper/embed.js");
const sendErrorMessageHelper = require("../helper/sendErrorMessage.js");
const { settings } = require("../ETIT-Chef.js");
const slashHelper = require("../helper/slash.js");

exports.name = "slashinfo";

exports.description = "️Zeigt Informationen über einen Slash-Befehl an";

exports.usage = `${settings.prefix}slashinfo {NAME}`;

exports.group = "info";

exports.isSlashCommand = false;

exports.permissionLevel = 5;

exports.userPermissionBypass = [];

async function slashinfo(pClient, pMessage) {
	let slash_command_name = pMessage.content.split(" ")[1]
	
	if (!slash_command_name) {
		sendErrorMessageHelper.sendErrorMessage(
			pClient, 
			pMessage, 
			`Error: Fehlender Parameter`, 
			`Der Name des Slash-Befehls, über den die Info angezeigt werden soll, fehlt.\n\nAusführung:\n\`${settings.prefix}slashinfo {NAME}\``
		);
		return;
	}
	
	let slash_command = await slashHelper.get_slash_command(pClient, pMessage.guild.id, slash_command_name);

	if (!slash_command) {
		sendErrorMessageHelper.sendErrorMessage(
			pClient, 
			pMessage, 
			`Error: Ungültiger Name: \`${slash_command_name}\``, 
			`Diese Slash-Befehl existiert nicht.`
		);
		return;
		return;
	}
	
	const embed = embedHelper.constructDefaultEmbed(pClient)
		.setDescription(`:information_source: Slash-Command-Info`)
		.addFields(
			{ name: "Name", value: slash_command.name, inline: true },
			{ name: "Beschreibung", value: slash_command.description, inline: true },
			{ name: "Typ", value: slash_command.type.toString(), inline: true },
			{ name: "ID", value: slash_command.id.toString(), inline: true },
		);

	let messageOptions = {
		embeds: [ embed ], 
		files: [
			new Discord.MessageAttachment("private/images/nodejs_white.png", "nodejs_white.png"),
			new Discord.MessageAttachment("private/images/raspi.png", "raspi.png")
		], 
		ephemeral: true
	};
	
	pMessage.channel.send(messageOptions);
}

module.exports.run = slashinfo;