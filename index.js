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
	socket.on('newPlayer', api.newPlayer(socket, io));
	socket.on('command', cli.parse(socket, io));
});

http.listen(port, function() {
	console.log("Listening on port " + port);
});

module.exports = app;