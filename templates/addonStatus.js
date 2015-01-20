var Templates = window.Templates || {};

Templates.AddonStatus = (function(){

	var baseDiv = function(id, alertStyle, cursor, glyphicon, click){
		var rootDiv = $('<div>').attr({
			'id':id + 'Status',
			'class':'bs-callout bs-callout-' + alertStyle + ' col-sm-4 col-md-12',
			'style':'cursor:' + cursor + ';'
		}).append(
			(!glyphicon ? 
				$('<div>').attr({
					'class':'progress',
					'style':'margin-top:17px;margin:0 0 2px 0;'
				}).append(
					$('<div>').attr({
						'id':id + 'ProgressBar',
						'class':'progress-bar progress-bar-info progress-bar-striped active',
						'role':'progressbar',
						'aria-valuenow':'0',
						'aria-valuemin':'0',
						'aria-valuemax':'100',
						'style':'width: 0%'
					});
				)
			:
				$('<h4>').attr('style', 'width:100%;').text('Legends of Dota ').append(
					$('<span>').attr({
						'style':'float:right;margin-top:-20px;margin-right:-4px;'
					}).html(
						Templates.spinner
					)
				)
			)
		)
		if(click){
			rootDiv.click(click);
		}

		var getDownloading = fuction(id){
			return baseDiv(id, 'info', 'wait', false);
		}
		var getWaiting = fuction(id){
			return baseDiv(id, 'info', 'default', 'spinner');
		}
		var getMissing = fuction(id){
			return baseDiv(id, 'danger', 'pointer', 'download-alt', function(e){
				Main.wsClientManager.send(packArguments('update', 'lod'));
			});
		}
		var getUpdate = fuction(id){
			return baseDiv(id, 'warning', 'pointer', 'download-alt', function(e){
				Main.wsClientManager.send(packArguments('update', 'lod'));
			});
		}
		var getReady = fuction(id){
			return baseDiv(id, 'success', 'default', 'ok');
		}

		return rootDiv;
	}

	return {
		'container':function(){
			var container = $('<div>').attr({
				'id':'addonStatusContainer',
				'class':'col-md-3 col-lg-2 col-md-pull-9 col-lg-pull-8 column',
			});
			return container;
		},
		'get':function(id, downloading){
			if(downloading){
				return getDownloading(id);
			}
			var status = Main.installedAddons[id];
			switch(status){
				case undefined:
					return getWaiting(id);
				case Addon.Missing:
					return getMissing(id);
				case Addon.Update:
					return getUpdate(id);
				case Addon.Ready:
					return getMissing(id);
			}
		}
	}

});