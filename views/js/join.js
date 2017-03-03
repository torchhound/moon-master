$("#join-form").submit(function(){
	var name = $('#name').val();

	if(name == ''){
		alert('Please enter a name!');
	} else{
		localStorage.setItem('name', name);
	};
});