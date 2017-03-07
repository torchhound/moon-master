module.exports = class Room { //The get, add, and remove player methods may be unnecessary in light of our db solution
	constructor(name){ //TODO(torchhound) add list of surrounding rooms and then list those in examine i.e. associate rooms together
		this.namePrint = name;
		this.name = name.toLowerCase();
		this.players = [];
	};

	getPlayers() {
		return this.players;
	};

	addPlayer(player) { //{$push: {players:player.name}}
		this.players.push(player);
	}

	removePlayer(player) { //{$pull: {players:player.name}}
		var rm = this.players.indexOf(player);
		if(rm == -1) {
			return false;
		}
		delete this.players[rm];
	}

	examine() {
		return this.name;
	};
};