var Templates = window.Templates || {};

Templates.invalid = (function(){

	var modal;

	var getModal = function(){
		return $('<div>').attr({
			'id':'invalid',
			'class':'modal fade',
			'data-backdrop':'static'
		}).html(
			$('<div>').attr('class', 'modal-dialog').html(
				$('<div>').attr('class', 'modal-content').html(
					$('<div>').attr('class', 'modal-body').text('You have opened DotaHost in another tab.')
				)
			)
		)
	}

	var create = function(){
		if(!modal){
			modal = getModal();
			$('body').append(modal);
		}
	}

	this.show = function(){
		create();
		modal.modal('show');
	}

	this.hide = function(){
		modal.modal('hide');
	}

});