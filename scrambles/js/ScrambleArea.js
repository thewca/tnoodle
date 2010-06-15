function deleteChildren(element) {
    while(element.firstChild)
        element.removeChild(element.firstChild);
}
function parsePx(px) {
    return parseInt(px.replace(/px/g, ""));
}
//resturns a shallow copy of obj
function clone(obj) {
    var o = {};
    for(var k in obj)
        o[k] = obj[k];
    return o;
}


function ScrambleArea() {


function puzzlesLoaded(puzzles) {
    puzzleSelect.disabled = false;
    for(var i = 0; i < puzzles.length; i++) {
        puzzleSelect.options[puzzleSelect.options.length] = new Option(puzzles[i][1], puzzles[i][0]);
    }
}

var puzzle = null;
var colorScheme = null;
var defaultColorScheme = null;
function clearScrambleImage() {
	//this gives us a loading image while we're waiting for the new one
	//from http://en.wikipedia.org/wiki/Data_URI_scheme
	scrambleImg.src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAABGdBTUEAALGPC/xhBQAAAAlwSFlzAAALEwAACxMBAJqcGAAAAAd0SU1FB9YGARc5KB0XV+IAAAAddEVYdENvbW1lbnQAQ3JlYXRlZCB3aXRoIFRoZSBHSU1Q72QlbgAAAF1JREFUGNO9zL0NglAAxPEfdLTs4BZM4DIO4C7OwQg2JoQ9LE1exdlYvBBeZ7jqch9//q1uH4TLzw4d6+ErXMMcXuHWxId3KOETnnXXV6MJpcq2MLaI97CER3N0vr4MkhoXe0rZigAAAABJRU5ErkJggg==";
}
function scramble() {
    var newPuzzle = puzzleSelect.options[puzzleSelect.selectedIndex].value;
    if(newPuzzle != puzzle) {
        //puzzle change!
        colorScheme = null; //reset colorscheme
        currTurn = null;
        faceMap = null;
        puzzle = newPuzzle;

        scrambler.loadPuzzleImageInfo(function(puzzleImageInfo) {
            faceMap = puzzleImageInfo.faces;
            colorScheme = colorScheme || puzzleImageInfo.colorScheme;
            defaultColorScheme = clone(puzzleImageInfo.colorScheme);

            scrambleDivDD.minw = puzzleImageInfo.size.width;
            scrambleDivDD.minh = puzzleImageInfo.size.height;
            scrambleDivDD.paddingVert = getScrambleVertPadding();
            scrambleDivDD.paddingHorz = getScrambleHorzPadding();
            scrambleDiv.style.width = puzzleImageInfo.size.width + getScrambleHorzPadding() + "px";
            scrambleDiv.style.height = puzzleImageInfo.size.height + getScrambleVertPadding() + "px";
            scrambleResized();
        }, puzzle);
    }

    deleteChildren(scramblePre);
	clearScrambleImage();
    scramblePre.appendChild(document.createTextNode('Loading scramble...'));
    scrambler.loadScramble(scrambleLoaded, puzzle, null);
}
function turnClicked() {
    if(isChangingColorScheme) {
        // first, we cancel editing of the colorscheme
        changeColorsClicked.call(changeColors);
    }
    scrambleDiv.style.display = 'inline'; // make scramble visible
    if(currTurn)
        currTurn.className = 'turn';
    currTurn = this;
    drawScramble(currTurn.incrementalScramble);
    currTurn.className = 'currTurn';
}
function scrambleLoaded(scramble) {
    deleteChildren(scramblePre);
    var turns = scramble.split(' ');
    var incrementalScramble = "";
    for(var i = 0; i < turns.length; i++) {
        var turn = turns[i];
        incrementalScramble += turn;
        var turnLink = document.createElement('span');
        turnLink.textContent = turn;
        turnLink.incrementalScramble = incrementalScramble;
        turnLink.setAttribute('class', 'turn');
        turnLink.addEventListener('click', turnClicked, false);
        scramblePre.appendChild(turnLink);
        if(i == turns.length-1) {
            turnClicked.call(turnLink);
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

var currScramble;
function redrawScramble() {
    drawScramble(currScramble);
}
function drawScramble(scramble) {
    currScramble = scramble;
	clearScrambleImage(); //since the next image may take a while to load, we place this one first
    scrambleImg.src = scrambler.getScrambleImageUrl(puzzle, scramble, colorScheme);
}

function getScrambleVertPadding() {
    //var headerStyle = window.getComputedStyle(scrambleDivHeader, null);
    //var scrambleHeader = parsePx(headerStyle.getPropertyValue("height")) + parsePx(headerStyle.getPropertyValue("border-bottom-width"));
    scrambleHeader = 20; //apprently dynamically computing this doesn't work on opera
    var scrambleStyle = window.getComputedStyle(scrambleImg, null);
    return parsePx(scrambleStyle.getPropertyValue("padding-top")) + parsePx(scrambleStyle.getPropertyValue("padding-bottom")) + scrambleHeader;
}
function getScrambleHorzPadding() {
    var scrambleStyle = window.getComputedStyle(scrambleImg, null);
    return parsePx(scrambleStyle.getPropertyValue("padding-left")) + parsePx(scrambleStyle.getPropertyValue("padding-right"));
}

function scrambleResized() {
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
            area.addEventListener('click', faceClicked, false);

            area.addEventListener('mouseover', function() { deleteChildren(scrambleHeaderText); scrambleHeaderText.appendChild(document.createTextNode(this.faceName)); }, false);
            area.addEventListener('mouseout', function() { deleteChildren(scrambleHeaderText); }, false);
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
        drawScramble("");
    } else {
        if(currTurn) //curr turn will not be defined if we just changed puzzles
            turnClicked.call(currTurn);
        this.className = this.className.replace(/\bbuttondown\b/, "");
        colorChooserDiv.style.display = 'none'; //close cholor chooser window
        resetColorScheme.style.display = 'none';
    }
    scrambleResized(); //force image area map to be created
}

    //var scrambler = new tnoodle.scrambles.server('localhost', 8080, puzzlesLoaded);
	var scrambler = new tnoodle.scrambles.applet(puzzlesLoaded);
    //scrambler.loadAvailablePuzzles(puzzlesLoaded);
	var isChangingColorScheme = false;

    var dragDrop = new DragDrop();

    var scramblePre = document.createElement('pre');
	
    var scrambleDiv = document.createElement('div');
    scrambleDiv.style.display = 'none'; //this has to be after the element is set draggable
	scrambleDiv.className = 'window';
	document.body.appendChild(scrambleDiv);

		var scrambleDivHeader = document.createElement("div");
		scrambleDivHeader.className = 'titlebar';
		scrambleDiv.appendChild(scrambleDivHeader);
		scrambleDiv.id = 'scrambleDiv'; //have to have an id to make it draggable
		
			var scrambleHeaderText = document.createElement("span");
			scrambleHeaderText.className = 'titletext';
			scrambleDivHeader.appendChild(scrambleHeaderText);
			
			var resetColorScheme = document.createElement('span');
			resetColorScheme.appendChild(document.createTextNode('*'));
			resetColorScheme.setAttribute('title', 'Reset color scheme');
			resetColorScheme.className = 'button';
			resetColorScheme.style.display = 'none';
			resetColorScheme.addEventListener('click', function() {
				if(confirm("Reset the color scheme?")) {
					colorScheme = clone(defaultColorScheme);
					redrawScramble();
				}
			}, false);
			scrambleDivHeader.appendChild(resetColorScheme);
			
			var changeColors = document.createElement('span');
			changeColors.className = 'button';
			changeColors.setAttribute('title', 'Change color scheme');
			changeColors.appendChild(document.createTextNode('#'));
			changeColors.addEventListener('click', changeColorsClicked, false);
			scrambleDivHeader.appendChild(changeColors);
			
			var closeScramble = document.createElement('span');
			closeScramble.appendChild(document.createTextNode('X'));
			closeScramble.className = 'button';
			closeScramble.addEventListener('click', function() {
				currTurn.setAttribute('class', 'turn');
				scrambleDiv.style.display = 'none';
				colorChooserDiv.style.display = 'none';
			}, false);
			scrambleDivHeader.appendChild(closeScramble);
		//end scrambleDivHeader

		var scrambleImg = document.createElement('img');
		scrambleImg.setAttribute('usemap', '#scrambleImgMap');
		scrambleDiv.appendChild(scrambleImg);
		
		var scrambleImgMap = document.createElement('map');
		scrambleImgMap.setAttribute('name', 'scrambleImgMap');
		scrambleDiv.appendChild(scrambleImgMap);
		
		var resizeDiv = document.createElement('div');
		resizeDiv.className = "dragresize dragresize-br";
		scrambleDiv.appendChild(resizeDiv);
	//end scrambleDiv
    var scrambleDivDD = dragDrop.createDraggable(RESET_Z, SCALABLE, scrambleDiv.id);
    scrambleDivDD.resizeFunc = scrambleResized;

    var puzzleSelect = document.createElement('select');
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
			closeColorChooser.addEventListener('click', function() {
				colorChooserDiv.style.display = 'none';
			}, false);
			titlebar.appendChild(closeColorChooser);
		//end titlebar
		var colorChooser = new ColorChooser(function(newColor) {
			colorScheme[currFaceName] = newColor;
			colorChooserDiv.style.display = 'none';
			redrawScramble();
		});
		colorChooserDiv.appendChild(colorChooser.element);
	//end colorChooserDiv
	
    var colorChooserDD = dragDrop.createDraggable(RESET_Z, colorChooserDiv.id);
    colorChooserDiv.style.width = colorChooser.preferredWidth + 'px';
    colorChooserDiv.style.height = colorChooser.preferredHeight + 'px';
    colorChooserDiv.style.display = 'none';

	
	// public variables
	this.puzzleSelect = puzzleSelect;
	this.scramblePre = scramblePre;
	
	// public methods
	this.scramble = scramble;
	this.getSelectedPuzzle = function() {
		return puzzle;
	}
}
