// The next line will get replaced with the contents of the
// gwt-generated tnoodlejs.nocache.js. So don't mess with it unless
// you know what you're doing!
//%%tnoodlejs.nocache.js%%

var tnoodle = tnoodle || {};

(function() {
    function workerCodeFunction() {
        function assert(expr) {
            if(!expr) {
                throw "";
            }
        }

        // Simulating window referring to the global scope.

        /*jshint -W079 */
        var window = self;
        var document = {};

        window.document = document;
        document['write'] = function() {};
        window.write = document['write'];
        document.getElementById = function() {};
        document.getElementsByTagName = function() {return [];};
        document.readyState = 'loaded';
        if(window.location) {
            // Firefox actually does set self.location for webworkers
            document.location = window.location;
        } else {
            window.location = { href: "", search: "" };
            document.location = window.location;
        }

        var msg_from_parent = function(e) {
            if(!e.data.shortName) {
                assert(false);
                return;
            }
            var shortName = e.data.shortName;
            var puzzle = puzzles[shortName];
            if(e.data.pii) {
                var pii = tnoodlejs.getPuzzleImageInfo(puzzle);
                self.postMessage({ shortName: shortName, pii: pii });
            } else if(e.data.scramble) {
                var seed = e.data.seed;
                var count = e.data.count || 1;
                var scrambles;
                if(seed) {
                    scrambles = puzzle.generateSeededScrambles(seed, count);
                } else {
                    scrambles = puzzle.generateScrambles(count);
                }
                // Something about the array gwt returns us isn't something we
                // can pass around in a webworker.
                scrambles = scrambles.slice();
                self.postMessage({ shortName: shortName, scrambles: scrambles });
            } else {
                assert(false);
            }
        };
        self.addEventListener('message', msg_from_parent, false);

        var puzzles = null;
        window.puzzlesLoaded = function(puzzles_) {
            puzzles = puzzles_;
            var expectedPuzzles = [];
            for(var shortName in puzzles) {
                var puzzle = puzzles[shortName];
                expectedPuzzles.push({
                    shortName: shortName,
                    longName: puzzle.getLongName()
                });
            }
            self.postMessage({ puzzles: expectedPuzzles });
        };
    }

    tnoodle.Scrambler = function() {
        var puzzles = null;
        var puzzlesCallbacks = [];
        var scramblesCallbacks = [];
        var piiCallbacks = [];
        function msg_from_worker(e) {
            if(e.data.puzzles) {
                puzzles = e.data.puzzles;
                for(var i = 0; i < puzzlesCallbacks.length; i++) {
                    var puzzlesCallback = puzzlesCallbacks[i];
                    puzzlesCallback(puzzles);
                    puzzlesCallback = null;
                }
                puzzlesCallbacks = null;

                maybeCallPendingFunctions();
            } else if(e.data.scrambles) {
                var scramblesCallback = scramblesCallbacks.pop();
                scramblesCallback(e.data.scrambles);
            } else if(e.data.pii) {
                var piiCallback = piiCallbacks.pop();
                piiCallback(e.data.pii);
            } else {
                assert(false);
            }
        }
        function on_worker_error(e) {
            assert(false);
        }

        // Inspired by http://blog.garron.us/2013/introducing-magicworker-js/
        function getFunctionSource(func) {
            var src = func.toString();
            var openCode = src.indexOf("{") + 1;
            var closeCode = src.lastIndexOf("}");
            return src.substring(openCode, closeCode);
        }
        var workerCode = getFunctionSource(workerCodeFunction);
        var gwtCode = getFunctionSource(TNOODLEJS_GWT);
        var blob = new Blob([workerCode + "\n" + gwtCode]);
        var url = window.URL.createObjectURL(blob);
        var w = new Worker(url);
        w.addEventListener('message', msg_from_worker, false);
        w.addEventListener('error', on_worker_error, false);

        var gwtPuzzles = null;
        window.puzzlesLoaded = function(puzzles_) {
            gwtPuzzles = puzzles_;
            maybeCallPendingFunctions();
        };

        function assert(expr) {
            if(!expr) {
                throw "";
            }
        }
        var that = this;

        this.loadPuzzles = function(callback, includeStatus) {
            if(puzzles) {
                callback(puzzles);
            } else {
                puzzlesCallbacks.push(callback);
            }
        };

        this.loadScramble = function(callback, puzzle, seed) {
            return this.loadScrambles(function(scrambles) {
                callback(scrambles[0]);
            }, puzzle, seed, 1);
        };
        var requestCount = 0;
        this.loadScrambles = function(callback, shortName, seed, count) {
            w.postMessage({ shortName: shortName, scramble: true, seed: seed, count: count });
            scramblesCallbacks.push(callback);
        };
        this.loadPuzzleImageInfo = function(callback, shortName) {
            // callback must be a function(defaultPuzzleInfo)
            // where defaultPuzzleInfo.faces is a {} mapping face names to arrays of points
            // defaultPuzzleInfo.size is the size of the scramble image
            // defaultPuzzleInfo.colorScheme is a {} mapping facenames to hex color strings
            w.postMessage({ shortName: shortName, pii: true });
            piiCallbacks.push(callback);
        };

        var pendingFunctions = [];
        function maybeCallPendingFunctions() {
            if(!gwtPuzzles || !puzzles) {
                // We wait for both our webworker to load (puzzles),
                // and for the main thread to load (gwtPuzzles).
                return;
            }
            for(var i = 0; i < pendingFunctions.length; i++) {
                var func_args = pendingFunctions[i];
                var func = func_args[0];
                var args = func_args[1];
                func_args[0].apply(that, args);
            }
            pendingFunctions.length = 0;
        }
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
            var puzzle = gwtPuzzles[shortName];
            var scheme = this.flattenColorScheme(colorScheme);
            var svgElement = tnoodlejs.scrambleToSvg(scramble, puzzle, width, height, scheme);
            return svgElement;
        };
        this.getPuzzleIcon = function(shortName) {
            var puzzle = gwtPuzzles[shortName];
            return tnoodlejs.getPuzzleIcon(puzzle);
        };

        var uploadForm = null;
        this.getUploadForm = function(onsubmit, onload) {
            // TODO onsubmit and onload are only used the first time this method is called
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
})();
