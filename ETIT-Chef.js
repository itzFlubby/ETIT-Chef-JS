let helpCommand, sendErrorMessageHelper = null;
const Settings = require("./helper/settings.js");
const settings = new Settings.Settings();

settings.ready().then(() => { 
	process.env.TZ = settings.timezone;
	helpCommand = require("./commands/help.js"); 
	sendErrorMessageHelper = require("./helper/sendErrorMessage.js");
	settings.path = process.argv[1].replace("ETIT-Chef.js", "");
});

const Discord = require("discord.js");
const commandHelper = require("./helper/commands.js");
const embedHelper = require("./helper/embed.js");
const emoji = require("./private/emoji.js");
const id = require("./private/id.js");
const url = require("./private/url.js");
const mdHelper = require("./helper/md.js");
const permissionHelper = require("./helper/permissions.js");
const slashHelper = require("./helper/slash.js");

const timestampHelper = require("./helper/timestamp.js");
const loginData = require("./private/loginData.js");
const os = require("os");

let commands = null;

const client = new Discord.Client({
		intents: [
			Discord.Intents.FLAGS.DIRECT_MESSAGES,
			Discord.Intents.FLAGS.DIRECT_MESSAGE_REACTIONS,
			Discord.Intents.FLAGS.GUILDS,
			Discord.Intents.FLAGS.GUILD_BANS,
			Discord.Intents.FLAGS.GUILD_EMOJIS_AND_STICKERS,
			Discord.Intents.FLAGS.GUILD_INVITES,
			Discord.Intents.FLAGS.GUILD_MEMBERS,
			Discord.Intents.FLAGS.GUILD_MESSAGES,
			Discord.Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
			Discord.Intents.FLAGS.GUILD_PRESENCES
		],
		partials: [
			"MESSAGE",
			"CHANNEL",
			"REACTION"
		]
});

client.on('ready', async () => {
	console.log(`Logged in as ${client.user.tag}!`);
	
	commands = await commandHelper.register_commands(client);
	 
	const embed = embedHelper.constructDefaultEmbed(client)
		.setColor("#00FF00")
		.setTitle(mdHelper.noStyle("=-=-= Online =-=-="))
		.addFields(
			{ name: "Discord.js Version", value: Discord.version, inline: true },
			{ name: "Server", value: `${os.type()} (${os.arch()}) ${os.release()}`, inline: true },
			{ name: "Latenz", value: `${client.ws.ping} ms`, inline: true },
			{ name: "Intens", value: `${client.options.intents}`, inline: true },
			{ name: "Nutzer", value: `${client.guilds.cache.get(id.serverId.ETIT_KIT).memberCount}`, inline: true },
			{ name: "NodeJS", value: `${process.version}`, inline: true },
		)
		.setFooter(`Insgesamt ${commands.length} Befehle!\nGestartet am ${timestampHelper.formatTimestamp(client.readyTimestamp)}`, url.RASPI_ICON);
	
	await require("./commands/mensa.js").daily_mensa(client);
	
	await client.channels.cache.get(id.channelId.BOT_TEST_LOBBY).send({ 
		embeds: [ embed ], 
	});
});

client.on('interactionCreate', async interaction => {
	if (interaction.isButton()) {
		helpCommand.editHelpEmbed(client, interaction.message, interaction, parseInt(interaction.customId));
	} else if (interaction.isCommand()){
		for (let command in commands) {
			if (commands[command].name === interaction.commandName) {
				require("./commands/" + commands[command].name + ".js").slash(client, interaction);
			}
		}
	}
});

const emojiToRoleId = {   
	"💬": id.roleId.ZITATE, 
	"🎼": id.roleId.MUSIK, 
	"👾": id.roleId.MEMES,
	"🎮": id.roleId.GAMING,
	"😺": id.roleId.KATZEN,
	"💻": id.roleId.TECH_TALK,
	"🎰": id.roleId.SPIELHALLE,
	"🐖": id.roleId.VORLESUNGSSPAM,
	"⚽": id.roleId.SPORT,
	"🚀": id.roleId.STONKS,
	"🎬": id.roleId.MOVIE,
	"🍺": id.roleId.SPONTAN_IN_KA,
	"💥": id.roleId.DISKUSSION,
	"🎨": id.roleId.KUNST_UND_FOTOGRAPHIE,
	"🍕": id.roleId.KOCHEN_ESSEN,
} 

client.on('messageReactionAdd', async (reaction, user) => {
	let guild = client.guilds.cache.get(id.serverId.ETIT_KIT);
	let member = await guild.members.fetch(user);
		
	if (reaction.partial) {
		await reaction.fetch();
	}
	
	// VORSCHLAG
	if ( user.id == id.userId.ITZFLUBBY && reaction.message.channel.id == id.DM_ITZFLUBBY[client.user.id] && [ "✅", "💤", "❌", "👑" ].indexOf(reaction.emoji.name) != -1) {
        let emojiToStatusname = {   
			"✅": "angenommen", 
			"💤": "on hold", 
			"❌": "abgelehnt",
			"👑": "erledigt"
		};
		
		let embed = embedHelper.constructDefaultEmbed(client)
			.setTitle("Vorschlags-Statusänderung")
			.setDescription(`Vorschlag:\n${reaction.message.content.split("'")[1]}\n\nVom ${reaction.message.content.split("| ")[1]}`)
			.addFields({name: `Neuer Status`, value: `${reaction.emoji.name} **${emojiToStatusname[reaction.emoji.name]}**`});
		
        await client.channels.cache.get(id.channelId.BOT_TEST_LOBBY).send({ 
			embeds: [ embed ], 
		});
		
		let userDM = await client.users.cache.get(reaction.message.content.split("(")[1].split(")")[0]).createDM();
		userDM.send({ 
			embeds: [ embed ], 
		});
	}
	
	// PERSONALISIERUNG
	if (reaction.message.id == id.messageId.REMOVE_ROLE_SELECT) {
		await member.roles.remove(guild.roles.cache.get(emojiToRoleId[reaction.emoji.name]));
	}
	
    if (reaction.message.id == id.messageId.MATLAB_SELECT) {
        await member.roles.add(guild.roles.cache.get(id.roleId.MATLAB), "Requested by user.");
	}
	
	// STUDIENGANGAUSWAHL
    if (reaction.message.channel.id == id.channelId.AUSWAHL_STUDIENGANG) {
		let emojiToChannelId = {
			[ emoji.ETIT.id ]: 0, 
			[ emoji.MIT.id ]: 1, 
			[ emoji.KIT.id ]: 2, 
			[ emoji.GAST.id ]: 3 
		};
       
		let roleSetupIds = [];
        if (reaction.message.id == id.messageId.AUSWAHL_BSC) {
            roleSetupIds = [ id.roleId.ETIT_BSC_Einrichtung, id.roleId.MIT_BSC_Einrichtung, id.roleId.KIT_BSC_Einrichtung, id.roleId.GAST ];
        } else if (reaction.message.id == id.messageId.AUSWAHL_MSC) {
            roleSetupIds = [ id.roleId.ETIT_MSC_Einrichtung, id.roleId.MIT_MSC_Einrichtung, id.roleId.KIT_MSC_Einrichtung, id.roleId.GAST ];
        } else {
            return;
        }   
		
        let userRoleIds = member.roles.cache.map((role) => role.id);
		
		let setupRoleId = roleSetupIds[emojiToChannelId[reaction.emoji.id]];
		if (userRoleIds.indexOf(setupRoleId) == -1) {
			await member.roles.add(guild.roles.cache.get(setupRoleId));
			if (setupRoleId == id.roleId.GAST) {
				let rolesToAppend = [];
				for (let roleId of id.roleIdArray.NEW_MEMBER_JOIN_ROLES) {
					if (userRoleIds.indexOf(roleId) == -1) {
						rolesToAppend.push(guild.roles.cache.get(roleId));
					}
				}
				await member.roles.add(rolesToAppend, "User selected Group.");
			}
		}
	}
	
	// MODULAUSWAHL
    if ([ id.channelId.AUSWAHL_ETIT_BSC, id.channelId.AUSWAHL_MIT_BSC, id.channelId.AUSWAHL_ETIT_MSC, id.channelId.AUSWAHL_MIT_MSC ].indexOf(reaction.message.channel.id) != -1) {
		if (reaction.emoji.id == emoji.APPROVE.id){
            
            let channelToRoleId = {
				[ id.channelId.AUSWAHL_ETIT_BSC ]: id.roleId.ETIT_BSC, 
				[ id.channelId.AUSWAHL_MIT_BSC ]: id.roleId.MIT_BSC, 
				[ id.channelId.AUSWAHL_ETIT_MSC ]: id.roleId.ETIT_MSC,
				[ id.channelId.AUSWAHL_MIT_MSC ]: id.roleId.MIT_MSC
			};
            
			let userRoles = Array.from(member.roles.cache.keys());
			
            let userRoleIds = member.roles.cache.map((role) => role.id);
            let setupRoleIds = id.roleIdArray.SETUP_ROLES.filter((roleId) => (userRoleIds.indexOf(roleId) != -1));
			
            if (setupRoleIds.length > 0){ // If user has a setup role
                let setupRoleId = setupRoleIds[0]; // Take first element, because this list WILL only have one element. EVER.
                let setupRole = guild.roles.cache.get(setupRoleId);
                
                userRoles.filter((role) => role != setupRole);
                    
				for (let roleId of id.roleIdArray.NEW_MEMBER_JOIN_ROLES) {
					if (userRoleIds.indexOf(roleId) == -1) {
						userRoles.push(guild.roles.cache.get(roleId));
					}
				}

				if ([ id.roleId.KIT_BSC_Einrichtung, id.roleId.KIT_MSC_Einrichtung ].indexOf(setupRoleId) != -1) {
					let setupRoleToNormalRole = {   
						[ id.roleId.KIT_BSC_Einrichtung ]: id.roleId.KIT_BSC,
						[ id.roleId.KIT_MSC_Einrichtung ]: id.roleId.KIT_MSC
                    };
                    userRoles.push(guild.roles.cache.get(setupRoleToNormalRole[setupRoleId]));
				} else {
					if (userRoleIds.indexOf(channelToRoleId[reaction.message.channel.id]) == -1){
						userRoles.splice(userRoles.indexOf(setupRoleId), 1);//userRoles.filter((role) => role.id != setupRoleId);
						userRoles.push(guild.roles.cache.get(channelToRoleId[reaction.message.channel.id]));
						console.log(userRoles.indexOf(setupRoleId));
					}
				}

                await member.roles.set(userRoles, "User set course.");
			}
			
			if (reaction.message.mentions.roles.length == 0){
				await guild.channels.cache.get(id.channelId.SDADISDIGEN).send(`👤 <@!${user.id}> hat in <#${reaction.message.channel.id}> **${reaction.message.content}** ausgewählt <@!{id.userId.DAVID}>`);
			} else {
				let role = Array.from(reaction.message.mentions.roles.keys())[0];
				if (!member.roles.cache.has(role)) {
					await member.roles.add(role, "Requested by user.");
				}
			}
        }        
	}
	
	// DANKE
	if (reaction.emoji.id == emoji.DANKE.id) {
		let channel = reaction.message.channel;
		
		if (user.id == reaction.message.id) {
			await reaction.message.react("❌");
			return;
		}
        /*
        if modules.gamble._getBalance(botData, message.author.id) == -1:
            modules.gamble._createAccount(botData, message.author.id)
        modules.gamble._addBalance(botData, message.author.id, 1500)
        for reaction in message.reactions:
            if (reaction.me == True) and (reaction.emoji == "✅"):
                return
        await message.add_reaction("✅")
		
		*/
	}
	
});

client.on('messageReactionRemove', async (reaction, user) => {
	let guild = client.guilds.cache.get(id.serverId.ETIT_KIT);
	let member = await guild.members.fetch(user);

	if ([ id.channelId.AUSWAHL_ETIT_BSC, id.channelId.AUSWAHL_MIT_BSC, id.channelId.AUSWAHL_ETIT_MSC ].indexOf(reaction.message.channel.id) != -1) {
		if (reaction.emoji.id == emoji.APPROVE.id) {
			if (Array.from(reaction.message.mentions.roles.keys()).length > 0) {
				await member.roles.remove(Array.from(reaction.message.mentions.roles.keys())[0], "Requested by user.");
			}
		}
	}
    
	if (reaction.message.id == id.messageId.REMOVE_ROLE_SELECT) {
		await member.roles.add(guild.roles.cache.get(emojiToRoleId[reaction.emoji.toString()]));
	}
});

client.on('messageCreate', async message => {
	if (message.content[0] !== settings.prefix || message.author === client.user){ return; }
	
	if (!message.guild) {
		sendErrorMessageHelper.sendErrorMessage(
			client, 
			message, 
			`Error: Kein Server`, 
			`Befehle funktionieren leider nur auf einem Server.`
		);
		return;
	}
	
	let found_command = false;
	for (let commandIndex in commands) {
		if (commands[commandIndex].name === message.content.split(" ")[0].substring(1)) {
			found_command = true;
			const command = require("./commands/" + commands[commandIndex].name + ".js");
			if(permissionHelper.checkPermissionLevel(message.member, command.permissionLevel, command.userPermissionBypass)){
				command.run(client, message);
			} else {
				sendErrorMessageHelper.sendErrorMessage(
					client, 
					message, 
					`Error: Fehlende Berechtigung für ${mdHelper.noStyle(message.content.split(" ")[0])}`, 
					`Leider fehlt dir zur Ausführung dieses Befehls die Berechtigung.\nMelde dich bei <@!${id.userId.ITZFLUBBY}>, wenn du glaubst, dass dies ein Fehler ist.`
				);
			}
		}
	}
	
	if(!found_command){
		sendErrorMessageHelper.sendErrorMessage(
			client, 
			message, 
			`Error: Unbekannter Befehl ${mdHelper.noStyle(message.content.split(" ")[0])}`, 
			`Dieser Befehl existiert nicht.\nSchau dir mit \`${settings.prefix}help\` eine Hilfe an!`
		);
	}
});

process.on('unhandledRejection', async function(error) {
	await sendErrorMessageHelper.sendErrorMessageToChannel(
		client, 
		client.channels.cache.get(id.channelId.BOT_TEST_LOBBY), 
		`Error:`, 
		`${mdHelper.withStyle("js", error)}`
	);
	await client.channels.cache.get(id.channelId.BOT_TEST_LOBBY).send(`:warning: **Trace**${mdHelper.withStyle("js", error.stack)}`);
	
	console.log(error.stack);
});

client.login(loginData.BOT_TOKEN);

module.exports = {
	settings
};