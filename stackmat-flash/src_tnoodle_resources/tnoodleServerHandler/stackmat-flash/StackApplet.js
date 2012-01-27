var tnoodle = tnoodle || {};
tnoodle.stackmat = {
	//TODO - allow querying/setting of mixers!
	//TODO - gracefully handle not being given microphone access
	//TODO - auto detect stackmat value?
	//TODO - auto detect inverted
	//TODO - auto detect gen2/gen3
	_applet: null,
	_appletLoadTimeout: null,
	_appletWatchdogTimer: null,
	enable: function(updateCallback, errorCallback, parentElement) {
		if(tnoodle.stackmat._applet !== null) {
			tnoodle.stackmat.disable();
		}
		
		window.stackmatUpdateCallback = function(state) {
			if(state && tnoodle.stackmat._appletWatchdogTimer === null) {
				// This may be the first indicator we have that the applet is alive.
				// We cancel the pending load timeout timer, and start up the
				// health monitor.
				tnoodle.stackmat._checkApplet();
				tnoodle.stackmat._cancelLoadTimeout();
			}
			updateCallback(state);
		};
		window.stackmatErrorCallback = function(error) {
			if(tnoodle.stackmat._appletWatchdogTimer === null) {
				// This may be the first indicator we have that the applet is alive.
				// We cancel the pending load timeout timer, and start up the
				// health monitor.
				tnoodle.stackmat._checkApplet();
				tnoodle.stackmat._cancelLoadTimeout();
			}
			errorCallback(error);
		};

		var vars = {
			updateCallback: 'stackmatUpdateCallback',
			errorCallback: 'stackmatErrorCallback'
		};
		var swfFile = '/stackmat-flash/StackApplet.swf';
		swfFile += "?" + (new Date().getTime());// TODO

		var applet = new Swiff(swfFile, {
			width: 0,
			height: 0,
			vars: vars,
			params: {
				wMode: 'transparent'
			}
		}).toElement();
		parentElement.appendChild(applet);
		tnoodle.stackmat._applet = applet;
		// If the applet is not at least 214x137, the settings dialog option
		// will be grayed out.
		tnoodle.stackmat._applet.setStyle('width', 214);
		tnoodle.stackmat._applet.setStyle('height', 137);
		tnoodle.stackmat._applet.setStyle('border', '1px solid black');

		tnoodle.stackmat._appletLoadTimeout = setTimeout(tnoodle.stackmat._appletFailedToLoad, 1000);
	},
	_checkApplet: function() {
		// We're not ready to schedule the watchdog quite yet, but this is the only
		// way we have of notifying people that the watchdog has been started.
		tnoodle.stackmat._appletWatchdogTimer = true;

		var alive = false;
		var msg = "";
		try {
			alive = tnoodle.stackmat._applet.ping();
		} catch(e) {
			msg = e.msg;
		}
		if(!alive) {
			window.stackmatErrorCallback({
				message: "Stackmat flash plugin is not responding to ping. Try disabling and renabling stackmat support, or just refreshing the page.\n" + msg
			});
		} else {
			tnoodle.stackmat._appletWatchdogTimer = setTimeout(tnoodle.stackmat._checkApplet, 1000);
		}
	},
	_cancelLoadTimeout: function() {
		clearTimeout(tnoodle.stackmat._appletLoadTimeout);
		tnoodle.stackmat._appletLoadTimeout = null;
	},
	_appletFailedToLoad: function() {
		window.stackmatErrorCallback({
			message: "Applet is taking a while to load. This is probably not a good thing."
		});
	},
	captureNSamples: function(n, callback) {
		window.stackmatCaptureSamplesCallback = callback;
		tnoodle.stackmat._applet.captureNSamples(n, 'stackmatCaptureSamplesCallback');
	},
	parseSamples: function(samples) {
		tnoodle.stackmat._applet.parseSamples(samples);
	},
	statesEqual: function(s1, s2) {
		s1 = s1 || {};
		s2 = s2 || {};
		return s1.units === s2.units && s1.unitsPerSecond == s2.unitsPerSecond && s1.on === s2.on && s1.greenLight === s2.greenLight && s1.leftHand === s2.leftHand && s1.rightHand === s2.rightHand && s1.running === s2.running && s1.unknownRunning === s2.unknownRunning;
	},
	statesEqualIgnoreHands: function(s1, s2) {
		s1 = s1 || {};
		s2 = s2 || {};
		return s1.units === s2.units && s1.unitsPerSecond == s2.unitsPerSecond && s1.on === s2.on && s1.running === s2.running && s1.unknownRunning === s2.unknownRunning;
	},
	disable: function() {
		if(tnoodle.stackmat._applet === null) { return; }
		if(tnoodle.stackmat._appletLoadTimeout !== null) {
			tnoodle.stackmat._cancelLoadTimeout();
		}
		if(tnoodle.stackmat._appletWatchdogTimer !== null) {
			clearTimeout(tnoodle.stackmat._appletWatchdogTimer);
			tnoodle.stackmat._appletWatchdogTimer = null;
		}
		tnoodle.stackmat._applet.dispose();
		tnoodle.stackmat._applet = null;
		window.stackmatUpdateCallback(); // we want them to be notified that the timer is OFF
	}
};
