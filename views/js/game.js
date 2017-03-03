$("#submit").click(function(){
	if($('#cli').val() == ''){
		//do nothing
	} else{
		console.log({name: localStorage.getItem('name'), command: $('#cli').val()});
		$.post('/api/cli', {name: localStorage.getItem('name'), command: $('#cli').val()}, function(data) {
  			$('#output').html(data); //document.getElementById('output').textContent = data;
		});/*
		$.ajax({
    		url: '/api/cli', 
    		type: 'POST', 
    		contentType: 'application/json', 
    		data: {name: localStorage.getItem('name'), command: $('#cli').val()}
    	});*/
	};
});
