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

tnoodle.Scrambler = function(hostname, port, protocol) {
    function assert(expr) {
        if(!expr) {
            throw "";
        }
    }
    var that = this;

    if(!hostname) {
        hostname = location.hostname;
        port = location.port;
        protocol = location.protocol;
    }
    if(!port) {
        port = "80";
    }
    if(!protocol) {
        protocol = "http:";
    }
    this.serverUrl = protocol + "//" + hostname + ":" + port;

    /**** Scramble server stuff ***/
    this.puzzlesUrl = this.serverUrl + "/puzzles/.json";
    this.scrambleUrl = this.serverUrl + "/scramble/";
    this.viewUrl = this.serverUrl + "/view/";
    this.importUrl = this.serverUrl + "/import/";

    //TODO - document!
    this.createAreas = function(faces, scale) {
        var deepJoin = function(arr, sep) {
            return arr.map(function(item) { return item.map(function(coord) { return coord*scale; }).join(sep); }).join(sep);
        };
        var areas = [];
        for(var faceName in faces) {
            if(faces.hasOwnProperty(faceName)) {
                var faceAreas = faces[faceName];
                for(var i = 0; i < faceAreas.length; i++) {
                    var area = document.createElement('area');
                    area.faceName = faceName;
                    area.setAttribute('shape', 'poly');
                    var coords = deepJoin(faceAreas[i], ",");
                    area.setAttribute('coords', coords);

                    areas.push(area);
                }
            }
        }
        return areas;
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

    this.showExt = function(title, scrambleRequest, password, ext, target) {
        var params = { scrambles: JSON.stringify(scrambleRequest) };
        if(password) {
            params.password = password;
        }
        tnoodle.postToUrl(that.viewUrl + encodeURIComponent(title) + '.' + ext, params, "POST", target);
    };
    this.showPdf = function(title, scrambleRequest, password, target) {
        that.showExt(title, scrambleRequest, password, 'pdf', target);
    };
    this.showZip = function(title, scrambleRequest, password, target) {
        that.showExt(title, scrambleRequest, password, 'zip', target);
    };

    this.loadPuzzles = function(callback, includeStatus) {
        var query = {};
        if(includeStatus) {
            query.includeStatus = 'true';
        }
        return tnoodle.retryAjax(callback, this.puzzlesUrl, query);
    };

    this.loadScramble = function(callback, puzzle, seed) {
        return this.loadScrambles(function(scrambles) {
            callback(scrambles[0]);
        }, puzzle, seed, 1);
    };
    var requestCount = 0;
    this.loadScrambles = function(callback, puzzle, seed, count) {
        var query = {};
        if(seed) { query.seed = seed; }
        if(!count) { count = 1; }

        // The backend lightly protects itself by not allowing more than 100
        // scrambles in a single request.
        assert(count <= 100);

        query[''] = encodeURIComponent(puzzle) + "*" + count;
        // Freaking Chrome seems to cache scramble requests if they're close enough
        // together, even if we POST. This forces it to not.
        query['showIndices'] = (requestCount++);
        var pendingLoadScrambles = tnoodle.retryAjax(function(scrambleRequests) {
            assert(!scrambleRequests.error);

            var scrambles = [];
            for(var i = 0; i < scrambleRequests.length; i++) {
                scrambles = scrambles.concat(scrambleRequests[i].scrambles);
            }
            if(tnoodle.FAKE_SCRAMBLE_DELAY) {
                setTimeout(callback.bind(null, scrambles), tnoodle.FAKE_SCRAMBLE_DELAY);
            } else {
                callback(scrambles);
            }
        }, this.scrambleUrl + ".json", query);
        return pendingLoadScrambles;
    };
    this.getScrambleImageUrl = function(puzzle, scramble, colorScheme, width, height) {
        scramble = scramble || "";
        var query = { "scramble": scramble };
        if(width) { query.width = width; }
        if(height) { query.height = height; }
        if(colorScheme) {
            query.scheme = this.flattenColorScheme(colorScheme);
        }
        return this.viewUrl + encodeURIComponent(puzzle) + ".png?" + tnoodle.toQueryString(query);
    };
    this.getPuzzleIconUrl = function(puzzle) {
        return this.viewUrl + encodeURIComponent(puzzle) + ".png?icon=true";
    };
    this.loadPuzzleImageInfo = function(callback, puzzle) {
        // callback must be a function(defaultPuzzleInfo)
        // where defaultPuzzleInfo.faces is a {} mapping face names to arrays of points
        // defaultPuzzleInfo.size is the size of the scramble image
        // defaultPuzzleInfo.colorScheme is a {} mapping facenames to hex color strings
        return tnoodle.retryAjax(callback, this.viewUrl + encodeURIComponent(puzzle) + ".json", null);
    };
    this.importScrambles = function(callback, url) {
        return tnoodle.retryAjax(callback, this.importUrl, { url: url });
    };

    var uploadForm = null;
    this.getUploadForm = function(onsubmit, onload) {
        // TODO - this can be implemented with HTML5 stuff instead
        //onsubmit and onload are only used the first time this method is called
        if(uploadForm === null) {
            var sendFileIframe = document.createElement('iframe');
            sendFileIframe.style.display = 'none';
            sendFileIframe.name = 'sendFileIframe';
            sendFileIframe.src = 'about:blank';
            document.body.appendChild(sendFileIframe);
            var serverUrl = this.serverUrl;
            xAddListener(window, "message", function(e) {
                if(e.origin == serverUrl) {
                    var scrambles = JSON.parse(e.data);
                    onload(scrambles);
                } else {
                    onload({error: "Bad origin: " + e.origin + ", expecting " + serverUrl});
                }
            }, false);

            uploadForm = document.createElement('form');
            uploadForm.setAttribute('method', 'post');
            uploadForm.setAttribute('action', this.importUrl);
            uploadForm.setAttribute('enctype', 'multipart/form-data');
            uploadForm.setAttribute('target', 'sendFileIframe');
            xAddListener(uploadForm, 'submit', function() {
                var abortSubmit = { abort: function() { sendFileIframe.src='about:blank'; } };
                onsubmit(fileInput.value, submit, abortSubmit);
            }, false);

            var fileInput = document.createElement('input');
            fileInput.setAttribute('type', 'file');
            fileInput.setAttribute('name', 'scrambles');
            var submit = document.createElement('input');
            submit.type = 'submit';
            submit.value = 'Load Scrambles';

            uploadForm.appendChild(fileInput);
            uploadForm.appendChild(submit);
        }
        return uploadForm;
    };
    this.toString = function() {
        return this.serverUrl;
    };
};

tnoodle.appendParams = function(url, params) {
    if(params) {
        if(url.indexOf("?") < 0) {
            url += "?";
        }
        url += tnoodle.toQueryString(params);
    }
    return url;
};

/*** Utility functions ***/
tnoodle.ajax = function(callback, url, data) {
    // Don't clobber the original url, we might need it to jsonp later.
    var dataUrl = tnoodle.appendParams(url, data);

    var xhr = new XMLHttpRequest();
    if(xhr.withCredentials === undefined) {
        xhr = null;
        if(typeof(XDomainRequest) != "undefined") {
            xhr = new XDomainRequest();
            try {
                xhr.open('GET', dataUrl);
            } catch(error) {
                //this throws an exception when running locally on ie
                xhr = null;
            }
        }
        if(xhr === null) {
            // Opera 11 doesn't have XDomainRequest, so
            // we'll make an attempt to use jsonp here.
            return tnoodle.jsonp(callback, url, data);
        }
    } else {
        xhr.open('GET', dataUrl, true);
    }
    xhr.onload = function() {
        try {
            callback(JSON.parse(this.responseText));
        } catch(error) {
            callback({error: error + " (" + this.responseText + ")" });
        }
    };
    xhr.onerror = function(error) {
        callback({error: error});
    };
    try {
        xhr.send(null);
    } catch(err) {
        callback({error: err});
    }
    return xhr;
};

// 5 minute timeout
tnoodle.AJAX_TIMEOUT = 5*60*1000;

// We never wait more than this long before trying again
tnoodle.MAX_BACKOFF = 30*1000;

tnoodle.ajaxState = {};
tnoodle.ajaxId = 0;

tnoodle.ajaxStateListeners = [];
tnoodle.fireAjaxStateChanged = function() {
    for(var i = 0; i < tnoodle.ajaxStateListeners.length; i++) {
        tnoodle.ajaxStateListeners[i](tnoodle.ajaxState);
    }
};
tnoodle.retryAjax = function(callback, url, data) {
    var ajaxId = tnoodle.ajaxId++;
    tnoodle.ajaxState[ajaxId] = {
        lastError: null,
        pendingRequest: null,
        secondsUntilRetry: null,
        url: tnoodle.appendParams(url, data)
    };

    var nthTry = 0;
    function timeout() {
        tnoodle.ajaxState[ajaxId].retryAttempt.abort();
        tnoodle.ajaxState[ajaxId].retryAttempt = null;
        tnoodle.ajaxState[ajaxId].lastError = "Timed out waiting for response from server";
        retryTime = null;
        retry();
    }

    var retryTime = null;
    var lastSecondsRemaining = null;
    var retryTimer = null;
    var pendingTimeout = null;
    function retry() {
        tnoodle.ajaxState[ajaxId].retryAttempt = null;
        if(pendingTimeout) {
            clearTimeout(pendingTimeout);
            pendingTimeout = null;
        }
        if(!retryTime) {
            retryTime = new Date().getTime();
            if(nthTry > 0) {
                retryTime += Math.min(tnoodle.MAX_BACKOFF, 1000*Math.pow(2, nthTry));
            }
        }

        var secondsRemaining = Math.round((retryTime - new Date().getTime())/1000, 0);
        if(secondsRemaining <= 0) {
            nthTry++;
            tnoodle.ajaxState[ajaxId].secondsUntilRetry = null;
            tnoodle.ajaxState[ajaxId].retryAttempt = tnoodle.ajax(function(json) {
                tnoodle.ajaxState[ajaxId].retryAttempt = null;
                retryTime = null;
                clearTimeout(pendingTimeout);
                pendingTimeout = null;
                if(json.error) {
                    if(json.error instanceof XMLHttpRequestProgressEvent) {
                        tnoodle.ajaxState[ajaxId].lastError = "Can't connect to server";
                    } else {
                        tnoodle.ajaxState[ajaxId].lastError = json.error;
                    }
                    retry();
                } else {
                    delete tnoodle.ajaxState[ajaxId];
                    callback(json);
                }
                tnoodle.fireAjaxStateChanged();
            }, url, data);
            pendingTimeout = setTimeout(timeout, tnoodle.AJAX_TIMEOUT);
            tnoodle.fireAjaxStateChanged();
        } else {
            if(secondsRemaining != lastSecondsRemaining) {
                lastSecondsRemaining = secondsRemaining;
                tnoodle.ajaxState[ajaxId].secondsUntilRetry = secondsRemaining;
                tnoodle.fireAjaxStateChanged();
            }
            retryTimer = setTimeout(retry, 100);
        }
    }
    retry();

    function abort() {
        if(tnoodle.ajaxState[ajaxId].retryAttempt) {
            tnoodle.ajaxState[ajaxId].retryAttempt.abort();
            tnoodle.ajaxState[ajaxId].retryAttempt = null;
        }
        if(pendingTimeout) {
            clearTimeout(pendingTimeout);
            pendingTimeout = null;
        }
        if(retryTimer) {
            clearTimeout(retryTimer);
            retryTimer = null;
        }
        delete tnoodle.ajaxState[ajaxId];
        tnoodle.fireAjaxStateChanged();
    }
    return { abort: abort };
};
tnoodle.jsonpCallbacks = [];
tnoodle.jsonp = function(callback, url, data) {
    var callbackIndex = tnoodle.jsonpCallbacks.length;
    var callbackname = "tnoodle.jsonpCallbacks[" + callbackIndex + "]";
    tnoodle.jsonpCallbacks.push(callback);
    if (url.indexOf("?") > -1) {
        url += "&callback=";
    } else {
        url += "?callback=";
    }

    url += callbackname + "&" + tnoodle.toQueryString(data);

    // TODO - is this needed? We can't do it now, because of the super
    // strict parsing of url parameters. See
    // https://github.com/jfly/tnoodle/issues/22
    //url += "&" + new Date().getTime().toString(); // prevent caching

    var script = document.createElement("script");
    script.setAttribute("src", url);
    script.setAttribute("type", "text/javascript");
    document.body.appendChild(script); //TODO - doesn't work until body is loaded
    return {
        abort: function() {
            // Unfortunately, deleting the <script> tag we just created doesn't seem
            // to cancel the pending request. I don't think it's possible to cancel it,
            // but we can ignore it when it does complete.
            tnoodle.jsonpCallbacks[callbackIndex] = function() {};
        }
    };
};
tnoodle.toQueryString = function(data) {
    var url = "";
    for(var key in data) {
        if(data.hasOwnProperty(key)) {
            url += "&" + encodeURIComponent(key) + "=" + encodeURIComponent(data[key]);
        }
    }
    if(url.length === 0) {
        return url;
    }

    return url.substring(1);
};

// Copied from http://stackoverflow.com/questions/133925/javascript-post-request-like-a-form-submit/133997#133997
tnoodle.postToUrl = function(path, params, method, target) {
    method = method || "post"; // Set method to post by default, if not specified.
    target = target || "";

    // The rest of this code assumes you are not using a library.
    // It can be made less wordy if you use one.
    var form = document.createElement("form");
    form.setAttribute("method", method);
    form.setAttribute("action", path);
    form.setAttribute("target", target);

    for(var key in params) {
        if(params.hasOwnProperty(key)) {
            var hiddenField = document.createElement("input");
            hiddenField.setAttribute("type", "hidden");
            hiddenField.setAttribute("name", key);
            hiddenField.setAttribute("value", params[key]);

            form.appendChild(hiddenField);
        }
    }

    // This is needed for firefox 3.6
    document.body.appendChild(form);

    form.submit();
};
