














































var wsClientManager;
var wsClientLobby;

(function(){

	$(document).ready(function(){
		// Message seperator
		var MSG_SEP = String.fromCharCode(0);

		var LOBBY_NAME = "0";
		var LOBBY_TEAMS = "1";
		var LOBBY_ADDONS = "2";
		var LOBBY_MAX_PLAYERS = "3";
		var LOBBY_CURRENT_PLAYERS = "4";
		var LOBBY_REGION = "5";

		var ADDON_ID = "0";
		var ADDON_OPTIONS = "1";

		var TEAM_NAME = "0";
		var TEAM_MAX_PLAYERS = "1";
		var TEAM_PLAYERS = "2";

		var PLAYER_STEAMID = "0";
		var PLAYER_PERSONANAME = "1";
		var PLAYER_AVATAR = "2";
		var PLAYER_PROFILEURL = "3";

		var ADDON_STATUS_ERROR = "0";
		var ADDON_STATUS_MISSING = "1";
		var ADDON_STATUS_UPDATE = "2";
		var ADDON_STATUS_READY = "3";

		var ID_TO_REGION = {
			"3":"America",
			"7":"Europe",
			"19":"Australia"
		};

		var REGION_TO_ID = {
			"America":"3",
			"Europe":"7",
			"Australia":"19"
		};

		var connectedLobby = false;
		var connectedClient = false;

		var installedAddons = {};

		var lobbies = {};

		// Will contain the function to select pages
		var selectPage;

		// Whether we have been verified or not
		isVerified =  false;

		var spinner = '<div class="spinner"><div class="spinner-container container1"><div class="circle1"></div><div class="circle2"></div><div class="circle3"></div><div class="circle4"></div></div><div class="spinner-container container2"><div class="circle1"></div><div class="circle2"></div><div class="circle3"></div><div class="circle4"></div></div><div class="spinner-container container3"><div class="circle1"></div><div class="circle2"></div><div class="circle3"></div><div class="circle4"></div></div></div>';


		// args is an array of arguments
		// funcs is an an object containing reusable functions
		var Template = function(args, funcs){
			//this.replaceObj = replaceObj;
			//this.contentStr = contentStr;
			//this.objs = arguments;

			// Contant variable used in replacements
			var replacePrefix = 'templateReplaceMe';

			// The overall string
			this.compiledString = '';
			this.functionList = [];
			this.reusableFunctions = funcs || {};
			this.conditonals = [];

			// Check if we have a conditon here
			var startAt = 0;
			if(typeof(args[0]) == 'function') {
				this.conditon = args[0];
				startAt = 1;
			}

			// Precompilion of template
			for(var i=startAt; i<args.length; ++i) {
				var arg = args[i];
				var argType = typeof(arg);

				if(argType == 'string') {
					// Find inplace function references
					var matches = arg.match(/\{\{(\d+)\}\}/g);

					// If we have matches, patch the string
					if(matches != null) {
						// Ensure lowest get's patched first
						matches.sort();

						for(var j=0; j<matches.length; ++j) {
							// Replace in the new div
							arg = arg.replace(matches[j], '<span class="' + replacePrefix + '"></span>');
						}
					}

					// Find reusable function references
					matches = arg.match(/\{\{([a-zA-Z][a-zA-Z\d]*)\}\}/g);

					// If we have matches, patch the string
					if(matches != null) {
						for(var j=0; j<matches.length; ++j) {
							// Replace in the new div
							arg = arg.replace(matches[j], '<span class="' + replacePrefix + '" functionName="' + matches[j].substring(2, matches[j].length-2) + '"></span>');
						}
					}

					this.compiledString += arg;
				} else if(argType == 'function') {
					this.functionList.push(arg);
				} else if(argType == 'object') {
					if(arg instanceof Array) {
						// Add a place holder in our string
						this.compiledString += '<span class="' + replacePrefix + '" condition="' + this.conditonals.length + '"></span>';

						// We have a conditional here, store it
						this.conditonals.push(new Template(arg, this.reusableFunctions));
					} else {
						// Copy the functions in
						for(var key in arg) {
							if(typeof(arg[key]) == 'function') {
								this.reusableFunctions[key] = arg[key];
							}
						}
					}
				}
			}

			// Applies this template to the given div (pass a select, eg, #main), if not specified, it will default to #main
			this.apply = function(args, div) {
				// Attempt to apply the selector
				if(typeof(div) == 'string') {
					div = $(div);
				}

				// Ensure we have a div
				if(div == null) {
					div = $('#main');
				}

				// If we have a valid div, clean it
				if(div) {
					// Remove everything from the div
					div.empty();
				}

				// Check if we should run or not
				if(this.conditon && !this.conditon(args)) return false;

				var copy = this.compiledString;

				// Find reusable function references
				var matches = copy.match(/\[\[([a-zA-Z][a-zA-Z\d]*)\]\]/g);

				// If we have matches, patch the string
				if(matches != null) {
					for(var j=0; j<matches.length; ++j) {
						var matchText = matches[j].substring(2, matches[j].length-2);

						// Paste the text in
						if(this.reusableFunctions[matchText]) {
							copy = copy.replace(matches[j], this.reusableFunctions[matchText](args) || '');
						} else {
							copy = copy.replace(matches[j], '');
						}
					}
				}



				// Inplace functions
				matches = copy.match(/\[\[(\d+)\]\]/g);

				// If we have matches, patch the string
				if(matches != null) {
					for(var j=0; j<matches.length; ++j) {
						var matchText = parseInt(matches[j].substring(2, matches[j].length-2));

						if(this.functionList[matchText]) {
							copy = copy.replace(matches[j], this.functionList[matchText](args) || '');
						} else {
							copy = copy.replace(matches[j], '');
						}
					}
				}

				// Build the chunk of it
				var mainChunk = $('<span>');//.html().contents();
				mainChunk.html(copy);

				// Ensure it worked
				if(!mainChunk) {
					console.log('ERROR: Templating engine has failed!');
					return false;
				}

				// Find all the things that need replacing
				var toReplace = mainChunk.find('.' + replacePrefix);

				var inPlaceFunctionNumber=0;
				var functionList = this.functionList;
				var reusableFunctions = this.reusableFunctions;
				var conditonals = this.conditonals;
				toReplace.each(function() {
					// Initially nothing to replace it with
					var replaceWith = null;

					// Grab the function name
					var funcName = $(this).attr('functionName');
					var condition = $(this).attr('condition');

					// Try to find our function
					if(condition != null) {
						// Convert to int
						condition = parseInt(condition);

						// Ensure the conditional exists
						if(conditonals[condition]) {
							// Grab what we replace with
							replaceWith = conditonals[condition].apply(args, false);

							// Check if we have anything to replace in
							if(replaceWith == false) {
								replaceWith = null;
							}
						}
					} else if(funcName) {
						// Ensure the function exists
						if(reusableFunctions[funcName]) {
							// Grab what we are replacing with
							replaceWith = reusableFunctions[funcName](args);

							// If it's a string, convert to something usable
							if(typeof(replaceWith) == 'string') {
								// If empty string, ignore
								if(replaceWith == '') {
									replaceWith = null;
								} else {
									// Create it
									replaceWith = $(replaceWith);
								}
							}
						}
					} else if(functionList[inPlaceFunctionNumber]) {
						// Grab what we are replacing with
						replaceWith = functionList[inPlaceFunctionNumber++](args);

						// If it's a string, convert to something usable
						if(typeof(replaceWith) == 'string') {
							// If empty string, ignore
							if(replaceWith == '') {
								replaceWith = null;
							} else {
								// Create it
								replaceWith = $(replaceWith);
							}
						}
					}

					// Check if we have something valid
					if(replaceWith != null) {
						$(this).replaceWith(replaceWith);
					} else {
						$(this).remove();
					}
				});

				if(div) {
					// Store the new chunk
					div.append(mainChunk);
				} else {
					return mainChunk;
				}

			}
		};

		// Packs arguments
		function packArguments() {
			// Build args array
			var args = [];
			for(var i=0; i<arguments.length; i++) args.push(arguments[i]);

			return args.join(MSG_SEP);
		}

		var templates = {

			// Home page [isLoggedIn:bool, connectedClient:bool, connectedLobby:bool]
			'home':new Template([
				{
					// This will make a given element invisible if the user isn't verified
					'isVerified': function(args) {
						if(!isVerified) {
							return 'style="display:none;"';
						}
					},

					// This will make the given element invisible if the user is verified
					'notVerified': function(args) {
						if(isVerified) {
							return 'style="display:none;"';
						}
					},

					// Returns the user's avatar
					'avatar':function(args) {
						return user['avatar'];
					}
				},
				// User is not logged in
				[function(args) {return !args[0];},
					'<div id="top_padding" class="row" style="height:200px;">'+
					'</div>'
				],
				// User is logged in
				[function(args) {return args[0];},
					'<div id="top_padding" class="row" style="height:75px;">'+
					'</div>'
				],

				'<div id="first_header" class="row" style="height:100px;">',
					'<div id="first_left" class="col-md-3"></div>',
					'<div id="first_middle" class="col-md-6">',
						'<span style="text-align:center;">',

							// User is logged in
							[function(args) {return args[0];},
								'<h1>Welcome back, <img src="[[avatar]]" style="margin-right:5px;margin-bottom:5px;" />' + user['personaname'] + '</h1><br />',

								// Verifiying Div
								'<div id="verifying" [[notVerified]]>',
									'Please wait while we verify you...',
									spinner,
								'</div>',

								// Create lobby button
								'<div id="createLobbyDiv" [[isVerified]]>',
									'<p>Click {{0}} to create a new lobby.</p>',
									function(args) {
										return $('<a>').attr('href', '#').text('here').click(function() {
											selectPage('createLobby');
										});
									},
								'</div>'
							],
							[function(args) {return !args[1];},
								// Download manager
								'<div id="launchManagerDiv" [[isVerified]]>',
									'<p>Click {{1}} to download the app.</p>',
									function(args) {
										return $('<a>').attr('href', '#').text('here').click(function() {
											location.href = 'https://github.com/Jexah/DotaHostAddons/releases/download/' + managerVersion + '/DotaHostManager.exe';
										});
									},
								'</div>'
							],
							[function(args) {return args[1];},
								// Download LoD
								'<div id="downloadLoDDiv" [[isVerified]]>',
									'<p>Click {{2}} to download Legends of Dota.</p>',
									function(args) {
										return $('<a>').attr('href', '#').text('here').click(function() {
											wsClientManager.send(packArguments("update", "lod"));
										});
									},
								'</div>'
							],

							// User is not logged in
							[function(args) {return !args[0];},
								'<h1>Welcome to DotaHost</h1>'
							],
						'</span>',
					'</div>',
					'<div id="first_right" class="col-md-3"></div>',
				'</div>',
				'<div id="second_header" class="row">',
					'<div id="second_left" class="col-md-4"></div>',
					'<div id="second_middle" class="col-md-4">',

						// User is not logged in
						[function(args){return !args[0];},
							'<span style="text-align:center;">',
								'<form action="?login" method="post">',
									'<input type="image" src="http://cdn.steamcommunity.com/public/images/signinthroughsteam/sits_large_border.png">',
								'</form>',
							'</span>'
						],
					'</div>',
					'<div id="second_right" class="col-md-4"></div>',
				'</div>',
				'<br />',
				'<div class="row" style="min-height:40px;">',
					[function(args){return args[0];},
						'<span style="text-align:center;">',
							'<div id="app">',
								'[[0]]',
								function(args) {
									return $('<a>').attr('href', '#').text('here').click(function() {
										location.href = 'https://github.com/Jexah/DotaHostAddons/releases/download/' + managerVersion + '/DotaHostManager.exe';
									});
								},
							'</div>',
						'</span>',
						'<div class="row">',
							'<div class="col-md-12">',
								'<span style="text-align:center;">',
									'<form action="steamauth/logout.php" method="post">',
										'<input value="Logout" type="submit" />',
									'</form>',
								'</span>',
							'</div>',
						'</div>'
					],
				'</div>',
			]),

			// Create lobby page []
			'createLobby': new Template ([
				'<h1>Create a lobby</h1>'+
				'<h2>Settings</h2>'+
				'<p>No settings for shoe!</p>',
				'Lobby name: <input id="inputLobbyName" text="text">',
				'<p>Click {{0}} to create a lobby!</p>',
					function(args) {
						return $('<a>').attr('href', '#').text('here').click(function() {

							var lobby = {};
							var addon = {};
							addon[ADDON_ID] = "lod";
							addon[ADDON_OPTIONS] = {"pickingStyle":"All Pick"};

							var addons = {"0":addon};

							var team1 = {};
							team1[TEAM_NAME] = "Radiant";
							team1[TEAM_MAX_PLAYERS] = "5";
							team1[TEAM_PLAYERS] = {};

							var team2 = {};
							team2[TEAM_NAME] = "Dire";
							team2[TEAM_MAX_PLAYERS] = "5";
							team2[TEAM_PLAYERS] = {};


							var teams = {"0":team1,"1":team2};

							lobby[LOBBY_NAME] = $("#inputLobbyName").val() || user['personaname'] + "'s Lobby";
							lobby[LOBBY_CURRENT_PLAYERS] = "0";
							lobby[LOBBY_MAX_PLAYERS] = "2";
							lobby[LOBBY_REGION] = REGION_TO_ID["Australia"];
							lobby[LOBBY_TEAMS] = teams;
							lobby[LOBBY_ADDONS] = addons;

							args = JSON.stringify(lobby);


							var msg = packArguments('createLobby', user.token, user.steamid, args);

							console.log('Sending message: '+msg);
							wsClientLobby.send(msg);
						});
					}
			]),

			'lobby': new Template ([
				{
					// Returns the lobby name
					'lobbyName':function(args) {
						return args[LOBBY_NAME];
					},

					// Returns the lobby region
					'lobbyRegion':function(args) {
						return ID_TO_REGION[args[LOBBY_REGION]];
					},

					'wtf':function(args) {
						return $('<a>').attr('href', '#').text('START GAME').click(function() {
							wsClientLobby.send("startGames");
						});
					}
				},
				'<h1>Lobby: [[lobbyName]]<br /> Region: [[lobbyRegion]]</h1>'+
				'<h2>Addons</h2><br />',
				'[[0]]',
				function(args){
					var ret = '';
					var addons = args[LOBBY_ADDONS];
					for(var addon in addons){
						ret += addons[addon][ADDON_ID] + '<br />';
					}
					return ret;
				},
				'<h2>Players</h2><br />',
				'[[1]]',
				function(args){
					var ret = '';
					var teams = args[LOBBY_TEAMS];
					for(var teamKey in teams){
						if(!teams.hasOwnProperty(teamKey)){continue;}
						var team = teams[teamKey];
						ret += '<h3>' + team[TEAM_NAME] + '</h3><br />';
						for(var playerKey in team[TEAM_PLAYERS]){
							if(!team[TEAM_PLAYERS].hasOwnProperty(playerKey)){continue;}
							var player = team[TEAM_PLAYERS][playerKey];
							ret += 	'<a href="' + player[PLAYER_PROFILEURL] + '">'+
										'<img src="' + player[PLAYER_AVATAR] + '">' + player[PLAYER_PERSONANAME]+
									'</a><br />';
						}
					}
					return ret;
				},
				'{{wtf}}'
			]),

			// Lobby screen []
			'inLobby': new Template ([
				'<h1>Awesome Lobby</h1>'+
				'<h2>Players</h2>'
			])
		};

		// Selects the given template page
		selectPage = function(templateName, args){
			if(templates[templateName]) {
				templates[templateName].apply(args, '#main');
			} else {
				console.log('WARNING: Failed to find template named ' + templateName);
			}
		}

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
				var lobbiesStr = '';
				lobbies = JSON.parse(x[1]);
				
			},
			'joinLobby':function(e, x){
				if(x[1] === 'success'){
					var lobby = JSON.parse(x[2]);
					selectPage('lobby', lobby);
				}else{
					console.log('Failed to join lobby: ' + x[2]);
				}
			},
			'validate':function(e, x){
				if(x[1] == 'success') {
					// Verified successfully!
					selectPage('home', [user != null, connectedClient, connectedLobby]);
					wsClientLobby.send("getLobbies");
				} else {
					// Failed to verify
				}
			},
			'addon':function(e, x){
				var status = x[1];
				var addonID = x[2];
				installedAddons[addonID] = status;
			},

			'gameServerInfo':function(e, x){
				if(x[1] === "success"){
					location.href = "steam://connect/" + x[2];
				}
			}
		}
		var timeoutPrevention;

		function showLobbies(){
			for(var lobbyKey in lobbies){
				if(!lobbies.hasOwnProperty(lobbyKey)){continue;};
				var lobby = lobbies[lobbyKey];
				lobbiesStr += 'Name: <span class="lobbyname">' + lobby[LOBBY_NAME] + '</span> | Players: ' + lobby[LOBBY_CURRENT_PLAYERS] + '/' + lobby[LOBBY_MAX_PLAYERS] + ' | Addons: [';
				for(var addonKey in lobby[LOBBY_ADDONS]){
					if(!lobby[LOBBY_ADDONS].hasOwnProperty(addonKey)){continue;};
					var addon = lobby[LOBBY_ADDONS][addonKey];
					lobbiesStr += addon[ADDON_ID] + ', ';
				}
				lobbiesStr = lobbiesStr.substring(0, lobbiesStr.length - 2) + "]";
				lobbiesStr += ' <button class="joinlobby">Join</button><br />';
			}
			lobbiesStr += '<br />';
			$('#app').html(lobbiesStr);
			$('.joinlobby').click(function(){
				var lobbyName = $(this).parent().find('.lobbyname').first().text();
				var addons = lobbies[lobbyName][LOBBY_ADDONS];
				for(var addonKey in addons){
					if(!addons.hasOwnProperty(addonKey)){continue;};
					var addon = addons[addonKey];
					switch(installedAddons[addon[ADDON_ID]]){
						case ADDON_STATUS_ERROR:
							alert('An unknown error has occured.');
							break;
						case ADDON_STATUS_MISSING:
							alert('Please install the addon.');
							break;
						case ADDON_STATUS_UPDATE:
							alert('Please update the addon.');
							break;
						case ADDON_STATUS_READY:
							wsClientLobby.send(packArguments('joinLobby', user.token, user.steamid, $(this).parent().find('.lobbyname').first().text()));
							break;
						default:
							if(connectedClient){
								alert('Please install the addon.');
							}else{
								alert('Please run the manager.');
							}
							break;
					}
				}
			});
		}

		location.href = "dotahost://";

		function setupClientSocket(){
			wsClientManager = new WebSocket("ws://127.0.0.1:2074");

			wsClientManager.onopen = function(e){

				wsClientManager.send("getAddonStatus");

				timeoutPrevention = setInterval(function(){wsClientManager.send("time");}, 1000);

				connectedClient = true;

				if(connectedClient && connectedLobby){
					//var newAppHtml = '<br />';
					//newAppHtml += 'Click <a href="#" onclick="wsClientManager.send(packArguments(\'update\', \'lod\'))";>here</a> to download Legends of Dota!';
					//$('#app').html(newAppHtml);

				}

				selectPage('home', [user != null, connectedClient, connectedLobby]);
			};

			wsClientManager.onclose = function(e){
				if(connectedClient){selectPage('home', [user != null, connectedClient, connectedLobby]);}
				connectedClient = false;
				clearInterval(timeoutPrevention);
			};
			var onMessage = function(e){
				console.log(e.data);
				var args = e.data.split(MSG_SEP);
				if(wsHooks.hasOwnProperty(args[0])){
					wsHooks[args[0]](e, args);
				}
			};
			wsClientManager.onmessage = onMessage;

			wsClientManager.onerror = function(e, r, t){
				if(wsClientManager.readyState === 3){
					//selectPage('home', [user != null, connectedClient, connectedLobby]);
				};
				setTimeout(setupClientSocket, 1000);
			};
		};

		function setupWebLobbySocket(){
			wsClientLobby = new WebSocket("ws://dotahost.net:2075");

			wsClientLobby.onopen = function(e){

				connectedLobby = true;

				//if(connectedLobby && connectedClient){
				//	$('#app').html('Click <a href="#" onclick="wsClientManager.send(packArguments(\'update\', \'lod\'));">here</a> to download Legends of Dota!');
				//}

				// Ask for validation straight away
				wsClientLobby.send(packArguments('validate', user.token, user.steamid));

				// We should now be verified
				isVerified = true;

				selectPage('home', [user != null, connectedClient, connectedLobby]);
			};

			wsClientLobby.onclose = function(e){
				if(connectedLobby){selectPage('home', [user != null, connectedClient, connectedLobby]);}
				connectedLobby = false;
			};

			wsClientLobby.onerror = function(e, r, t){
				if(wsClientLobby.readyState === 3){
					//selectPage('home', [user != null, connectedClient, connectedLobby]);
				};
				setTimeout(setupWebLobbySocket, 1000);
			};

			var onMessage = function(e){
				console.log(e.data);
				var args = e.data.split(MSG_SEP);

				if(wsHooks.hasOwnProperty(args[0])){
					wsHooks[args[0]](e, args);
				}
			};
			wsClientLobby.onmessage = onMessage;
		};

		if(user != null){
			setTimeout(setupClientSocket, 1000);
			setTimeout(setupWebLobbySocket, 1000);
		}

	});

})();

























































