const express = require('express');
const morgan = require('morgan');
const underscore = require('underscore');
const fs = require('fs');
const cli = require('./tools/cli');
const users = require('./routes/users');
const api = require('./routes/api');
const map = require('./models/map');

var env = 'development';
var config = require('./config')[env];
const port = config.server.port;
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
var players = []; //stores player objects
var mapJson;

if(env == "development") {
	app.use(morgan('dev'));
};
app.engine('html', require('ejs').renderFile); 
app.set('view engine', 'html');
app.use('/', users);
app.use(express.static('views'));
app.use(function(req, res) {
	res.status(400);
    res.render("not-found.html");
 });
app.use(logError);
map.create();
var mapFile = fs.readFileSync('./map.json');
var mapOut = JSON.parse(mapFile);
mapJson = mapOut;

//Logs errors to console
function logError(error, req, res, next){
	console.log(error);
	next(error);
};

function parseCommand(socket, io) { 
	return function(msg){
		console.log('parseCommand');
		console.log(players);
		var jsonOut = JSON.parse(msg);
		var nameLower = jsonOut.name.toLowerCase();
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
		//Determine what function is being called;
		if(commandSplit[0] == 'gm') {
			var parsePacket = {json:jsonOut, commandSplit:commandSplit};
			players.forEach(function(result, index) {
				var playerOut = JSON.parse(result);	
				if(playerOut.name === nameLower) {
					playerOut.queue.push(parsePacket);
					players[index] = JSON.stringify(playerOut);
				};
			}); 
		}
		else if(commandSplit[0] == 't' || commandSplit[0] == 'say') {
			var parsePacket = {json:jsonOut, commandSplit:commandSplit};
			players.forEach(function(result, index) {
				var playerOut = JSON.parse(result);	
				if(playerOut.name === nameLower) {
					playerOut.queue.push(parsePacket);
					players[index] = JSON.stringify(playerOut);
				};
			}); 
		}
		else if(commandSplit[0] == 'a' || commandSplit[0] == 'attack' || commandSplit[0] == 'hit' || commandSplit[0] == 'punch') {
			var parsePacket = {json:jsonOut, commandSplit:commandSplit};
			players.forEach(function(result, index) {
				var playerOut = JSON.parse(result);	
				if(playerOut.name === nameLower) {
					playerOut.queue.push(parsePacket);
					players[index] = JSON.stringify(playerOut);
				};
			}); 
		}
		else if(commandSplit[0] === 'grind') {
			var parsePacket = {json:jsonOut, commandSplit:commandSplit};
			players.forEach(function(result, index) {
				var playerOut = JSON.parse(result);	
				if(playerOut.name === nameLower) {
					playerOut.queue.push(parsePacket);
					players[index] = JSON.stringify(playerOut);
				};
			});
		}
		else if(commandSplit[0] === 'pickup'  || commandSplit[0] === 'g' || commandSplit[0] === 'take' || commandSplit[0] === 'get' || commandSplit[0] === 'grab' || commandSplit[0] === 'pick') {
			var parsePacket = {json:jsonOut, commandSplit:commandSplit};
			players.forEach(function(result, index) {
				var playerOut = JSON.parse(result);	
				if(playerOut.name === nameLower) {
					playerOut.queue.push(parsePacket);
					players[index] = JSON.stringify(playerOut);
				};
			});
		}
		else if(commandSplit[0] === 'drop' || commandSplit[0] === 'd') {
			var parsePacket = {json:jsonOut, commandSplit:commandSplit};
			players.forEach(function(result, index) {
				var playerOut = JSON.parse(result);	
				if(playerOut.name === nameLower) {
					playerOut.queue.push(parsePacket);
					players[index] = JSON.stringify(playerOut);
				};
			});
		}
		else if(commandSplit[0] === 'equip' || commandSplit[0] === 'q') {
			var parsePacket = {json:jsonOut, commandSplit:commandSplit};
			players.forEach(function(result, index) {
				var playerOut = JSON.parse(result);	
				if(playerOut.name === nameLower) {
					playerOut.queue.push(parsePacket);
					players[index] = JSON.stringify(playerOut);
				};
			});
		}
		else if(commandSplit[0] === 'unequip' || commandSplit[0] === 'u') {
			var parsePacket = {json:jsonOut, commandSplit:commandSplit};
			players.forEach(function(result, index) {
				var playerOut = JSON.parse(result);	
				if(playerOut.name === nameLower) {
					playerOut.queue.push(parsePacket);
					players[index] = JSON.stringify(playerOut);
				};
			});
		}
		else if(commandSplit[0] === 'move' || commandSplit[0] === 'go') {
			var parsePacket = {json:jsonOut, commandSplit:commandSplit};
			players.forEach(function(result, index) {
				var playerOut = JSON.parse(result);	
				if(playerOut.name === nameLower) {
					playerOut.queue.push(parsePacket);
					players[index] = JSON.stringify(playerOut);
				};
			});
		}
		else if(commandSplit[0] === 'look' || commandSplit[0] === 'l' || commandSplit[0] === 'x' || commandSplit[0] === 'ex' ||commandSplit[0] === 'examine') {
			var parsePacket = {json:jsonOut, commandSplit:commandSplit};
			players.forEach(function(result, index) {
				var playerOut = JSON.parse(result);	
				if(playerOut.name === nameLower) {
					console.log('parseCommand start queue: '+playerOut.queue);
					playerOut.queue.push(parsePacket);
					console.log('parseCommand end queue: '+playerOut.queue);
					players[index] = JSON.stringify(playerOut);
				};
			});
		}
		else {/*
			msg = JSON.stringify({"command":"Invalid Command: "+jsonOut.command});
			socket.emit('log', msg);*/ //TODO(torchhound) not sure what to do at this stage of parsing with bad input
		};
	};
};

function gameLoop() {
	var seconds = Math.round(new Date().getTime() / 1000); 
	players.forEach(function(result, index) {
		var playerOut = JSON.parse(result);	
		if(playerOut.queue[0] === undefined) {
			//pass
		}
		else if(playerOut.timer < seconds) {
			//console.log('gameLoop start queue: '+playerOut.queue);
			var check = cli.parse(playerOut.queue[0],players, mapJson, playerOut.socketId, io);
			for(var x in playerOut.queue) {
				console.log(playerOut.queue[x].json.command);
				io.of('/').to(playerOut.socketId).emit('queue', JSON.stringify({"queue":playerOut.queue[x].json.command})); 
			};
			if(check == false) {
				playerOut.timer = 0; 
			};
			playerOut.queue.splice(0, 1);
			//console.log('gameLoop end queue: '+playerOut.queue);
		}; 
		players[index] = JSON.stringify(playerOut);
	});
	setImmediate(gameLoop);
};

io.on('connection', function(socket){
	socket.on('login', api.login(socket, io,players));
	socket.on('newPlayer', api.newPlayer(socket, io, players, mapJson));
	socket.on('command', parseCommand(socket, io));
	socket.on('disconnect', function(){
    	players.forEach(function(result, index) {
    		if(result.socketId === socket.id) {
    			players.splice(index, 1);/*
    			for(var x in players) {
    				var playerOut = JSON.parse(players[x]);
    				if(result.name === playerOut.name) {
    					players.splice(x, 1);
    				};
    			};*/
    		};
    	});
  	});
});

http.listen(port, function() {
	console.log("Listening on port " + port);
	gameLoop();
});

module.exports = app;