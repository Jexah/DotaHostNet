var Templates = window.Templates || {};

Templates.Landing = (function(){
	
	var rootDiv;
	var centerDiv;
	var jumbo;

	var createRootDiv = function(){
		if(!rootDiv){
			rootDiv = $('<div>').attr({
				'class':'row clearfix',
				'style':'margin-top:100px;'
			}).html(
				$('<div>').attr('class', 'col-md-2 column')
			).append(
				centerDiv = $('<div>').attr('class', 'col-md-8 column')
			).append(
				$('<div>').attr('class', 'col-md-2 column')
			)
		}
		return rootDiv;
	}

	var createJumbo = function(){
		if(!jumbo){
			jumbo = $('<div>').attr({
				'class':'jumbotron', 
				'style':'text-align:center;'
			});
		}
		return jumbo;
	}

	var fillJumbo = function(){
		jumbo.html(
			$('<h1>').text('Welcome to Dotahost')
		).append(
			$('<p>').text('Dota 2 Custom Games')
		).append(
			'<br />'
		).append(
			$('<div>').attr('class', 'col-md-2 column')
		).append(
			$('<div>').attr('class', 'col-md-8 column').html(
				$('<form>').attr({
					'action':'?login',
					'style':'display:block;',
					'method':'post'
				}).html(
					$('<div>').attr('class':'col-md-6 column').html(
						$('<a>').attr({
							'class':'btn btn-warning btn-lg', 
							'style':'float:left;width:200px;display:block;margin-left:150px;margin-right:30px;', 
							'href': 'http://www.reddit.com/r/DotaHost/comments/2svpuw/what_is_dotahost/'
						}).text('What is this sorcery?')
					)
				).append(
					$('<div>').attr('class', 'col-md-6 column').html(
						$('<input>').attr({
							'style':'display:block;',
							'type':'image',
							'src':'http://cdn.steamcommunity.com/public/images/signinthroughsteam/sits_large_noborder.png'
						})
					)
				)
			)
		).append(
			$('<div>').attr('class', 'col-md-2 column')
		)
		return jumbo;
	}

	var fillCenterDiv = function(){
		centerDiv.html(
			jumbo
		)
	}

	return{

		'getPage':function(){
			createRootDiv();
			createJumbo();
			fillJumbo();
			fillCenterDiv();
			return rootDiv;
		}

	}

})();