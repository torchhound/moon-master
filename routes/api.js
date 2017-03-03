var express = require('express');
const bodyParser = require('body-parser');
const tools = require('../tools/cli');
//const models = require('../models/models')

var app = express();
//var urlParser = bodyParser.urlencoded({ extended: true });
var router = express.Router();
var env = 'development';
var config = require('../config')[env];



module.exports = router;