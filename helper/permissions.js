const ids = require("../private/ids.js");

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
		[ ids.ETIT_BSC, ids.ETIT_MSC, ids.MIT_BSC, ids.MIT_MSC ],
		[ ]
	),
	new PermissionLevel( // 2 MODERATOR
		[ ids.MODERATOR, ids.FACHSCHAFT ],
		[ ]	
	), 
	new PermissionLevel( // 3 DEBUGGER
		[ ids.DEBUGGER ],
		[ ]	
	),
	new PermissionLevel( // 4 ADMIN
		[ ids.ADMIN ],
		[ ]	
	),
	new PermissionLevel( // 5 DEVELOPER
		[ ],
		[ ids.ITZFLUBBY, ids.WUB ]	
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