



































var Main;




$(document).ready(function(){
	Main = new function(){

		var thisPlayer;

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
		var currentTeamID = '';
		var currentPlayerID = '';
		var thisPlayer = {};

		var lobbiesChangedTimeout = false;

		var autorun = null;
		var gameInfoPatched = null;
		var hasRequestedSetDotaPath = false;
		var launchModManagerTimeout = null;
		var isVerified = null;

		var timeoutPrevention;

		var dotaPath = "";
		var wsID = "";

		this.wsClientManager;
		this.connectedLobby = null;

		this.wsClientLobby;
		this.connectedClient = null;

		this.installedAddons = {};

		this.init = function(){
			if(user != null){
				thisPlayer = new Player({
					'ProfileUrl':user['profileurl'],
					'Avatar':user['avatarmedium'],
					'PersonaName':user['personaname'],
					'SteamId':user['steamid']
				});
			}

			selectPage('home', [user != null]);
		}

		this.tryLoadUri = function(){
			Helpers.loadAppByUri('dotahost://', function(){
				$('#mmStatus').replaceWith(Templates.WsDivs.local());
				$('#addonStatusContainer').empty();
			});
		}

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
						return Templates.WsDivs.local();
					},

					'connectedToLobbyManager':function(args){
						return Templates.WsDivs.lobby();
					},

					'lobbiesTable':function(args){
						return Templates.Lobbies.getTemplate();
					},

					'addonStatusContainer':function(args){
						return Templates.AddonStatus.getContainer();
					}
				},
				// User is not logged in
				[function(args) {return !args[0];},
					'{{0}}',
					function(args){
						return Templates.Landing.getPage();
					}
				],
				// User is logged in
				[function(args) {return args[0];},
					// User is banned
					[function(args) {return user && user.banreason;},
						'<div class="row">',
							'<div class="col-md-3 column">',
							'</div>',
							'<div class="col-md-6 column">',
								'{{0}}{{1}}',
								function(args){
									return user.banreason;
								},
								function(args){
									return $('<button>').attr({'type':'button', 'style':'float:right;', 'class':'btn btn-primary btn-warning'}).text('Logout').click(function(){
										location.href = 'logout.php';
									});
								},
							'</div>',
						'</div>'
					],

					// User is white listed
					[function(args) {return user && user.beta && !user.banreason;},
						'<span class="glyphicon glyphicon-remove" style="visibility:hidden;"></span>',
						'<span class="glyphicon glyphicon-ok" style="visibility:hidden;"></span>',
						'<span class="glyphicon glyphicon-download-alt" style="visibility:hidden;"></span>',
						'<div class="row" style="margin-top:100px;">',
							'<div class="col-md-9 col-lg-8 col-md-push-3 col-lg-push-2 column">',
								'<div class="row">',
										'{{connectedToModManager}}',
										'{{connectedToLobbyManager}}',
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
								'</div>',
								'{{lobbiesTable}}',
							'</div>',
							'{{addonStatusContainer}}',
							'<div class="col-md-0 col-lg-2 column">',
							'</div>',
						'</div>'
					],

					// User is white NOT listed
					[function(args) {return !user || (!user.beta && !user.banreason);},
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
						return args.Name;
					},

					'lobbyAddons':function(args){
						var addonArray = []
						for(var addonKey in args.Addons){
							var addon = args.Addons[addonKey].Id;
							addonArray.push(addon);
						}
						var ret = addonArray.join(', ');
						return ret;
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
												Main.wsClientLobby.send(Helpers.packArguments('chat', chatText));
												chatTextElement.val('');
											}
										});
									},
								'</span>',
							'</div>',
						'</div>',
					'</div>',
					'<div class="col-lg-4 col-md-4 col-sm-4 column col-xl-2">',
						'{{6}}',
						function(args){
							return $('<button>').attr({'class':'btn btn-success btn-lg', 'style':'width:100%;margin-bottom:20px;'}).text('Start Game').click(function(){
								Main.wsClientLobby.send('startGame');
							});
						},
						'{{5}}',
						function(args){
							return $('<button>').attr({'id':'leaveLobbyReconnect', 'class':'btn btn-default btn-lg', 'style':'width:100%;margin-bottom:20px;'}).text(currentLobby[LOBBY_STATUS] == '2'?'Reconnect':'Leave Lobby').click(function(){
								if(currentLobby[LOBBY_STATUS] == '2'){
									location.href = "steam://connect/" + x[1];
								}else{
									Main.wsClientLobby.send('leaveLobby');
								}
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

		var wsHooks = {
			'id':function(e, x){
				wsID = x[1];
			},
			'addon':function (e, x){
				// addon;lod;100
				var id = x[1];
				var percent = x[2];
				Templates.AddonStatus.setProgress(id, percent);
			},

			'installationComplete':function(e, x){
				Main.wsClientManager.send('getAddonStatus');
			},
			'page':function(e, x){
				switch(x[1]){
					case 'home':
						var lobbiesString = x[2];
						Main.lobbies = new Lobbies(lobbiesString);
						refreshHome();
						break;
					case 'lobby':
						var lobbyString = x[2];
						Main.currentLobby = new Lobby(lobbyString);
						selectPage('lobby-' + currentLobby.Addons['0'].Id, currentLobby);
						$('#leaveLobbyReconnect').off().click(function(){
							if(currentLobby.Status == Lobby.Active){
								console.log("steam://connect/" + x[3]);
								location.href = "steam://connect/" + x[3];
							}else{
								Main.wsClientLobby.send('leaveLobby');
							}
						});
						break;
				}
			},
			'getLobbies':function(e, x){
				var lobbiesString = x[1];
				Main.lobbies = new Lobbies(lobbiesString);
				populateLobbies();
			},
			'leaveLobby':function(e, x){
				if(x.length == 1){
					refreshHome();
				}else{
					var slotid = x[1];
					var teamid = x[2];
					removePlayerFromTeam(slotid, currentLobby.Teams[teamid], teamid, teamid == '2');
					Templates.Ready.hide();
				}
			},
			'chat':function(e, x){
				var personaname;
				var cosmetics;
				var teams = currentLobby.Teams;
				for(var teamKey in teams){
					if(!teams.hasOwnProperty(teamKey)){continue;}
					var team = teams[teamKey];
					var players = team.Players;
					for(var playerKey in players){
						var player = players[playerKey];
						if(player.SteamId == x[1]){
							personaname = player.PersonaName;
						}
					}
				}
				addChat($('#lodLobbyChat'), personaname, x[2], cosmetics);
			},
			'addPlayerToLobby':function(e, x){
				var player = new Player(x[1]);
				var teams = currentLobby.Teams;
				var team = teams[x[2]];
				var players = team.Players;
				var maxPlayers = team.MaxPlayers;
				for(var i = 0; i < maxPlayers; ++i){
					if(!players[''+i]){
						addPlayerToTeam(player, team, ''+i, x[2]);
						return;
					}
				}
			},
			'joinLobby':function(e, x){
				if(x[1] === 'success'){
					var lobby = new Lobby(x[2]);
					currentLobby = lobby;
					selectPage('lobby-' + currentLobby.Addons['0'].Id, currentLobby);
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
				var teams = currentLobby.Teams;
				for(var teamKey in teams){
					if(!teams.hasOwnProperty(teamKey)){continue;}
					var team = teams[teamKey];
					var players = team.Players;
					for(var playerKey in players){
						var player = players[playerKey];
						if(player.SteamId == x[3]){
							teamRemove = team;
							removePlayerFromTeam(playerKey, teamRemove, teamKey, teamKey == '2');
							addPlayerToTeam(player, teams[teamAddKey], slotID, teamAddKey);
							return;
						}
					}
				}
			},
			'validate':function(e, x){
				if(x[1] == 'success') {
					isVerified = true;
					Main.wsClientLobby.send('getPage');
				} else {
					isVerified = false;
					refreshHome();
				}
			},
			'addonStatus':function(e, x){
				var status = x[1];
				var addonID = x[2];
				Main.installedAddons[addonID] = status;
				Templates.AddonStatus.setAddon(addonID, false);
			},

			'connectToServer':function(e, x){
				$('#leaveLobbyReconnect').text('Reconnect').click(function(){
					location.href = "steam://connect/" + x[1];
				});
				location.href = "steam://connect/" + x[1];
				Templates.Ready.hide()
			},

			'gameServerInfo':function(e, x){
				if(x[1] === "success"){
					Main.wsClientManager.send(Helpers.packArguments(x[0], x[2], JSON.stringify(currentLobby)));
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
				Templates.ready.show();

				var readyTimeout = setTimeout(function(){
					Templates.Ready.hide();
					refreshHome();
				}, 20000);

				$('#readyAudio').get(0).play();
				currentLobby.Status = Lobby.Ready;
			},
			'cancelBeginGame':function(e, x){
				console.log('START GAME CANCELED');
				currentLobby.Status = Lobby.Waiting;
			},
			'generatingServer':function(e, x){
				Templates.Ready.generating();
				currentLobby.Status = Lobby.Active;
			},
			'invalid':function(e, c){
				Templates.Invalid.show();
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

			console.log("addPlayerToTeamList");
			console.log(JSON.stringify(player));
			console.log("teamid: " + teamid);
			console.log("slotid: " + slotid);

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
						Main.wsClientLobby.send(Helpers.packArguments('swapTeam', $(this).attr('slotid'), teamid));
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
				var lobbyName = lobby.Name;
				var tr = $('<tr>').attr('style', 'cursor:pointer;');
				tr.append($('<td>').text(lobbyName));
				var addonsStr = '';
				var optionsStr = '';
				for(var addonKey in lobby.Addons){
					if(!lobby.Addons.hasOwnProperty(addonKey)){continue;};
					var addon = lobby.Addons[addonKey];
					addonsStr += addon.Id+ ', ';
					for(var optionKey in addon.Options){
						if(!addon.Options.hasOwnProperty(optionKey)){continue;};
						optionsStr += addon.Id + ': ' + optionKey + '=' + addon.Options[optionKey] + ', ';
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
					Main.wsClientManager.send('getPatchGameInfo');
					setTimeout(function(){
						if(!gameInfoPatched){
							alert('Please patch gameinfo (in settings).');
						}
						var addons = lobbies[lobbyName].Addons;
						for(var addonKey in addons){
							if(!addons.hasOwnProperty(addonKey)){continue;};
							var addon = addons[addonKey];
							switch(installedAddons[addon.Id]){
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
									Main.wsClientLobby.send(Helpers.packArguments('joinLobby', $(this).find('td').first().text()));
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
					}, 200);
					
				});
				tbody.append(tr);
			}
			lobbiesTable.append(tbody);
			$('#homeLobbiesTable').html(lobbiesTable);
		}

		function setTeamListElementToPlayer(element, player, avatarLeft, deleteSlot){


			console.log("setTeamListElementToPlayer");
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
					Main.wsClientLobby.send(Helpers.packArguments('swapTeam', thisId[1], thisId[0]));
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

		function removePlayerFromTeam(playerKey, team, teamid, deleteSlot){
			var players = team[TEAM_PLAYERS];
			delete players[playerKey];
			setTeamListElementToPlayer($('#'+teamid+playerKey), null, teamid==0, deleteSlot);
		}

		function setupClientSocket(){
			Main.wsClientManager = new WebSocket("ws://127.0.0.1:2074");

			Main.wsClientManager.sendReal = Main.wsClientManager.send;
			Main.wsClientManager.send = function(string){
				if(string != 'time'){
					console.log('Sent:');
					console.log(string);
				}
				Main.wsClientManager.sendReal(string);
			}

			Main.wsClientManager.onopen = function(e){
				Main.connectedClient = true;

				clearTimeout(launchModManagerTimeout);

				timeoutPrevention = setInterval(function(){Main.wsClientManager.send("time");}, 1000);

				refreshHome();

				Main.wsClientManager.send("getAddonStatus");
				Main.wsClientManager.send('getPatchGameInfo');

				updateSettingsOptions();
			};

			Main.wsClientManager.onclose = function(e){
				if(Main.connectedClient){
					setTimeout(setupClientSocket, 250);
					Main.connectedClient = false;
					launchModManagerTimeout = null;
					refreshHome();
					clearInterval(timeoutPrevention);
				}


				updateSettingsOptions();
			};
			var onMessage = function(e){
				console.log(e.data);
				var args = e.data.split(Helpers.MSG_SEP);
				if(wsHooks.hasOwnProperty(args[0])){
					wsHooks[args[0]](e, args);
				}
			};
			Main.wsClientManager.onmessage = onMessage;

			Main.wsClientManager.onerror = function(e, r, t){
				if(launchModManagerTimeout == null){
					launchModManagerTimeout = setTimeout(function(){
						Main.tryLoadUri();
					}, 1000);
				}
				setTimeout(setupClientSocket, 250);
			};
		};

		function setupWebLobbySocket(){
			Main.wsClientLobby = new WebSocket("ws://dotahost.net:2075");

			Main.wsClientLobby.sendReal = Main.wsClientLobby.send;
			Main.wsClientLobby.send = function(string){
				if(string != 'time'){
					console.log('Sent:');
					console.log(string);
				}
				Main.wsClientLobby.sendReal(string);
			}

			Main.wsClientLobby.onopen = function(e){

				Main.connectedLobby = true;

				if(user != null){
					Main.wsClientLobby.send("getLobbies");
				}

				// Ask for validation straight away
				Main.wsClientLobby.send(Helpers.packArguments('validate', user.token, user.steamid));
			};

			Main.wsClientLobby.onclose = function(e){
				if(Main.connectedLobby){
					$('#dotahostLobbyConnectedDiv').html(
						'<div class="alert alert-danger">'+
							'<h4>LobbyManager</h4><span class="glyphicon glyphicon-remove" style="position:absolute;left:calc(100% - 50px);top:10px;"></span>'+
							'<strong>Lost connection</strong> to verification service!'+
						'</div>'
					);
					setTimeout(setupWebLobbySocket, 250);
					Main.connectedLobby = false;
				}
			};

			Main.wsClientLobby.onerror = function(e, r, t){
				if(Main.wsClientLobby.readyState === 3){
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
				var args = e.data.split(Helpers.MSG_SEP);

				if(wsHooks.hasOwnProperty(args[0])){
					wsHooks[args[0]](e, args);
				}
			};
			Main.wsClientLobby.onmessage = onMessage;
		};

		// Load up the website if they are in the beta, and not banned
		if(user != null && user.beta && !user.banreason){
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
			if(Main.connectedClient){
				$('#settingsBody').html('').append(
					$('<div>').attr({'id':'settingsBodyAutorun', 'style':'margin-bottom:40px;'}).append(
						$('<div>').attr({'class':'input-group'}).append(
							$('<span>').attr({'class':'input-group-addon', 'style':'text-align:left;height:68px;'}).text('Autorun DotaHost ModManager:')
						).append(
							$('<span>').attr({'class':'input-group-addon', 'style':'text-align:right;height:68px;'}).html(Templates.spinner)
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
									Main.wsClientManager.send(Helpers.packArguments('setDotaPath', input.val()));
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
									Main.wsClientManager.send('patchGameInfo');
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
			Main.wsClientManager.send('getAutorun');
			Main.wsClientManager.send('getDotapath');
			Main.wsClientManager.send('getPatchGameInfo');
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
		}

		function updateAutorunOption(autorun){
			$('#settingsBodyAutorun').children(':first').children(':eq(1)').html('').append(
				$('<input>').attr('type', 'checkbox').prop('checked', autorun).click(function(e){
					if(this.checked){
						Main.wsClientManager.send('autorun');
					}else{
						Main.wsClientManager.send('uninstall');
					}
					$(this).parent().html(Templates.spinner);
				})
			);
		}

		function updateDotaPathOption(){
			var group = $('#settingsBodyDotaPath').children(':first');
			group.children(':eq(1)').removeAttr('disabled').val(dotaPath);
			group.children(':eq(2)').html('').append(
				$('<button>').attr({'class':'btn btn-default', 'type':'button'}).text('Save').click(function(){
					var input = group.children(':eq(1)');
					Main.wsClientManager.send(Helpers.packArguments('setDotaPath', input.val()));
					$(this).prop('disabled', 'disabled').text('Saving...');
					input.prop('disabled', !dotaPath);
				})
			);
			if(dotaPath == '' && !hasRequestedSetDotaPath){
				openSettingsModal();
				$('#settings').modal('show');
				alert('Please enter your Dota 2 path.');
				hasRequestedSetDotaPath = true;
			}
		}

		function refreshHome(){
			selectPage('home', [user != null]);
			if(Main.lobbies){
				Templates.Lobbies.showLobbies();
			}
			if(Main.connectedClient){
				Templates.AddonStatus.setAddon('lod', false);
			}
			Main.wsClientManager.send("getAddonStatus");
		}

		(function(){ // addClickHandlerToCreateLobby
			$('#createLobbyOptionsCreate').click(function(){
				if(user == null){
					alert('Please log in.');
					return;
				}
				if(!Main.connectedClient){
					alert('Please run the ModManager.');
					return;
				}
				if(!gameInfoPatched){
					alert('Please patch gameinfo.txt (settings).');
					return;
				}

				var settingsBody = $('#createLobbyBody');

				var addon = new Addon({
					'Id':'lod',
					'Options':{}
				});
				console.log(JSON.stringify(addon.Options))
				settingsBody.find('select, input').each(function(){
					var e = $(this);
					addon.Options[e.attr('id')] = e.val() == 'on' ? ''+(~~e.is(':checked')) : e.val();
				});

				var team1 = new Team({
					'Name':'Radiant',
					'MaxPlayers':'5',
					'Players':new Players({})
				});

				var team2 = new Team({
					'Name':'Dire',
					'MaxPlayers':'5',
					'Players':new Players({})
				});

				var teams = new Teams({"0":team1,"1":team2});

				var lobby = new Lobby({
					'Addons':{'0':addon},
					'Name':user['personaname'] + "'s Lobby",
					'CurrentPlayers':'0',
					'MaxPlayers':'10',
					'Region':'BHS-1',
					'Teams':teams,
					'Addons':addons
				});

				var addons = lobby.Addons;
				Helpers.each(addons, function(addonKey, addon, i){
					var installedAddon = installedAddons[addon.Id];
					if(installedAddon != ADDON_STATUS_READY){
						switch(installedAddon){
							case ADDON_STATUS_READY:
								alert('An unknown error has occured.');
								break;
							case ADDON_STATUS_ERROR:
								alert('An unknown error has occured.');
								break;
							case ADDON_STATUS_MISSING:
								alert('Please install ' + addon.Id + '.');
								break;
							case ADDON_STATUS_UPDATE:
								alert('Please update ' + addon.Id + '.');
								break;
						}
						return;
					}
				});

				args = JSON.stringify(JSON.stringify(lobby.obj()));
				
				Main.wsClientLobby.send(Helpers.packArguments('createLobby', args));

				$('#createLobbyOptions').modal('toggle');
			});
		})();


		

		// Selects the given template page
		function selectPage(templateName, args){
			if(templates[templateName]) {
				templates[templateName].apply(args, '#main');
				currentPage = templateName;
			} else {
				console.log('WARNING: Failed to find template named ' + templateName);
			}
		}
	};

	Main.init();

});
