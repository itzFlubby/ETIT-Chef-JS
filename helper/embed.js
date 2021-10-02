const Discord = require("discord.js");
const url = require("../private/url.js");
const timestampHelper = require("./timestamp.js");

function constructDefaultEmbed(pClient){
	const embed = new Discord.MessageEmbed()
		.setColor("#009AFF")
		.setAuthor(`${pClient.user.username}#${pClient.user.discriminator}`, pClient.user.displayAvatarURL())
		.setThumbnail(url.NODE_JS_WHITE)
		.setFooter(`${timestampHelper.formatTimestamp(new Date())}`, url.RASPI_ICON);
	return embed;
}

module.exports = {
	constructDefaultEmbed
};