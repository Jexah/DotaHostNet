Player = function(player){
	
	var SteamId = '0';
	var PersonaName = '1';
	var Avatar = '2';
	var ProfileUrl = '3';
	var Badges = '4';
	var Cosmetics = '5';

	var obj = (typeof player === 'string') ? JSON.parse(player) : player;

	this.SteamId = obj[SteamId];
	this.PersonaName = obj[PersonaName];
	this.Avatar = obj[Avatar];
	this.ProfileUrl = obj[ProfileUrl];
	this.Badges = obj[Badges];
	this.Cosmetics = obj[Cosmetics];
	
}


Players = function(players){
	
	var obj = (typeof players === 'string') ? JSON.parse(players) : players;

	var ret = {};

	for(var playerKey in obj){
		if(!obj.hasOwnProperty(playerKey)){continue;}
		ret[playerKey] = new Player(obj[playerKey]);
	}

	return ret;

}