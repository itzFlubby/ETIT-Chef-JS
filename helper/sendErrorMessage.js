const Discord = require("discord.js");
const embedHelper = require("../helper/embed.js");

function sendErrorMessage(pClient, pMessage, pTitle, pDescription) {
	const embed = embedHelper.constructDefaultEmbed(pClient)
		.setColor("#CC0000")
		.setTitle(pTitle)
		.setDescription(pDescription);
		
	pMessage.channel.send({ 
		embeds: [ embed ], 
		files: [
			new Discord.MessageAttachment("./private/images/nodejs_white.png", "nodejs_white.png"),
			new Discord.MessageAttachment("./private/images/raspi.png", "raspi.png")
		] 
	});
}

module.exports = {
	sendErrorMessage
}