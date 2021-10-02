const id = require("../private/id.js");

class PermissionLevel {
	constructor(pRoleIDs, pUserIDs) {
		this.roleIDs = pRoleIDs;
		this.userIDs = pUserIDs;
	}
}

const permissionLevels = [
	new PermissionLevel( // 0 EVERYBODY
		[ ],
		[ ]
	),
	new PermissionLevel( // 1 REGISTERED
		[ id.ETIT_BSC, id.ETIT_MSC, id.MIT_BSC, id.MIT_MSC ],
		[ ]
	),
	new PermissionLevel( // 2 MODERATOR
		[ id.MODERATOR, id.FACHSCHAFT ],
		[ ]	
	), 
	new PermissionLevel( // 3 DEBUGGER
		[ id.DEBUGGER ],
		[ ]	
	),
	new PermissionLevel( // 4 ADMIN
		[ id.ADMIN ],
		[ ]	
	),
	new PermissionLevel( // 5 DEVELOPER
		[ ],
		[ id.ITZFLUBBY, id.WUB ]	
	),
];

function getPermissionLevel(pUser) {
	for (let i = 5; i > 0; i--) {
		if (permissionLevels[i].roleIDs.indexOf(pUser.roles.highest.id) != -1){
			return i;
		}
		
		if (permissionLevels[i].userIDs.indexOf(pUser.id) != -1){
			return i;
		}
	}
	
	return 0;
}

function checkPermissionLevel(pMessageAuthor, pPermissionLevel, pUserPermissionBypass) {

	if (getPermissionLevel(pMessageAuthor) >= pPermissionLevel) {
		return true;
	}	
	
	for (role in pMessageAuthor.roles) {
		if (permissionLevels[pPermissionLevel].roleIDs.indexOf(pMessageAuthor.roles[role]) != -1){
			return true;
		}
	}

	return false;
}

module.exports = {
	checkPermissionLevel
};