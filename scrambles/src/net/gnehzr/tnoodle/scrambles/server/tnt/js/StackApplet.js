var tnoodle = tnoodle || {};
tnoodle.stackmat = {
	//TODO - allow querying of mixers!
	//TODO - allow setting of inverted!
	//TODO - generate this file from stackmat project?
	//TODO - add shelley's code & email her back
	applet: null,
	enable: function(updateCallback, errorCallback, stackmatValue, mixerIndex) {
		if(tnoodle.stackmat.applet != null)
			tnoodle.stackmat.disable();
		
		window.stackmatUpdateCallback = updateCallback;
		window.stackmatErrorCallback = errorCallback;
		
		function createParam(key, val) {
			var param = document.createElement('param');
			param.setAttribute('name', key);
			param.setAttribute('value', val);
			return param;
		}
		var applet = document.createElement('applet');
		applet.style.width = '0px';
		applet.style.height = '0px';
		applet.style.visibility = 'hidden';
		applet.setAttribute('codebase', 'java/');
		applet.setAttribute('archive', 'StackApplet.jar');
		applet.setAttribute('code', 'net.gnehzr.tnoodle.stackmat.StackApplet');
		applet.setAttribute('mayscript', 'mayscript');
		applet.appendChild(createParam('updateCallback', 'stackmatUpdateCallback'));
		applet.appendChild(createParam('errorCallback', 'stackmatErrorCallback'));
		if(stackmatValue)
			applet.appendChild(createParam('stackmatValue', stackmatValue));
		if(mixerIndex)
			applet.appendChild(createParam('mixer', mixerIndex));
		document.body.appendChild(applet);
		tnoodle.stackmat.applet = applet;
	},
	disable: function() {
		if(tnoodle.stackmat.applet == null) return;
		document.body.removeChild(tnoodle.stackmat.applet);
		tnoodle.stackmat.applet = null;
		window.stackmatUpdateCallback(); // we want them to be notified that the timer is OFF
	},
	isOn: function() {
		if(tnoodle.stackmat.applet == null)
			return false;
		return tnoodle.stackmat.applet.isOn();
	}
};
