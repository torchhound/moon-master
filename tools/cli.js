const MongoClient = require('mongodb').MongoClient;

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
exports.parse = function(socket, io) {
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
				db.collection('rooms', function(err, collection) {
					if(err) console.log(err);
					collection.findOne({players:jsonOut.name}, function(err, document){
         				if(err){
         					console.log('Query Error: '+err);
         					socket.emit('log', JSON.stringify({"command":"Room examine server failure"}));
         				}
         				else if(document) {
         					var examineRoomOutput = JSON.stringify(document.name); //document.players?
         					msg = JSON.stringify({"command":"examine: "+examineRoomOutput});
         					socket.emit('log', msg);
         				} else {
         					console.log('Query Error: '+err);
         					socket.emit('log', JSON.stringify({"command":"Room examine server failure"}));
         				};
         			});
				});
			} else {
				db.collection('players', function(err, collection) {
					if(err) console.log(err);
         			collection.findOne({name:commandSplit[1]}, function(err, document){
         				if(err){
         					console.log('Query Error: '+err);
         					socket.emit('log', JSON.stringify({"command":"There is no \""+jsonOut.command.substr(jsonOut.command.indexOf(" ") + 1)+"\" to examine"}));
         				}
         				else if(document) {
         					var examinePlayerOutput = JSON.stringify(document.namePrint);
         					msg = JSON.stringify({"command":"examine: "+examinePlayerOutput});
         					socket.emit('log', msg);
         				} else {
         					console.log('Query Error: '+err);
         					socket.emit('log', JSON.stringify({"command":"There is no \""+jsonOut.command.substr(jsonOut.command.indexOf(" ") + 1)+"\" to examine"}));
         				};
         			});
    			});
			};
		}
		//If command is not a valid command
		else {
			msg = JSON.stringify({"command":"Invalid Command: "+jsonOut.command});
			socket.emit('log', msg);
		};
	};
};
