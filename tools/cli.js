const MongoClient = require('mongodb').MongoClient;
const fs = require('fs');

var env = 'development';
var config = require('../config')[env];
var db;

MongoClient.connect(config.database.host, (error, database) => {
  	if(error) {
  		return console.log(error);
 	} else {
 		db = database;
  		console.log("cli DB Connection Successful!");
  	}
});

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
		else if(commandSplit[0] == 'move') {
			if(commandSplit[1] == null){
				socket.emit('log', JSON.stringify({"command":"There is no \""+jsonOut.command.substr(jsonOut.command.indexOf(" ") + 1)+"\" to move to"}));
			} else if(commandSplit[1] != null) {
				db.collection('rooms').findAndModify({players:jsonOut.name}, [['_id','asc']], {$pull: {players:jsonOut.name}}, {new:true}).then(function() {
					db.collection('rooms').findAndModify({name:commandSplit[1]}, [['_id','asc']], {$push: {players:jsonOut.name}}, {new:true}, function(err, records) { 
						if (err) {
							console.log(err);
							socket.emit('log', JSON.stringify({"command":err}));
						};
						socket.emit('log', JSON.stringify({"command":jsonOut.name+" moved to "+commandSplit[1]}));
					});
				})
				.catch(function (err) {console.log(err)});
			} else {
				socket.emit('log', JSON.stringify({"command":"There is no \""+jsonOut.command.substr(jsonOut.command.indexOf(" ") + 1)+"\" to move to"}));
			}
		}
		//If command is "examine"
		else if(commandSplit[0] == 'look' || commandSplit[0] == 'l' || commandSplit[0] == 'x' || commandSplit[0] == 'ex' ||commandSplit[0] == 'examine') {
			if(commandSplit[1] == null) {
				socket.emit('log', JSON.stringify({"command":"There is no \""+jsonOut.command.substr(jsonOut.command.indexOf(" ") + 1)+"\" to examine"}));
			} else if(commandSplit[1] == 'room'){
				//Examine Room
				//console.log('map: '+mapOut.rooms);
				for(var x in mapOut.rooms) {
					var roomOut = JSON.parse(mapOut.rooms[x]);
					//console.log(roomOut.name+' players: '+roomOut.players);
					for(var y in roomOut.players) {
						if(jsonOut.name.toLowerCase() === roomOut.players[y]) {
         					msg = JSON.stringify({"command":"examine: "+roomOut.name});
         					socket.emit('log', msg);
    					};
         			};
    			};			
			} else {
				//Examine Player
				//console.log('map: '+mapOut.rooms);
				for(var x in mapOut.rooms) {
					var roomOut = JSON.parse(mapOut.rooms[x]);
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
		}
		//If command is not a valid command
		else {
			msg = JSON.stringify({"command":"Invalid Command: "+jsonOut.command});
			socket.emit('log', msg);
		};
	};
};
