const Player = require('../models/player');
const Item = require('../models/item');

var env = 'development';
var config = require('../config')[env];

var exports = module.exports = {};

exports.login = function(socket, io,players) { 
	return function(msg) {
		var check = true;
		var jsonOut = JSON.parse(msg);
		var player = new Player(jsonOut.name, socket.id);
		var playerIn = JSON.stringify(player);
		players.forEach(function(result, index) {
			var playerOut = JSON.parse(result);	
			if(playerOut.name === jsonOut.name.toLowerCase()) {
				console.log('login: Player already exists in array')
				check = false
			};
		});
		if(check != false) {
			players.push(playerIn)
		}
	};
};

//adds a new Player to players and to spawn.players
exports.newPlayer = function(socket, io, players, map) {
	return function(msg) {
		var check = true;
		var jsonOut = JSON.parse(msg);
		var player = new Player(jsonOut.name, socket.id);
		var playerIn = JSON.stringify(player);
		players.forEach(function(result, index) {
			var playerOut = JSON.parse(result);	
			if(playerOut.name === jsonOut.name.toLowerCase()) {
				console.log('login: Player already exists in array')
				check = false
			};
		});
		if(check != false) {
			players.push(playerIn)
		}
		console.log(map);
		var spawnOut = JSON.parse(map.map[0][0]);
		spawnOut.players.indexOf(jsonOut.name.toLowerCase()) === -1 ? spawnOut.players.push(jsonOut.name.toLowerCase()) : console.log('newPlayer: Player already exists in spawn');
		var wrench = new Item('Wrench', "It's a wrench", 3, 10, true);
		var wrenchIn = JSON.stringify(wrench);
		spawnOut.inventory.push(wrenchIn);
		map.map[0][0] = JSON.stringify(spawnOut);
		console.log(map);
	};
};