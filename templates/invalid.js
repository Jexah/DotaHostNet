var Templates = window.Templates || {};

Templates.Invalid = (function(){

	var created = false;
	var showing = false;

	var modal = $('<div>').attr({
		'id':'invalid',
		'class':'modal fade',
		'data-backdrop':'static'
	}).html(
		$('<div>').attr('class', 'modal-dialog').html(
			$('<div>').attr('class', 'modal-content').html(
				$('<div>').attr('class', 'modal-body').text('You have opened DotaHost in another tab.')
			)
		)
	);

	var create = function(){
		if(!created){
			created = true;
			$('body').append(modal);
		}
	}

	return {

		'show':function(){
			if(!showing){
				showing = true;
				create();
				modal.modal('show');
			}
		},

		'hide':function(){
			if(showing){
				showing = false;
				modal.modal('hide');
			}
		}

	}


})();