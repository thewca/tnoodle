var tnoodle = tnoodle || {};

tnoodle.server = function(url) {
	this.configuration = new function() {
		var data = {};
		try {
			var json = JSON.parse(document.cookie.substring('json='.length));
			for(var key in json)
				if(json.hasOwnProperty(key))
					data[key] = json[key];
		} catch(error) {
			console.log("Error in cookie " + document.cookie);
		}
		this.set = function(property, value) {
			if(value == null)
				delete data[value];
			else
				data[property] = value;
			
			//writing cookie
			var days = 100;
			var date = new Date();
			date.setTime(date.getTime()+(days*24*60*60*1000));

			document.cookie = 'json=' + JSON.stringify(data).replace(/;/g, '\\u003b') + '; expires=' + date.toGMTString() + '; path=/';
		};
		this.get = function(property, def) {
			return (property in data) ? data[property] : def;
		};
	};
};