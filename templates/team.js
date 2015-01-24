Team = function(team){

	var Name = '0';
	var MaxPlayers = '1';
	var Players = '2';

	var obj = team && team.obj && team.obj() || (typeof team === 'string') ? JSON.parse(team) : team;

	this.Name = obj[Name] || obj['Name'];
	this.MaxPlayers = obj[MaxPlayers] || obj['MaxPlayers'];
	this.Players = new window.Players(obj[Players] || obj['Players']);
	
	this.obj = function(){
		return obj;
	}
}


Teams = function(teams){
	
	var obj = (typeof teams === 'string') ? JSON.parse(teams) : teams;

	var ret = {};

	Helpers.each(teams, function(teamKey, team, i){
		ret[teamKey] = new Team(team);
	});

	return ret;

}