const playerTools = require('./playerTools');
const itemTools = require('./itemTools');

var env = 'development';
var config = require('../config')[env];

var exports = module.exports = {};

//parses commands
exports.parse = function(packet, clientLookup, players, map, socketId, io) {
	var jsonOut = packet.json;
	var commandSplit = packet.commandSplit;
	//If command is 't' or 'say' then 'Local Chat'
	if(commandSplit[0] == 't' || commandSplit[0] == 'say') {
		msg = JSON.stringify({"namePrint":jsonOut.name+" says", "command":'\"'+jsonOut.command.substr(jsonOut.command.indexOf(" ") + 1)+'\"'});
		io.emit('chat', msg);	
		clientLookup.forEach(function(result, index) {
			if(result.name === jsonOut.name) {
				var seconds = Math.round(new Date().getTime() / 1000); 
				var time = seconds + 0;
				result.timer = time; 
				console.log('result.timer: '+(result.timer - seconds)); 
				io.of('/').to(result.socketId).emit('timer', JSON.stringify({"timer":(result.timer - seconds)}));
			};
		});
		return true;
	}
	//Grind is a temporary skill but this can be used as the base for most self-only skills.
	else if(commandSplit[0] === 'grind') {
		players.forEach(function(result, index) {
			var playerOut = JSON.parse(result);
			if (jsonOut.name.toLowerCase() === playerOut.name.toLowerCase()) {
				msg = playerTools.skillCheck(playerOut, 0, 50, 10, 100);
				//Success Condition
				if (msg == "") msg = "Success!";
				//Fail Condition
				else players[index] = JSON.stringify(playerOut);
				io.of('/').to(socketId).emit('log', JSON.stringify({"command":msg}));
				return true;
			};
		});
		clientLookup.forEach(function(result, index) {
			if(result.name === jsonOut.name) {
				var seconds = Math.round(new Date().getTime() / 1000); 
				var time = seconds + 0;
				result.timer = time; 
				console.log('result.timer: '+(result.timer - seconds)); 
				io.of('/').to(result.socketId).emit('timer', JSON.stringify({"timer":(result.timer - seconds)}));
			};
		});
	}
	else if(commandSplit[0] === 'combat') {
		if(commandSplit[1] == null){
			io.of('/').to(socketId).emit('combat', JSON.stringify({"queue":"No queued action", "log":"Intentionally left blank"}));
			clientLookup.forEach(function(result, index) {
				if(result.name === jsonOut.name) {
					var seconds = Math.round(new Date().getTime() / 1000); 
					var time = seconds + 0;
					result.timer = time; 
					console.log('result.timer: '+(result.timer - seconds)); 
					io.of('/').to(result.socketId).emit('timer', JSON.stringify({"timer":(result.timer - seconds)}));
				};
			});
			return true;
		} else {
			io.of('/').to(socketId).emit('combat', JSON.stringify({"queue":commandSplit[1], "log":"Intentionally left blank"}));
			return true;
		};
	}
	else if(commandSplit[0] === 'pickup'  || commandSplit[0] === 'g' || commandSplit[0] === 'take' || commandSplit[0] === 'get' || commandSplit[0] === 'grab' || commandSplit[0] === 'pick') {
		if(commandSplit[1] == null){
			io.of('/').to(socketId).emit('log', JSON.stringify({"command":"There is no \""+jsonOut.command.substr(jsonOut.command.indexOf(" ") + 1)+"\" to pickup"}));
			return false;
		} else if(commandSplit[1] != null) {
			var check = itemTools.pickup(commandSplit[1], jsonOut, socketId, players, map, clientLookup, io);
			if(check == true) {
				clientLookup.forEach(function(result, index) {
					if(result.name === jsonOut.name) {
						var seconds = Math.round(new Date().getTime() / 1000); 
						var time = seconds + 1;
						result.timer = time; 
						console.log('result.timer: '+(result.timer - seconds)); 
						io.of('/').to(result.socketId).emit('timer', JSON.stringify({"timer":(result.timer - seconds)}));
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
					if(result.name === jsonOut.name) {
						var seconds = Math.round(new Date().getTime() / 1000); 
						var time = seconds + 1;
						result.timer = time; 
						console.log('result.timer: '+(result.timer - seconds)); 
						io.of('/').to(result.socketId).emit('timer', JSON.stringify({"timer":(result.timer - seconds)}));
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
					if(result.name === jsonOut.name) {
						var seconds = Math.round(new Date().getTime() / 1000); 
						var time = seconds + 1;
						result.timer = time; 
						console.log('result.timer: '+(result.timer - seconds)); 
						io.of('/').to(result.socketId).emit('timer', JSON.stringify({"timer":(result.timer - seconds)}));
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
					if(result.name === jsonOut.name) {
						var seconds = Math.round(new Date().getTime() / 1000); 
						var time = seconds + 1;
						result.timer = time; 
						console.log('result.timer: '+(result.timer - seconds)); 
						io.of('/').to(result.socketId).emit('timer', JSON.stringify({"timer":(result.timer - seconds)}));
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
					if(result.name === jsonOut.name) {
						var seconds = Math.round(new Date().getTime() / 1000); 
						var time = seconds + 3;
						result.timer = time; 
						console.log('result.timer: '+(result.timer - seconds)); 
						io.of('/').to(result.socketId).emit('timer', JSON.stringify({"timer":(result.timer - seconds)}));
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
								if(result.name === jsonOut.name) {
									var seconds = Math.round(new Date().getTime() / 1000); 
									var time = seconds + 10; //Value changed for testing
									result.timer = time; 
									console.log('result.timer: '+(result.timer - seconds)); 
									io.of('/').to(result.socketId).emit('timer', JSON.stringify({"timer":(result.timer - seconds)}));
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
				var limbNumber = playerTools.getLimbFromInput(target, commandSplit);
				msg = JSON.stringify({"command":"Name: "+target.namePrint});
				io.of('/').to(socketId).emit('log', msg);
				//Check if the player is asking about the health of the target.
				if (commandSplit[2] == "limbs" || commandSplit[2] == "limbs" || commandSplit[2] == "health" || commandSplit[2] == "hp") {
					//Print total health, then limb health.
					msg = JSON.stringify({"command":"General Health: "+playerTools.healthTotal(target)/playerTools.healthTotalMax(target)*100+"\% ("+playerTools.healthTotal(target)+"/"+playerTools.healthTotalMax(target)+")"});
					io.of('/').to(socketId).emit('log', msg);
					for (var i = 0; i < target.limbs.length; i++) {
						msg = JSON.stringify({"command":target.limbs[i].type+" "+target.limbs[i].name+" (Health: "+target.limbs[i].health/target.limbs[i].quality*100+"\%) ("+target.limbs[i].health+"/"+target.limbs[i].quality+") (Quality: "+target.limbs[i].quality/target.limbs[i].qualityStandard*100+"\%)"});
						io.of('/').to(socketId).emit('log', msg);
					};
					clientLookup.forEach(function(result, index) {
						if(result.name === jsonOut.name) {
							var seconds = Math.round(new Date().getTime() / 1000); 
							var time = seconds + 1;
							result.timer = time; 
							console.log('result.timer: '+(result.timer - seconds)); 
							io.of('/').to(result.socketId).emit('timer', JSON.stringify({"timer":(result.timer - seconds)}));
						};
					});
					return true;
				}
				else if (limbNumber != -1) {
					//Player wants to know about a specific limb
					msg = JSON.stringify({"command":target.limbs[limbNumber].type+" "+target.limbs[limbNumber].name+" (Health: "+target.limbs[limbNumber].health/target.limbs[limbNumber].quality*100+"\%) ("+target.limbs[limbNumber].health+"/"+target.limbs[limbNumber].quality+") (Quality: "+target.limbs[limbNumber].quality/target.limbs[limbNumber].qualityStandard*100+"\%)"});
					io.of('/').to(socketId).emit('log', msg);
					clientLookup.forEach(function(result, index) {
						if(result.name === jsonOut.name) {
							var seconds = Math.round(new Date().getTime() / 1000); 
							var time = seconds + 1;
							result.timer = time; 
							console.log('result.timer: '+(result.timer - seconds)); 
							io.of('/').to(result.socketId).emit('timer', JSON.stringify({"timer":(result.timer - seconds)}));
						};
					});
					return true;
				} else {
					//If none of the above options are true then the player just wants to know general info on the target.
					//Print total health
					msg = JSON.stringify({"command":"General Health: "+playerTools.healthTotal(target)/playerTools.healthTotalMax(target)*100+"\% ("+playerTools.healthTotal(target)+"/"+playerTools.healthTotalMax(target)+")"});
					io.of('/').to(socketId).emit('log', msg);
					//Print limb health (in this case, for general overview, ONLY print a limb if a limb is injured)
					for (var i = 0; i < target.limbs.length; i++) {
						if (target.limbs[i].health < target.limbs[i].quality) {
							msg = JSON.stringify({"command":target.limbs[i].type+" "+target.limbs[i].name+" (Health: "+target.limbs[i].health/target.limbs[i].quality*100+"\%) ("+target.limbs[i].health+"/"+target.limbs[i].quality+") (Quality: "+target.limbs[i].quality/target.limbs[i].qualityStandard*100+"\%)"});
							io.of('/').to(socketId).emit('log', msg);
						};
					};
					msg = JSON.stringify({"command":"Equipment: "+target.equipment});
					io.of('/').to(socketId).emit('log', msg);
					//Print Skills
					for (var i = 0; i < target.skills.length; i++) {
						msg = JSON.stringify({"command":target.skills[i].name+": Rank "+target.skills[i].rank+" (EXP: "+target.skills[i].exp+"/"+playerTools.expNeeded(target.skills[i].rank)+")"});
						io.of('/').to(socketId).emit('log', msg);
					};	
					clientLookup.forEach(function(result, index) {
						if(result.name === jsonOut.name) {
							var seconds = Math.round(new Date().getTime() / 1000); 
							var time = seconds + 1;
							result.timer = time; 
							console.log('result.timer: '+(result.timer - seconds)); 
							io.of('/').to(result.socketId).emit('timer', JSON.stringify({"timer":(result.timer - seconds)}));
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
							if(result.name === jsonOut.name) {
								var seconds = Math.round(new Date().getTime() / 1000); 
								var time = seconds + 1;
								result.timer = time; 
								console.log('result.timer: '+(result.timer - seconds)); 
								io.of('/').to(result.socketId).emit('timer', JSON.stringify({"timer":(result.timer - seconds)}));
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
										if(result.name === jsonOut.name) {
											var seconds = Math.round(new Date().getTime() / 1000); 
											var time = seconds + 1;
											result.timer = time; 
											console.log('result.timer: '+(result.timer - seconds)); 
											io.of('/').to(result.socketId).emit('timer', JSON.stringify({"timer":(result.timer - seconds)}));
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
								if(result.name === jsonOut.name) {
									var seconds = Math.round(new Date().getTime() / 1000); 
									var time = seconds + 1;
									result.timer = time; 
									console.log('result.timer: '+(result.timer - seconds)); 
									io.of('/').to(result.socketId).emit('timer', JSON.stringify({"timer":(result.timer - seconds)}));
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