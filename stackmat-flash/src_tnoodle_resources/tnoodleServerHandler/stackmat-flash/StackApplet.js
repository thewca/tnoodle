var tnoodle = tnoodle || {};
tnoodle.stackmat = {
	//TODO - allow querying/setting of mixers!
	//TODO - gracefully handle not being given microphone access
	//TODO - auto detect stackmat value?
	//TODO - auto detect inverted
	//TODO - auto detect gen2/gen3
	applet: null,
	enable: function(updateCallback, errorCallback, settingsHiddenCallback, stackmatValue, mixerIndex) {
		if(tnoodle.stackmat.applet !== null) {
			tnoodle.stackmat.disable();
		}
		
		window.stackmatUpdateCallback = updateCallback;
		window.stackmatErrorCallback = errorCallback;
		window.stackmatSettingsHiddenCallback = settingsHiddenCallback;

		var vars = {
			updateCallback: 'stackmatUpdateCallback',
			errorCallback: 'stackmatErrorCallback',
			settingsHiddenCallback: 'stackmatSettingsHiddenCallback'
		};
		var swfFile = '/stackmat-flash/StackApplet.swf';
		swfFile += "?" + (new Date().getTime());

		var applet = new Swiff(swfFile, { width: 0, height: 0, vars: vars, wMode: 'opaque' }).toElement();
		document.body.appendChild(applet);
		tnoodle.stackmat.applet = applet;
		this.hideApplet();
	},
	showMicrophoneSettings: function() {
		if(tnoodle.stackmat.applet === null) { return; }
		
		// If the applet is not at least 214x137, the settings dialog option
		// will be grayed out.
		tnoodle.stackmat.applet.setStyle('width', 214);
		tnoodle.stackmat.applet.setStyle('height', 137);
		tnoodle.stackmat.applet.setStyle('border', '1px solid black');
		tnoodle.stackmat.applet.showMicrophoneSettings();
	},
	hideApplet: function() {
		if(tnoodle.stackmat.applet === null) { return; }
		
		tnoodle.stackmat.applet.setStyle('width', 0);
		tnoodle.stackmat.applet.setStyle('height', 0);
		tnoodle.stackmat.applet.setStyle('border', '');
	},
	disable: function() {
		if(tnoodle.stackmat.applet === null) { return; }
		document.body.removeChild(tnoodle.stackmat.applet);
		tnoodle.stackmat.applet = null;
		window.stackmatUpdateCallback(); // we want them to be notified that the timer is OFF
	}
};
