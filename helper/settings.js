const fs = require('fs');

class Settings {
	promise_ready = false;
	
	prefix = null;
	
	constructor() {
		this.promise_ready = this.loadSettings();
	}
	
	async loadSettings() {
		await fs.readFile("./settings/settings.json", (err, data) => {
			if (err) throw err;
			const parsedJSON = JSON.parse(data);
			this.prefix = parsedJSON.prefix;
			this.timezone = parsedJSON.timezone;
		});
	}
	
	ready() {
		return this.promise_ready;
	}
}

module.exports = {
	Settings
};