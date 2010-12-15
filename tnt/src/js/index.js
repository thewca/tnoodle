window.addEvent('domready', function() {
	var server = new tnoodle.server();
	var configuration = server.configuration;
	

	//we have to wait for both the scrambles and the sessions to load,
	//and we can't know which will load first, so we use lastSessionTab and scramblesLoades
	//to keep track
	var lastSessionTab = null;
	var scramblesLoaded = false;
	function onPuzzlesLoaded(puzzles) {
		scramblesLoaded = true;
		if(session) {
			scrambleStuff.setSelectedPuzzle(session.getPuzzle());
		}
	}
	scrambleStuff = new ScrambleStuff(configuration, onPuzzlesLoaded);
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
			function onAdd(newItem) {
				server.createCustomization(session.getPuzzle(), newItem);
			}
			function onRename(oldItem, newItem) {
				server.renameCustomization(session.getPuzzle(), oldItem, newItem);
			}
			function onDelete(oldItem) {
				server.deleteCustomization(session.getPuzzle(), oldItem);
			}
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
	function ago(date) {
		var today = new Date();
		var i, agostr;
		var resolutions = [ 'year', 'month', 'day', 'hour', 'minute' ];
		for(i = 0; i < resolutions.length; i++) {
			agostr = date.diff(today, resolutions[i]);
			a = date; b = today;
			if(agostr > 0) {
				break;
			}
		}
		agostr = (i < resolutions.length) ? 
				agostr + " " + resolutions[i] + "(s)" :
				"seconds";
		return agostr;
	}
	function refreshSessionInfo() {
		if(!session) { return; }//gotta wait for stuff to load
		$('sessionInfo').empty();
		$('sessionInfo').appendText("Started " + ago(session.getDate()) + " ago");
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
			el.getChildren()[0].empty();
		});
		this.addClass('active');
		this.getChildren()[0].adopt(document.createTextNode(session.id));

		refreshSessionInfo();
		timesTable.setSession(session);
		scrambleStuff.setSelectedPuzzle(session.getPuzzle());
		customizationSelect.refresh();
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
	}
	function createSessionTab(session) {
		//TODO - puzzle icon
		var tab = new Element('li');
		tab.adopt(new Element('span'));
		tab.addEvent('mouseover', function() {
			tab.title = session.toString() + " session started " + ago(session.getDate()) + " ago";
		});
		tab.addEvent('click', sessionClicked);
		tab.session = session;

		var close = new Element('span', { 'html': 'X', 'class': 'delete' });
		close.session = session;
		close.tab = tab;
		close.inject(tab, 'bottom'); 
		close.addEvent('click', closeSession);
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
	};
	$('times').getPreferredWidth = function() {
		return timesTable.getPreferredWidth();
	};
	
	var triLayout = new TriLayout($('timer'), $('scrambles'), $('times'), configuration);
	timesTable.manager = triLayout;
	
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
