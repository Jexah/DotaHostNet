var Templates = window.Templates || {};

Templates.Landing = (function(){
	
	var rootDiv;
	var centerDiv;
	var jumbo;
	var form;
	var infoButton;
	var siwsButton
	var jumboCenter;

	rootDiv = $('<div>').attr({
		'class':'row clearfix',
		'style':'margin-top:100px;'
	}).html(
		$('<div>').attr('class', 'col-md-2 column')
	).append(
		centerDiv = $('<div>').attr('class', 'col-md-8 column')
	).append(
		$('<div>').attr('class', 'col-md-2 column')
	);

	jumbo = $('<div>').attr({
		'class':'jumbotron', 
		'style':'text-align:center;overflow:hidden;'
	}).html(
		$('<h1>').text('Welcome to Dotahost')
	).append(
		$('<p>').text('Dota 2 Custom Games')
	).append(
		'<br />'
	).append(
		$('<div>').attr('class', 'col-md-2 column')
	).append(
		jumboCenter = $('<div>').attr('class', 'col-md-8 column')
	).append(
		$('<div>').attr('class', 'col-md-2 column')
	);

	infoButton = $('<div>').attr('class', 'col-md-6 column').html(
		$('<a>').attr({
			'class':'btn btn-warning btn-lg', 
			'style':'float:left;width:200px;display:block;margin-left:150px;margin-right:30px;', 
			'href': 'http://www.reddit.com/r/DotaHost/comments/2svpuw/what_is_dotahost/'
		}).text('What is this sorcery?')
	);

	siwsButton = $('<div>').attr('class', 'col-md-6 column').html(
		$('<input>').attr({
			'style':'display:block;',
			'type':'image',
			'src':'http://cdn.steamcommunity.com/public/images/signinthroughsteam/sits_large_noborder.png'
		})
	);

	form = $('<form>').attr({
		'action':'?login',
		'style':'display:block;',
		'method':'post'
	});

	return{

		'getPage':function(){
			form.html(infoButton).append(siwsButton);
			jumboCenter.html(form);
			centerDiv.html(jumbo);
			return rootDiv;
		}

	}

})();