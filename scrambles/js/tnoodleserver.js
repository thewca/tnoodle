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
		if(server.configuration.get('clockFormat', true))
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
		this.format = function() {
			return server.formatTime(this.centis);
		};
		this.parse = function(time) {
			//TODO - be descriptive with errors
			//TODO - support clock formatting
			//TODO - +2, DNF
			if(time.length == 0 || time == '.')
				throw "time doesn't contain any digits"
				if(!time.match(/^\d*(\.\d*)?$/))
					throw "error parsing time";
			this.centis = Math.round(time.toFloat()*100);
		};
		
		if(typeof(time) === "number")
			this.centis = time;
		else
			this.parse(time.toString());
		
		this.mean3 = this.ra5 = this.ra12 = this.ave100 = this.sessionAve = '';
		//TODO - creation date
		//TODO - tags
		//TODO - comments?
	}
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
			return time;
		};
		//returns the deleted time
		this.disposeTimeAt = function(index) {
			return this.times.splice(index, 1);
		};
		this.disposeTime = function(time) {
			return this.times.splice(this.times.indexOf(time), 1);
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