














































var wsClientManager;
var wsClientLobby;

(function(){

	$(document).ready(function(){
		// Will contain the function to select pages
		var selectPage;

		var spinner = '<div class="spinner"><div class="spinner-container container1"><div class="circle1"></div><div class="circle2"></div><div class="circle3"></div><div class="circle4"></div></div><div class="spinner-container container2"><div class="circle1"></div><div class="circle2"></div><div class="circle3"></div><div class="circle4"></div></div><div class="spinner-container container3"><div class="circle1"></div><div class="circle2"></div><div class="circle3"></div><div class="circle4"></div></div></div>';

		var connections = 0;

		// This function takes unlimited arguments
		// Arguments can be:
		// 	string: This must be a valid html string
		var Template = function(args){
			//this.replaceObj = replaceObj;
			//this.contentStr = contentStr;
			//this.objs = arguments;

			// Contant variable used in replacements
			var replacePrefix = 'templateReplaceMe';

			// The overall string
			this.compiledString = '';
			this.functionList = [];
			this.reusableFunctions = {};
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
						this.conditonals.push(new Template(arg));
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

			console.log(this.compiledString);

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

				// Build the chunk of it
				var mainChunk = $('<span>');//.html().contents();
				mainChunk.html(this.compiledString);

				// Ensure it worked
				if(!mainChunk) {
					console.log('ERROR: Templating engine has failed!');
					return false;
				}

				// Find all the things that need replacing
				var toReplace = mainChunk.find('.' + replacePrefix);

				var i=0;
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

							console.log(replaceWith);

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
					} else if(functionList[i]) {
						// Grab what we are replacing with
						replaceWith = functionList[i++](args);

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
			// Home page [isLoggedIn:bool]
			'home':new Template([
				'<div class="row" style="height:200px;">',
				'</div>',
				'<div class="row" style="height:100px;">',
					'<div class="col-md-3"></div>',
					'<div class="col-md-6">',
						'<span style="text-align:center;">',
							// User is logged in
							[function(args) {return args[0];},
								'{{0}}', function(args) {
									return '<h1>Welcome back, ' + user['personaname'] + '</h1>';
								},
								'<p>Click {{0}} to create a new lobby.</p>',
								function(args) {
									if(args[0]) {
										return $('<a>').attr('href', '#').text('here').click(function() {
											selectPage('createLobby');
										});
									}
								}
							],

							// User is not logged in
							[function(args) {return !args[0];},
								'<h1>Welcome to DotaHost</h1>'
							],
						'</span>',
					'</div>',
					'<div class="col-md-3"></div>',
				'</div>',
				'<div class="row">',
					'<div class="col-md-4"></div>',
					'<div class="col-md-4">',
						// User is logged in
						[function(args){return args[0];},
							'{{0}}', function(args) {
								return '<img style="display:block;margin-left:auto;margin-right:auto;" src="' + user['avatarfull'] + '" />';
							}
						],

						// User is not logged in
						[function(args){return !args[0];},
							'<span style="text-align:center;">',
								'<form action="?login" method="post">',
									'<input type="image" src="http://cdn.steamcommunity.com/public/images/signinthroughsteam/sits_large_border.png">',
								'</form>',
							'</span>'
						],
					'</div>',
					'<div class="col-md-4"></div>',
				'</div>',
				'<div class="row" style="height:20px;"></div>',
				'<div class="row" style="min-height:40px;">',
					[function(args){return args[0];},
						'<span style="text-align:center;">',
							'<div id="app">',
								spinner,
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
				'<p>Click {{0}} to create a lobby!</p>',
					function(args) {
						return $('<a>').attr('href', '#').text('here').click(function() {
							selectPage('inLobby');
						});
					}
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

		//$('#main').html(templates['home'].getString([user != null]));

		//selectPage('createLobby');
		selectPage('home', [user != null]);

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

























































