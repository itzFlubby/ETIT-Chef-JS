const Discord = require("discord.js");
const embedHelper = require("../helper/embed.js");
const fs = require("fs");
const sendErrorMessageHelper = require("../helper/sendErrorMessage.js");
const { settings } = require("../ETIT-Chef.js");

exports.name = "command";

exports.description = "️Zeigt die Befehlshilfe zu einem Befehl an.";

exports.usage = `${settings.prefix}command {COMMAND}`;

exports.group = "info";

exports.isSlashCommand = false;

exports.permissionLevel = 0;

exports.userPermissionBypass = [];

async function command(pClient, pMessage){
	const command_name = pMessage.content.split(" ")[1];
	
	if (!command_name) {
		sendErrorMessageHelper.sendErrorMessage(
			pClient, 
			pMessage, 
			`Error: Fehlender Parameter`, 
			`Es wurde kein Befehlsname angegeben.\n\n${sendErrorMessageHelper._formatUsage(
				"command",
				[	
					[ "COMMAND", [ "Befehlsname" ] ]
				]
			)}`
		);
		return;
	}
	
	if (!fs.existsSync("./commands/" + command_name + ".js")) {
		sendErrorMessageHelper.sendErrorMessage(
			pClient, 
			pMessage, 
			`Error: Ungültiger Befehlsname`, 
			`Der Befehl \`${settings.prefix}${command_name}\` existiert nicht.`
		);
		return;
	}
	
	const command = require("./" + command_name + ".js");
	
	const embed = embedHelper.constructDefaultEmbed(pClient)
		.setAuthor("❓ Befehlsinfo")
		.addFields(
			{ name: `${settings.prefix}${command.name}`, value: `${command.description}\n⠀`, inline: false },
			{ name: "Verwendung", value: `${command.usage}`, inline: false }
		);
		
	pMessage.channel.send({ 
		embeds: [ embed ], 
	});
	
}

module.exports.run = command;