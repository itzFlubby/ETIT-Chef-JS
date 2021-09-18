const Discord = require("discord.js");

async function sendChannel(pMessage, pMessageOptions){
	return await pMessage.channel.send(pMessageOptions);
}

async function sendSlash(pInteraction, pMessageOptions){
	return await pInteraction.reply(pMessageOptions);
}

async function respondTo(pMessageOrInteraction, pMessageOptions){
	return await (pMessageOrInteraction instanceof Discord.Message) ? sendChannel(pMessageOrInteraction, pMessageOptions) : sendSlash(pMessageOrInteraction, pMessageOptions);
}

module.exports = {
	sendChannel, sendSlash, respondTo
};