//Takes in a skill, the base chance the check will succeed, the chance increase (in percentile points) per rank in the skill, and the exp awarded for trying and failing. 
//returns "" on a success, or information about the failure if you failed.
exports.skillCheck = function(player, skill, successBase, successSkillMod, exp) {
	roll = Math.floor((Math.random() * 100) + 1)-(player.skills[skill].rank*successSkillMod);
	if (roll <= successBase) {
		return "";
	} else {
		return "Failure! (" + skillIncrease(player, skill, exp) + ")"; 
	}
};
	
//Takes in a skill, adds exp to it, checks for rank increase(s), returns a string with information if you want to show it to the player.
//return "You gained X exp", with or without "Your skill rank increased!"
exports.skillIncrease = function(player, skill, exp) {
	player.skills[skill].exp += exp;
	ranksGained = 0;
	while (player.skills[skill].exp >= Math.pow(player.skills[skill].rank, 1.1) * 100) {
		player.skills[skill].exp -= Math.pow(player.skills[skill].rank, 1.1) * 100;
		player.skills[skill].rank++;
	};
	output = "You gained " + exp + " " + player.skills[skill].name + " EXP!"
	if (ranksGained > 0)
		output += " Your rank increased by " + ranksGained + "!";
	return output;
};

skillIncrease = function(player, skill, exp) {
	player.skills[skill].exp += exp;
	ranksGained = 0;
	while (player.skills[skill].exp >= Math.pow(player.skills[skill].rank, 1.1) * 100) {
		player.skills[skill].exp -= Math.pow(player.skills[skill].rank, 1.1) * 100;
		player.skills[skill].rank++;
	};
	output = "You gained " + exp + " " + player.skills[skill].name + " EXP!"
	if (ranksGained > 0)
		output += " Your rank increased by " + ranksGained + "!";
	return output;
};