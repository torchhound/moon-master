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
			msg = JSON.stringify({"namePrint":jsonOut.namePrint+" says", "command":'\"'+jsonOut.command.substr(jsonOut.command.indexOf(" ") + 1)+'\"'});
    		io.emit('chat', msg);	
		}
		//If command is "examine"
		else if(commandSplit[0] == 'look' || commandSplit[0] == 'l' || commandSplit[0] == 'x' || commandSplit[0] == 'ex' ||commandSplit[0] == 'examine') {
			if(commandSplit[1] == null) {
				socket.emit('log', JSON.stringify({"command":"There is no \""+jsonOut.command.substr(jsonOut.command.indexOf(" ") + 1)+"\" to examine"}));
			} else {
				db.collection('players', function(err, collection) {
					if(err) console.log(err);
         			collection.findOne({name:commandSplit[1]}, function(err, document){
         				if(err){
         					console.log('Query Error: '+err);
         					socket.emit('log', JSON.stringify({"command":"There is no \""+jsonOut.command.substr(jsonOut.command.indexOf(" ") + 1)+"\" to examine"}));
         				}
         				else if(document) {
         					var examineOutput = JSON.stringify(document.namePrint);
         					msg = JSON.stringify({"command":"examine: "+examineOutput});
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
