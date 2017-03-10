module.exports = class Player {
	constructor(name){
		this.namePrint = name;
		this.name = name.toLowerCase();
		//A skill array is made up of 0: Printed name, 1: Rank in the skill, 2: EXP in the skill
		this.skillGrinding = ["Grinding", 1, 0];
	};
	
	examine() {
		return this.namePrint;
	}
	
	
};