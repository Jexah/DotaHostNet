Player = function(player){
	
	var SteamId = '0';
	var PersonaName = '1';
	var Avatar = '2';
	var ProfileUrl = '3';
	var Badges = '4';
	var Cosmetics = '5';

	var obj = player && player.obj && player.obj() || (typeof player === 'string') ? JSON.parse(player) : player;

	this.SteamId = obj[SteamId] || obj['SteamId'];
	this.PersonaName = obj[PersonaName] || obj['PersonaName'];
	this.Avatar = obj[Avatar] || obj['Avatar'];
	this.ProfileUrl = obj[ProfileUrl] || obj['ProfileUrl'];
	this.Badges = obj[Badges] || obj['Badges'];
	this.Cosmetics = obj[Cosmetics] || obj['Cosmetics'];
	
	this.obj = function(){
		return obj;
	}
	
}


Players = function(players){
	
	var obj = (typeof players === 'string') ? JSON.parse(players) : players;

	var ret = {};

	Helpers.each(players, function(playerKey, player, i){
		ret[playerKey] = new Player(player);
	});

	return ret;

}