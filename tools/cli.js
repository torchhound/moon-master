const playerTools = require('./playerTools');
const itemTools = require('./itemTools');

var env = 'development';
var config = require('../config')[env];

var exports = module.exports = {};

//parses commands
exports.parse = function(packet, clientLookup, players, map, socketId, io) {
	var jsonOut = packet.json;
	var commandSplit = packet.commandSplit;
	//GM commands; to disable cheating, simply set 'true' to 'false'
	if (commandSplit[0] == "gm" && true) {
		//To use modhp, type "gm hp [playername] [hpvalue] [limb]"
		//the hpvalue can be positive or negative. It will add or subtract that much HP, but stay within the maximum and minimum.
		//[limb] can also be 'all', in which case all limbs will be modified.
		if (commandSplit[1] == "hp") {
			players.forEach(function(result, index) {
			var target = JSON.parse(result);
				if (commandSplit[2] == target.name.toLowerCase()) {
					if (commandSplit[4] == "all") {
						for (var i = 0; i < target.limbs.length; i++) {
							playerTools.setLimbHealth(target, i, commandSplit[3]);
						};
					}
					else {
						var limbInput = []
						limbInput[0] = commandSplit[4];
						limbInput[1] = commandSplit[5];
						var limbNumber = playerTools.getLimbFromInput(target, limbInput);
						playerTools.setLimbHealth(target, limbNumber, commandSplit[3]);
					};
					players[index] = JSON.stringify(target);
				};
			});
		};
	}
	//Local chat
	 else if(commandSplit[0] == 't' || commandSplit[0] == 'say') {
		msg = JSON.stringify({"namePrint":jsonOut.name+" says", "command":'\"'+jsonOut.command.substr(jsonOut.command.indexOf(" ") + 1)+'\"'});
		io.emit('chat', msg);	
		clientLookup.forEach(function(result, index) {
			if(result.name === jsonOut.name.toLowerCase()) {
				ParseSetTime(io, result, 0);
			};
		});
		return true;
	}
	//Standard Attack
	else if(commandSplit[0] == 'a' || commandSplit[0] == 'attack' || commandSplit[0] == 'hit' || commandSplit[0] == 'punch') {
		if(commandSplit[1] == null) {
			io.of('/').to(socketId).emit('log', JSON.stringify({"command":"You must specify what you want to attack!"}));
			return false
		} else {
			var playerPos = [-1, -1];
			var targetPos = [-2, -2];
			var player;
			var target;
			var playerIndex;
			var targetIndex;
			//Get the position of the player and the player's target
			players.forEach(function(result, index) {
				var playerOut = JSON.parse(result);
				if(jsonOut.name.toLowerCase() === playerOut.name) {
					playerPos = playerOut.position;
					player = playerOut;
					playerIndex = index;

				};
				if (commandSplit[1] === playerOut.name) {
					targetPos = playerOut.position;
					target = playerOut;
					targetIndex = index;
				};
			});					
			//If positions are the same, attack.
			if (playerPos[0] == targetPos[0] && playerPos[1] == targetPos[1]) {
				//TODO(Gosts): Determine what type of weapon player is using. (For now, it is just 'unarmed')
				//TODO(Gosts): Roll skill to see if player hits or misses the target
				//Determine what body part is hit
				var limbHit = playerTools.getLimbRand(target, player.stances[0]);
				//TODO(Gosts): Apply damage
				playerTools.setLimbHealth(target, 0, -1);
				players[targetIndex] = JSON.stringify(target);
				//Output messages for the player, target and any bystanders.
				msg = JSON.stringify({"command":"wowee u sure attacked them"});
				io.of('/').to(socketId).emit('log', msg);
				//Set cooldown for the attacking player
				ParseSetTime(io, player, 4);
				return true;
			}
			else {
				msg = JSON.stringify({"command":"There is no such thing to attack!"});
				io.of('/').to(socketId).emit('log', msg);
				return false;
			};
		};
	}
	//Grind (temporary skill but this can be used as the base for most self-only skills.)
	else if(commandSplit[0] === 'grind') {
		players.forEach(function(result, index) {
			var playerOut = JSON.parse(result);
			if (jsonOut.name.toLowerCase() === playerOut.name.toLowerCase()) {
				skillOut = playerTools.skillCheck(playerOut, 0, 50, 10, 100);
				msg = skillOut.text;
				//If EXP has changed, update player
				if (skillOut.success == false) players[index] = JSON.stringify(playerOut);
				//Print results
				io.of('/').to(socketId).emit('log', JSON.stringify({"command":msg}));
				return true;
			};
		});
		clientLookup.forEach(function(result, index) {
			if(result.name === jsonOut.name.toLowerCase()) {
				ParseSetTime(io, result, 0);
			};
		});
	}
	else if(commandSplit[0] === 'pickup'  || commandSplit[0] === 'g' || commandSplit[0] === 'take' || commandSplit[0] === 'get' || commandSplit[0] === 'grab' || commandSplit[0] === 'pick') {
		if(commandSplit[1] == null){
			io.of('/').to(socketId).emit('log', JSON.stringify({"command":"There is no \""+jsonOut.command.substr(jsonOut.command.indexOf(" ") + 1)+"\" to pickup"}));
			return false;
		} else if(commandSplit[1] != null) {
			var check = itemTools.pickup(commandSplit[1], jsonOut, socketId, players, map, clientLookup, io);
			if(check == true) {
				clientLookup.forEach(function(result, index) {
					if(result.name === jsonOut.name.toLowerCase()) {
						ParseSetTime(io, result, 1);
					};
				});
			};
			return check;
		} else {
			io.of('/').to(socketId).emit('log', JSON.stringify({"command":"There is no \""+jsonOut.command.substr(jsonOut.command.indexOf(" ") + 1)+"\" to pickup"}));
			return false;
		};
	}
	else if(commandSplit[0] === 'drop' || commandSplit[0] === 'd') {
		if(commandSplit[1] == null){
			io.of('/').to(socketId).emit('log', JSON.stringify({"command":"There is no \""+jsonOut.command.substr(jsonOut.command.indexOf(" ") + 1)+"\" to drop"}));
			return false;
		} else if(commandSplit[1] != null) { 
			var check = itemTools.drop(commandSplit[1], jsonOut, socketId, players, map, clientLookup, io);
			if(check == true) {
				clientLookup.forEach(function(result, index) {
					if(result.name === jsonOut.name.toLowerCase()) {
						ParseSetTime(io, result, 1);
					};
				});
			};
			return check;
		} else {
			io.of('/').to(socketId).emit('log', JSON.stringify({"command":"There is no \""+jsonOut.command.substr(jsonOut.command.indexOf(" ") + 1)+"\" to drop"}));
			return false;
		};
	}
	else if(commandSplit[0] === 'equip' || commandSplit[0] === 'q') {
		if(commandSplit[1] == null){
			io.of('/').to(socketId).emit('log', JSON.stringify({"command":"There is no \""+jsonOut.command.substr(jsonOut.command.indexOf(" ") + 1)+"\" to equip"}));
			return false;
		} else if(commandSplit[1] != null) { 
			var check = itemTools.equip(commandSplit[1], jsonOut, socketId, players, map, clientLookup, io);
			if(check == true) {
				clientLookup.forEach(function(result, index) {
					if(result.name === jsonOut.name.toLowerCase()) {
						ParseSetTime(io, result, 1);
					};
				});
			};
			return check;
		} else {
			io.of('/').to(socketId).emit('log', JSON.stringify({"command":"There is no \""+jsonOut.command.substr(jsonOut.command.indexOf(" ") + 1)+"\" to equip"}));
			return false;
		};
	}
	else if(commandSplit[0] === 'unequip' || commandSplit[0] === 'u') {
		if(commandSplit[1] == null){
			io.of('/').to(socketId).emit('log', JSON.stringify({"command":"There is no \""+jsonOut.command.substr(jsonOut.command.indexOf(" ") + 1)+"\" to unequip"}));
			return false;
		} else if(commandSplit[1] != null) { 
			var check = itemTools.unequip(commandSplit[1], jsonOut, socketId, players, map, clientLookup, io);
			if(check == true) {
				clientLookup.forEach(function(result, index) {
					if(result.name === jsonOut.name.toLowerCase()) {
						ParseSetTime(io, result, 1);
					};
				});
			};
			return check;
		} else {
			io.of('/').to(socketId).emit('log', JSON.stringify({"command":"There is no \""+jsonOut.command.substr(jsonOut.command.indexOf(" ") + 1)+"\" to unequip"}));
			return false;
		};
	}
	//If command is "move"
	else if(commandSplit[0] === 'move' || commandSplit[0] === 'go') {
		if(commandSplit[1] == null){
			io.of('/').to(socketId).emit('log', JSON.stringify({"command":"There is no \""+jsonOut.command.substr(jsonOut.command.indexOf(" ") + 1)+"\" to move to"}));
			return false;
		} else if(commandSplit[1] != null) { 
			var check = playerTools.move(commandSplit[1], players, jsonOut, socketId, clientLookup, io, map);
			if(check == true) {
				clientLookup.forEach(function(result, index) {
					if(result.name === jsonOut.name.toLowerCase()) {
						ParseSetTime(io, result, 3);
					};
				});
			};
			return check;
		} else {
			io.of('/').to(socketId).emit('log', JSON.stringify({"command":"There is no \""+jsonOut.command.substr(jsonOut.command.indexOf(" ") + 1)+"\" to move to"}));
			return false;
		};
	}
	//If command is "examine"
	else if(commandSplit[0] === 'look' || commandSplit[0] === 'l' || commandSplit[0] === 'x' || commandSplit[0] === 'ex' ||commandSplit[0] === 'examine') {
		var foundTarget = false;
		if(commandSplit[1] == null) {
			io.of('/').to(socketId).emit('log', JSON.stringify({"command":"You must specify what you want to look at!"}));
			foundTarget = true;
			return false;
		} else if(commandSplit[1] === 'room'){
			//Examine Room
			for(var x = 0; x < map.map.length; x++) {
				var row = map.map[x];
				for(var y = 0; y < row.length; y++) {
					var roomOut = JSON.parse(row[y]);
					for(var p in roomOut.players) {
						if(jsonOut.name.toLowerCase() === roomOut.players[p]) {
							msg = JSON.stringify({"command":"examine: "+roomOut.name+"; Players: "+roomOut.players+"; Contents: "+roomOut.inventory});
							io.of('/').to(socketId).emit('log', msg);
							foundTarget = true;
							clientLookup.forEach(function(result, index) {
								if(result.name === jsonOut.name.toLowerCase()) {
									ParseSetTime(io, result, 0);
								};
							});
							return true;
						};
					};
				};
			};			
		} else {
			//Examine Player
			var playerPos = [-1, -1]; //WATCH
			var targetPos = [-2, -2];
			var target;
			var playerIndex;
			//Get the position of the player and the player's target
			players.forEach(function(result, index) {
				var playerOut = JSON.parse(result);
				if(jsonOut.name.toLowerCase() === playerOut.name) {
					playerPos = playerOut.position;
					playerIndex = index;
				};
				if (commandSplit[1] === playerOut.name) {
					targetPos = playerOut.position;
					target = playerOut;
				};
			});					
			//If positions are the same, output info on target
			if (playerPos[0] == targetPos[0] && playerPos[1] == targetPos[1]) {
				foundTarget = true;
				//Check if the player is asking about a specific limb.
				var limbInput = []
				limbInput[0] = commandSplit[2];
				limbInput[1] = commandSplit[3];
				var limbNumber = playerTools.getLimbFromInput(target, limbInput);
				msg = JSON.stringify({"command":"Name: "+target.namePrint});
				io.of('/').to(socketId).emit('log', msg);
				//Check if the player is asking about the health of the target.
				if (commandSplit[2] == "limbs" || commandSplit[2] == "limbs" || commandSplit[2] == "health" || commandSplit[2] == "hp") {
					//Print total health, then limb health.
					msg = JSON.stringify({"command":"General Health: "+(playerTools.healthTotal(target)/playerTools.healthTotalMax(target)*100).toFixed()+"\% ("+playerTools.healthTotal(target)+"/"+playerTools.healthTotalMax(target)+")"});
					io.of('/').to(socketId).emit('log', msg);
					for (var i = 0; i < target.limbs.length; i++) {
						msg = JSON.stringify({"command":playerTools.printLimbStatus(target, i)});
						io.of('/').to(socketId).emit('log', msg);
					};
					clientLookup.forEach(function(result, index) {
						if(result.name === jsonOut.name.toLowerCase()) {
							ParseSetTime(io, result, 0);
						};
					});
					return true;
				}
				else if (limbNumber != -1) {
					//Player wants to know about a specific limb
					msg = JSON.stringify({"command":playerTools.printLimbStatus(target, limbNumber)});
					io.of('/').to(socketId).emit('log', msg);
					clientLookup.forEach(function(result, index) {
						if(result.name === jsonOut.name.toLowerCase()) {
							ParseSetTime(io, result, 0);
						};
					});
					return true;
				} else {
					//If none of the above options are true then the player just wants to know general info on the target.
					//Print total health
					msg = JSON.stringify({"command":"General Health: "+(playerTools.healthTotal(target)/playerTools.healthTotalMax(target)*100).toFixed()+"\% ("+playerTools.healthTotal(target)+"/"+playerTools.healthTotalMax(target)+")"});
					io.of('/').to(socketId).emit('log', msg);
					//Print limb health (in this case, for general overview, ONLY print a limb if a limb is injured. Don't display more than 5 to avoid chat spam.)
					var numInjured = 0;
					for (var i = 0; i < target.limbs.length; i++) {
						if (target.limbs[i].health < target.limbs[i].quality || target.limbs[i].quality == 0) {
							numInjured++;
							if (numInjured <= 5) {
								msg = JSON.stringify({"command":playerTools.printLimbStatus(target, i)});
								io.of('/').to(socketId).emit('log', msg);
							};	
						};
					};
					if (numInjured > 5) {
						msg = JSON.stringify({"command":"+"+(numInjured-5)+" more injured limbs."});
						io.of('/').to(socketId).emit('log', msg);
						msg = JSON.stringify({"command":"(Use \"look [name] hp\" to see all limbs)."});
						io.of('/').to(socketId).emit('log', msg);
					};
					msg = JSON.stringify({"command":"Equipment: "+target.equipment});
					io.of('/').to(socketId).emit('log', msg);
					//Print Skills
					for (var i = 0; i < target.skills.length; i++) {
						msg = JSON.stringify({"command":target.skills[i].name+": Rank "+target.skills[i].rank+" (EXP: "+target.skills[i].exp+"/"+playerTools.expNeeded(target.skills[i].rank)+")"});
						io.of('/').to(socketId).emit('log', msg);
					};	
					clientLookup.forEach(function(result, index) {
						if(result.name === jsonOut.name.toLowerCase()) {
							ParseSetTime(io, result, 0);
						};
					});
					return true;	
				};
			};
			//Examine Item
			if (foundTarget == false) {
				var p1 = playerPos[0],
					p2 = playerPos[1];
				var roomOut = JSON.parse(map.map[p1][p2]);
				var playerOut = JSON.parse(players[playerIndex]);
				playerOut.inventory.forEach(function(result, index) { //Examine item in your own inventory
					var inventoryOut = JSON.parse(result);
					if(inventoryOut.name === commandSplit[1]) {
						console.log(inventoryOut);
						io.of('/').to(socketId).emit('log', JSON.stringify({"command":inventoryOut.name})); //TODO(torchhound) add more item attributes
						foundTarget = true;
						clientLookup.forEach(function(result, index) {
							if(result.name === jsonOut.name.toLowerCase()) {
								ParseSetTime(io, result, 0);
							};
						});
						return true;
					};
				});
				for(var y in roomOut.players) { //Examine item in any player's equipment in the current room
					players.forEach(function(result, index) { 
						var playerOut = JSON.parse(result);
						if(roomOut.players[y] === playerOut.name) {
							for(var x in playerOut.equipment){
								var equipmentOut = JSON.parse(playerOut.equipment[x]);
								if(equipmentOut.name === commandSplit[1]) {
									io.of('/').to(socketId).emit('log', JSON.stringify({"command":equipmentOut.name}));
									foundTarget = true;
									clientLookup.forEach(function(result, index) {
										if(result.name === jsonOut.name.toLowerCase()) {
											ParseSetTime(io, result, 0);
										};
									});
									return true;
								};
							};
						};
					});
				};
				if(foundTarget == false) { //Examine item in the room's inventory
					roomOut.inventory.forEach(function(result, index) {
						var inventoryOut = JSON.parse(result);
						if(inventoryOut.name === commandSplit[1]){
							console.log(inventoryOut);
							io.of('/').to(socketId).emit('log', JSON.stringify({"command":inventoryOut.name})); //TODO(torchhound) add more item attributes
							foundTarget = true;
							clientLookup.forEach(function(result, index) {
								if(result.name === jsonOut.name.toLowerCase()) {
									ParseSetTime(io, result, 0);
								};
							});
							return true;
						};
					});
				};
			};
		};
		if (foundTarget == false) {
			msg = JSON.stringify({"command":"There is no such thing to look at!"});
			io.of('/').to(socketId).emit('log', msg);
			return false;
		};
	}
	//If command is not a valid command
	else {
		msg = JSON.stringify({"command":"Invalid Command: "+jsonOut.command});
		io.of('/').to(socketId).emit('log', msg);
		return false;
	};
};

ParseSetTime = function(io, player, time) {
	if (time == 0) return;
	var seconds = Math.round(new Date().getTime() / 1000); 
	var time = seconds + time;
	player.timer = time; 
	console.log('player.timer: '+(player.timer - seconds)); 
	io.of('/').to(player.socketId).emit('timer', JSON.stringify({"timer":(player.timer - seconds)}));
}