const Discord = require("discord.js");
const embedHelper = require("../helper/embed.js");
const sendErrorMessageHelper = require("../helper/sendErrorMessage.js");
const { settings } = require("../ETIT-Chef.js");
const slashHelper = require("../helper/slash.js");

exports.name = "manageslash";

exports.description = "️Verwaltet einen Slash-Befehl.";

exports.usage = `${settings.prefix}manageslash {NAME}`;

exports.group = "developer";

exports.isSlashCommand = false;

exports.permissionLevel = 5;

exports.userPermissionBypass = [];

async function manageslash(pClient, pMessage) {
	const options = [ "info", "remove" ];
	
	const option = pMessage.content.split(" ")[1];
	const slash_command_identifier = pMessage.content.split(" ")[2];
	
	if (!option || options.indexOf(option) == -1 ) {
		sendErrorMessageHelper.sendErrorMessage(
			pClient, 
			pMessage, 
			`Error: Fehlender Parameter`, 
			`Die auszuführende Option ist ungültig.\n\nAusführung:\n\`${settings.prefix}manageslash {OPTION} {IDENTIFIER}\``
		);
		return;
	}
	
	if (!slash_command_identifier) {
		sendErrorMessageHelper.sendErrorMessage(
			pClient, 
			pMessage, 
			`Error: Fehlender Parameter`, 
			`Der Name des Slash-Befehls, über den die Info angezeigt werden soll, fehlt.\n\nAusführung:\n\`${settings.prefix}manageslash {OPTION} {IDENTIFIER}\``
		);
		return;
	}
	
	let slash_command = await slashHelper.get_slash_command(pClient, pMessage.guild.id, slash_command_identifier);
	
	if (!slash_command) {
		sendErrorMessageHelper.sendErrorMessage(
			pClient, 
			pMessage, 
			`Error: Ungültiger Name: \`${slash_command_identifier}\``, 
			`Dieser Slash-Befehl existiert nicht.`
		);
		return;
	}
	
	let embed = embedHelper.constructDefaultEmbed(pClient)
	
	if (option == "info") {
		embed.setDescription(`:information_source: Slash-Command-Info`);
	} else if (option == "remove") {
		embed.setColor("#FF0000")
			.setDescription(`:wastebasket: Slash-Command wird gelöscht...`);
		pClient.api.applications(pClient.user.id).guilds(pMessage.guild.id).commands(slash_command.id.toString()).delete();
	}
	
	embed.addFields(
		{ name: "Name", value: slash_command.name, inline: true },
		{ name: "Beschreibung", value: slash_command.description, inline: true },
		{ name: "Typ", value: slash_command.type.toString(), inline: true },
		{ name: "ID", value: slash_command.id.toString(), inline: true },
	);
	
	const messageOptions = {
		embeds: [ embed ],
		ephemeral: true
	};
	
	pMessage.channel.send(messageOptions);
}

module.exports.run = manageslash;