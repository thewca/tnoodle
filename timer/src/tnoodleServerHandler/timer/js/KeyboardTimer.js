var KeyboardTimer = new Class({
	delay: 500, //mandatory delay in ms to wait between stopping the timer and starting the timer again
	decimalPlaces: 2,
	frequency: 0.01,
	CHAR_AR: 1/2, 
	INSPECTION: 0,
	initialize: function(parent, server, scrambleStuff, shortcutManager) {
		var timer = this;

		this.parent = parent;
		this.server = server;
		this.scrambleStuff = scrambleStuff;
		this.shortcutManager = shortcutManager;

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
			return document.activeElement != updateFrequency && document.activeElement != inspectionSeconds;
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
		
		var inspectionDiv = new Element('div');
		var inspectionChanged = function(e) {
			var str = inspectionSeconds.value;
			if(!str.match(/^\d+$/)) {
				str = '0'; //TODO so sleepy...
				inspectionSeconds.value = str;
			}
			this.INSPECTION = str.toInt(10);
			server.configuration.set('timer.inspectionSeconds', this.INSPECTION);
		}.bind(this);
		var inspectionSeconds = document.createElement('input');
        inspectionSeconds.setAttribute('type', 'number');
        inspectionSeconds.setProperties({'type': 'number', 'name': 'timer.inspectionSeconds', 'min': "0"});
        inspectionSeconds.setStyle('width', 52);
        inspectionSeconds.setStyle('margin-left', 2);
		inspectionDiv.adopt(inspectionSeconds);
		inspectionDiv.adopt(new Element('label', { 'for': 'timer.inspectionSeconds', html: 'second WCA inspection' }));
		inspectionSeconds.addEvent('change', inspectionChanged);
		optionsDiv.adopt(inspectionDiv);
		inspectionSeconds.value = "" + this.config.get('timer.inspectionSeconds', '');
		inspectionChanged();

		optionsDiv.adopt(tnoodle.tnt.createOptionBox(server.configuration, 'timer.fullscreenWhileTiming', 'Fullscreen while timing', false));

		optionsDiv.adopt(tnoodle.tnt.createOptionBox(server.configuration, 'timer.disableContextMenu', 'Disable context menu', true, null));
		
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
		timer.keysAreDown = false;
		var fireFirst = true;
		KeyboardManager.addEvent('keydown', function(e, manager) {
			timer.windowFocused = true;
			if(timer.shortcutManager.isEditingShortcutField()) {
				// We're actually configuring shortcuts, so we must
				// pass through to the ShortcutManager.
				return;
			}
			if(!timer.isFocused()) {
				return false;
			}
			if(e.key == 'tab') {
				// This is a fun little hack:
				//   Pressing tab could cause the timer to lose focus,
				//   but even if it does, at this point in time
				//   timer.isFocused() will still return true.
				//   We must return to the dispatch thread and *then* call
				//   redraw, which will clear the keysDown css of our timer display.
				setTimeout(function() {
					timer.redraw();
				}, 0);
			}
			if(e.key == 'space') {
				// This is needed to stop space from scrolling on ff
				e.stop();
			}
			if(timer.config.get('timer.enableStackmat')) {
				return;
			}
			if(e.key == timer.resetKey()) {
				timer.reset();
			}
			timer.keysAreDown = timer.keysDown();
			if(timer.timing) {
				if(timer.startKeys().length > 1 && !timer.keysAreDown) {
					// If the user has specified more than one key
					// to start the timer, then they want to emulate the
					// behavior of a stackmat,
					// so we only stop the timer if they're holding down
					// all the keys they specified.
					return;
				}
                stopTimer();
				e.stop();
				return false;
			} else {
				timer.redraw();
			}
		}, fireFirst);
		KeyboardManager.addEvent('keyup', function(e, manager) {
			timer.windowFocused = true;
			if(timer.shortcutManager.isEditingShortcutField()) {
				// We're actually configuring shortcuts, so we must
				// pass through to the ShortcutManager.
				return;
			}
			if(timer.config.get('timer.enableStackmat')) {
				// TODO - what is this all about?
				timer.redraw();
				return;
			}
			if(!timer.isFocused()) {
				// A key may have been released which was 
				// being held down when the timer lost focus.
				timer.redraw();
				return false;
			}
			
			if(!e) {
				// e is null when tabs change, 
				// we don't want to start or stop the timer when that happens,
				// so we simply do nothing.
				timer.keysAreDown = false;
				return;
			}
			if(timer.pendingTime) {
				if(KeyboardManager.keys.getLength() === 0) {
					timer.pendingTime = false;
				}
			} else if(timer.keysAreDown && !timer.keysDown()) {
				timer.keysAreDown = false;
				if(timer.hasDelayPassed()) {
					if(timer.INSPECTION > 0 && !timer.inspecting) {
						// if inspection's on and we're not inspecting, let's start!
						timer.inspectionStart = new Date().getTime();
						timer.inspecting = true;
						//TODO - it's likely that we could use lastTime to hold our
						//penalties, and thereby clean up a good bit of code
						//UPDATE -  I think i thought through this and decided it was a bad idea...
						timer.lastTime = null;
					} else if(timer.timing) {
                        // It is possible to witness keyup events without a
                        // preceeding keydown. This can happen when exiting
                        // a screensaver or when switching tabs. Either way,
                        // we treat this is a request to stop the timer.
                        // Huge thanks to Dan Dzoan for pointing this out!
                        stopTimer();
                    } else {
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
					e.stop();
					return false;
				}
			}
			
			timer.redraw();
		}, fireFirst);
		timer.windowFocused = true;
		document.addEvent('mousedown', function(e) {
			timer.windowFocused = true;
			// We may be in the process of losing focus, this will let any
			// events in the queue drain out
			setTimeout(timer.redraw.bind(timer), 0);
		});
		document.addEvent('mouseup', function(e) {
			timer.windowFocused = true;
			// We may be in the process of losing focus, this will let any
			// events in the queue drain out
			setTimeout(timer.redraw.bind(timer), 0);
		});
		window.addEvent('blur', function(e) {
			// When the page loses focus, we clear the keyboard state
			timer.windowFocused = false;
		});
		// TODO - the page may be out of focus when it loads!
		window.addEvent('focus', function(e) {
			timer.windowFocused = true;
			timer.redraw();
		});
		window.addEvent('contextmenu', function(e) {
			var allowContextMenu = !timer.config.get('timer.disableContextMenu') || !timer.isFocused();
			return allowContextMenu;
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
		var time = new tnoodle.Time(this.getTimeCentis(), this.scramble);
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
		var timeSinceStoppingTimer = new Date().getTime() - this.timerStop;
		assert(timeSinceStoppingTimer >= 0);
		return timeSinceStoppingTimer > this.delay;
	},
	isFocused: function() {
		// This is kinda weird, we want to avoid activating the timer 
		// if we're in a textarea or input field.
		return !tnoodle.tnt.isTextEditing() && !tnoodle.tnt.isSelecting() && !tnoodle.tnt.isGrayedOut() && this.windowFocused;
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
		if(this.INSPECTION === 0) {
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
			if(this.lastTime) {
				// This little tricky bit lets the user see penalties they've applied to the
				// most recent solve.
				// Note: A time's session is set to null when deleted
				if(this.lastTime.getSession() !== null) {
					return this.lastTime.format();
				}
			}

			var decimalPlaces = 2;
			var centis = this.getTimeCentis();
			if(this.timing) {
				if(this.frequency === 0) {
					return "...";
				}
				centis = (this.frequency*100)*(Math.round(centis / (this.frequency*100)));
				decimalPlaces = this.decimalPlaces;
			}
			return this.server.formatTime(centis, decimalPlaces);
		}
	},
	timerId: null,
	fireRedraw: function() {
		this.redraw();
		setTimeout(function() {
			if(this.timerId === null) {
				// This means stopRender was called,
				// so we don't want to continue the animation.
				return;
			}
			this.timerId = requestAnimFrame(this.fireRedraw.bind(this), this.timer);
		}.bind(this), this.frequency*1000);
	},
	startRender: function() {
		if(this.timerId === null) {
			this.timerId = requestAnimFrame(this.fireRedraw.bind(this), this.timer);
		}
	},
	stopRender: function() {
		if(this.timerId !== null) {
			cancelRequestAnimFrame(this.timerId);
			this.timerId = null;
			this.redraw();
		}
	},
	reset: function() {
		this.stackCentis = 0;
		this.timing = false;
		this.timerStart = 0;
		this.timerStop = 0;
		this.inspecting = false;
		this.inspectionStart = null;
		this.lastTime = null;
		
		this.stopRender();
	},
	startKeys: function() {
		var startKey = this.config.get("shortcuts."+tnoodle.tnt.KEYBOARD_TIMER_SHORTCUT, 'space');
		return startKey.split("+");
    },
	resetKey: function() {
		var resetKey = this.config.get("shortcuts.Reset timer", 'esc');
		assert(resetKey.indexOf("+") == -1);
		return resetKey;
	},
	keysDown: function() {
		if(this.pendingTime) {
			return false;
		}
		var startKeys = this.startKeys();
		if(startKeys.length === 1 && startKeys[0] === "") {
			var keys = KeyboardManager.keys.getKeys();
			if(keys.length === 0) {
				return false;
			}
			if(keys.contains(this.resetKey())) {
				return false;
			}
			if(keys.contains('esc') || keys.contains('alt') || keys.contains('tab')) {
				return false;
			}
			var nullStr = String.fromCharCode(0);
			if(keys.contains(nullStr)) {
				// We don't allow using unknown keys to start the timer.
				// This solves all sorts of weird issues with IBM's fn key, and
				// opening the lid of a laptop.
				return false;
			}
			var handler = this.shortcutManager.getHandler(keys);
			return !handler;
		} else {
			return KeyboardManager.keys.getKeys().containsAll(startKeys);
		}
	},
	redraw: function() {
		var string = this.stringy();
		var colorClass = this.inspecting ? 'inspecting' : '';
		if(this.isFocused()) {
			var keysDown = this.keysDown();
			if(this.keysAreDown && keysDown && this.hasDelayPassed()) {
				if(!this.inspecting) {
					// we still want people to see their inspection time when they're pressing spacebar
					if(this.INSPECTION) {
						string = ""+this.INSPECTION;
					} else {
						string = this.server.formatTime(0, this.decimalPlaces);
					}
				}
				colorClass = 'keysDown';
			}
		} else {
			colorClass = 'unfocused';
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
