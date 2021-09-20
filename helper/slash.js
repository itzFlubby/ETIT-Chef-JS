function register_slash_command(pClient, pGuildID, pName, pDescription) {
	pClient.api.applications(pClient.user.id).guilds(pGuildID).commands.post({data: {
		name: pName,
		description: pDescription
	}});
}

async function get_slash_command(pClient, pGuildID, pName) {
	let result = await pClient.api.applications(pClient.user.id).guilds(pGuildID).commands.get();
	return result.find(element => element.name === pName);
}

module.exports = {
	register_slash_command, get_slash_command
};