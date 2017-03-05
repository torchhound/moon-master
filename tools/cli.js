var exports = module.exports = {};

//parses commands
exports.parse = function(socket, io) {
	return function(msg){
		var json = JSON.parse(msg);
		if(json.command.slice(0, 2) == 't ') {
			msg = JSON.stringify({"name":json.name, "command":json.command.slice(2)});
    		io.emit('chat', msg);
		} else {
			msg = JSON.stringify({"command":"Invalid Command: "+json.command});
			socket.emit('log', msg);
		};
	};
};
