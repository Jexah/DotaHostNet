Lobby = function(lobby){

	var Name = '0';
	var Teams = '1';
	var Addons:'2';
	var MaxPlayers:'3';
	var CurrentPlayers:'4';
	var Region:'5';
	var Status:'6';

	var obj = (typeof lobby === 'string') ? JSON.parse(lobby) : lobby;

	this.Name = obj[Name];
	this.Teams = new Teams(obj[Teams]);
	this.Addons = new Addons(obj[Addons]);
	this.MaxPlayers = obj[MaxPlayers];
	this.CurrentPlayers = obj[CurrentPlayers];
	this.Region = obj[Region];
	this.Status = obj[Status];

}

Lobby.Waiting = '0';
Lobby.Ready = '1';
Lobby.Active = '2';


Lobbies = function(lobbies){
	
	var obj = (typeof lobbies === 'string') ? JSON.parse(lobbies) : lobbies;

	var ret = {};

	for(var lobbyKey in obj){
		if(!obj.hasOwnProperty(lobbyKey)){continue;}
		ret[lobbyKey] = new Lobby(obj[lobbyKey]);
	}

	return ret;

}