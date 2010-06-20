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
};