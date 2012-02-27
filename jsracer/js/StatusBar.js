var StatusBar = {};
(function() {
	var errorMap = {};
	StatusBar.setError = function(key, error) {
		var hasChanged = false;
		if(!error) {
			if(key in errorMap) {
				hasChanged = true;
			}
			delete errorMap[key];
		} else {
			if(errorMap[key] != error) {
				hasChanged = true;
			}
			errorMap[key] = error;
		}
		if(hasChanged) {
			StatusBar.refresh();
		}
	};

	var connectionStatus = null;
	var pendingShow = null;
	StatusBar.refresh = function() {
		if(!connectionStatus) {
			// We can't show any status until the page has loaded.
			return;
		}
		var errors = [];
		for(var errorType in errorMap) {
			if(errorMap.hasOwnProperty(errorType)) {
				errors.push(errorType + ": " + errorMap[errorType]);
			}
		}
		if(errors.length > 0) {
			connectionStatus.empty();
			for(var i = 0; i < errors.length; i++) {
				var div = document.createElement('div');
				div.appendText(errors[i]);
				connectionStatus.appendChild(div);
			}

			// We wait a moment before showing the status bar to prevent flickering
			// (when an error gets added and the almost immediately removed)
			if(!pendingShow && !connectionStatus.isDisplayed()) {
				pendingShow = setTimeout(function() {
					pendingShow = null;
					assert(errors.length > 0);
					connectionStatus.show();
				}, 100);
			}
		} else {
			if(pendingShow) {
				clearTimeout(pendingShow);
				pendingShow = null;
			} else {
				connectionStatus.hide();
			}
		}
	};
	window.addEvent('load', function() {
		connectionStatus = document.createElement('div');
		connectionStatus.addClass('statusBar');
		document.body.appendChild(connectionStatus);
		StatusBar.refresh();
	});
})();
