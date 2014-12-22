














































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

		var TRANSPARENT_IMAGE = 'http://upload.wikimedia.org/wikipedia/commons/c/ce/Transparent.gif';

		var currentPage = 'home';
		var lobbies = {};
		var currentLobby = {};
		var installedAddons = {};
		var currentTeamID = '';
		var currentPlayerID = '';
		var thisPlayer = {};

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
		var isVerified =  false;

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
					'<span class="glyphicon glyphicon-remove" style="visibility:hidden;"></span>',
					'<span class="glyphicon glyphicon-ok" style="visibility:hidden;"></span>',
					'<span class="glyphicon glyphicon-download-alt" style="visibility:hidden;"></span>',
					'<div class="row" style="margin-top:100px;">',
						'<div class="col-md-9 col-lg-8 col-md-push-3 col-lg-push-2 column">',
							'<div class="row">',
								'<div id="localClientConnectedDiv" class="col-md-6 column">',
									'<div class="alert alert-info">',
										'<h4>ModManager!</h4><span style="position:absolute;left:calc(100% - 50px);top:-10px;">'+spinner+'</span>',
										'<strong>Attempting</strong> to connect to local ModManager.',
									'</div>',
								'</div>',
								'<div id="dotahostLobbyConnectedDiv" class="col-md-6 column">',
									'<div class="alert alert-info">',
										'<h4>LobbyManager!</h4><span style="position:absolute;left:calc(100% - 50px);top:-10px;">'+spinner+'</span>',
										'<strong>Attempting</strong> to connect to Dotahost LobbyManager.',
									'</div>',
								'</div>',
							'</div>',
							'<div class="row">',
								'<div class="col-md-12 column">',
									'<h3 class="text-left">',
										'<span style="float:left;">Lobbies</span>{{0}}',
										function(args){
											return $('<button>').attr({'type':'button', 'style':'float:right;', 'class':'btn btn-primary btn-default'}).text('Create Lobby').click(function(){
												selectPage('createLobby');
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
				]
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


							var msg = packArguments('createLobby', args);

							console.log('Sending message: '+msg);
							wsClientLobby.send(msg);
						});
					}
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
					'<div class="col-lg-2 col-md-1 col-sm-0 column"></div>',
					'<div class="col-lg-8 col-md-10 col-sm-12 column">',
						'<div class="row clearfix">',
							'<div class="col-md-6 col-sm-6 column">',
								'<h1>[[lobbyName]]</h1>',
							'</div>',
							'<div class="col-md-6 col-sm-6 column">',
								'<h2 style="text-align:right;">Legends of Dota</h2>',
							'</div>',
						'</div>',
					'</div>',
					'<div class="col-lg-2 col-md-1 col-sm-0 column"></div>',
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
								.append($('<a>').attr({'href':'#', 'class':'list-group-item disabled'})
									.html('<h4>'+team[TEAM_NAME]+'</h4>')
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
								.append($('<a>').attr({'href':'#', 'class':'list-group-item disabled'})
									.html('<h4>'+team[TEAM_NAME]+'</h4>')
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
												addChat($('#lodLobbyChat'), user['personaname'], chatText);
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
						'{{1}}',
						function(args){
							var teamID = '2';
							var teams = args[LOBBY_TEAMS];
							var team = teams[teamID];
							var players = team[TEAM_PLAYERS];

							var listGroup = $('<div>').attr({'id':'teamList'+teamID, 'class':'list-group', 'style':'text-align:center;'})
								.append($('<a>').attr({'class':'list-group-item disabled'})
									.html('<h4>'+team[TEAM_NAME]+'</h4>')
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
			'dotaPath':function(e, x){
				dotaPath = x[1];
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
				switch(x[1]){
					case 'home':
						selectPage(x[1], [user != null]);
						setTimeout(function(){populateLobbies(x[2]);}, 100);
						break;
					case 'lobby':
						currentLobby = JSON.parse(x[2]);
						selectPage('lobby-' + currentLobby[LOBBY_ADDONS]['0'][ADDON_ID], currentLobby);
						break;
				}
			},
			'getLobbies':function(e, x){
				populateLobbies(x[1]);
			},
			'chat':function(e, x){
				var personaname;
				var teams = currentLobby[LOBBY_TEAMS];
				for(var teamKey in teams){
					var team = teams[teamKey];
					var players = team[TEAM_PLAYERS];
					for(var playerKey in players){
						var player = players[playerKey];
						if(player[PLAYER_STEAMID] == x[1]){
							personaname = player[PLAYER_PERSONANAME];
						}
					}
				}
				addChat($('#lodLobbyChat'), personaname, x[2]);
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
					verified = true;
				} else {
					// Failed to verify
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

			'gameServerInfo':function(e, x){
				if(x[1] === "success"){
					location.href = "steam://connect/" + x[2];
				}
			}
		}
		var timeoutPrevention;

		selectPage('home', [user != null]);

		function addChat(chatContainerElement, personaname, text){
			var scrollDown = chatContainerElement.scrollTop() + chatContainerElement.innerHeight() + 10 >= chatContainerElement.prop('scrollHeight');
			chatContainerElement.append(
				$('<span>').attr('style', 'white-space:nowrap;').append(
					$('<span>').append(
						$('<strong>').text(personaname + ': ')
					).append(
						$('<span>').text(text).attr('style', 'white-space:normal;word-wrap:break-word;')
					).append('<br />')
				)
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
				player[PLAYER_PERSONANAME] = 'Empty'
				empty = true;
			}
			var nameSpan = $('<span>').text(player[PLAYER_PERSONANAME]);
			var img = $('<img>').attr({'src':player[PLAYER_AVATAR], 'style':'border:0;background-size:contain;height:32px;width:32px;margin-'+(avatarLeft?'right':'left')+':10px;'});

			listGroup.append($('<a>').attr({'id':''+teamid+slotid, 'slotid':slotid, 'href':player[PLAYER_PROFILEURL], 'onfocus':'this.blur();', 'tabindex':'-1', 'target':(empty?'_self':'_blank'), 'style':'white-space:nowrap;padding:10px 10px;overflow:hidden;', 'class':'list-group-item'})
				.append(avatarLeft?img:nameSpan)
				.append(avatarLeft?nameSpan:img)
				.click(function(e){
					if(empty){
						e.preventDefault();
						wsClientLobby.send(packArguments('swapTeam', $(this).attr('slotid'), teamid));
					}
				})
			);
		}

		function populateLobbies(lobbiesStr){
			lobbiesChangedTimeout = true;
				setTimeout(function(){lobbiesChangedTimeout = false;}, 500);
				lobbies = JSON.parse(lobbiesStr);
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

		function setTeamListElementToPlayer(element, player, deleteSlot){
			if(typeof deleteSlot === "undefined") {
				deleteSlot = false;
			}
			if(deleteSlot){
				element.remove();
				return;
			}
			if(!player){
				element.attr('href', '#');
				element.find('span').first().text('Empty');
				element.find('img').first().attr('src', TRANSPARENT_IMAGE);
				return;
			}
			element.attr('href', player[PLAYER_PROFILEURL]);
			element.find('span').first().text(player[PLAYER_PERSONANAME]);
			element.find('img').first().attr('src', player[PLAYER_AVATAR]);
		}

		function addPlayerToTeam(player, team, slot, teamid){
			team[TEAM_PLAYERS][slot] = player;
			if($('#'+teamid+slot).length){
				setTeamListElementToPlayer($('#'+teamid+slot), player);
			}else{
				addPlayerToTeamList($('#teamList'+teamid), team[TEAM_PLAYERS], team, teamid, slot, teamid==0);
			}
		}

		function removePlayerFromTeam(player, playerKey, team, teamid, deleteSlot){
			var players = team[TEAM_PLAYERS];
			delete players[playerKey];
			setTeamListElementToPlayer($('#'+teamid+playerKey), null, deleteSlot);
		}

		function setupClientSocket(){
			wsClientManager = new WebSocket("ws://127.0.0.1:2074");

			wsClientManager.onopen = function(e){

				clearTimeout(launchModManagerTimeout);

				wsClientManager.send("getAddonStatus");

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
				connectedClient = true;
			};

			wsClientManager.onclose = function(e){
				if(connectedClient){
					$('#localClientConnectedDiv').html(
						'<div class="alert alert-danger">'+
							'<h4>ModManager</h4><span class="glyphicon glyphicon-remove" style="position:absolute;left:calc(100% - 50px);top:10px;"></span>'+
							'<strong>Lost connection</strong> to ModManager!'+
						'</div>'
					);
					$('#addonStatusContainer').html('');
					setTimeout(setupClientSocket, 250);
				}
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

			wsClientLobby.onopen = function(e){

				$('#dotahostLobbyConnectedDiv').html(
					'<div class="alert alert-success">'+
						'<h4>LobbyManager</h4><span class="glyphicon glyphicon-ok" style="position:absolute;left:calc(100% - 50px);top:10px;"></span>'+
						'<strong>Successfully</strong> verified user profile!'+
					'</div>'
				);
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
			$('#localClientConnectedDiv').html(
				'<div class="alert alert-danger">'+
					'<h4>ModManager</h4><span class="glyphicon glyphicon-remove" style="position:absolute;left:calc(100% - 50px);top:10px;"></span>'+
					'<strong>Failed</strong> to connect to ModManager (<a href="dotahost://">run</a>)'+
				'</div>'
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
					'<strong>Failed</strong> to connect to ModManager (<a href="https://github.com/Jexah/DotaHostReleases/releases/download/' + managerVersion + '-mm/DotaHostManager.exe" download>download</a>)'+
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

























































