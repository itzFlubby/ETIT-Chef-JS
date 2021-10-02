const command = require("../classes/command.js");
const fs = require('fs');
const id = require("../private/id.js");
const slash = require("../helper/slash.js");

async function register_commands(pClient){
	let commands = [];
	
	const commands_folder = fs.readdirSync(__dirname + "/../commands");

	commands_folder.forEach((command_file) => {
		console.log(`Loading ${command_file}...`);
		const command_info = require("../commands/" + command_file);
		commands.push(new command.Command(command_info.name, command_info.group, command_info.isSlashCommand, command_info.permissionLevel, command_info.userPermissionBypass));
		if(command_info.isSlashCommand){
			slash.register_slash_command(pClient, id.ETIT_KIT, command_info.name, command_info.description);
		}
	});

	return commands;
}

module.exports = {
	register_commands
};