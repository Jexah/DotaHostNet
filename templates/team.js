Team = function(team){

	var Name = '0';
	var MaxPlayers = '1';
	var Players = '2';

	console.log('t1');

	var obj = team && team.raw && team.raw() || (typeof team === 'string' ? JSON.parse(team) : team) || {};

	console.log('t2');

	this.Name = obj[Name] || obj['Name'];
	this.MaxPlayers = obj[MaxPlayers] || obj['MaxPlayers'];
	this.Players = window.Players(obj[Players] || obj['Players']);
	
	console.log('t3');

	this.raw = function(){
		obj = {};
		obj[Name] = this.Name;
		obj[MaxPlayers] = this.MaxPlayers;
		obj[Players] = this.Players.raw();
		return obj;
	}
}


Teams = function(teams){
	
	var obj = teams && teams.raw && teams.raw() || (typeof teams === 'string' ? JSON.parse(teams) : teams) || {};

	var ret = {};

	Helpers.each(obj, function(teamKey, team, i){
		ret[teamKey] = new Team(team);
		console.log('ret['+teamKey+']');
		console.log(ret[teamKey]);
	});

	ret.raw = function(){
		var rawObj = {};
		Helpers.each(ret, function(teamKey, team, i){
			teamKey !== 'raw' && (rawObj[teamKey] = team.raw());
		});
		return rawObj;
	}

	return ret;

}