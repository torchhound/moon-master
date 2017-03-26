var exports = module.exports = {};

exports.drop = function(item, jsonOut, socketId, players, map, clientLookup, io) {
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
			io.of('/').to(socketId).emit('log', JSON.stringify({"command":"You dropped "+item+" from your inventory"}));
			foundItem = true;
		};
	});
	if(foundItem == false) {
		equipment.forEach(function(result, index) {
			var equipmentOut = JSON.parse(result);
			if(equipmentOut.name === item){
				droppedItem = equipmentOut;
				equipment.splice(index, 1);
				io.of('/').to(socketId).emit('log', JSON.stringify({"command":"You dropped "+item+" from your equipment"}));
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

exports.pickup = function(item, jsonOut, socketId, players, map, clientLookup, io) {
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
			io.of('/').to(socketId).emit('log', JSON.stringify({"command":"You picked up "+item}));
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

exports.equip = function(item, jsonOut, socketId, players, map, clientLookup, io) {
	var inventory;
	var equipment;
	var position;
	var equipItem;
	var playerIndex;
	var foundItem = false;
	players.forEach(function(result, index) { 
		var playerOut = JSON.parse(result);
		if(playerOut.name === jsonOut.name.toLowerCase()) {
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
			io.of('/').to(socketId).emit('log', JSON.stringify({"command":"You equipped "+item+" from your inventory"}));
			foundItem = true;
		};
	});
	if(foundItem == false) {
		roomOut.inventory.forEach(function(result, index) { 
			var inventoryOut = JSON.parse(result);
			if(inventoryOut.name === item) {
				equipItem = inventoryOut;
				roomOut.inventory.splice(index, 1);
				io.of('/').to(socketId).emit('log', JSON.stringify({"command":"You equipped "+item+" from the ground"}));
				map.map[p1][p2] = JSON.stringify(roomOut);
				foundItem = true;
			};
		});
	};
	equipment.push(JSON.stringify(equipItem));
	var playerOut = JSON.parse(players[playerIndex]);
	playerOut.inventory = inventory;
	playerOut.equipment = equipment;
	players[playerIndex] = JSON.stringify(playerOut);
};

exports.unequip = function(item, jsonOut, socketId, players, map, clientLookup, io) {
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
	io.of('/').to(socketId).emit('log', JSON.stringify({"command":"You unequipped "+item}));
	var playerOut = JSON.parse(players[playerIndex]);
	playerOut.inventory = inventory;
	playerOut.equipment = equipment;
	players[playerIndex] = JSON.stringify(playerOut);
	console.log('unequip after player equipment: '+ playerOut.equipment); 
};