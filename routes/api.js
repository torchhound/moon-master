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
router.post("/cli", jsonParser, function(req, res, next) { //TODO(torchhound) DEPRECATED
	console.log(req.body);
	console.log('Pre-parse ' + messages);
	messages = cli.parse(req.body, messages);
	console.log('Post-parse ' + messages);
	res.end(messages); 
});

module.exports = router;