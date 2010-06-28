var KeyboardTimer = new Class({
	wcaInspection: false, //TODO - add gui option!
	timerStatus: true, //TODO - add gui option!
	onlySpaceStarts: true, //TODO - add gui option!
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

		var keys = new Hash();
		this.keys = keys;
		
		this.reset(); //this will update the display
		
		window.addEvent('keydown', function(e) {
			if(!timer.isFocused())
				return;
			if(e.key == 'space')
				e.stop(); //stop space from scrolling
			keys.set(e.code, true);
			if(timer.timing) {
				//stopping timer
				timer.timing = false;
				timer.timerStop = new Date().getTime();
				timer.stopRender();

				timer.fireEvent('newTime', timer.getTimeCentis());
				timer.pendingTime = true;
				timer.timing = false;
			}
			
			timer.redraw();
		});
		window.addEvent('keyup', function(e) {
			if(!timer.isFocused())
				return;
			keys.erase(e.code);
			
			if(timer.pendingTime) {
				timer.pendingTime = (keys.getLength() > 0);
			} else if((timer.onlySpaceStarts && e.key == 'space') || (!timer.onlySpaceStarts && keys.getLength() == 0)) {
				if(new Date().getTime() - timer.timerStop > timer.delay) {
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
			//even thought this may be odd behavior, it's better to do this
			//then have the timer freeze up on a user
			if(e.key == 'space') //releasing space resets the keyboard state
				keys.empty();
			
			timer.redraw();
		});
		window.addEvent('blur', function(e) {
			//when the page loses focus, we clear the keyboard state, and accept any pending times
			keys.empty();
			timer.pendingTime = false;
			timer.redraw();
		});
	},
	isFocused: function() {
		//we disable the timer if a text field is focused
		return (document.activeElement.type != "text" &&
		   document.activeElement.type != "textarea")
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
		this.inspecting = false;
		this.inspectionStart = null;
		
		this.stopRender();
	},
	redraw: function() {
		var color = this.inspecting ? 'red' : 'black';
		this.timer.set('html', this.stringy());
		if(this.timerStatus) {
			if(!this.pendingTime && (this.onlySpaceStarts && this.keys.get(32)) || (!this.onlySpaceStarts && this.keys.getLength() > 0))
				color = 'green';
		}
		this.timer.setStyle('color', color);
		
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