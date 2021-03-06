const Discord = require("discord.js");
const embedHelper = require("../helper/embed.js");
const respondMessageOrInteractionHelper = require("../helper/respondMessageOrInteraction.js");
const { settings } = require("../ETIT-Chef.js");

exports.name = "ping";

exports.description = "🏓 Pong";

exports.usage = `${settings.prefix}ping`;

exports.group = "utils";

exports.isSlashCommand = false;

exports.permissionLevel = 0;

exports.userPermissionBypass = [];

function ping(pClient, pMessageOrInteraction) {
	const embed = embedHelper.constructDefaultEmbed(pClient)
		.setColor("#00FF00")
		.setDescription(`:satellite_orbital: Die Latenz zum WebSocket beträgt \`${pClient.ws.ping}ms\``);

	let messageOptions = {
		embeds: [ embed ], 
		ephemeral: true
	};
	
	respondMessageOrInteractionHelper.respondTo(pMessageOrInteraction, messageOptions);
}

module.exports.run = ping;
module.exports.slash = ping;
