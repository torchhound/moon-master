var express = require('express');
const bodyParser = require('body-parser');
const cli = require('../tools/cli');

var app = express();
var jsonParser = bodyParser.json()
var router = express.Router();
var env = 'development';
var config = require('../config')[env];

var messages = {}; //TODO(torchhound) fix this fucked up shit

//url for parsing commands
router.post("/cli", jsonParser, function(req, res, next) { 
	console.log(req.body);
	console.log('Pre-parse ' + messages);
	messages = cli.parse(req.body, messages);
	console.log('Post-parse ' + messages);
	res.end(messages); //TODO(torchhound) not returning anything to client
});

//url for GETting messages
router.get("/poll", function(req, res, next) {
	res.end(messages);
});

module.exports = router;