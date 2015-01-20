Helpers = {
	
	'packArguments':function(){
		// Build args array
		var args = [];
		for(var i=0; i<arguments.length; i++) args.push(arguments[i]);

		return args.join(MSG_SEP);
	},

	'loadAppByUri':function(appUri, foundFunc, notFoundFunc, default){
		var goToAppPage = null;
		var waiting = true;


		var eventsName = [ 'pagehide', 'blur' ];


		var appWasFound = function( event ){
			if( !waiting ) {
				return false;
			}
			waiting = false;
			clearEvents();
			appWasFound();
		}

		var appWasNotFound = function( event ){
			if( !waiting ) {
				return false;
			}
			waiting = false;
			appWasNotFound();
		};

		var setEvents = function() {
			window.clearTimeout( goToAppPage );
			$.each( eventsName , function ( key, eventName ) {
				window.addEventListener( eventName, appWasFound );
			});
		}

		var clearEvents = function() {
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
}