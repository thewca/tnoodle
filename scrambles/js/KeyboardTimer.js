var KeyboardTimer = new Class({
	wcaInspection: true, //TODO - add gui option!
	clockFormat: true, keyboardOnlyStarts: false, //TODO - implement these! and add gui...
	delay: 500, //mandatory delay in ms to wait between stopping the timer and starting the timer again
	initialize: function(parent, server) {
		this.parent = parent;
		this.server = server;
		
		this.sizer = new Element('span');
		this.sizer.id = 'sizer';
		this.sizer.inject(document.body);
		
		this.timer = new Element('div');
		this.timer.id = 'timer';
		this.timer.inject(parent);
		this.timer.setStyle('position', 'relative'); //this lets us manually center the text with js

		var timer = this;

		this.reset(); //this will update the display
		
		var keys = new Hash();
		window.addEvent('keydown', function(e) {
			//we disable the timer if an input of type text is focused
			if(document.activeElement.type == "text")
				return;
			if(e.key == 'space')
				e.stop(); //stop space from scrolling
			keys.set(e.code, true);
			if(timer.timing) {
				//stopping timer
				timer.timing = false;
				timer.timerStop = new Date().getTime();
				timer.pendingTime = timer.getTimeCentis();
				timer.stopRender();
			}
		});
		window.addEvent('keyup', function(e) {
			//we disable the timer if an input of type text is focused
			if(document.activeElement.type == "text")
				return;
			//e.stop();
			keys.erase(e.code);
			if(e.key != 'space') //TODO - spacebar only starts?
				return;
			//TODO - alt-tabbing seems to be killing our keyboard state
			if(true || keys.getLength() == 0) {
				if(timer.pendingTime) {
					//accepting time
					timer.fireEvent('newTime', timer.pendingTime);
					timer.pendingTime = null;
					timer.timing = false;
				} else if(new Date().getTime() - timer.timerStop > timer.delay) {
					if(timer.wcaInspection && !timer.inspecting) {
						// if inspection's on and we're not inspecting, let's start!
						timer.inspectionStart = new Date().getTime();
						timer.inspecting = true;
					} else {
						// starting timer
						timer.inspecting = false;
						timer.timerStart = new Date().getTime();
						timer.timing = true;
					}
					timer.startRender();
				}
			}
		});
	},
	getTimeCentis: function() {
		var end = (this.timing ? new Date().getTime() : this.timerStop);
		return Math.round((end - this.timerStart)/10);
	},
	getInspectionElapsedSeconds: function() {
		var time = new Date().getTime();
		return ((time - this.inspectionStart)/1000).toInt();
	},
	//mootools doesn't like having a toString method? wtf?!
	stringy: function() {
		//TODO - wca style penalties
		if(this.inspecting)
			return (15-this.getInspectionElapsedSeconds()).toString();
		else
			return this.server.formatTime(this.getTimeCentis());
	},
	timerId: null,
	startRender: function() {
		if(this.timerId == null)
			this.timerId = this.redraw.periodical(10, this);
	},
	stopRender: function() {
		$clear(this.timerId);
		this.timerId = null;
		this.redraw();
	},
	reset: function() {
		this.timing = false;
		this.timerStart = 0;
		this.timerStop = 0;
		this.pendingTime = null;
		this.inspecting = false;
		this.inspectionStart = null;
		
		this.stopRender();
	},
	redraw: function() {
		this.timer.setStyle('color', this.inspecting ? 'red': 'black');
		this.timer.set('html', this.stringy());
		
		//figure out what the largest we can make the timer is
		//this makes use of our "sizer" span
		this.sizer.setStyle('display', 'inline');
		this.sizer.set('html', this.timer.get('html'));
		
		var maxSize = this.parent.getSize();
		var size = maxSize.y;
		do {
			this.sizer.setStyle('font-size', --size);
			var width = this.sizer.getSize().x;
		} while(width > maxSize.x);
		this.sizer.setStyle('display', 'none');
		this.timer.setStyle('font-size', size);
		
		//now that we've computed its font size, we center the time vertically
		this.timer.setStyle('top', (this.parent.getSize().y - this.timer.getSize().y)/2);
	}
});
KeyboardTimer.implement(new Events);