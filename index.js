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
var clientLookup = []; //maps client's username to their socketId and action queue
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

function parseCommand(socket, io, clientLookup) { 
	return function(msg){
		console.log('parseCommand');
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
		
		//Determine what function is being called;
		if(commandSplit[0] == 't' || commandSplit[0] == 'say') {
			var parsePacket = {json:jsonOut, commandSplit:commandSplit};
			clientLookup.forEach(function(result, index) {
				if(result.name === jsonOut.name) {
					result.queue.push(parsePacket);
					var seconds = new Date() / 1000; 
					seconds = Math.round(seconds);
					var time = seconds + 0;
					result.timer = time;
				};
			});
		}
		else if(commandSplit[0] === 'grind') {
			var parsePacket = {json:jsonOut, commandSplit:commandSplit};
			clientLookup.forEach(function(result, index) {
				if(result.name === jsonOut.name) {
					result.queue.push(parsePacket);
					var seconds = new Date() / 1000; 
					seconds = Math.round(seconds);
					var time = seconds + 0;
					result.timer = time;
				};
			});
		}
		else if(commandSplit[0] === 'combat') {
			var parsePacket = {json:jsonOut, commandSplit:commandSplit};
			clientLookup.forEach(function(result, index) {
				if(result.name === jsonOut.name) {
					result.queue.push(parsePacket);
					var seconds = new Date() / 1000; 
					seconds = Math.round(seconds);
					var time = seconds + 0;
					result.timer = time;
				};
			});
		}
		else if(commandSplit[0] === 'pickup'  || commandSplit[0] === 'g' || commandSplit[0] === 'take' || commandSplit[0] === 'get' || commandSplit[0] === 'grab' || commandSplit[0] === 'pick') {
			var parsePacket = {json:jsonOut, commandSplit:commandSplit};
			clientLookup.forEach(function(result, index) {
				if(result.name === jsonOut.name) {
					result.queue.push(parsePacket);
					var seconds = new Date() / 1000; 
					seconds = Math.round(seconds);
					var time = seconds + 0;
					result.timer = time;
				};
			});
		}
		else if(commandSplit[0] === 'drop' || commandSplit[0] === 'd') {
			var parsePacket = {json:jsonOut, commandSplit:commandSplit};
			clientLookup.forEach(function(result, index) {
				if(result.name === jsonOut.name) {
					result.queue.push(parsePacket);
					var seconds = new Date() / 1000; 
					seconds = Math.round(seconds);
					var time = seconds + 0;
					result.timer = time;
				};
			});
		}
		else if(commandSplit[0] === 'equip' || commandSplit[0] === 'q') {
			var parsePacket = {json:jsonOut, commandSplit:commandSplit};
			clientLookup.forEach(function(result, index) {
				if(result.name === jsonOut.name) {
					result.queue.push(parsePacket);
					var seconds = new Date() / 1000; 
					seconds = Math.round(seconds);
					var time = seconds + 0;
					result.timer = time;
				};
			});
		}
		else if(commandSplit[0] === 'unequip' || commandSplit[0] === 'u') {
			var parsePacket = {json:jsonOut, commandSplit:commandSplit};
			clientLookup.forEach(function(result, index) {
				if(result.name === jsonOut.name) {
					result.queue.push(parsePacket);
					var seconds = new Date() / 1000; 
					seconds = Math.round(seconds);
					var time = seconds + 0;
					result.timer = time;
				};
			});
		}
		else if(commandSplit[0] === 'move' || commandSplit[0] === 'go') {
			var parsePacket = {json:jsonOut, commandSplit:commandSplit};
			clientLookup.forEach(function(result, index) {
				if(result.name === jsonOut.name) {
					result.queue.push(parsePacket);
					var seconds = new Date() / 1000; 
					seconds = Math.round(seconds);
					var time = seconds + 0;
					result.timer = time;
				};
			});
		}
		else if(commandSplit[0] === 'look' || commandSplit[0] === 'l' || commandSplit[0] === 'x' || commandSplit[0] === 'ex' ||commandSplit[0] === 'examine') {
			var parsePacket = {json:jsonOut, commandSplit:commandSplit};
			clientLookup.forEach(function(result, index) {
				if(result.name === jsonOut.name) {
					result.queue.push(parsePacket);
					var seconds = new Date() / 1000; 
					seconds = Math.round(seconds);
					var time = seconds + 0;
					result.timer = time;
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
	clientLookup.forEach(function(result, index) {
		var seconds = new Date() / 1000; 
		seconds = Math.round(seconds);
		if(result.queue[0] === undefined) {
			//pass
		}
		else if(result.queue.length === 1) {
			var check = cli.parse(result.queue[0], clientLookup, players, mapJson, result.socketId, io);
			if(check == false) {
				result.timer = 0; //TODO(torchhound) seconds or 0?
				console.log('gameLoop check false');
			};
			result.queue.splice(index, 1);
		}
		else if(result.timer <= seconds) {
			var check = cli.parse(result.queue[0], clientLookup, players, mapJson, result.socketId, io);
			if(check == false) {
				result.timer = 0; //TODO(torchhound) seconds or 0?
				console.log('gameLoop check false');
			};
			result.queue.splice(index, 1);
		}; 
		if(result.queue[0] != undefined) {
			for(var x in result.queue) {
				io.of('/').to(result.socketId).emit('queue', JSON.stringify({"queue":result.queue[x].json.command}));
			};
		};
	});
	setImmediate(gameLoop);
};

io.on('connection', function(socket){
	socket.on('login', api.login(socket, io, clientLookup, players));
	socket.on('newPlayer', api.newPlayer(socket, io, players, mapJson));
	socket.on('command', parseCommand(socket, io, clientLookup));
	socket.on('disconnect', function(){
    	clientLookup.forEach(function(result, index) {
    		if(result.socketId === socket.id) {
    			clientLookup.splice(index, 1);/*
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