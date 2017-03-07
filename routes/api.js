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
		room.addPlayer(player);
		db.collection('players').insertOne(player, function(err, records) { //TODO(torchhound) typeerror cannot read property '_id' of undefined
			if (err) console.log(err);
			if (env == 'development') console.log("Record added as " + records[0]._id);
		});
		db.collection('rooms').insertOne(room, function(err, records) { //TODO(torchhound) typeerror cannot read property '_id' of undefined
			if (err) console.log(err);
			if (env == 'development') console.log("Record added as " + records[0]._id);
		});
	};
};