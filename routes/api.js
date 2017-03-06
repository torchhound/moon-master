const player = require('../models/player');
const room = require('../models/room');

var exports = module.exports = {};

//parses commands
exports.newPlayer = function(socket, io) {
	return function(msg){
		var jsonOut = JSON.parse(msg);
		
	};
};