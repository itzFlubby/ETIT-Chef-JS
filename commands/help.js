const commandHelper = require("../classes/command.js");
const Discord = require("discord.js");
const embedHelper = require("../helper/embed.js");
const fs = require("fs");
const respondMessageOrInteractionHelper = require("../helper/respondMessageOrInteraction.js");
const sendErrorMessageHelper = require("../helper/sendErrorMessage.js");
const { settings } = require("../ETIT-Chef.js");

exports.name = "help";

exports.description = "️Zeigt eine Befehlshilfe an.";

exports.usage = `${settings.prefix}help`;

exports.group = "info";

exports.isSlashCommand = false;

exports.permissionLevel = 0;

exports.userPermissionBypass = [];

const groups = [ 
	[ "utils", "🔧" ], 
	[ "info", "ℹ️" ],
	[ "developer", "🖥️" ]
];

function editHelpEmbed(pClient, pHelpMessage, pInteraction) {
	let selectedGroup = (pInteraction != null) ? parseInt(pInteraction.customId.replace("help", "")) : 0;

	let embed = embedHelper.constructDefaultEmbed(pClient)
		.setTitle("❓ Befehlshilfe")
		.setDescription("Klicke unten auf die Knöpfe, um die Befehle aus den jeweiligen Befehls-Gruppen anzuzeigen!");
	
	const commands_folder = fs.readdirSync(__dirname + "/../commands");

	let relevant_commands = [];
	let longest_command_name = 0;
	commands_folder.forEach((command_file) => {
		const command_info = require("../commands/" + command_file);
		if (command_info.group === groups[selectedGroup][0]) {
			relevant_commands.push(command_info);
			if (command_info.name.length > longest_command_name) { longest_command_name = command_info.name.length; }
		}
	});	
	
	
	let command_string = "";
	for (command in relevant_commands) {
		command_string += `\`${settings.prefix}${relevant_commands[command].name.padEnd(longest_command_name, " ")} ${relevant_commands[command].description}\`\n`;
	}
	
	embed.addFields({name: "\u2800", value: command_string});
	
	let actionRow = new Discord.MessageActionRow();
	for (i in groups) {
		let messageButton = new Discord.MessageButton()
			.setCustomId(`help${i}`)
			.setLabel(groups[i][0])
			.setEmoji(groups[i][1]);
		messageButton.setStyle((i == selectedGroup) ? "PRIMARY" : "SECONDARY");
		
		actionRow.addComponents(
			messageButton
		);
	}
	
	if (pInteraction != null){
		let messageOptions = {
			embeds: [ embed ], 
			components: [ actionRow ],
			ephemeral: true
		};
		
		pInteraction.update(messageOptions);
	} else {
		let messageOptions = {
			embeds: [ embed ], 
			components: [ actionRow ],
			ephemeral: true
		};
	
		pHelpMessage.edit(messageOptions);
	}
}

async function help(pClient, pMessageOrInteraction) {
	const helpMessage = await respondMessageOrInteractionHelper.respondTo(pMessageOrInteraction, `<@!${pMessageOrInteraction.author.id}>`);
	editHelpEmbed(pClient, helpMessage, null, 0);
}

module.exports.run = help;
module.exports.slash = help;
module.exports.editHelpEmbed = editHelpEmbed;
