var StackmatTimer = new Class({
	options_: [],
	initialize: function(timerDisplay, configuration, shortcutManager) {
		this.timerDisplay = timerDisplay;

		this.stackmatConfigPopup = tnoodle.tnt.createPopup();
		this.stackmatConfigPopup.setStyle("text-align", "center");
		var title = new Element('div', {
			html: "Not working? Play around over <a href='/stackmat-flash/stacktest.html' target='_blank'>here</a>." });
		this.stackmatConfigPopup.appendChild(title);

		this.showStackmatConfigLink = document.createElement('span');
		this.showStackmatConfigLink.appendText("Configure stackmat");
		this.showStackmatConfigLink.addClass('link');
		this.showStackmatConfigLink.addEvent('click', function(e) {
			this.stackmatConfigPopup.show();
		}.bind(this));

		this.timerSpecificConfigSpan = this.showStackmatConfigLink;
	},
	getOptions: function() {
		return this.options_;
	},
	acceptedTime_: null,
	stackmatState_: null,
	_stackmatUpdated: function(state) {
		if(state) {
			if(tnoodle.stackmat.statesEqual(state, this.stackmatState_)) {
				return;
			}
			this.stackmatState_ = state;
			if(!state.on) {
				this.timerDisplay.redraw();
				return;
			}
			if(state.running) {
				this.timerDisplay.startTimer(state.centis);
				this.acceptedTime_ = null;
			} else {
				if(state.centis === 0) {
					if(this.timerDisplay.timing) {
						// If we wanted to do something special when the user
						// presses restart on a running timer, this would be the
						// place.
						var nop;
					}
					this.timerDisplay.resetTimerAndScramble();
				} else if(this.acceptedTime_ != state.centis) {
					// new time!
					this.timerDisplay.stopTimer(state.centis);
					this.acceptedTime_ = state.centis; //this is to prevent redetecting the same time over and over
				}
			}

			// TODO - stackmat inspection?
		} else {
			this.stackmatState_ = null;
		}

		this.timerDisplay.redraw();
	},
	_stackmatErrored: function stackmatError(error) {
		if(error.message == 'muted') {
			error.message = 'Please grant flash microphone access.';
		}
		this.stackmatConfigPopup.show();
		alert(error.message);
	},
		
	enabled_: false,
	setEnabled: function(enabled) {
		this.enabled_ = enabled;
		this.timerDisplay.reset();
		this.stackmatState_ = null;
		if(this.enabled_) {
			tnoodle.stackmat.enable(this._stackmatUpdated.bind(this), this._stackmatErrored.bind(this), this.stackmatConfigPopup);
			// Note that we use visibility rather than mootools's show/hide
			// because we need to know how much space it will take up for sizing our
			// options div.
			this.showStackmatConfigLink.setStyle('visibility', '');
		} else {
			tnoodle.stackmat.disable();
			this.showStackmatConfigLink.setStyle('visibility', 'hidden');
		}
	},
	isArmed: function() {
		if(!this.stackmatState_) {
			return false;
		}
		return this.stackmatState_.greenLight;
	},
	isOn: function() {
		if(!this.stackmatState_) {
			return false;
		}
		return this.stackmatState_.on;
	},

	stringy: function() {
		return 'Stackmat';
	}
});

TimerDisplay.timerClasses.push(StackmatTimer);
