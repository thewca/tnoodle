var KeyboardTimer = new Class({
	delay: 500, //mandatory delay in ms to wait between stopping the timer and starting the timer again
	decimalPlaces: 2,
	frequency: .01,
	initialize: function(parent, server) {
		this.parent = parent;
		this.server = server;
		this.config = server.configuration;
		
		this.sizer = new Element('span');
		this.sizer.id = 'sizer';
		this.sizer.inject(document.body);
		
		this.timer = new Element('div');
		this.timer.id = 'timer';
		this.timer.inject(parent);
		this.timer.setStyle('position', 'relative'); //this lets us manually center the text with js
		
		this.fullscreenBG = new Element('div', { 'class': 'fullscreenTimerBg' });
		this.fullscreenBG.setStyle('display', 'none');
		this.fullscreenBG.inject(document.body);
		
		var optionsButton = new Element('div', { html: 'v', 'class': 'optionsButton' });
		optionsButton.inject(parent);
		
		var optionsDiv = new Element('div', { 'class': 'options' });
		optionsDiv.show = function() {
			optionsDiv.setStyle('display', ''); //for some reason, setting visiblity: none doesn't seem to work here
			optionsDiv.fade('in');
			optionsButton.morph('.optionsButtonHover');
		};
		optionsDiv.hide = function(e) {
			updateFrequency.blur(); //TODO - this is happening too often
			optionsDiv.fade('out');
			optionsButton.morph('.optionsButton');
		};
		
		optionsButton.addEvent('mouseover', optionsDiv.show);
		optionsButton.addEvent('mouseout', optionsDiv.hide);
		optionsDiv.addEvent('mouseover', optionsDiv.show);
		optionsDiv.addEvent('mouseout', optionsDiv.hide);
		
		function createOptionBox(optionKey, description, def) {
			var checkbox = new Element('input', { id: optionKey, type: 'checkbox' });
			checkbox.checked = server.configuration.get(optionKey, def)
			checkbox.addEvent('change', function(e) {
				server.configuration.set(this.id, this.checked);
			});
			checkbox.addEvent('focus', function(e) {
				this.blur();
			});
			return new Element('div').adopt(checkbox).adopt(new Element('label', { 'html': description, 'for': optionKey }));
		}
		optionsDiv.adopt(createOptionBox('timer.fullscreenWhileTiming', 'Fullscreen while timing', false));
		optionsDiv.adopt(createOptionBox('timer.wcaInspection', 'WCA style inspection', false));
		optionsDiv.adopt(createOptionBox('timer.onlySpaceStarts', 'Only spacebar starts', true));
		optionsDiv.adopt(createOptionBox('timer.showStatus', 'Show timer status', true));
		
		var updateFrequency = new Element('input', {type: 'text', 'name': 'timer.frequency', size: 3});
		var frequencyChanged = function(e) {
			if(!updateFrequency.value.match(/^\d+(\.\d*)?|\.\d+$/))
				updateFrequency.value = "0.01";
			
			if(updateFrequency.value.indexOf('.') < 0)
				this.decimalPlaces = 0;
			else
				this.decimalPlaces = updateFrequency.value.length - updateFrequency.value.indexOf('.') - 1;
			
			server.configuration.set('timer.frequency', updateFrequency.value);
			this.frequency = updateFrequency.value.toFloat();
		}.bind(this);
		updateFrequency.addEvent('change', frequencyChanged);
		updateFrequency.value = this.config.get('timer.frequency', "0.01");
		frequencyChanged();
		
		var frequencyDiv = new Element('div');
		frequencyDiv.adopt(updateFrequency);
		frequencyDiv.adopt(new Element('label', { 'for': 'timer.frequency', html: 'Update frequency (seconds)' }));
		optionsDiv.adopt(frequencyDiv);

		optionsDiv.setStyle('display', 'none'); //for some reason, setting visiblity: none doesn't seem to work here
		optionsDiv.hide(); //this allows the first show() to animate
		optionsDiv.inject(parent);
		
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
			
			var onlySpaceStarts = timer.config.get('timer.onlySpaceStarts');
			if(timer.pendingTime) {
				timer.pendingTime = (keys.getLength() > 0);
			} else if((onlySpaceStarts && e.key == 'space') || (!onlySpaceStarts && keys.getLength() == 0)) {
				if(new Date().getTime() - timer.timerStop > timer.delay) {
					if(timer.config.get('timer.wcaInspection') && !timer.inspecting) {
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
			if(e.key == 'space' || e.key == 'esc') { //releasing space or esc resets the keyboard state
				resetKeys();
			}
			
			timer.redraw();
		});
		function resetKeys() {
			keys.empty();
			timer.pendingTime = false;
			timer.redraw();
		}
		window.addEvent('click', function(e) {
			resetKeys();
		});
		window.addEvent('blur', function(e) {
			//when the page loses focus, we clear the keyboard state
			resetKeys();
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
		else {
			var decimalPlaces = 2;
			var centis = this.getTimeCentis();
			if(this.timing) {
				if(this.frequency == 0) {
					return "...";
				}
				centis = (this.frequency*100)*(Math.round(centis / (this.frequency*100)));
				decimalPlaces = this.decimalPlaces;
			}
			return this.server.formatTime(centis, decimalPlaces);
		}
	},
	timerId: null,
	startRender: function() {
		if(this.timerId == null)
			this.timerId = this.redraw.periodical(this.frequency*1000, this);
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
		var colorClass = this.inspecting ? 'inspecting' : '';
		this.timer.set('html', this.stringy());
		if(this.config.get('timer.showStatus')) {
			var onlySpaceStarts = this.config.get('timer.onlySpaceStarts');
			if(!this.pendingTime && (onlySpaceStarts && this.keys.get(32)) || (!onlySpaceStarts && this.keys.getLength() > 0))
				colorClass = 'keysDown';
		}
		this.timer.erase('class');
		this.timer.addClass(colorClass);
		this.timer.setStyle('width', '');
		this.timer.setStyle('height', '');
		
		//figure out what the largest we can make the timer is
		//this makes use of our "sizer" span
		this.sizer.erase('class');
		this.sizer.setStyle('display', 'inline');
		this.sizer.set('html', this.timer.get('html'));
		
		var parent;
		if(this.config.get('timer.fullscreenWhileTiming') && this.timing) {
			parent = window;
			this.timer.addClass('fullscreenTimer');
			this.sizer.addClass('fullscreenTimer');
			this.fullscreenBG.setStyle('display', '');
		} else {
			parent = this.parent;
			this.fullscreenBG.setStyle('display', 'none');
		}
		
		var maxSize = parent.getSize();
		var size = maxSize.y;
		do {
			this.sizer.setStyle('font-size', --size);
			var width = this.sizer.getSize().x;
		} while(width > maxSize.x);
		this.sizer.setStyle('display', 'none');
		this.timer.setStyle('font-size', size);
		
		//now that we've computed its font size, we center the time vertically
		var offset = (maxSize.y - this.timer.getSize().y)/2;
		this.timer.setStyle('top', offset);
		this.timer.setStyle('width', maxSize.x);
		this.timer.setStyle('height', maxSize.y-offset); //hack hackity hack hack
	}
});
KeyboardTimer.implement(new Events);