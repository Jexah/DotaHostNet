Team = function(team){
	
	var Name = '0';
	var MaxPlayers = '1';
	var Players = '2';

	var obj = (typeof team === 'string') ? JSON.parse(team) : team;

	this.Name = obj[Name];
	this.MaxPlayers = obj[MaxPlayers];
	this.Players = new Players(obj[Players]);
}


Teams = function(teams){
	
	var obj = (typeof teams === 'string') ? JSON.parse(teams) : teams;

	var ret = {};

	for(var teamKey in obj){
		if(!obj.hasOwnProperty(teamKey)){continue;}
		ret[teamKey] = new Team(obj[teamKey]);
	}

	return ret;

}