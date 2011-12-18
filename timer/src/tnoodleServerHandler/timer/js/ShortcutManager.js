var ShortcutManager = null;
(function() {

	ShortcutManager = function(shortcuts, configuration, timer) {

		// This subclass of Keyboard ensures that
		// shortcuts only work when we're not timing,
		// editing a text box, or doing something else
		// we care about.
		var editingShortcutField = null;

		function getShortcutKeys(shortcut) {
			var keys = shortcut.keys;
			if(keys === null || keys === undefined) {
				keys = shortcut['default'] || '';
			}
			return keys;
		}

		shortcuts.getValues().each(function(category) {
			category.each(function(shortcut) {
				var keys = configuration.get('shortcuts.' + shortcut.description, null);
				shortcut.keys = keys;
			});
		});

// TODO <<< alt+tab starts timer!
// TODO <<< releasing a hotkey starts the timer...
// TODO <<< escape shouldn't start the timer...
//                      if(!timer.timing && timer.isFocused() && !timer.keysDown() && !timer.pendingTime) {
//                               this.parent(event, typeStr);
//                       }

		function timerWaitingToStart() {
			return !timer.timing && timer.isFocused() && !timer.keysDown() && !timer.pendingTime;
		}

		// TODO - test this out on opera!
		var fireFirst = true;
		KeyboardState.addEvent('keyup', function(e, manager) {
			if(!timer.isFocused()) {
				return false;
			}
			if(e) {
				var keys = [ e.key ];
				var shortcutMap = getShortcutMap();
				var handler = getHandler(keys);
				if(handler) {
					e.stop();
					return false;
				}
			}
		}, fireFirst);
		KeyboardState.addEvent('keydown', function(e, manager) {
			var keys = manager.keys.getKeys();

			if(isEditingShortcutField()) {
				if(keys.length === 0) {
					return;
				}
				if(keys.contains('tab')) {
					return;
				}
				if(keys.contains('backspace')) {
					keys = [];
				}
				var keyStr = keys.join("+");
				setTimeout(function() {
					// For some reason, calling e.stop()
					// enough to stop opera from adding the 
					// This little hack seems to work, howev
					editingShortcutField.value = keyStr;
				}, 0);
				editingShortcutField.shortcut.keys = keyStr;
				highlightDuplicates();

				e.stop();
				return false;
			}

			if(timer.timing) {
				// If the timer is running, we don't want to do any hotkey stuff,
				// we just let this even percolate down to the timer so the
				// timer can stop.
				return;
			}
			if(!timer.isFocused()) {
				// If the timer does not have focus, then we don't want to fire any
				// hotkeys. This happens when someone is editing a text field.
				return false;
			}
			var handler = getHandler(keys);
			if(handler) {
				handler();
				e.stop();
				return false;
			}
		}, fireFirst);

		function getHandler(keys) {
			var shortcutMap = getShortcutMap();
			keys.sort();
			var keyStr = keys.join("+");
			if(keyStr in shortcutMap) {
				var shortcuts = shortcutMap[keyStr];
				if(shortcuts.length == 1 && shortcuts[0].handler) {
					return shortcuts[0].handler;
				}
			}
		}

		function getShortcutMap() {
			var shortcutMap = {};
			shortcuts.getValues().each(function(category) {
				category.each(function(shortcut) {
					var keys = getShortcutKeys(shortcut);
					keys = keys.split("+").sort().join("+");
					var shortArr = shortcutMap[keys];
					if(!shortArr) {
						shortArr = [];
						shortcutMap[keys] = shortArr;
					}
					shortArr.push(shortcut);
				});
			});
			return new Hash(shortcutMap);
		}

		// NOTE: We don't need to explicitly call this function in
		//       order to initialize stuff, because the onHide() method
		//       calls it, and onHide() is called by createPopup().
		function addShortcutListeners() {
			getShortcutMap().getValues().each(function(shortcuts) {
				for(var i = 0; i < shortcuts.length; i++) {
					var shortcut = shortcuts[0];
					var keys = shortcut.keys;
					configuration.set('shortcuts.' + shortcut.description, keys);
					keys = getShortcutKeys(shortcut);
				}
			});
		}
		function highlightDuplicates() {
			//TODO - do something more clever to detect n & n+m
			getShortcutMap().getValues().each(function(shortcuts) {
				var duplicates = shortcuts.length > 1;
				for(var i = 0; i < shortcuts.length; i++) {
					var shortcut = shortcuts[i];
					shortcut.editor.setStyle('color', '');
					shortcut.editor.setStyle('border-color', '');
					if(getShortcutKeys(shortcut) !== '' && duplicates) {
						shortcut.editor.setStyle('color', 'red');
						shortcut.editor.setStyle('border-color', 'red');
					}
				}
			});
		}

		function isEditingShortcutField() {
			return helpPopup.isVisible() && document.activeElement == editingShortcutField;
		}
		function isNotEditingShortcutField() {
			return !isEditingShortcutField();
		}
		function onHide() {
			addShortcutListeners();
			window.removeEvent('contextmenu', isNotEditingShortcutField);
		}
		function onShow() {
			window.addEvent('contextmenu', isNotEditingShortcutField);
		}

		var helpPopup = tnoodle.tnt.createPopup(onShow, onHide);
		this.helpPopup = helpPopup;

		helpPopup.refresh = function() {
			helpPopup.empty();
			var shortcutsDiv = document.createElement('div');
			shortcutsDiv.setStyle("overflow", 'auto');
			helpPopup.overflow = function() {
				var size = helpPopup.getParent().getSize();
				shortcutsDiv.setStyle("height", size.y-40);
				shortcutsDiv.setStyle("margin-right", '');
			};
			helpPopup.reset = function() {
				//TODO - wow this is nasty
				shortcutsDiv.setStyle("height", '');
				shortcutsDiv.setStyle("width", '');
				shortcutsDiv.setStyle("margin-right", 21);
			};
			helpPopup.appendChild(shortcutsDiv);
			shortcuts.getKeys().each(function(category) {
				var categorySpan = document.createElement('span');
				categorySpan.appendText(category);
				categorySpan.setStyle('font-weight', 'bold');
				shortcutsDiv.appendChild(categorySpan);
				shortcuts[category].each(function(shortcut) {
					var shortcutDiv = document.createElement('div');
					shortcutDiv.setStyle('margin-left', 10);

					var label = document.createElement('label');
					label.setStyle('font-size', '12px');
					label.setStyle('float', 'left');
					//label.setStyle('margin-left', 10);
					label.setStyle('width', 200);
					label.appendText(shortcut.description + ':');
					shortcutDiv.appendChild(label);

					var textField = document.createElement('input');
					textField.setStyle('width', 60);
					textField.type = 'text';
					textField.value = getShortcutKeys(shortcut);
					textField.shortcut = shortcut;
					textField.addEvent('keydown', function(e) {
						if(e.key == 'esc') {
							// If we don't stop the event, then the popup will disappear
							e.stop();
							this.blur();
						}
					});
					textField.addEvent('click', function(e) {
						e.stop();
					});
					textField.addEvent('focus', function() {
						editingShortcutField = this;
					});
					shortcutDiv.appendChild(textField);
					shortcut.editor = textField;

					shortcutsDiv.appendChild(shortcutDiv);
				});
			});
			highlightDuplicates();
			var reset = document.createElement('input');
			reset.type = 'button';
			reset.value = 'Reset';
			reset.addEvent('click', function() {
				if(!confirm('This will reset all shortcuts! Are you sure you wish to continue?')) {
					return;
				}
				shortcuts.getValues().each(function(category) {
					category.each(function(shortcut) {
						shortcut.keys = shortcut['default'] || '';
					});
				});
				helpPopup.refresh();
			});
			helpPopup.appendChild(reset);
		};
	};

})();
