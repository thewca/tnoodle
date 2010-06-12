tnoodle = {
	toQueryString: function(data) {
		var url = "";
		for(var key in data) {
			url += "&" + encodeURIComponent(key) + "=" + encodeURIComponent(data[key]);
		}
		if(url.length == 0)
			return url;
		
		return url.substring(1);
	},
	jsonpcount: 1,
	jsonp: function(callback, url, data) {
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
	},
	scrambleserver: function(host, port) {
		var server = "http://" + host + ":" + port;

		this.scramblerUrl = server + "/scrambler/";
		this.viewerUrl = server + "/viewer/";
		
		this.loadAvailablePuzzles = function(callback) {
			tnoodle.jsonp(callback, this.scramblerUrl, null);
		}
		this.loadScramble = function(callback, puzzle, seed) {
			this.loadScrambles(puzzle, seed, 1, function(scrambles) { callback(scrambles[0]); });
		}
		this.loadScrambles = function(puzzle, seed, count, callback) {
			var query = {};
			if(seed) query['seed'] = seed;
			if(count) query['count'] = count;
			tnoodle.jsonp(callback, this.scramblerUrl + encodeURIComponent(puzzle) + ".json", query);
		}
		this.getScrambleImageUrl = function(puzzle, scramble, colorScheme, width, height) {
			var query = { "scramble": scramble };
			if(width) query['width'] = width;
			if(height) query['height'] = height;
            if(colorScheme) {
                var faces = [];
                for(var face in colorScheme)
                    faces.push(face);
                faces.sort();
                var scheme = '';
                for(var i = 0; i < faces.length; i++) {
                    if(i > 0) scheme += ','
                    scheme += colorScheme[faces[i]];
                }
                query['scheme'] = scheme;
            }
			return this.viewerUrl + encodeURIComponent(puzzle) + ".png?" + tnoodle.toQueryString(query);
		}
        //TODO - document!
        //TODO - modify to take a size instead of a scale
        this.createAreas = function(faces, scale) {
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
        }
		this.loadPuzzleImageInfo = function(callback, puzzle, width, height) {
			// callback must be a function(faces, size, colorScheme)
			// where faces is a {} mapping face names to arrays of points
            // size is the size of the scramble image
			// colorscheme is a {} mapping facenames to hex color strings
			var query = {};
			if(width) query['width'] = width;
			if(height) query['height'] = height;
			tnoodle.jsonp(function(faceinfo) {
                callback(faceinfo.faces, faceinfo.size, faceinfo.colorScheme);
            }, this.viewerUrl + encodeURIComponent(puzzle) + ".json", query);
		}
	}
}
