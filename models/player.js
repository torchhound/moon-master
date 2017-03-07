module.exports = class Player {
	constructor(name){
		this.namePrint = name;
		this.name = name.toLowerCase();
	};

	examine() {
		return this.namePrint;
	}
};