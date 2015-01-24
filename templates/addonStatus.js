var Templates = window.Templates || {};

Templates.AddonStatus = (function(){

	var addonsDownloading = {};

	var addonStatusContainer = $('<div>').attr({
		'id':'addonStatusContainer',
		'class':'col-md-3 col-lg-2 col-md-pull-9 col-lg-pull-8 column'
	});

	var baseAddonDiv = function(id, alertStyle, cursor, glyphicon, click){
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
					})
				)
			:
				$('<h4>').attr('style', 'width:100%;').text('Legends of Dota ').append(
					$('<span>').attr({
						'style':(glyphicon!=='spinner'?'float:right;':'float:right;margin-top:-20px;margin-right:-4px;'),
						'class':(glyphicon!=='spinner'?'glyphicon glyphicon-' + glyphicon:'')
					}).html(
						(glyphicon === 'spinner'?Templates.spinner:'')
					)
				)
			)
		)
		if(click){
			rootDiv.click(click);
		}

		return rootDiv;
	}

	var getDownloading = function(id){
		return baseAddonDiv(id, 'info', 'wait', false);
	}
	var getWaiting = function(id){
		return baseAddonDiv(id, 'info', 'default', 'spinner');
	}
	var getMissing = function(id){
		return baseAddonDiv(id, 'danger', 'pointer', 'download-alt', function(e){
			Main.wsClientManager.send(Helpers.packArguments('update', 'lod'));
		});
	}
	var getUpdate = function(id){
		return baseAddonDiv(id, 'warning', 'pointer', 'download-alt', function(e){
			Main.wsClientManager.send(Helpers.packArguments('update', 'lod'));
		});
	}
	var getReady = function(id){
		return baseAddonDiv(id, 'success', 'default', 'ok');
	}

	var getAddon = function(id, downloading){
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
				return getReady(id);
		}
	}

	return {
		'getContainer':function(){
			return addonStatusContainer;
		},

		'setAddon':function(id, downloading){
			var matches = $('#'+id+'Status');
			if(matches.length > 0){
				matches.replaceWith(getAddon(id, downloading));
			}else{
				addonStatusContainer.append(getAddon(id, downloading));
			}
			addonsDownloading[id] = !!downloading;
		},

		'setProgress':function(id, percent){
			if(addonsDownloading[id]){
				$('#'+id+'ProgressBar').attr({'aria-valuenow':percent, 'style':'width:'+percent+'%;'});
			}else if(percent !== '100'){
				Templates.AddonStatus.setAddon(id, true);
			}else{
				Templates.AddonStatus.setAddon(id);
			}
		}
	}

})();