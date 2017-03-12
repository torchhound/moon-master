const fs = require('fs');
const playerTools = require('./playerTools');

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
		//If command is "grind" Temporary skill-usage command. This command just butchers 'examine' code, and should not be used to base other skills on.
		else if(commandSplit[0] === 'grind') {
			if(commandSplit[1] == null) {
				socket.emit('log', JSON.stringify({"command":"Enter your own name to grind because im gay"}));
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
         								msg = playerTools.skillCheck(playerOut, 0, 50, 10, 100);
										//Success Condition
										if (msg == "")
											msg = "Success!";
										socket.emit('log', JSON.stringify({"command":msg}));
    								};
    							});
         					};
    					};
    				};
    			};
			};
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
    			console.log('start position: '+position);
    			console.log('start map: '+mapOut.map[0][0]);
				if(commandSplit[1] === 'n' || commandSplit[1] === 'north') {
					var p1 = position[0], 
						p2 = position[1];
					var oldRoomOut = JSON.parse(mapOut.map[p1][p2]);
					if(position[0] === 0) { 
						socket.emit('log', JSON.stringify({"command":"Cannot go any farther north"}));
						return false; 
					};
					for(var y in oldRoomOut.players) {
						if(jsonOut.name.toLowerCase() === oldRoomOut.players[y]) {
         					oldRoomOut.players.splice(y, 1);
         					mapOut.map[p1][p2] = JSON.stringify(oldRoomOut);
							fs.writeFileSync(mapFile, JSON.stringify(mapOut));
         				};
    				};
    				position[0]--;
    				p1 = position[0], 
					p2 = position[1];
    				var newRoomOut = JSON.parse(mapOut.map[p1][p2]);
    				if(newRoomOut.players.indexOf(jsonOut.name.toLowerCase()) === -1) {
    					newRoomOut.players.push(jsonOut.name.toLowerCase());
    					mapOut.map[p1][p2] = JSON.stringify(newRoomOut);
						fs.writeFileSync(mapFile, JSON.stringify(mapOut));
						socket.emit('log', JSON.stringify({"command":"You moved north"}));
    				} else {
    					console.log('move north: Player already exists in room');
    					socket.emit('log', JSON.stringify({'command':'move north: server error'}));
    				};
				} else if(commandSplit[1] === 's' || commandSplit[1] === 'south') {
					var p1 = position[0], 
						p2 = position[1];
					var oldRoomOut = JSON.parse(mapOut.map[p1][p2]);
					var pTest = position[0] + 1;
					if(pTest > mapOut.map.length) { 
						socket.emit('log', JSON.stringify({"command":"Cannot go any farther south"}));
						return false;
					};
					for(var y in oldRoomOut.players) {
						if(jsonOut.name.toLowerCase() === oldRoomOut.players[y]) {
         					oldRoomOut.players.splice(y, 1);
         					mapOut.map[p1][p2] = JSON.stringify(oldRoomOut);
							fs.writeFileSync(mapFile, JSON.stringify(mapOut));
         				};
    				};
    				position[0]++;
    				p1 = position[0], 
					p2 = position[1];
    				var newRoomOut = JSON.parse(mapOut.map[p1][p2]);
    				if(newRoomOut.players.indexOf(jsonOut.name.toLowerCase()) === -1) {
    					newRoomOut.players.push(jsonOut.name.toLowerCase());
    					mapOut.map[p1][p2] = JSON.stringify(newRoomOut);
						fs.writeFileSync(mapFile, JSON.stringify(mapOut));
						socket.emit('log', JSON.stringify({"command":"You moved south"}));
    				} else {
    					console.log('move south: Player already exists in room');
    					socket.emit('log', JSON.stringify({'command':'move south: server error'}));
    				};
				} else if(commandSplit[1] === 'e' || commandSplit[1] === 'east') {
					var p1 = position[0], 
						p2 = position[1];
					var oldRoomOut = JSON.parse(mapOut.map[p1][p2]);
					var pTest = position[1] + 1;
					if(pTest  > mapOut.map.length) {
						socket.emit('log', JSON.stringify({"command":"Cannot go any farther east"}));
						return false;
					};
					for(var y in oldRoomOut.players) {
						if(jsonOut.name.toLowerCase() === oldRoomOut.players[y]) {
         					oldRoomOut.players.splice(y, 1);
         					mapOut.map[p1][p2] = JSON.stringify(oldRoomOut);
							fs.writeFileSync(mapFile, JSON.stringify(mapOut));
         				};
    				};
    				position[0]++;
    				p1 = position[0], 
					p2 = position[1];
    				var newRoomOut = JSON.parse(mapOut.map[p1][p2]);
    				if(newRoomOut.players.indexOf(jsonOut.name.toLowerCase()) === -1) {
    					newRoomOut.players.push(jsonOut.name.toLowerCase());
    					mapOut.map[p1][p2] = JSON.stringify(newRoomOut);
						fs.writeFileSync(mapFile, JSON.stringify(mapOut));
						socket.emit('log', JSON.stringify({"command":"You moved east"}));
    				} else {
    					console.log('move east: Player already exists in room');
    					socket.emit('log', JSON.stringify({'command':'move east: server error'}));
    				};
				} else if(commandSplit[1] === 'w' || commandSplit[1] === 'west') {
					var p1 = position[0], 
						p2 = position[1];
					var oldRoomOut = JSON.parse(mapOut.map[p1][p2]);
					if(position[1] === 0) {
						socket.emit('log', JSON.stringify({"command":"Cannot go any farther west"}));
						return false;
					};
					for(var y in oldRoomOut.players) {
						if(jsonOut.name.toLowerCase() === oldRoomOut.players[y]) {
         					oldRoomOut.players.splice(y, 1);
         					mapOut.map[p1][p2] = JSON.stringify(oldRoomOut);
							fs.writeFileSync(mapFile, JSON.stringify(mapOut));
         				};
    				};
    				position[0]--;
    				p1 = position[0], 
					p2 = position[1];
    				var newRoomOut = JSON.parse(mapOut.map[p1][p2]);
    				if(newRoomOut.players.indexOf(jsonOut.name.toLowerCase()) === -1) {
    					newRoomOut.players.push(jsonOut.name.toLowerCase());
    					mapOut.map[p1][p2] = JSON.stringify(newRoomOut);
						fs.writeFileSync(mapFile, JSON.stringify(mapOut));
						socket.emit('log', JSON.stringify({"command":"You moved west"}));
    				} else {
    					console.log('move west: Player already exists in room');
    					socket.emit('log', JSON.stringify({'command':'move west: server error'}));
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
			} else {
				socket.emit('log', JSON.stringify({"command":"There is no \""+jsonOut.command.substr(jsonOut.command.indexOf(" ") + 1)+"\" to move to"}));
			}
		}
		//If command is "examine"
		else if(commandSplit[0] === 'look' || commandSplit[0] === 'l' || commandSplit[0] === 'x' || commandSplit[0] === 'ex' ||commandSplit[0] === 'examine') {
			if(commandSplit[1] == null) {
				socket.emit('log', JSON.stringify({"command":"You must specify what you want to look at!"}));
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
										for (i = 0; i < playerOut.skills.length; i++) {
											msg = JSON.stringify({"command":playerOut.skills[i].name+": Rank "+playerOut.skills[i].rank+" (EXP: "+playerOut.skills[i].exp+")"});
											socket.emit('log', msg);
										}
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
