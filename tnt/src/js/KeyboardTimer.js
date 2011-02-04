var KeyboardTimer = new Class({
	delay: 500, //mandatory delay in ms to wait between stopping the timer and starting the timer again
	decimalPlaces: 2,
	frequency: 0.01,
	CHAR_AR: 1/2, 
	INSPECTION: 15,
	initialize: function(parent, server, scrambleStuff) {
		var timer = this;

		this.scrambleStuff = scrambleStuff;
		this.parent = parent;
		this.server = server;
		this.config = server.configuration;
		
		this.timer = new Element('div');
		this.timer.id = 'time';
		this.timer.inject(parent);
		this.timer.setStyle('position', 'relative'); //this lets us manually center the text with js
		
		this.fullscreenBG = new Element('div', { 'class': 'fullscreenTimerBg' });
		this.fullscreenBG.setStyle('display', 'none');
		this.fullscreenBG.inject(document.body);
		
		function shownCallback() { }
		function hiddenCallback() { }
		function canHide() {
			return document.activeElement != updateFrequency;
		}
		var options = tnoodle.tnt.createOptions(shownCallback, hiddenCallback, canHide);
		var optionsDiv = options.div;
		var optionsButton = options.button;
		optionsButton.setStyles({
			position: 'absolute',
			top: 2,
			right: 5
		});
		optionsButton.inject(parent);
		
		var updateFrequency = new Element('input', {type: 'text', 'name': 'timer.frequency', size: 3});
		var frequencyChanged = function(e) {
			if(!updateFrequency.value.match(/^\d+(\.\d*)?|\.\d+$/)) {
				updateFrequency.value = "0.01";
			}
			
			if(updateFrequency.value.indexOf('.') < 0) {
				this.decimalPlaces = 0;
			} else {
				this.decimalPlaces = updateFrequency.value.length - updateFrequency.value.indexOf('.') - 1;
			}
			
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
		
		optionsDiv.adopt(tnoodle.tnt.createOptionBox(server.configuration, 'timer.fullscreenWhileTiming', 'Fullscreen while timing', false));
		optionsDiv.adopt(tnoodle.tnt.createOptionBox(server.configuration, 'timer.wcaInspection', 'WCA style inspection', false));


		var keys = new Hash();
		this.keys = keys;
		
		this.reset(); //this will update the display
		
        function stopTimer() {
            if(!timer.timing) {
                alert('We should be timing if this is being called!'); //TODO - proper error message solution...
            }
            timer.timing = false;
            timer.timerStop = new Date().getTime();

            timer.pendingTime = true;
            timer.stopRender(); // this will cause a redraw()
            timer.fireNewTime();
        }
		var keysDown = false;
		window.addEvent('keydown', function(e) {
			if(!timer.isFocused()) {
				return;
			}
			//if(e.key == 'space') {
				//e.stop(); //stop space from scrolling
			//}
			if(timer.config.get('timer.enableStackmat')) {
				return;
			}
			keys.set(e.key, true);
			keysDown = timer.keysDown();
			if(timer.timing) {
				if(timer.startKeys().length > 1 && !keysDown) {
					// If the user has specified more than one key
					// to start the timer, then it is likely that they
					// want to emulate the functionality of a stackmat,
					// so we only stop the timer if they're holding down
					// all the keys they specified.
					return;
				}
                stopTimer();
			} else {
				timer.redraw();
			}
		});
		window.addEvent('keyup', function(e) {
			if(!timer.isFocused() || timer.config.get('timer.enableStackmat')) {
				return;
			}
			keys.erase(e.key);
			
			if(timer.pendingTime) {
				timer.pendingTime = (keys.getLength() > 0);
			} else if(keysDown && !timer.keysDown()) {
				keysDown = false;
				if(timer.hasDelayPassed()) {
					if(timer.config.get('timer.wcaInspection') && !timer.inspecting) {
						// if inspection's on and we're not inspecting, let's start!
						timer.inspectionStart = new Date().getTime();
						timer.inspecting = true;
						//TODO - it's likely that we could use lastTime to hold our
						//penalties, and thereby clean up a good bit of code
						timer.lastTime = null;
					} else if(timer.timing) {
                        // It is possible to witness keyup events without a
                        // preceeding keydown. This can happen when exiting
                        // a screensaver or when switching tabs. Either way,
                        // we treat this is a request to stop the timer.
                        // Huge thanks to Dan Dzoan for pointing this out!
                        stopTimer();
                    } else{
						// starting timer
						timer.lastTime = null;
						timer.inspecting = false;
						timer.timerStart = new Date().getTime();
						timer.timing = true;
						timer.scramble = scrambleStuff.getScramble();
						timer.importInfo = scrambleStuff.getImportInfo();
						scrambleStuff.scramble();
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
		
		function stackmatError(error) {
			//TODO - pretty error message?
			alert("Error loading stackmat: " + error);
		}
		
		var acceptedTime = false;
		function stackmatUpdated(state) {
			if(state !== null) {
				if(!time.timing && state.running) {
					//this mean that the timer just started running,
					//so we want to update the scramble
					timer.scramble = scrambleStuff.getScramble();
					timer.importInfo = scrambleStuff.getImportInfo();
					timer.scrambleStuff.scramble(); //TODO - test this out using a stackmat!
				}
				timer.timing = state.running;
				timer.stackCentis = state.centis;
				timer.inspecting = false; //TODO - stackmat inspection
				timer.inspectionStart = null;
				timer.redraw();
				//TODO - animate hand status!
				//TODO - animate timer on/off status
				if(timer.timing) {
					acceptedTime = false;
				} else if(state.centis > 0 && !acceptedTime) {
					// new time!
					acceptedTime = true; //this is to prevent redetecting the same time over and over
					timer.fireNewTime();
				}
			}
		}
		
		function stackmatEnabled() {
			timer.reset();
			if(this.checked) {
				tnoodle.stackmat.enable(stackmatUpdated, stackmatError);
			} else {
				tnoodle.stackmat.disable();
			}
		}
		optionsDiv.adopt(tnoodle.tnt.createOptionBox(server.configuration, 'timer.enableStackmat', 'Enable stackmat', false, stackmatEnabled));
		//TODO - add remaining stackmat config options!!!
	},
	lastTime: null,
	fireNewTime: function() {
		var time = new this.server.Time(this.getTimeCentis(), this.scramble);
		this.lastTime = time;
		var penalty = this.getPenalty();
		if(penalty) {
			time.setPenalty(penalty);
		}
		time.importInfo = this.importInfo;
		var addTime = function() {
			this.fireEvent('newTime', [ time ]);
		}.bind(this);
		//the timer lags if we don't queue up the addition of the time like this
		setTimeout(addTime, 0);
	},
	hasDelayPassed: function() {
		return new Date().getTime() - this.timerStop > this.delay;
	},
	isFocused: function() {
		// This is kinda weird, we want to avoid activating the timer 
		// if we're in a textarea, textfield, or input field
		var focusedEl = document.activeElement.nodeName.toLowerCase();
		var isEditing = focusedEl == 'textarea' || focusedEl == 'input';
		return !isEditing && !tnoodle.tnt.isSelecting() && !tnoodle.tnt.isGrayedOut();
	},
	getTimeCentis: function() {
		if(this.config.get('timer.enableStackmat')) {
			return this.stackCentis;
		} else {
			var end = (this.timing ? new Date().getTime() : this.timerStop);
			return Math.round((end - this.timerStart)/10);
		}
	},
	getInspectionElapsedSeconds: function() {
		var time = this.inspecting ? new Date().getTime() : this.timerStart;
		return ((time - this.inspectionStart)/1000).toInt();
	},
	getPenalty: function() {
		if(!this.config.get('timer.wcaInspection')) {
			return null;
		}
		var secondsLeft = this.INSPECTION-this.getInspectionElapsedSeconds();
		if(secondsLeft <= -2) {
			return "DNF";
		} else if(secondsLeft <= 0) {
			return "+2";
		}
		return null;
	},
	//mootools doesn't like having a toString method? wtf?!
	stringy: function() {
		if(this.inspecting) {
			var penalty = this.getPenalty();
			return penalty ? penalty : (this.INSPECTION-this.getInspectionElapsedSeconds()).toString();
		} else {
			var decimalPlaces = 2;
			var centis = this.getTimeCentis();
			if(this.timing) {
				if(this.frequency === 0) {
					return "...";
				}
				centis = (this.frequency*100)*(Math.round(centis / (this.frequency*100)));
				decimalPlaces = this.decimalPlaces;
			} else if(this.lastTime) {
				// This little tricky bit lets the user see penalties they've applied to the
				// most recent solve.
				return this.lastTime.format();
			}
			return this.server.formatTime(centis, decimalPlaces);
		}
	},
	timerId: null,
	startRender: function() {
		if(this.timerId === null) {
			this.timerId = this.redraw.periodical(this.frequency*1000, this);
		}
	},
	stopRender: function() {
		$clear(this.timerId);
		this.timerId = null;
		this.redraw();
	},
	reset: function() {
		this.stackCentis = 0;
		this.timing = false;
		this.timerStart = 0;
		this.timerStop = 0;
		this.inspecting = false;
		this.inspectionStart = null;
		
		this.stopRender();
	},
	startKeys: function() {
		var startKey = this.config.get("shortcuts."+tnoodle.tnt.KEYBOARD_TIMER_SHORTCUT, 'space');
		return startKey.split("+");
    },
	keysDown: function() {
		return !this.pendingTime && this.keys.getKeys().containsAll(this.startKeys());
	},
	redraw: function() {
		var string = this.stringy();
		var colorClass = this.inspecting ? 'inspecting' : '';
		var keysDown = this.keysDown();
		if(keysDown && this.hasDelayPassed()) {
			if(!this.inspecting) {
				// we still want people to see their inspection time when they're pressing spacebar
				string = this.server.formatTime(0, this.decimalPlaces);
			}
			colorClass = 'keysDown';
		}
		this.timer.set('html', string);
		this.timer.erase('class');
		this.timer.addClass(colorClass);
		this.timer.setStyle('width', '');
		this.timer.setStyle('height', '');
		
		var parent;
		if(this.config.get('timer.fullscreenWhileTiming') && this.timing) {
			parent = window;
			this.timer.addClass('fullscreenTimer');
			this.fullscreenBG.setStyle('display', '');
		} else {
			parent = this.parent;
			this.fullscreenBG.setStyle('display', 'none');
		}
		
		var maxSize = parent.getSize();
		var fontSize = Math.min(maxSize.y, maxSize.x/(this.CHAR_AR*string.length));
		this.timer.setStyle('font-size', fontSize);
		
		//now that we've computed its font size, we center the time vertically
		var offset = (maxSize.y - this.timer.getSize().y)/2;
		this.timer.setStyle('top', offset);
		this.timer.setStyle('width', maxSize.x);
		this.timer.setStyle('height', maxSize.y-offset); //hack hackity hack hack
	}
});
KeyboardTimer.implement(new Events());
