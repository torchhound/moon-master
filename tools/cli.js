const fs = require('fs');

var env = 'development';
var config = require('../config')[env];

var exports = module.exports = {};

//parses commands
exports.parse = function(socket, io, clientLookup, players) {
	return function(msg){
		var mapFile = './map.json';
		var map = fs.readFileSync(mapFile);
		var mapOut = JSON.parse(map);
		var jsonOut = JSON.parse(msg);
		//commandSplit is each separate word of the command, which we will use to determine what actions the player wants to take.
		//commandSplit is also put in lowercase for comparison with command words, which should all be lower case.
		//Note that jsonOut.command has not been modified as we wish to preserve the exact spacing of the original message.
		var commandSplit = jsonOut.command.toLowerCase().split(' ');
		//If command is 't' or 'say' then 'Local Chat'
		if(commandSplit[0] == 't' || commandSplit[0] == 'say') {
			msg = JSON.stringify({"namePrint":jsonOut.name+" says", "command":'\"'+jsonOut.command.substr(jsonOut.command.indexOf(" ") + 1)+'\"'});
    		io.emit('chat', msg);	
		}
		//If command is "move"
		else if(commandSplit[0] === 'move') {
			if(commandSplit[1] == null){
				socket.emit('log', JSON.stringify({"command":"There is no \""+jsonOut.command.substr(jsonOut.command.indexOf(" ") + 1)+"\" to move to"}));
			} else if(commandSplit[1] != null) { //TODO(torchhound) clean up this mess
				var position;
				players.forEach(function(result, index) {
         			var playerOut = JSON.parse(result);
    				if(playerOut.name === jsonOut.name.toLowerCase()) {
         				position = playerOut.position;
    				};
    			});
    			console.log('position: '+position);
    			console.log('map: '+mapOut.map[0][0]);
    			console.log(typeof position);
    			console.log(typeof [position[0]]); //TODO(torchhound) typeerror
    			console.log(typeof position[1]);
				if(commandSplit[1] === 'n' || commandSplit[1] === 'north') {
					var oldRoomOut = JSON.parse(mapOut.map[position[0]][position[1]]);
					for(var y in oldRoomOut.players) {
						if(jsonOut.name.toLowerCase() === oldRoomOut.players[y]) {
         					oldRoomOut.players.splice(y, 1);
         					mapOut.map[position[0]][position[1]] = JSON.stringify(oldRoomOut);
							fs.writeFileSync(mapFile, JSON.stringify(mapOut));
         				};
    				};
    				position[0] === 0 ? socket.emit('log', JSON.stringify({"command":"Cannot go any farther north"})) : position[0]--;
    				var newRoomOut = JSON.parse(mapOut.map[position[0]][position[1]]);
    				if(newRoomOut.players.indexOf(jsonOut.name.toLowerCase()) === -1) {
    					console.log('move north: Player already exists in room');
    				} else {
    					newRoomOut.players.push(jsonOut.name.toLowerCase());
    					mapOut.map[position[0]][position[1]] = JSON.stringify(newRoomOut);
						fs.writeFileSync(mapFile, JSON.stringify(mapOut));
						socket.emit('log', JSON.stringify({"command":"You moved north"}));
    				};
				} else if(commandSplit[1] === 's' || commandSplit[1] === 'south') {
					var oldRoomOut = JSON.parse(mapOut.map[position[0]][position[1]]);
					for(var y in oldRoomOut.players) {
						if(jsonOut.name.toLowerCase() === oldRoomOut.players[y]) {
         					oldRoomOut.players.splice(y, 1);
         					mapOut.map[position[0]][position[1]] = JSON.stringify(oldRoomOut);
							fs.writeFileSync(mapFile, JSON.stringify(mapOut));
         				};
    				};
    				position[0]++ > mapOut.map.length ? socket.emit('log', JSON.stringify({"command":"Cannot go any farther south"})) : position[0]++; 
    				var newRoomOut = JSON.parse(mapOut.map[position[0]][position[1]]);
    				if(newRoomOut.players.indexOf(jsonOut.name.toLowerCase()) === -1) {
    					console.log('move south: Player already exists in room');
    				} else {
    					newRoomOut.players.push(jsonOut.name.toLowerCase());
    					mapOut.map[position[0]][position[1]] = JSON.stringify(newRoomOut);
						fs.writeFileSync(mapFile, JSON.stringify(mapOut));
						socket.emit('log', JSON.stringify({"command":"You moved south"}));
    				};
				} else if(commandSplit[1] === 'e' || commandSplit[1] === 'east') {
					var oldRoomOut = JSON.parse(mapOut.map[position[0]][position[1]]);
					for(var y in oldRoomOut.players) {
						if(jsonOut.name.toLowerCase() === oldRoomOut.players[y]) {
         					oldRoomOut.players.splice(y, 1);
         					mapOut.map[position[0]][position[1]] = JSON.stringify(oldRoomOut);
							fs.writeFileSync(mapFile, JSON.stringify(mapOut));
         				};
    				};
    				position[1]++ > mapOut.map.length ? socket.emit('log', JSON.stringify({"command":"Cannot go any farther east"})) : position[0]++; 
    				var newRoomOut = JSON.parse(mapOut.map[position[0]][position[1]]);
    				if(newRoomOut.players.indexOf(jsonOut.name.toLowerCase()) === -1) {
    					console.log('move east: Player already exists in room');
    				} else {
    					newRoomOut.players.push(jsonOut.name.toLowerCase());
    					mapOut.map[position[0]][position[1]] = JSON.stringify(newRoomOut);
						fs.writeFileSync(mapFile, JSON.stringify(mapOut));
						socket.emit('log', JSON.stringify({"command":"You moved east"}));
    				};
				} else if(commandSplit[1] === 'w' || commandSplit[1] === 'west') {
					var oldRoomOut = JSON.parse(mapOut.map[position[0]][position[1]]);
					for(var y in oldRoomOut.players) {
						if(jsonOut.name.toLowerCase() === oldRoomOut.players[y]) {
         					oldRoomOut.players.splice(y, 1);
         					mapOut.map[position[0]][position[1]] = JSON.stringify(oldRoomOut);
							fs.writeFileSync(mapFile, JSON.stringify(mapOut));
         				};
    				};
    				position[1] === 0 ? socket.emit('log', JSON.stringify({"command":"Cannot go any farther west"})) : position[0]--; 
    				var newRoomOut = JSON.parse(mapOut.map[position[0]][position[1]]);
    				if(newRoomOut.players.indexOf(jsonOut.name.toLowerCase()) === -1) {
    					console.log('move west: Player already exists in room');
    				} else {
    					newRoomOut.players.push(jsonOut.name.toLowerCase());
    					mapOut.map[position[0]][position[1]] = JSON.stringify(newRoomOut);
						fs.writeFileSync(mapFile, JSON.stringify(mapOut));
						socket.emit('log', JSON.stringify({"command":"You moved west"}));
    				};
				};
				players.forEach(function(result, index) {
         			var playerOut = JSON.parse(result);
    				if(playerOut.name === jsonOut.name.toLowerCase()) {
         				playerOut.position = position;
         				players[index] = JSON.stringify(playerOut);
    				};
    			});
				console.log('position: '+position);
    			console.log('map: '+mapOut.map);
			} else {
				socket.emit('log', JSON.stringify({"command":"There is no \""+jsonOut.command.substr(jsonOut.command.indexOf(" ") + 1)+"\" to move to"}));
			}
		}
		//If command is "examine"
		else if(commandSplit[0] === 'look' || commandSplit[0] === 'l' || commandSplit[0] === 'x' || commandSplit[0] === 'ex' ||commandSplit[0] === 'examine') {
			if(commandSplit[1] == null) {
				socket.emit('log', JSON.stringify({"command":"There is no \""+jsonOut.command.substr(jsonOut.command.indexOf(" ") + 1)+"\" to examine"}));
			} else if(commandSplit[1] === 'room'){
				//Examine Room
				//console.log('map: '+mapOut.map);
				for(var x = 0; x < mapOut.map.length; x++) {
					var row = mapOut.map[x];
					for(var y = 0; y < row.length; y++) {
						var roomOut = JSON.parse(row[y]);
						//console.log(roomOut.name+' players: '+roomOut.players);
						for(var y in roomOut.players) {
							if(jsonOut.name.toLowerCase() === roomOut.players[y]) {
         						msg = JSON.stringify({"command":"examine: "+roomOut.name});
         						socket.emit('log', msg);
    						};
         				};
         			};
    			};			
			} else {
				//Examine Player
				//console.log('map: '+mapOut.map);
				for(var x = 0; x < mapOut.map.length; x++) {
					var row = mapOut.map[x];
					for(var y = 0; y < row.length; y++) {
						var roomOut = JSON.parse(row[y]);
						//console.log(roomOut.name+' players: '+roomOut.players);
						for(var y in roomOut.players) {
							if(commandSplit[1] === roomOut.players[y]) {
         						players.forEach(function(result, index) {
         							var playerOut = JSON.parse(result);
    								if(playerOut.namePrint === commandSplit[1]) {
         								msg = JSON.stringify({"command":"Name: "+playerOut.namePrint});
         								socket.emit('log', msg);
										msg = JSON.stringify({"command":playerOut.skillGrinding[0]+": Rank "+playerOut.skillGrinding[1]+" (EXP: "+playerOut.skillGrinding[2]+")"});
         								socket.emit('log', msg);
    								};
    							});
         					};
    					};
    				};
    			};
			};
		}
		//If command is not a valid command
		else {
			msg = JSON.stringify({"command":"Invalid Command: "+jsonOut.command});
			socket.emit('log', msg);
		};
	};
};
