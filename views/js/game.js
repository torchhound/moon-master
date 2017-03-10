var socket = io();

var loginObj = new Object();
loginObj.name = localStorage.getItem('name');
var loginJsonString= JSON.stringify(loginObj);
socket.emit('login', loginJsonString);

$("#submit").click(function(){
    var obj = new Object();
   	obj.name = localStorage.getItem('name');
   	obj.command  = $('#cli').val();
   	var jsonString= JSON.stringify(obj);
    socket.emit('command', jsonString);
   	$('#cli').val('');
    return false;
 });

socket.on('log', function(msg){
	var jsonOut = JSON.parse(msg);
	var command = jsonOut.command;
    $('#log').append($('<li>').text(command + '\n'));
 });

socket.on('chat', function(msg){
	var jsonOut = JSON.parse(msg);
	var name = jsonOut.namePrint;
	var command = jsonOut.command;
    $('#chat').append($('<li>').text(name + ': ' + command + '\n'));
 });