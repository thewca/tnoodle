var KeyboardManager = null;
(function() {

var KeyboardManagerClass = function() {
	var that = this;
	
	that.keys = new Hash();
	that._keyDown = function(e) {
		that.keys.set(e.key, true);
		that.fireEvent('keydown', [ e, that ]);
	};
	that._keyUp = function(e) {
		that.keys.erase(e.key);
		that.fireEvent('keyup', [ e, that ]);
	};
	that._resetKeys = function(e) {
		that.keys.empty();
		that.fireEvent('keyup', [ null, that ]);
	};

	that._listeners = new Hash();
	that.addEvent = function(event, callback, fireFirst) {
		var evtListeners = that._listeners[event];
		if(!evtListeners) {
			evtListeners = [];
			that._listeners.set(event, evtListeners);
		}
		if(fireFirst) {
			evtListeners.unshift(callback);
		} else {
			evtListeners.push(callback);
		}
	};
	that.removeEvent = function(event, callback) {
		var evtListeners = that._listeners[event];
		if(!evtListeners) {
			return;
		}
		evtListeners.erase(callback);
	};
	that.fireEvent = function(event, args) {
		var evtListeners = that._listeners[event];
		if(!evtListeners) {
			return;
		}
		for(var i = 0; i < evtListeners.length; i++) {
			var func = evtListeners[i];
			var cancel = func.apply(null, args) === false;
			if(cancel) {
				break;
			}
		}
	};

	window.addEvent('keydown', that._keyDown);
	window.addEvent('keyup', that._keyUp);
	window.addEvent('mousedown', that._resetKeys);
	window.addEvent('mouseup', that._resetKeys);
	window.addEvent('blur', that._resetKeys);
};

KeyboardManager = new KeyboardManagerClass();

})();
