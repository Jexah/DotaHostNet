var Templates = window.Templates || {}

Templates.LobbyButtons = (function(){
	
	var buttonsContainer;

	var createContainer = function(){
		if(!container){
			$('<div>').attr('class', 'col-md-12 column').html(
				buttonsContainer = $('<h3>').attr('class', 'text-left')
			)
		}
		return buttonsContainer;
	}

	var populateContainer = function(){
		buttonsContainer.html(
			$('<span>').attr('style', 'float:left;').text('Lobbies')
		).append(
			$('<button>').attr({
				'type':'button', 
				'style':'float:right;margin-left:5px;', 
				'class':'btn btn-primary'
			}).text('Create Lobby').click(function(){
				// open create lobby modal
				refreshCreateLobbyModal();
			});
		).append(
			$('<button>').attr({
				'type':'button', 
				'style':'float:right;margin-left:5px;', 
				'class':'btn btn-info'
			}).text('Settings').click(function(){
				// open settings modal
				openSettingsModal();
			});
		).append(
			$('<button>').attr({
				'type':'button', 
				'style':'float:right;', 
				'class':'btn btn-primary btn-warning'
			}).text('Logout').click(function(){
				location.href = 'logout.php';
			});
		)
		return buttonsContainer;
	}

	return {

		'get':function(){
			if(!buttonsContainer){
				createContainer();
				populateContainer();
			}
			return buttonsContainer;
		}

	}
	
})();