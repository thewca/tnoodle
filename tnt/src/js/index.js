window.addEvent('domready', function() {
	var server = new tnoodle.server();
	var configuration = server.configuration;
	
	function onPuzzlesLoaded(puzzles) {
		var puzzle = configuration.get('scramble.puzzle', '3x3x3');
		scrambleStuff.setSelectedPuzzle(puzzle);
	}
	var scrambleStuff = new ScrambleStuff(configuration, onPuzzlesLoaded);
	document.getElementById('puzzleChooser').appendChild(scrambleStuff.puzzleSelect);
	document.getElementById('scrambleArea').appendChild(scrambleStuff.scrambleArea);

	var timer = new KeyboardTimer($('timer'), server, scrambleStuff);
	var session = null;
	
	scrambleStuff.addPuzzleChangeListener(function(newPuzzle) {
		configuration.set('scramble.puzzle', newPuzzle);
		eventSelect.refresh();
	});

	function getEvents() {
		return server.getEvents(scrambleStuff.getSelectedPuzzle());
	}
	var eventSelect = tnoodle.tnt.createSelect();
	eventSelect.refresh = function() {
		var events = getEvents();
		var options = [];
		for(var i = 0; i < events.length; i++) {
			var txt = events[i];
			if(txt == '') {
				// If we left txt as an empty string, it would take up no space on our page
				txt = '&nbsp;';
			}
			options.push({ value: events[i], el: new Element('span', { html: txt }) });
		}
		options.push({ value: null, el: new Element('b', { text: 'Edit' }) });
		eventSelect.setOptions(options);

		var event = configuration.get('scramble.puzzle.event', '');
		if(events.indexOf(event) < 0) {
			event = events[0];
		}
		eventSelect.setSelected(event);
	};
	$('puzzleChooser').adopt(eventSelect);

	eventSelect.onchange = function(e) {
		var event = eventSelect.getSelected();
		if(event === null) {
			// We don't want to leave the "Edit" option selected
			eventSelect.setSelected(session.getEvent() || '');
			/*
			var editEventsPopup = tnoodle.tnt.createPopup(null, eventSelect.refresh);
			var onAdd = function(newItem) {
				server.createEvent(session.getPuzzle(), newItem);
			};
			var onRename = function(oldItem, newItem) {
				server.renameEvent(session.getPuzzle(), oldItem, newItem);
			};
			var onDelete = function(oldItem) {
				server.deleteEvent(session.getPuzzle(), oldItem);
			};
			editEventsPopup.appendChild(tnoodle.tnt.createEditableList(getEvents(), onAdd, onRename, onDelete));
			editEventsPopup.show();
			*/
			var newEvent = prompt("Enter name of new event (this will become a pretty gui someday, I promise!)");
			if(newEvent) {
				server.createEvent(session.getPuzzle(), newEvent);
				eventSelect.refresh();
			}
			return;
		}
		configuration.set('scramble.puzzle.event', event);
		sessionSelect.refresh();
	}; //for some reason, the change event doesn't fire until the select loses focus

	var sessionSelect = tnoodle.tnt.createSelect();
	$('puzzleChooser').adopt(sessionSelect);
	sessionSelect.refresh = function() {
		var puzzle = scrambleStuff.getSelectedPuzzle();
		var event = eventSelect.getSelected();

		var options = [];
		options.push({ value: null, el: new Element('b', { text: 'New session' }) });

		var sessions = server.getSessions(puzzle, event);
		sessions.reverse(); // We want to list our sessions starting with the most recent
		if(sessions.length === 0) {
			sessions.push(server.createSession(puzzle, event));
		}
		for(var i = 0; i < sessions.length; i++) {
			var date = sessions[i].getDate().format('%b %d, %Y %H:%M');
			var el = new Element('span', { text: date });
			options.push({ value: sessions[i], el: el });
		}
		sessionSelect.setOptions(options);
		session = sessions[0];
		sessionSelect.setSelected(session);
	};
	sessionSelect.onchange = function(e) {
		var session = sessionSelect.getSelected();
		if(session === null) {
			// New session will create & select a new session
			newSession();
			return;
		}
		timesTable.setSession(session);
		$('sessionComment').refresh();
	};
	$('sessionComment').refresh = function() {
		var comment = session.getComment();
		if(comment === null) {
			$('sessionComment').value = 'Enter comment here';
			$('sessionComment').setStyle('color', 'gray');
		} else {
			$('sessionComment').value = comment;
			$('sessionComment').setStyle('color', 'black');
		}
	};
	$('sessionComment').addEvent('focus', function() {
		if(this.getStyle('color') == 'gray') {
			this.value = '';
			this.setStyle('color', 'black');
		}
		setTimeout(this.select.bind(this), 0);
	});
	$('sessionComment').addEvent('keydown', function(e) {
		if(e.key == "enter" || e.key == "esc") {
			this.blur();
		}
	});
	$('sessionComment').addEvent('blur', function() {
		session.setComment($('sessionComment').value);
		$('sessionComment').refresh();
	});

	//we try to be clever and change the href only after the anchor has been clicked
	//this should save us the bother of generating the csv over and over again
	//TODO - this is probably getting called twice when clicking, due to the mousedown event, and then the click event
	function downloadCSV() {
		var keys = server.timeKeys;
		var data = server.timeKeyNames.join(',')+"\n";
		
		var times = session.times;
		for(var i = 0; i < session.times.length; i++) {
			var time = session.times[i];
			for(var j = 0; j < keys.length; j++) {
				var key = keys[j];
				var val = time.format(key);
				//we surround each value with double quotes and escape each double quote, just to be safe
				val = val === null ?
						'' :
						'"' + val.replace(/"/g, '""') + '"';
				data += val + ',';
			}
			data += "\n";
		}
		var uri = 'data:text/csv;charset=utf8,' + encodeURIComponent(data);
		this.href = uri;
	}
	function resetSession() {
		if(confirm("Are you sure you want to reset the session?")) {
			timesTable.reset();
		}
	}
	function deleteSession() {
		if(confirm("Are you sure you want to delete the session?")) {
			server.disposeSession(session);
			sessionSelect.refresh(); // This will cause the latest session to be selected
		}
	}
	function newSession() {
		var puzzle = scrambleStuff.getSelectedPuzzle();
		var event = eventSelect.getSelected();
		// We create a new session, and then refresh our list
		// Refreshing will cause the newest session to be selected
		server.createSession(puzzle, event);
		sessionSelect.refresh();
	}
	
	var timesTable = new TimesTable($('timesTable'), server, scrambleStuff);
	timer.addEvent('newTime', function(time) {
		//TODO - this may need to wait for the sessions to load...
		timesTable.addTime(time);
	});
	
	$('resetSession').addEvent('click', resetSession);
	$('deleteSession').addEvent('click', deleteSession);
	$('downloadCSV').addEvent('click', downloadCSV);
	$('downloadCSV').addEvent('mousedown', downloadCSV);

	$('timer').resize = function() {
		timer.redraw();
	};
	$('scrambles').resize = scrambleStuff.resize;
	$('times').resize = function() {
		var remainingHeight = $('times').getSize().y - $('timesArea').getStyle('border-top').toInt() - $('timesArea').getStyle('border-bottom').toInt();
		$('timesArea').setStyle('height', remainingHeight);
		
		timesTable.resize();
	};
	$('times').getPreferredWidth = function() {
		return timesTable.getPreferredWidth();
	};

	
	var triLayout = new TriLayout($('timer'), $('scrambles'), $('times'), configuration);
	timesTable.manager = triLayout;
	
	//TODO - yeah...
	aboutText = '<h2>TNoodle Timer (TNT) vFOOOBAR</h2><br/>' +
				'Created by Jeremy Fleischman from the ashes of CCT.<br/>' +
				'Thanks to Leyan Lo for ideas/couch';
	var aboutPopup = tnoodle.tnt.createPopup();
	aboutPopup.innerHTML = aboutText;
	$('aboutLink').addEvent('click', function() {
		aboutPopup.show();
	});

	$('helpLink').doClick = function() {
		helpPopup.refresh();
		helpPopup.show();
	};
	$('helpLink').addEvent('click', $('helpLink').doClick);
	
	// This subclass of Keyboard ensures that
	// shortcuts only work when we're not timing,
	// editing a text box, or doing something else
	// we care about.
	var BlockingKeyboard = new Class({
		Extends: Keyboard,
		handle: function(event, type) {
			//console.log(event + " " + type);
			if(!timer.timing && timer.isFocused()) {
				this.parent(event, type);
			}
		}
	});

	function resizeScrambleArea(delta) {
		var scrambleSpace = configuration.get('layout.sizerHeight');
		scrambleSpace += delta;
		configuration.set('layout.sizerHeight', scrambleSpace);
		triLayout.resize();
	}

	var keyboard = new BlockingKeyboard();
	var shortcuts = new Hash({
		'Times': [
			{
				description: 'Comment on last solve',
				'default': 'c',
				handler: timesTable.comment.bind(timesTable)
			},
			{
				description: 'Add time',
				'default': 'alt+a',
				handler: function(e) { e.stop(); timesTable.promptTime(); }
			},
			{
				description: 'No penalty',
				'default': 'i',
				handler: timesTable.penalize.bind(timesTable, null)
			},
			{
				description: '+2',
				'default': 'o',
				handler: timesTable.penalize.bind(timesTable, '+2')
			},
			{
				description: 'DNF',
				'default': 'p',
				handler: timesTable.penalize.bind(timesTable, 'DNF')
			},
			{
				description: 'Undo',
				'default': 'ctrl+z',
				handler: timesTable.undo.bind(timesTable)
			},
			{
				description: 'Redo',
				'default': 'ctrl+y',
				handler: timesTable.redo.bind(timesTable)
			}
		],
		'Sessions': [
			{
				description: 'Reset session',
				'default': 'r',
				handler: resetSession
			},
			{
				description: 'Delete session',
				'default': 'd',
				handler: deleteSession
			},
			{
				description: 'New session',
				'default': 'n',
				handler: newSession
			},
			{
				description: 'Comment on session',
				'default': 'shift+c',
				handler: function(e) {
					e.stop(); // Must stop the event, else a 'C' will show up in the box
					sessionComment.focus();
				}
			}
		],
		'Gui stuff': [
			{
				description: '+10px scramble area',
				'default': '=',
				handler: resizeScrambleArea.bind(null, 10)
			},
			{
				description: '-10px scramble area',
				'default': '-',
				handler: resizeScrambleArea.bind(null, -10)
			},
			{
				description: '+50px scramble area',
				'default': 'shift+=',
				handler: resizeScrambleArea.bind(null, 50)
			},
			{
				description: '-50px scramble area',
				'default': 'shift+-',
				handler: resizeScrambleArea.bind(null, -50)
			},
			{
				description: 'Toggle scramble view',
				'default': 's',
				handler: scrambleStuff.toggleScrambleView
			}
		],
		'Miscellaneous': [
			{
				description: 'Help',
				'default': 'shift+/',
				handler: $('helpLink').doClick
			},
			{
				description: 'Select puzzle',
				'default': 'q',
				handler: scrambleStuff.puzzleSelect.show
			},
			{
				description: 'Select event',
				'default': 'w',
				handler: eventSelect.show
			},
			{
				description: 'Select session',
				'default': 'e',
				handler: sessionSelect.show
			}
		]
		//TODO - / to search
	});

	shortcuts.getValues().each(function(category) {
		category.each(function(shortcut) {
			var keys = configuration.get('shortcuts.' + shortcut.description, null);
			shortcut.keys = keys;
			//TODO - check for duplicates
		});
	});

	// NOTE: We don't need to explicitly call this function in
	//       order to initialize stuff, because the onHide() method
	//       calls it, and onHide() is called by createPopup().
	function refreshShortcuts() {
		//TODO - check for duplicates
		keyboard.removeEvents();
		shortcuts.getValues().each(function(category) {
			category.each(function(shortcut) {
				var keys = shortcut.keys || null;
				configuration.set('shortcuts.' + shortcut.description, keys);
				keys = keys || shortcut['default'];
				if(keys) {
					keyboard.addEvent(keys, shortcut.handler);
				}
			});
		});
	}
	function onHide() {
		shortcuts.getValues().each(function(category) {
			category.each(function(shortcut) {
				if(shortcut.editor) {
					shortcut.keys = shortcut.editor.value;
				}
			});
		});
		refreshShortcuts();
	}
	var helpPopup = tnoodle.tnt.createPopup(null, onHide);
	helpPopup.refresh = function() {
		helpPopup.empty();
		shortcutsDiv = document.createElement('div');
		shortcutsDiv.setStyle("overflow", 'auto');
		helpPopup.overflow = function() {
			var size = helpPopup.getParent().getSize();
			console.log(size.y);
			shortcutsDiv.setStyle("height", size.y-40);
			shortcutsDiv.setStyle("margin-right", '');
		};
		helpPopup.reset = function() {
			//TODO - wow this is nasty
			shortcutsDiv.setStyle("height", '');
			shortcutsDiv.setStyle("width", '');
			shortcutsDiv.setStyle("margin-right", 20);
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
				textField.setStyle('width', 50);
				textField.type = 'text';
				textField.value = shortcut.keys || shortcut['default'];
				textField.shortcut = shortcut;
				textField.addEvent('keydown', function(e) {
					if(e.key == 'esc') {
						// If we don't stop the event, then the popup will disappear
						e.stop();
						this.blur();
					}
				});
				textField.addEvent('change', function() {
					//TODO - check for duplicates
				});
				shortcutDiv.appendChild(textField);
				shortcut.editor = textField;

				shortcutsDiv.appendChild(shortcutDiv);
			});
		});
		var reset = document.createElement('input');
		reset.type = 'button';
		reset.value = 'Reset';
		reset.addEvent('click', function() {
			if(!confirm('This will reset all shortcuts! Are you sure you wish to continue?')) {
				return;
			}
			shortcuts.getValues().each(function(category) {
				category.each(function(shortcut) {
					shortcut.keys = shortcut['default'];
				});
			});
			helpPopup.refresh();
		});
		helpPopup.appendChild(reset);
	};
});
