var Templates = window.Templates || {}

Templates.Lobbies = (function(){
	
	var rootContainer= $('<div>').attr('class','row');;

	var tableContainer = $('<div>').attr({
		'id':'homeLobbiesTable',
		'class':'col-md-12 column'
	});

	var spinnerSpan = $('<span>').attr('style', 'margin-left:50px;').html(
		Templates.spinner
	);

	var lobbiesTable = $('<table>').attr('class', 'table table-hover');


	var tHead = $('<thead>');

	var tBody = $('<tbody>');


	var firstRow = $('<tr>').html(
		$('<th>').text('Lobby Name')
	).append(
		$('<th>').text('Addons')
	).append(
		$('<th>').text('Options')
	).append(
		$('<th>').text('Players')
	);

	var newRow = function(lobby){
		var row = $('<tr>').attr('style', 'cursor:pointer;');

		var addons = lobby.Addons;
		var addonNames = [];
		var addonOptions = [];

		Helpers.each(addons, function(addonKey, addon, i){
			addonNames.push(addon.Name);
			addon.Options.ForEach(function(optionKey, optionValue, j){
				addonOptions.push(optionKey + ': ' + optionValue);
			});
		});

		var nameCell = $('<td>').text(lobby.Name);
		var addonNamesCell = $('<td>').text(addonNames.join(', '));
		var addonOptionsCell = $('<td>').text(addonOptions.join(', '));
		var playersCell = $('<td>').text(lobby.CurrentPlayers + ' / ' + lobby.MaxPlayers);

		row.html(nameCell).append(addonNamesCell).append(addonOptionsCell).append(playersCell);

		row.click(function(){
			if(lobbiesChangedTimeout) return;
			Main.wsClientManager.send('getPatchGameInfo');
			setTimeout(function(){
				if(!gameInfoPatched){
					alert('Please patch gameinfo (in settings).');
					return;
				}
				Helpers.each(addons, function(addonKey, addon, i){
					switch(installedAddons[addon.Id]){
						case Addon.Error:
							alert('An unknown error has occured.');
							break;
						case Addon.Missing:
							alert('Please install the addon.');
							break;
						case Addon.Update:
							alert('Please update the addon.');
							break;
						case Addon.Ready:
							Main.wsClientLobby.send(Helpers.packArguments('joinLobby', lobby.Name));
							break;
						default:
							if(connectedClient){
								alert('Please install the addon.');
							}else{
								alert('Please run the manager.');
							}
					}
				});
			}, 200);
		});

		return row;
	}

	var populateLobbiesTable = function(lobbies){
		tHead.html(firstRow);
		lobbiesTable.html(tHead);

		tBody.html('');
		lobbies.ForEach(function(key, value, i){
			tBody.append(newRow(value));
		});

		lobbiesTable.append(tBody);

		tableContainer.html(lobbiesTable);
	}



	return{

		'getTemplate':function(){
			rootContainer.html(tableContainer);
		},

		'showSpinner':function(){
			tableContainer.html(spinnerSpan);
		},

		'showLobbies':function(){
			populateLobbiesTable(Main.lobbies);
		}

	}

})();