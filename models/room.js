module.exports = class Room { 
	constructor(name){ //TODO(torchhound) add list of surrounding rooms and then list those in examine i.e. associate rooms together
		this.namePrint = name;
		this.name = name.toLowerCase();
		this.players = [];
	};

	getPlayers() {
		return this.players;
	};

	addPlayer(player) { 
		this.players.push(player);
	}

	removePlayer(player) { 
		this.indexOf(player) === -1 ? console.log('Player cannot be removed because they do not exist') : delete this.players[rm];
	}

	examine() {
		return this.name;
	};
};