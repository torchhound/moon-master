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
		//This command is "grind" Temporary skill-usage command. should not be used to base other skills on.
		else if(commandSplit[0] === 'grind') {
			var foundPlayer = false;
			for(var coordX = 0; coordX < mapOut.map.length; coordX++) {
				var row = mapOut.map[coordX];
				for(var coordY = 0; coordY < row.length; coordY++) {
					var roomOut = JSON.parse(row[coordY]);
					//console.log(roomOut.name+' players: '+roomOut.players);
					for(var p in roomOut.players) {
						if(jsonOut.name.toLowerCase() === roomOut.players[p]) {
							foundPlayer = true;
							players.forEach(function(result, index) {
								var playerOut = JSON.parse(result);
									//TODO(Gosts) Make skill check and skill increase two unrelated functions, return the needed numbers, modify player, convert back to json, replace index
									msg = playerTools.skillCheck(playerOut, 0, 50, 10, 100);
									//Success Condition
									if (msg == "") msg = "Success!";
									//Fail Condition
									else players[index] = JSON.stringify(playerOut);
									socket.emit('log', JSON.stringify({"command":msg}));
							});
						};
					};
				};
			};
		}
		//If command is "move"
		else if(commandSplit[0] === 'move') {
			if(commandSplit[1] == null){
				socket.emit('log', JSON.stringify({"command":"There is no \""+jsonOut.command.substr(jsonOut.command.indexOf(" ") + 1)+"\" to move to"}));
			} else if(commandSplit[1] != null) { 
				console.log(commandSplit[1]);
				playerTools.move(commandSplit[1], players, jsonOut, mapOut, socket, mapFile);
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
				var foundPlayer = false;
				for(var coordX = 0; coordX < mapOut.map.length; coordX++) {
					var row = mapOut.map[coordX];
					for(var coordY = 0; coordY < row.length; coordY++) {
						var roomOut = JSON.parse(row[coordY]);
						//console.log(roomOut.name+' players: '+roomOut.players);
						for(var p in roomOut.players) {
							if(commandSplit[1] === roomOut.players[p]) {
								foundPlayer = true;
								players.forEach(function(result, index) {
									var playerOut = JSON.parse(result);
									msg = JSON.stringify({"command":"Name: "+playerOut.namePrint});
									socket.emit('log', msg);
									for (i = 0; i < playerOut.skills.length; i++) {
										msg = JSON.stringify({"command":playerOut.skills[i].name+": Rank "+playerOut.skills[i].rank+" (EXP: "+playerOut.skills[i].exp+"/"+playerTools.expNeeded(playerOut.skills[i].rank)+")"});
										socket.emit('log', msg);
									}
								});
							};
						};
					};
				};
				if (foundPlayer == false) {
					msg = JSON.stringify({"command":"There is no such thing to look at!"});
					socket.emit('log', msg);
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