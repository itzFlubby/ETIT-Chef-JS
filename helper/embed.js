const Discord = require("discord.js");
const links = require("../private/links.js");
const timestampHelper = require("./timestamp.js");

function constructDefaultEmbed(pClient){
	const embed = new Discord.MessageEmbed()
		.setColor("#009AFF")
		.setAuthor(`${pClient.user.username}#${pClient.user.discriminator}`, pClient.user.displayAvatarURL())
		.setThumbnail(links.NODE_JS_WHITE)
		.setFooter(`${timestampHelper.formatTimestamp(new Date())}`, links.RASPI_ICON);
	return embed;
}

module.exports = {
	constructDefaultEmbed
};