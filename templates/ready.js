var Templates = window.Templates || {};

Templates.Ready = (function(){
	
	var modalInstance;
	var acceptButton;
	var declineButton;
	var modalBody;

	var readyModal = function(){

		acceptButton = accept();
		declineButton = decline();

		modalBody = body();

		var modal = $('<div>').attr({
			'id':'ready',
			'class':'modal fade',
			'data-backdrop':'static'
		}).html(
			$('<div>').attr({
				'id':'readyBorder',
				'class':'modal-dialog',
				'style':'width:550px;height:110px;position:absolute;top:50%;left:50%;margin:-50px 0 0 -275px;padding:20px;overflow:hidden;'
			}).html(
				$('<div>').attr('class', 'modal-content').html(
					modalBody
				)
			)
		);
		return modal;
	}

	var button = function(){
		return $('<button>').attr({
			'type':'button', 
			'style':'height:50px;width:220px;font-size:18px;'
		}).click(function(){
			$(this).siblings().addBack().prop('disabled', true);
			clearTimeout(Main.readyTimeout);
		});
	}

	var accept = function(){
		return button().attr({
			'id':'readyBodyAccept', 
			'class':'btn btn-success btn-lg pull-left',
		}).text('Accept').click(function(){
			Main.wsClientLobby.send('ready');
		});
	}

	var decline = function(){
		return button().attr({
			'id':'readyBodyDecline',
			'class':'btn btn-danger btn-lg pull-right'
		}).text('Decline').click(function(){
			Main.wsClientLobby.send('decline');
			Main.refreshHome();
			modalInstance.modal('hide');
		});
	}

	var body = $('<div>').attr({
		'id':'readyBody',
		'class':'modal-body',
		'style':'height:80px;'
	}).append(
		acceptButton
	).append(
		declineButton
	);

	var create = function(){
		if(!modalInstance){
			modalInstance = readyModal();
			$('body').append(modalInstance);
		}else{
			modalBody.html(body());
		}
	}

	this.show = function(){
		create();
		if(readyButton){
			readyButton.prop('disabled', false);
		}
		if(declineButton){
			declineButton.prop('disabled', false);
		}
		modalInstance.modal('show');
	}

	this.hide = function(){
		modalInstance.modal('hide');
	}

	this.generating = function(){
		modalBody.html($('<h4>').text('Preparing server...'));
	}

});