var Templates = window.Templates || {}

Templates.Lobbies = (function(){
	
	var rootContainer;
	var lobbiesTable;

	var createLobbiesTable = function(){
		if(!lobbiesTable){
			lobbiesTable = $('<div>').attr({
				'id':'homeLobbiesTable',
				'class':'col-md-12 column'
			}).append(
				$('<span>').attr('style', 'margin-left:50px;')
			)
		}
		return lobbiesTable;
	}

	var createRootContainer = function(){
		if(!rootContainer){
			rootContainer = $('<div>').attr('class','row').append(

			)
		}
		return rootContainer;
	}

})();