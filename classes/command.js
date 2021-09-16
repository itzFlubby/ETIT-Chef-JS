class Command {
	constructor(pName, pGroup, pIsSlashCommand, pPermissionLevel, pUserPermissionBypass){
		this.name = pName;
		this.group = pGroup;
		this.isSlashCommand = pIsSlashCommand;
		this.permissionLevel = pPermissionLevel;
		this.userPermissionsBypass = pUserPermissionBypass;
	};
}

module.exports = {
	Command
};