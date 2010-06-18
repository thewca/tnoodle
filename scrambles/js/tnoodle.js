/*** STUPID IE ***/
if(!Array.prototype.map) {
	Array.prototype.map = function(func) {
		var new_arr = [];
		for(var i = 0; i < this.length; i++) {
			new_arr[i] = func(this[i]);
		}
		return new_arr;
	}
}
function addListener(obj, event, func, useCapture) {
	if(obj.addEventListener) {
		obj.addEventListener(event, func, useCapture);
	} else {
		obj.attachEvent('on'+event, function(e) { func.call(obj, e); });
	}
}
/*** END STUPID IE ***/

tnoodle = {};
tnoodle.ajax = function(callback, url, data) {
	var dataUrl = url; //this is to avoid clobbering our original url
	if(data) {
		if(dataUrl.indexOf("?") < 0)
			dataUrl += "?";
		dataUrl += tnoodle.toQueryString(data);
	}
	
	var xhr = new XMLHttpRequest();
	if(xhr.withCredentials == undefined) {
		xhr = null;
		if(typeof(XDomainRequest) != "undefined") {
			xhr = new XDomainRequest();
			try {
				xhr.open('get', dataUrl);
			} catch(error) {
				//this throws an exception when running locally on ie
				xhr = null;
			}
		}
		if(xhr == null) {
			// freaking opera & ie, man
			// we'll make an attempt to use jsonp here
			tnoodle.jsonp(callback, url, data);
			return;
		}
	} else {
		xhr.open('get', dataUrl, true);
	}
	xhr.onload = function() {
		callback(eval("(" + this.responseText + ")"));
	};
	xhr.onerror = function(error) {
		//attempting to resubmit
		//TODO - notify the user! do some sort of exponential backoff
//		tnoodle.ajax(callback, url, data);
	};
	xhr.send(null);
};
tnoodle.jsonpcount = 1;
tnoodle.jsonp = function(callback, url, data) {
		var callbackname = "tnoodle.jsonp.callback" + this.jsonpcount++;
	    eval(callbackname + "=callback");
		if (url.indexOf("?") > -1)
			url += "&callback="; 
		else
			url += "?callback=";

		url += callbackname + "&" + tnoodle.toQueryString(data);
		url += "&" + new Date().getTime().toString(); // prevent caching

		var script = document.createElement("script");        
		script.setAttribute("src",url);
		script.setAttribute("type","text/javascript");                
		document.body.appendChild(script); //TODO - doesn't work until body is loaded
	};
tnoodle.toQueryString = function(data) {
		var url = "";
		for(var key in data) {
			url += "&" + encodeURIComponent(key) + "=" + encodeURIComponent(data[key]);
		}
		if(url.length == 0)
			return url;
		
		return url.substring(1);
	};
tnoodle.scrambles = {
	//TODO - document!	
	//TODO - modify to take a size instead of a scale
	createAreas: function(faces, scale) {
		var areas = [];
		for(var faceName in faces) {
			var faceAreas = faces[faceName];
			for(var i = 0; i < faceAreas.length; i++) {
				var area = document.createElement('area');
				area.faceName = faceName;
				area.setAttribute('shape', 'poly');
				var coords = faceAreas[i].map(function(item) { return item.map(function(coord) { return coord*scale; }).join(","); }).join(",");
				area.setAttribute('coords', coords);

				areas.push(area);
			}
		}
		return areas;
	},
	flattenColorScheme: function(colorScheme) {
		var faces = [];
		for(var face in colorScheme)
			faces.push(face);
		faces.sort();
		var scheme = '';
		for(var i = 0; i < faces.length; i++) {
			if(i > 0) scheme += ','
			scheme += colorScheme[faces[i]];
		}
		return scheme;
	},
	
	/*** Applet code ***/
	applet: function() {
		var puzzleMap = null;
		var puzzleNames = null;
		var puzzleCallback = null;
		tnoodle_scrambles_applet_loaded = function(puzzles) {
			//applet.style.display = 'none'; //the invisible applet seems to be stealing focus without this
			puzzleMap = puzzles;
			puzzleNames = [];
			var valueIterator = puzzles.values().iterator();
			while(valueIterator.hasNext()) {
				var generator = valueIterator.next();
				puzzleNames.push([generator.getShortName(), generator.getLongName()]);
			}
			if(puzzleCallback)
				puzzleCallback(puzzleNames);
		};
	
		var applet = document.createElement('applet');
		applet.setAttribute('codebase', '../dist');
		applet.setAttribute('archive', 'ScrambleApplet.jar');
		applet.setAttribute('code', 'net.gnehzr.tnoodle.scrambles.applet.ScrambleApplet');
		applet.setAttribute('width', '0');
		applet.setAttribute('height', '0');
		applet.setAttribute('mayscript', 'true');
		
		var onload = document.createElement('param');
		onload.setAttribute('name', 'onload');
		onload.setAttribute('value', 'tnoodle_scrambles_applet_loaded');
		applet.appendChild(onload);
		
		document.body.appendChild(applet);
		
		// can only be called once!
		this.connect = function(callback) {
			if(puzzleMap == null)
				puzzleCallback = callback;
			else
				callback(puzzleNames);
		}
		this.loadScramble = function(callback, puzzle, seed) {
			var generator = puzzleMap.get(puzzle);
			var scramble = seed ? generator.generateSeededScramble(seed) : generator.generateScramble();
			callback(scramble);
		};
		this.loadScrambles = function(callback, puzzle, seed, count) {
			var generator = puzzleMap.get(puzzle);
			var scrambles = seed ? generator.generateSeededScrambles(seed, count) : generator.generateScrambles(count);
			//NOTE: this returns a java array, hopefully it won't be a problem
			callback(scrambles);
		};
		this.getScrambleImageUrl = function(puzzle, scramble, colorScheme, width, height) {
			return puzzleMap.get(puzzle).getScrambleImageDataUrl(scramble, tnoodle.scrambles.flattenColorScheme(colorScheme), width, height);
		};
		
		function java2js(java_obj) {
			//i don't know a better way of testing for arrays or maps than this
			var isArray = java_obj.length && !java_obj.charAt;
			if(isArray) {
				var js_arr = [];
				for(var i = 0; i < java_obj.length; i++) {
					js_arr[i] = java2js(java_obj[i]);
				}
				return js_arr;
			}
			
			var isMap = false;
			try {
				//we must call keySet() because ie throws a NoSuchFieldException otherwise, which makes sense
				isMap = !!java_obj.keySet();
			} catch(error) {}
			if(isMap) {
				var js_obj = {};
				var keyIter = java_obj.keySet().iterator();
				while(keyIter.hasNext()) {
					var key = keyIter.next();
					var val = java_obj.get(key);
					js_obj[key] = java2js(val);
				}
				return js_obj;
			}
			
			return java_obj;
		}
		
		this.loadPuzzleImageInfo = function(callback, puzzle) {
			// callback must be a function(defaultPuzzleInfo)
			// where defaultPuzzleInfo.faces is a {} mapping face names to arrays of points
            // defaultPuzzleInfo.size is the size of the scramble image
			// defaultPuzzleInfo.colorScheme is a {} mapping facenames to hex color strings
			
			var puzzleImageInfo = java2js(puzzleMap.get(puzzle).getDefaultPuzzleImageInfo().jsonize());
			//var puzzleImageInfo = { faces: js_obj, size: javaInfo.get("size"), colorScheme: javaInfo.get("colorScheme") };
			callback(puzzleImageInfo);
		};
		this.toString = function() {
			return "scramble applet";
		};
	},
	
	/*** Server code ***/
	server: function(host, port) {
		var server = "http://" + host + ":" + port;

		this.scrambleUrl = server + "/scramble/";
		this.viewUrl = server + "/view/";
		this.importUrl = server + "/import/";
		
		this.connect = function(callback) {
			tnoodle.ajax(callback, this.scrambleUrl, null);
		}
		
		this.loadScramble = function(callback, puzzle, seed) {
			this.loadScrambles(function(scrambles) { callback(scrambles[0]); }, puzzle, seed, 1);
		};
		this.loadScrambles = function(callback, puzzle, seed, count) {
			var query = {};
			if(seed) query['seed'] = seed;
			if(count) query['count'] = count;
			tnoodle.ajax(callback, this.scrambleUrl + encodeURIComponent(puzzle) + ".json", query);
		};
		this.getScrambleImageUrl = function(puzzle, scramble, colorScheme, width, height) {
			var query = { "scramble": scramble };
			if(width) query['width'] = width;
			if(height) query['height'] = height;
            if(colorScheme) {
                query['scheme'] = tnoodle.scrambles.flattenColorScheme(colorScheme);
            }
			return this.viewUrl + encodeURIComponent(puzzle) + ".png?" + tnoodle.toQueryString(query);
		};
		this.loadPuzzleImageInfo = function(callback, puzzle) {
			// callback must be a function(defaultPuzzleInfo)
			// where defaultPuzzleInfo.faces is a {} mapping face names to arrays of points
            // defaultPuzzleInfo.size is the size of the scramble image
			// defaultPuzzleInfo.colorScheme is a {} mapping facenames to hex color strings
			tnoodle.ajax(callback, this.viewUrl + encodeURIComponent(puzzle) + ".json", null);
		};
		this.importScrambles = function(callback, url) {
			tnoodle.ajax(callback, this.importUrl, { url: url });
		};
		
		// i'm not positive that multiple forms will work at once,
		// hopefully this won't be an issue
		var sendFileIframe = null;
		this.getUploadForm = function(onsubmit, onload) {
			if(sendFileIframe == null) {
				sendFileIframe = document.createElement('iframe');
				sendFileIframe.style.display = 'none';
				sendFileIframe.name = 'sendFileIframe';
				sendFileIframe.src = 'about:blank';
				document.body.appendChild(sendFileIframe);
				addListener(window, "message", function(e) {
					//TODO - check origin!
					var scrambles = eval(e.data);
					onload(scrambles);
				}, false);
			}
			
			var form = document.createElement('form');
			form.setAttribute('method', 'post');
			form.setAttribute('action', this.importUrl);
			form.setAttribute('enctype', 'multipart/form-data');
			form.setAttribute('target', 'sendFileIframe');
			addListener(form, 'submit', function() { onsubmit(fileInput.value); }, false);
			
			var fileInput = document.createElement('input');
			fileInput.setAttribute('type', 'file');
			fileInput.setAttribute('name', 'scrambles');
			addListener(fileInput, 'input', function() {
			}, false);
			var submit = document.createElement('input');
			submit.type = 'submit';
			submit.value = 'Load Scrambles';
			
			form.appendChild(fileInput);
			form.appendChild(submit);
			return form;
		}
		this.toString = function() {
			return server;
		}
	}
};
