/*
 * Mark 2 Javascript Code
 *
 * Lucas Garron, November/December 2011
 *
 */
"use strict";
mark2.controller = (function() {
		
	/*
	 * Configuration Section
	 */

	var version = "January 07, 2012";

	var settings;

	var workerMap = {};

	// alg.garron.us puzzle ID mapping.
	var eventIDToAlgPuzzleID = {
		"333": "3x3x3",
		"444": "4x4x4",
		"555": "5x5x5",
		"222": "2x2x2",
		"333bf": "3x3x3",
		"333oh": "3x3x3",
		"333fm": "3x3x3",
		"333ft": "3x3x3",
		"333mbf": "3x3x3",
		"666": "6x6x6",
		"777": "7x7x7",
		"444bf": "4x4x4",
		"555bf": "5x5x5"
	}



	/*
	 * Mark 2 Initialization
	 */

	var initialize = function(settingsIn) {

		settings = settingsIn;

		initializeRandomSource();
		initializeWorkers();
	};



	/*
	 * Scramble Sets
	 */

	var totalNumScrambles;
	var numScramblesDone;

    var getScrambleSetsJSON = function() {

    	var rounds = mark2.ui.getRoundsJSON();
    	var scrambleSets = [];

		for (var i = 0; i < rounds.length; i++) {

			var eventID = rounds[i][0];
			var roundName = rounds[i][1];
			var numGroups = rounds[i][2];
			var numSolves = rounds[i][3];

			for (var j = 1; j <= numGroups; j++) {
				var groupString = ((numGroups === 1) ? ("") : ("<br>Group " + intToLetters(j)));
				scrambleSets.push([eventID, roundName + groupString, numSolves]); // TODO Find a better way to handle multi-line round names.
			}
		}

		return scrambleSets;
    }

	var markScrambleStarting = function(scrambleID, eventID, num) {
					
		var scrambleTD = document.getElementById(scrambleID + "_scramble");
		scrambleTD.innerHTML = "Generating scramble #" + num + "...";
		mark2.dom.removeClass(scrambleTD, "loading_scrambler");
		mark2.dom.addClass(scrambleTD, "loading_scramble");
	}

	var markScramblerInitializing = function(scrambleID, eventID, num) {
					
		var scrambleTD = document.getElementById(scrambleID + "_scramble");
		scrambleTD.innerHTML = "Initializing scrambler...";
		mark2.dom.addClass(scrambleTD, "loading_scrambler");
	}

	var algGarronUSLink = function(eventID, scramble) {

		var puzzleID = eventIDToAlgPuzzleID[eventID];

		if (typeof puzzleID === "undefined") {
			return scramble;
		}

		return "<a href=\"http://alg.garron.us/?ini=" + encodeURIComponent(scramble) + "&cube=" + puzzleID + "&name=" + encodeURIComponent(settings.events[eventID].name + " Scramble") + "&notation=WCA\" target=\"_blank\" class=\"scramble_link\">" + scramble + "</a>";
	}

	var scrambleLink = function(eventID, scramble) {
		// Specific to alg.garron.us right now.
		return algGarronUSLink(eventID, scramble);
	}

	var insertScramble = function(scrambleID, eventID, num, scramble, state) {

		numScramblesDone++;
		updateProgress();
		var numScramblesRemaining = totalNumScrambles - numScramblesDone;

		var stillRemainingString = " " + numScramblesRemaining + " scramble" + (numScramblesRemaining === 1 ? "" : "s") + " still remaining overall."
		addUpdateSpecific("Generated " + eventID + " scramble #" + num + " for some round." + stillRemainingString);

		if (numScramblesRemaining === 0) {
			showProgressDone();
			addUpdateGeneral("Done generating all scrambles for all rounds.");
		}
					
		var scrambleTD = document.getElementById(scrambleID + "_scramble");
		mark2.dom.removeClass(scrambleTD, "loading_scramble");
		var scrambleHTML = scrambleLink(eventID, scramble);
		scrambleTD.innerHTML = scrambleHTML;

		var drawingTD = document.getElementById(scrambleID + "_drawing");
		drawingTD.innerHTML = "";
		drawingTD.width = settings.events[eventID].drawing_dimensions.w; // Sadly, this is more robust than setProperty(...).
		var drawingWidth = settings.events[eventID].drawing_dimensions.w;
		var drawingHeight = settings.events[eventID].drawing_dimensions.h;
		scramblers[eventID].drawScramble(drawingTD, state, drawingWidth, drawingHeight);

	}

	var generateScrambleSet = function(continuation, competitionName, tBody, eventID, scrambler, num, numTotal, options) {
		
		var scrambleTR = mark2.dom.appendElement(tBody, "tr");

		var scramblesInThisRow = Math.min(settings.events[eventID].scrambles_per_row, numTotal - num + 1);

		for (var i = 0; i < scramblesInThisRow; i++) {

			var scrambleID = mark2.dom.nextAutoID();
		
			mark2.dom.appendElement(scrambleTR, "td", "number number_" + eventID, scrambleID + "_number", "" + (num + i) + ".");
			mark2.dom.appendElement(scrambleTR, "td", "scramble scramble_" + eventID, scrambleID + "_scramble",  "[Space for Scramble #" + (num + i) + "]");
			var drawingTD = mark2.dom.appendElement(scrambleTR, "td", "drawing drawing_" + eventID, scrambleID + "_drawing", "[Space for Drawing]");
			drawingTD.width = settings.events[eventID].drawing_dimensions.w;
			drawingTD.height = settings.events[eventID].drawing_dimensions.h;

			if (webWorkersRunning) {

				workerMap[eventID].postMessage({
					action: "get_random_scramble",
					event_id: eventID,
					return_data: {
						scramble_id: scrambleID,
						num: (num + i)
					}
				});
			}
			else {
				var scramble = scrambler.getRandomScramble();
				insertScramble(scrambleID, eventID, num, scramble.scramble_string, scramble.state);
			}
		}

		var call;
		if (num < numTotal) {
			call = generateScrambleSet.bind(null, continuation, competitionName, tBody, eventID, scrambler, num + scramblesInThisRow, numTotal, options);
		}
		else {
			call = continuation;
		}
		setTimeout(call, 0);
	}

	var addScrambleSet = function(continuation, competitionName, eventID, roundName, numScrambles) {

		var scrambleSets = document.getElementById("scramble_sets");

		if (!settings.events[eventID]) {
			mark2.dom.appendElement(scrambleSets, "div", "unupported", null, "Sorry, but \"" + eventID + "\" scrambles are not currently supported.");
			return;
		}

		var scrambler = scramblers[eventID];

		// Create a new scramble set.
		
		var newScrambleSet = mark2.dom.appendElement(scrambleSets, "div", "scramble_set");
		mark2.dom.hideElement(newScrambleSet);

			// Header Table

			var newInfoTable = mark2.dom.appendElement(newScrambleSet, "table", "info_table");
				var newInfoTHead = mark2.dom.appendElement(newInfoTable, "thead");
					var newInfoTR = mark2.dom.appendElement(newInfoTHead, "tr");
						
						mark2.dom.appendElement(newInfoTR, "td", "puzzle_name", null, settings.events[eventID].name);
						mark2.dom.appendElement(newInfoTR, "td", "competition_name", null, competitionName);
						mark2.dom.appendElement(newInfoTR, "td", "round_name", null, roundName);

			// Scrambles Table

			var newScramblesTable = mark2.dom.appendElement(newScrambleSet, "table", "scramble_table");
				var newScramblesTBody = mark2.dom.appendElement(newScramblesTable, "tbody");
					
			// Footer Table

			var newFooterTable = mark2.dom.appendElement(newScrambleSet, "table", "footer_table");
				var newFooterTHead = mark2.dom.appendElement(newFooterTable, "thead");
					var newFooterTR = mark2.dom.appendElement(newFooterTHead, "tr");

						mark2.dom.appendElement(newFooterTR, "td", null, null, '<u>Scrambles generated at:</u><br>' + (new Date().toString()));
						mark2.dom.appendElement(newFooterTR, "td", null, null, '<div style="text-align: right;"><u>' + settings.events[eventID].name + ' Scrambler Version</u><br>' + scrambler.version + '</div>');
						mark2.dom.appendElement(newFooterTR, "td", null, null, '<img src="' + mark2.settings.assets_root + 'img/wca_logo.svg" class="wca_logo">');
		
		// Generate those scrambles!
		
		addUpdateGeneral("Generating " + numScrambles + " scramble" + ((numScrambles === 1) ? "" : "s") + " for " + settings.events[eventID].name + ": " + roundName + "");
		resetUpdatesSpecific("Details for " + settings.events[eventID].name + ": " + roundName);
		
		var delayedDOMUpdateContinuation = function() {
			mark2.dom.showElement(newScrambleSet);
			continuation();	
		};

		var nextContinuation = generateScrambleSet.bind(null, delayedDOMUpdateContinuation, competitionName, newScramblesTBody, eventID, scrambler, 1, numScrambles, {});
		var call;
		if (!webWorkersRunning && !settings.events[eventID].initialized) {
		    addUpdateSpecific("Initializing " + settings.events[eventID].name + " scrambler (only needs to be done once).");

		    var statusCallback = function(str) {
		    	addUpdateSpecific(str);

		    }

			call = scrambler.initialize.bind(null, nextContinuation, randomSource, statusCallback);
			settings.events[eventID].initialized = true;
		}
		else {

			if (webWorkersRunning) {
			}
			else if (settings.events[eventID].initialized) {
		    	addUpdateSpecific("" + settings.events[eventID].name + " scrambler already initialized.");
			}
			call = nextContinuation;
		}
		setTimeout(call, 0);
	};

	var generateScrambleSets = function(callback, competitionName, rounds) {

		var nextContinuation;
		if (rounds.length > 1) {
			nextContinuation = generateScrambleSets.bind(null, callback, competitionName, rounds.slice(1));
		}
		else {
			nextContinuation = function(){

				if (webWorkersRunning) {
					addUpdateGeneral("Done creating all rounds. " + (totalNumScrambles - numScramblesDone) + " scrambles still need to be filled in.");
				}
				else {
					addUpdateGeneral("Done creating all rounds.");
				}

				setTimeout(callback, 0);
			};
		}

		addScrambleSet(nextContinuation, competitionName, rounds[0][0], rounds[0][1], rounds[0][2]);
	}

    // Converts 1, 2, ... to A, B, ..., Z, AA, AB, ..., ZZ, AAA, AAB, ...
    // A bit complicated right now, but should work fine.
	function intToLetters(int) {

      var numDigits;
      var maxForDigits = 1;
      var numWithThisManyDigits = 1;
    
      for (numDigits = 0; maxForDigits <= int; numDigits++) {
        numWithThisManyDigits *= 26;
        maxForDigits += numWithThisManyDigits;
      }
    
      var adjustedInt = int - (maxForDigits - numWithThisManyDigits);
    
      var out = "";
      for (var i = 0; i < numDigits; i++) {
        out = String.fromCharCode(65 + (adjustedInt % 26)) + out;
        adjustedInt = Math.floor(adjustedInt / 26);
      }
      return out;
    };

    var getCompetitionNameAndSetPageTitle = function() {
    	var competitionName = document.getElementById('competitionName').value;

		if (competitionName === "") {
			document.title = "Scrambles from Mark 2";
			competitionName = "Mark 2";
		}
		else {
			document.title = "Scrambles for " + competitionName;
		}

		return competitionName;
    }

    var countScrambles = function(scrambleSets) {
    	var total = 0;

    	for (var i=0; i < scrambleSets.length; i++) {
    		total += scrambleSets[i][2];
    	}

    	return total;
    }

	var go = function() {

		mark2.ui.updateHash();
		resetUpdatesGeneral();
		hideInterface();

		var competitionName = getCompetitionNameAndSetPageTitle();
		var scrambleSets = getScrambleSetsJSON();
		
		totalNumScrambles = countScrambles(scrambleSets);
		numScramblesDone = 0;
		updateProgress();
		showUpdates();
		showProgressMessage("Generating " + totalNumScrambles + " scrambles...");

		if (scrambleSets.length === 0) {
			addUpdateGeneral("Nothing to do, because there are no rounds to scramble.");
			return;
		}

		addUpdateGeneral("Generating " + scrambleSets.length + " round" + ((scrambleSets.length === 1) ? "" : "s") + " of scrambles.");

		var continuation = function() {
			addUpdateGeneral("Done with synchronous calls.");
		}

		generateScrambleSets(continuation, competitionName, scrambleSets);
	};



	/*
	 * Random Number Generation
	 */

	var randomSource = undefined;

	var initializeRandomSource = function() {
		
		var numEntropyValuesPerSource = 32;
		var entropy = [];

		// Get some pseudo-random numbers for entropy.
		for (var i = 0; i < numEntropyValuesPerSource; i++) {
			entropy.push(Math.floor(Math.random()*0xffffffff));
		}

		// Get some even better pseudo-random numbers for entropy if we can.
		try {
			var cryptoEntropy = new Uint8Array(numEntropyValuesPerSource);

			window.crypto.getRandomValues(cryptoEntropy);
			
			// Uint8Array doesn't haave a .map(...) method.
			for (var i = 0; i < numEntropyValuesPerSource; i++) {
				entropy.push(cryptoEntropy[i]);
			}

			console.log("Successfully used crypto for additional randomness.");	
		}
		catch (e) {
			console.log("Unable to use crpyto for additional randomness (that's okay, though).", e);
		}

		// We use the date to get the main entropy.
		var seed = new Date().getTime();
		

		// Make sure we don't accidentally use deterministic initialization.
		if (isFinite(seed)) {
			randomSource = new MersenneTwisterObject(seed, entropy);
			console.log("Seeded Mersenne Twister.");
			Math.random = undefined; // So we won't use it by accident.

		}
		else {
			randomSource = Math;
  			console.log("WARNING: Seeding Mersenne Twister did not work. Falling back to Math.random().");
  		}
	}

	// For seeding the workers.
	var getRandomSeed = function() {
		return (new Date().getTime() + Math.floor(randomSource.random()*0xffffffff));
	}



	/*
	 * Displaying Progress Updates
	 */

	var showInterface = function() {
		var interfaceElements = document.getElementsByClassName("interface");
		for (var i=0; i < interfaceElements.length; i++) {
			mark2.dom.hideElement(interfaceElements[i]);
		}
	}

	var hideInterface = function() {
		var interfaceElements = document.getElementsByClassName("interface");
		for (var i=0; i < interfaceElements.length; i++) {
			mark2.dom.hideElement(interfaceElements[i]);
		}
	}

	var currentTime = function() {
		return (new Date()).getTime();
	}

	var updatesGeneralStartTime;
	var updatesGeneralLastTime;
	var resetUpdatesGeneral = function() {
		updatesGeneralLastTime = updatesGeneralStartTime = currentTime();
	}

	var updatesSpecificStartTime;
	var updatesSpecificLastTime;
	var resetUpdatesSpecific = function(str) {
		updatesSpecificLastTime = updatesSpecificStartTime = currentTime();
	}

	var addUpdateGeneral = function(str) {

		console.log(str);
		var updatesGeneralDiv = document.getElementById("updates_general");

	}

	var addUpdateSpecific = function(str) {

		console.log(str);
		var updatesSpecificDiv = document.getElementById("updates_specific");

	}

	var showUpdates = function() {
		var updatesPanel = document.getElementById("updates");
		mark2.dom.showElement(updatesPanel);
	}

	var updateProgress = function(fraction) {

		mark2.dom.addClass(document.body, "busy");

		var progressBar = document.getElementById("progress_bar");

		progressBar.setAttribute("value", numScramblesDone / totalNumScrambles);
		progressBar.innerHTML = "" + numScramblesDone + "/" + totalNumScrambles + " scrambles done.";
	}

	var showProgressMessage = function(message) {
		var doneMessageDiv = document.getElementById("progress_message");
		doneMessageDiv.innerHTML = "" + message;
	}

	var showProgressDone = function() {

		showProgressMessage("Done generating " + totalNumScrambles + " scrambles.");
		mark2.dom.removeClass(document.body, "busy");
		mark2.dom.addClass(document.body, "done");
	}


	/*
	 * Web Workers
	 */

	var webWorkersRunning = false;
	var workers = {};

	var initializeWorkers = function() {
		
		// From http://www.html5rocks.com/en/tutorials/workers/basics/#toc-inlineworkers

		if (typeof Worker === "undefined") {
			console.log("No web worker support. :-(");
			return;
		}

		try {

			for (var i =0; i < settings.worker_groups.length; i++) {

				var worker = new Worker(settings.web_worker_file);
				var scramblerFiles = {};

				for (var j = 0; j < settings.worker_groups[i].event_ids.length; j++) {
					workerMap[settings.worker_groups[i].event_ids[j]] = worker;
					scramblerFiles[settings.worker_groups[i].event_ids[j]] = "../scramblers/" + settings.events[settings.worker_groups[i].event_ids[j]].scrambler_file;
				}
				worker.onmessage = handleWorkerMessage;

				workers[i] = worker;

				worker.postMessage({action: "initialize", worker_id: i, event_ids: settings.worker_groups[i].event_ids, auto_ini: settings.worker_groups[i].auto_ini, scrambler_files: scramblerFiles, random_seed: getRandomSeed()});
			}

			webWorkersRunning = true;

		}
		catch (e) {
			console.log("Starting the web workers failed; Mark 2 will fall back to continuations. (This happens with Chrome when run from file://)", e);
		}

	}

	var terminateWebWorkers = function() {
		for (var i = 0; i < workers.length; i++) {
			workers[i].terminate();
		}
		workers = {};
		console.log("Terminated all web workers.")
	}

	var restartWebWorkers = function() {
		terminateWebWorkers();
		initializeWorkers();
	}

	var handleWorkerMessage = function(e) {
		switch(e.data.action) {
			case "initialized":
				console.log("Web worker initialized successfully: " + e.data.info);
			break;

			case "get_random_scramble_starting":
				markScrambleStarting(
					e.data.return_data.scramble_id,
					e.data.event_id,
					e.data.return_data.num
				);
			break;

			case "console_log":
				console.log("[Web worker log]", e.data.data);
			break;

			case "console_error":
				console.log("[Web worker error]", e.data.data);
			break;

			case "message_exception":
				console.error("[Web worker exception]", e.data.data);
			break;

			case "get_random_scramble_initializing_scrambler":
				markScramblerInitializing(
					e.data.return_data.scramble_id,
					e.data.event_id,
					e.data.return_data.num
				);
			break;

			case "get_random_scramble_response":
				//console.log("Received a " + settings.events[e.data.event_id].name +	 " scramble: " + e.data.scramble.scramble_string);
				insertScramble(
					e.data.return_data.scramble_id,
					e.data.event_id,
					e.data.return_data.num,
					e.data.scramble.scramble_string,
					e.data.scramble.state
				);
			break;

			case "echo_response":
				console.log("Echo response:");
				console.log(e.data);
			break;

			default:
				console.error("Unknown message. Action was: " + e.data.action);
			break;
		}
	}



	/*
	 * Keybindings for Debugging
	 */

	var printKeyCodes = false;

	document.onkeydown = function(e) {

		if (printKeyCodes) {
			console.log("Key pressed: " + e.keyCode);
		}

		if (e.ctrlKey) {
		 	switch (e.keyCode) {

				case 66: // "B" for ">B<enchmark". (And "A>b<out?)
					mark2.dom.showElement(document.getElementById("about"));
					return true;
					break;

				case 75: // "K" for "Show >K<eycodes"
					printKeyCodes = true;
					break;

				case 82: // "R" for ">R<efresh and >R<eset"
					// Currently buggy because of loose coupling with events table.
					resetRounds();
					addRounds(defaultRounds);
					updateHash();
					break;
			}
		}
	};



	/*
	 * Public Interface
	 */

	return {
		version: version,
		initialize: initialize,
		go: go
	};
})();
