var socket = io();

$("#join-form").submit(function(){
	var name = $('#name').val();

	if(name == ''){
		alert('Please enter a name!');
	} else{
		localStorage.setItem('name', name);
		var obj = new Object();
   		obj.name = localStorage.getItem('name');
   		var jsonString= JSON.stringify(obj);
		//socket.emit('newPlayer', jsonString);
	};
});