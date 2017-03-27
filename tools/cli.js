const playerTools = require('./playerTools');
const itemTools = require('./itemTools');

var env = 'development';
var config = require('../config')[env];

var exports = module.exports = {};

//parses commands
exports.parse = function(socket, io, clientLookup, players, map) {
	return function(msg){
		var jsonOut = JSON.parse(msg);
		//commandSplit is each separate word of the command, which we will use to determine what actions the player wants to take.
		//commandSplit is also put in lowercase for comparison with command words, which should all be lower case.
		//Note that jsonOut.command has not been modified as we wish to preserve the exact spacing of the original message.
		var commandSplit = jsonOut.command.toLowerCase().split(' ');
		
		//This section is the magic commandSplit fixer that fixes the stupid things dumb players try to enter as commands
		//It does this by moving commandSplit over by one if people use dumb words that they shouldn't use in adventure games
		//For example, 'look at', 'pick up', or putting 'the' after anything
		if (commandSplit[1] == "at" || (commandSplit[0] == "pick" && commandSplit[1] == "up")) {
			for (var i = 1; i < commandSplit.length - 1; i++) {
				commandSplit[i] = commandSplit[i+1];
			};
		};
		if (commandSplit[1] == "the") {
			for (var i = 1; i < commandSplit.length - 1; i++) {
				commandSplit[i] = commandSplit[i+1];
			};
		};
		if (commandSplit[0] == "n" || commandSplit[0] == "s" || commandSplit[0] == "e" || commandSplit[0] == "w" || commandSplit[0] == "north" || commandSplit[0] == "south" || commandSplit[0] == "east" || commandSplit[0] == "west") {
			commandSplit[commandSplit.length] = "";
			for (var i = commandSplit.length-1; i > 0; i--) {
				commandSplit[i] = commandSplit[i-1];
			};
			commandSplit[0] = "go";
		};
		
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
		//If command is 't' or 'say' then 'Local Chat'
		else if(commandSplit[0] == 't' || commandSplit[0] == 'say') {
			msg = JSON.stringify({"namePrint":jsonOut.name+" says", "command":'\"'+jsonOut.command.substr(jsonOut.command.indexOf(" ") + 1)+'\"'});
    		io.emit('chat', msg);	
		}
		//Standard Attack function
		else if(commandSplit[0] == 'a') {
			if(commandSplit[1] == null) {
				socket.emit('log', JSON.stringify({"command":"You must specify what you want to attack!"}));
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
				//If positions are the same, output info on target
				if (playerPos[0] == targetPos[0] && playerPos[1] == targetPos[1]) {
					//Determine what type of weapon player is using. (For now, it is just 'unarmed')
					//Roll skill to see if player hits or misses the target
					//Determine what body part is hit
					var limbHit = playerTools.getLimbRand(target, player.stances[0]);
					//Apply damage
					msg = JSON.stringify({"command":"wowee u sure attacked them"});
					socket.emit('log', msg);
				}
				else {
					msg = JSON.stringify({"command":"There is no such thing to attack!"});
					socket.emit('log', msg);
				};
			};
		}
		//Grind is a temporary skill but this can be used as the base for most self-only skills.
		else if(commandSplit[0] === 'grind') {
			players.forEach(function(result, index) {
				var playerOut = JSON.parse(result);
				if (jsonOut.name.toLowerCase() === playerOut.name.toLowerCase()) {
					skillOut = playerTools.skillCheck(playerOut, 0, 50, 10, 100);
					msg = skillOut.text;
					//If EXP has changed, update player
					if (skillOut.success == false) players[index] = JSON.stringify(playerOut);
					socket.emit('log', JSON.stringify({"command":msg}));
				};
			});
		}
		else if(commandSplit[0] === 'combat') {
			if(commandSplit[1] == null){
				socket.emit('combat', JSON.stringify({"queue":"No queued action", "log":"Intentionally left blank"}));
			} else {
				socket.emit('combat', JSON.stringify({"queue":commandSplit[1], "log":"Intentionally left blank"}));
			};
		}
		else if(commandSplit[0] === 'pickup'  || commandSplit[0] === 'g' || commandSplit[0] === 'take' || commandSplit[0] === 'get' || commandSplit[0] === 'grab' || commandSplit[0] === 'pick') {
			if(commandSplit[1] == null){
				socket.emit('log', JSON.stringify({"command":"There is no \""+jsonOut.command.substr(jsonOut.command.indexOf(" ") + 1)+"\" to pickup"}));
			} else if(commandSplit[1] != null) {
				itemTools.pickup(commandSplit[1], jsonOut, socket, players, map, clientLookup);
			} else {
				socket.emit('log', JSON.stringify({"command":"There is no \""+jsonOut.command.substr(jsonOut.command.indexOf(" ") + 1)+"\" to pickup"}));
			};
		}
		else if(commandSplit[0] === 'drop' || commandSplit[0] === 'd') {
			if(commandSplit[1] == null){
				socket.emit('log', JSON.stringify({"command":"There is no \""+jsonOut.command.substr(jsonOut.command.indexOf(" ") + 1)+"\" to drop"}));
			} else if(commandSplit[1] != null) { 
				itemTools.drop(commandSplit[1], jsonOut, socket, players, map, clientLookup);
			} else {
				socket.emit('log', JSON.stringify({"command":"There is no \""+jsonOut.command.substr(jsonOut.command.indexOf(" ") + 1)+"\" to drop"}));
			};
		}
		else if(commandSplit[0] === 'equip' || commandSplit[0] === 'q') {
			if(commandSplit[1] == null){
				socket.emit('log', JSON.stringify({"command":"There is no \""+jsonOut.command.substr(jsonOut.command.indexOf(" ") + 1)+"\" to equip"}));
			} else if(commandSplit[1] != null) { 
				itemTools.equip(commandSplit[1], jsonOut, socket, players, map, clientLookup);
			} else {
				socket.emit('log', JSON.stringify({"command":"There is no \""+jsonOut.command.substr(jsonOut.command.indexOf(" ") + 1)+"\" to equip"}));
			};
		}
		else if(commandSplit[0] === 'unequip' || commandSplit[0] === 'u') {
			if(commandSplit[1] == null){
				socket.emit('log', JSON.stringify({"command":"There is no \""+jsonOut.command.substr(jsonOut.command.indexOf(" ") + 1)+"\" to unequip"}));
			} else if(commandSplit[1] != null) { 
				itemTools.unequip(commandSplit[1], jsonOut, socket, players, map, clientLookup);
			} else {
				socket.emit('log', JSON.stringify({"command":"There is no \""+jsonOut.command.substr(jsonOut.command.indexOf(" ") + 1)+"\" to unequip"}));
			};
		}
		//If command is "move"
		else if(commandSplit[0] === 'move' || commandSplit[0] === 'go') {
			if(commandSplit[1] == null){
				socket.emit('log', JSON.stringify({"command":"There is no \""+jsonOut.command.substr(jsonOut.command.indexOf(" ") + 1)+"\" to move to"}));
			} else if(commandSplit[1] != null) { 
				playerTools.move(commandSplit[1], players, jsonOut, socket, clientLookup, io, map);
			} else {
				socket.emit('log', JSON.stringify({"command":"There is no \""+jsonOut.command.substr(jsonOut.command.indexOf(" ") + 1)+"\" to move to"}));
			};
		}
		//If command is "examine"
		else if(commandSplit[0] === 'look' || commandSplit[0] === 'l' || commandSplit[0] === 'x' || commandSplit[0] === 'ex' ||commandSplit[0] === 'examine') {
			var foundTarget = false;
			if(commandSplit[1] == null) {
				socket.emit('log', JSON.stringify({"command":"You must specify what you want to look at!"}));
				foundTarget = true;
			} else if(commandSplit[1] === 'room'){
				//Examine Room
				for(var x = 0; x < map.map.length; x++) {
					var row = map.map[x];
					for(var y = 0; y < row.length; y++) {
						var roomOut = JSON.parse(row[y]);
						for(var p in roomOut.players) {
							if(jsonOut.name.toLowerCase() === roomOut.players[p]) {
         						msg = JSON.stringify({"command":"examine: "+roomOut.name+"; Players: "+roomOut.players+"; Contents: "+roomOut.inventory});
         						socket.emit('log', msg);
         						foundTarget = true;
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
					socket.emit('log', msg);
					//Check if the player is asking about the health of the target.
					if (commandSplit[2] == "limb" || commandSplit[2] == "limbs" || commandSplit[2] == "health" || commandSplit[2] == "hp") {
						//Print total health, then limb health.
						msg = JSON.stringify({"command":"General Health: "+(playerTools.healthTotal(target)/playerTools.healthTotalMax(target)*100).toFixed()+"\% ("+playerTools.healthTotal(target)+"/"+playerTools.healthTotalMax(target)+")"});
						socket.emit('log', msg);
						for (var i = 0; i < target.limbs.length; i++) {
							msg = JSON.stringify({"command":playerTools.printLimbStatus(target, i)});
							socket.emit('log', msg);
						};
					}
					else if (limbNumber != -1) {
						//Player wants to know about a specific limb
						msg = JSON.stringify({"command":playerTools.printLimbStatus(target, limbNumber)});
						socket.emit('log', msg);
					} else {
						//If none of the above options are true then the player just wants to know general info on the target.
						//Print total health
						msg = JSON.stringify({"command":"General Health: "+(playerTools.healthTotal(target)/playerTools.healthTotalMax(target)*100).toFixed()+"\% ("+playerTools.healthTotal(target)+"/"+playerTools.healthTotalMax(target)+")"});
							socket.emit('log', msg);
						//Print limb health (in this case, for general overview, ONLY print a limb if a limb is injured. Don't display more than 5 to avoid chat spam.)
						var numInjured = 0;
						for (var i = 0; i < target.limbs.length; i++) {
							if (target.limbs[i].health < target.limbs[i].quality || target.limbs[i].quality == 0) {
								numInjured++;
								if (numInjured <= 5) {
									msg = JSON.stringify({"command":playerTools.printLimbStatus(target, i)});
									socket.emit('log', msg);
								};
							};
						};
						if (numInjured > 5) {
							msg = JSON.stringify({"command":"+"+(numInjured-5)+" more injured limbs."});
							socket.emit('log', msg);
							msg = JSON.stringify({"command":"(Use \"look [name] hp\" to see all limbs)."});
							socket.emit('log', msg);
						};
						msg = JSON.stringify({"command":"Equipment: "+target.equipment});
						socket.emit('log', msg);
						//Print Skills
						for (var i = 0; i < target.skills.length; i++) {
							msg = JSON.stringify({"command":target.skills[i].name+": Rank "+target.skills[i].rank+" (EXP: "+target.skills[i].exp+"/"+playerTools.expNeeded(target.skills[i].rank)+")"});
							socket.emit('log', msg);
						};	
							
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
							socket.emit('log', JSON.stringify({"command":inventoryOut.name})); //TODO(torchhound) add more item attributes
							foundTarget = true;
						};
					});
					for(var y in roomOut.players) { //Examine item in any player's equipment in the current room
						players.forEach(function(result, index) { 
							var playerOut = JSON.parse(result);
							if(roomOut.players[y] === playerOut.name) {
								for(var x in playerOut.equipment){
									var equipmentOut = JSON.parse(playerOut.equipment[x]);
									if(equipmentOut.name === commandSplit[1]) {
										socket.emit('log', JSON.stringify({"command":equipmentOut.name}));
										foundTarget = true;
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
								socket.emit('log', JSON.stringify({"command":inventoryOut.name})); //TODO(torchhound) add more item attributes
								foundTarget = true;
							};
						});
					};
				};
			};
			if (foundTarget == false) {
				msg = JSON.stringify({"command":"There is no such thing to look at!"});
				socket.emit('log', msg);
			};
		}
		//If command is not a valid command
		else {
			msg = JSON.stringify({"command":"Invalid Command: "+jsonOut.command});
			socket.emit('log', msg);
		};
	};
};