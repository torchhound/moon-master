const express = require('express');
const morgan = require('morgan');
const underscore = require('underscore');
const cli = require('./tools/cli');
const users = require('./routes/users');
const api = require('./routes/api');

var env = 'development';
var config = require('./config')[env];
const port = config.server.port;
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
var clientLookup = [];
var players = [];

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

//Logs errors to console
function logError(error, req, res, next){
	console.log(error);
	next(error);
};

io.on('connection', function(socket){
	socket.on('login', api.login(socket, io, clientLookup, players));
	socket.on('newPlayer', api.newPlayer(socket, io, players));
	socket.on('command', cli.parse(socket, io, clientLookup, players));
	socket.on('disconnect', function(){
    	clientLookup.forEach(function(result, index) {
    		if(result.socketId === socket.id) {
    			clientLookup.splice(index, 1);
    			for(var x in players) {
    				var playerOut = JSON.parse(players[x]);
    				if(result.name === playerOut.name) {
    					players.splice(x, 1);
    				};
    			};
    		};
    	});
  	});
});

http.listen(port, function() {
	console.log("Listening on port " + port);
});

module.exports = app;