var Templates = window.Templates || {}

Templates.LobbyButtons = (function(){

	var rootContainer = $('<div>').attr('class', 'col-md-12 column');
	
	var buttonsContainer = $('<h3>').attr('class', 'text-left');

	var lobbiesText = $('<span>').attr('style', 'float:left;').text('Lobbies');

	var createLobbyButton = $('<button>').attr({
		'type':'button', 
		'style':'float:right;margin-left:5px;', 
		'class':'btn btn-primary'
	}).text('Create Lobby').click(function(){
		// open create lobby modal
		refreshCreateLobbyModal();
	});

	var settingsButton = $('<button>').attr({
		'type':'button', 
		'style':'float:right;margin-left:5px;', 
		'class':'btn btn-info'
	}).text('Settings').click(function(){
		// open settings modal
		openSettingsModal();
	});

	var logoutButton = $('<button>').attr({
		'type':'button', 
		'style':'float:right;', 
		'class':'btn btn-primary btn-warning'
	}).text('Logout').click(function(){
		location.href = 'logout.php';
	});

	return {

		'get':function(){
			return rootContainer.append(
				buttonsContainer.append(
					lobbiesText
				).append(
					createLobbyButton
				).append(
					setttingsButton
				).append(
					logoutButton
				)
			)
		}

	}
	
})();