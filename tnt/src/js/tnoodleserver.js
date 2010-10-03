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
			var time = server.formatTime(this[key]);
			if(key == 'centis') {
				if(this.penalty == "+2") {
					time += "+";
				} /*else if(this.penalty == "DNF") TODO - implement qqtimer-esque DNF(value)
				time += " (" + this.centis + ")";*/
			}
			return time;
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
				throw "Can't have times <= 0";
			}
			this.rawCentis = valueCentis;
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
		
		this.mean3 = this.ra5 = this.ra12 = this.ave100 = this.sessionAve = null;
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
	this.Time = Time;
	
	function Session(id, puzzle, customization) {
		this.id = id;
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
			this.customization = custom;
			saveSessions();
		};
		this.getCustomization = function() {
			if(this.customization === null) {
				return '';
			}
			return this.customization;
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
			this.times.length = 0;
			saveSessions();
		};
		//TODO - cache!
		this.bestWorst = function(key) {
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
			lastSolve = lastSolve || this.times.length - 1;
			var ave = computeAverage(lastSolve, count);
			if(ave === null || ave == Infinity) {
				return ave;
			}
			var variance = 0;
			var solveCount = 0;
			for(var i = lastSolve; i >= 0; i--) {
				var val = this.times[i].centis;
				if(val < Infinity) {
					val -= ave; 
					variance += val*val;
					solveCount++;
				}
				if(solveCount == count) {
					break;
				}
			}
			variance /= solveCount;
			return Math.sqrt(variance);
		};
		
		var THIS = this;
		
		//this ignores all DNFs
		function computeAverage(lastSolve, requiredSolveCount) {
			if(lastSolve < 0) {
				return null;
			}
			var solveCount = 0;
			var sum = 0;
			for(var i = lastSolve; i >= 0; i--) {
				var val = THIS.times[i].centis;
				if(val < Infinity) {
					sum += val;
					solveCount++;
				}
				if(solveCount == requiredSolveCount) {
					break;
				}
			}
			if(requiredSolveCount && solveCount != requiredSolveCount) {
				return null; //not enough solves
			}
			if(solveCount === 0) {
				return Infinity;
			}
			return sum / solveCount;
		}
		
		function computeMedian(lastSolve, size) {
			if(!size) {
				size = THIS.times.length;
			}
			var firstSolve = lastSolve - size + 1;
			if(firstSolve < 0) {
				return null;
			}
			var subset = THIS.times.slice(firstSolve, lastSolve + 1);
			for(var i = 0; i < subset.length; i++) {
				subset[i] = subset[i].centis;
			}
			subset.sort();
			var midway = size/2;
			if(isInteger(midway)) {
				return (subset[midway-1] + subset[midway])/2;
			} else {
				return subset[Math.floor(midway)];
			}
		}
		
		function computeRA(lastSolve, size, trimmed) {
			var firstSolve = lastSolve - size + 1;
			if(firstSolve < 0 || size === 0) {
				return null; //not enough solves
			}
			
			var sum = 0;
			var solveCount = 0;
			var best = Infinity, worst = 0;
			for(var i = firstSolve; i <= lastSolve; i++) {
				var val = THIS.times[i].centis;
				best = Math.min(best, val);
				worst = Math.max(worst, val);
				if(val < Infinity) {
					sum += val;
					solveCount++;
				}
			}
			var requiredSolveCount = trimmed ? size - 2 : size;
			if(trimmed) {
				sum -= best;
				solveCount--;
				if(worst < Infinity) { //our worst solve may have been a DNF
					sum -= worst;
					solveCount--;
				}
			}

			if(solveCount != requiredSolveCount) {
				return Infinity; //there must have been too many DNFs, which makes this a DNF average
			}
			
			return sum / requiredSolveCount;
		}
		function privateAdd(time) {
			time.index = THIS.times.length;
			THIS.times.push(time);
			time.mean3 = computeRA(time.index, 3, false);
			time.ra5 = computeRA(time.index, 5, true);
			time.ra12 = computeRA(time.index, 12, true);
			time.ra100 = computeRA(time.index, 100, true);
			time.median100 = computeMedian(time.index, 100);
			time.sessionAve = computeAverage(time.index);
			time.sessionMedian = computeMedian(time.index);
		}
		this.addTime = function(timeCentis, scramble) {
			var time = new Time(timeCentis, scramble);
			privateAdd(time);
			saveSessions();
			return time;
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
		this.disposeTimeAt = function(index) {
			var time = this.times.splice(index, 1);
			this.reindex();
			return time;
		};
		this.disposeTime = function(time) {
			var index = this.times.indexOf(time);
			if(index >= 0) {
				this.disposeTimeAt(index);
			}
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
		if(customization in customizations[puzzle]) {
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
						if(oldTime[key] == null) {
							//console.log(key + "!" + oldTime[key]);
						}
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
		if(!(customization in customizations[puzzle])) {
			customizations[puzzle].push(customization);
		}
	}
	//TODO - initialize the available tags, merge with customizations object?
	var tags = { '3x3x3': [ 'PLL skip', 'POP' ] };

};