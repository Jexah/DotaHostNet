Addon = function(addon){
	
	Id = '0';
	Options = '1';

	var obj = (typeof addon === 'string') ? JSON.parse(addon) : addon;

	this.Id = obj[Id];
	this.Options = obj[Options]

}

Addon.Error = '0';
Addon.Missing = '1';
Addon.Update = '2';
Addon.Ready = '3';


Addons = function(addons){
	
	var obj = (typeof addons === 'string') ? JSON.parse(addons) : addons;

	var ret = {};

	for(var addonKey in obj){
		if(!obj.hasOwnProperty(addonKey)){continue;}
		ret[addonKey] = new Addon(obj[addonKey]);
	}

	return ret;

}