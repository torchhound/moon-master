const MongoClient = require('mongodb').MongoClient;
const Player = require('../models/player');

var env = 'development';
var config = require('../config')[env];
var db;

MongoClient.connect(config.database.host, (error, database) => {
  	if(error) {
  		return console.log(error);
 	} else {
 		db = database;
  		console.log("api DB Connection Successful!");
  	}
});

var exports = module.exports = {};

exports.login = function(socket, io, clientLookup) { //TODO(torchhound) add Player to players if they do not already exist, handles disconnect reconnect scenario
	return function(msg) {
		var jsonOut = JSON.parse(msg);
		var potentialAdd = {name:jsonOut.name.toLowerCase(), socketId:socket.id};
		clientLookup.indexOf(potentialAdd) === -1 ? clientLookup.push(potentialAdd) : console.log('Client already exists in array');
	};
};

//adds a new player to the db
exports.newPlayer = function(socket, io, players) {
	return function(msg) {
		var jsonOut = JSON.parse(msg);
		var player = new Player(jsonOut.name);
		var playerIn = JSON.stringify(player);
		players.indexOf(playerIn) === -1 ? players.push(playerIn) : console.log('Player already exists in array')
		console.log(players);
	};
};