$("#submit").click(function(){
	if($('#cli').val() == ''){
		//do nothing
	} else{
		var obj = new Object();
   		obj.name = localStorage.getItem('name');
   		obj.command  = $('#cli').val();
   		var jsonString= JSON.stringify(obj);
		console.log(jsonString);
		$.ajax({
    		url: '/api/cli', 
    		type: 'POST', 
    		contentType: 'application/json', 
    		data: jsonString
    	}).done(function(data){
    		document.getElementById('output').textContent = data;
    	});
	};
});
