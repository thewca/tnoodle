var tnoodle = tnoodle || {};
tnoodle.server = function(url) {
	this.configuration = new function() {
		var localFile = document.location.href.match(/^file:\/\/.*$/) && navigator.userAgent.match(/firefox/i); //TODO GAH! localStorage doesn't work offline in ff! wtf?
		var cookies = null;
		if(!localStorage || localFile) {
			cookies = new function() {
				function setCookie(c_name,value,expiredays)
				{
				var exdate=new Date();
				exdate.setDate(exdate.getDate()+expiredays);
				document.cookie=c_name+ "=" +escape(value)+
				((expiredays==null) ? "" : ";expires="+exdate.toUTCString());
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
					setCookie(key, val.replace(/;/g, '\\u003b').replace(/=/g, '\\u003d'), 100);
				};
			};
		} else {
			cookies = localStorage;
		}
		var data = {};
		for(var i = 0; i < cookies.length; i++) {
			var key = cookies.key(i);
			try {
				data[key] = JSON.parse(cookies.getItem(key));
			} catch(error) {
				//oh well
			}
		}
		
		this.set = function(property, value) {
			if(value == null) {
				delete data[value];
				delete cookies[value];
			} else {
				data[property] = value;
				cookies.setItem(property, JSON.stringify(value));
			}
		};
		this.get = function(property, def) {
			return (property in data) ? data[property] : def;
		};
	};

	var server = this;
	this.formatTime = function(timeCentis) {
		//TODO - add gui option!!!
		if(timeCentis == Infinity)
			return "DNF"
		else if(server.configuration.get('clockFormat', true))
			return server.clockFormat(timeCentis);
		else
			return (timeCentis/100).toFixed(2);
	};
	this.clockFormat = function(timeCentis) {
		var hours = (timeCentis / (100*60*60)).toInt();
		timeCentis = timeCentis % (100*60*60);
		var minutes = (timeCentis / (100*60)).toInt();
		timeCentis = timeCentis % (100*60);
		var seconds = (timeCentis / 100).toInt();
		var centis = timeCentis % 100;
	
		var clocked = "";
		if(hours > 0) {
			clocked += hours + ":";
			if(minutes == 0)
				clocked += "00:";
			else if(minutes < 10)
				clocked += "0";
		}
		if(minutes > 0) {
			clocked += minutes + ":";
			if(seconds < 10)
				clocked += "0";
		}
		clocked += seconds + ".";
		if(centis < 10)
			clocked += "0";
		clocked += centis;
		return clocked;
	};
	
	/* time can be either a number or a string */
	function Time(time) {
		this.getValueCentis = function() {
			if(this.penalty == "+2")
				return this.centis + 2*100; 
			else if(this.penalty == "DNF")
				return Infinity;
			else
				return this.centis;
		}
		this.format = function() {
			var time = server.formatTime(this.getValueCentis());
			if(this.penalty == "+2") {
				time += "+";
			} /*else if(this.penalty == "DNF") TODO - implement qqtimer-esque DNF(value)
				time += " (" + this.centis + ")";*/ 
			return time;
		};
		this.parse = function(time) {
			if(time.length == 0)
				throw "Must enter a time";
			if(time == "DNF") {
				this.setPenalty("DNF");
				return;
			}
			//we wait until we've valitdated the time to set the penalty
			var penalty = null;
			if(time.match(/\+$/)) {
				penalty = "+2";
				time = time.substring(0, time.length-1);
			} else
				penalty = null;
				
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
				if(!str.match(/^\d+$/))
					throw "Not an integer: " + str;
				return str.toInt();
			}
			
			if(coloned[i-1] == ".")
				throw "Invalid seconds value";
			
			var valueCentis = 0;
			var seconds_centis = seconds.split('.');
			if(seconds_centis.length == 2 && seconds_centis[1].length > 0) {
				valueCentis += Math.round(100*strictToInt(seconds_centis[1])*Math.pow(10, -seconds_centis[1].length));
			} else if(seconds_centis.length > 2) {
				throw "Too many decimal points";
			}
			if(seconds_centis[0].length > 0)
				valueCentis += 100*strictToInt(seconds_centis[0]);
			if(minutes)
				valueCentis += 60*100*strictToInt(minutes);
			if(hours)
				valueCentis += 60*60*100*strictToInt(hours);
			
			this.centis = valueCentis;
			this.setPenalty(penalty);
		};
		//penalty can be "+2" or "DNF"
		//anything else is assumed to be no penalty
		this.setPenalty = function(penalty) {
			if(penalty != "+2" && penalty != "DNF") {
				penalty = null
			}
			this.penalty = penalty;
		};
		//always returns one of null, "+2", "DNF"
		this.getPenalty = function() {
			return this.penalty;
		};
		if(typeof(time) === "number")
			this.centis = time;
		else
			this.parse(time.toString());
		
		this.mean3 = this.ra5 = this.ra12 = this.ave100 = this.sessionAve = '';
		this.penalty = null;
		this.index = null;
		//TODO - creation date
		//TODO - tags
		//TODO - comments?
	}
	this.Time = Time;
	
	this.sessions = [];
	var sessions = this.sessions;
	function Session(id, puzzle) {
		this.id = id;
		this.puzzle = puzzle;
		//times is an array of objects with the following keys: centis, mean3, ra5, ra12, ave100, sessionAve
		this.times = [];
		
		//TODO - stats!!!
		this.solveCount = function() {
			return this.times.length;
		};
		this.attemptCount = function() {
			return this.times.length;
		};
		this.reset = function() {
			this.times.length = 0;
		};
		this.bestTime = function() {
			var minCentis = Infinity;
			var min = { format: function() { return "?"; } }; //TODO - default NaN time?
			for(var i = 0; i < this.times.length; i++) {
				if(this.times[i].centis < min) {
					min = this.times[i];
					minCentis = min.centis;
				}
			}
			return min;
		};
		this.addTime = function(timeCentis) {
			var time = new Time(timeCentis);
			this.times.push(time);
			time.index = this.times.length;
			return time;
		};
		this.reindex = function() {
			for(var i = 0; i < this.times.length; i++) {
				this.times[i].index = i+1;
			}
		};
		//returns the deleted time
		this.disposeTimeAt = function(index) {
			var time = this.times.splice(index, 1);
			this.reindex()
			return time;
		};
		this.disposeTime = function(time) {
			this.times.splice(this.times.indexOf(time), 1);
			this.reindex()
		};
	}
	
	//TODO - use default puzzle for session? if so, how does the user set the default puzzle?
	this.createSession = function(puzzle) {
		//id is the number of seconds since the epoch encoded in base 36 for readability
		var id = Math.round(new Date().getTime()/1000).toString(36);
		if(id in this.sessions) //we don't want duplicate session ids
			return null;
		var sesh = new Session(id, puzzle);
		this.sessions.push(sesh);
		return sesh;
	};
	this.disposeSession = function(session) {
		var i = this.sessions.indexOf(session);
		if(i < 0) //couldn't find the session
			return false;
		this.sessions.splice(i, 1);
		return true;
	};
	
	//TODO - load sessions from config!
	var sesh = this.createSession("4x4x4");
	for(var i = 0; i < 9; i++)
		sesh.addTime(1384 + i);
};