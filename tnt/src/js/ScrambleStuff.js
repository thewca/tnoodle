//generated from http://ajaxload.info/
WAITING_ICON_HEIGHT = 11;
WAITING_ICON = 'media/ajax-loader.gif';

// LOADING_IMAGE = WAITING_ICON;
// from http://en.wikipedia.org/wiki/Data_URI_scheme
LOADING_IMAGE = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAABGdBTUEAALGPC/xhBQAAAAlwSFlzAAALEwAACxMBAJqcGAAAAAd0SU1FB9YGARc5KB0XV+IAAAAddEVYdENvbW1lbnQAQ3JlYXRlZCB3aXRoIFRoZSBHSU1Q72QlbgAAAF1JREFUGNO9zL0NglAAxPEfdLTs4BZM4DIO4C7OwQg2JoQ9LE1exdlYvBBeZ7jqch9//q1uH4TLzw4d6+ErXMMcXuHWxId3KOETnnXXV6MJpcq2MLaI97CER3N0vr4MkhoXe0rZigAAAABJRU5ErkJggg==";

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
function isOrIsChild(el, parent) {
	while(el) {
		if(el == parent) {
			return true;
		}
		el = el.parentNode;
	}
	return false;
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

function ScrambleStuff(configuration, loadedCallback, applet) {

	var puzzle = null;
	var colorScheme = null;
	var defaultColorScheme = null;
	var defaultSize = null;

	function puzzleChanged() {
		if(importedScrambles) {
			if(confirm("Since you're switching puzzles, would you like to clear the currently imported scrambles?")) {
				importedScrambles = null;
			} else {
				scrambleIndex--;
			}
		}
		if(puzzleSelect.selectedIndex < 0 || puzzleSelect.selectedIndex > puzzleSelect.options.length) {
			newPuzzle = null;
		} else {
			newPuzzle = puzzleSelect.options[puzzleSelect.selectedIndex].value;
		}

		if(newPuzzle == puzzle) {
			return;
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
		firePuzzleChanged();

		scramble();
		scrambler.loadPuzzleImageInfo(
				function(puzzleImageInfo) {
					if(puzzleImageInfo.error) {
						faceMap = null; // scramble images are not supported
						scrambleDiv.setVisible(false, false);
					} else {
						// if the scramble has arrived, we format it into the turns
						if(currScramble) {
							formatScramble();
						}

						faceMap = puzzleImageInfo.faces;
						colorScheme = configuration.get('scramble.' + puzzle + '.colorScheme', clone(puzzleImageInfo.colorScheme));
						defaultColorScheme = puzzleImageInfo.colorScheme;

						defaultSize = puzzleImageInfo.size;
						scrambleDiv.style.width = configuration.get('scramble.' + puzzle + '.size.width', puzzleImageInfo.size.width + getScrambleHorzPadding() + "px");
						scrambleDiv.style.height = configuration.get('scramble.' + puzzle + '.size.height', puzzleImageInfo.size.height	+ getScrambleVertPadding() + "px");

						scrambleResized();
					}
				}, puzzle);
	}

	var scrambleChooser = document.createElement('input');
	scrambleChooser.setAttribute('type', 'number');
	scrambleChooser.setAttribute('min', 1);
	scrambleChooser.setAttribute('step', 1);
	xAddListener(scrambleChooser, 'change', function() {
		if(!isInteger(this.value) || this.value < 1 || this.value > importedScrambles.length) {
			this.value = scrambleIndex;
		} else {
			scrambleIndex = this.value - 1;
			scramble();
		}
	}, false);
	function scramble() {
		if(puzzle === null) {
			return;
		}
		deleteChildren(scramblePre);

		if(importedScrambles && scrambleIndex >= importedScrambles.length) {
			alert("That was the last imported scramble, switching back to generated scrambles.");
			scrambleIndex = 0;
			scrambleSrc = null;
			importedScrambles = null;
		}

		if(importedScrambles === null) {
			deleteChildren(scrambleInfo);

			scramblePre.appendChild(document.createTextNode('Loading scramble...'));
			scrambler.loadScramble(scrambleLoaded, puzzle, null);
		} else {
			deleteChildren(scrambleInfo);
			scrambleInfo.appendChild(document.createTextNode(" Scramble ("));
			scrambleChooser.setAttribute('max', importedScrambles.length);
			scrambleChooser.setAttribute('size', 1 + Math.floor(Math.log(importedScrambles.length) / Math.log(10)));
			scrambleChooser.value = (scrambleIndex + 1);
			scrambleInfo.appendChild(scrambleChooser);
			scrambleInfo.appendChild(document.createTextNode("/" + importedScrambles.length + ")"));
			if(scrambleSrc) {
				scrambleInfo.appendChild(document.createTextNode(" from "));
				scrambleInfo.appendChild(scrambleSrc);
			}

			scrambleLoaded(importedScrambles[scrambleIndex]);
			scrambleIndex++;
		}

		fireScrambleChanged();
	}
	function turnClicked(userInvoked) {
		if(isChangingColorScheme) {
			// first, we cancel editing of the colorscheme
			changeColorsClicked.call(changeColors);
		}
		if(currTurn) {
			currTurn.className = 'turn';
		}
		currTurn = this;
		currTurn.className = 'currTurn';
		scrambleDiv.setVisible(true, userInvoked);
		scrambleImg.drawScramble(currTurn.incrementalScramble);
	}
	function userClickedTurn() {
		turnClicked.call(this, true);
	}

	var currScramble = null;
	function scrambleLoaded(scramble) {
		currScramble = scramble;

		if(!faceMap) {
			// scramble images are not supported, so don't bother with links
			deleteChildren(scramblePre);
			scramblePre.appendChild(document.createTextNode(scramble));
		} else {
			formatScramble();
		}
	}

	function formatScramble() {
		deleteChildren(scramblePre);
		var turns = currScramble.split(' ');
		var incrementalScramble = "";
		var maxLength = 0;
		var i, turn;
		for(i = 0; i < turns.length; i++) {
			turn = turns[i];
			maxLength = Math.max(maxLength, turn.length);
		}
		for(i = 0; i < turns.length; i++) {
			turn = turns[i];
//			for(var j = turn.length; j < maxLength; j++) {
//				turn += " "; //padding so all turns take up the same amount of space
//			}
			incrementalScramble += turn;
			var turnLink = document.createElement('span');
			turnLink.appendChild(document.createTextNode(turn));
			turnLink.incrementalScramble = incrementalScramble;
			turnLink.className = 'turn';
			xAddListener(turnLink, 'click', userClickedTurn, false);
			scramblePre.appendChild(turnLink);
			if(i == turns.length - 1) {
				turnClicked.call(turnLink, false);
			} else {
				incrementalScramble += " ";
				scramblePre.appendChild(document.createTextNode(' '));
			}
		}
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
		var scrambleHeader = 20 + 1 + 2; // apprently dynamically computing
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
	}
	function saveScrambleSize() {
		configuration.set('scramble.' + puzzle + '.size.width', scrambleDiv.style.width);
		configuration.set('scramble.' + puzzle + '.size.height', scrambleDiv.style.height);
		deleteChildren(scrambleImgMap);
		if(isChangingColorScheme) {
			var imgWidth = parsePx(scrambleDiv.style.width) - getScrambleHorzPadding();
			var scale = imgWidth / defaultSize.width;
			var areas = tnoodle.scrambles.createAreas(faceMap, scale);
			var updateHeader = function() {
				deleteChildren(scrambleHeaderText);
				scrambleHeaderText.appendChild(document.createTextNode(this.faceName));
			};
			var emptyHeader = function() {
				deleteChildren(scrambleHeaderText);
			};
			for( var i = 0; i < areas.length; i++) {
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
			scrambleImg.drawScramble("");
		} else {
			if(currTurn) { // curr turn will not be defined if we just changed puzzles
				turnClicked.call(currTurn, false);
			}
			this.className = this.className.replace(/\bbuttondown\b/, "");
			colorChooserDiv.style.display = 'none'; // close cholor chooser
			// window
			resetColorScheme.style.display = 'none';
		}
		saveScrambleSize(); // force image area map to be created
	}

	function puzzlesLoaded(puzzles) {
		deleteChildren(scramblePre);
		puzzleSelect.disabled = false;
		puzzleSelect.options.length = puzzles.length;
		for( var i = 0; i < puzzles.length; i++) {
			puzzleSelect.options[i] = new Option(puzzles[i][1], puzzles[i][0]);
		}
		loadedCallback(puzzles);
	}

	//this is up here so hide() can have access to it
	var waitingIcon = document.createElement('img');
	waitingIcon.src = WAITING_ICON;
	waitingIcon.style.display = 'none';
	waitingIcon.style.marginTop = (18 - 11) / 2 + 'px';
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
				scrambleSrc = document.createElement('a');
				scrambleSrc.href = url;
				scrambleSrc.target = '_blank';
				scrambleSrc.appendChild(document.createTextNode(url));

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
				scrambleSrc = document.createElement('span');
				var em = document.createElement('em');
				em.appendChild(document.createTextNode(fileName));
				scrambleSrc.appendChild(em);

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
			seedForm.style.cssFloat = seedForm.style.styleFloat = 'left'; // stupid
			// ie

			seedText = document.createElement('input');
			seedText.setAttribute('type', 'text');
			seedText.style.width = '160px';
			seedText.setAttribute('title', "If you agree upon a seed with someone else, you'll be guaranteed to get the same scrambles as them. Leave blank for totally random scrambles.");

			scrambleCount = document.createElement('input');
			scrambleCount.setAttribute('type', 'number');
			scrambleCount.setAttribute('step', '1');
			scrambleCount.setAttribute('min', '1');
			scrambleCount.setAttribute('size', '4'); // adding 1 for opera
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
				scrambleSrc = document.createElement('span');
				scrambleSrc.appendChild(document.createTextNode("seed "));
				var linky = document.createElement('em');
				linky.appendChild(document.createTextNode(seed));
				scrambleSrc.appendChild(linky);

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

	var importDiv = document.createElement('div');
	importDiv.className = 'importDiv';
	importDiv.style.zIndex = 5; //this belongs on top
	document.body.appendChild(importDiv);

	importDiv.show = function() {
		if(currImportLink === null) {
			//initialization
			promptImportUrl.call(importUrlLink);
		}
		this.style.display = 'inline';
		var windowWidth = window.innerWidth || window.clientWidth;
		var windowHeight = window.innerHeight || window.clientHeight;
		var importWidth = parseInt(importDiv.getStyle('width'), 10);
		var importHeight = parseInt(importDiv.getStyle('height'), 10);
		this.style.top = (windowHeight - importHeight)/2 + 'px';
		this.style.left = (windowWidth - importWidth)/2 + 'px';
	}.bind(importDiv);
	importDiv.hide = function() {
		importDiv.style.display = 'none';

		// cancel any outgoing requests
		if(activeImportRequest) {
			activeImportRequest.abort();
		}
		if(activeImportButton) {
			activeImportButton.disabled = false;
		}
		waitingIcon.style.display = 'none';
	};
	importDiv.hide();
	
	var importDivTabs = document.createElement('span');
	importDiv.appendChild(importDivTabs);
	
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

	var seedLink = document.createElement('span');
	seedLink.title = "Generate scrambles from a seed, perfect for racing!";
	seedLink.className = 'link';
	xAddListener(seedLink, 'click', promptSeed, false);
	seedLink.appendChild(document.createTextNode('Seed'));
	importDivTabs.appendChild(seedLink);

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
	
	function createResizer(bigger) {
		var downTime = 0;
		var resize = function(e) {
			setTimeout(function() {
				if(!mouseDown) {
					downTime = 0;
					return;
				}
				downTime++;
				var size = parsePx(scramblePre.style.fontSize);
				var delta = Math.max(downTime/2, 1);
				size += bigger ? delta : -delta;
				decrease.style.visibility = 'visible';
				increase.style.visibility = 'visible';
				if(size <= 5) {
					decrease.style.visibility = 'hidden';
				} else if(size > 100) {
					increase.style.visibility = 'hidden';
				} else {
					size += 'px';
					scramblePre.style.fontSize = size;
					configuration.set('scramble.fontSize', size);
					setTimeout(resize, 100);
				}
			}, 0); // wait for mouseDown to get set
		};
		return resize;
	}

	var increase = document.createElement('span');
	increase.className = 'increaseSize';
	increase.appendChild(document.createTextNode('A'));
	xAddListener(increase, 'mousedown', createResizer(true), false);
	
	var decrease = document.createElement('span');
	decrease.className = 'decreaseSize';
	//decrease.appendChild(document.createTextNode('\u2013')); // en dash
	decrease.appendChild(document.createTextNode('A'));
	xAddListener(decrease, 'mousedown', createResizer(false), false);

	var scrambleSize = document.createElement('span');
	scrambleSize.setAttribute('class', 'changeSize');
	scrambleSize.appendChild(decrease);
	scrambleSize.appendChild(document.createTextNode(' '));
	scrambleSize.appendChild(increase);
	scrambleHeader.appendChild(scrambleSize);

	var importLink = document.createElement('span');
	importLink.className = 'link';
	xAddListener(importLink, 'click', importDiv.show, false);
	importLink.appendChild(document.createTextNode('Import Scrambles'));
	scrambleHeader.appendChild(importLink);
	scrambleHeader.appendChild(document.createTextNode(' '));

	var newScrambleLink = document.createElement('span');
	newScrambleLink.title = "Clear whatever may be imported and get a new scramble.";
	newScrambleLink.className = 'link';
	xAddListener(newScrambleLink, 'click', function() {
		if(!importedScrambles || confirm('This will clear any imported scrambles, are you sure you want to continue?')) {
			importedScrambles = null;
			importDiv.hide(); //TODO - does this really need to be here?
			scramble();
		}
	}, false);
	newScrambleLink.appendChild(document.createTextNode('New Scramble'));
	scrambleHeader.appendChild(newScrambleLink);

	var mouseDown = false;
	xAddListener(document, 'mouseup', function(e) {
		mouseDown = false;
	}, false);
	xAddListener(document, 'mousedown', function(e) {
		mouseDown = true;
		if(!e.target) {
			e.target = e.srcElement; // freaking ie, man
		}

		if(isOrIsChild(e.target, puzzleSelect)) {
			// we allow the user to switch scrambles while importing
			return;
		}

		if(!isOrIsChild(e.target, importDiv)) {
			importDiv.hide();
		}
	}, false);

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
	scramblePre.style.fontSize = configuration.get('scramble.fontSize', '20px');
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
	scrambleDiv.visibleIfPossible = configuration.get('scramble.visible', true);
	scrambleDiv.setVisible = function(visible, userInvoked) {
		if(userInvoked) {
			this.visibleIfPossible = visible;
			configuration.set('scramble.visible', visible);
		} else {
			visible &= this.visibleIfPossible;
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
	xAddListener(closeScramble, 'click', function() {
		scrambleDiv.setVisible(false, true);
	}, false);
	scrambleDivHeader.appendChild(closeScramble);

	var changeColors = document.createElement('span');
	changeColors.className = 'button changeColors';
	changeColors.setAttribute('title', 'Change color scheme');
	// changeColors.appendChild(document.createTextNode('#'));
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
		this.drawScramble(currScramble);
	};
	scrambleImg.drawScramble = function(scramble) {
		if(scrambleDiv.style.display != 'none') { // no need to waste
			// bandwidth unless we're
			// actually displaying
			// images
			this.clear(); // since the next image may take a while to load, we
			// place this one first
			this.src = scrambler.getScrambleImageUrl(puzzle, scramble, colorScheme);
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
	scrambleDiv.style.top = configuration.get('scramble.location.top', '0px');
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

	var puzzleSelect = document.createElement('select');
	puzzleSelect.onchange = puzzleChanged; // for some reason, the change event
	// doesn't fire until the select
	// loses focus
	puzzleSelect.disabled = true;

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
		scrambleImg.drawScramble("");
	});
	colorChooserDiv.appendChild(colorChooser.element);
	// end colorChooserDiv

	colorChooserDiv.style.width = colorChooser.preferredWidth + 'px';
	colorChooserDiv.style.height = colorChooser.preferredHeight + 'px';
	colorChooserDiv.style.display = 'none';
	var colorChooserDrag = new Drag(colorChooserDiv, {
		handle : titlebar
	});

	var scrambler;
	if(applet) {
		scrambler = new tnoodle.scrambles.applet(puzzlesLoaded);
	} else {
		scrambler = new tnoodle.scrambles.server(location.hostname, location.port);
	}
	scramblePre.appendChild(document.createTextNode('Connecting to ' + scrambler.toString() + "..."));
	scrambler.connect(puzzlesLoaded);

	// public variables
	this.puzzleSelect = puzzleSelect;
	this.scrambleArea = scrambleArea;

	// public methods
	this.scramble = scramble;
	this.getSelectedPuzzle = function() {
		return puzzle;
	};
	this.setSelectedPuzzle = function(newPuzzle) {
		puzzleSelect.value = newPuzzle;
		puzzleChanged();
	};
	this.getScramble = function() {
		return currScramble;
	};

	var scrambleListeners = [];
	this.addScrambleChangeListener = function(l) {
		scrambleListeners.push(l);
	};
	function fireScrambleChanged() {
		for( var i = 0; i < scrambleListeners.length; i++) {
			scrambleListeners[i]();
		}
	}

	var puzzleListeners = [];
	this.addPuzzleChangeListener = function(l) {
		puzzleListeners.push(l);
	};
	function firePuzzleChanged() {
		for( var i = 0; i < puzzleListeners.length; i++) {
			puzzleListeners[i](puzzle);
		}
	}
	
	function ensureVisible(el) {
		var pos = el.getPosition();
		var size = el.getSize();
		var avail = window.getSize();
		if(pos.x < 0) {
			pos.x = 1; //1 for the border
		}
		if(pos.x + size.x > avail.x) {
			pos.x = avail.x-size.x;
		}
		if(pos.y < 0) {
			pos.y = 1; //1 for the border
		}
		if(pos.y + size.y > avail.y) {
			pos.y = avail.y-size.y;
		}
		pos.x--; pos.y--; //assuming the border is 1px
		el.getParent().setPosition(pos); //must position the parent, not the titlebar
	}
	function positionWindows() {
		ensureVisible(scrambleDivHeader);
		ensureVisible(titlebar);
		scrambleMoved();
	}
	scrambleDrag.addEvent('complete', positionWindows);
	colorChooserDrag.addEvent('complete', positionWindows);
	window.addEvent('resize', positionWindows);
}
