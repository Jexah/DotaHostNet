Player = function(player){
	
	var SteamId = '0';
	var PersonaName = '1';
	var Avatar = '2';
	var ProfileUrl = '3';
	var Badges = '4';
	var Cosmetics = '5';

	var obj = player && player.raw && player.raw() || (typeof player === 'string' ? JSON.parse(player) : player) || {};

	this.SteamId = obj[SteamId] || obj['SteamId'];
	this.PersonaName = obj[PersonaName] || obj['PersonaName'];
	this.Avatar = obj[Avatar] || obj['Avatar'];
	this.ProfileUrl = obj[ProfileUrl] || obj['ProfileUrl'];
	this.Badges = obj[Badges] || obj['Badges'];
	this.Cosmetics = obj[Cosmetics] || obj['Cosmetics'];
	
	this.raw = function(){
		obj[SteamId] = this.SteamId;
		obj[PersonaName] = this.PersonaName;
		obj[Avatar] = this.Avatar;
		obj[ProfileUrl] = this.ProfileUrl;
		obj[Badges] = this.Badges;
		obj[Cosmetics] = this.Cosmetics;
		return obj;
	}
	
}


Players = function(players){
	
	console.log('wtf');
	console.log('p1');

	var obj = players && players.raw && players.raw() || (typeof players === 'string' ? JSON.parse(players) : players) || {};

	var ret = {};

	console.log('p2');

	Helpers.each(obj, function(playerKey, player, i){
		ret[playerKey] = new Player(player);
	});

	console.log('p3');

	ret.raw = function(){
		var rawObj = {};
		Helpers.each(ret, function(playerKey, player, i){
			playerKey !== 'raw' && (rawObj[playerKey] = player.raw());
		});
		return rawObj;
	}

	console.log('p4');

	return ret;

}