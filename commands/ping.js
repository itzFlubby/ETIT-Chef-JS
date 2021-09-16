const { settings } = require("../ETIT-Chef.js");

exports.name = "ping"

exports.description = "Pong"

exports.usage = `${settings.prefix}ping`

module.exports.run = function() {
	console.log("pong");
}