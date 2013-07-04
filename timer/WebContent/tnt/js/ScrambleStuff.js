//generated from http://ajaxload.info/
var WAITING_ICON_HEIGHT = 11;
var WAITING_ICON = 'media/ajax-loader.gif';

var COLOR_WHEEL_IMAGE = 'media/color_wheel.png';

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

function ScrambleStuff(scrambler, server, loadedCallback, applet) {
    var that = this;

    var configuration = server.configuration;
    var puzzle = null;
    var colorScheme = null;
    var currTurn = null;
    var faceMap = null;
    var defaultColorScheme = null;
    var defaultSize = null;

    function puzzleChanged(altArrow) {
        var newPuzzle = puzzleSelect.getSelected();

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
            scrambleImg.style.height = height;
            scrambleImg.style.width = width;
        } else {
            //we'll have to wait for the scramble info to load to know how big to make the scramble
            width = height = null;
        }

        scrambler.loadPuzzleImageInfo(
            function(puzzleImageInfo) {
                if(puzzleImageInfo.error) {
                    faceMap = null; // scramble images are not supported
                    scrambleImg.setVisible(false, true);
                } else {
                    faceMap = puzzleImageInfo.faces;
                    colorScheme = configuration.get('scramble.' + puzzle + '.colorScheme', clone(puzzleImageInfo.colorScheme));
                    defaultColorScheme = puzzleImageInfo.colorScheme;

                    defaultSize = puzzleImageInfo.size;
                    if(!width || !height) {
                        scrambleImg.style.width = puzzleImageInfo.size.width + "px";
                        scrambleImg.style.height = puzzleImageInfo.size.height + "px";
                    }
                    scrambleResized();

                    // if the scramble has arrived, we format it into the turns
                    if(currScramble) {
                        formatScramble();
                    }

                    recreateColorSchemeChooserImage();

                    // The minimum size of the scramble area may have changed
                    // because we enforce that it is at least as tall as the scramble
                    // image.
                    that.manager.resize();
                }
            }, puzzle);
    }

    var configureColorSchemeImg, configureColorSchemeImgAreas;
    function recreateColorSchemeChooserImage() {
        colorChooser.element.setStyle('visibility', 'hidden');
        currFaceName = null;
        refreshColorSchemeChooserImage();
    }
    function refreshColorSchemeChooserImage() {
        configureColorSchemeImg = scrambler.getScrambleImage(puzzle, null, colorScheme, defaultSize.width, defaultSize.height);
        configureColorSchemeImg.setStyle('width', defaultSize.width);
        configureColorSchemeImg.setStyle('height', defaultSize.height);
        configureColorSchemeImgHolder.empty();
        configureColorSchemeImgHolder.appendChild(configureColorSchemeImg);

        if(configureColorSchemeImg.tagName == "SVG") {
            configureColorSchemeImgAreas = configureColorSchemeImg.getElementsByClassName("puzzleface");
            refreshColorSchemeChooser();
        } else {
            // We must wait for configureColorSchemeImg to load before
            // we can access its configureColorSchemeImg.contentDocument.
            configureColorSchemeImgAreas = null;
            configureColorSchemeImg.addEventListener('load', function(e) {
                configureColorSchemeImgAreas = configureColorSchemeImg.contentDocument.getElementsByClassName("puzzleface");
                refreshColorSchemeChooser();
            });
        }
    }
    function refreshColorSchemeChooser() {
        var scale = 1;
        var refreshHeader = function() {
            deleteChildren(scrambleHeaderText);
            var msg = null;
            if(hoveredFace) {
                msg = 'Click to edit: ' + hoveredFace;
            } else if(currFaceName) {
                msg = 'Editing: ' + currFaceName;
            } else {
                msg = 'Click a face';
            }
            scrambleHeaderText.appendChild(document.createTextNode(msg));
        };
        var setHoveredFace = function() {
            hoveredFace = this.id;
            refreshHeader();
        };
        var clearHoveredFace = function() {
            hoveredFace = null;
            refreshHeader();
        };
        var hoveredFace = null;
        refreshHeader();
        for(var i = 0; i < configureColorSchemeImgAreas.length; i++) {
            var area = configureColorSchemeImgAreas[i];
            area.setAttribute('alt', area.id);
            xAddListener(area, 'click', faceClicked, false);

            xAddListener(area, 'mouseover', setHoveredFace, false);
            xAddListener(area, 'mouseout', clearHoveredFace, false);
        }
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
        if(time.importInfo && time.importInfo.importedScrambles) {
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
        if(currTurn) {
            currTurn.className = 'turn';
        }
        currTurn = this;
        currTurn.className = 'currTurn';
        scrambleImg.setVisible(true, automated);
        scrambleImg.drawScramble(currTurn.incrementalScramble);
    }
    function userClickedTurn() {
        turnClicked.call(this, false);
    }

    var currScramble = null;
    function scrambleLoaded(scramble) {
        setScrambleCopyVisible(false);
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
                var padding = "";
                if(maxLength - turn.length <= 3) {
                    // We only pad if it can be done in <= 3 spaces.
                    // If we can't, we'll just leave the turn be.
                    // This is basically a hack so the "/" turns in sq1
                    // don't get padded.
                    for(var k = turn.length; k < maxLength; k++) {
                        // Padding so all turns take up the same amount of space.
                        // Note that a simple space character isn't good enough,
                        // as it will not force the string "R " to wrap when the string
                        // "R'" would. \u00a0 is the same as &nbsp; and it
                        // prevents this behavior
                        padding += "\u00a0";
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

                var turnSpan = document.createElement('span');
                turnSpan.appendChild(turnLink);
                turnSpan.appendChild(turnPadding);

                scramblePre.appendChild(turnSpan);
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
        currFaceName = this.id;
        colorChooser.setDefaultColor(colorScheme[currFaceName]);
        colorChooser.element.setStyle('visibility', '');
    }

    function scrambleResized() {
        var desiredWidth = parsePx(scrambleImg.style.width);
        var desiredWidthHeight = desiredWidth * defaultSize.height / defaultSize.width;

        var desiredHeight = parsePx(scrambleImg.style.height);
        var desiredHeightWidth = desiredHeight * defaultSize.width / defaultSize.height;

        var imgWidth = Math.max(desiredWidth, desiredHeightWidth, defaultSize.width);
        var imgHeight = Math.max(desiredHeight, desiredWidthHeight, defaultSize.height);

        // TODO - do we want to support resizing the scramble image?
        imgWidth = defaultSize.width;
        imgHeight = defaultSize.height;

        scrambleImg.style.width = imgWidth + "px";
        scrambleImg.style.height = imgHeight + "px";
    }
    function saveScrambleSize() {
        configuration.set('scramble.' + puzzle + '.size.width', scrambleImg.style.width);
        configuration.set('scramble.' + puzzle + '.size.height', scrambleImg.style.height);
        scrambleImg.redraw();
    }

    function puzzlesLoaded(puzzles) {
        deleteChildren(scramblePre);
        puzzleSelect.setDisabled(false);
        var options = [];
        for(var i = 0; i < puzzles.length; i++) {
            var icon = scrambler.getPuzzleIcon(puzzles[i].shortName);
            options.push({ value: puzzles[i].shortName, text: puzzles[i].longName, icon: icon });
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
                (activeImportButton = loadScramblesButton).disabled = true;
                activeImportRequest = scrambler.importScrambles(scramblesImported, url);
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
                (activeImportButton = loadScramblesButton).disabled = true;
                activeImportRequest = scrambler.loadScrambles(scramblesImported, puzzle, seed, count);
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

    if(scrambler.importScrambles) {
        var importUrlLink = document.createElement('span');
        importUrlLink.title = "Import scrambles from url";
        importUrlLink.className = 'link';
        xAddListener(importUrlLink, 'click', promptImportUrl, false);
        importUrlLink.appendChild(document.createTextNode('From Url'));
        importDivTabs.appendChild(importUrlLink);
        importDivTabs.appendChild(document.createTextNode(' '));
    }

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

    var showHideScrambleLink = document.createElement('span');
    showHideScrambleLink.className = 'link';
    showHideScrambleLink.addEvent('click', function(e) {
        that.toggleScrambleView();
    });
    scrambleHeader.appendChild(showHideScrambleLink);

    var setColorSchemeLink = document.createElement('span');
    setColorSchemeLink.className = 'link';
    var colorWheelImage = document.createElement('img');
    colorWheelImage.src = COLOR_WHEEL_IMAGE;
    setColorSchemeLink.appendChild(colorWheelImage);
    setColorSchemeLink.title = 'Configure puzzle color scheme';
    colorWheelImage.setStyle('vertical-align', '-3px');

    function onColorConfigureShow() {
        currFaceName = null;
        recreateColorSchemeChooserImage();
    }
    var configureColorSchemePopup = tnoodle.tnt.createPopup(onColorConfigureShow);
    configureColorSchemePopup.setStyle('text-align', 'center');

    var scrambleHeaderText = document.createElement('div');
    configureColorSchemePopup.appendChild(scrambleHeaderText);

    var configureColorSchemeImgHolder = document.createElement('span');
    configureColorSchemePopup.appendChild(configureColorSchemeImgHolder);

    var resetColorScheme = document.createElement('input');
    resetColorScheme.type = 'button';
    resetColorScheme.value = 'Reset';
    resetColorScheme.addEvent('click', function(e) {
        if(confirm("Reset the color scheme?")) {
            colorScheme = clone(defaultColorScheme);
            configuration.set('scramble.' + puzzle + '.colorScheme', colorScheme);
            scrambleImg.redraw();
            refreshColorSchemeChooserImage();
        }
    });
    tempDiv = document.createElement('div');
    tempDiv.setStyle('text-align', 'right');
    tempDiv.appendChild(resetColorScheme);
    configureColorSchemePopup.appendChild(tempDiv);

    var colorChooser = new ColorChooser(function(newColor) {
        assert(currFaceName);
        colorScheme[currFaceName] = newColor;
        configuration.set('scramble.' + puzzle + '.colorScheme', colorScheme);
        scrambleImg.redraw();
        refreshColorSchemeChooserImage();
    });
    colorChooser.element.setStyle('border', '1px solid black');
    configureColorSchemePopup.appendChild(colorChooser.element);


    setColorSchemeLink.addEvent('click', function(e) {
        configureColorSchemePopup.show();
    });
    scrambleHeader.appendChild(setColorSchemeLink);

    var scrambleInfo = document.createElement('span');
    scrambleHeader.appendChild(scrambleInfo);

    var scramblePre = document.createElement('p');
    scramblePre.className = 'scrambleText';
    scrambleArea.appendChild(scramblePre);

    // While we could mark this text area as readonly, I don't think there's
    // much benefit to it, and it screws up text selection (the box doesn't seem
    // to stay focused).
    var scrambleCopyArea = new Element('textarea');
    scrambleCopyArea.setStyle('padding', 0);
    scrambleCopyArea.setStyle('border', 0);
    scrambleCopyArea.setStyle('resize', 'none');

    var scrambleCopyVisible = false;
    function setScrambleCopyVisible(visible) {
        if(scrambleCopyVisible == visible) {
            return;
        }
        scrambleCopyVisible = visible;
        if(scrambleCopyVisible) {
            var size = scrambleArea.getSize();
            // TODO - magic numbers wtf
            scrambleCopyArea.setStyle('height', size.y-32);
            scrambleCopyArea.setStyle('width', size.x-2);
            scrambleCopyArea.setStyle('font-size', scramblePre.getStyle('font-size'));
            scrambleCopyArea.value = currScramble;

            scrambleCopyArea.replaces(scramblePre);
            scrambleCopyArea.focus();
            scrambleCopyArea.select();
        } else {
            scramblePre.replaces(scrambleCopyArea);
            adjustFontSize();
        }
    }
    scramblePre.addEvent('dblclick', function(e) {
        setScrambleCopyVisible(true);
    });
    scrambleCopyArea.addEvent('blur', setScrambleCopyVisible.bind(null, false));
    scrambleCopyArea.addEvent('keydown', function(e) {
        if(e.key == 'esc') {
            setScrambleCopyVisible(false);
        }
    });

    var scrambleImg = document.createElement('span');
    scrambleImg.setStyle('float', 'right');
    that.invisiblePuzzles = configuration.get('scramble.invisiblePuzzles', {});
    scrambleImg.setVisible = function(visible, automated) {
        if(automated) {
            if(that.invisiblePuzzles[puzzle]) {
                visible = false;
            }
        } else {
            that.invisiblePuzzles[puzzle] = !visible;
            configuration.set('scramble.invisiblePuzzles', this.invisiblePuzzles);
        }

        var showHideScrambleText = null;
        if(visible) {
            showHideScrambleText = 'Hide scramble';
            scrambleImg.inject(scramblePre, 'top');
            scrambleImg.style.display = '';
            setColorSchemeLink.show();
        } else {
            showHideScrambleText = 'Show scramble';
            if(currTurn) {
                currTurn.className = 'turn';
            }
            scrambleImg.style.display = 'none';
            setColorSchemeLink.hide();
        }

        showHideScrambleLink.empty();
        showHideScrambleLink.appendText(showHideScrambleText);

        adjustFontSize();

        // If we just made the scramble visible, we may need to increase the
        // scramble area size.
        that.manager.resize();
    };
    
    scrambleImg.redraw = function() {
        this.drawScramble(currScramble);
    };
    function clobberScrambleImage(newElement) {
        scrambleImg.empty();
        scrambleImg.appendChild(newElement);
    }
    scrambleImg.drawScramble = function(scramble) {
        // no need to waste bandwidth unless we're
        // actually displaying images
        if(scrambleImg.style.display != 'none') {
            if(scramble != currScramble) {
                // since the next image may take a while to load, we place a holder
                this.clear();
            }
            var width = configuration.get('scramble.' + puzzle + '.size.width', null);
            var height = configuration.get('scramble.' + puzzle + '.size.height', null);
            if(!width || !height) {
                width = height = null;
            } else {
                width = width.toInt();
                height = height.toInt();
            }
            var newScrambleImage = scrambler.getScrambleImage(puzzle, scramble, colorScheme, width, height);
            newScrambleImage.setStyle('float', 'right');
            clobberScrambleImage(newScrambleImage);
        }
    };
    var loadingImage = document.createElement("img");
    loadingImage.src = LOADING_IMAGE;
    scrambleImg.clear = function() {
        clobberScrambleImage(loadingImage);
    };

    var puzzleSelect = tnoodle.tnt.createSelect('Click to open last session of puzzle', 'Click to change session puzzle');
    puzzleSelect.onchange = puzzleChanged;
    puzzleSelect.setDisabled(true);

    scramblePre.appendChild(document.createTextNode('Waiting for ' + scrambler.toString() + "..."));
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
        
        function scrambleFits() {
            var turns = scramblePre.getChildren();
            var lastTurn = turns[turns.length-1];
            var textBottom = null;
            var textRight = null;
            if(!lastTurn) {
                textBottom = scramblePre.scrollHeight;
                textRight = scramblePre.scrollWidth;
            } else {
                // TODO - for some reason, scramblePre.scrollWidth is
                // ending up larger than it should. Since all scrambles so far
                // wrap, this hasn't been an issue.
                textRight = 0;

                // We don't want the scramble image to force us to think the
                // scramble doesn't fit, so we manually figure out how low the
                // text goes here.
                var bottomPadding = scramblePre.getStyle('padding-bottom').toInt();
                textBottom = lastTurn.getPosition(scramblePre).y + lastTurn.getSize().y + bottomPadding;
            }
            return textBottom <= scramblePre.clientHeight && textRight <= scramblePre.clientWidth;
        }
        var height = scramblePre.getStyle("height").toInt();
        // Increase font size until the scramble doesn't fit.
        // Sometimes, this can get stuck in an inf loop where
        // scramblePre grows to accomodate the increasing font
        // size. We hold onto the original height to prevent this.
        var f = scramblePre.getStyle('font-size').toInt();
        while(scrambleFits() && f < height) {
            scramblePre.setStyle('font-size', ++f);
        }
        
        // Decrease font size until the scramble fits
        while(!scrambleFits() && f > 10) {
            scramblePre.setStyle('font-size', --f);
        }

        if(paddingSpans.length > 0) {
            if(paddingSpans[0].getPosition().y == paddingSpans[paddingSpans.length-1].getPosition().y) {
                //the scramble is only taking up 1 row! so we disable the padding
                paddingSpans.each(function(el) {
                    el.setStyle('display', 'none');
                });
            }

        }
    }
    
    this.getMinimumSize = function() {
        if(defaultSize && scrambleImg.style.display === '') {
            var paddingVert = scramblePre.getStyle('padding-top').toInt() + scramblePre.getStyle('padding-bottom').toInt();
            var borderVert = scrambleArea.getStyle('border-top').toInt() + scrambleArea.getStyle('border-bottom').toInt();
            return defaultSize.height + scrambleHeader.getSize().y + paddingVert + borderVert;
        }
        return 70;
    };
    this.resize = function() {
        setScrambleCopyVisible(false);

        var space = $('scrambles').getSize();
        var borderVert = scrambleArea.getStyle('border-top').toInt() + scrambleArea.getStyle('border-bottom').toInt();
        space.y -= $('scrambleBorder').getSize().y + borderVert;
        scrambleArea.setStyle('height', space.y);
        space.y -= scrambleHeader.getSize().y;
        var paddingVert = scramblePre.getStyle('padding-top').toInt() + scramblePre.getStyle('padding-bottom').toInt();
        var paddingHorz = scramblePre.getStyle('padding-left').toInt() + scramblePre.getStyle('padding-right').toInt();
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
        if(scrambleImg.style.display == 'none') {
            var turns = $$('.turn'); //fun with css!
            turnClicked.call(turns[turns.length-1], false);
        } else {
            scrambleImg.setVisible(false);
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
}
