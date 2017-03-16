const playerTools = require('./playerTools');

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
		//If command is 't' or 'say' then 'Local Chat'
		if(commandSplit[0] == 't' || commandSplit[0] == 'say') {
			msg = JSON.stringify({"namePrint":jsonOut.name+" says", "command":'\"'+jsonOut.command.substr(jsonOut.command.indexOf(" ") + 1)+'\"'});
    		io.emit('chat', msg);	
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
					socket.emit('log', JSON.stringify({"command":msg}));
				};
			});
		}
		//If command is "move"
		else if(commandSplit[0] === 'move') {
			if(commandSplit[1] == null){
				socket.emit('log', JSON.stringify({"command":"There is no \""+jsonOut.command.substr(jsonOut.command.indexOf(" ") + 1)+"\" to move to"}));
			} else if(commandSplit[1] != null) { 
				playerTools.move(commandSplit[1], players, jsonOut, socket, clientLookup, io, map);
			} else {
				socket.emit('log', JSON.stringify({"command":"There is no \""+jsonOut.command.substr(jsonOut.command.indexOf(" ") + 1)+"\" to move to"}));
			}
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
						for(var y in roomOut.players) {
							if(jsonOut.name.toLowerCase() === roomOut.players[y]) {
         						msg = JSON.stringify({"command":"examine: "+roomOut.name+"; Players: "+roomOut.players+"; Contents: "+roomOut.inventory});
         						socket.emit('log', msg);
         						foundTarget = true;
    						};
         				};
         			};
    			};			
			} else {
				//Examine Player
				var playerPos = [-1, -1];
				var targetPos = [-2, -2];
				var target;
				//Get the position of the player and the player's target
				players.forEach(function(result, index) {
					var playerOut = JSON.parse(result);
					if(jsonOut.name.toLowerCase() === playerOut.name) {
						playerPos = playerOut.position;
					};
					if (commandSplit[1] === playerOut.name) {
						targetPos = playerOut.position;
						target = playerOut;
					};
				});					
				//If positions are the same, output info on target
				if (playerPos[0] == targetPos[0] && playerPos[1] == targetPos[1]) {
					foundTarget = true;
					msg = JSON.stringify({"command":"Name: "+target.namePrint});
					socket.emit('log', msg);
					for (i = 0; i < target.skills.length; i++) {
						msg = JSON.stringify({"command":target.skills[i].name+": Rank "+target.skills[i].rank+" (EXP: "+target.skills[i].exp+"/"+playerTools.expNeeded(target.skills[i].rank)+")"});
						socket.emit('log', msg);
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