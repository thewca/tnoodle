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
	
	this.sessions = [];// { id: "l4erux", puzzle: "4x4x4", times: [ 65, 70 ] } };
	var sessions = this.sessions;
	function session(id, puzzle) {
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
		}
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
			var newTime = { 
					centis: timeCentis,
					format: function() {
						return (this.centis/100).toFixed(2);
					}
			};
			this.times.push(newTime);
			return newTime;
		};
		//returns the deleted time
		this.disposeTime = function(index) {
			return this.times.splice(index, 1);
		};
	}
	//TODO - use default puzzle for session? if so, how does the user set the default puzzle?
	this.createSession = function(puzzle) {
		//id is the number of seconds since the epoch encoded in base 36 for readability
		var id = Math.round(new Date().getTime()/1000).toString(36);
		if(id in this.sessions) //we don't want duplicate session ids
			return null;
		var sesh = new session(id, puzzle);
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
		sesh.addTime(1384);
};