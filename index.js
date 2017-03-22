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

function parseCommand(socket, io, clientLookup) { //TODO(torchhound) not sure if socket and io are necessary parameters, move this function to a different file
	return function(msg){
		var jsonOut = JSON.parse(msg);
		var commandSplit = jsonOut.command.toLowerCase().split(' ');
		if(commandSplit[0] == 't' || commandSplit[0] == 'say') {
			var parsePacket = {json:jsonOut, time:0, commandSplit:commandSplit};
			clientLookup.forEach(function(result, index) {
				if(result.name === jsonOut.name) {
					result.queue.push(parsePacket);
				};
			});
		}
		else if(commandSplit[0] === 'grind') {
			var parsePacket = {json:jsonOut, time:0, commandSplit:commandSplit};
			clientLookup.forEach(function(result, index) {
				if(result.name === jsonOut.name) {
					result.queue.push(parsePacket);
				};
			});
		}
		else if(commandSplit[0] === 'combat') {
			var parsePacket = {json:jsonOut, time:0, commandSplit:commandSplit};
			clientLookup.forEach(function(result, index) {
				if(result.name === jsonOut.name) {
					result.queue.push(parsePacket);
				};
			});
		}
		else if(commandSplit[0] === 'pickup'  || commandSplit[0] === 'g' || commandSplit[0] === 'take' || commandSplit[0] === 'get' || commandSplit[0] === 'grab' || commandSplit[0] === 'pick') {
			var parsePacket = {json:jsonOut, time:10, commandSplit:commandSplit};
			clientLookup.forEach(function(result, index) {
				if(result.name === jsonOut.name) {
					result.queue.push(parsePacket);
				};
			});
		}
		else if(commandSplit[0] === 'drop' || commandSplit[0] === 'd') {
			var parsePacket = {json:jsonOut, time:10, commandSplit:commandSplit};
			clientLookup.forEach(function(result, index) {
				if(result.name === jsonOut.name) {
					result.queue.push(parsePacket);
				};
			});
		}
		else if(commandSplit[0] === 'equip' || commandSplit[0] === 'q') {
			var parsePacket = {json:jsonOut, time:10, commandSplit:commandSplit};
			clientLookup.forEach(function(result, index) {
				if(result.name === jsonOut.name) {
					result.queue.push(parsePacket);
				};
			});
		}
		else if(commandSplit[0] === 'unequip' || commandSplit[0] === 'u') {
			var parsePacket = {json:jsonOut, time:10, commandSplit:commandSplit};
			clientLookup.forEach(function(result, index) {
				if(result.name === jsonOut.name) {
					result.queue.push(parsePacket);
				};
			});
		}
		else if(commandSplit[0] === 'move' || commandSplit[0] === 'go') {
			var parsePacket = {json:jsonOut, time:30, commandSplit:commandSplit};
			clientLookup.forEach(function(result, index) {
				if(result.name === jsonOut.name) {
					result.queue.push(parsePacket);
				};
			});
		}
		else if(commandSplit[0] === 'look' || commandSplit[0] === 'l' || commandSplit[0] === 'x' || commandSplit[0] === 'ex' ||commandSplit[0] === 'examine') {
			var parsePacket = {json:jsonOut, time:10, commandSplit:commandSplit};
			clientLookup.forEach(function(result, index) {
				if(result.name === jsonOut.name) {
					result.queue.push(parsePacket);
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
		result.queue[0].time = result.queue[0].time - 1;
		if(result.queue[0].time === 0) {
			cli.parse(result.queue[0]);
			clientLookup.splice(index, 1);
		};
		for(var x in result.queue) {
			io.of('/').to(result.socketId).emit('queue', JSON.stringify({"queue":result.queue[x].jsonOut.command}));
		};
	});
	setInterval(function() {
  		gameLoop();
	}, 100);
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
});

module.exports = app;