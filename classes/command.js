class Command {
	constructor(pName, pIsSlashCommand, pPermissionLevel, pUserPermissionBypass){
		this.name = pName;
		this.isSlashCommand = pIsSlashCommand;
		this.permissionLevel = pPermissionLevel;
		this.userPermissionsBypass = pUserPermissionBypass;
	};
}

module.exports = {
	Command
};