const Discord = require("discord.js");
const embedHelper = require("../helper/embed.js");
const ical = require("ical");
const moment = require("moment");
const sendErrorMessageHelper = require("../helper/sendErrorMessage.js");
const { settings } = require("../ETIT-Chef.js");
const slashHelper = require("../helper/slash.js");
const timestampHelper = require("../helper/timestamp.js");
exports.name = "wochenplan";

exports.description = "️Zeigt den Wochenplan an.";

exports.usage = `${settings.prefix}wochenplan {TAG}`;

exports.group = "utils";

exports.isSlashCommand = true;

exports.permissionLevel = 1;

exports.userPermissionBypass = [];

replacementDict = {
	"Höhere Mathematik": {
		"emoji": ":chart_with_upwards_trend:",
		"value": "HM"
	},
	"Hoehere Mathematik": {
		"emoji": ":chart_with_upwards_trend:",
		"value": "HM"
	},
	"Inverted Classroom": {
		"emoji": "",
		"value": "IC"
	},
	"Elektronische Schaltungen": {
		"emoji": ":radio:",
		"value": "ES"
	},
	"Elektromagnetische Felder": {
		"emoji": ":magnet:",
		"value": "EMF"
	},
	"Elektromagnetische Wellen": {
		"emoji": ":magnet:",
		"value": "EMW"
	},
	"Komplexe Analysis und Integraltransformationen": {
		"emoji": ":triangular_ruler:",
		"value": "KAI"
	},
	"Informationstechnik": {
		"emoji": ":computer:",
		"value": "IT"
	},
	"Optik und Festkörperelektronik": {
		"emoji": ":eyes:",
		"value": "OFE"
	},
	"Optik und Festkoerperelektronik": {
		"emoji": ":eyes:",
		"value": "OFE"
	},
	"Grundlagen der Hochfrequenztechnik": {
		"emoji": ":satellite:",
		"value": "GHF"
	},
	"Maschinenkonstruktionslehre": {
		"emoji": ":gear:",
		"value": "MKL"
	},
	"Technische Mechanik": {
		"emoji": ":wrench:",
		"value": "TM"
	},
	"Elektroenergiesysteme": {
		"emoji": ":battery:",
		"value": "EES"
exports.slash_data = {
	name: "wochenplan",
	description: "Zeigt den Wochenplan an.",
	options: [
		{
			name: "datum",
			description: "Das Datum, das angezeigt werden soll. Format: TT.MM.YYYY",
			type: 3,
			required: false
		}
	]
};
	}
};

class Exam {
	constructor(pName, pDate, pDuration, pLocation){
		this.name = pName
        this.date = pDate
        this.duration = pDuration
        this.location = pLocation
	}
}

function _getCourseAndSemester(pMessage) {
	let course = "";
	if (pMessage.channel.parent.name.indexOf("ETIT") != -1) {
		course = "ETIT_SEM_";
	} else if (pMessage.channel.parent.name.indexOf("MIT") != -1) {
		course = "MIT_SEM_";
	} else {
		return null;
	}
	
	return course + pMessage.channel.parenty.name[2];
}

function _hasLinkEmbedded(pEvent) {
	if (pEvent.indexOf("zoom") != -1) {
		return true;
	}
	return false;
}
function _shortenSummary(pEventSummary) {
	for (let i in Object.keys(replacementDict)) {
		let replaceCheck = Object.keys(replacementDict)[i];
		if (pEventSummary.indexOf(replaceCheck) != -1) {
			return `${replacementDict[replaceCheck].emoji} ${pEventSummary.replace(replaceCheck, replacementDict[replaceCheck].value)}`.replace("Vorlesung", "VL");
		}
	}
	return pEventSummary;
}
  
async function wochenplan(pClient, pMessage) {
	let params = pMessage.content.split(" ").map(elem => elem.toLowerCase());
	let now = new Date();
	
	if (params[1]) {
		let splitted = params[1].split(".");
		now = new Date(`${splitted[2]}-${splitted[1]}-${splitted[0]}T00:00:00`);
		if (JSON.stringify(now) == "null") {
			sendErrorMessageHelper.sendErrorMessage(
				pClient, 
				pMessage, 
				`Error: Ungültiges Datum`, 
				"Stelle sicher, dass dein eingegebenes Datum im Format TT.MM.YYYY ist!"
			);
			return;
		}
	}
	
	let courseAndSemester = _getCourseAndSemester(pMessage);
	
	
	courseAndSemester = "ETIT_SEM_2";
	
	
	if (!courseAndSemester) {
		sendErrorMessageHelper.sendErrorMessage(
			pClient, 
			pMessage, 
			`Error: Kurs oder Semester nicht erkannt`, 
			"Dein Semester und Studiengang wurde nicht erkannt.\nVerwende den Befehl in einem Text-Kanal von deinem Semester, oder benutze `/wochenplan` um einen personalisierten Kalender zu erhalten!"
		);
		return;
	}
	
	let data = ical.parseFile(settings.path + `private/cache/${courseAndSemester}.ical`);
	
	let relevantEvents = [];
	let curWeekday = (now.getDay() == 0) ? 6 : now.getDay() - 1; 
    let startOfWeek = new Date(now.setDate(now.getDate() - curWeekday));
	startOfWeek.setHours(0, 0, 0);

	let rangeStart = moment(startOfWeek);
	let rangeEnd = rangeStart.clone().add(7, "days");
	
	for (let i in data) {
		if (data.hasOwnProperty(i)) {
			let event = data[i];
			if (data[i].type == "VEVENT") {
				let title = event.summary;
				let startDate = moment(event.start);
				let endDate = moment(event.end);
				let duration = parseInt(endDate.format("x")) - parseInt(startDate.format("x"));
				if (typeof event.rrule == "undefined") {
					if (startDate.isBetween(rangeStart, rangeEnd)) { 
						relevantEvents.push(event);
					}
				} else {
					let dates = event.rrule.between(
					  rangeStart.toDate(),
					  rangeEnd.toDate(),
					  true,
					  function (date, i) { return true; }
					)

					if (event.recurrences != undefined) {
						for (let recurrence in event.recurrences) {
							if (moment(new Date(recurrence)).isBetween(rangeStart, rangeEnd) != true)
							{
								dates.push(new Date(recurrence));
							}
						}
					}
					
					for (let j in dates) {
						let date = dates[j];
						let curEvent = event;
						let relevantRecurrence = true;
						let curDuration = duration;

						startDate = moment(date);

						let dateLookupKey = date.toISOString().substring(0, 10);

						if ((curEvent.recurrences != undefined) && (curEvent.recurrences[dateLookupKey] != undefined)) {
							curEvent = curEvent.recurrences[dateLookupKey];
							startDate = moment(curEvent.start);
							curDuration = parseInt(moment(curEvent.end).format("x")) - parseInt(startDate.format("x"));
						} else if ((curEvent.exdate != undefined) && (curEvent.exdate[dateLookupKey] != undefined)) {
							relevantRecurrence = false;
						}

						let recurrenceTitle = curEvent.summary;
						endDate = moment(parseInt(startDate.format("x")) + curDuration, 'x');

						if (endDate.isBefore(rangeStart) || startDate.isAfter(rangeEnd)) {
							relevantRecurrence = false;
						}

						if (relevantRecurrence == true) {
							relevantEvents.push(event);
						}
					}
				}
			}
		}
	}
	
	const embed = embedHelper.constructDefaultEmbed(pClient)
		.setAuthor(`🗓️ Wochenplan für ${pMessage.author.username}`)
		.setDescription(`Woche vom ${moment(startOfWeek).format("DD.MM.yyyy")}`);
	
	let weekdayItems = {};
	
	for (let i in relevantEvents) {
		let relevantEvent = relevantEvents[i];
		if (!weekdayItems[moment(relevantEvent.start).days()]) {
			weekdayItems[moment(relevantEvent.start).days()] = [];
		}
		weekdayItems[moment(relevantEvent.start).days()].push(relevantEvent);
	}
	
	moment.locale("de");
	
	for (let j in Object.keys(weekdayItems)) {
		let name = moment(new Date(`${startOfWeek.getFullYear()}-${(startOfWeek.getMonth()+1).toString().padStart(2, "0")}-${(startOfWeek.getDate() + parseInt(Object.keys(weekdayItems)[j]) - 1).toString().padStart(2, "0")}T00:00:00`)).format("DD.MM.yyyy (dddd)");
		let value = "";
		let weekdayItem = weekdayItems[Object.keys(weekdayItems)[j]];
		weekdayItem = weekdayItem.sort(
			(a, b) => {
				return moment(a.start) - moment(b.start)
		});
		for (let k = 0; k < weekdayItem.length; k++){
			value += `\`${moment(weekdayItem[k].start).format("hh:mm")} - ${moment(weekdayItem[k].end).format("hh:mm")}\` ${_shortenSummary(weekdayItem[k].summary)}\n`
		}
		embed.addFields({name: name, value: value, inline: false});
	}
	
	pMessage.channel.send({ 
		embeds: [ embed ], 
	});
}

async function slash_wochenplan(pClient, pMessage) {
	
}

module.exports.run = wochenplan;
module.exports.slash = slash_wochenplan;