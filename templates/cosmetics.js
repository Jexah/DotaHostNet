var Cosmetics = function(){

	var styles = {};
	styles[Cosmetics.None] = '';
	styles[Cosmetics.Green] = ' list-group-item-success',
	styles[Cosmetics.Blue] = ' list-group-item-info',
	styles[Cosmetics.Yellow] = ' list-group-item-warning',
	styles[Cosmetics.Red] = ' list-group-item-danger'

	return {
		'getStyle':function(style){
			return styles[style];
		}
	};

}


Cosmetics.None = '0';
Cosmetics.Green = '1';
Cosmetics.Blue = '2';
Cosmetics.Yellow = '3';
Cosmetics.Red = '4';