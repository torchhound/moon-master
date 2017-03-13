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
	try {
		fs.writeFileSync('map.json', newMapIn);
		console.log('Created map');
		return true;
	} catch(err) {
		console.log('Map creation error: '+err);
		return false;
	};
};