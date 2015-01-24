Addon = function(addon){

	var Id = '0';
	var Options = '1';

	var obj = addon && addon.raw && addon.raw() || (typeof addon === 'string' ? JSON.parse(addon) : addon) || {};

	this.Id = obj[Id] || obj['Id'];
	this.Options = obj[Options] || obj['Options'];

	this.raw = function(){
		obj = {};
		obj[Id] = this.Id;
		obj[Options] = this.Options;
		return obj;
	}

}

Addon.Error = '0';
Addon.Missing = '1';
Addon.Update = '2';
Addon.Ready = '3';


Addons = function(addons){

	var obj = addons && addons.raw && addons.raw() || (typeof addons === 'string' ? JSON.parse(addons) : addons) || {};

	var ret = {};

	Helpers.each(obj, function(addonKey, addon, i){
		ret[addonKey] = new Addon(addon);
	});

	ret.raw = function(){
		var rawObj = {};
		Helpers.each(ret, function(addonKey, addon, i){
			addonKey !== 'raw' && (rawObj[addonKey] = addon.raw());
		});
		return rawObj;
	}

	return ret;

}