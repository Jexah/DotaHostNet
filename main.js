














































var wsClientManager;
var wsClientLobby;


(function(){

	$(document).ready(function(){

		var spinner = '<div class="spinner"><div class="spinner-container container1"><div class="circle1"></div><div class="circle2"></div><div class="circle3"></div><div class="circle4"></div></div><div class="spinner-container container2"><div class="circle1"></div><div class="circle2"></div><div class="circle3"></div><div class="circle4"></div></div><div class="spinner-container container3"><div class="circle1"></div><div class="circle2"></div><div class="circle3"></div><div class="circle4"></div></div></div>';

		var connections = 0;

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
				'</div>')
		
		};

		var dotaPath = "";
		var wsID = "";

		var wsHooks = {
			'id':function(e, x){
				wsID = x[1];
			},
			'dotaPath':function(e, x){
				dotaPath = x[1];
			},
			'startInstall':function(e, x){
				$('#app').html('<div class="progress"><div id="progress" class="progress-bar progress-bar-striped active" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" style="width:0%"></div></div>');
			},
			'addon':function(e, x){
				// addon;lod;percent;100
				if(x[3] !== "100"){
					$('#progress').css('width', x[3] + '%').attr('aria-valuenow', x[3]);    
				}
			},
			'installationComplete':function(e, x){
				wsClientLobby.send("getLobbies");
				$('#app').html("Legends of Dota installation complete! Loading lobbies...");
			},
			'getLobbies':function(e, x){
				var lobbies = "";
				for(var i = 1; i < x.length; ++x){
					var properties = x[i].split("|");
					var players = properties[1].split("-");
					var addons = properties[2].split("-");
					lobbies += "Name: ["+ properties[0] + "] Players: [" + players[0]+ "/" + players[1] + "] Addons: ";
					for(var j = 0; j < addons.length; ++j){
						 lobbies += "[" + addons[j] + ",";
					}
					lobbies = lobbies.substring(0, lobbies.length - 1) + "]";
				}
				$('#app').html(lobbies);
			}
		}
		var timeoutPrevention;

		location.href = "dotahost://";

		$('#main').html(templates['home'].getString([user != null]));

		function setupWebSocketConnections(){
			wsClientManager = new WebSocket("ws://127.0.0.1:2074");
			wsClientLobby = new WebSocket("ws://dotahost.net:8080");


			wsClientManager.onopen = function(e){
				timeoutPrevention = setInterval(function(){wsClientManager.send("time");}, 1000);
				connections++;
				if(connections == 2){
					$('#app').html('Click <a href="#" onclick="wsClientManager.send(\'update;lod\')">here</a> to download Legends of Dota!');
				}
			};

			wsClientLobby.onopen = function(e){
				connections++;
				if(connections == 2){
					$('#app').html('Click <a href="#" onclick="wsClientManager.send(\'update;lod\')">here</a> to download Legends of Dota!');
				}
			};

			wsClientManager.onclose = function(e){
				connections--;
				clearInterval(timeoutPrevention);
			};

			wsClientLobby.onclose = function(e){
				connections--;
			};

			var onMessage = function(e){
				console.log(e.data);
				var args = e.data.split(';');
				if(wsHooks.hasOwnProperty(args[0])){ 
					wsHooks[args[0]](e, args);
				}
			};
			wsClientManager.onmessage = onMessage;
			wsClientLobby.onmessage = onMessage;

			wsClientManager.onerror = function(e, r, t){
				if(wsClientManager.readyState === 3){
					$('#app').html('Download the app <a href="https://github.com/ash47/DotaHostAddons/releases/download/' + managerVersion + '/DotaHostManager.exe" download>here</a>!');
				};
				setTimeout(setupWebSocketConnections, 1000);
			};
		};

		if(user != null){
			setTimeout(setupWebSocketConnections, 1000);
		}

	});

})();

























































