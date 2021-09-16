const Discord = require("discord.js");
const timestampHelper = require("./timestamp.js");

function constructDefaultEmbed(pClient){
	const embed = new Discord.MessageEmbed()
		.setColor("#009AFF")
		.setAuthor(`${pClient.user.username}#${pClient.user.discriminator}`, pClient.user.displayAvatarURL())
		.setThumbnail("attachment://nodejs_white.png")
		.setFooter(`${timestampHelper.formatTimestamp(new Date())}`, "attachment://raspi.png");
	return embed;
}

module.exports = {
	constructDefaultEmbed
};