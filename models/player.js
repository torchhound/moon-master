module.exports = class Player {
	constructor(name){
		this.namePrint = name;
		this.name = name.toLowerCase();
		//Skills are stored in an array so that they may be indexed through. For example, for printing info on skills, reducing all experience on death,
		//Or whatever other purposes you can think of.
		this.skills = [];
		//A skill object is made up of name (the printed name), Rank in the skill, and EXP in the skill
		this.skills[0] = {name:"Grinding", rank:1, exp:0};
		this.skills[1] = {name:"im gay", rank:1, exp:0};
		this.skills[2] = {name:"fakeskill", rank:1, exp:0};
		//Limbs are stored in a similar method to skills, as above: An array of objects.
		//name: name of limb, used mostly for display but also for finding the limb when the player enters text.
		//weight: importance. Higher weight contributes more to overall health.
		//qualityStandard is the 'normal' quality for a limb of this type.
		//quality is the quality, or, the max health, of a limb of this type. If you have 0 quality, you have no limb.
		//Health is the health of the limb. Cannot exceed quality. Generally if health reaches zero, the limb is destroyed and removed from the body. (by setting quality to 0)
		//Type shows what the limb is made from. Organic, Mechanical, Biomechanical, or anything else added later. (Alien? Psionic? demonic? who knows, video games!)
		this.limbs = [];
		this.limbs[0] = {name:"Torso", weight:3, qualityStandard:"100"};
		this.limbs[1] = {name:"Heart", weight:10, qualityStandard:"10"};
		this.limbs[2] = {name:"Lungs", weight:5, qualityStandard:"20"};
		this.limbs[3] = {name:"Stomach", weight:3, qualityStandard:"20"};
		this.limbs[4] = {name:"Head", weight:4, qualityStandard:"50"};
		this.limbs[5] = {name:"Jaw", weight:2, qualityStandard:"30"};
		this.limbs[6] = {name:"Brain", weight:10, qualityStandard:"10"};
		this.limbs[7] = {name:"Arm(L)", weight:2, qualityStandard:"60"};
		this.limbs[8] = {name:"Arm(R)", weight:2, qualityStandard:"60"};
		this.limbs[9] = {name:"Leg(L)", weight:2, qualityStandard:"70"};
		this.limbs[10] = {name:"Leg(R)", weight:2, qualityStandard:"70"};
		this.limbs[11] = {name:"Eye(L)", weight:1, qualityStandard:"5"};
		this.limbs[12] = {name:"Eye(R)", weight:1, qualityStandard:"5"};
		this.limbs[13] = {name:"Ear(L)", weight:1, qualityStandard:"5"};
		this.limbs[14] = {name:"Ear(R)", weight:1, qualityStandard:"5"};
		for (var i = 0; i < this.limbs.length; i++) {
			this.limbs[i].quality = this.limbs[i].qualityStandard;
			this.limbs[i].health = this.limbs[i].qualityStandard;
			this.limbs[i].type = "Biological";
		};
		this.position = [0, 0];
		this.inventory = [];
		this.equipment = [];
	};	
};