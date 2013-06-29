var tnoodle = tnoodle || {};

function xAddListener(obj, event, func, useCapture) {
    if(obj.addEventListener) {
        obj.addEventListener(event, func, useCapture);
    } else {
        obj.attachEvent('on'+event, function(e) { func.call(obj, e); });
    }
}

// This is a useful option for simulating a slow server (milliseconds).
tnoodle.FAKE_SCRAMBLE_DELAY = 0;

tnoodle.Scrambler = function() {
    var tnoodlejsScript = document.createElement('script');
    tnoodlejsScript.setAttribute('src', '/wca/tnoodlejs.nocache.js');
    var puzzles = null;
    window.puzzlesLoaded = function(puzzles_) {
        // TODO - we should deal with the case that people
        // start calling stuff like loadScramble() before
        // this happens.
        puzzles = puzzles_;
        for(var i = 0; i < pendingFunctions.length; i++) {
            var func_args = pendingFunctions[i];
            var func = func_args[0];
            var args = func_args[1];
            func_args[0].apply(that, args);
        }
        pendingFunctions = null;
    };
    document.body.appendChild(tnoodlejsScript);

    function assert(expr) {
        if(!expr) {
            throw "";
        }
    }
    var that = this;


    this.showExt = function(title, scrambleRequest, password, ext, target) {
        // TODO - pdf/zip support in javascript? yikes...
        assert(false);
    };
    this.showPdf = function(title, scrambleRequest, password, target) {
        that.showExt(title, scrambleRequest, password, 'pdf', target);
    };
    this.showZip = function(title, scrambleRequest, password, target) {
        that.showExt(title, scrambleRequest, password, 'zip', target);
    };

    this.loadPuzzles = function(callback, includeStatus) {
        var expectedPuzzles = [];
        for(var shortName in puzzles) {
            var puzzle = puzzles[shortName];
            expectedPuzzles.push({
                shortName: shortName,
                longName: puzzle.getLongName()
            });
        }

        callback(expectedPuzzles);
    };

    this.loadScramble = function(callback, puzzle, seed) {
        return this.loadScrambles(function(scrambles) {
            callback(scrambles[0]);
        }, puzzle, seed, 1);
    };
    var requestCount = 0;
    this.loadScrambles = function(callback, puzzleName, seed, count) {
        var puzzle = puzzles[puzzleName];
        var scrambles;
        if(seed) {
            scrambles = puzzle.generateSeededScrambles(seed, count);
        } else {
            scrambles = puzzle.generateScrambles(count);
        }
        if(tnoodle.FAKE_SCRAMBLE_DELAY) {
            setTimeout(callback.bind(null, scrambles), tnoodle.FAKE_SCRAMBLE_DELAY);
        } else {
            callback(scrambles);
        }
    };
    this.loadPuzzleImageInfo = function(callback, shortName) {
        // callback must be a function(defaultPuzzleInfo)
        // where defaultPuzzleInfo.faces is a {} mapping face names to arrays of points
        // defaultPuzzleInfo.size is the size of the scramble image
        // defaultPuzzleInfo.colorScheme is a {} mapping facenames to hex color strings
        var puzzle = puzzles[shortName];
        var pii = tnoodlejs.getPuzzleImageInfo(puzzle).jsObject;
        callback(pii);
    };

    var pendingFunctions = [];
    function waitForLoadWrapper(func) {
        return function() {
            if(puzzles === null) {
                pendingFunctions.push([func, arguments]);
            } else {
                func.apply(this, arguments);
            }
        };
    }
    for(var method in this) {
        this[method] = waitForLoadWrapper(this[method]);
    }

    // Note that these functions don't get wrapped

    this.toString = function() {
        return "tnoodlejs";
    };
    this.getScrambleImage = function(shortName, scramble, colorScheme, width, height) {
        width = width || 0;
        height = height || 0;
        var puzzle = puzzles[shortName];
        var scheme = this.flattenColorScheme(colorScheme);
        var svgElement = tnoodlejs.scrambleToSvg(scramble, puzzle, width, height, scheme);
        return svgElement;
    };
    this.getPuzzleIcon = function(shortName) {
        var puzzle = puzzles[shortName];
        return tnoodlejs.getPuzzleIcon(puzzle);
    };

    var uploadForm = null;
    this.getUploadForm = function(onsubmit, onload) {
        // TODO - this can be implemented with HTML5 stuff instead
        //onsubmit and onload are only used the first time this method is called
        if(uploadForm === null) {
            uploadForm = document.createElement('div');

            var fileInput = document.createElement("input");
            fileInput.setAttribute('type', 'file');
            fileInput.addEventListener('change', function(e) {
                var files = e.target.files;
                submit.disabled = files.length === 0;
            }, false);

            var submit = document.createElement('input');
            submit.type = 'button';
            submit.value = 'Load Scrambles';
            submit.disabled = true;
            submit.addEventListener('click', function(e) {
                var files = fileInput.files;
                assert(files.length == 1);
                var file = files[0];
                var fileReader = new FileReader();
                fileReader.onload = function(e) {
                    onload(e.target.result.split("\n"));
                };
                fileReader.readAsText(file);
                onsubmit(file.name, submit, fileReader);
            });

            uploadForm.appendChild(fileInput);
            uploadForm.appendChild(submit);
        }
        return uploadForm;
    };

    this.flattenColorScheme = function(colorScheme) {
        var faces = [];
        for(var face in colorScheme) {
            if(colorScheme.hasOwnProperty(face)) {
                faces.push(face);
            }
        }
        faces.sort();
        var scheme = '';
        for(var i = 0; i < faces.length; i++) {
            if(i > 0) { scheme += ','; }
            scheme += colorScheme[faces[i]];
        }
        return scheme;
    };
};
