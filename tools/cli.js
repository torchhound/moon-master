var exports = module.exports = {};

//parses commands
exports.parse = function(socket, io) {
	return function(msg){ //TODO(torchhound) var command = jsonOut.command.split(' ');
		var jsonOut = JSON.parse(msg);
		if(jsonOut.command.slice(0, 2) == 't ') {
			msg = JSON.stringify({"name":jsonOut.name, "command":jsonOut.command.slice(2)});
    		io.emit('chat', msg);
		} else {
			msg = JSON.stringify({"command":"Invalid Command: "+jsonOut.command});
			socket.emit('log', msg);
		};
	};
};
