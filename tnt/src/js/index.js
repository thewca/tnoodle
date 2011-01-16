window.addEvent('domready', function() {
	var server = new tnoodle.server();
	var configuration = server.configuration;
	

	//we have to wait for both the scrambles and the sessions to load,
	//and we can't know which will load first, so we use lastSessionTab and scramblesLoades
	//to keep track
	//This above comment doesn't make much sense,
	//is scramblesLoaded even being read anywhere?
	var lastSessionTab = null;
	var scramblesLoaded = false;
	function onPuzzlesLoaded(puzzles) {
		scramblesLoaded = true;
		if(session) {
			scrambleStuff.setSelectedPuzzle(session.getPuzzle());
		}
	}
	var scrambleStuff = new ScrambleStuff(configuration, onPuzzlesLoaded);
	document.getElementById('puzzleChooser').appendChild(scrambleStuff.puzzleSelect);
	document.getElementById('scrambleArea').appendChild(scrambleStuff.scrambleArea);

	var timer = new KeyboardTimer($('timer'), server, scrambleStuff);
	
	function getCustomizations() {
		return server.getCustomizations(session.getPuzzle());
	}
	var customizationSelect = new Element('select');
	customizationSelect.refresh = function() {
		var customizations = getCustomizations();
		customizationSelect.options.length = customizations.length;
		for(var i = 0; i < customizations.length; i++) {
			customizationSelect.options[i] = new Option(customizations[i], customizations[i]);
		}
		var editOption = new Option('Edit', null);
		editOption.setStyle('background-color', 'white');
		customizationSelect.options[customizationSelect.options.length] = editOption;

		customizationSelect.value = session.getCustomization();
	};
	$('puzzleChooser').adopt(customizationSelect);

	customizationSelect.onchange = function(e) {
		if(customizationSelect.value === "null") {
			// We don't want to leave the "Edit" option selected
			customizationSelect.value = session.getCustomization();

			var editCustomsPopup = tnoodle.tnt.createPopup(null, customizationSelect.refresh);
			var onAdd = function(newItem) {
				server.createCustomization(session.getPuzzle(), newItem);
			};
			var onRename = function(oldItem, newItem) {
				server.renameCustomization(session.getPuzzle(), oldItem, newItem);
			};
			var onDelete = function(oldItem) {
				server.deleteCustomization(session.getPuzzle(), oldItem);
			};
			editCustomsPopup.appendChild(tnoodle.tnt.createEditableList(getCustomizations(), onAdd, onRename, onDelete));
			editCustomsPopup.show();						
			/*var newCustomization = prompt("Enter name of new customization (this will become a pretty gui someday, I promise!)");
			console.log(server.getCustomizations(session.getPuzzle()));
			if(newCustomization) {
				server.createCustomization(session.getPuzzle(), newCustomization);
				customizationSelect.refresh();
			}*/
			return;
		}
		session.setCustomization(customizationSelect.value);
		refreshSessionInfo();
	}; //for some reason, the change event doesn't fire until the select loses focus
	scrambleStuff.addPuzzleChangeListener(function(newPuzzle) {
		if(session.getPuzzle() == newPuzzle) {
			return;
		}
		
		session.setPuzzle(newPuzzle);
		customizationSelect.refresh();
		session.setCustomization(customizationSelect.value);
		refreshSessionInfo();
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
	function refreshSessionInfo() {
		if(!session) { return; }//gotta wait for stuff to load
		$('sessionInfo').empty();
		$('sessionInfo').appendText(session.getDate().format("%x"));

		// This will update the puzzle icon
		lastSessionTab.refreshTitle();
		//$('sessionInfo').appendText("Started " + tnoodle.tnt.ago(session.getDate()) + " ago");
		//$$('#sessions li').each(function(el, i) {
			//console.log(i);
			//console.log(el);
		//});
	}
	
	var session = null;
	var timesTable = new TimesTable($('timesTable'), server, scrambleStuff);
	timer.addEvent('newTime', function(time) {
		timesTable.addTime(time);
	});
	function sessionClicked(e) {
		lastSessionTab = this;
		var newSession = this.session;
		if(newSession === session) {
			return;
		}
		session = newSession;
		$$('#sessions .active').each(function(el) {
			el.removeClass('active');
			el.refreshTitle();
		});

		this.addClass('active');
		this.refreshTitle();

		refreshSessionInfo();
		timesTable.setSession(session);
		scrambleStuff.setSelectedPuzzle(session.getPuzzle());
		customizationSelect.refresh();
		refreshTabs();
	}
	// Returns true iff el1 completely contains el2
	// This "containing" need not be strict, that is, el1 contains el1.
	function contains(el1, el2) {
		var p1 = el1.getPosition();
		var p2 = el2.getPosition();
		var s1 = el1.getSize();
		var s2 = el2.getSize();
		return p2.x >= p1.x && p2.y >= p1.y && p2.x+s2.x <= p1.x+s1.x && p2.y+s2.y <= p1.y+s1.y;
	}
	function refreshTabs() {
		$('sessions').getChildren().each(function(li) {
			li.setStyle('width', '');
		});

		if(!contains($('sessions'), ($('newSession')))) {
			// The newSession tab doesn't fit, so we shrink everything
			$('sessions').getChildren().each(function(li) {
				if(li == $('newSession')) {
					return;
				}
				if(!li.hasClass('active')) {
					li.setStyle('width', 1);
				}
			});
		}
	}
	function closeSession(e) {
		e.stop(); //prevent the tab from activating
		var deletedSession = this.session;
		
		var newTab = lastSessionTab.nextSibling; //try the tab to the right
		if(!newTab.session) {
			newTab = lastSessionTab.previousSibling; //try the tab to the left
			if(!newTab.session) {
				if(confirm("You can't delete the last session! If you click ok, I will reset it.")) {
					timesTable.reset();
				}
				return;
			}
		}
		if(deletedSession.times.length > 0 && !confirm("Are you sure you want to delete session " + deletedSession.id + "?")) {
			return;
		}
		server.disposeSession(deletedSession);
		this.tab.dispose();
		if(deletedSession == session) {
			//deleting the current session, so we select the next one to the left
			sessionClicked.call(newTab);			
		}
		refreshTabs();
	}
	function createSessionTab(session) {
		var tab = new Element('li');
		var titleSpan = new Element('span');
		tab.adopt(titleSpan);
		tab.refreshTitle = function() {
			titleSpan.empty();
			titleSpan.setStyle('cursor', '');
			if(tab.hasClass('active')) {
				titleSpan.setStyle('cursor', 'pointer');
			}
			var title = session.comment || session.id;
			var MAX_TITLE = 15;
			if(title.length > MAX_TITLE) {
				title = title.substring(0, MAX_TITLE-3) + '...';
			}
			var puzzleIcon = new Element('img', { src: scrambleStuff.scrambler.getPuzzleIconUrl(session.getPuzzle()) });
			puzzleIcon.setStyles({ 'vertical-align': 'bottom', 'margin-right': '2px' });
			titleSpan.adopt(puzzleIcon);

			titleSpan.adopt(document.createTextNode(title));
		};
		tab.refreshTitle();
		titleSpan.addEvent('click', function() {
			if(!tab.hasClass('active')) {
				return;
			}
			var comment = prompt("Enter comment for session", session.comment);
			if(comment !== null) {
				session.comment = comment;
			}
			tab.refreshTitle();
		});
		tab.addEvent('mouseover', function() {
			tab.title = session.toString() + " session started " + tnoodle.tnt.ago(session.getDate()) + " ago";
			if(session.comment) {
				tab.title += "\n" + session.comment;
			}
		});
		tab.addEvent('click', sessionClicked);
		tab.session = session;

		var close = new Element('span', { 'html': 'X', 'class': 'delete' });
		close.session = session;
		close.tab = tab;
		close.inject(tab, 'bottom'); 
		close.addEvent('click', closeSession);
		refreshTabs();
		return tab;
	}
	
	$('newSession').addEvent('click', function(e) {
		var newSession = server.createSession(session.getPuzzle(), session.getCustomization());
		if(!newSession) { //couldn't create session, for whatever reason
			return;
		}

		var tab = createSessionTab(newSession);
		tab.inject($('newSession'), 'before');
		sessionClicked.call(tab, null);
	});
	
	$('resetSession').addEvent('click', resetSession);
	$('downloadCSV').addEvent('click', downloadCSV);
	$('downloadCSV').addEvent('mousedown', downloadCSV);

	//TODO - do something if sessions is empty!
	server.sessions.each(function(sesh, index, ids) {
		var sessionTab = createSessionTab(sesh);
		sessionTab.inject($('newSession'), 'before');
		if(index == ids.length - 1) {
			//we set the current session to the most recent session
			lastSessionTab = sessionTab;
			sessionClicked.call(lastSessionTab);
		}
	});

	$('timer').resize = function() {
		timer.redraw();
	};
	$('scrambles').resize = scrambleStuff.resize;
	$('times').resize = function() {
		//this seems like as good a time as any to update the session info bar
		refreshSessionInfo();
		
		var remainingHeight = $('times').getSize().y - $('sessions').getSize().y - $('timesArea').getStyle('border-top').toInt() - $('timesArea').getStyle('border-bottom').toInt();
		$('timesArea').setStyle('height', remainingHeight);
		
		timesTable.resize();
		refreshTabs();
	};
	$('times').getPreferredWidth = function() {
		return timesTable.getPreferredWidth();
	};
	
	var triLayout = new TriLayout($('timer'), $('scrambles'), $('times'), configuration);
	timesTable.manager = triLayout;
	
	//TODO - yeah...
	$('helpLink').addEvent('click', function() {
		var popup = tnoodle.tnt.createPopup();
		popup.show();
	});
	
	var keyboard = new Keyboard();
	/*keyboard.addShortcut('save', {
	    'keys': 'ctrl+s',
	    'description': 'Save the current document',
	    'handler': function(e) { e.stop(); }
	});*/
	keyboard.addShortcut('add time', {
		'keys': 'alt+a',
		'description': 'Add time',
		'handler': function(e) { e.stop(); timesTable.promptTime(); }
	});
	keyboard.addShortcut('reset', {
		'keys': 'alt+r',
		'description': 'Reset session',
		'handler': resetSession
	});
	keyboard.addShortcut('undo', {
		'keys': 'ctrl+z',
		'description': 'Undo',
		'handler': timesTable.undo.bind(timesTable)
	});
	keyboard.addShortcut('redo', {
		'keys': 'ctrl+y',
		'description': 'Redo',
		'handler': timesTable.redo.bind(timesTable)
	});
});
