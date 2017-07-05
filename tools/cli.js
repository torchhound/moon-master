const playerTools = require('./playerTools');
const itemTools = require('./itemTools');

var env = 'development';
var config = require('../config')[env];

var exports = module.exports = {};

//parses commands
exports.parse = function(packet, players, map, socketId, io) {
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
		players.forEach(function(result, index) {
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
				//Prepare variables
				var damage = -1;
				var newHP = -1;
				var limbHit = playerTools.getLimbRand(target, player.stances[0]); //Determine what body part is hit
				var roomCurrent = JSON.parse(map.map[playerPos[0]][playerPos[1]]);	
				var name1;
				var name2;
				var weaponSkillType = 0;
				var attackFlavor = " voidattacktype ";
				var	bodyPartName = target.limbs[limbHit].name;
				var extraFlavorText = "";

				//TODO(Gosts): Determine what type of weapon player is using. (For now, it is just 'unarmed')
				weaponSkillType = 1;
				attackFlavor = " punched ";

				//TODO(Gosts): Roll skill to see if player hits or misses the target
				skillOut = playerTools.skillCheck(player, weaponSkillType, 70, 1, 20);
				//Print skill message to player
				io.of('/').to(socketId).emit('log', JSON.stringify({"command":skillOut.text}));

				if (skillOut.success == true) {
					//Apply damage
					damage = Math.floor((Math.random() * 10) + 1)+(player.skills[1].rank);
					newHP = playerTools.setLimbHealth(target, limbHit, -damage);
					players[targetIndex] = JSON.stringify(target);
					if (newHP == 0)
						extraFlavorText = ", and destroyed the "+bodyPartName+"!";
				}
				else {
					extraFlavorText = ", but missed!";
					//EXP has changed, so we must update the player
					players[playerIndex] = JSON.stringify(player);
				}

				//Output messages for the player, target and any bystanders.
				//Also, set the cooldown timer for the player.
				for(var x in roomCurrent.players) {
					players.forEach(function(result, index) {
						if(result.name === roomCurrent.players[x]) {
							
							if (result.name != player.name)
								name1 = player.namePrint;
							else {
								name1 = "You";
								//Set cooldown for the attacking player
								ParseSetTime(io, result, 4);
							}
							if (result.name != target.name)
								if (player.name == target.name)
									name2 = "themself";
								else
									name2 = target.namePrint;
							else
								if (player.name == target.name)
									name2 = "yourself";
								else
									name2 = "you";
							io.of('/').to(result.socketId).emit('log', JSON.stringify({"command":name1+attackFlavor+name2+" in the "+bodyPartName+extraFlavorText}));
							if (damage != -1) {
								if (result.name == player.name)
									io.of('/').to(result.socketId).emit('log', JSON.stringify({"command":"You dealt "+damage+" damage!"}));
								else if (result.name == target.name)
									io.of('/').to(result.socketId).emit('log', JSON.stringify({"command":"You received "+damage+" damage!"}));
							};
						};
					});
				};

				
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
		players.forEach(function(result, index) {
			if(result.name === jsonOut.name.toLowerCase()) {
				ParseSetTime(io, result, 0);
			};
		});
	}

	else if(commandSplit[0] === 'pickup'  || commandSplit[0] === 'g' || commandSplit[0] === 'take' || commandSplit[0] === 'get' || commandSplit[0] === 'grab' || commandSplit[0] === 'pick') {
		if(commandSplit[1] == null){
			io.of('/').to(socketId).emit('log', JSON.stringify({"command":"You must specify something to take."}));
			return false;
		} else if(commandSplit[1] != null) {
			var check = itemTools.pickup(commandSplit[1], jsonOut, socketId, players, map, io);
			if(check == true) {
				players.forEach(function(result, index) {
					if(result.name === jsonOut.name.toLowerCase()) {
						ParseSetTime(io, result, 1);
					};
				});
			} else {
				io.of('/').to(socketId).emit('log', JSON.stringify({"command":"There is no \""+jsonOut.command.substr(jsonOut.command.indexOf(" ") + 1)+"\" to take"}));
			};
			return check;
		};
	}
	else if(commandSplit[0] === 'drop' || commandSplit[0] === 'd') {
		if(commandSplit[1] == null){
			io.of('/').to(socketId).emit('log', JSON.stringify({"command":"You must specify something to drop"}));
			return false;
		} else if(commandSplit[1] != null) { 
			var check = itemTools.drop(commandSplit[1], jsonOut, socketId, players, map, io);
			if(check == true) {
				players.forEach(function(result, index) {
					if(result.name === jsonOut.name.toLowerCase()) {
						ParseSetTime(io, result, 1);
					};
				});
			} else {
				io.of('/').to(socketId).emit('log', JSON.stringify({"command":"There is no \""+jsonOut.command.substr(jsonOut.command.indexOf(" ") + 1)+"\" to drop"}));
			};
			return check;
		};
	}
	else if(commandSplit[0] === 'equip' || commandSplit[0] === 'q') {
		if(commandSplit[1] == null){
			io.of('/').to(socketId).emit('log', JSON.stringify({"command":"You must specify something to equip"}));
			return false;
		} else if(commandSplit[1] != null) { 
			var check = itemTools.equip(commandSplit[1], jsonOut, socketId, players, map, io);
			if(check == true) {
				players.forEach(function(result, index) {
					if(result.name === jsonOut.name.toLowerCase()) {
						ParseSetTime(io, result, 1);
					};
				});
			} else {
				io.of('/').to(socketId).emit('log', JSON.stringify({"command":"There is no \""+jsonOut.command.substr(jsonOut.command.indexOf(" ") + 1)+"\" to equip"}));
			};
			return check;
		};
	}
	else if(commandSplit[0] === 'unequip' || commandSplit[0] === 'u') {
		if(commandSplit[1] == null){
			io.of('/').to(socketId).emit('log', JSON.stringify({"command":"You must specify something to unequip"}));
			return false;
		} else if(commandSplit[1] != null) { 
			var check = itemTools.unequip(commandSplit[1], jsonOut, socketId, players, map, io);
			if(check == true) {
				players.forEach(function(result, index) {
					if(result.name === jsonOut.name.toLowerCase()) {
						ParseSetTime(io, result, 1);
					};
				});
			} else {
				io.of('/').to(socketId).emit('log', JSON.stringify({"command":"There is no \""+jsonOut.command.substr(jsonOut.command.indexOf(" ") + 1)+"\" to unequip"}));
			};
			return check;
		};
	}
	//If command is "move"
	else if(commandSplit[0] === 'move' || commandSplit[0] === 'go') {
		if(commandSplit[1] == null){
			io.of('/').to(socketId).emit('log', JSON.stringify({"command":"There is no \""+jsonOut.command.substr(jsonOut.command.indexOf(" ") + 1)+"\" to move to"}));
			return false;
		} else if(commandSplit[1] != null) { 
			var check = playerTools.move(commandSplit[1], players, jsonOut, socketId, io, map);
			if(check == true) {
				players.forEach(function(result, index) {
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
							players.forEach(function(result, index) {
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
					players.forEach(function(result, index) {
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
					players.forEach(function(result, index) {
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
					players.forEach(function(result, index) {
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
						players.forEach(function(result, index) {
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
									players.forEach(function(result, index) {
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
							players.forEach(function(result, index) {
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