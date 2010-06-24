//generated from http://ajaxload.info/
WAITING_ICON_HEIGHT = 11;
WAITING_ICON = 'ajax-loader.gif';

//LOADING_IMAGE = WAITING_ICON;
//from http://en.wikipedia.org/wiki/Data_URI_scheme
LOADING_IMAGE = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAABGdBTUEAALGPC/xhBQAAAAlwSFlzAAALEwAACxMBAJqcGAAAAAd0SU1FB9YGARc5KB0XV+IAAAAddEVYdENvbW1lbnQAQ3JlYXRlZCB3aXRoIFRoZSBHSU1Q72QlbgAAAF1JREFUGNO9zL0NglAAxPEfdLTs4BZM4DIO4C7OwQg2JoQ9LE1exdlYvBBeZ7jqch9//q1uH4TLzw4d6+ErXMMcXuHWxId3KOETnnXXV6MJpcq2MLaI97CER3N0vr4MkhoXe0rZigAAAABJRU5ErkJggg==";

function setUnfocusable(el) {
	xAddListener(el, 'focus', el.blur, false);
}
function randomString(length) {
	var MIN = 'a'.charCodeAt(0);
	var MAX = 'z'.charCodeAt(0);
	
	var str = "";
	for(var i = 0; i < length; i++) {
		str += String.fromCharCode(MIN + Math.floor(Math.random()*(MAX-MIN)));
	}
	
	return str;
}
function isInteger(s) {
	return s.toString().match(/^-?[0-9]+$/);
}

function deleteChildren(element) {
    while(element.firstChild)
        element.removeChild(element.firstChild);
}
function parsePx(px) {
    return parseInt(px.replace(/px/g, ""));
}
function isOrIsChild(el, parent) {
	while(el != null) {
		if(el == parent)
			return true;
		el = el.parentNode;
	}
	return false;
}
//returns a shallow copy of obj
function clone(obj) {
    var o = {};
    for(var k in obj)
    	if(obj.hasOwnProperty(k))
    		o[k] = obj[k];
    return o;
}

/*** START IE hacks ***/
//from http://snipplr.com/view.php?codeview&id=13523
if(!window.getComputedStyle) {
    window.getComputedStyle = function(el, pseudo) {
        this.el = el;
        this.getPropertyValue = function(prop) {
            var re = /(\-([a-z]){1})/g;
            if (prop == 'float') prop = 'styleFloat';
            if (re.test(prop)) {
                prop = prop.replace(re, function () {
                    return arguments[2].toUpperCase();
                });
            }
            return el.currentStyle[prop] ? el.currentStyle[prop] : null;
        }
        return this;
    }
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
		obj.attachEvent('on'+event, function(e) { func.call(obj, e); });
	}
}
/*** END IE HACKS ***/


function ScrambleStuff(configuration, loadedCallback) {

var puzzle = null;
var colorScheme = null;
var defaultColorScheme = null;

function puzzleChanged() {
	if(importedScrambles) {
		if(confirm("Since you're switching puzzles, would you like to clear the currently imported scrambles?")) {
			importedScrambles = null;
		} else {
			scrambleIndex--;
		}
	}
    var newPuzzle = puzzleSelect.options[puzzleSelect.selectedIndex].value;
    if(newPuzzle == "null") //if nothing is selected
    	newPuzzle = null;
    
    colorScheme = null; //reset colorscheme
    currTurn = null;
    faceMap = null; //this indicates if the current puzzle support images
    currScramble = null;
    puzzle = newPuzzle;
    scrambleImg.clear();
    firePuzzleChanged();
    
    if(puzzle == null)
    	return;

	scramble();
    scrambler.loadPuzzleImageInfo(function(puzzleImageInfo) {
    	if(puzzleImageInfo.error) {
    		faceMap = null; //scramble images are not supported
    		scrambleDiv.setVisible(false, false);
    	} else {
    		//if the scramble has arrived, we format it into the turns
    		if(currScramble)
    			formatScramble();
    		
    		faceMap = puzzleImageInfo.faces;
    		colorScheme = configuration.get('scramble.'+puzzle+'.colorScheme', clone(puzzleImageInfo.colorScheme));
    		defaultColorScheme = puzzleImageInfo.colorScheme;

    		scrambleDivDD.minw = puzzleImageInfo.size.width;
    		scrambleDivDD.minh = puzzleImageInfo.size.height;
    		scrambleDivDD.paddingVert = getScrambleVertPadding();
    		scrambleDivDD.paddingHorz = getScrambleHorzPadding();
    		scrambleDiv.style.width = configuration.get('scramble.' + puzzle + '.size.width', puzzleImageInfo.size.width + getScrambleHorzPadding() + "px");
    		scrambleDiv.style.height = configuration.get('scramble.' + puzzle + '.size.height', puzzleImageInfo.size.height + getScrambleVertPadding() + "px");
    		
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
		scrambleIndex = this.value-1;
		scramble();
	}
}, false);
function scramble() {
	if(puzzle == null) return;
	deleteChildren(scramblePre);

	if(importedScrambles && scrambleIndex >= importedScrambles.length) {
		alert("That was the last imported scramble, switching back to generated scrambles.");
		scrambleIndex = 0;
		scrambleSrc = null;
		importedScrambles = null;
	}
	
	if(importedScrambles == null) {
		deleteChildren(scrambleInfo);
		
		scramblePre.appendChild(document.createTextNode('Loading scramble...'));
		scrambler.loadScramble(scrambleLoaded, puzzle, null);
	} else {
		deleteChildren(scrambleInfo);
		scrambleInfo.appendChild(document.createTextNode("Scramble ("));
		scrambleChooser.setAttribute('max', importedScrambles.length);
		scrambleChooser.setAttribute('size', 1+Math.floor(Math.log(importedScrambles.length)/Math.log(10)));
		scrambleChooser.value = (scrambleIndex+1);
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
    if(currTurn)
        currTurn.className = 'turn';
    currTurn = this;
    currTurn.className = 'currTurn';
    scrambleDiv.setVisible(true, userInvoked);
    scrambleImg.drawScramble(currTurn.incrementalScramble);
}

var currScramble = null;
function scrambleLoaded(scramble) {
	currScramble = scramble;
	
    if(!faceMap) {
    	//scramble images are not supported, so don't bother with links
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
    for(var i = 0; i < turns.length; i++) {
        var turn = turns[i];
        incrementalScramble += turn;
        var turnLink = document.createElement('span');
        turnLink.appendChild(document.createTextNode(turn));
        turnLink.incrementalScramble = incrementalScramble;
        turnLink.className = 'turn';
        xAddListener(turnLink, 'click', function() { turnClicked.call(this, true); }, false);
        scramblePre.appendChild(turnLink);
        if(i == turns.length-1) {
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
    //var headerStyle = window.getComputedStyle(scrambleDivHeader, null);
    //var scrambleHeader = parsePx(headerStyle.getPropertyValue("height")) + parsePx(headerStyle.getPropertyValue("border-bottom-width"));
    var scrambleHeader = 20 + 1 + 2; //apprently dynamically computing this doesn't work on opera
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
	configuration.set('scramble.' + puzzle + '.size.width', scrambleDiv.style.width);
	configuration.set('scramble.' + puzzle + '.size.height', scrambleDiv.style.height);
    var imgWidth = parsePx(scrambleDiv.style.width) - getScrambleHorzPadding();
    scrambleImg.style.width = imgWidth + "px";
    scrambleImg.style.height = parsePx(scrambleDiv.style.height) - getScrambleVertPadding() + "px";
    deleteChildren(scrambleImgMap);
    if(isChangingColorScheme) {
        //TODO - only do the following when we're *done* resizing
        var scale = imgWidth / scrambleDivDD.minw;
        var areas = tnoodle.scrambles.createAreas(faceMap, scale);
        for(var i = 0; i < areas.length; i++) {
            var area = areas[i];
            area.setAttribute('alt', area.faceName);
            xAddListener(area, 'click', faceClicked, false);

            xAddListener(area, 'mouseover', function() { deleteChildren(scrambleHeaderText); scrambleHeaderText.appendChild(document.createTextNode(this.faceName)); }, false);
            xAddListener(area, 'mouseout', function() { deleteChildren(scrambleHeaderText); }, false);
            scrambleImgMap.appendChild(area);
        }
    }
}

function changeColorsClicked() {
    isChangingColorScheme = !isChangingColorScheme;
    if(isChangingColorScheme) {
        if(currTurn)
            currTurn.className = "turn";
        this.className += " buttondown";
        resetColorScheme.style.display = 'inline';
        scrambleImg.drawScramble("");
    } else {
        if(currTurn) //curr turn will not be defined if we just changed puzzles
            turnClicked.call(currTurn);
        this.className = this.className.replace(/\bbuttondown\b/, "");
        colorChooserDiv.style.display = 'none'; //close cholor chooser window
        resetColorScheme.style.display = 'none';
    }
    scrambleResized(); //force image area map to be created
}

function puzzlesLoaded(puzzles) {
	deleteChildren(scramblePre);
    puzzleSelect.disabled = false;
    puzzleSelect.options.length = puzzles.length;
    for(var i = 0; i < puzzles.length; i++) {
        puzzleSelect.options[i] = new Option(puzzles[i][1], puzzles[i][0]);
    }
    loadedCallback();
}

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
	if(currImportLink == newLink)
		newLink = null;
	if(currImportLink)
		currImportLink.className = currImportLink.className.replace(/\bdown\b/, '');
	if(newLink) {
		newLink.className += ' down';
		importDiv.style.display = 'inline';
	} else {
		importDiv.style.display = 'none';
		
		//cancel any outgoing requests
		if(activeImportRequest)
			activeImportRequest.abort()
		if(activeImportButton)
			activeImportButton.disabled = false;
		waitingIcon.style.display = 'none';
	}
	currImportLink = newLink;

	newScrambles.value = '';
	importButton.update();
	return currImportLink != null;
}

var activeImportRequest = null;
var activeImportButton = null;
var scrambleSrc = null;

var urlForm = null;
var urlText = null;
var DEFAULT_URL = "http://nascarjon.us/sunday.txt";
function promptImportUrl() {
	if(!setCurrImportLink(this))
		return;
	if(urlForm == null) { //pretty much copied from promptSeed()
		urlForm = document.createElement('form');
		urlForm.style.cssFloat = urlForm.style.styleFloat = 'left'; //stupid ie
		urlText = document.createElement('input');
		urlText.value = DEFAULT_URL;
		urlText.type = 'text';
		urlText.style.width = '200px';
		xAddListener(urlText, 'input', function(e) {
			loadScramblesButton.disabled = (this.value.length == 0); 
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
	if(!setCurrImportLink(this))
		return;
	if(uploadForm == null) {
		function scramblesRequested(fileName, submitButton, request) {
    		scrambleSrc = document.createElement('span');
    		var em = document.createElement('em');
    		em.appendChild(document.createTextNode(fileName));
    		scrambleSrc.appendChild(em);
    		
    		waitingIcon.style.display = 'inline';
			activeImportRequest = request;
			(activeImportButton = submitButton).disabled = true;
    	}
		uploadForm = scrambler.getUploadForm(scramblesRequested, scramblesImported);
		uploadForm.style.cssFloat = uploadForm.style.styleFloat = 'left'; //stupid ie
	}
	deleteChildren(importArea);
	importArea.appendChild(uploadForm);
}

var seedForm = null;
var seedText = null;
var scrambleCount = null;
function promptSeed() {
	if(!setCurrImportLink(this))
		return;
	if(seedForm == null) {
		seedForm = document.createElement('form');
		seedForm.style.cssFloat = seedForm.style.styleFloat = 'left'; //stupid ie
		
		seedText = document.createElement('input');
		seedText.setAttribute('type', 'text');
		seedText.style.width = '160px';
		seedText.setAttribute('title', "If you agree upon a seed with someone else, you'll be guaranteed to get the same scrambles as them. " +
				"Leave blank for totally random scrambles.");
		
		scrambleCount = document.createElement('input');
		scrambleCount.setAttribute('type', 'number');
		scrambleCount.setAttribute('step', '1');
		scrambleCount.setAttribute('min', '1');
		scrambleCount.setAttribute('size', '4'); //adding 1 for opera
		scrambleCount.value = 12;
		
		var loadScramblesButton = document.createElement('input');
		loadScramblesButton.setAttribute('type', 'submit');
		loadScramblesButton.value = 'Seed Scrambles';
		seedForm.onsubmit = function() {
			var seed = seedText.value;
			if(seed.length == 0)
				seed = null; //this will use pregenerated scrambles, which should be a lot faster
			
			var count = parseInt(scrambleCount.value);
			if(!count)
				return false;
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

    var dragDrop = new DragDrop();

    var scrambleArea = document.createElement('div');
    scrambleArea.className = 'scrambleArea';
    
	    var importDiv = document.createElement('div');
	    importDiv.className = 'importDiv';
	    scrambleArea.appendChild(importDiv);
	    importDiv.style.display = 'none';
	    
	    	var tempDiv = document.createElement('div');
		    tempDiv.style.overflow = 'hidden'; //need this for ie
	    	importDiv.appendChild(tempDiv);
	    	
	    	var importArea = document.createElement('span');
	    	tempDiv.appendChild(importArea);
	    	
	    	var waitingIcon = document.createElement('img');
	    	waitingIcon.src = WAITING_ICON;
	    	waitingIcon.style.display = 'none';
	    	waitingIcon.style.marginTop = (18-11)/2 + 'px';
	    	waitingIcon.style.cssFloat = waitingIcon.style.styleFloat = 'right';
	    	tempDiv.appendChild(waitingIcon);
	    	
		    var newScrambles = document.createElement('textarea');
		    newScrambles.setAttribute('wrap', 'off');
		    newScrambles.style.width = '420px';
		    newScrambles.style.height = '180px';
		    newScrambles.getScrambles = function() {
		    	var scrambles = newScrambles.value.split('\n');
		    	for(var i = scrambles.length-1; i >= 0; i--) {
		    		if(scrambles[i].trim().length == 0) {
		    			scrambles.splice(i, 1); //remove all empty rows
		    		}
		    	}
		    	return scrambles;
		    };
		    importDiv.appendChild(newScrambles);
		    
		    var tempDiv = document.createElement('div');
		    tempDiv.style.textAlign = 'right';
		    importDiv.appendChild(tempDiv);
		    
		    var importButton = document.createElement('input');
		    importButton.type = 'button';
		    importButton.update = function() {
		    	var scrambles = newScrambles.getScrambles();
		    	importButton.value = 'Import';
		    	if(scrambles.length > 0)
		    		importButton.value += ' ' + scrambles.length + " scramble(s)";
		    	importButton.disabled = scrambles.length == 0;
		    };
		    
		    xAddListener(newScrambles, 'input', function(e) { importButton.update(); });
		    xAddListener(importButton, 'click', function() {
		    	var scrambles = newScrambles.getScrambles();
		    	if(scrambles.length > 0) {
		    		importedScrambles = scrambles;
		    		scrambleIndex = 0;
		    		scramble();
		    		setCurrImportLink(null);
		    	}
		    }, false);
		    tempDiv.appendChild(importButton);
		    
		    var cancelImportButton = document.createElement('input');
		    cancelImportButton.type = 'button';
		    cancelImportButton.value = 'Cancel';
		    xAddListener(cancelImportButton, 'click', function() { setCurrImportLink(null); });
		    tempDiv.appendChild(cancelImportButton);
	    
    	var scrambleHeader = document.createElement('div');
    	scrambleHeader.className = 'scrambleHeader';
    	scrambleArea.appendChild(scrambleHeader);
    	
    	var importUrlLink = document.createElement('span');
    	importUrlLink.title = "Import scrambles from url";
    	importUrlLink.className = 'link';
    	xAddListener(importUrlLink, 'click', promptImportUrl, false);
    	importUrlLink.appendChild(document.createTextNode('From Url'));
    	scrambleHeader.appendChild(importUrlLink);
    	scrambleHeader.appendChild(document.createTextNode(' '));
    	
    	var importFileLink = document.createElement('span');
    	importFileLink.title = "Import scrambles from file";
    	importFileLink.className = 'link';
    	xAddListener(importFileLink, 'click', promptImportFile, false);
    	importFileLink.appendChild(document.createTextNode('From File'));
    	scrambleHeader.appendChild(importFileLink);
    	scrambleHeader.appendChild(document.createTextNode(' '));
    	
    	var seedLink = document.createElement('span');
    	seedLink.title = "Generate scrambles from a seed, perfect for racing!";
    	seedLink.className = 'link';
    	xAddListener(seedLink, 'click', promptSeed, false);
    	seedLink.appendChild(document.createTextNode('Seed'));
    	scrambleHeader.appendChild(seedLink);
    	scrambleHeader.appendChild(document.createTextNode(' '));
    	
    	var newScrambleLink = document.createElement('span');
    	newScrambleLink.title = "Clear whatever may be imported and get a new scramble.";
    	newScrambleLink.className = 'link';
    	xAddListener(newScrambleLink, 'click', function() {
    		if(!importedScrambles || confirm('This will clear any imported scrambles, are you sure you want to continue?')) {
    			importedScrambles = null;
    			setCurrImportLink(null);
    			scramble();
    		}
    	}, false);
    	newScrambleLink.appendChild(document.createTextNode('New Scramble'));
    	scrambleHeader.appendChild(newScrambleLink);
    	
    	function createResizer(step) {
    		var resize = function(e) {
    			setTimeout(function() {
    				if(!mouseDown)
    					return;
    				var size = parsePx(scramblePre.style.fontSize);
    				size += step;
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
    			}, 0); //wait for mouseDown to get set
    		}
    		return resize;
    	}
    	
    	var increase = document.createElement('span');
    	increase.className = 'increaseSize';
    	increase.appendChild(document.createTextNode('+'));
    	xAddListener(increase, 'mousedown', createResizer(1), false);
    	
    	var decrease = document.createElement('span');
    	decrease.className = 'decreaseSize';
    	decrease.appendChild(document.createTextNode('\u2013')); //en dash
    	xAddListener(decrease, 'mousedown', createResizer(-1), false);
    	
    	var scrambleSize = document.createElement('span');
    	scrambleSize.setAttribute('class', 'changeSize');
    	scrambleSize.appendChild(increase);
    	scrambleSize.appendChild(decrease);
    	scrambleHeader.appendChild(scrambleSize);

    	var mouseDown = false;
    	xAddListener(document, 'mouseup', function(e) {
    		mouseDown = false;
    	}, false);
    	xAddListener(document, 'mousedown', function(e) {
    		mouseDown = true;
    		if(!e.target) e.target = e.srcElement; //freaking ie, man
    		var clz = e.target.className;
    		if(clz.match(/\blink\b/) || clz.match(/\btitlebar\b/)) //kinda hacky, but should work
    			return;
    		
    		if(isOrIsChild(e.target, puzzleSelect)) {
    			//we allow the user to switch scrambles while importing
    			return;
    		}
    			
    		if(!isOrIsChild(e.target, importDiv))
    			setCurrImportLink(null);
    	}, false);
    	
    	/* TODO use something like zero copy here? or do what google maps does and popup a selected text box?
    	var copyLink = document.createElement('span');
    	copyLink.className = 'link';
    	xAddListener(copyLink, 'click', function() { console.log(this); }, false);
    	copyLink.appendChild(document.createTextNode('Copy'));
    	scrambleHeader.appendChild(copyLink);
    	scrambleHeader.appendChild(document.createTextNode(' '));
    	*/
    	
    	var scrambleInfo = document.createElement('span');
    	scrambleHeader.appendChild(scrambleInfo);
    	
	    var scramblePre = document.createElement('pre');
	    scramblePre.className = 'scrambleText';
	    scramblePre.style.fontSize = configuration.get('scramble.fontSize', '20px');
	    scrambleArea.appendChild(scramblePre);
	
    var scrambleDiv = document.createElement('div');
    scrambleDiv.style.display = 'none'; //this has to be after the element is set draggable
	scrambleDiv.className = 'window';
	document.body.appendChild(scrambleDiv);

		var scrambleDivHeader = document.createElement("div");
		scrambleDivHeader.className = 'titlebar';
		scrambleDiv.appendChild(scrambleDivHeader);
		scrambleDiv.id = 'scrambleDiv'; //have to have an id to make it draggable
		scrambleDiv.visibleIfPossible = configuration.get('scramble.visible', true);
		scrambleDiv.setVisible = function(visible, userInvoked) {
			if(userInvoked) {
				this.visibleIfPossible = visible;
				configuration.set('scramble.visible', visible);
			} else
				visible &= this.visibleIfPossible;
			if(visible) {
				scrambleDiv.style.display = 'inline';
			} else {
				if(currTurn)
					currTurn.className = 'turn';
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
			xAddListener(closeScramble, 'click', function() { scrambleDiv.setVisible(false, true); }, false);
			scrambleDivHeader.appendChild(closeScramble);
			
			var changeColors = document.createElement('span');
			changeColors.className = 'button changeColors';
			changeColors.setAttribute('title', 'Change color scheme');
			//changeColors.appendChild(document.createTextNode('#'));
			xAddListener(changeColors, 'click', changeColorsClicked, false);
			scrambleDivHeader.appendChild(changeColors);
			
			var resetColorScheme = document.createElement('span');
			//resetColorScheme.appendChild(document.createTextNode('*'));
			resetColorScheme.setAttribute('title', 'Reset color scheme');
			resetColorScheme.className = 'button reset';
			resetColorScheme.style.display = 'none';
			xAddListener(resetColorScheme, 'click', function() {
				if(confirm("Reset the color scheme?")) {
					colorScheme = clone(defaultColorScheme);
					configuration.set('scramble.'+puzzle+'.colorScheme', colorScheme);
					scrambleImg.drawScramble("");
				}
			}, false);
			scrambleDivHeader.appendChild(resetColorScheme);
		//end scrambleDivHeader

		var scrambleImg = document.createElement('img');
		scrambleImg.setAttribute('usemap', '#scrambleImgMap');
		scrambleDiv.appendChild(scrambleImg);
		
		scrambleImg.redraw = function() {
		    this.drawScramble(currScramble);
		};
		scrambleImg.drawScramble = function(scramble) {
		    if(scrambleDiv.style.display != 'none') { //no need to waste bandwidth unless we're actually displaying images
		    	this.clear(); //since the next image may take a while to load, we place this one first
			    this.src = scrambler.getScrambleImageUrl(puzzle, scramble, colorScheme);
		    }
		}
		scrambleImg.clear = function() {
			this.src = LOADING_IMAGE;
		}
		
		var scrambleImgMap = document.createElement('map');
		scrambleImgMap.setAttribute('name', 'scrambleImgMap');
		scrambleDiv.appendChild(scrambleImgMap);
		
		var resizeDiv = document.createElement('div');
		resizeDiv.className = "dragresize dragresize-br";
		scrambleDiv.appendChild(resizeDiv);
	//end scrambleDiv
		scrambleDiv.style.top = configuration.get('scramble.location.top', '0px');
		scrambleDiv.style.left = configuration.get('scramble.location.left', '0px');
    var scrambleDivDD = dragDrop.createDraggable(RESET_Z, SCALABLE, scrambleDiv.id);
    scrambleDivDD.resizeFunc = scrambleResized;
    scrambleDivDD.moveFunc = scrambleMoved;

    var puzzleSelect = document.createElement('select');
    puzzleSelect.onchange = puzzleChanged; //for some reason, the change event doesn't fire until the select loses focus
    puzzleSelect.disabled = true;

    var colorChooserDiv = document.createElement('div');
	colorChooserDiv.id = 'colorChooserDiv'; // need an id to make it draggable
	colorChooserDiv.className = 'window';
	colorChooserDiv.style.zIndex = 1;
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
		//end titlebar
		var colorChooser = new ColorChooser(function(newColor) {
			colorScheme[currFaceName] = newColor;
			configuration.set('scramble.'+puzzle+'.colorScheme', colorScheme);
			colorChooserDiv.style.display = 'none';
			scrambleImg.drawScramble("");
		});
		colorChooserDiv.appendChild(colorChooser.element);
	//end colorChooserDiv
	
    var colorChooserDD = dragDrop.createDraggable(RESET_Z, colorChooserDiv.id);
    colorChooserDiv.style.width = colorChooser.preferredWidth + 'px';
    colorChooserDiv.style.height = colorChooser.preferredHeight + 'px';
    colorChooserDiv.style.display = 'none';

    var scrambler = new tnoodle.scrambles.server('localhost', 8080);
//	var scrambler = new tnoodle.scrambles.applet(puzzlesLoaded);
    scramblePre.appendChild(document.createTextNode('Connecting to ' + scrambler.toString() + "..."));
    scrambler.connect(puzzlesLoaded);
    
	// public variables
	this.puzzleSelect = puzzleSelect;
	this.scrambleArea = scrambleArea;
	
	// public methods
	this.scramble = scramble;
	this.getSelectedPuzzle = function() {
		return puzzle;
	}
	//even if this is the same puzzle, will generate a new scramble
	this.setSelectedPuzzle = function(newPuzzle) {
		puzzleSelect.value = newPuzzle;
		puzzleChanged();
	}
	
	var scrambleListeners = [];
	this.addScrambleChangeListener = function(l) {
		scrambleListeners.push(l);
	}
	function fireScrambleChanged() {
		for(var i = 0; i < scrambleListeners.length; i++)
			scrambleListeners[i]();
	}
	
	var puzzleListeners = [];
	this.addPuzzleChangeListener = function(l) {
		puzzleListeners.push(l);
	}
	function firePuzzleChanged() {
		for(var i = 0; i < puzzleListeners.length; i++)
			puzzleListeners[i](puzzle);
	}
}
