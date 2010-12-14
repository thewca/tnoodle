var tnoodle = tnoodle || {};
tnoodle.server = function(url) {
	function Configuration() {
		//TODO GAH! localStorage doesn't work offline in ff! wtf?
		//https://bugzilla.mozilla.org/show_bug.cgi?id=507361
		var localFile = document.location.href.match(/^file:\/\/.*$/) && navigator.userAgent.match(/firefox/i);
		var cookies = null;
		if(!localStorage || localFile) {
			var Cookies = function() {
				function setCookie(c_name,value,expiredays)
				{
				var exdate=new Date();
				exdate.setDate(exdate.getDate()+expiredays);
				document.cookie=c_name+ "=" +escape(value)+
				((!expiredays) ? "" : ";expires="+exdate.toUTCString());
				}
				
				var data = {};
				
				var cookies = document.cookie.split(';');
				this.length = cookies.length;
				var keys = [];
				for(var i = 0; i < this.length; i++) {
					var key_val = cookies[i].split('=');
					var key = key_val[0].trim();
					var val = unescape(key_val[1]);
					data[key] = val;
					keys.push(key);
				}
				this.key = function(i) {
					return keys[i];
				};
				this.getItem = function(key) {
					return data[key];
				};
				this.setItem = function(key, val) {
					data[key] = val;
					setCookie(key, val.replace(/;/g, '\\u003b').replace(/\=/g, '\\u003d'), 100);
				};
			};
			cookies = new Cookies();
		} else {
			cookies = localStorage;
		}
		var data = {};
		for(var i = 0; i < cookies.length; i++) {
			var key = cookies.key(i);
			try {
				//NOTE: JSON.encode is hacked to deal with Infinity
				data[key] = JSON.decode(cookies.getItem(key));
			} catch(error) {
				//oh well
			}
		}
		
		this.set = function(property, value) {
			if(value === null || value === undefined) {
				delete data[value];
				delete cookies[value];
			} else {
				data[property] = value;
//				cookies.setItem(property, JSON.stringify(value));
				//it seems that mootools is breaking stringify with arrays?
				
				//NOTE: JSON.encode is hacked to deal with Infinity
				cookies.setItem(property, JSON.encode(value));
			}
		};
		this.get = function(property, def) {
			if(!(property in data)) {
				this.set(property, def);
			}
			return data[property];
		};
	}
	this.configuration = new Configuration();

	var server = this;
	this.formatTime = function(timeCentis, decimalPlaces) {
		if(timeCentis === null) {
			return "";
		}
		timeCentis = Math.round(timeCentis);
		if(decimalPlaces !== 0) {
			decimalPlaces = decimalPlaces || 2;
		}
		
		if(timeCentis == Infinity) {
			return "DNF";
		} else if(server.configuration.get('clockFormat', true)) {
			return server.clockFormat(timeCentis, decimalPlaces);
		} else {
			return (timeCentis/100).toFixed(decimalPlaces);
		}
	};
	this.clockFormat = function(timeCentis, decimalPlaces) {
		timeCentis = Math.round(timeCentis);
		if(decimalPlaces !== 0) {
			decimalPlaces = decimalPlaces || 2;
		}
		
		var hours = (timeCentis / (100*60*60)).toInt();
		timeCentis = timeCentis % (100*60*60);
		var minutes = (timeCentis / (100*60)).toInt();
		timeCentis = timeCentis % (100*60);
		var seconds = (timeCentis / 100).toInt();
		var centis = timeCentis % 100;
	
		var clocked = "";
		if(hours > 0) {
			clocked += hours + ":";
			if(minutes === 0) {
				clocked += "00:";
			} else if(minutes < 10) {
				clocked += "0";
			}
		}
		if(minutes > 0) {
			clocked += minutes + ":";
			if(seconds < 10) {
				clocked += "0";
			}
		}
		clocked += seconds;
		if(decimalPlaces > 0) {
			var decimals = "";
			if(centis < 10) {
				decimals += "0";
			}
			decimals += centis;
			if(decimalPlaces <= 2) {
				decimals = decimals.substring(0, decimalPlaces);
			} else {
				//just for completeness
				for(var i = 2; i < decimalPlaces; i++) {
					decimals += "0";
				}
			}
			
			clocked += "." + decimals;
		}
		
		return clocked;
	};
	
	/* time can be either a number or a string */
	function Time(time, scramble) {
		this.format = function(key) {
			key = key || 'centis';
			if(key == 'tags') {
				return this.tags.toString();
			} else if(key == 'date') {
				return this.date.toString();
			} else if(key == 'scramble') {
				return this.scramble;
			} else if(key == 'index') {
				return this.index.toString();
			} else {
				var time = server.formatTime(this[key]);
				if(key == 'centis') {
					if(this.penalty == "+2") {
						time += "+";
					}
				}
				return time;
			}
		};
		this.parse = function(time) {
			if(time.length === 0) {
				throw "Must enter a time";
			}
			if(time.toUpperCase() == "DNF") {
				this.setPenalty("DNF");
				return;
			}
			//we wait until we've validated the time to set the penalty
			var penalty = null;
			if(time.match(/\+$/)) {
				penalty = "+2";
				time = time.substring(0, time.length-1);
			} else {
				penalty = null;
			}
				
			var hours = null, minutes = null, seconds = null;
			var coloned = time.split(':');
			var i = coloned.length;
			switch(i) {
			case 1:
				seconds = coloned[0];
				break;
			case 2:
				minutes = coloned[0];
				seconds = coloned[1];
				break;
			case 3:
				hours = coloned[0];
				minutes = coloned[1];
				seconds = coloned[2];
				break;
			default:
				throw "Too many colons";
			}
			
			function strictToInt(str) {
				if(!str.match(/^\d+$/)) {
					throw "Not an integer: " + str;
				}
				return str.toInt(10);
			}
			
			if(coloned[i-1] == ".") {
				throw "Invalid seconds value";
			}
			
			var valueCentis = 0;
			var seconds_centis = seconds.split('.');
			if(seconds_centis.length == 2 && seconds_centis[1].length > 0) {
				valueCentis += Math.round(100*strictToInt(seconds_centis[1])*Math.pow(10, -seconds_centis[1].length));
			} else if(seconds_centis.length > 2) {
				throw "Too many decimal points";
			}
			if(seconds_centis[0].length > 0) {
				valueCentis += 100*strictToInt(seconds_centis[0]);
			}
			if(minutes) {
				valueCentis += 60*100*strictToInt(minutes);
			}
			if(hours) {
				valueCentis += 60*60*100*strictToInt(hours);
			}
			
			if(penalty == "+2") {
				valueCentis -= 2*100;
			}
			if(valueCentis <= 0) {
				throw "Can't have times &leq; 0";
			}
			this.rawCentis = valueCentis;
			if(this.rawCentis > 10*365*24*60*100) {
				throw "Can't have times > 10 years";
			}
			this.setPenalty(penalty);
			saveSessions();
		};
		//penalty can be "+2" or "DNF"
		//anything else is assumed to be no penalty
		this.setPenalty = function(penalty) {
			if(penalty != "+2" && penalty != "DNF") {
				penalty = null;
			}
			this.penalty = penalty;
			if(this.penalty == "+2") {
				this.centis = this.rawCentis + 2*100; 
			} else if(this.penalty == "DNF") {
				this.centis = Infinity;
				if(this.rawCentis === undefined) {
					this.rawCentis = Infinity;
				}
			} else {
				this.centis = this.rawCentis;
			}
			saveSessions();
		};
		//always returns one of null, "+2", "DNF"
		this.getPenalty = function() {
			return this.penalty;
		};
		this.addTag = function(tag) {
			if(!this.hasTag(tag)) {
				this.tags.push(tag);
				saveSessions();
			}
		};
		this.removeTag = function(tag) {
			var index = this.tags.indexOf(tag);
			if(index >= 0) {
				this.tags.splice(index, 1);
				saveSessions();
			}
		};
		this.hasTag = function(tag) {
			return this.tags.indexOf(tag) >= 0;
		};
		
		this.ra5 = this.ra12 = this.ra100 = null;
		this.penalty = null;
		this.index = null;
		this.tags = [];
		this.date = new Date().getTime();
		this.scramble = scramble;
		//TODO - comments?
		
		if(typeof(time) === "number") {
			this.centis = this.rawCentis = time;
		} else {
			this.parse(time.toString());
		}
	}
	
	var description = "Michael Gottlieb and I have agreed to extend the definition of a trimmed average from 5 and 12 solves to an arbitrary number of solves. The objective is to throw out ~10% of the solves, the best 5% and the worst 5%. Michael's clever idea to get this to coincide with the current definitions of RA 5 (see WCA) and RA 12 (by overwhelming convention) is to define the number of trimmed solves as:\n trimmed(n) = 2*ceil[ (n/10)/2 ] = (n/10) rounded up to the nearest even integer\n It should be easy to check that trimmed(5) = 2 and trimmed(12) = 2, as desired.";
	var TRIMMED = function(n) {
		return 2*Math.ceil( (n/10)/2 );
	};

	var keyInfo = [
		[ 'index', '', null ],
		[ 'centis', 'Time', null ],
		[ 'ra5', 'Ra 5', 'Trimmed average of 5' ],
		[ 'ra12', 'Ra 12', 'Trimmed average of 12' ],
		[ 'ra100', 'Ra 100', 'Trimmed average of 100' ],
		[ 'sessionAve', 'Ave', description ],
		[ 'tags', 'Tags', null ],
		[ 'date', 'Date', 'Milliseconds since the epoch' ],
		[ 'scramble', 'Scramble', null ]
	];
	function nthEl(n) {
		return function(a) {
			return a[n];
		};
	}
	this.timeKeys = keyInfo.map(nthEl(0));
	this.timeKeyNames = keyInfo.map(nthEl(1));
	this.timeKeyDescriptions = keyInfo.map(nthEl(2));
	this.Time = Time;
	
	function Session(id, puzzle, customization) {
		this.id = id;
		this.getDate = function() {
			return new Date(1000*parseInt(this.id, 36));
		};
		this.puzzle = puzzle;
		this.customization = customization || '';
		//times is an array of Time's
		this.times = [];
		
		this.setPuzzle = function(newPuzzle) {
			this.puzzle = newPuzzle;
			saveSessions();
		};
		this.getPuzzle = function() {
			return this.puzzle;
		};
		this.setCustomization = function(custom) {
			this.customization = custom || '';
			saveSessions();
		};
		this.getCustomization = function() {
			if(this.customization === null) {
				return '';
			}
			return this.customization;
		};
		this.toString = function() {
			if(this.customization.length == '') {
				return this.puzzle;
			} else {
				return this.puzzle + ":" + this.customization;
			}
		};
		//TODO - stats!!!
		this.solveCount = function() {
			var count = 0;
			for(var i = 0; i < this.times.length; i++) {
				if(this.times[i].getPenalty() != "DNF") {
					count++;
				}
			}
			return count;
		};
		this.attemptCount = function() {
			return this.times.length;
		};
		this.reset = function() {
			var timesCopy = this.times.slice();
			var action = {
				undo: function() { this.times = timesCopy.slice(); }.bind(this),
				redo: function() { this.times.length = 0; }.bind(this)
			};
			this.pushHistory(action);
			action.redo();
			saveSessions();
		};
		//TODO - cache!
		this.bestWorst = function(key) {
			if(key == 'sessionAve' || key == 'date' || key == 'tags') {
				// The concept of a best and worst really doesn't
				// exist or make sense for these keys.
				// We don't want to return a valid index,
				// else some cells will get marked as the "best" date, tags, etc.
				return {
					best: { centis: null, index: null },
					worst: { centis: null, index: null }
				};
			}
			var minKey = Infinity, maxKey = 0;
			var minIndex = null, maxIndex = null;
			for(var i = 0; i < this.times.length; i++) {
				var val = key ? this.times[i][key] : this.times[i].centis;
				if(val !== null) {
					//for min, we choose the *first* guy we can find
					if(val < minKey || (minIndex === null && val == minKey)) {
						minKey = val;
						minIndex = i;
					}
					//for max, we choose the *last* guy we can find
					if(val >= maxKey) {
						maxKey = val;
						maxIndex = i;
					}
				}
			}
			if(minIndex === null) {
				minKey = null;
			}
			if(maxIndex === null) {
				maxKey = null;
			}
			return {
				best: { centis: minKey, index: minIndex },
				worst: { centis: maxKey, index: maxIndex }
			};
		};
		this.stdDev = function(lastSolve, count) {
			if(!lastSolve) {
				lastSolve = this.times.length-1;
				count = this.times.length;
			}
			var times = getTrimmedSolves(lastSolve, count, TRIMMED(count));
			if(times === null || times.length === 0) {
				return null;
			}
			times = times.map(function(a) { return a.centis; });
			var ave = times.average();
			if(ave === Infinity) {
				return ave;
			}

			var variance = 0;
			for(var i = 0; i < times.length; i++) {
				var val = times[i] - ave;
				variance += val*val;
			}
			variance /= times.length;
			return Math.sqrt(variance);
		};
		
		var THIS = this;
		
		function computeMedian(lastSolve, size) {
			return computeRA(lastSolve, size, 2*Math.floor((size-1)/2));
		}
		function computeRA(lastSolve, size, trimmed) {
			if(!trimmed) {
				trimmed = TRIMMED(size);
				return computeRA(lastSolve, size, trimmed);
			}
			var times = getTrimmedSolves(lastSolve, size, trimmed);
			if(times === null) {
				return null;
			}
			return times.map(function(a) { return a.centis; }).average();
		}
		function getTrimmedSolves(lastSolve, size, trimmed) {
			if(trimmed % 2 !== 0 || trimmed >= size) {
				// trimmed must be even, and less than size
				return null;
			}

			var firstSolve = lastSolve - size + 1;
			if(firstSolve < 0 || size === 0) {
				return null; //not enough solves
			}
			
			var times = THIS.times.slice(firstSolve, lastSolve+1);
			times.sort(function(a, b) { return a.centis - b.centis; });
			times.splice(0, trimmed/2); //trim the best trimmed/2 solves
			times.splice(times.length - trimmed/2, times.length); //trim the worst trimmed/2 solves
			times.sort(function(a, b) { return a.index - b.index; });
			return times;
		}
		function privateAdd(time) {
			time.index = THIS.times.length;
			THIS.times.push(time);
			time.ra5 = computeRA(time.index, 5);
			time.ra12 = computeRA(time.index, 12);
			time.ra100 = computeRA(time.index, 100);
			time.sessionAve = computeRA(time.index, time.index+1);
		}

		this.addTime = function(time, scramble, unscramble) {
			var action = {
				undo: function() {
					this.disposeTime(time, true);
					unscramble(time);
				}.bind(this),
				redo: function(nothistory) {
					privateAdd(time);
					if(!nothistory) {
						scramble();
					}
				}
			};
			this.pushHistory(action);
			action.redo(true);
			saveSessions();
		};
		this.reindex = function() {
			var oldTimes = this.times.slice();
			this.times.length = 0;
			for(var i = 0; i < oldTimes.length; i++) {
				privateAdd(oldTimes[i]);
			}
			saveSessions();
		};
		//returns the deleted time
		this.disposeTimeAt = function(index, nohistory) {
			var time = this.times[index];
			var action = {
				undo: function() {
					this.times.splice(index, 0, time);
					this.reindex();
				}.bind(this),
				redo: function() {
					this.times.splice(index, 1);
					this.reindex();
				}.bind(this)
			};
			if(!nohistory) {
				this.pushHistory(action);
			}
			action.redo();
			return time;
		};
		this.disposeTime = function(time, nohistory) {
			var index = this.times.indexOf(time);
			if(index >= 0) {
				this.disposeTimeAt(index, nohistory);
				return time;
			}
			return null;
		};
		this.disposeTimes = function(times) {
			var sanitizedTimes = [];
			for(var i = 0; i < times.length; i++) {
				var time = times[i];
				if(this.containsTime(time)) {
					sanitizedTimes.push(time);
				}
			}
			var action = {
				undo: function() {
					for(var i = 0; i < sanitizedTimes.length; i++) {
						var time = sanitizedTimes[i];
						this.times.splice(time.index, 0, time);
					}
					this.reindex();
				}.bind(this),
				redo: function() {
					for(var i = 0; i < sanitizedTimes.length; i++) {
						this.disposeTime(sanitizedTimes[i], true);
					}
				}.bind(this)
			};
			this.pushHistory(action);
			action.redo();
		};
		this.containsTime = function(time) {
			return this.times.indexOf(time) >= 0;
		};

		var history = [];
		var histIndex = -1; //this points to the last action taken
		this.undo = function() {
			if(histIndex >= 0 && histIndex < history.length) {
				history[histIndex].undo();
				histIndex--;
			}
		};
		this.redo = function() {
			if(histIndex+1 >= 0 && histIndex+1 < history.length) {
				histIndex++;
				history[histIndex].redo();
			}
		};
		this.pushHistory = function(undo_redo_callback) {
			histIndex++;
			history[histIndex] = undo_redo_callback;
			// we remove everything after what we just added
			history.splice(histIndex+1, history.length-1);
		};
	}
	
	this.createSession = function(puzzle, customization) {
		//id is the number of seconds since the epoch encoded in base 36 for readability
		var id = Math.round(new Date().getTime()/1000).toString(36);
		if(id in sessions) {
			//we don't want duplicate session ids
			return null;
		}
		var sesh = new Session(id, puzzle, customization);
		sessions.push(sesh);
		saveSessions();
		return sesh;
	};
	this.disposeSession = function(session) {
		var i = sessions.indexOf(session);
		if(i < 0) {
			//couldn't find the session
			return false;
		}
		sessions.splice(i, 1);
		saveSessions();
		return true;
	};
	this.getCustomizations = function(puzzle) {
		if(!(puzzle in customizations)) {
			customizations[puzzle] = [ '' ];
		}
		customizations[puzzle].sort();
		return customizations[puzzle];
	};
	this.createCustomization = function(puzzle, customization) {
		if(customizations[puzzle].contains(customization)) {
			return false;
		}
		customizations[puzzle].push(customization);
		return true;
	};
	this.removeCustomization = function(puzzle, customization) {
		//TODO - urgh... editing too?
	};
	
	this.getTags = function(puzzle) {
		//TODO - should tags be per-puzzle? seems like a good idea
		//although it does make changing session puzzles more complicated ... urgh
		if(!(puzzle in tags)) {
			tags[puzzle] = [ 'POP' ];
		}
		return tags[puzzle].sort();
	};
	this.createTag = function(puzzle, tag) {
		if(tags[puzzle].indexOf(tag) >= 0) {
			return false;
		}
		tags[puzzle].push(tag);
		return true;
	};
	var i;
	var sessions = this.configuration.get('sessions', []);
	//transforming sessions (a JSON object) into an array of Sessions of Times
	try {
		for(i = 0; i < sessions.length; i++) {
			var sesh = new Session();
			sesh.id = sessions[i].id;
			sesh.puzzle = sessions[i].puzzle;
			sesh.customization = sessions[i].customization;
			sesh.times = [];
			for(var j = 0; j < sessions[i].times.length; j++) {
				var newTime = new Time(0);
				sesh.times.push(newTime);
				var oldTime = sessions[i].times[j];

				for(var key in oldTime) {
					if(oldTime.hasOwnProperty(key)) {
						newTime[key] = oldTime[key];
					}
				}
			}
			sessions[i] = sesh;
		}
	} catch(error) {
		//bummer
		sessions = [];
	}
	
	this.sessions = sessions;
	
	var config = this.configuration;
	var pendingSave = false;
	function bufferedSave() {
		pendingSave = false;
		config.set('sessions', sessions);
	}
	function saveSessions() {
		if(pendingSave) {
			return;
		}
		pendingSave = true;
		setTimeout(bufferedSave, 500);
	}
	
	if(sessions.length === 0) {
		this.createSession("3x3x3", "");
	}
	
	//initializing the available customizations
	var customizations = {};
	for(i = 0; i < sessions.length; i++) {
		var puzzle = sessions[i].getPuzzle();
		var customization = sessions[i].getCustomization();
		if(!(puzzle in customizations)) {
			customizations[puzzle] = [ '' ];
		}
		if(!customizations[puzzle].contains(customization)) {
			customizations[puzzle].push(customization);
		}
	}
	//TODO - initialize the available tags, merge with customizations object?
	var tags = { '3x3x3': [ 'PLL skip', 'POP' ] };
};
