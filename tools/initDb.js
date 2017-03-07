const MongoClient = require('mongodb').MongoClient;

var env = 'development';
var config = require('../config')[env];
var db;

MongoClient.connect(config.database.host)
  .then(function (database) {
    db = database;
  	console.log("DB Connection Successful!");
  	createPlayers();
  })
  .catch(function (err) {console.log(err)});

function createPlayers() {
	db.createCollection("players")
		.then(function() {
			createRooms();
		})
		.catch(function (err) {console.log(err)});
};

function createRooms() {
	db.createCollection("rooms")
		.then(function() {
			console.log('Initialized db');
			process.exit(0);
		})
		.catch(function (err) {console.log(err)});
};

