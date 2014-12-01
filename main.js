














































var wsClient;


(function(){

	$(document).ready(function(){


		var Template = function(replaceObj, contentStr){
			this.replaceObj = replaceObj;
			this.contentStr = contentStr;

			this.getString = function(args){
				var ret = contentStr;
				for(var i in replaceObj){
					if(!replaceObj.hasOwnProperty(i)){continue;}
					while(ret.indexOf('{{' + i + '}}') != -1){
						ret = ret.replace('{{' + i + '}}', replaceObj[i](args));
					}
				}
				return ret;
			}
		};

		var templates = {

			'home':new Template(
				{
					'0':function(args){
						if(args[0]){
							return '<h1>Welcome back, ' + user['personaname'] + '</h1>';
						} else {
							return '<h1>Welcome to DotaHost</h1>';
						}
					},
					'1':function(args){
						if(args[0]){
							return '<img style="display:block;margin-left:auto;margin-right:auto;" src="' + user['avatarfull'] + '" />';
						} else {
							return 	'<span style="text-align:center;">'+
										'<form action="?login" method="post">'+
											'<input type="image" src="http://cdn.steamcommunity.com/public/images/signinthroughsteam/sits_large_border.png">'+
										'</form>'+
									'</span>';
						}
					},
					'2':function(args){
						if(args[0]){
							return 	'<span style="text-align:center;">'+
										'<div id="app">'+
											spinner+
										'</div>'+
									'</span>'+
									'</div>'+
									'<div class="row"><div class="col-md-12"><span style="text-align:center;"><form action="steamauth/logout.php" method="post"><input value="Logout" type="submit" /></form></span></div>';
						} else {
							return '';
						}
					}
				},
				'<div class="row" style="height:200px;">'+
				'</div>'+
				'<div class="row" style="height:100px;">'+
					'<div class="col-md-3"></div>'+
					'<div class="col-md-6">'+
						'<span style="text-align:center;">'+
							'{{0}}'+
						'</span>'+
					'</div>'+
					'<div class="col-md-3"></div>'+
				'</div>'+
				'<div class="row">'+
					'<div class="col-md-4"></div>'+
					'<div class="col-md-4">'+
						'{{1}}'+
					'</div>'+
					'<div class="col-md-4"></div>'+
				'</div>'+
				'<div class="row" style="height:20px;"></div>'+
				'<div class="row" style="min-height:40px;">'+
					'{{2}}'+
				'</div>'
			)
			
		};

		var dotaPath = "";
		var wsID = "";
		var connected = false;

		var wsHooks = {
			'id':function(e, x){
				wsID = x[1];
			},
			'dotaPath':function(e, x){
				dotaPath = x[1];
			},
			'addon':function(e, x){
				// addon;lod;percent;100
				if(x[3] !== "100"){
					$('#app').html('<div class="progress"><div class="progress-bar progress-bar-striped active" role="progressbar" aria-valuenow="'+
						x[3] + '" aria-valuemin="0" aria-valuemax="100" style="width: ' + x[3] + '%"></div></div>');
				}
			},
			'installationComplete':function(e, x){
				$('#app').html('Legends of Dota is up-to-date!');
			}
		}
		var timeoutPrevention;

		location.href = "dotahost://";

		$('#main').html(templates['home'].getString([user != null]));

		function setupWebSocketConnection(){
			wsClient = new WebSocket("ws://127.0.0.1:2074");


			wsClient.onopen = function(e){
				$('#app').html('Click <a href="#" onclick="wsClient.send(\'update;lod\')">here</a> to download Legends of Dota!');
				timeoutPrevention = setInterval(function(){if(connected){wsClient.send("time");}}, 1000);
				connected = true;
			}

			wsClient.onclose = function(e){
				clearInterval(timeoutPrevention);
				connected = false;
			};

			wsClient.onmessage = function(e){
				var args = e.data.split(';');
				if(wsHooks.hasOwnProperty(args[0])){ 
					wsHooks[args[0]](e, args);
				}
				console.log(e.data);
			};

			wsClient.onerror = function(e, r, t){
				if(wsClient.readyState === 3){
					$('#app').html('Download the app <a href="https://github.com/ash47/DotaHostAddons/releases/download/' + version + '/DotaHostManager.exe" download>here</a>!');
				};
				setTimeout(setupWebSocketConnection, 1000);
			};
		};

		if(user != null){
			setTimeout(setupWebSocketConnection, 1000);
		}

	});

})();

























































