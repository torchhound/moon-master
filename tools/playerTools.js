const fs = require('fs');

var exports = module.exports = {};

//Takes in a skill, the base chance the check will succeed, the chance increase (in percentile points) per rank in the skill, and the exp awarded for trying and failing. 
//returns "" on a success, or information about the failure if you failed.
exports.skillCheck = function(player, skill, successBase, successSkillMod, exp) {
	roll = Math.floor((Math.random() * 100) + 1)-(player.skills[skill].rank*successSkillMod);
	if (roll <= successBase) {
		return "";
	} else {
		return "Failure! (" + exports.skillIncrease(player, skill, exp) + ")"; 
	};
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

exports.move = function(direction, players, jsonOut, mapOut, socket, mapFile, clientLookup, io) {
	var position;
	players.forEach(function(result, index) {
		var playerOut = JSON.parse(result);
		if(playerOut.name === jsonOut.name.toLowerCase()) {
			position = playerOut.position;
		};
	});
	console.log('start position: '+position);
	console.log('start map: '+mapOut.map[0][0]);
	var p1 = position[0], 
		p2 = position[1];
	var oldRoomOut = JSON.parse(mapOut.map[p1][p2]);
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
			if(pTest > mapOut.map.length - 1) { 
				socket.emit('log', JSON.stringify({"command":"Cannot go any farther south"}));
				return false;
			};
			break;
		case 'e':
		case 'east':
			var pTest = position[1] + 1;
			if(pTest  > mapOut.map.length - 1) {
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
			mapOut.map[p1][p2] = JSON.stringify(oldRoomOut);
			fs.writeFileSync(mapFile, JSON.stringify(mapOut));
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
 	var newRoomOut = JSON.parse(mapOut.map[p1][p2]);
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
		mapOut.map[p1][p2] = JSON.stringify(newRoomOut);
		fs.writeFileSync(mapFile, JSON.stringify(mapOut));
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
	players.forEach(function(result, index) {
		var playerOut = JSON.parse(result);
		if(playerOut.name === jsonOut.name.toLowerCase()) {
			playerOut.position = position;
			players[index] = JSON.stringify(playerOut);
		};
	});
	console.log('end position: '+position);
	console.log('end map: '+mapOut.map);
};