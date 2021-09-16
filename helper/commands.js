const command = require("../classes/command.js");

function register_commands(){
	let commands = [];
	const ping = new command.Command("ping", true, "Pong", 0, []);
	commands.push(ping);
	
	return commands;
}

module.exports = {
	register_commands
};