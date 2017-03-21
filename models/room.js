module.exports = class Room { 
	constructor(name){
		this.namePrint = name;
		this.name = name.toLowerCase();
		this.players = [];
		this.inventory = [];
	};
};