const Discord = require("discord.js");
const embedHelper = require("../helper/embed.js");
const ical = require("ical");
const moment = require("moment-timezone");
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

class Abbreviation {
	constructor(pEmoji, pValue) {
		this.emoji = pEmoji;
		this.value = pValue;
	}
}

replacementDict = {
	"Höhere Mathematik":
		new Abbreviation(":chart_with_upwards_trend:", "HM"),
	"Hoehere Mathematik":
		new Abbreviation(":chart_with_upwards_trend:", "HM"),
	"Inverted Classroom":
		new Abbreviation("", "IC"),
	"Elektronische Schaltungen":
		new Abbreviation(":radio:", "ES"),
	"Elektromagnetische Felder":
		new Abbreviation(":magnet:", "EMF"),
	"Elektromagnetische Wellen":
		new Abbreviation(":magnet:", "EMW"),
	"Komplexe Analysis und Integraltransformationen":
		new Abbreviation(":triangular_ruler:", "KAI"),
	"Informationstechnik":
		new Abbreviation(":computer:", "IT"),
	"Optik und Festkörperelektronik":
		new Abbreviation(":eyes:", "OFE"),
	"Optik und Festkoerperelektronik":
		new Abbreviation(":eyes:", "OFE"),
	"Grundlagen der Hochfrequenztechnik":
		new Abbreviation(":satellite:", "GHF"),
	"Maschinenkonstruktionslehre": 
		new Abbreviation(":gear:", "MKL"),
	"Technische Mechanik": 
		new Abbreviation(":wrench:", "TM"),
	"Elektroenergiesysteme": 
		new Abbreviation(":battery:", "EES"),
	"Signale und Systeme": 
		new Abbreviation(":signal_strength:", "SUS"),
	"Wahrscheinlichkeitstheorie":
		new Abbreviation(":game_die:", "WT"),
	"Elektrische Maschinen und Stromrichter":
		new Abbreviation(":zap:", "EMS"),
	"Nachrichtentechnik":
		new Abbreviation(":satellite:", "NT"),
	"Systemdynamik und Regelungstechnik":
		new Abbreviation(":chart_with_downwards_trend:", "SRT"),
	"Bauelemente der Elektrotechnik":
		new Abbreviation(":electric_plug:", "BE"),
	"Halbleiterbauelemente":
		new Abbreviation(":electric_plug:", "HBE"),
	"Passive Bauelemente":
		new Abbreviation(":electric_plug:", "PE"),
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
	
	return course + pMessage.channel.parent.name[2];
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
  
async function wochenplan(pClient, pMessageOrInteraction, pNow, pCourseAndSemester) {
	let data = ical.parseFile(settings.path + `private/cache/${pCourseAndSemester}.ical`);
	
	let relevantEvents = [];
	let curWeekday = (pNow.getDay() == 0) ? 6 : pNow.getDay() - 1; 
    let startOfWeek = new Date(pNow.setDate(pNow.getDate() - curWeekday));
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
						if (pCourseAndSemester == "all") {
							let roleNames = pMessageOrInteraction.member.roles.cache.map(obj => {
							   return obj.name
							});
							try { // In case someone fucked up naming-scheme
								if (roleNames.indexOf(title.split(" - ")[1].split(" (")[0]) != -1) {
									relevantEvents.push(event);
								}
							} catch (e) {}
						} else {
							relevantEvents.push(event);
						}
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
							if (pCourseAndSemester == "all") {
								let roleNames = pMessageOrInteraction.member.roles.cache.map(obj => {
								   return obj.name
								});
								
								try {  // In case someone fucked up naming-scheme
									if (roleNames.indexOf(title.split("- ")[1].split(" (")[0]) != -1) {
										relevantEvents.push(event);
									}
								} catch (e) {}
							} else {
								relevantEvents.push(event);
							}
						}
					}
				}
			}
		}
	}
	
	const embed = embedHelper.constructDefaultEmbed(pClient)
		.setAuthor(`🗓️ Wochenplan für ${pMessageOrInteraction.member.user.username}`)
		.setDescription(`Woche vom ${moment(startOfWeek).format("DD.MM.yyyy")}`);
	
	let weekdayItems = {};
	
	for (let i in relevantEvents) {
		let relevantEvent = relevantEvents[i];
		
		if (typeof relevantEvent.rrule == "undefined") {
			let tzOffset = moment().tz("Europe/Berlin").utcOffset();
			relevantEvent.start.setMinutes(relevantEvent.start.getMinutes() + tzOffset);
			relevantEvent.end.setMinutes(relevantEvent.end.getMinutes() + tzOffset);
		}
		
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
			value += `\`${moment(weekdayItem[k].start).format("HH:mm")} - ${moment(weekdayItem[k].end).format("HH:mm")}\` ${_shortenSummary(weekdayItem[k].summary)}\n`
		}
		embed.addFields({name: name, value: value, inline: false});
	}
	
	return embed;
}

async function wochenplan_switcher(pClient, pMessageOrInteraction) {
	if (pMessageOrInteraction instanceof Discord.Message) {
		let params = pMessageOrInteraction.content.split(" ").map(elem => elem.toLowerCase());
		let now = new Date();
		
		if (params[1]) {
			let splitted = params[1].split(".");
			now = new Date(`${splitted[2]}-${splitted[1]}-${splitted[0]}T00:00:00`);
			if (JSON.stringify(now) == "null") {
				sendErrorMessageHelper.sendErrorMessage(
					pClient, 
					pMessageOrInteraction, 
					`Error: Ungültiges Datum`, 
					"Stelle sicher, dass dein eingegebenes Datum im Format TT.MM.YYYY ist!"
				);
				return;
			}
		}
		
		let courseAndSemester = _getCourseAndSemester(pMessageOrInteraction);
		
		if (!courseAndSemester) {
			sendErrorMessageHelper.sendErrorMessage(
				pClient, 
				pMessageOrInteraction, 
				`Error: Kurs oder Semester nicht erkannt`, 
				"Dein Semester und Studiengang wurde nicht erkannt.\nVerwende den Befehl in einem Text-Kanal von deinem Semester, oder benutze `/wochenplan` um einen personalisierten Kalender zu erhalten!"
			);
			return;
		}
		let embed = await wochenplan(pClient, pMessageOrInteraction, now, courseAndSemester);
		
		pMessageOrInteraction.channel.send({ 
			embeds: [ embed ], 
		});
	} else {
		let now = new Date();
		if (pMessageOrInteraction.options._hoistedOptions.length > 0) {
			let splitted = pMessageOrInteraction.options.data[0].value.split(".");
			now = new Date(`${splitted[2]}-${splitted[1]}-${splitted[0]}T00:00:00`);
		}
		let embed = await wochenplan(pClient, pMessageOrInteraction, now, "all");
		await pMessageOrInteraction.reply({
			embeds: [ embed ], 
			ephemeral: true 
		});
	}
}

module.exports.run = wochenplan_switcher;
module.exports.slash = wochenplan_switcher;