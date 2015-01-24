var Templates = window.Templates || {};

Templates.LodLobby = (function(){
	
	var header;
	var mainTeams;

	var createHeader = function(lobbyName){
		return header = header || $('<div>').attr('class', 'row clearfix').html(
			$('<div>').attr('class', 'col-xl-2 col-lg-0 col-md-0 col-sm-0 column')
		).append(
			$('<div>').attr('class', 'col-xl-8 col-lg-12 col-md-12 col-sm-12 column').html(
				$('<div>').attr('class', 'row clearfix').html(
					$('<div>').attr('class', 'col-md-6 col-sm-6 column').html(
						$('<h1>').text(lobbyName);
					)
				)
			)
		).append(
			$('<div>').attr('class', 'col-xl-2 col-lg-0 col-md-0 col-sm-0 column')
		);
	}

	var createMainTeams = function(lobby){
		var teamid = '0';
		var teams = lobby.Teams;
		var team = teams[teamid];
		var players = team.Players;

		return mainTeams = mainTeams || $('<div>').attr('class', 'row clearfix').html(
			$('<div>').attr('class', 'col-lg-0 col-md-0 col-sm-0 column col-xl-2')
		).append(
			$('<div>').attr({
				'style':'padding:0 5px;',
				'class':'col-lg-6 col-md-6 col-sm-6 col-xs-12 column col-xl-4'
			}).html(
				$('<div>').attr({
					'id':'teamList' + teamid,
					'class':'list-group'
				}).html(
					$('<a>').attr({
						'style':'cursor:default;',
						'class':'list-group-item disabled'
					}).html(
						$('<h4>').text(team.Name).click(function(e){
							e.preventDefault();
						});
					)
				)
			)
		)
	}

	var addPlayerToTeamList = function(listGroup, team_players, unallocatedTeamSlot, targetTeamID, targetSlotID, avatarLeft){
		var player;
		var empty;

		if(team_players.hasOwnProperty(slotid)){
			player = team_players[slotid];
			empty = false;
		}else{
			player = {};
			player.ProfileUrl = '#';
			player.Avatar = TRANSPARENT_IMAGE,
			player.PersonaName= 'Empty',
			player.Cosmetics = '0',
			player.Badges = '0'
			empty = true;
		}

		var nameSpan = $('<span>').attr('class', 'name').text(player[PLAYER_PERSONANAME]);
		var img = $('<img>').attr({'src':player[PLAYER_AVATAR], 'style':'border:0;background-size:contain;height:32px;width:32px;margin-'+(avatarLeft?'right':'left')+':10px;'});
		var badgesSpan = $('<span>').attr('class', 'badges '+(avatarLeft?'pull-right ':'pull-left '));
		var badgesNum = parseInt(player[PLAYER_BADGES]);
		for(var i = (avatarLeft?0:5); (avatarLeft?i<=5:i>=0); (avatarLeft?++i:--i)){
			var bitNum = Math.pow(2, i);
			console.log(badgesNum+':'+bitNum+':'+(badgesNum & bitNum));
			if((badgesNum & bitNum) == bitNum){
				badgesSpan.append($('<span>').attr('class', BADGES[BADGES_CLASS][i]).text(BADGES[BADGES_TEXT][i]));
			}
		}
		console.log(''+player[PLAYER_COSMETICS]);
		console.log(COSMETICS[''+player[PLAYER_COSMETICS]])
		var container = $('<a>').attr({'id':''+teamid+slotid, 'slotid':slotid, 'href':player[PLAYER_PROFILEURL], 'onfocus':'this.blur();', 'tabindex':'-1', 'target':(empty?'_self':'_blank'), 'style':'white-space:nowrap;padding:10px 10px;overflow:hidden;', 'class':'list-group-item'+(COSMETICS[''+player[PLAYER_COSMETICS]])})
			.append(avatarLeft?img:badgesSpan)
			.append(nameSpan)
			.append(avatarLeft?badgesSpan:img)
			.click(function(e){
				if(empty){
					e.preventDefault();
					Main.wsClientLobby.send(Helpers.packArguments('swapTeam', $(this).attr('slotid'), teamid));
				}
			});
		listGroup.append(container);
	}

}

})();