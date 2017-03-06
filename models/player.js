module.exports = class Player {
	constructor(name){
		this.name = name;
	};

	examine() {
		return this.name;
	}
};