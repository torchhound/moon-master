module.exports = class Player {
	constructor(name){
		this.namePrint = name;
		this.name = name.toLowerCase();
		//Skills are stored in an array so that they may be indexed through. For example, for printing info on skills, reducing all experience on death,
		//Or whatever other purposes you can think of.
		this.skills = ["grinding", "imgay", "fakeskill"];
		//A skill object is made up of name (the printed name), Rank in the skill, and EXP in the skill
		this.skills[0] = {name:"Grinding", rank:1, exp:0};
		this.skills[1] = {name:"im gay", rank:1, exp:0};
		this.skills[2] = {name:"fakeskill", rank:1, exp:0};
		//Limbs are stored in a similar method to skills, as above: An array of objects.
		this.limbs = ["torso", "heart", "lungs", "stomach", "head", "jaw", "brain", "armLeft", "armRight", "legLeft", "legRight", "eyeLeft", "eyeRight", "earLeft", "earRight"];
		this.limbs[0] = {name:"Torso", qualityStandard:"100"};
		this.limbs[1] = {name:"Heart", qualityStandard:"10"};
		this.limbs[2] = {name:"Lungs", qualityStandard:"20"};
		this.limbs[3] = {name:"Stomach", qualityStandard:"20"};
		this.limbs[4] = {name:"Head", qualityStandard:"50"};
		this.limbs[5] = {name:"Jaw", qualityStandard:"30"};
		this.limbs[6] = {name:"Brain", qualityStandard:"10"};
		this.limbs[7] = {name:"Arm(L)", qualityStandard:"60"};
		this.limbs[8] = {name:"Arm(R)", qualityStandard:"60"};
		this.limbs[9] = {name:"Leg(L)", qualityStandard:"70"};
		this.limbs[10] = {name:"Leg(R)", qualityStandard:"70"};
		this.limbs[11] = {name:"Eye(L)", qualityStandard:"5"};
		this.limbs[12] = {name:"Eye(R)", qualityStandard:"5"};
		this.limbs[13] = {name:"Ear(L)", qualityStandard:"5"};
		this.limbs[14] = {name:"Ear(R)", qualityStandard:"5"};
		for (var i = 0; i < this.limbs.length; i++) {
			this.limbs[i].quality = this.limbs[i].qualityStandard;
			this.limbs[i].health = this.limbs[i].qualityStandard;
			this.limbs[i].organic = true;
			this.limbs[i].mechanical = false;
		};
		this.position = [0, 0];
		this.inventory = [];
		this.equipment = [];
	};	
};