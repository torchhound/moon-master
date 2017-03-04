var exports = module.exports = {};

//parses commands
exports.parse = function(response, messages) {

	var name = response.name;
	var command = response.command;

	if(command.slice(0, 1) == 't ') {
		var time = Date.now();
		messages.time = [name, command];
		return messages;
	} else {
		//do nothing yet
	}
}