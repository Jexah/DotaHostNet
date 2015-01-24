Lobby = function(lobby){

	var Name = '0';
	var Teams = '1';
	var Addons = '2';
	var MaxPlayers = '3';
	var CurrentPlayers = '4';
	var Region = '5';
	var Status = '6';

	var obj = lobby && lobby.raw && lobby.raw() || (typeof lobby === 'string' ? JSON.parse(lobby) : lobby) || {};

	this.Name = obj[Name] || obj['Name'];
	this.Teams = window.Teams(obj[Teams] || obj['Teams']);
	this.Addons = window.Addons(obj[Addons] || obj['Addons']);
	this.MaxPlayers = obj[MaxPlayers] || obj['MaxPlayers'];;
	this.CurrentPlayers = obj[CurrentPlayers] || obj['CurrentPlayers'];;
	this.Region = obj[Region] || obj['Region'];;
	this.Status = obj[Status] || obj['Status'];;

	this.raw = function(){
		obj = {};
		obj[Name] = this.Name;
		obj[Teams] = this.Teams.raw();
		obj[Addons] = this.Addons.raw();
		obj[MaxPlayers] = this.MaxPlayers;
		obj[CurrentPlayers] = this.CurrentPlayers;
		obj[Region] = this.Region;
		obj[Status] = this.Status;
		return obj;
	}

}

Lobby.Waiting = '0';
Lobby.Ready = '1';
Lobby.Active = '2';


Lobbies = function(lobbies){
	
	var obj = lobbies && lobbies.raw && lobbies.raw() || (typeof lobbies === 'string' ? JSON.parse(lobbies) : lobbies) || {};

	var ret = {};

	Helpers.each(obj, function(lobbyKey, lobby, i){
		ret[lobbyKey] = new Lobby(lobby);
	});

	ret.raw = function(){
		var rawObj = {};
		Helpers.each(ret, function(lobbyKey, lobby, i){
			lobbyKey !== 'raw' && (rawObj[lobbyKey] = lobby.raw());
		});
		return rawObj;
	}

	return ret;

}