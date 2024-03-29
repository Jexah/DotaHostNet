Helpers = {
	
	'MSG_SEP':String.fromCharCode(0),

	'packArguments':function(){
		// Build args array
		var args = [];
		for(var i=0; i<arguments.length; i++) args.push(arguments[i]);

		return args.join(this.MSG_SEP);
	},

	'loadAppByUri':function(appUri, foundFunc, notFoundFunc, foundOrNotFound){
		var goToAppPage = null;
		var waiting = true;


		var eventsName = [ 'pagehide', 'blur' ];


		var appWasFound = function( event ){
			if( !waiting ) {
				return false;
			}
			waiting = false;
			clearEvents();
			foundFunc && foundFunc();
			foundOrNotFound && foundOrNotFound();
		}

		var appWasNotFound = function( event ){
			if( !waiting ) {
				return false;
			}
			waiting = false;
			notFoundFunc && notFoundFunc();
			foundOrNotFound && foundOrNotFound();
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
	},

	'each':function(obj, func){
		if(obj && (typeof(obj) === 'object' || typeof(obj) === 'function')){
			var i = 0;
			var keys = Object.keys(obj);
			var len = keys.length;
			for(; i < len; i+=1){
				var key = keys[i];
				var value = obj[key];
				func(key, value, i);
			}
		}
	}
}