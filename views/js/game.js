var socket = io();

var loginObj = new Object();
loginObj.name = localStorage.getItem('name');
var loginJsonString= JSON.stringify(loginObj);
socket.emit('login', loginJsonString);

function countdown(count) {
  console.log(count);
  /*$(document).ready(
    function() {*/
        $('#timer').text(count); //TODO(torchhound) does not visually countdown
    /*}
  );  */ 
  if(count > 0) {
    setTimeout(countdown(count - 1), 1000);
  };
};

$("#submit").click(function() {
    var obj = new Object();
   	obj.name = localStorage.getItem('name');
   	obj.command  = $('#cli').val();
   	var jsonString= JSON.stringify(obj);
    socket.emit('command', jsonString);
   	$('#cli').val('');
    return false;
});

socket.on('log', function(msg) {
	var jsonOut = JSON.parse(msg);
	var command = jsonOut.command;
  $('#log').append($('<li>').text(command + '\n'));
  document.getElementById('log').scrollIntoView(false);
});

socket.on('chat', function(msg) {
	var jsonOut = JSON.parse(msg);
	var name = jsonOut.namePrint;
	var command = jsonOut.command;
  $('#chat').append($('<li>').text(name + ': ' + command + '\n'));
  document.getElementById('chat').scrollIntoView(false);
});

socket.on('combat', function(msg) {
  var jsonOut = JSON.parse(msg);
  var queue = jsonOut.queue;
  var log = jsonOut.log;
  $('#queue').append($('<li>').text(queue + '\n'));
  $('#log').append($('<li>').text(log + '\n'));
  document.getElementById('queue').scrollIntoView(false);
  document.getElementById("cli-form").style.backgroundColor = "#ff0000";
});

socket.on('queue', function(msg) {
  var jsonOut = JSON.parse(msg);
  var queue = jsonOut.queue;
  $('#queue').text(queue + '\n'); 
  document.getElementById('queue').scrollIntoView(false);
});

socket.on('timer', function(msg) {
  var jsonOut = JSON.parse(msg);
  var timer = jsonOut.timer;
  countdown(timer);
});