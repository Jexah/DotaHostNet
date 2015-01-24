Addon = function(addon){

	var Id = '0';
	var Options = '1';

	var obj = addon && addon.obj && addon.obj() || (typeof addon === 'string') ? JSON.parse(addon) : addon;

	this.Id = obj[Id] || obj['Id'];
	this.Options = obj[Options] || obj['Options'];

	this.obj = function(){
		return obj;
	}

}

Addon.Error = '0';
Addon.Missing = '1';
Addon.Update = '2';
Addon.Ready = '3';


Addons = function(addons){
	
	var obj = (typeof addons === 'string') ? JSON.parse(addons) : addons;

	var ret = {};

	Helpers.each(addons, function(addonKey, addon, i){
		ret[addonKey] = new Addon(addon);
	});

	return ret;

}