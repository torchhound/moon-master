var socket = io();

$("#submit").click(function(){
	var obj = new Object();
   	obj.name = localStorage.getItem('name');
   	obj.command  = $('#cli').val();
   	var jsonString= JSON.stringify(obj);
    socket.emit('chat message', jsonString);
   $('#cli').val('');
    return false;
 });

socket.on('chat message', function(msg){
	var jsonOut = JSON.parse(msg);
	var name = jsonOut.name;
	var command = jsonOut.command;
    $('#output').append($('<li>').text(name + ': ' + command + '\n'));
 });