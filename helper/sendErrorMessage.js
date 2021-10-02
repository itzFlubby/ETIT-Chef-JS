const Discord = require("discord.js");
const embedHelper = require("../helper/embed.js");
const { settings } = require("../ETIT-Chef.js");

function _formatUsage(pName, pList) {
	let usage = `Ausführung:\n${settings.prefix}${pName}`;
	let parameters = "";
	for ( parameter in pList ) {
		usage += ` {${pList[parameter][0]}}`;
		parameters += `${pList[parameter][0]} :\n${pList[parameter][1].join(", ")}\n\n`;
	}
	
	return usage + "\n\n" +  parameters;
}

function sendErrorMessage(pClient, pMessage, pTitle, pDescription) {
	const embed = embedHelper.constructDefaultEmbed(pClient)
		.setColor("#CC0000")
		.setTitle(pTitle)
		.setDescription(pDescription);
		
	pMessage.channel.send({ 
		embeds: [ embed ], 
	});
}

function sendErrorMessageToChannel(pClient, pChannel, pTitle, pDescription) {
	const embed = embedHelper.constructDefaultEmbed(pClient)
		.setColor("#CC0000")
		.setTitle(pTitle)
		.setDescription(pDescription);
		
	pChannel.send({ 
		embeds: [ embed ], 
	});
}

module.exports = {
	_formatUsage, sendErrorMessage, sendErrorMessageToChannel
};