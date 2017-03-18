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

exports.move = function(direction, players, jsonOut, socket, clientLookup, io, map) {
	var position;
	var playerIndex;
	players.forEach(function(result, index) { //TODO(torchhound) make index a var to eliminate players.forEach at the end
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

exports.drop = function(item, jsonOut, socket, players, map, clientLookup) {
	var inventory;
	var equipment;
	var position;
	var droppedItem;
	var playerIndex;
	var foundItem;
	players.forEach(function(result, index) { 
		var playerOut = JSON.parse(result);
		if(playerOut.name === jsonOut.name.toLowerCase()) {
			console.log('drop before player inventory: '+ playerOut.inventory);
			console.log('drop before player equipment: '+ playerOut.equipment);
			inventory = playerOut.inventory;
			equipment = playerOut.equipment;
			position = playerOut.position;
			playerIndex = index;
		};
	});
	inventory.forEach(function(result, index) {
		var inventoryOut = JSON.parse(result);
		if(inventoryOut.name === item){
			droppedItem = inventoryOut;
			inventory.splice(index, 1);
			socket.emit('log', JSON.stringify({"command":"You dropped "+item+" from your inventory"}));
			foundItem = true;
		};
	});
	if(foundItem == false) {
		equipment.forEach(function(result, index) {
			var equipmentOut = JSON.parse(result);
			if(equipmentOut.name === item){
				droppedItem = equipmentOut;
				equipment.splice(index, 1);
				socket.emit('log', JSON.stringify({"command":"You dropped "+item+" from your equipment"}));
				foundItem = true;
			};
		});
	};
	var p1 = position[0], 
		p2 = position[1];
	var roomOut = JSON.parse(map.map[p1][p2]);
	roomOut.inventory.push(JSON.stringify(droppedItem));
	map.map[p1][p2] = JSON.stringify(roomOut);
	var playerOut = JSON.parse(players[playerIndex]);
	playerOut.inventory = inventory;
	playerOut.equipment = equipment;
	players[playerIndex] = JSON.stringify(playerOut);
	console.log('drop after player inventory: '+ playerOut.inventory); 
	console.log('drop after player equipment: '+ playerOut.equipment); 
};

exports.pickup = function(item, jsonOut, socket, players, map, clientLookup) {
	var inventory;
	var position;
	var pickupItem;
	var playerIndex;
	players.forEach(function(result, index) { 
		var playerOut = JSON.parse(result);
		if(playerOut.name === jsonOut.name.toLowerCase()) {
			console.log('pickup before player inventory: '+ playerOut.inventory);
			inventory = playerOut.inventory;
			position = playerOut.position;
			playerIndex = index;
		};
	});
	var p1 = position[0], 
		p2 = position[1];
	var roomOut = JSON.parse(map.map[p1][p2]);
	roomOut.inventory.forEach(function(result, index) {
		var inventoryOut = JSON.parse(result);
		if(inventoryOut.name === item){
			pickupItem = inventoryOut;
			roomOut.inventory.splice(index, 1);
			socket.emit('log', JSON.stringify({"command":"You picked up "+item}));
		};
	});
	map.map[p1][p2] = JSON.stringify(roomOut);
	inventory.push(JSON.stringify(pickupItem));
	console.log(inventory);
	var playerOut = JSON.parse(players[playerIndex]);
	playerOut.inventory = inventory;
	players[playerIndex] = JSON.stringify(playerOut);
	console.log('pickup after player inventory: '+ playerOut.inventory); 
};

exports.equip = function(item, jsonOut, socket, players, map, clientLookup) {
	var inventory;
	var equipment;
	var position;
	var equipItem;
	var playerIndex;
	var foundItem;
	players.forEach(function(result, index) { 
		var playerOut = JSON.parse(result);
		if(playerOut.name === jsonOut.name.toLowerCase()) {
			console.log('equip before player inventory: '+ playerOut.inventory);
			inventory = playerOut.inventory;
			equipment = playerOut.equipment;
			position = playerOut.position;
			playerIndex = index;
		};
	});
	var p1 = position[0], 
		p2 = position[1];
	var roomOut = JSON.parse(map.map[p1][p2]);
	inventory.forEach(function(result, index) {
			var inventoryOut = JSON.parse(result);
			if(inventoryOut.name === item){
				equipItem = inventoryOut;
				inventory.splice(index, 1);
				socket.emit('log', JSON.stringify({"command":"You equipped "+item+" from your inventory"}));
				foundItem = true;
			};
		});
	if(foundItem == false) {
		roomOut.inventory.forEach(function(result, index) { //TODO(torchhound) Not working
			var inventoryOut = JSON.parse(result);
			if(inventoryOut.name === item) {
				equipItem = inventoryOut;
				roomOut.inventory.splice(index, 1);
				socket.emit('log', JSON.stringify({"command":"You equipped "+item+" from the ground"}));
				map.map[p1][p2] = JSON.stringify(roomOut);
				foundItem = true;
			};
		});
	};
	equipment.push(JSON.stringify(equipItem));
	//console.log(inventory);
	var playerOut = JSON.parse(players[playerIndex]);
	playerOut.inventory = inventory;
	playerOut.equipment = equipment;
	players[playerIndex] = JSON.stringify(playerOut);
	//console.log('pickup after player inventory: '+ playerOut.inventory);
};

exports.unequip = function(item, jsonOut, socket, players, map, clientLookup) {
	var inventory;
	var equipment;
	var unequipItem;
	var playerIndex;
	players.forEach(function(result, index) { 
		var playerOut = JSON.parse(result);
		if(playerOut.name === jsonOut.name.toLowerCase()) {
			console.log('unequip before player equipment: '+ playerOut.equipment);
			inventory = playerOut.inventory;
			equipment = playerOut.equipment;
			playerIndex = index;
		};
	});
	equipment.forEach(function(result, index) {
		var equipmentOut = JSON.parse(result);
		console.log('equipmentOut '+equipmentOut);
		if(equipmentOut.name === item){
			unequipItem = equipmentOut;
			equipment.splice(index, 1);
		};
	});
	inventory.push(JSON.stringify(unequipItem));
	socket.emit('log', JSON.stringify({"command":"You unequipped "+item}));
	//console.log(inventory);
	var playerOut = JSON.parse(players[playerIndex]);
	playerOut.inventory = inventory;
	playerOut.equipment = equipment;
	players[playerIndex] = JSON.stringify(playerOut);
	console.log('unequip after player equipment: '+ playerOut.equipment); 
};