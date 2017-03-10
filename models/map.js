const fs = require('fs');
const Room = require('../models/room');

var exports = module.exports = {};

exports.create = function() {
	var spawn = new Room('Spawn');
	var factory = new Room('Factory');
	var spawnIn = JSON.stringify(spawn);
	var factoryIn = JSON.stringify(factory);
	var newMap = new Object();
	newMap.map = [[spawnIn, factoryIn], [factoryIn, factoryIn]];
	var newMapIn = JSON.stringify(newMap);
	fs.writeFileSync('map.json', newMapIn);
	console.log('Created map');
};