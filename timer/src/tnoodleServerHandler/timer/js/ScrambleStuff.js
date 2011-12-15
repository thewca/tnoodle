//generated from http://ajaxload.info/
var WAITING_ICON_HEIGHT = 11;
var WAITING_ICON = 'media/ajax-loader.gif';

// LOADING_IMAGE = WAITING_ICON;
// from http://en.wikipedia.org/wiki/Data_URI_scheme
var LOADING_IMAGE = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAABGdBTUEAALGPC/xhBQAAAAlwSFlzAAALEwAACxMBAJqcGAAAAAd0SU1FB9YGARc5KB0XV+IAAAAddEVYdENvbW1lbnQAQ3JlYXRlZCB3aXRoIFRoZSBHSU1Q72QlbgAAAF1JREFUGNO9zL0NglAAxPEfdLTs4BZM4DIO4C7OwQg2JoQ9LE1exdlYvBBeZ7jqch9//q1uH4TLzw4d6+ErXMMcXuHWxId3KOETnnXXV6MJpcq2MLaI97CER3N0vr4MkhoXe0rZigAAAABJRU5ErkJggg==";

/*** START IE hacks ***/
// from http://snipplr.com/view.php?codeview&id=13523
if(!window.getComputedStyle) {
	window.getComputedStyle = function(el, pseudo) {
		this.el = el;
		this.getPropertyValue = function(prop) {
			var re = /(\-([a-z]){1})/g;
			if(prop == 'float') {
				prop = 'styleFloat';
			}
			if(re.test(prop)) {
				prop = prop.replace(re, function() {
					return arguments[2].toUpperCase();
				});
			}
			return el.currentStyle[prop] ? el.currentStyle[prop] : null;
		};
		return this;
	};
}
if(!String.prototype.trim) {
	String.prototype.trim = function() {
		return this.match(/\s*(\S*)\s*/)[1];
	};
}
function xAddListener(obj, event, func, useCapture) {
	if(obj.addEventListener) {
		obj.addEventListener(event, func, useCapture);
	} else {
		obj.attachEvent('on' + event, function(e) {
			func.call(obj, e);
		});
	}
}
/*** END IE HACKS ***/

function setUnfocusable(el) {
	xAddListener(el, 'focus', el.blur, false);
}
function randomString(length) {
	var MIN = 'a'.charCodeAt(0);
	var MAX = 'z'.charCodeAt(0);

	var str = "";
	for(var i = 0; i < length; i++) {
		str += String.fromCharCode(MIN + Math.floor(Math.random() * (MAX - MIN)));
	}

	return str;
}
function isInteger(s) {
	return s.toString().match(/^-?[0-9]+$/);
}

function deleteChildren(element) {
	while(element.firstChild) {
		element.removeChild(element.firstChild);
	}
}
function parsePx(px) {
	return parseInt(px.replace(/px/g, ""), 10);
}
function getPosition(el) {
	var currLeft = 0;
	var currTop = 0;
	while(el) {
		currLeft += el.offsetLeft;
		currTop += el.offsetTop;
		el = el.offsetParent;
	}
	return {
		x : currLeft,
		y : currTop
	};
}
// returns a shallow copy of obj
function clone(obj) {
	var o = {};
	for(var k in obj) {
		if(obj.hasOwnProperty(k)) {
			o[k] = obj[k];
		}
	}
	return o;
}

function ScrambleStuff(scrambler, loadedCallback, applet) {
	var configuration = scrambler.configuration;
	var puzzle = null;
	var colorScheme = null;
	var faceMap = null;
	var defaultColorScheme = null;
	var defaultSize = null;

	function puzzleChanged(altArrow) {
		newPuzzle = puzzleSelect.getSelected();

		if(newPuzzle == puzzle) {
			return;
		}
		
		if(importedScrambles) {
			if(confirm("Since you're changing puzzles, would you like to clear the currently imported scrambles?")) {
				importedScrambles = null;
			} else {
				scrambleIndex--;
			}
		}

		colorScheme = null; // reset colorscheme
		currTurn = null;
		faceMap = null; // this indicates if the current puzzle support images
		currScramble = null;
		puzzle = newPuzzle;
		scrambleImg.clear();

		if(!puzzle) {
			return;
		}

		// we only fire a change if a puzzle is actually selected
		firePuzzleChanged(altArrow);

		scramble();
		var width = configuration.get('scramble.' + puzzle + '.size.width', null);
		var height = configuration.get('scramble.' + puzzle + '.size.height', null);
		if(width && height) {
			scrambleDiv.style.height = height;
			scrambleDiv.style.width = width;
		} else {
			//we'll have to wait for the scramble info to load to know how big to make the scramble
			width = height = null;
		}

		scrambler.loadPuzzleImageInfo(
			function(puzzleImageInfo) {
				if(puzzleImageInfo.error) {
					faceMap = null; // scramble images are not supported
					scrambleDiv.setVisible(false, true);
				} else {
					faceMap = puzzleImageInfo.faces;
					colorScheme = configuration.get('scramble.' + puzzle + '.colorScheme', clone(puzzleImageInfo.colorScheme));
					defaultColorScheme = puzzleImageInfo.colorScheme;

					defaultSize = puzzleImageInfo.size;
					if(!width || !height) {
						scrambleDiv.style.width = puzzleImageInfo.size.width + getScrambleHorzPadding() + "px";
						scrambleDiv.style.height = (puzzleImageInfo.size.height + getScrambleVertPadding()) + "px";
					}
					scrambleResized();

					// if the scramble has arrived, we format it into the turns
					if(currScramble) {
						formatScramble();
					}
				}
			}, puzzle);
	}

	var scrambleChooser = document.createElement('input');
	scrambleChooser.setAttribute('type', 'number');
	scrambleChooser.setAttribute('min', 1);
	scrambleChooser.setAttribute('step', 1);
	xAddListener(scrambleChooser, 'change', function(e) {
		// the call to deleteChildren(scrambleInfo) in scramble()
		// causes this listener to get called
		if(scrambling) {
			return;
		}

		if(!isInteger(this.value)) {
			//TODO - is there some way to make jslint happy with empty blocks?
			var nop; //don't do anything to scrambleIndex
		} else if(this.value < 1) {
			scrambleIndex = 0;
		} else if(this.value > importedScrambles.length) {
			scrambleIndex = importedScrambles.length - 1;
		} else {
			scrambleIndex = (this.value - 1);
		}
		// scramble() will update scrambleChooser.value
		scramble();
	}, false);
	function unscramble(time) {
		if(time.hasOwnProperty("importInfo") && time.importInfo.importedScrambles) {
			var info = time.importInfo;
			scrambleIndex = info.scrambleIndex;
			scrambleSrc = info.scrambleSrc;
			importedScrambles = info.importedScrambles;
			scramble();
		} else {
			scrambleIndex = 0;
			scrambleSrc = null;
			importedScrambles = null;
			scrambleLoaded(time.scramble);
		}
	}
	var scrambling = false;
	function scramble() {
		if(puzzle === null) {
			return;
		}
		scrambling = true;
		deleteChildren(scramblePre);

		if(importedScrambles && scrambleIndex >= importedScrambles.length) {
			scrambleIndex = 0;
			scrambleSrc = null;
			importedScrambles = null;
		}

		if(importedScrambles === null) {
			deleteChildren(scrambleInfo);

			scramblePre.appendChild(document.createTextNode('Loading scramble...'));
			resize(); //update scramble font size
			scrambler.loadScramble(scrambleLoaded, puzzle, null);
		} else {
			deleteChildren(scrambleInfo);
			scrambleInfo.appendChild(document.createTextNode(" Scramble ("));
			scrambleChooser.setAttribute('max', importedScrambles.length);
			scrambleChooser.setAttribute('size', 2 + Math.ceil(Math.log(importedScrambles.length) / Math.log(10)));
			scrambleChooser.value = (scrambleIndex + 1);
			scrambleInfo.appendChild(scrambleChooser);
			scrambleInfo.appendChild(document.createTextNode("/" + importedScrambles.length + ")"));
			if(scrambleSrc) {
				scrambleInfo.appendChild(document.createTextNode(" from "));
				scrambleInfo.appendChild(new Element('span', {html: scrambleSrc}));
			}

			scrambleLoaded(importedScrambles[scrambleIndex]);
			scrambleIndex++;
		}

		fireScrambleChanged();
		scrambling = false;
	}
	function turnClicked(automated) {
		if(isChangingColorScheme) {
			// first, we cancel editing of the colorscheme
			changeColorsClicked.call(changeColors);
		}
		if(currTurn) {
			currTurn.className = 'turn';
		}
		currTurn = this;
		currTurn.className = 'currTurn';
		scrambleDiv.setVisible(true, automated);
		scrambleImg.drawScramble(currTurn.incrementalScramble);
	}
	function userClickedTurn() {
		turnClicked.call(this, false);
	}

	var currScramble = null;
	function scrambleLoaded(scramble) {
		currScramble = scramble;

		if(!faceMap) {
			// scramble images are not supported, so don't bother with links
			deleteChildren(scramblePre);
			scramblePre.appendChild(document.createTextNode(scramble));
			resize(); //update scramble font size
		} else {
			formatScramble();
		}
	}

	function formatScramble() {
		if(!currScramble) {
			return;
		}
		deleteChildren(scramblePre);
		var turns = currScramble.split(/ +/);
		var incrementalScramble = "";
		var maxLength = 0;
		var i, j, turn, newLines;
		for(i = 0; i < turns.length; i++) {
			newLines = turns[i].split("\n");
			for(j = 0; j < newLines.length; j++) {
				turn = newLines[j];
				maxLength = Math.max(maxLength, turn.length);
			}
		}
		for(i = 0; i < turns.length; i++) {
			newLines = turns[i].split("\n");
			for(j = 0; j < newLines.length; j++) {
				if(j > 0) {
					scramblePre.appendChild(document.createElement('br'));
				}
				turn = newLines[j];
				incrementalScramble += turn;
				//TODO - disable if the scramble fits on one line!
				var padding = "";
				if(maxLength - turn.length <= 3) {
					// We only pad if it can be done in <= 3 spaces.
					// If we can't, we'll just leave the turn be.
					// This is basically a hack so the "/" turns in sq1
					// don't get padded.
					for(var k = turn.length; k < maxLength; k++) {
						padding += " "; //padding so all turns take up the same amount of space
					}
				}
				var turnPadding = document.createElement('span');
				turnPadding.className = "padding";
				turnPadding.appendChild(document.createTextNode(padding));
				
				var turnLink = document.createElement('span');
				turnLink.appendChild(document.createTextNode(turn));
				turnLink.incrementalScramble = incrementalScramble;
				turnLink.className = 'turn';
				xAddListener(turnLink, 'click', userClickedTurn, false);
				scramblePre.appendChild(turnLink);
				scramblePre.appendChild(turnPadding);
				if(i == turns.length - 1) {
					turnClicked.call(turnLink, true);
				} else {
					incrementalScramble += " ";
					scramblePre.appendChild(document.createTextNode(' '));
				}
			}
		}
		resize(); //update scramble font size
	}

	var currFaceName = null;
	function faceClicked() {
		currFaceName = this.faceName;
		colorChooserDiv.style.display = 'inline';
		colorChooser.setDefaultColor(colorScheme[currFaceName]);
		deleteChildren(colorChooserHeaderText);
		colorChooserHeaderText.appendChild(document.createTextNode('Editing face ' + currFaceName));
	}

	function getScrambleVertPadding() {
		// var headerStyle = window.getComputedStyle(scrambleDivHeader, null);
		// var scrambleHeader = parsePx(headerStyle.getPropertyValue("height"))
		// + parsePx(headerStyle.getPropertyValue("border-bottom-width"));
		var scrambleHeader = 20 + 1 + 2; // apparently dynamically computing
		// this doesn't work on opera
		var scrambleStyle = window.getComputedStyle(scrambleImg, null);
		return parsePx(scrambleStyle.getPropertyValue("padding-top")) + parsePx(scrambleStyle.getPropertyValue("padding-bottom")) + scrambleHeader;
	}
	function getScrambleHorzPadding() {
		var scrambleStyle = window.getComputedStyle(scrambleImg, null);
		return parsePx(scrambleStyle.getPropertyValue("padding-left")) + parsePx(scrambleStyle.getPropertyValue("padding-right"));
	}

	function scrambleMoved() {
		configuration.set('scramble.location.top', scrambleDiv.style.top);
		configuration.set('scramble.location.left', scrambleDiv.style.left);
	}

	function scrambleResized() {
		var desiredWidth = parsePx(scrambleDiv.style.width) - getScrambleHorzPadding();
		var desiredWidthHeight = desiredWidth * defaultSize.height / defaultSize.width;
		var desiredHeight = parsePx(scrambleDiv.style.height) - getScrambleVertPadding();
		var desiredHeightWidth = desiredHeight * defaultSize.width / defaultSize.height;
		var imgWidth = Math.max(desiredWidth, desiredHeightWidth, defaultSize.width);
		var imgHeight = Math.max(desiredHeight, desiredWidthHeight, defaultSize.height);
		scrambleImg.style.width = imgWidth + "px";
		scrambleImg.style.height = imgHeight + "px";
		scrambleDiv.style.width = (imgWidth + getScrambleHorzPadding()) + "px";
		scrambleDiv.style.height = (imgHeight + getScrambleVertPadding()) + "px";
		positionWindows();
	}
	function saveScrambleSize() {
		configuration.set('scramble.' + puzzle + '.size.width', scrambleDiv.style.width);
		configuration.set('scramble.' + puzzle + '.size.height', scrambleDiv.style.height);
		scrambleImg.redraw();
		deleteChildren(scrambleImgMap);
		if(isChangingColorScheme) {
			var imgWidth = parsePx(scrambleDiv.style.width) - getScrambleHorzPadding();
			var scale = imgWidth / defaultSize.width;
			var areas = scrambler.createAreas(faceMap, scale);
			var updateHeader = function() {
				deleteChildren(scrambleHeaderText);
				scrambleHeaderText.appendChild(document.createTextNode(this.faceName));
			};
			var emptyHeader = function() {
				deleteChildren(scrambleHeaderText);
			};
			for(var i = 0; i < areas.length; i++) {
				var area = areas[i];
				area.setAttribute('alt', area.faceName);
				xAddListener(area, 'click', faceClicked, false);

				xAddListener(area, 'mouseover', updateHeader, false);
				xAddListener(area, 'mouseout', emptyHeader, false);
				scrambleImgMap.appendChild(area);
			}
		}
	}

	function changeColorsClicked() {
		isChangingColorScheme = !isChangingColorScheme;
		if(isChangingColorScheme) {
			if(currTurn) {
				currTurn.className = "turn";
			}
			this.className += " buttondown";
			resetColorScheme.style.display = 'inline';
			scrambleImg.redraw();
		} else {
			if(currTurn) { // curr turn will not be defined if we just changed puzzles
				turnClicked.call(currTurn, true);
			}
			this.className = this.className.replace(/\bbuttondown\b/, "");
			colorChooserDiv.style.display = 'none'; // close cholor chooser window
			resetColorScheme.style.display = 'none';
		}
		saveScrambleSize(); // force image area map to be created
	}

	function puzzlesLoaded(puzzles) {
		deleteChildren(scramblePre);
		puzzleSelect.setDisabled(false);
		var options = [];
		for(var i = 0; i < puzzles.length; i++) {
			var iconUrl = scrambler.getPuzzleIconUrl(puzzles[i][0]);
			options.push({ value: puzzles[i][0], text: puzzles[i][1], icon: iconUrl });
		}
		puzzleSelect.setOptions(options);
		loadedCallback(puzzles);
	}

	//this is up here so hide() can have access to it
	var waitingIcon = document.createElement('img');
	waitingIcon.src = WAITING_ICON;
	waitingIcon.style.display = 'none';
	waitingIcon.style.marginTop = '8px';
	waitingIcon.style.cssFloat = waitingIcon.style.styleFloat = 'right';
	
	var scrambleIndex = 0;
	var importedScrambles = null;
	function scramblesImported(scrambles) {
		newScrambles.value = scrambles.error || scrambles.join("\n");
		importButton.update();
		activeImportButton.disabled = false;
		waitingIcon.style.display = 'none';
	}

	var currImportLink = null;
	function setCurrImportLink(newLink) {
		scrambleSrc = null;
		if(currImportLink == newLink) {
			return false;
		}
		if(currImportLink) {
			currImportLink.className = currImportLink.className.replace(/\bdown\b/, '');
		}
		newLink.className += ' down';
		currImportLink = newLink;

		newScrambles.value = '';
		importButton.update();
		return true;
	}

	var activeImportRequest = null;
	var activeImportButton = null;
	var scrambleSrc = null;

	var urlForm = null;
	var urlText = null;
	var DEFAULT_URL = "http://nascarjon.us/sunday.txt";
	function promptImportUrl() {
		if(!setCurrImportLink(this)) {
			return;
		}
		if(urlForm === null) { // pretty much copied from promptSeed()
			urlForm = document.createElement('form');
			urlForm.style.cssFloat = urlForm.style.styleFloat = 'left'; // stupid
			// ie
			urlText = document.createElement('input');
			urlText.value = DEFAULT_URL;
			urlText.type = 'text';
			urlText.style.width = '200px';
			xAddListener(urlText, 'input', function(e) {
				loadScramblesButton.disabled = (this.value.length === 0);
			}, false);
			var loadScramblesButton = document.createElement('input');
			loadScramblesButton.type = 'submit';
			loadScramblesButton.value = 'Load Scrambles';
			urlForm.onsubmit = function() {
				var url = urlText.value;
				var linkEl = document.createElement('a');
				linkEl.href = url;
				linkEl.target = '_blank';
				linkEl.appendChild(document.createTextNode(url));
				scrambleSrc = linkEl.innerHTML;
				

				waitingIcon.style.display = 'inline';
				activeImportRequest = scrambler.importScrambles(scramblesImported, url);
				(activeImportButton = loadScramblesButton).disabled = true;
				return false;
			};

			urlForm.appendChild(urlText);
			urlForm.appendChild(loadScramblesButton);
		}
		deleteChildren(importArea);
		importArea.appendChild(urlForm);

		urlText.focus();
		urlText.select();
	}

	var uploadForm = null;
	function promptImportFile() {
		if(!setCurrImportLink(this)) {
			return;
		}
		if(uploadForm === null) {
			uploadForm = scrambler.getUploadForm(function(fileName, submitButton, request) {
				var el = document.createElement('span');
				var em = document.createElement('em');
				em.appendChild(document.createTextNode(fileName));
				el.appendChild(em);
				scrambleSrc = el.innerHTML;

				waitingIcon.style.display = 'inline';
				activeImportRequest = request;
				(activeImportButton = submitButton).disabled = true;
			}, scramblesImported);
			uploadForm.style.cssFloat = uploadForm.style.styleFloat = 'left'; // stupid
			// ie
		}
		deleteChildren(importArea);
		importArea.appendChild(uploadForm);
	}

	var seedForm = null;
	var seedText = null;
	var scrambleCount = null;
	function promptSeed() {
		if(!setCurrImportLink(this)) {
			return;
		}
		if(seedForm === null) {
			seedForm = document.createElement('form');
			seedForm.style.cssFloat = seedForm.style.styleFloat = 'left'; // stupid ie

			seedText = document.createElement('input');
			seedText.setAttribute('type', 'text');
			seedText.style.width = '160px';
			seedText.setAttribute('title', "If you agree upon a seed with someone else, you'll be guaranteed to get the same scrambles as them. Leave blank for totally random scrambles.");

			scrambleCount = document.createElement('input');
			scrambleCount.setAttribute('type', 'number');
			scrambleCount.setAttribute('step', '1');
			scrambleCount.setAttribute('min', '1');
			scrambleCount.style.width = '80px';
			scrambleCount.value = 12;

			var loadScramblesButton = document.createElement('input');
			loadScramblesButton.setAttribute('type', 'submit');
			loadScramblesButton.value = 'Seed Scrambles';
			seedForm.onsubmit = function() {
				var seed = seedText.value;
				if(seed.length === 0) {
					seed = null; // this will use pregenerated scrambles,
					// which should be a lot faster
				}

				var count = parseInt(scrambleCount.value, 10);
				if(!count) {
					return false;
				}
				var el = document.createElement('span');
				el.appendChild(document.createTextNode("seed "));
				var linky = document.createElement('em');
				linky.appendChild(document.createTextNode(seed));
				el.appendChild(linky);
				scrambleSrc = el.innerHTML;

				waitingIcon.style.display = 'inline';
				activeImportRequest = scrambler.loadScrambles(scramblesImported, puzzle, seed, count);
				(activeImportButton = loadScramblesButton).disabled = true;
				return false;
			};

			seedForm.appendChild(seedText);
			seedForm.appendChild(scrambleCount);
			seedForm.appendChild(loadScramblesButton);
		}
		deleteChildren(importArea);
		importArea.appendChild(seedForm);

		seedText.value = randomString(10);
		seedText.focus();
		seedText.select();
	}

	var isChangingColorScheme = false;

	var scrambleArea = document.createElement('div');
	scrambleArea.className = 'scrambleArea';

	function show() {
		if(currImportLink === null) {
			//initialization
			promptSeed.call(seedLink);
		}
	}
	function hide() {
		// cancel any outgoing requests
		if(activeImportRequest) {
			activeImportRequest.abort();
		}
		if(activeImportButton) {
			activeImportButton.disabled = false;
		}
		waitingIcon.style.display = 'none';
	}
	
	var importDiv = tnoodle.tnt.createPopup(show, hide);
	
	var importDivTabs = document.createElement('span');
	importDiv.appendChild(importDivTabs);
	
	var seedLink = document.createElement('span');
	seedLink.title = "Generate scrambles from a seed, perfect for racing!";
	seedLink.className = 'link';
	xAddListener(seedLink, 'click', promptSeed, false);
	seedLink.appendChild(document.createTextNode('Seed'));
	importDivTabs.appendChild(seedLink);

	var importUrlLink = document.createElement('span');
	importUrlLink.title = "Import scrambles from url";
	importUrlLink.className = 'link';
	xAddListener(importUrlLink, 'click', promptImportUrl, false);
	importUrlLink.appendChild(document.createTextNode('From Url'));
	importDivTabs.appendChild(importUrlLink);
	importDivTabs.appendChild(document.createTextNode(' '));

	var importFileLink = document.createElement('span');
	importFileLink.title = "Import scrambles from file";
	importFileLink.className = 'link';
	xAddListener(importFileLink, 'click', promptImportFile, false);
	importFileLink.appendChild(document.createTextNode('From File'));
	importDivTabs.appendChild(importFileLink);
	importDivTabs.appendChild(document.createTextNode(' '));

	var tempDiv = document.createElement('div');
	tempDiv.style.overflow = 'hidden'; // need this for ie
	importDiv.appendChild(tempDiv);

	var importArea = document.createElement('span');
	tempDiv.appendChild(importArea);

	tempDiv.appendChild(waitingIcon);

	var newScrambles = document.createElement('textarea');
	newScrambles.setAttribute('wrap', 'off');
	newScrambles.style.width = '420px';
	newScrambles.style.height = '180px';
	newScrambles.getScrambles = function() {
		var scrambles = newScrambles.value.split('\n');
		for( var i = scrambles.length - 1; i >= 0; i--) {
			if(scrambles[i].trim().length === 0) {
				scrambles.splice(i, 1); // remove all empty rows
			}
		}
		return scrambles;
	};
	importDiv.appendChild(newScrambles);

	tempDiv = document.createElement('div');
	tempDiv.style.textAlign = 'right';
	importDiv.appendChild(tempDiv);

	var importButton = document.createElement('input');
	importButton.type = 'button';
	importButton.update = function() {
		var scrambles = newScrambles.getScrambles();
		importButton.value = 'Import';
		if(scrambles.length > 0) {
			importButton.value += ' ' + scrambles.length + " scramble(s)";
		}
		importButton.disabled = scrambles.length === 0;
	};

	xAddListener(newScrambles, 'input', function(e) {
		importButton.update();
	});
	xAddListener(importButton, 'click', function() {
		var scrambles = newScrambles.getScrambles();
		if(scrambles.length > 0) {
			importedScrambles = scrambles;
			scrambleIndex = 0;
			scramble();
			importDiv.hide();
		}
	}, false);
	tempDiv.appendChild(importButton);

	var cancelImportButton = document.createElement('input');
	cancelImportButton.type = 'button';
	cancelImportButton.value = 'Cancel';
	xAddListener(cancelImportButton, 'click', function() {
		importDiv.hide();
	});
	tempDiv.appendChild(cancelImportButton);

	var scrambleHeader = document.createElement('div');
	scrambleHeader.className = 'scrambleHeader';
	scrambleArea.appendChild(scrambleHeader);

	var importLink = document.createElement('span');
	importLink.className = 'link';
	importLink.appendText('Import');
	xAddListener(importLink, 'click', importDiv.show, false);
	scrambleHeader.appendChild(importLink);
	scrambleHeader.appendChild(document.createTextNode(' '));

	var newScrambleLink = document.createElement('span');
	newScrambleLink.className = 'link';
	newScrambleLink.title = "Get a new scramble (Note: Clears any imported scrambles!)";
	newScrambleLink.appendText('New scramble');
	xAddListener(newScrambleLink, 'click', function() {
		if(!importedScrambles || confirm('This will clear any imported scrambles, are you sure you want to continue?')) {
			importedScrambles = null;
			scramble();
		}
	}, false);
	scrambleHeader.appendChild(newScrambleLink);

	/*
	 * TODO use something like zero copy here? or do what google maps does and
	 * popup a selected text box? var copyLink = document.createElement('span');
	 * copyLink.className = 'link'; xAddListener(copyLink, 'click', function() {
	 * console.log(this); }, false);
	 * copyLink.appendChild(document.createTextNode('Copy'));
	 * scrambleHeader.appendChild(copyLink);
	 * scrambleHeader.appendChild(document.createTextNode(' '));
	 */

	var scrambleInfo = document.createElement('span');
	scrambleHeader.appendChild(scrambleInfo);

	var scramblePre = document.createElement('pre');
	scramblePre.className = 'scrambleText';
	scrambleArea.appendChild(scramblePre);

	var scrambleDiv = document.createElement('div');
	scrambleDiv.style.display = 'none';
	scrambleDiv.className = 'window';
	document.body.appendChild(scrambleDiv);

	var scrambleDivHeader = document.createElement("div");
	scrambleDivHeader.className = 'titlebar';
	scrambleDiv.appendChild(scrambleDivHeader);
	scrambleDiv.setStyle('z-index', 4);
	scrambleDiv.id = 'scrambleDiv'; // have to have an id to make it draggable
	scrambleDiv.invisiblePuzzles = configuration.get('scramble.invisiblePuzzles', {});
	scrambleDiv.setVisible = function(visible, automated) {
		if(automated) {
			visible &= !this.invisiblePuzzles[puzzle];
		} else {
			this.invisiblePuzzles[puzzle] = !visible;
			configuration.set('scramble.invisiblePuzzles', this.invisiblePuzzles);
		}
		if(visible) {
			scrambleDiv.style.display = 'inline';
			//we must wait for the scramble to become visible before we make it fit on the page
			setTimeout(positionWindows, 0);
		} else {
			if(currTurn) {
				currTurn.className = 'turn';
			}
			scrambleDiv.style.display = 'none';
			colorChooserDiv.style.display = 'none';
		}
	};

	var scrambleHeaderText = document.createElement("span");
	scrambleHeaderText.className = 'titletext';
	scrambleDivHeader.appendChild(scrambleHeaderText);

	var closeScramble = document.createElement('span');
	closeScramble.appendChild(document.createTextNode('X'));
	closeScramble.className = 'button close';
	closeScramble.title = 'Close';
	xAddListener(closeScramble, 'click', function() {
		scrambleDiv.setVisible(false, false);
	}, false);
	scrambleDivHeader.appendChild(closeScramble);

	var minimizeScramble = document.createElement('span');
	minimizeScramble.appendChild(document.createTextNode('*'));
	minimizeScramble.className = 'button close';
	minimizeScramble.title = 'Reset size';
	xAddListener(minimizeScramble, 'click', function() {
		scrambleDiv.style.width = defaultSize.width + getScrambleHorzPadding() + "px";
		scrambleDiv.style.height = defaultSize.height	+ getScrambleVertPadding() + "px";
		scrambleResized();
		saveScrambleSize();
	}, false);
	scrambleDivHeader.appendChild(minimizeScramble);

	var changeColors = document.createElement('span');
	changeColors.className = 'button changeColors';
	changeColors.setAttribute('title', 'Change color scheme');
	xAddListener(changeColors, 'click', changeColorsClicked, false);
	scrambleDivHeader.appendChild(changeColors);

	var resetColorScheme = document.createElement('span');
	// resetColorScheme.appendChild(document.createTextNode('*'));
	resetColorScheme.setAttribute('title', 'Reset color scheme');
	resetColorScheme.className = 'button reset';
	resetColorScheme.style.display = 'none';
	xAddListener(resetColorScheme, 'click', function() {
		if(confirm("Reset the color scheme?")) {
			colorScheme = clone(defaultColorScheme);
			configuration.set('scramble.' + puzzle + '.colorScheme', colorScheme);
			scrambleImg.drawScramble("");
		}
	}, false);
	scrambleDivHeader.appendChild(resetColorScheme);
	// end scrambleDivHeader

	var scrambleImg = document.createElement('img');
	scrambleImg.setAttribute('usemap', '#scrambleImgMap');
	scrambleDiv.appendChild(scrambleImg);

	scrambleImg.redraw = function() {
		this.drawScramble(isChangingColorScheme ? "" : currScramble);
	};
	scrambleImg.drawScramble = function(scramble) {
		// no need to waste bandwidth unless we're
		// actually displaying images
		if(scrambleDiv.style.display != 'none') {
			if(scramble != currScramble) {
				// since the next image may take a while to load, we place a holder
				this.clear();
			}
			var width = configuration.get('scramble.' + puzzle + '.size.width', null);
			var height = configuration.get('scramble.' + puzzle + '.size.height', null);
			if(!width || !height) {
				width = height = null;
			} else {
				width = width.toInt() - getScrambleHorzPadding();
				height = height.toInt() - getScrambleVertPadding();
			}
			this.src = scrambler.getScrambleImageUrl(puzzle, scramble, colorScheme, width, height);
		}
	};
	scrambleImg.clear = function() {
		this.src = LOADING_IMAGE;
	};

	var scrambleImgMap = document.createElement('map');
	scrambleImgMap.setAttribute('name', 'scrambleImgMap');
	scrambleDiv.appendChild(scrambleImgMap);

	var resizeDiv = document.createElement('div');
	resizeDiv.className = "dragresize dragresize-br";
	scrambleDiv.appendChild(resizeDiv);
	// end scrambleDiv

	// Defaulting to 30px to make room for "Sign In" and "Help" links
	scrambleDiv.style.top = configuration.get('scramble.location.top', '30px');
	scrambleDiv.style.left = configuration.get('scramble.location.left', '0px');

	var scrambleDrag = new Drag(scrambleDiv, {
		handle : scrambleDivHeader
	});
	scrambleDrag.addEvent('complete', scrambleMoved);

	var scrambleResize = scrambleDiv.makeResizable( {
		handle : resizeDiv,
		snap : 0
	});
	scrambleResize.addEvent('drag', scrambleResized);
	scrambleResize.addEvent('complete', saveScrambleSize);

	var puzzleSelect = tnoodle.tnt.createSelect('Click to open last session of puzzle', 'Click to change session puzzle');
	puzzleSelect.onchange = puzzleChanged;
	puzzleSelect.setDisabled(true);

	var colorChooserDiv = document.createElement('div');
	colorChooserDiv.id = 'colorChooserDiv'; // need an id to make it draggable
	colorChooserDiv.className = 'window';
	colorChooserDiv.style.zIndex = 5;
	document.body.appendChild(colorChooserDiv);
	var titlebar = document.createElement('div');
	titlebar.className = 'titlebar';
	colorChooserDiv.appendChild(titlebar);
	var colorChooserHeaderText = document.createElement('span');
	colorChooserHeaderText.className = 'titletext';
	titlebar.appendChild(colorChooserHeaderText);

	var closeColorChooser = document.createElement('span');
	closeColorChooser.className = "button";
	closeColorChooser.appendChild(document.createTextNode('X'));
	xAddListener(closeColorChooser, 'click', function() {
		colorChooserDiv.style.display = 'none';
	}, false);
	titlebar.appendChild(closeColorChooser);
	// end titlebar
	var colorChooser = new ColorChooser(function(newColor) {
		colorScheme[currFaceName] = newColor;
		configuration.set('scramble.' + puzzle + '.colorScheme', colorScheme);
		colorChooserDiv.style.display = 'none';
		scrambleImg.redraw();
	});
	colorChooserDiv.appendChild(colorChooser.element);
	// end colorChooserDiv

	colorChooserDiv.style.width = colorChooser.preferredWidth + 'px';
	colorChooserDiv.style.height = colorChooser.preferredHeight + 'px';
	colorChooserDiv.style.display = 'none';
	var colorChooserDrag = new Drag(colorChooserDiv, {
		handle : titlebar
	});

	scramblePre.appendChild(document.createTextNode('Connecting to ' + scrambler.toString() + "..."));
	scrambler.loadPuzzles(puzzlesLoaded);

	// public variables
	this.puzzleSelect = puzzleSelect;
	this.scrambleArea = scrambleArea;
	this.scrambler = scrambler;

	// public methods
	this.scramble = scramble;
	this.unscramble = unscramble;
	this.getSelectedPuzzle = function() {
		return puzzle;
	};
	this.setSelectedPuzzle = function(newPuzzle) {
		puzzleSelect.setSelected(newPuzzle);
	};
	this.getScramble = function() {
		return currScramble;
	};
	this.getImportInfo = function() {
		return {
			importedScrambles: importedScrambles,
			scrambleIndex: scrambleIndex-1,
			scrambleSrc: scrambleSrc
		};
	};
	this.importScrambles = function(scrambles, src) {
		scrambleSrc = src;
		importedScrambles = scrambles;
		scrambleIndex = 0;
		scramble();
	};
	
	function adjustFontSize() {
		var paddingSpans = $$('.padding');
		paddingSpans.each(function(el) {
			el.setStyle('display', '');
		});
		var height = scramblePre.getStyle("height").toInt();
		// Increase font size until the scramble doesn't fit.
		// Sometimes, this can get stuck in an inf loop where
		// scramblePre grows to accomodate the increasing font
		// size. We hold onto the original height to prevent this.
		var f = scramblePre.getStyle('font-size').toInt();
		while(scramblePre.clientHeight >= scramblePre.scrollHeight) {
			scramblePre.setStyle('font-size', ++f);
			if(f > height) {
				break;
			}
		}
		
		// Decrease font size until the scramble fits
		do {
			scramblePre.setStyle('font-size', f--);
			if(f <= 10) {
				break;
			}
		} while(scramblePre.clientHeight < scramblePre.scrollHeight);

		if(paddingSpans.length > 0) {
			if(paddingSpans[0].getPosition().y == paddingSpans[paddingSpans.length-1].getPosition().y) {
				//the scramble is only taking up 1 row! so we disable the padding
				paddingSpans.each(function(el) {
					el.setStyle('display', 'none');
				});
			}

		}
	}
	
	this.resize = function() {
		var space = $('scrambles').getSize();
		space.y -= $('scrambleBorder').getSize().y + 2; //add 2 for border
		$$('.scrambleArea')[0].setStyle('height', space.y);
		space.y -= $$('.scrambleHeader')[0].getSize().y;
		var scrambleText = $$('.scrambleText')[0];
		var paddingVert = scrambleText.getStyle('padding-top').toInt() + scrambleText.getStyle('padding-bottom').toInt();
		var paddingHorz = scrambleText.getStyle('padding-left').toInt() + scrambleText.getStyle('padding-right').toInt();
		space.y -= paddingVert;
		if(space.y < 0) {
			space.y = 0;
		}
		space.x -= paddingHorz; //this doesn't work if there's a vertical scrollbar
		scramblePre.setStyle('height', space.y);
		
		adjustFontSize();
	};
	var resize = this.resize;

	var scrambleListeners = [];
	this.addScrambleChangeListener = function(l) {
		scrambleListeners.push(l);
	};
	function fireScrambleChanged() {
		for( var i = 0; i < scrambleListeners.length; i++) {
			scrambleListeners[i]();
		}
	}

	this.toggleScrambleView = function() {
		if(scrambleDiv.style.display == 'none') {
			var turns = $$('.turn'); //fun with css!
			turnClicked.call(turns[turns.length-1], false);
		} else {
			scrambleDiv.setVisible(false);
		}
	};

	var puzzleListeners = [];
	this.addPuzzleChangeListener = function(l) {
		puzzleListeners.push(l);
	};
	function firePuzzleChanged(altArrow) {
		for( var i = 0; i < puzzleListeners.length; i++) {
			puzzleListeners[i](puzzle, altArrow);
		}
	}
	
	function ensureVisible(el) {
		var pos = el.getPosition();
		pos.x--; pos.y--; //assuming the border is 1px
		var size = el.getSize();
		var avail = window.getSize();
		// NOTE: the order of the min, max is important here!
		// We can never let windows be clipped on the right hand size, else we lose
		// ability to resize them!
		pos.x = Math.min(Math.max(0, pos.x), avail.x-size.x-2);
		pos.y = Math.min(Math.max(0, pos.y), avail.y-size.y-1);
		el.getParent().setPosition(pos); //must position the parent, not the titlebar
	}
	var positioning = false;
	function positionWindows() {
		// We don't want this method to get called while it's getting called,
		// and we also don't want it to be called when the scramble isn't even visible
		if(positioning || scrambleDiv.style.display != 'inline') {
			return;
		}
		positioning = true;
		ensureVisible(scrambleDivHeader);
		ensureVisible(titlebar);
		scrambleMoved();
		positioning = false;
	}
	scrambleDrag.addEvent('complete', positionWindows);
	colorChooserDrag.addEvent('complete', positionWindows);
	window.addEvent('resize', positionWindows);
}
