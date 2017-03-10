const Player = require('../models/player');
const fs = require('fs');

var mapFile = './map.json';
var map = fs.readFileSync(mapFile);
var mapOut = JSON.parse(map);

var env = 'development';
var config = require('../config')[env];

var exports = module.exports = {};

exports.login = function(socket, io, clientLookup, players) { 
	return function(msg) {
		var jsonOut = JSON.parse(msg);
		var potentialAdd = {name:jsonOut.name.toLowerCase(), socketId:socket.id};
		clientLookup.indexOf(potentialAdd) === -1 ? clientLookup.push(potentialAdd) : console.log('login: Client already exists in array');
		var player = new Player(jsonOut.name);
		var playerIn = JSON.stringify(player);
		players.indexOf(playerIn) === -1 ? players.push(playerIn) : console.log('login: Player already exists in array'); 
	};
};

//adds a new Player to players and to spawn.players
exports.newPlayer = function(socket, io, players) {
	return function(msg) {
		var jsonOut = JSON.parse(msg);
		var player = new Player(jsonOut.name);
		var playerIn = JSON.stringify(player);
		players.indexOf(playerIn) === -1 ? players.push(playerIn) : console.log('newPlayer: Player already exists in array');
		console.log(mapOut);
		var spawnOut = JSON.parse(mapOut.rooms[0]);
		spawnOut.players.indexOf(jsonOut.name.toLowerCase()) === -1 ? spawnOut.players.push(jsonOut.name.toLowerCase()) : console.log('newPlayer: Player already exists in spawn');
		mapOut.rooms[0] = JSON.stringify(spawnOut);
		console.log(mapOut);
		fs.writeFileSync(mapFile, JSON.stringify(mapOut));
	};
};