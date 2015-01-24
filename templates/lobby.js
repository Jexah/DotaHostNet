Lobby = function(lobby){

	var Name = '0';
	var Teams = '1';
	var Addons = '2';
	var MaxPlayers = '3';
	var CurrentPlayers = '4';
	var Region = '5';
	var Status = '6';

	var obj = lobby && lobby.obj && lobby.obj() || (typeof lobby === 'string') ? JSON.parse(lobby) : lobby;

	this.Name = obj[Name] || obj['Name'];
	this.Teams = new window.Teams(obj[Teams] || obj['Teams']);
	this.Addons = new window.Addons(obj[Addons] || obj['Addons']);
	this.MaxPlayers = obj[MaxPlayers] || obj['MaxPlayers'];;
	this.CurrentPlayers = obj[CurrentPlayers] || obj['CurrentPlayers'];;
	this.Region = obj[Region] || obj['Region'];;
	this.Status = obj[Status] || obj['Status'];;

	this.obj = function(){
		return obj;
	}

}

Lobby.Waiting = '0';
Lobby.Ready = '1';
Lobby.Active = '2';


Lobbies = function(lobbies){
	
	var obj = (typeof lobbies === 'string') ? JSON.parse(lobbies) : lobbies;

	var ret = {};

	Helpers.each(lobbies, function(lobbyKey, lobby, i){
		ret[lobbyKey] = new Lobby(lobby);
	});

	return ret;

}