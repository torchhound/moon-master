module.exports = class Player {
	constructor(name){
		this.namePrint = name;
		this.name = name.toLowerCase();
		//Skills are stored in an array so that they may be indexed through. For example, for printing info on skills, reducing all experience on death,
		//Or whatever other purposes you can think of.
		this.skills = ["grinding", "imgay", "fakeskill"];
		//A skill object is made up of name (the printed name), Rank in the skill, and EXP in the skill
		this.skills[0] = {name:"Grinding", rank:1, exp:0}
		this.skills[1] = {name:"im gay", rank:1, exp:0}
		this.skills[2] = {name:"fakeskill", rank:1, exp:0}
		this.position = [0, 0];
		this.inventory = [];
	};	
};