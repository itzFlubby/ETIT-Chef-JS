const Discord = require("discord.js");
const embedHelper = require("../helper/embed.js");
const sendErrorMessageHelper = require("../helper/sendErrorMessage.js");
const { settings } = require("../ETIT-Chef.js");

exports.name = "dummy";

exports.description = "Reiner Testbefehl.";

exports.usage = `${settings.prefix}dummy`;

exports.group = "developer";

exports.isSlashCommand = false;

exports.permissionLevel = 4;

exports.userPermissionBypass = [];

function dummy(pClient, pMessage) {
	return;
}

module.exports.run = dummy;