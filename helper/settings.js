const fs = require('fs');

class Settings {
	prefix = null;
	
	constructor() {
		this.loadSettings();
	}
	
	loadSettings() {
		fs.readFile("./settings/settings.json", (err, data) => {
			if (err) throw err;
			const parsedJSON = JSON.parse(data);
			this.prefix = parsedJSON.prefix;
		});
	}
}

module.exports = {
	Settings
};