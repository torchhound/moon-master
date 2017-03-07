const MongoClient = require('mongodb').MongoClient;

var env = 'development';
var config = require('../config')[env];
var db;

MongoClient.connect(config.database.host)
  .then(function (database) {
    db = database;
  	console.log("DB Connection Successful!");
  	cleanPlayers();
  })
  .catch(function (err) {console.log(err)});

function cleanPlayers() {
	db.collection('players').remove({})
		.then(function() {
			cleanRooms();
		})
		.catch(function (err) {console.log(err)});
};

function cleanRooms() {
	db.collection('rooms').remove({})
		.then(function() {
			console.log('Cleaned collections');
			process.exit(0);
		})
		.catch(function (err) {console.log(err)});
};