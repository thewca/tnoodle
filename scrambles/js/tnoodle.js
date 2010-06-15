tnoodle = {};
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
	
	/*
	// this function can deal with java arrays
	join: function(arr, sep) {
	console.log(arr);
		var joined = "";
		for(var i = 0; i < joined; i++) {
			if(i > 0)
				joined += sep;
			joined += join(arr[i], sep);
		}
		return joined;
	},*/
	
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
	applet: function(callback) {
		var puzzleMap = null;
		tnoodle_scrambles_applet_loaded = function(puzzles) {
			//applet.style.display = 'none'; //the invisible applet seems to be stealing focus without this
			puzzleMap = puzzles;
			
			var puzzleNames = [];
			var valueIterator = puzzles.values().iterator();
			while(valueIterator.hasNext()) {
				var generator = valueIterator.next();
				puzzleNames.push([generator.getShortName(), generator.getLongName()]);
			}
			callback(puzzleNames);
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
			
			var isMap = java_obj.keySet && java_obj.get && java_obj.put;
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
	},
	server: function(host, port, callback) {
		var server = "http://" + host + ":" + port;

		this.scramblerUrl = server + "/scrambler/";
		this.viewerUrl = server + "/viewer/";
		
		tnoodle.jsonp(callback, this.scramblerUrl, null);
		
		this.loadScramble = function(callback, puzzle, seed) {
			this.loadScrambles(function(scrambles) { callback(scrambles[0]); }, puzzle, seed, 1);
		};
		this.loadScrambles = function(callback, puzzle, seed, count) {
			var query = {};
			if(seed) query['seed'] = seed;
			if(count) query['count'] = count;
			tnoodle.jsonp(callback, this.scramblerUrl + encodeURIComponent(puzzle) + ".json", query);
		};
		this.getScrambleImageUrl = function(puzzle, scramble, colorScheme, width, height) {
			var query = { "scramble": scramble };
			if(width) query['width'] = width;
			if(height) query['height'] = height;
            if(colorScheme) {
                query['scheme'] = tnoodle.scrambles.flattenColorScheme(colorScheme);
            }
			return this.viewerUrl + encodeURIComponent(puzzle) + ".png?" + tnoodle.toQueryString(query);
		};
		this.loadPuzzleImageInfo = function(callback, puzzle) {
			// callback must be a function(defaultPuzzleInfo)
			// where defaultPuzzleInfo.faces is a {} mapping face names to arrays of points
            // defaultPuzzleInfo.size is the size of the scramble image
			// defaultPuzzleInfo.colorScheme is a {} mapping facenames to hex color strings
			tnoodle.jsonp(callback, this.viewerUrl + encodeURIComponent(puzzle) + ".json", null);
		};
	}
};
