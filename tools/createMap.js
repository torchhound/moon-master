const MongoClient = require('mongodb').MongoClient;
const Room = require('../models/room');

var env = 'development';
var config = require('../config')[env];
var db;

MongoClient.connect(config.database.host)
  .then(function (database) {
    db = database;
  	console.log("DB Connection Successful!");
  	init();
  })
  .catch(function (err) {console.log(err)});

function init() {
	var spawn = new Room('Spawn');
	var north = new Room('North');
	var south = new Room('South');
	var east = new Room('East');
	var west = new Room('West');
	db.collection('rooms').insertMany([spawn, north, south, east, west])
		.then(function() {
			console.log('Created map');
			process.exit(0);
		})
		.catch(function (err) {console.log(err)});
};
