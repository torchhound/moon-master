const MongoClient = require('mongodb').MongoClient;

var env = 'development';
var config = require('../config')[env];

MongoClient.connect(config.database.host, (error, database) => {
  	if(error) {
  		return console.log(error);
 	} else {
  		console.log("initDb DB Connection Successful!");
  		database.createCollection("players");
  		database.createCollection("rooms");
  		console.log("Created collections");
  	}
});