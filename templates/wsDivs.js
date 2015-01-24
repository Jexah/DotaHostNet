var Templates = window.Templates || {};

Templates.WsDivs = (function(){

	// This is the template for the div
	var baseDiv = function(id, okay, strong, weak){
		
		// Alert div
		var alertDiv = $('<div>').attr('class', 'alert alert-' + (okay==null?'info':(okay?'success':'danger')));

		alertDiv.append(
			// Add Header
			$('<h4>').text((id==='mmStatus'?'ModManager':'Validation'))
		).append(
			// Add glyphicon/spinner
			$('<span>').attr({'class':(okay != null?'glyphicon glyphicon-'+(okay?'ok':'remove'):''), 'style':'position:absolute;left:calc(100% - 50px);top:10px;'}).html((okay==null?Templates.spinner:''))
		).append(
			// Add first word of desctiption
			$('<strong>').html(strong)
		).append(
			// Add rest of description
			weak
		);

		// Root node
		var rootDiv = $('<div>').attr({
			'id':id,
			'class':'col-md-6 column'
		}).append(
			alertDiv
		);

		return rootDiv;
	}

	return {

		// This is for the mod manager
		'local':function(){

			// If the mod manager is not connected, and has not failed connecting
			if(Main.connectedClient == null){
				return baseDiv('mmStatus', null, 'Attempting', ' to connect to ModManager!')
			}
			// If the mod manager is connected
			else if(Main.connectedClient){
				return baseDiv('mmStatus', true, 'Successfully', ' connected to ModManager!')
			}
			// If the mod manager has failed connecting, and autorun is enabled
			else if(Main.autorun){
				var weak = $('<span>').html(
					' to connect to ModManager ('
				).append(
					$('<a>').attr('href', '#').text('run').click(function(e){
						e.preventDefault();
						Main.tryLoadUri();
					})
				).append(
					')'
				);

				return baseDiv('mmStatus', false, 'Failed', weak);
			}
			// If the mod manager has failed connecting, and autorun is not enabled
			else{
				var weak = $('<span>').html(
					' to connect to ModManager('
				).append(
					$('<a>').attr({
						'href':managerDownload,
						'style':'cursor:pointer;'
						}).prop('download', true).text('download')
				).append(
					')'
				);
				return baseDiv('mmStatus', false, 'Failed', weak);
			}
		},

		// This is for the lobby manager
		'lobby':function(){
			// If lobby manager is not connected, and has not failed connecting
			if(Main.connectedLobby == null){
				return baseDiv('lmStatus', true, 'Attempting', ' to verify user profile!')
			}
			// If lobby manager has connected and verified
			else if(Main.connectedLobby){
				return baseDiv('lmStatus', true, 'Successfully', ' verified user profile!')
			}
			// If lobby manager has failed connecting and verifying
			else{
				return baseDiv('lmStatus', false, 'Failed', ' to verify user profile.');
			}
		}
	}
})();