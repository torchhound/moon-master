const MongoClient = require('mongodb').MongoClient;
const Player = require('../models/player');
const Room = require('../models/room');

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

//parses commands
exports.newPlayer = function(socket, io) {
	return function(msg){
		var jsonOut = JSON.parse(msg);
		var player = new Player(jsonOut.name);
		var room = new Room('Spawn');
		room.addPlayer(jsonOut.name);
		db.collection('players').insertOne(player, function(err, records) { 
			if (err) console.log(err);
		});
		db.collection('rooms').insertOne(room, function(err, records) { 
			if (err) console.log(err);
		});
	};
};