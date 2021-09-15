function register_slash_command(pClient, pGuildID, pName, pDescription){
	pClient.api.applications(pClient.user.id).guilds(pGuildID).commands.post({data: {
		name: pName,
		description: pDescription
	}});
}

module.exports = {
	register_slash_command
};
