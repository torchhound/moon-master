module.exports = class Room {
	constructor(name){
		this.name = name;
		this.players = [];
	};

	getPlayers() {
		return this.players;
	};

	addPlayer(player) {
		this.players.push(player);
	}

	removePlayer(player) {
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