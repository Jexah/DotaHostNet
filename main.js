














































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
		var PLAYER_BADGES = "4";
		var PLAYER_COSMETICS = "5";

		var ADDON_STATUS_ERROR = "0";
		var ADDON_STATUS_MISSING = "1";
		var ADDON_STATUS_UPDATE = "2";
		var ADDON_STATUS_READY = "3";

		var BADGES_TEXT = 0;
		var BADGES_CLASS = 1;

		var BADGES = [
			[
				'Veteran',
				'Member',
				'Donor',
				'Volunteer',
				'Warning',
				'Admin'
			],
			[
				'label label-default',
				'label label-primary',
				'label label-success',
				'label label-info',
				'label label-warning',
				'label label-danger'
			]
		];

		var COSMETICS = {
			'0':'',
			'1':' list-group-item-success',
			'2':' list-group-item-info',
			'3':' list-group-item-warning',
			'4':' list-group-item-danger'
		}

		var TRANSPARENT_IMAGE = 'http://upload.wikimedia.org/wikipedia/commons/c/ce/Transparent.gif';

		var currentPage = 'home';
		var lobbies = {};
		var currentLobby = {};
		var installedAddons = {};
		var currentTeamID = '';
		var currentPlayerID = '';
		var thisPlayer = {};

		var gameInfoPatched = null;

		var lobbiesChangedTimeout = false;

		var downloadStarted = { 'lod': false };

		if(user != null){
			thisPlayer[PLAYER_PROFILEURL] = user['profileurl'];
			thisPlayer[PLAYER_AVATAR] = user['avatarmedium'];
			thisPlayer[PLAYER_PERSONANAME] = user['personaname'];
			thisPlayer[PLAYER_STEAMID] = user['steamid'];
		}


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


		// Will contain the function to select pages
		var selectPage;

		var launchModManagerTimeout = null;

		// Whether we have been verified or not
		var isVerified = null;

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
					}8

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

				// Find reusable function referencesk
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
					},

					'connectedToModManager':function(args){
						if(connectedClient){
							return ''+
							'<div class="alert alert-success">'+
								'<h4>ModManager</h4><span class="glyphicon glyphicon-ok" style="position:absolute;left:calc(100% - 50px);top:10px;"></span>'+
								'<strong>Successfully</strong> connected to ModManager!'+
							'</div>';
						}else{
							return ''+
							'<div class="alert alert-info">'+
								'<h4>ModManager!</h4><span style="position:absolute;left:calc(100% - 50px);top:-10px;">'+spinner+'</span>'+
								'<strong>Attempting</strong> to connect to local ModManager.'+
							'</div>';
						}
					},

					'connectedToLobbyManager':function(args){
						if(isVerified == null){
							return ''+
							'<div class="alert alert-info">'+
								'<h4>LobbyManager!</h4><span style="position:absolute;left:calc(100% - 50px);top:-10px;">'+spinner+'</span>'+
								'<strong>Attempting</strong> to connect to Dotahost LobbyManager.'+
							'</div>'
						}else if(!isVerified){
							return ''+
							'<div class="alert alert-info">'+
								'<h4>LobbyManager!</h4><span style="position:absolute;left:calc(100% - 50px);top:-10px;">'+spinner+'</span>'+
								'<strong>Failed</strong> to verify user profile.'+
							'</div>';
						}else{
							return ''+
							'<div class="alert alert-success">'+
								'<h4>LobbyManager</h4><span class="glyphicon glyphicon-ok" style="position:absolute;left:calc(100% - 50px);top:10px;"></span>'+
								'<strong>Successfully</strong> verified user profile!'+
							'</div>';
						}
					}
				},
				// User is not logged in
				[function(args) {return !args[0];},
					'<div class="row clearfix" style="margin-top:100px;">',
						'<div class="col-md-2 column">',
						'</div>',
						'<div class="col-md-8 column">',
							'<div class="jumbotron" style="text-align:center;">',
								'<h1>',
									'Welcome to Dotahost',
								'</h1>',
								'<p>',
									'Dota 2 Custom Games',
								'</p>',
								'<br />',
								'<p>',
									'<form action="?login" style="display:block;" method="post">{{0}}[[1]]',
										function(args){
											return $('<a>').attr({'class': 'btn btn-warning btn-lg', 'style': 'float:left;width:200px;display:block;margin-left:150px;margin-right:30px;', 'href': '#'}).text('What is this sorcery?').click(function(){
												selectPage('information', []);
											});
										},
										function(args){
											return '<input style="display:block;" type="image" src="http://cdn.steamcommunity.com/public/images/signinthroughsteam/sits_large_noborder.png">';
										},
									'</form>',
								'</p>',
							'</div>',
						'</div>',
						'<div class="col-md-2 column">',
						'</div>',
					'</div>'
				],
				// User is logged in
				[function(args) {return args[0];},
					// User is white listed
					[function(args) {return user && user.whitelisted;},
						'<span class="glyphicon glyphicon-remove" style="visibility:hidden;"></span>',
						'<span class="glyphicon glyphicon-ok" style="visibility:hidden;"></span>',
						'<span class="glyphicon glyphicon-download-alt" style="visibility:hidden;"></span>',
						'<div class="row" style="margin-top:100px;">',
							'<div class="col-md-9 col-lg-8 col-md-push-3 col-lg-push-2 column">',
								'<div class="row">',
									'<div id="localClientConnectedDiv" class="col-md-6 column">',
										'[[connectedToModManager]]',
									'</div>',
									'<div id="dotahostLobbyConnectedDiv" class="col-md-6 column">',
										'[[connectedToLobbyManager]]',
									'</div>',
								'</div>',
								'<div class="row">',
									'<div class="col-md-12 column">',
										'<h3 class="text-left">',
											'<span style="float:left;">Lobbies</span>{{0}}',
											function(args){
												return $('<button>').attr({'type':'button', 'style':'float:right;margin-left:5px;', 'class':'btn btn-primary', 'data-toggle':'modal', 'data-target':'#createLobbyOptions'}).text('Create Lobby').click(function(){
													refreshCreateLobbyModal();
												});
											},
											'{{1}}',
											function(args){
												return $('<button>').attr({'type':'button', 'style':'float:right;margin-left:5px;', 'class':'btn btn-info', 'data-toggle':'modal', 'data-target':'#settings'}).text('Settings').click(function(){
													openSettingsModal();
												});
											},
											'{{2}}',
											function(args){
												return $('<button>').attr({'type':'button', 'style':'float:right;', 'class':'btn btn-primary btn-warning'}).text('Logout').click(function(){
													location.href = 'logout.php';
												});
											},
										'</h3>',
									'</div>',
									'<div class="col-md-6 column" style="text-align:right;">',
										 '',
									'</div>',
								'</div>',
								'<div class="row">',
									'<div id="homeLobbiesTable" class="col-md-12 column">',
										'<span style="margin-left:50px;">'+spinner+'</span>',
									'</div>',
								'</div>',
							'</div>',
							'<div id="addonStatusContainer" class="col-md-3 col-lg-2 col-md-pull-9 col-lg-pull-8 column"></div>',
							'<div class="col-md-0 col-lg-2 column">',
							'</div>',
						'</div>'
					],

					// User is white NOT listed
					[function(args) {return !user || !user.whitelisted;},
						'<div class="row">',
							'<div class="col-md-3 column">',
							'</div>',
							'<div class="col-md-6 column">',
								'<h1>Rats!</h1>',
								'<p>You\'re not a beta participant :(</p>',
								'{{1}}',
								function(args){
									return $('<button>').attr({'type':'button', 'style':'float:right;', 'class':'btn btn-primary btn-warning'}).text('Logout').click(function(){
										location.href = 'logout.php';
									});
								},
							'</div>',
						'</div>'
					]
				]
			]),

			'lobby-lod': new Template ([
				{
					'lobbyName':function(args){
						return args[LOBBY_NAME];
					},

					'lobbyAddons':function(args){
						var addons = '';
						for(var addonKey in args[LOBBY_ADDONS]){
							var addon = args[LOBBY_ADDONS][addonKey];
							addons += addon[ADDON_ID] + ', ';
						}
						addons = addons.substring(0, addons.length - 2);
						return addons;
					}
				},
				'<div class="row clearfix">',
					'<div class="col-xl-2 col-lg-0 col-md-0 col-sm-0 column"></div>',
					'<div class="col-xl-8 col-lg-12 col-md-12 col-sm-12 column">',
						'<div class="row clearfix">',
							'<div class="col-md-6 col-sm-6 column">',
								'<h1>[[lobbyName]]</h1>',
							'</div>',
							'<div class="col-md-6 col-sm-6 column">',
								'<h2 style="text-align:right;">Legends of Dota</h2>',
							'</div>',
						'</div>',
					'</div>',
					'<div class="col-xl-2 col-lg-0 col-md-0 col-sm-0 column"></div>',
				'</div>',
				'<div class="row clearfix">',
					'<div class="col-lg-0 col-md-0 col-sm-0 column col-xl-2"></div>',
					'<div style="padding:0 5px" class="col-lg-6 col-md-6 col-sm-6 col-xs-12 column col-xl-4">',
						'{{0}}',
						function(args){
							var teamID = '0';
							var teams = args[LOBBY_TEAMS];
							var team = teams[teamID];
							var players = team[TEAM_PLAYERS];

							var listGroup = $('<div>').attr({'id':'teamList'+teamID, 'class':'list-group'})
								.append($('<a>').attr({'style':'cursor:default;', 'class':'list-group-item disabled'})
									.html('<h4>'+team[TEAM_NAME]+'</h4>').click(function(e){
										e.preventDefault();
									})
								);
							for(var i = 0; i < 5; ++i){
								addPlayerToTeamList(listGroup, players, team, teamID, ''+i, true);
							}
							return listGroup;
						},
					'</div>',
					'<div style="padding:0 5px" class="col-lg-6 col-md-6 col-sm-6 col-xs-12 column col-xl-4">',
						'{{2}}',
						function(args){
							var teamID = '1';
							var teams = args[LOBBY_TEAMS];
							var team = teams[teamID];
							var players = team[TEAM_PLAYERS];

							var listGroup = $('<div>').attr({'id':'teamList'+teamID, 'class':'list-group', 'style':'text-align:right;'})
								.append($('<a>').attr({'style':'cursor:default;', 'class':'list-group-item disabled'})
									.html('<h4>'+team[TEAM_NAME]+'</h4>').click(function(e){
										e.preventDefault();
									})
								);
							for(var i = 0; i < 5; ++i){
								addPlayerToTeamList(listGroup, players, team, teamID, ''+i, false);
							}
							return listGroup;
						},
					'</div>',
					'<div class="col-lg-0 col-md-0 col-sm-0 column col-xl-2"></div>',
				'</div>',
				'<div class="row clearfix">',
					'<div class="col-lg-0 col-md-0 col-sm-0 column col-xl-2"></div>',
					'<div class="col-lg-8 col-md-8 col-sm-8 column col-xl-6">',
						'<div class="well well-sm" style="height:300px;">',
							'<div id="lodLobbyChat" style="width:100%;height:calc(100% - 24px);overflow-y:auto;">',
							'</div>',
							'<div class="input-group" style="margin:0 -11px 0 -10px;">',
								'{{4}}',
								function(args){
									return $('<input>').attr({'id':'lodLobbyChatText', 'type':'text', 'class':'form-control', 'style':'-webkit-border-top-left-radius:0;-moz-border-radius-topleft:0;border-top-left-radius:0;'}).keyup(function(event){
										if(event.keyCode == 13){
											$('#lodLobbyChatButton').click();
										}
									});
								},
								'<span class="input-group-btn">',
									'{{3}}',
									function(args){
										return $('<button>').attr({'id':'lodLobbyChatButton', 'onfocus':'$("#lodLobbyChatText").focus();', 'tabindex':'-1', 'class':'btn btn-default', 'type':'button', 'style':'-webkit-border-top-right-radius:0;-moz-border-radius-topright:0;border-top-right-radius:0;'}).text('Send').click(function(){
											var chatTextElement = $('#lodLobbyChatText')
											var chatText = chatTextElement.val();
											if(chatText != ''){
												addChat($('#lodLobbyChat'), user['personaname'], chatText, user['cosmetics']);
												wsClientLobby.send(packArguments('chat', chatText));
												chatTextElement.val('');
											}
										});
									},
								'</span>',
							'</div>',
						'</div>',
					'</div>',
					'<div class="col-lg-4 col-md-4 col-sm-4 column col-xl-2">',
						'{{5}}',
						function(args){
							return $('<button>').attr({'id':'leaveLobbyReconnect', 'class':'btn btn-default btn-lg', 'style':'width:100%;margin-bottom:20px;'}).text('Leave Lobby').click(function(){
								wsClientLobby.send('leaveLobby');
							});
						},
						'{{1}}',
						function(args){
							var teamID = '2';
							var teams = args[LOBBY_TEAMS];
							var team = teams[teamID];
							var players = team[TEAM_PLAYERS];

							var listGroup = $('<div>').attr({'id':'teamList'+teamID, 'class':'list-group', 'style':'text-align:right;'})
								.append($('<a>').attr({'style':'cursor:default;', 'class':'list-group-item disabled'})
									.html('<h4>'+team[TEAM_NAME]+'</h4>').click(function(e){
										e.preventDefault();
									})
								);
							for(var playerKey in players){
								addPlayerToTeamList(listGroup, players, team, teamID, playerKey, true);
							}
							return listGroup;
						},
					'</div>',
					'<div class="col-lg-0 col-md-0 col-sm-0 column col-xl-2"></div>',
				'</div>'
			])
		};

		// Selects the given template page
		function selectPage(templateName, args){
			if(templates[templateName]) {
				templates[templateName].apply(args, '#main');
				currentPage = templateName;
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
			'startInstall':function(e, x){
				$('#app').html('<div class="progress"><div id="progress" class="progress-bar progress-bar-striped active" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" style="width:0%"></div></div>');
			},
			'addon':function(e, x){
				// addon;lod;100
				if(downloadStarted[x[1]]){
					$('#'+x[1]+'ProgressBar').attr({'aria-valuenow':x[2], 'style':'width:'+x[2]+'%;'});
				}else if(x[2] !== '100'){
					downloadStarted[x[1]] = true;
				}else{
					$('#'+x[1]+'Status').attr({'class':'bs-callout bs-callout-info', 'style':'cursor:wait;'}).html(
						'<div class="progress" style="margin-top:17px;margin:0 0 2px 0;">'+
							'<div id="'+x[1]+'ProgressBar" class="progress-bar progress-bar-info progress-bar-striped active" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" style="width: 0%">'+
							'</div>'+
						'</div>'
					).off();
				}
			},

			'installationComplete':function(e, x){
				wsClientManager.send('getAddonStatus');
			},
			'page':function(e, x){
				if(x[1] == currentPage && currentPage != 'home'){
					return;
				}
				switch(x[1]){
					case 'home':
						refreshHome();
						break;
					case 'lobby':
						currentLobby = JSON.parse(x[2]);
						selectPage('lobby-' + currentLobby[LOBBY_ADDONS]['0'][ADDON_ID], currentLobby);
						break;
				}
			},
			'getLobbies':function(e, x){
				lobbies = JSON.parse(x[1]);
				populateLobbies();
			},
			'leaveLobby':function(e, x){
				refreshHome();
			},
			'chat':function(e, x){
				var personaname;
				var cosmetics;
				var teams = currentLobby[LOBBY_TEAMS];
				for(var teamKey in teams){
					var team = teams[teamKey];
					var players = team[TEAM_PLAYERS];
					for(var playerKey in players){
						var player = players[playerKey];
						if(player[PLAYER_STEAMID] == x[1]){
							personaname = player[PLAYER_PERSONANAME];
							personaname = player[PLAYER_COSMETICS];
						}
					}
				}
				addChat($('#lodLobbyChat'), personaname, x[2], cosmetics);
			},
			'addPlayerToLobby':function(e, x){
				var player = JSON.parse(x[1]);
				var teams = currentLobby[LOBBY_TEAMS];
				var team = teams[x[2]];
				var players = team[TEAM_PLAYERS];
				var maxPlayers = team[TEAM_MAX_PLAYERS];
				for(var i = 0; i < maxPlayers; ++i){
					if(!players[''+i]){
						addPlayerToTeam(player, team, ''+i, x[2]);
						return;
					}
				}
			},
			'joinLobby':function(e, x){
				if(x[1] === 'success'){
					var lobby = JSON.parse(x[2]);
					currentLobby = lobby;
					selectPage('lobby-' + currentLobby[LOBBY_ADDONS]['0'][ADDON_ID], currentLobby);
				}else{
					console.log('Failed to join lobby: ' + x[2]);
				}
			},
			'swapTeam':function(e, x){
				//("swapTeam", teamID, slotID, steamID)
				var teamRemove;
				var teamAddKey = x[1];
				var slotID = x[2];
				var steamID = x[3];
				var teams = currentLobby[LOBBY_TEAMS];
				for(var teamKey in teams){
					if(!teams.hasOwnProperty(teamKey)){continue;}
					var team = teams[teamKey];
					var players = team[TEAM_PLAYERS];
					for(var playerKey in players){
						var player = players[playerKey];
						if(player[PLAYER_STEAMID] == x[3]){
							teamRemove = team;
							removePlayerFromTeam(player, playerKey, teamRemove, teamKey, teamKey == '2');
							addPlayerToTeam(player, teams[teamAddKey], slotID, teamAddKey);
							return;
						}
					}
				}
			},
			'validate':function(e, x){
				if(x[1] == 'success') {
					isVerified = true;
					wsClientLobby.send('getPage');
				} else {
					isVerified = false;
					refreshHome();
				}
			},
			'addonStatus':function(e, x){
				var status = x[1];
				var addonID = x[2];
				installedAddons[addonID] = status;
				var addonStatusDiv = $('#'+addonID+'Status');
				switch(installedAddons[addonID]){
					case ADDON_STATUS_ERROR:
						addonStatusDiv.attr({'class':'bs-callout bs-callout-danger col-sm-4 col-md-12', 'style':'cursor:pointer;'});
						addonStatusDiv.html('<h4 style="witdh:100%;">Legends of Dota <span style="float:right;" class="glyphicon glyphicon-remove"></span></h4>');
						addonStatusDiv.click(function(){
							wsClientManager.send(packArguments('update', 'lod'));
						});
						break;
					case ADDON_STATUS_MISSING:
						addonStatusDiv.attr({'class':'bs-callout bs-callout-danger col-sm-4 col-md-12', 'style':'cursor:pointer;'});
						addonStatusDiv.html('<h4 style="witdh:100%;">Legends of Dota <span style="float:right;" class="glyphicon glyphicon-download-alt"></span></h4>');
						addonStatusDiv.click(function(){
							wsClientManager.send(packArguments('update', 'lod'));
						});
						break;
					case ADDON_STATUS_UPDATE:
						addonStatusDiv.attr({'class':'bs-callout bs-callout-warning col-sm-4 col-md-12', 'style':'cursor:pointer;'});
						addonStatusDiv.html('<h4 style="witdh:100%;">Legends of Dota <span style="float:right;" class="glyphicon glyphicon-download-alt"></span></h4>');
						addonStatusDiv.click(function(){
							wsClientManager.send(packArguments('update', 'lod'));
						});
						break;
					case ADDON_STATUS_READY:
						addonStatusDiv.attr({'class':'bs-callout bs-callout-success col-sm-4 col-md-12', 'style':'cursor:default;'});
						addonStatusDiv.html('<h4 style="witdh:100%;">Legends of Dota <span style="float:right;" class="glyphicon glyphicon-ok"></span></h4>');
						addonStatusDiv.off();
						break;
				}
			},

			'connectToServer':function(e, x){
				$('#leaveLobbyReconnect').text('Reconnect').click(function(){
					location.href = "steam://connect/" + x[1];
				});
				location.href = "steam://connect/" + x[1];
			},

			'gameServerInfo':function(e, x){
				if(x[1] === "success"){
					wsClientManager.send(packArguments(x[0], x[2], JSON.stringify(currentLobby)));
				}
			},

			'patchGameInfo':function(e, x){
				setGameInfoPatched(x[1] == '1');
			},

			'tryPatchGameInfo':function(e, x){
				setGameInfoPatched(x[1] == '1');
				alert(gameInfoPatched?'Patch successful!':'Patch failed!');
			},

			'autorun':function(e, x){
				updateAutorunOption(x[1]=='1');
			},
			'dotaPath':function(e, x){
				dotaPath = x[1];
				updateDotaPathOption();
			},
			'lobbyFull':function(e, x){
				var k = function(j){
					if(j == 5){
						console.log('starting game...');
					}
					console.log(j);
					if(j != 0){
						setTimeout((function(a){return function(){a(j-1)}})(k), 1000);
					}
				}
				k(5);
			}
		}
		var timeoutPrevention;

		function addChat(chatContainerElement, personaname, text, cosmetics){
			var scrollDown = chatContainerElement.scrollTop() + chatContainerElement.innerHeight() + 10 >= chatContainerElement.prop('scrollHeight');
			chatContainerElement.append(
				$('<span>').attr({'style':'white-space:nowrap;display:block;width:100%;', 'class':COSMETICS[''+cosmetics]}).append(
					$('<strong>').text(personaname + ': ')
				).append(
					$('<span>').text(text).attr('style', 'white-space:normal;word-wrap:break-word;')
				).append('<br />')
			);
			if(scrollDown){
				chatContainerElement.scrollTop(chatContainerElement.prop('scrollHeight'));
			}
		}

		function addPlayerToTeamList(listGroup, team_players, unallocated, teamid, slotid, avatarLeft){
			var player;
			var empty;

			if(team_players.hasOwnProperty(slotid)){
				player = team_players[slotid];
				empty = false;
			}else{
				player = {};
				player[PLAYER_PROFILEURL] = '#';
				player[PLAYER_AVATAR] = TRANSPARENT_IMAGE,
				player[PLAYER_PERSONANAME] = 'Empty',
				player[PLAYER_COSMETICS] = '0',
				player[PLAYER_BADGES] = '0'
				empty = true;
			}

			console.log(JSON.stringify(player));

			var nameSpan = $('<span>').attr('class', 'name').text(player[PLAYER_PERSONANAME]);
			var img = $('<img>').attr({'src':player[PLAYER_AVATAR], 'style':'border:0;background-size:contain;height:32px;width:32px;margin-'+(avatarLeft?'right':'left')+':10px;'});
			var badgesSpan = $('<span>').attr('class', 'badges '+(avatarLeft?'pull-right ':'pull-left '));
			var badgesNum = parseInt(player[PLAYER_BADGES]);
			for(var i = (avatarLeft?0:5); (avatarLeft?i<=5:i>=0); (avatarLeft?++i:--i)){
				var bitNum = Math.pow(2, i);
				console.log(badgesNum+':'+bitNum+':'+(badgesNum & bitNum));
				if((badgesNum & bitNum) == bitNum){
					badgesSpan.append($('<span>').attr('class', BADGES[BADGES_CLASS][i]).text(BADGES[BADGES_TEXT][i]));
				}
			}
			console.log(''+player[PLAYER_COSMETICS]);
			console.log(COSMETICS[''+player[PLAYER_COSMETICS]])
			var container = $('<a>').attr({'id':''+teamid+slotid, 'slotid':slotid, 'href':player[PLAYER_PROFILEURL], 'onfocus':'this.blur();', 'tabindex':'-1', 'target':(empty?'_self':'_blank'), 'style':'white-space:nowrap;padding:10px 10px;overflow:hidden;', 'class':'list-group-item'+(COSMETICS[''+player[PLAYER_COSMETICS]])})
				.append(avatarLeft?img:badgesSpan)
				.append(nameSpan)
				.append(avatarLeft?badgesSpan:img)
				.click(function(e){
					if(empty){
						e.preventDefault();
						wsClientLobby.send(packArguments('swapTeam', $(this).attr('slotid'), teamid));
					}
				});
			listGroup.append(container);
		}

		function populateLobbies(){
			lobbiesChangedTimeout = true;
			setTimeout(function(){lobbiesChangedTimeout = false;}, 500);
			var lobbiesTable = $('<table>').attr('class', 'table table-hover').append(
				$('<thead>').append(
					$('<tr>').append(
						$('<th>').text('Lobby Name')
					).append(
						$('<th>').text('Addons')
					).append(
						$('<th>').text('Options')
					).append(
						$('<th>').text('Players')
					)
				)
			);
			var tbody = $('<tbody>');
			for(var lobbyKey in lobbies){
				if(!lobbies.hasOwnProperty(lobbyKey)){continue;};
				var lobby = lobbies[lobbyKey];
				var lobbyName = lobby[LOBBY_NAME];
				var tr = $('<tr>').attr('style', 'cursor:pointer;');
				tr.append($('<td>').text(lobbyName));
				var addonsStr = '';
				var optionsStr = '';
				for(var addonKey in lobby[LOBBY_ADDONS]){
					if(!lobby[LOBBY_ADDONS].hasOwnProperty(addonKey)){continue;};
					var addon = lobby[LOBBY_ADDONS][addonKey];
					addonsStr += addon[ADDON_ID] + ', ';
					for(var optionKey in addon[ADDON_OPTIONS]){
						optionsStr += addon[ADDON_ID] + ': ' + optionKey + '=' + addon[ADDON_OPTIONS][optionKey] + ', ';
					}
				}
				if(addonsStr != ''){
					addonsStr = addonsStr.substring(0, addonsStr.length - 2);
				}
				if(optionsStr != ''){
					optionsStr = optionsStr.substring(0, optionsStr.length - 2);
				}
				tr.append($('<td>').text(addonsStr));
				tr.append($('<td>').text(optionsStr));
				tr.append($('<td>').text(lobby[LOBBY_CURRENT_PLAYERS] + '/' + lobby[LOBBY_MAX_PLAYERS]));
				tr.click(function(){
					if(lobbiesChangedTimeout){
						return;
					}
					if(!gameInfoPatched){
						alert('Please patch gameinfo (in settings).');
					}
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
								wsClientLobby.send(packArguments('joinLobby', $(this).parent().find('td').first().text()));
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
				tbody.append(tr);
			}
			lobbiesTable.append(tbody);
			$('#homeLobbiesTable').html(lobbiesTable);
		}

		function setTeamListElementToPlayer(element, player, avatarLeft, deleteSlot){




			console.log(JSON.stringify(player));

			if(typeof deleteSlot === "undefined") {
				deleteSlot = false;
			}
			if(deleteSlot){
				element.remove();
				return;
			}
			if(!player){
				element.attr('class', 'list-group-item');
				element.attr('href', '#');
				element.find('span.name').text('Empty');
				element.find('span.badges').html('');
				element.find('img').first().attr('src', TRANSPARENT_IMAGE);
				element.click(function(e){
					e.preventDefault();
					var thisId = $(this).attr('id');
					wsClientLobby.send(packArguments('swapTeam', thisId[1], thisId[0]));
				});
				return;
			}
			console.log(''+player[PLAYER_COSMETICS]);
			console.log(COSMETICS[''+player[PLAYER_COSMETICS]])
			element.attr('class', 'list-group-item'+(COSMETICS[''+player[PLAYER_COSMETICS]]));
			element.attr({'href':player[PLAYER_PROFILEURL], 'target':(player?'_blank':'_self')});
			element.find('span.name').text(player[PLAYER_PERSONANAME]);
			var badgesSpan = element.find('span.badges').first().html('');
			var badgesNum = parseInt(player[PLAYER_BADGES]);
			for(var i = (avatarLeft?0:5); (avatarLeft?i<=5:i>=0); (avatarLeft?++i:--i)){
				var bitNum = Math.pow(2, i);
				if((badgesNum & bitNum) == bitNum){
					badgesSpan.append($('<span>').attr('class', BADGES[BADGES_CLASS][i]).text(BADGES[BADGES_TEXT][i]));
				}
			}
			element.find('img').first().attr('src', player[PLAYER_AVATAR]);
			element.off('click');
		}

		function addPlayerToTeam(player, team, slot, teamid){
			team[TEAM_PLAYERS][slot] = player;
			if($('#'+teamid+slot).length){
				setTeamListElementToPlayer($('#'+teamid+slot), player, teamid==0);
			}else{
				addPlayerToTeamList($('#teamList'+teamid), team[TEAM_PLAYERS], team, teamid, slot, teamid==0);
			}
		}

		function removePlayerFromTeam(player, playerKey, team, teamid, deleteSlot){
			var players = team[TEAM_PLAYERS];
			delete players[playerKey];
			setTeamListElementToPlayer($('#'+teamid+playerKey), null, teamid==0, deleteSlot);
		}

		function setupClientSocket(){
			wsClientManager = new WebSocket("ws://127.0.0.1:2074");

			wsClientManager.sendReal = wsClientManager.send;
			wsClientManager.send = function(string){
				if(string != 'time'){
					console.log('Sent:');
					console.log(string);
				}
				wsClientManager.sendReal(string);
			}

			wsClientManager.onopen = function(e){
				connectedClient = true;

				clearTimeout(launchModManagerTimeout);

				wsClientManager.send("getAddonStatus");
				wsClientManager.send('getPatchGameInfo');

				timeoutPrevention = setInterval(function(){wsClientManager.send("time");}, 1000);

				$('#localClientConnectedDiv').html(
					'<div class="alert alert-success">'+
						'<h4>ModManager</h4><span class="glyphicon glyphicon-ok" style="position:absolute;left:calc(100% - 50px);top:10px;"></span>'+
						'<strong>Successfully</strong> connected to ModManager!'+
					'</div>'
				);
				$('#addonStatusContainer').append(
					'<div id="lodStatus" class="bs-callout bs-callout-info col-sm-4 col-md-12" style="cursor:default;">'+
						'<h4>Legends of Dota <span style="float:right;margin-top:-20px;margin-right:-4px;">'+spinner+'</span></h4>'+
					'</div>'
				);

				updateSettingsOptions();
			};

			wsClientManager.onclose = function(e){
				if(connectedClient){
					setTimeout(setupClientSocket, 250);
					connectedClient = false;
					launchModManagerTimeout = null;
					refreshHome()
				}


				updateSettingsOptions();
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
				if(launchModManagerTimeout == null){
					launchModManagerTimeout = setTimeout(function(){
						loadAppByUri("dotahost://");
					}, 1000);
				}
				setTimeout(setupClientSocket, 250);
			};
		};

		function setupWebLobbySocket(){
			wsClientLobby = new WebSocket("ws://dotahost.net:2075");

			wsClientLobby.sendReal = wsClientLobby.send;
			wsClientLobby.send = function(string){
				if(string != 'time'){
					console.log('Sent:');
					console.log(string);
				}
				wsClientLobby.sendReal(string);
			}

			wsClientLobby.onopen = function(e){

				connectedLobby = true;

				if(user != null){
					wsClientLobby.send("getLobbies");
				}

				// Ask for validation straight away
				wsClientLobby.send(packArguments('validate', user.token, user.steamid));
			};

			wsClientLobby.onclose = function(e){
				if(connectedLobby){
					$('#dotahostLobbyConnectedDiv').html(
						'<div class="alert alert-danger">'+
							'<h4>LobbyManager</h4><span class="glyphicon glyphicon-remove" style="position:absolute;left:calc(100% - 50px);top:10px;"></span>'+
							'<strong>Lost connection</strong> to verification service!'+
						'</div>'
					);
					setTimeout(setupWebLobbySocket, 250);
				}
				connectedLobby = false;
			};

			wsClientLobby.onerror = function(e, r, t){
				if(wsClientLobby.readyState === 3){
					$('#dotahostLobbyConnectedDiv').html(
						'<div class="alert alert-danger">'+
							'<h4>LobbyManager</h4><span class="glyphicon glyphicon-remove" style="position:absolute;left:calc(100% - 50px);top:10px;"></span>'+
							'<strong>Failed</strong> to verify user profile!'+
						'</div>'
					);
				};
				setTimeout(setupWebLobbySocket, 250);
			};

			var onMessage = function(e){
				console.log('Received:');
				console.log(e.data);
				var args = e.data.split(MSG_SEP);

				if(wsHooks.hasOwnProperty(args[0])){
					wsHooks[args[0]](e, args);
				}
			};
			wsClientLobby.onmessage = onMessage;
		};

		selectPage('home', [user != null]);

		if(user != null){
			setTimeout(setupClientSocket, 1000);
			setTimeout(setupWebLobbySocket, 1000);
		}

		function setGameInfoPatched(patched){
			gameInfoPatched = patched;
			var div = $('#settingsBodyPatchGameInfo');
			var group = div.children(':eq(0)');
			var span1 = group.children(':eq(0)');
			var btn = group.find('button');
			span1.attr({'class':'input-group-addon '+(gameInfoPatched?'list-group-item-success':'list-group-item-danger')})
			btn.attr({'class':'btn '+(gameInfoPatched?'btn-success':'btn-danger')}).text((gameInfoPatched?'Patched':'Patch'));
			btn.prop('disabled', gameInfoPatched);
		}

		function updateSettingsOptions(){
			if(connectedClient){
				$('#settingsBody').html('').append(
					$('<div>').attr({'id':'settingsBodyAutorun', 'style':'margin-bottom:40px;'}).append(
						$('<div>').attr({'class':'input-group'}).append(
							$('<span>').attr({'class':'input-group-addon', 'style':'text-align:left;height:68px;'}).text('Autorun DotaHost ModManager:')
						).append(
							$('<span>').attr({'class':'input-group-addon', 'style':'text-align:right;height:68px;'}).html(spinner)
						)
					).append(
						$('<span>').attr('class', 'help-block').text('If this is selected, the ModManager will automatically launch when you visit this website. This requires administrator privillages on the computer you are using.')
					)
				).append(
					$('<div>').attr({'id':'settingsBodyDotaPath', 'style':'margin-bottom:40px;'}).append(
						$('<div>').attr({'class':'input-group'}).append(
							$('<span>').attr({'class':'input-group-addon', 'style':'text-align:left;'}).text('Dota Path:')
						).append(
							$('<input>').attr({'type':'text', 'class':'form-control', 'placeholder':'Loading...'}).prop('disabled', 'disabled')
						).append(
							$('<span>').attr({'class':'input-group-btn', 'style':'text-align:right;'}).append(
								$('<button>').attr({'class':'btn btn-default', 'type':'button'}).text('Save').click(function(){
									var input = $(this).parent().parent().children(':eq(1)');
									wsClientManager.send(packArguments('setDotaPath', input.val()));
									$(this).prop('disabled', 'disabled').text('Saving...');
									input.prop('disabled', 'disabled');
								})
							)
						)
					).append(
						$('<span>').attr('class', 'help-block').text('This is the system path to the "dota 2 beta" folder. If it is incorrect, please correct it.')
					)
				).append(
					$('<div>').attr({'id':'settingsBodyPatchGameInfo', 'style':'margin-bottom:40px;'}).append(
						$('<div>').attr({'class':'input-group'}).append(
							$('<span>').attr({'class':'input-group-addon'+(gameInfoPatched == null?'':(gameInfoPatched?' list-group-item-success':' list-group-item-danger')), 'style':'text-align:left;width:100%;'}).text('Patch GameInfo:')
						).append(
							$('<span>').attr({'class':'input-group-btn', 'style':'text-align:right;'}).append(
								$('<button>').attr({'class':'btn '+(gameInfoPatched==null?'btn-default':(gameInfoPatched?'btn-success':'btn-danger')), 'type':'button'}).prop('disabled', gameInfoPatched == null || gameInfoPatched).text(gameInfoPatched == null?'Loading...':(gameInfoPatched?'Patched':'Patch')).click(function(){
									wsClientManager.send('patchGameInfo');
									$(this).prop('disabled', true).text('Patching...');
								}))
						)
					).append(
						$('<span>').attr('class', 'help-block').text('You must patch gameinfo.txt before being able to play any games on DotaHost.net. Dota MUST be closed when performing this action.')
					)
				);
			}else{
				$('#settingsBody').text('Please open the ModManager.');
			}
		}

		function openSettingsModal(){
			updateSettingsOptions();
			wsClientManager.send('getAutorun');
			wsClientManager.send('getDotapath');
			wsClientManager.send('getPatchGameInfo');
		}

		function refreshCreateLobbyModal(){
			var inputGroup = function(name, content){
				return '<div style="margin-bottom:10px;height:34px;width:100%;" class="input-group"><span style="text-align:left;width:150px;" class="input-group-addon">'+name+':</span>'+content+'</div>';
			}
			var checkbox = function(id, checked){
				return '<span class="input-group-addon" style="text-align:right;"><input id="'+id+'" type="checkbox"'+(checked?' checked="checked"':'')+'></span>';
			}
			var options = function(args, defaultIndex){
				ret = '';
				for(i = 0; i < args.length; ++i){
					ret += '<option value="'+args[i][0]+'"'+(defaultIndex==i?' selected="selected"':'')+'>'+args[i][1]+'</option>';
				}
				return ret;
			}
			var selectProperties = function(id, str){
				return '<select id="'+id+'" dir="rtl" style="text-align:right;" class="form-control">'+str+'</select>';
			};

			var GAME_MODE = '0';
			var MAX_SLOTS = '1';
			var MAX_REGULAR = '2';
			var MAX_ULTIMATE = '3';
			var BANS = '4';
			var EASY_MODE = '5';
			var TROLL_MODE = '6';
			var HIDE_PICKS = '7';
			var STARTING_LEVEL = '8';
			var BONUS_GOLD = '9';
			var UNIQUE_SKILLS = 'a';

			$('#createLobbyBody').html(
				inputGroup('Game Mode',
					selectProperties(GAME_MODE,
						options([
							['0', 'All Pick'],
							['1', 'Single Draft'],
							['2', 'Mirror Draft'],
							['3', 'All Random']
						])
					)
				)+
				inputGroup('Max Total Skills',
					selectProperties(MAX_SLOTS,
						options([[1, 1], [2, 2], [3, 3], [4, 4], [5, 5], [6, 6]], 5)
					)
				)+
				inputGroup('Max Regular Skills',
					selectProperties(MAX_REGULAR,
						options([[1, 1], [2, 2], [3, 3], [4, 4], [5, 5], [6, 6]], 3)
					)
				)+
				inputGroup('Max Ultimate Skills',
					selectProperties(MAX_ULTIMATE,
						options([[1, 1], [2, 2], [3, 3], [4, 4], [5, 5], [6, 6]], 1)
					)
				)+
				inputGroup('Bans',
					selectProperties(BANS,
						options([[0, 0], [1, 1], [3, 3], [5, 5], [10, 10], [15, 15], [20, 20], ['h', 'HostBans']], 4)
					)
				)+
				inputGroup('Easy Mode',
					checkbox(EASY_MODE)
				)+
				inputGroup('Troll Mode',
					checkbox(TROLL_MODE)
				)+
				inputGroup('Hide Picks',
					checkbox(HIDE_PICKS, true)
				)+
				inputGroup('Starting Level',
					selectProperties(STARTING_LEVEL,
						options([[1, 1], [6, 6], [11, 11], [16, 16], [25, 25]])
					)
				)+
				inputGroup('Bonus Starting Gold',
					selectProperties(BONUS_GOLD,
						(function(){var ret;for(var i = 0; i < 100001; i=(i==1000||i==10000?(i*2.5):(i==0?250:i*2))){ret+=options([[i, i]])}return ret;})()
					)
				)+
				inputGroup('Unique Skills',
					selectProperties(UNIQUE_SKILLS,
						options([[0, 'None'], [1, 'Team'], [2, 'All']])
					)
				)
			);
			$('#createLobbyOptionsCreate').click(function(){
				if(user == null){
					alert('Please log in.');
				}
				if(!gameInfoPatched){
					alert('Please patch gameinfo.txt (settings).');
				}
				var settingsBody = $('#createLobbyBody');

				var lobby = {};
				var addon = {};
				addon[ADDON_ID] = "lod";
				addon[ADDON_OPTIONS] = {};
				settingsBody.find('select, input').each(function(){
					var e = $(this);
					addon[ADDON_OPTIONS][e.attr('id')] = e.val() == 'on' ? ''+(~~e.is(':checked')) : e.val();
				});

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

				lobby[LOBBY_NAME] = user['personaname'] + "'s Lobby";
				lobby[LOBBY_CURRENT_PLAYERS] = "0";
				lobby[LOBBY_MAX_PLAYERS] = "2";
				lobby[LOBBY_REGION] = REGION_TO_ID["America"];
				lobby[LOBBY_TEAMS] = teams;
				lobby[LOBBY_ADDONS] = addons;

				args = JSON.stringify(lobby);

				var msg = packArguments('createLobby', args);
				wsClientLobby.send(msg);

				$('#createLobbyOptions').modal('toggle');
			})
		}

		function updateAutorunOption(autorun){
			$('#settingsBodyAutorun').children(':first').children(':eq(1)').html('').append(
				$('<input>').attr('type', 'checkbox').prop('checked', autorun).click(function(e){
					if(this.checked){
						wsClientManager.send('autorun');
					}else{
						wsClientManager.send('uninstall');
					}
					$(this).parent().html(spinner);
				})
			);
		}

		function updateDotaPathOption(){
			var group = $('#settingsBodyDotaPath').children(':first');
			group.children(':eq(1)').removeAttr('disabled').val(dotaPath);
			group.children(':eq(2)').html('').append(
				$('<button>').attr({'class':'btn btn-default', 'type':'button'}).text('Save').click(function(){
					var input = group.children(':eq(1)');
					wsClientManager.send(packArguments('setDotaPath', input.val()));
					$(this).prop('disabled', 'disabled').text('Saving...');
					input.prop('disabled', 'disabled');
				})
			);
		}

		function refreshHome(){
			selectPage('home', [user != null]);
			if(lobbies){
				populateLobbies();
			}
			if(connectedClient){
				$('#addonStatusContainer').append(
					'<div id="lodStatus" class="bs-callout bs-callout-info col-sm-4 col-md-12" style="cursor:default;">'+
						'<h4>Legends of Dota <span style="float:right;margin-top:-20px;margin-right:-4px;">'+spinner+'</span></h4>'+
					'</div>'
				);
			}
			wsClientManager.send("getAddonStatus");
		}

	});



	function loadAppByUri(appUri) {

		var goToAppPage = null;
		var clearEvents;
		var setEvents;
		var appWasFound;
		var appWasNotFound;
		var waiting = true;


		var eventsName = [ 'pagehide', 'blur' ];


		appWasFound = function( event ){
			if( !waiting ) {
				return false;
			}
			waiting = false;
			clearEvents();
			$('#localClientConnectedDiv').html('').append(
				$('<div>').attr('class', 'alert alert-danger').append(
					$('<h4>').text('ModManager')
				).append(
					$('<span>').attr({'class':'glyphicon glyphicon-remove', 'style':'position:absolute;left:calc(100% - 50px);top:10px;'})
				).append(
					$('<strong>').text('Failed')
				).append(
					' to connect to ModManager ('
				).append(
					$('<a>').attr('href', '#').text('run').click(function(e){
						e.preventDefault();
						loadAppByUri("dotahost://");
					})
				).append(')')
			);
			$('#addonStatusContainer').html('');
		}

		appWasNotFound = function( event ){
			if( !waiting ) {
				return false;
			}
			waiting = false;
			$('#localClientConnectedDiv').html(
				'<div class="alert alert-danger">'+
					'<h4>ModManager</h4><span class="glyphicon glyphicon-remove" style="position:absolute;left:calc(100% - 50px);top:10px;"></span>'+
					'<strong>Failed</strong> to connect to ModManager (<a href="https://github.com/Jexah/DotaHostReleases/releases/download/' + managerVersion + '/DotaHostManager.exe" download>download</a>)'+
				'</div>'
			);
			$('#addonStatusContainer').html('');
		};

		setEvents = function() {
			window.clearTimeout( goToAppPage );
			$.each( eventsName , function ( key, eventName ) {
				window.addEventListener( eventName, appWasFound );
			});
		}

		clearEvents = function() {
			$.each( eventsName , function ( key, eventName ) {
				window.document.removeEventListener( eventName, appWasFound);
			});
		}

		$("#go").attr('src',appUri);
		setEvents();

		goToAppPage = setTimeout(
			appWasNotFound,
			1000
		);
	}

})();
























































