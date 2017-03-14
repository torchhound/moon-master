module.exports = class Room { 
	constructor(name){ //TODO(torchhound) add list of surrounding rooms and then list those in examine i.e. associate rooms together
		this.namePrint = name;
		this.name = name.toLowerCase();
		this.players = [];
		this.inventory = [];
	};
};