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

//adds a new player to the db
exports.newPlayer = function(socket, io) {
	return function(msg){
		var jsonOut = JSON.parse(msg);
		var player = new Player(jsonOut.name);
		db.collection('players').update({name:player.name}, player, {upsert:true})
			.then(function() {
				db.collection('rooms').findAndModify({name:"spawn"}, [['_id','asc']], {$push: {players:player.name}}, {new:true}, function(err, records) { 
					if (err) console.log(err);
				});
			})
			.catch(function (err) {console.log(err)});
	};
};