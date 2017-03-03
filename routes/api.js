var express = require('express');
const bodyParser = require('body-parser');
const cli = require('../tools/cli');

var app = express();
var jsonParser = bodyParser.json()
var router = express.Router();
var env = 'development';
var config = require('../config')[env];

var messages = {};

//url for parsing commands
router.post("/cli", jsonParser, function(req, res, next) { //TODO(torchhound) fix fucked up JSON parsing
	console.log(req.body);
	messages = cli.parse(req.body, messages);
	res.end(messages);
});

//url for GETting messages
router.get("/poll", function(req, res, next) {
	res.end(messages);
});

module.exports = router;