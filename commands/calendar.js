const Discord = require("discord.js");
const embedHelper = require("../helper/embed.js");
const fs = require("fs");
const https = require("https");
const sendErrorMessageHelper = require("../helper/sendErrorMessage.js");
const { settings } = require("../ETIT-Chef.js");
const slashHelper = require("../helper/slash.js");
const url = require("../private/url.js");

exports.name = "calendar";

exports.description = "️Verwaltet einen Kalender.";

exports.usage = `${settings.prefix}calendar {OPTION} {NAME}`;

exports.group = "calendar";

exports.isSlashCommand = true;

exports.permissionLevel = 2;

exports.userPermissionBypass = [];

async function calendar(pClient, pMessage) {
	let options = [ "update" ];
	let params = pMessage.content.split(" ").map(elem => elem.toLowerCase());

	if (params.indexOf(options[0]) == -1) {
		sendErrorMessageHelper.sendErrorMessage(
			pClient, 
			pMessage, 
			`Error: Ungültige Option`, 
			`Die auszuführende Option ist ungültig.\n\n${sendErrorMessageHelper._formatUsage(
				"calendar",
				[	
					[ "OPTIONS", [ "update" ] ],
					[ "NAME", [ "Name des Kalenders" ] ]
				]
			)}`
		);
		return;
	}

	if (Object.keys(url.CALENDAR).indexOf(params[2].toUpperCase()) == -1) {
		sendErrorMessageHelper.sendErrorMessage(
			pClient, 
			pMessage, 
			`Error: Ungültiger Name`, 
			`Der Name des Kalenders ist ungültig.\n\n${sendErrorMessageHelper._formatUsage(
				"calendar",
				[	
					[ "OPTIONS", [ "update" ] ],
					[ "NAME", [ "Name des Kalenders" ] ]
				]
			)}`
		);
		return;
	}
	
	if (!url.CALENDAR[params[2].toUpperCase()]) {
		sendErrorMessageHelper.sendErrorMessage(
			pClient, 
			pMessage, 
			`Error: Ungültiger Kalender`, 
			`Für ${params[2].toUpperCase()} ist leider kein Kalender hinterlegt.`
		);
		return;	
	}
	
	let httpOptions = {
		host: url.CALENDAR.ICAL_HOST,
		port: 443,
		path: url.CALENDAR[params[2].toUpperCase()]
	};

	await https.get(httpOptions, function(res) {
		let body = "";
		res.on("data", function(data) {
			body += data;
		});
		res.on("end", function() {
			fs.writeFile(settings.path + `private/cache/${params[2].toUpperCase()}.ical`, body, { flag: "w+" }, err => {
				if (err) {
					sendErrorMessageHelper.sendErrorMessageToChannel(
						pClient, 
						channel, 
						`Error: \`_updateJson()\`: Datei konnte nicht gespeichert werden.`, 
						`${mdHelper.withStyle("js", err)}`
					);
					return;
				}
			});
		})
		res.on("error", function(e) {
			sendErrorMessageHelper.sendErrorMessageToChannel(
				pClient, 
				channel, 
				`Error: \`_updateJson()\`: Fehler beim API-Aufruf.`, 
				`${mdHelper.withStyle("js", e.message)}`
			);
			return;
		});
	});
	
	const embed = embedHelper.constructDefaultEmbed(pClient)
		.setAuthor("📆 Kalender")
		.addFields({name: params[2].toUpperCase(), value: "Kalender erfolgreich aktualisiert."});
	
	pMessage.channel.send({ 
		embeds: [ embed ], 
	});
	
	return;
	
}

module.exports.run = calendar;
module.exports.slash = calendar;