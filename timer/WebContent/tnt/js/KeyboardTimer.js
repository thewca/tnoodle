var KeyboardTimer = new Class({
        delay: 500, //mandatory delay in ms to wait between stopping the timer and starting the timer again
        _hasDelayPassed: true,
        options_: [],
        initialize: function(timerDisplay, configuration, shortcutManager) {
                this.timerDisplay = timerDisplay;
                this.config = configuration;
                this.shortcutManager = shortcutManager;

                this.keysAreDown = false;
                var fireFirst = true;
                KeyboardManager.addEvent('keydown', this._keydown.bind(this), fireFirst);
                KeyboardManager.addEvent('keyup', this._keyup.bind(this), fireFirst);

                this.options_.push(tnoodle.tnt.createOptionBox(configuration, 'timer.disableContextMenu', 'Disable context menu', true, null));

                window.addEvent('contextmenu', function(e) {
                        var allowContextMenu = !this.config.get('timer.disableContextMenu') || !this.timerDisplay.isFocused();
                        return allowContextMenu;
                }.bind(this));

        },
        _keydown: function(e, manager) {
                this.timerDisplay.windowFocused = true;
                if(this.shortcutManager.isEditingShortcutField()) {
                        // We're actually configuring shortcuts, so we must
                        // pass through to the ShortcutManager.
                        return;
                }
                if(!this.timerDisplay.isFocused()) {
                        return false;
                }
                if(e.key == 'tab') {
                        // This is a fun little hack:
                        //   Pressing tab could cause the timer to lose focus,
                        //   but even if it does, at this point in time
                        //   this.isFocused() will still return true.
                        //   We must return to the dispatch thread and *then* call
                        //   redraw, which will clear the keysDown css of our timer display.
                        setTimeout(function() {
                                this.timerDisplay.redraw();
                        }.bind(this), 0);
                }
                if(e.key == 'space') {
                        // This is needed to stop space from scrolling on ff
                        e.stop();
                }
                if(!this.enabled_) {
                        return;
                }
                if(e.key == this._resetKey()) {
                        this.timerDisplay.resetTimerAndScramble();
                }
                this.keysAreDown = this.keysDown();
                if(this.timerDisplay.timing) {
                        if(this._startKeys().length > 1 && !this.keysAreDown) {
                                // If the user has specified more than one key
                                // to start the timer, then they want to emulate the
                                // behavior of a stackmat,
                                // so we only stop the timer if they're holding down
                                // all the keys they specified.
                                return;
                        }
                        this.pendingTime = true;
                        this.timerDisplay.stopTimer();
                        this._hasDelayPassed = false;
                        setTimeout(function() {
                                this._hasDelayPassed = true;
                                this.timerDisplay.redraw();
                        }.bind(this), this.delay);
                        e.stop();
                        return false;
                } else {
                        this.timerDisplay.redraw();
                }
        },
        _keyup: function(e, manager) {
                this.timerDisplay.windowFocused = true;
                if(this.shortcutManager.isEditingShortcutField()) {
                        // We're actually configuring shortcuts, so we must
                        // pass through to the ShortcutManager.
                        return;
                }
                if(!this.enabled_) {
                        // TODO - what is this all about?
                        this.timerDisplay.redraw();
                        return;
                }
                if(!this.timerDisplay.isFocused()) {
                        // A key may have been released which was
                        // being held down when the timer lost focus.
                        this.timerDisplay.redraw();
                        return false;
                }

                if(!e) {
                        // e is null when tabs change,
                        // we don't want to start or stop the timer when that happens,
                        // so we simply do nothing.
                        this.keysAreDown = false;
                        return;
                }
                if(this.pendingTime) {
                        if(KeyboardManager.keys.getLength() === 0) {
                                this.pendingTime = false;
                        }
                } else if(this.keysAreDown && !this.keysDown()) {
                        this.keysAreDown = false;
                        if(this._hasDelayPassed) {
                                if(this.timerDisplay.INSPECTION > 0 && !this.timerDisplay.inspecting) {
                                        // if inspection's on and we're not inspecting, let's start!
                                        this.timerDisplay.startInspection();
                                } else if(this.timerDisplay.timing) {
                                        // It is possible to witness keyup events without a
                                        // preceeding keydown. This can happen when exiting
                                        // a screensaver or when switching tabs. Either way,
                                        // we treat this is a request to stop the timer.
                                        // Huge thanks to Dan Dzoan for pointing this out!
                                        this.pendingTime = true;
                                        this.timerDisplay.stopTimer();
                                } else {
                                        // starting timer
                                        this.timerDisplay.startTimer();
                                }
                                e.stop();
                                return false;
                        }
                }

                this.timerDisplay.redraw();
        },
        _startKeys: function() {
                var startKey = this.config.get("shortcuts."+tnoodle.tnt.KEYBOARD_TIMER_SHORTCUT);
                return startKey.split("+");
    },
        _resetKey: function() {
                var resetKey = this.config.get("shortcuts.Reset timer", 'esc');
                assert(resetKey.indexOf("+") == -1);
                return resetKey;
        },
        keysDown: function() {
                if(this.pendingTime) {
                        return false;
                }
                var startKeys = this._startKeys();
                if(startKeys.length === 1 && startKeys[0] === "") {
                        var keys = KeyboardManager.keys.getKeys();
                        if(keys.length === 0) {
                                return false;
                        }
                        if(keys.contains(this._resetKey())) {
                                return false;
                        }
                        if(keys.contains('esc') || keys.contains('alt') || keys.contains('tab')) {
                                return false;
                        }
                        for(var i = 0; i < keys.length; i++) {
                                if(/f\d\d?/.exec(keys[i])) {
                                        // f* keys aren't allowed to start the timer
                                        return false;
                                }
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
        isOn: function() {
                return true;
        },
        isArmed: function() {
                var keysDown = this.keysDown();
                return this.keysAreDown && keysDown && this._hasDelayPassed;
        },
        getOptions: function() {
                return this.options_;
        },
        enabled_: false,
        setEnabled: function(enabled) {
                this.enabled_ = enabled;
        },

        stringy: function() {
                return 'Keyboard';
        }
});

TimerDisplay.timerClasses.push(KeyboardTimer);

