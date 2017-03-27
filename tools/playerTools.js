var exports = module.exports = {};

//This very very very important fraction determines what fraction of the player's overall health (the health of all of their limbs, together, with weight,) is needed to stay alive. 
//Example: At 2, players must have more than 1/2 (50%) of the standard maximum health of a player's limbs.
//If it were 4, players would only need 1/4 (25%) of the standard maximum health to live.
//The word 'standard' here means, if the player's maximum health is increased, due to having SUPER ROBOT LIMBS or other reasons, that doesn't raise the 'lethal damage level' of the player.
//In other words, the 'lethal damage level' is based on the max health for a NORMAL human, no matter what kind of person you are. 
const HEALTH_TO_LIVE = 2;

//Takes in a skill, the base chance the check will succeed, the chance increase (in percentile points) per rank in the skill, and the exp awarded for trying and failing. 
//returns "" on a success, or information about the failure if you failed.
exports.skillCheck = function(player, skill, successBase, successSkillMod, exp) {
	var roll = Math.floor((Math.random() * 100) + 1)-(player.skills[skill].rank*successSkillMod);
	returnPacket = {text:"", success:false};
	if (roll <= successBase) {
		returnPacket.text = "Success!";
		returnPacket.success = true;
	} else {
		returnPacket.text = "Failure! (" + exports.skillIncrease(player, skill, exp) + ")"; 
	};
	return returnPacket;
};
	
//Takes in a skill, adds exp to it, checks for rank increase(s), returns a string with information if you want to show it to the player.
//return "You gained X exp", with or without "Your skill rank increased!"
exports.skillIncrease = function(player, skill, exp) {
	player.skills[skill].exp += exp;
	ranksGained = 0;
	while (player.skills[skill].exp >= exports.expNeeded(player.skills[skill].rank)) {
		player.skills[skill].exp -= exports.expNeeded(player.skills[skill].rank);
		player.skills[skill].rank++;
	};
	output = "You gained " + exp + " " + player.skills[skill].name + " EXP!"
	if (ranksGained > 0) output += " Your rank increased by " + ranksGained + "!";
	return output;
};

//Calculates the experience required for a skill to increase in rank.
//The rank put in should be the CURRENT rank of the skill, not the one you're trying to reach next.
exports.expNeeded = function(rank) {
	return Math.round(Math.pow(rank, 1.1) * 100)
};

//Set the limb health to a new value. If above max, set to max. If zero or lower, set quality to zero. Returns new health value.
exports.setLimbHealth = function(player, limbNum, adjustment) {
	console.log("before: "+player.limbs[limbNum].health);
	player.limbs[limbNum].health += Number(adjustment);
	console.log("mid: "+player.limbs[limbNum].health);
	if (player.limbs[limbNum].health > player.limbs[limbNum].quality) player.limbs[limbNum].health = player.limbs[limbNum].quality;
	if (player.limbs[limbNum].health <= 0) {
		player.limbs[limbNum].health = 0;
		player.limbs[limbNum].quality = 0;
	};
	console.log("after: "+player.limbs[limbNum].health);
	return player.limbs[limbNum].health;
};

//Pick a random body part for the purpose of targeting 
//Uses a different table for different stances.
exports.getLimbRand = function(player, stance) {
	var output = -1;
	if (stance == 0) {
		var odds = [20, 2, 3, 5, 10, 2, 2, 13, 13, 13, 13, 1, 1, 1, 1];
	};
	//Check that all limbs are not destroyed
	var anyLimb = false;
	for (var i = 0; i < player.limbs.length; i++) {
		if (player.limbs[i].health > 0) anyLimb = true;
	};
	if (anyLimb = false) {
		console.log("WARNING: PLAYER "+player.namePrint+" WAS TARGETED FOR AN ATTACK BUT HAS NO LIMBS");
		return 0;
	};
	while (output < 0) {
		var roll = Math.floor((Math.random() * 100) + 1);
		var limbChoice = 0;
		while (roll > odds[limbChoice]) {
			roll -= odds[limbChoice];
			limbChoice++;
		};
		if (player.limbs[limbChoice].health > 0) { 
			output = limbChoice;
			console.log(roll);
			console.log(player.limbs[output].name)
		};
	};
	return output;
};

//Pick out a limb from the player, based on text input the player gives.
exports.getLimbFromInput = function(player, input) {
	if (input[0] == "body" || input[0] == "chest") input[0] = "torso"
	else if (input[0] == "lung") input[0] = "lungs"
	else if (input[0] == "skull" || input[0] == "face") input[0] = "head"
	else if (input[0] == "arml" || input[0] == "armleft") input[0] = "arm(l)"
	else if (input[0] == "armr" || input[0] == "armright") input[0] = "arm(r)"
	else if (input[0] == "legl" || input[0] == "legleft") input[0] = "leg(l)"
	else if (input[0] == "legr" || input[0] == "legright") input[0] = "leg(r)"
	else if (input[0] == "eye" || input[0] == "eyeleft") input[0] = "eye(l)"
	else if (input[0] == "eyer" || input[0] == "eyeright") input[0] = "eye(r)"
	else if (input[0] == "earl" || input[0] == "earleft") input[0] = "ear(l)"
	else if (input[0] == "earr" || input[0] == "earright") input[0] = "ear(r)"
	else if (input[0] == "left" || input[0] == "l") {
		if (input[1] == "arm") input[0] = "arm(l)"
		else if (input[1] == "leg") input[0] = "leg(l)"
		else if (input[1] == "eye") input[0] = "eye(l)"
		else if (input[1] == "ear") input[0] = "ear(l)";
	}
	else if (input[0] == "right" || input[0] == "r") {
		if (input[1] == "arm") input[0] = "arm(r)"
		else if (input[1] == "leg") input[0] = "leg(r)"
		else if (input[1] == "eye") input[0] = "eye(r)"
		else if (input[1] == "ear") input[0] = "ear(r)";
	}
	else if (input[1] == "left" || input[1] == "l") {
		if (input[0] == "arm") input[0] = "arm(l)"
		else if (input[0] == "leg") input[0] = "leg(l)"
		else if (input[0] == "eye") input[0] = "eye(l)"
		else if (input[0] == "ear") input[0] = "ear(l)";
	}
	else if (input[1] == "right" || input[1] == "r") {
		if (input[0] == "arm") input[0] = "arm(r)"
		else if (input[0] == "leg") input[0] = "leg(r)"
		else if (input[0] == "eye") input[0] = "eye(r)"
		else if (input[0] == "ear") input[0] = "ear(r)";
	};
	for (var i = 0; i < player.limbs.length; i++) {
		if (player.limbs[i].name.toLowerCase() == input[0]) return i;
	};
	return -1;
};

//Returns a string with all information about a player's limb
exports.printLimbStatus = function(player, limbNum) {
	var tmp = player.limbs[limbNum].type+" "+player.limbs[limbNum].name;
	//Check if limb is destroyed or not.
	if (player.limbs[limbNum].quality == 0) tmp += " (DESTROYED)"
	else tmp += " (Health: "+(player.limbs[limbNum].health/player.limbs[limbNum].quality*100).toFixed()+"\% ("+player.limbs[limbNum].health+"/"+player.limbs[limbNum].quality+") (Quality: "+(player.limbs[limbNum].quality/player.limbs[limbNum].qualityStandard*100).toFixed()+"\%)"
	return tmp;
};

//Calculate the total CURRENT health of all of the player's limbs, including weighted value.
exports.healthTotal = function(player) {
	var tmp = 0;
	for (var i = 0; i < player.limbs.length; i++) {
		tmp += player.limbs[i].health * player.limbs[i].weight;
		tmp -= player.limbs[i].qualityStandard * player.limbs[i].weight / HEALTH_TO_LIVE;
	};
	tmp = Math.floor(tmp);
	if (tmp < 0) tmp = 0;
	return tmp;
};

//Calculate the total MAXIMUM health of all of the player's limbs, including weighted value.
exports.healthTotalMax = function(player) {
	var tmp = 0;
	for (var i = 0; i < player.limbs.length; i++) {
		tmp += player.limbs[i].quality * player.limbs[i].weight;
		tmp -= player.limbs[i].qualityStandard * player.limbs[i].weight / HEALTH_TO_LIVE;
	};
	tmp = Math.floor(tmp);
	if (tmp < 0) tmp = 0;
	return tmp;
};

exports.move = function(direction, players, jsonOut, socket, clientLookup, io, map) {
	var position;
	var playerIndex;
	players.forEach(function(result, index) {
		var playerOut = JSON.parse(result);
		if(playerOut.name === jsonOut.name.toLowerCase()) {
			position = playerOut.position;
			playerIndex = index;
		};
	});
	console.log('start position: '+position);
	console.log('start map: '+map.map[0][0]);
	var p1 = position[0], 
		p2 = position[1];
	var oldRoomOut = JSON.parse(map.map[p1][p2]);
	switch(direction) {
		case 'n':
		case 'north':
			if(position[0] === 0) { 
				socket.emit('log', JSON.stringify({"command":"Cannot go any farther north"}));
				return false; 
			};
			break;
		case 's':
		case 'south':
			var pTest = position[0] + 1;
			if(pTest > map.map.length - 1) { 
				socket.emit('log', JSON.stringify({"command":"Cannot go any farther south"}));
				return false;
			};
			break;
		case 'e':
		case 'east':
			var pTest = position[1] + 1;
			if(pTest  > map.map.length - 1) {
				socket.emit('log', JSON.stringify({"command":"Cannot go any farther east"}));
				return false;
			};
			break;
		case 'w':
		case 'west':
			if(position[1] === 0) {
				socket.emit('log', JSON.stringify({"command":"Cannot go any farther west"}));
				return false; 
			};
			break;
		default:
			socket.emit('log', JSON.stringify({'command':'An error occured in your movement'}));
	};
	for(var y in oldRoomOut.players) {
		if(jsonOut.name.toLowerCase() === oldRoomOut.players[y]) {
			oldRoomOut.players.splice(y, 1);
			map.map[p1][p2] = JSON.stringify(oldRoomOut);
		};
	};
	switch(direction) {
		case 'n':
		case 'north':
			position[0]--; 
			break;
		case 's':
		case 'south':
			position[0]++;
			break;
		case 'e':
		case 'east':
			position[1]++;
			break;
		case 'w':
		case 'west':
			position[1]--;
			break;
		default:
			socket.emit('log', JSON.stringify({'command':'An error occured in your movement'}));
	};
	p1 = position[0], 
	p2 = position[1];
 	var newRoomOut = JSON.parse(map.map[p1][p2]);
	if(newRoomOut.players.indexOf(jsonOut.name.toLowerCase()) === -1) {
		for(var x in oldRoomOut.players) {
			clientLookup.forEach(function(result, index) {
				if(result.name === oldRoomOut.players[x]) {
					io.of('/').to(result.socketId).emit('log', JSON.stringify({"command":jsonOut.name+" moved out of your room"}));
				};
			});
		};
		for(var x in newRoomOut.players) {
			clientLookup.forEach(function(result, index) {
				if(result.name === newRoomOut.players[x]) {
					io.of('/').to(result.socketId).emit('log', JSON.stringify({"command":jsonOut.name+" moved into your room"}));
				};
			});
		};
		newRoomOut.players.push(jsonOut.name.toLowerCase());
		map.map[p1][p2] = JSON.stringify(newRoomOut);
		switch(direction) {
			case 'n':
			case 'north': 
				socket.emit('log', JSON.stringify({"command":"You moved north"}));
				break;
			case 's':
			case 'south':
				socket.emit('log', JSON.stringify({"command":"You moved south"}));
				break;
			case 'e':
			case 'east':
				socket.emit('log', JSON.stringify({"command":"You moved east"}));
				break;
			case 'w':
			case 'west':
				socket.emit('log', JSON.stringify({"command":"You moved west"}));
				break;
			default:
				socket.emit('log', JSON.stringify({'command':'An error occured in your movement'}));
		};
	} else {
		switch(direction) {
		case 'n':
		case 'north': 
			console.log('move north: Player already exists in room');
			socket.emit('log', JSON.stringify({'command':'move north: server error'})); 
			break;
		case 's':
		case 'south':
			console.log('move south: Player already exists in room');
			socket.emit('log', JSON.stringify({'command':'move south: server error'}));
			break;
		case 'e':
		case 'east':
			console.log('move east: Player already exists in room');
			socket.emit('log', JSON.stringify({'command':'move east: server error'}));
			break;
		case 'w':
		case 'west':
			console.log('move west: Player already exists in room');
			socket.emit('log', JSON.stringify({'command':'move west: server error'}));
			break;
		default:
			socket.emit('log', JSON.stringify({'command':'An error occured in your movement'}));
		};
	};
	var playerOut = JSON.parse(players[playerIndex]);
	playerOut.position = position;
	players[playerIndex] = JSON.stringify(playerOut);
	console.log('end position: '+position);
	console.log('end map: '+map.map);
};