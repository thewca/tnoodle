/*
---

script: Core.js

description: The core of MooTools, contains all the base functions and the Native and Hash implementations. Required by all the other scripts.

license: MIT-style license.

copyright: Copyright (c) 2006-2008 [Valerio Proietti](http://mad4milk.net/).

authors: The MooTools production team (http://mootools.net/developers/)

inspiration:
- Class implementation inspired by [Base.js](http://dean.edwards.name/weblog/2006/03/base/) Copyright (c) 2006 Dean Edwards, [GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)
- Some functionality inspired by [Prototype.js](http://prototypejs.org) Copyright (c) 2005-2007 Sam Stephenson, [MIT License](http://opensource.org/licenses/mit-license.php)

provides: [Mootools, Native, Hash.base, Array.each, $util]

...
*/

var MooTools = {
	'version': '1.2.4',
	'build': '0d9113241a90b9cd5643b926795852a2026710d4'
};

var Native = function(options){
	options = options || {};
	var name = options.name;
	var legacy = options.legacy;
	var protect = options.protect;
	var methods = options.implement;
	var generics = options.generics;
	var initialize = options.initialize;
	var afterImplement = options.afterImplement || function(){};
	var object = initialize || legacy;
	generics = generics !== false;

	object.constructor = Native;
	object.$family = {name: 'native'};
	if (legacy && initialize) object.prototype = legacy.prototype;
	object.prototype.constructor = object;

	if (name){
		var family = name.toLowerCase();
		object.prototype.$family = {name: family};
		Native.typize(object, family);
	}

	var add = function(obj, name, method, force){
		if (!protect || force || !obj.prototype[name]) obj.prototype[name] = method;
		if (generics) Native.genericize(obj, name, protect);
		afterImplement.call(obj, name, method);
		return obj;
	};

	object.alias = function(a1, a2, a3){
		if (typeof a1 == 'string'){
			var pa1 = this.prototype[a1];
			if ((a1 = pa1)) return add(this, a2, a1, a3);
		}
		for (var a in a1) this.alias(a, a1[a], a2);
		return this;
	};

	object.implement = function(a1, a2, a3){
		if (typeof a1 == 'string') return add(this, a1, a2, a3);
		for (var p in a1) add(this, p, a1[p], a2);
		return this;
	};

	if (methods) object.implement(methods);

	return object;
};

Native.genericize = function(object, property, check){
	if ((!check || !object[property]) && typeof object.prototype[property] == 'function') object[property] = function(){
		var args = Array.prototype.slice.call(arguments);
		return object.prototype[property].apply(args.shift(), args);
	};
};

Native.implement = function(objects, properties){
	for (var i = 0, l = objects.length; i < l; i++) objects[i].implement(properties);
};

Native.typize = function(object, family){
	if (!object.type) object.type = function(item){
		return ($type(item) === family);
	};
};

(function(){
	var natives = {'Array': Array, 'Date': Date, 'Function': Function, 'Number': Number, 'RegExp': RegExp, 'String': String};
	for (var n in natives) new Native({name: n, initialize: natives[n], protect: true});

	var types = {'boolean': Boolean, 'native': Native, 'object': Object};
	for (var t in types) Native.typize(types[t], t);

	var generics = {
		'Array': ["concat", "indexOf", "join", "lastIndexOf", "pop", "push", "reverse", "shift", "slice", "sort", "splice", "toString", "unshift", "valueOf"],
		'String': ["charAt", "charCodeAt", "concat", "indexOf", "lastIndexOf", "match", "replace", "search", "slice", "split", "substr", "substring", "toLowerCase", "toUpperCase", "valueOf"]
	};
	for (var g in generics){
		for (var i = generics[g].length; i--;) Native.genericize(natives[g], generics[g][i], true);
	}
})();

var Hash = new Native({

	name: 'Hash',

	initialize: function(object){
		if ($type(object) == 'hash') object = $unlink(object.getClean());
		for (var key in object) this[key] = object[key];
		return this;
	}

});

Hash.implement({

	forEach: function(fn, bind){
		for (var key in this){
			if (this.hasOwnProperty(key)) fn.call(bind, this[key], key, this);
		}
	},

	getClean: function(){
		var clean = {};
		for (var key in this){
			if (this.hasOwnProperty(key)) clean[key] = this[key];
		}
		return clean;
	},

	getLength: function(){
		var length = 0;
		for (var key in this){
			if (this.hasOwnProperty(key)) length++;
		}
		return length;
	}

});

Hash.alias('forEach', 'each');

Array.implement({

	forEach: function(fn, bind){
		for (var i = 0, l = this.length; i < l; i++) fn.call(bind, this[i], i, this);
	}

});

Array.alias('forEach', 'each');

function $A(iterable){
	if (iterable.item){
		var l = iterable.length, array = new Array(l);
		while (l--) array[l] = iterable[l];
		return array;
	}
	return Array.prototype.slice.call(iterable);
};

function $arguments(i){
	return function(){
		return arguments[i];
	};
};

function $chk(obj){
	return !!(obj || obj === 0);
};

function $clear(timer){
	clearTimeout(timer);
	clearInterval(timer);
	return null;
};

function $defined(obj){
	return (obj != undefined);
};

function $each(iterable, fn, bind){
	var type = $type(iterable);
	((type == 'arguments' || type == 'collection' || type == 'array') ? Array : Hash).each(iterable, fn, bind);
};

function $empty(){};

function $extend(original, extended){
	for (var key in (extended || {})) original[key] = extended[key];
	return original;
};

function $H(object){
	return new Hash(object);
};

function $lambda(value){
	return ($type(value) == 'function') ? value : function(){
		return value;
	};
};

function $merge(){
	var args = Array.slice(arguments);
	args.unshift({});
	return $mixin.apply(null, args);
};

function $mixin(mix){
	for (var i = 1, l = arguments.length; i < l; i++){
		var object = arguments[i];
		if ($type(object) != 'object') continue;
		for (var key in object){
			var op = object[key], mp = mix[key];
			mix[key] = (mp && $type(op) == 'object' && $type(mp) == 'object') ? $mixin(mp, op) : $unlink(op);
		}
	}
	return mix;
};

function $pick(){
	for (var i = 0, l = arguments.length; i < l; i++){
		if (arguments[i] != undefined) return arguments[i];
	}
	return null;
};

function $random(min, max){
	return Math.floor(Math.random() * (max - min + 1) + min);
};

function $splat(obj){
	var type = $type(obj);
	return (type) ? ((type != 'array' && type != 'arguments') ? [obj] : obj) : [];
};

var $time = Date.now || function(){
	return +new Date;
};

function $try(){
	for (var i = 0, l = arguments.length; i < l; i++){
		try {
			return arguments[i]();
		} catch(e){}
	}
	return null;
};

function $type(obj){
	if (obj == undefined) return false;
	if (obj.$family) return (obj.$family.name == 'number' && !isFinite(obj)) ? false : obj.$family.name;
	if (obj.nodeName){
		switch (obj.nodeType){
			case 1: return 'element';
			case 3: return (/\S/).test(obj.nodeValue) ? 'textnode' : 'whitespace';
		}
	} else if (typeof obj.length == 'number'){
		if (obj.callee) return 'arguments';
		else if (obj.item) return 'collection';
	}
	return typeof obj;
};

function $unlink(object){
	var unlinked;
	switch ($type(object)){
		case 'object':
			unlinked = {};
			for (var p in object) unlinked[p] = $unlink(object[p]);
		break;
		case 'hash':
			unlinked = new Hash(object);
		break;
		case 'array':
			unlinked = [];
			for (var i = 0, l = object.length; i < l; i++) unlinked[i] = $unlink(object[i]);
		break;
		default: return object;
	}
	return unlinked;
};


/*
---

script: Browser.js

description: The Browser Core. Contains Browser initialization, Window and Document, and the Browser Hash.

license: MIT-style license.

requires: 
- /Native
- /$util

provides: [Browser, Window, Document, $exec]

...
*/

var Browser = $merge({

	Engine: {name: 'unknown', version: 0},

	Platform: {name: (window.orientation != undefined) ? 'ipod' : (navigator.platform.match(/mac|win|linux/i) || ['other'])[0].toLowerCase()},

	Features: {xpath: !!(document.evaluate), air: !!(window.runtime), query: !!(document.querySelector)},

	Plugins: {},

	Engines: {

		presto: function(){
			return (!window.opera) ? false : ((arguments.callee.caller) ? 960 : ((document.getElementsByClassName) ? 950 : 925));
		},

		trident: function(){
			return (!window.ActiveXObject) ? false : ((window.XMLHttpRequest) ? ((document.querySelectorAll) ? 6 : 5) : 4);
		},

		webkit: function(){
			return (navigator.taintEnabled) ? false : ((Browser.Features.xpath) ? ((Browser.Features.query) ? 525 : 420) : 419);
		},

		gecko: function(){
			return (!document.getBoxObjectFor && window.mozInnerScreenX == null) ? false : ((document.getElementsByClassName) ? 19 : 18);
		}

	}

}, Browser || {});

Browser.Platform[Browser.Platform.name] = true;

Browser.detect = function(){

	for (var engine in this.Engines){
		var version = this.Engines[engine]();
		if (version){
			this.Engine = {name: engine, version: version};
			this.Engine[engine] = this.Engine[engine + version] = true;
			break;
		}
	}

	return {name: engine, version: version};

};

Browser.detect();

Browser.Request = function(){
	return $try(function(){
		return new XMLHttpRequest();
	}, function(){
		return new ActiveXObject('MSXML2.XMLHTTP');
	}, function(){
		return new ActiveXObject('Microsoft.XMLHTTP');
	});
};

Browser.Features.xhr = !!(Browser.Request());

Browser.Plugins.Flash = (function(){
	var version = ($try(function(){
		return navigator.plugins['Shockwave Flash'].description;
	}, function(){
		return new ActiveXObject('ShockwaveFlash.ShockwaveFlash').GetVariable('$version');
	}) || '0 r0').match(/\d+/g);
	return {version: parseInt(version[0] || 0 + '.' + version[1], 10) || 0, build: parseInt(version[2], 10) || 0};
})();

function $exec(text){
	if (!text) return text;
	if (window.execScript){
		window.execScript(text);
	} else {
		var script = document.createElement('script');
		script.setAttribute('type', 'text/javascript');
		script[(Browser.Engine.webkit && Browser.Engine.version < 420) ? 'innerText' : 'text'] = text;
		document.head.appendChild(script);
		document.head.removeChild(script);
	}
	return text;
};

Native.UID = 1;

var $uid = (Browser.Engine.trident) ? function(item){
	return (item.uid || (item.uid = [Native.UID++]))[0];
} : function(item){
	return item.uid || (item.uid = Native.UID++);
};

var Window = new Native({

	name: 'Window',

	legacy: (Browser.Engine.trident) ? null: window.Window,

	initialize: function(win){
		$uid(win);
		if (!win.Element){
			win.Element = $empty;
			if (Browser.Engine.webkit) win.document.createElement("iframe"); //fixes safari 2
			win.Element.prototype = (Browser.Engine.webkit) ? window["[[DOMElement.prototype]]"] : {};
		}
		win.document.window = win;
		return $extend(win, Window.Prototype);
	},

	afterImplement: function(property, value){
		window[property] = Window.Prototype[property] = value;
	}

});

Window.Prototype = {$family: {name: 'window'}};

new Window(window);

var Document = new Native({

	name: 'Document',

	legacy: (Browser.Engine.trident) ? null: window.Document,

	initialize: function(doc){
		$uid(doc);
		doc.head = doc.getElementsByTagName('head')[0];
		doc.html = doc.getElementsByTagName('html')[0];
		if (Browser.Engine.trident && Browser.Engine.version <= 4) $try(function(){
			doc.execCommand("BackgroundImageCache", false, true);
		});
		if (Browser.Engine.trident) doc.window.attachEvent('onunload', function(){
			doc.window.detachEvent('onunload', arguments.callee);
			doc.head = doc.html = doc.window = null;
		});
		return $extend(doc, Document.Prototype);
	},

	afterImplement: function(property, value){
		document[property] = Document.Prototype[property] = value;
	}

});

Document.Prototype = {$family: {name: 'document'}};

new Document(document);


/*
---

script: Array.js

description: Contains Array Prototypes like each, contains, and erase.

license: MIT-style license.

requires:
- /$util
- /Array.each

provides: [Array]

...
*/

Array.implement({

	every: function(fn, bind){
		for (var i = 0, l = this.length; i < l; i++){
			if (!fn.call(bind, this[i], i, this)) return false;
		}
		return true;
	},

	filter: function(fn, bind){
		var results = [];
		for (var i = 0, l = this.length; i < l; i++){
			if (fn.call(bind, this[i], i, this)) results.push(this[i]);
		}
		return results;
	},

	clean: function(){
		return this.filter($defined);
	},

	indexOf: function(item, from){
		var len = this.length;
		for (var i = (from < 0) ? Math.max(0, len + from) : from || 0; i < len; i++){
			if (this[i] === item) return i;
		}
		return -1;
	},

	map: function(fn, bind){
		var results = [];
		for (var i = 0, l = this.length; i < l; i++) results[i] = fn.call(bind, this[i], i, this);
		return results;
	},

	some: function(fn, bind){
		for (var i = 0, l = this.length; i < l; i++){
			if (fn.call(bind, this[i], i, this)) return true;
		}
		return false;
	},

	associate: function(keys){
		var obj = {}, length = Math.min(this.length, keys.length);
		for (var i = 0; i < length; i++) obj[keys[i]] = this[i];
		return obj;
	},

	link: function(object){
		var result = {};
		for (var i = 0, l = this.length; i < l; i++){
			for (var key in object){
				if (object[key](this[i])){
					result[key] = this[i];
					delete object[key];
					break;
				}
			}
		}
		return result;
	},

	contains: function(item, from){
		return this.indexOf(item, from) != -1;
	},

	extend: function(array){
		for (var i = 0, j = array.length; i < j; i++) this.push(array[i]);
		return this;
	},
	
	getLast: function(){
		return (this.length) ? this[this.length - 1] : null;
	},

	getRandom: function(){
		return (this.length) ? this[$random(0, this.length - 1)] : null;
	},

	include: function(item){
		if (!this.contains(item)) this.push(item);
		return this;
	},

	combine: function(array){
		for (var i = 0, l = array.length; i < l; i++) this.include(array[i]);
		return this;
	},

	erase: function(item){
		for (var i = this.length; i--; i){
			if (this[i] === item) this.splice(i, 1);
		}
		return this;
	},

	empty: function(){
		this.length = 0;
		return this;
	},

	flatten: function(){
		var array = [];
		for (var i = 0, l = this.length; i < l; i++){
			var type = $type(this[i]);
			if (!type) continue;
			array = array.concat((type == 'array' || type == 'collection' || type == 'arguments') ? Array.flatten(this[i]) : this[i]);
		}
		return array;
	},

	hexToRgb: function(array){
		if (this.length != 3) return null;
		var rgb = this.map(function(value){
			if (value.length == 1) value += value;
			return value.toInt(16);
		});
		return (array) ? rgb : 'rgb(' + rgb + ')';
	},

	rgbToHex: function(array){
		if (this.length < 3) return null;
		if (this.length == 4 && this[3] == 0 && !array) return 'transparent';
		var hex = [];
		for (var i = 0; i < 3; i++){
			var bit = (this[i] - 0).toString(16);
			hex.push((bit.length == 1) ? '0' + bit : bit);
		}
		return (array) ? hex : '#' + hex.join('');
	}

});


/*
---

script: Function.js

description: Contains Function Prototypes like create, bind, pass, and delay.

license: MIT-style license.

requires:
- /Native
- /$util

provides: [Function]

...
*/

Function.implement({

	extend: function(properties){
		for (var property in properties) this[property] = properties[property];
		return this;
	},

	create: function(options){
		var self = this;
		options = options || {};
		return function(event){
			var args = options.arguments;
			args = (args != undefined) ? $splat(args) : Array.slice(arguments, (options.event) ? 1 : 0);
			if (options.event) args = [event || window.event].extend(args);
			var returns = function(){
				return self.apply(options.bind || null, args);
			};
			if (options.delay) return setTimeout(returns, options.delay);
			if (options.periodical) return setInterval(returns, options.periodical);
			if (options.attempt) return $try(returns);
			return returns();
		};
	},

	run: function(args, bind){
		return this.apply(bind, $splat(args));
	},

	pass: function(args, bind){
		return this.create({bind: bind, arguments: args});
	},

	bind: function(bind, args){
		return this.create({bind: bind, arguments: args});
	},

	bindWithEvent: function(bind, args){
		return this.create({bind: bind, arguments: args, event: true});
	},

	attempt: function(args, bind){
		return this.create({bind: bind, arguments: args, attempt: true})();
	},

	delay: function(delay, bind, args){
		return this.create({bind: bind, arguments: args, delay: delay})();
	},

	periodical: function(periodical, bind, args){
		return this.create({bind: bind, arguments: args, periodical: periodical})();
	}

});


/*
---

script: Number.js

description: Contains Number Prototypes like limit, round, times, and ceil.

license: MIT-style license.

requires:
- /Native
- /$util

provides: [Number]

...
*/

Number.implement({

	limit: function(min, max){
		return Math.min(max, Math.max(min, this));
	},

	round: function(precision){
		precision = Math.pow(10, precision || 0);
		return Math.round(this * precision) / precision;
	},

	times: function(fn, bind){
		for (var i = 0; i < this; i++) fn.call(bind, i, this);
	},

	toFloat: function(){
		return parseFloat(this);
	},

	toInt: function(base){
		//https://mootools.lighthouseapp.com/projects/2706-mootools/tickets/936-toint-bug-leads-to-datediff-bug
		//return parseInt(this, base || 10);
		return this | 0; //this has the effect of truncating the fractional part of this number
	}

});

Number.alias('times', 'each');

(function(math){
	var methods = {};
	math.each(function(name){
		if (!Number[name]) methods[name] = function(){
			return Math[name].apply(null, [this].concat($A(arguments)));
		};
	});
	Number.implement(methods);
})(['abs', 'acos', 'asin', 'atan', 'atan2', 'ceil', 'cos', 'exp', 'floor', 'log', 'max', 'min', 'pow', 'sin', 'sqrt', 'tan']);


/*
---

script: String.js

description: Contains String Prototypes like camelCase, capitalize, test, and toInt.

license: MIT-style license.

requires:
- /Native

provides: [String]

...
*/

String.implement({

	test: function(regex, params){
		return ((typeof regex == 'string') ? new RegExp(regex, params) : regex).test(this);
	},

	contains: function(string, separator){
		return (separator) ? (separator + this + separator).indexOf(separator + string + separator) > -1 : this.indexOf(string) > -1;
	},

	trim: function(){
		return this.replace(/^\s+|\s+$/g, '');
	},

	clean: function(){
		return this.replace(/\s+/g, ' ').trim();
	},

	camelCase: function(){
		return this.replace(/-\D/g, function(match){
			return match.charAt(1).toUpperCase();
		});
	},

	hyphenate: function(){
		return this.replace(/[A-Z]/g, function(match){
			return ('-' + match.charAt(0).toLowerCase());
		});
	},

	capitalize: function(){
		return this.replace(/\b[a-z]/g, function(match){
			return match.toUpperCase();
		});
	},

	escapeRegExp: function(){
		return this.replace(/([-.*+?^${}()|[\]\/\\])/g, '\\$1');
	},

	toInt: function(base){
		return parseInt(String(this).indexOf('e')>=0 ? parseFloat(this)<<0 : this, base);
		//return parseInt(this, base || 10);
	},

	toFloat: function(){
		return parseFloat(this);
	},

	hexToRgb: function(array){
		var hex = this.match(/^#?(\w{1,2})(\w{1,2})(\w{1,2})$/);
		return (hex) ? hex.slice(1).hexToRgb(array) : null;
	},

	rgbToHex: function(array){
		var rgb = this.match(/\d{1,3}/g);
		return (rgb) ? rgb.rgbToHex(array) : null;
	},

	stripScripts: function(option){
		var scripts = '';
		var text = this.replace(/<script[^>]*>([\s\S]*?)<\/script>/gi, function(){
			scripts += arguments[1] + '\n';
			return '';
		});
		if (option === true) $exec(scripts);
		else if ($type(option) == 'function') option(scripts, text);
		return text;
	},

	substitute: function(object, regexp){
		return this.replace(regexp || (/\\?\{([^{}]+)\}/g), function(match, name){
			if (match.charAt(0) == '\\') return match.slice(1);
			return (object[name] != undefined) ? object[name] : '';
		});
	}

});


/*
---

script: Hash.js

description: Contains Hash Prototypes. Provides a means for overcoming the JavaScript practical impossibility of extending native Objects.

license: MIT-style license.

requires:
- /Hash.base

provides: [Hash]

...
*/

Hash.implement({

	has: Object.prototype.hasOwnProperty,

	keyOf: function(value){
		for (var key in this){
			if (this.hasOwnProperty(key) && this[key] === value) return key;
		}
		return null;
	},

	hasValue: function(value){
		return (Hash.keyOf(this, value) !== null);
	},

	extend: function(properties){
		Hash.each(properties || {}, function(value, key){
			Hash.set(this, key, value);
		}, this);
		return this;
	},

	combine: function(properties){
		Hash.each(properties || {}, function(value, key){
			Hash.include(this, key, value);
		}, this);
		return this;
	},

	erase: function(key){
		if (this.hasOwnProperty(key)) delete this[key];
		return this;
	},

	get: function(key){
		return (this.hasOwnProperty(key)) ? this[key] : null;
	},

	set: function(key, value){
		if (!this[key] || this.hasOwnProperty(key)) this[key] = value;
		return this;
	},

	empty: function(){
		Hash.each(this, function(value, key){
			delete this[key];
		}, this);
		return this;
	},

	include: function(key, value){
		if (this[key] == undefined) this[key] = value;
		return this;
	},

	map: function(fn, bind){
		var results = new Hash;
		Hash.each(this, function(value, key){
			results.set(key, fn.call(bind, value, key, this));
		}, this);
		return results;
	},

	filter: function(fn, bind){
		var results = new Hash;
		Hash.each(this, function(value, key){
			if (fn.call(bind, value, key, this)) results.set(key, value);
		}, this);
		return results;
	},

	every: function(fn, bind){
		for (var key in this){
			if (this.hasOwnProperty(key) && !fn.call(bind, this[key], key)) return false;
		}
		return true;
	},

	some: function(fn, bind){
		for (var key in this){
			if (this.hasOwnProperty(key) && fn.call(bind, this[key], key)) return true;
		}
		return false;
	},

	getKeys: function(){
		var keys = [];
		Hash.each(this, function(value, key){
			keys.push(key);
		});
		return keys;
	},

	getValues: function(){
		var values = [];
		Hash.each(this, function(value){
			values.push(value);
		});
		return values;
	},

	toQueryString: function(base){
		var queryString = [];
		Hash.each(this, function(value, key){
			if (base) key = base + '[' + key + ']';
			var result;
			switch ($type(value)){
				case 'object': result = Hash.toQueryString(value, key); break;
				case 'array':
					var qs = {};
					value.each(function(val, i){
						qs[i] = val;
					});
					result = Hash.toQueryString(qs, key);
				break;
				default: result = key + '=' + encodeURIComponent(value);
			}
			if (value != undefined) queryString.push(result);
		});

		return queryString.join('&');
	}

});

Hash.alias({keyOf: 'indexOf', hasValue: 'contains'});


/*
---

script: Event.js

description: Contains the Event Class, to make the event object cross-browser.

license: MIT-style license.

requires:
- /Window
- /Document
- /Hash
- /Array
- /Function
- /String

provides: [Event]

...
*/

var Event = new Native({

	name: 'Event',

	initialize: function(event, win){
		win = win || window;
		var doc = win.document;
		event = event || win.event;
		if (event.$extended) return event;
		this.$extended = true;
		var type = event.type;
		var target = event.target || event.srcElement;
		while (target && target.nodeType == 3) target = target.parentNode;

		if (type.test(/key/)){
			var code = event.which || event.keyCode;
			var key = Event.Keys.keyOf(code);
			if (type == 'keydown'){
				var fKey = code - 111;
				if (fKey > 0 && fKey < 13) key = 'f' + fKey;
			}
			key = key || String.fromCharCode(code).toLowerCase();
		} else if (type.match(/(click|mouse|menu)/i)){
			doc = (!doc.compatMode || doc.compatMode == 'CSS1Compat') ? doc.html : doc.body;
			var page = {
				x: event.pageX || event.clientX + doc.scrollLeft,
				y: event.pageY || event.clientY + doc.scrollTop
			};
			var client = {
				x: (event.pageX) ? event.pageX - win.pageXOffset : event.clientX,
				y: (event.pageY) ? event.pageY - win.pageYOffset : event.clientY
			};
			if (type.match(/DOMMouseScroll|mousewheel/)){
				var wheel = (event.wheelDelta) ? event.wheelDelta / 120 : -(event.detail || 0) / 3;
			}
			var rightClick = (event.which == 3) || (event.button == 2);
			var related = null;
			if (type.match(/over|out/)){
				switch (type){
					case 'mouseover': related = event.relatedTarget || event.fromElement; break;
					case 'mouseout': related = event.relatedTarget || event.toElement;
				}
				if (!(function(){
					while (related && related.nodeType == 3) related = related.parentNode;
					return true;
				}).create({attempt: Browser.Engine.gecko})()) related = false;
			}
		}

		return $extend(this, {
			event: event,
			type: type,

			page: page,
			client: client,
			rightClick: rightClick,

			wheel: wheel,

			relatedTarget: related,
			target: target,

			code: code,
			key: key,

			shift: event.shiftKey,
			control: event.ctrlKey,
			alt: event.altKey,
			meta: event.metaKey
		});
	}

});

Event.Keys = new Hash({
	'enter': 13,
	'up': 38,
	'down': 40,
	'left': 37,
	'right': 39,
	'esc': 27,
	'space': 32,
	'backspace': 8,
	'tab': 9,
	'delete': 46
});

Event.implement({

	stop: function(){
		return this.stopPropagation().preventDefault();
	},

	stopPropagation: function(){
		if (this.event.stopPropagation) this.event.stopPropagation();
		else this.event.cancelBubble = true;
		return this;
	},

	preventDefault: function(){
		if (this.event.preventDefault) this.event.preventDefault();
		else this.event.returnValue = false;
		return this;
	}

});


/*
---

script: Class.js

description: Contains the Class Function for easily creating, extending, and implementing reusable Classes.

license: MIT-style license.

requires:
- /$util
- /Native
- /Array
- /String
- /Function
- /Number
- /Hash

provides: [Class]

...
*/

function Class(params){
	
	if (params instanceof Function) params = {initialize: params};
	
	var newClass = function(){
		Object.reset(this);
		if (newClass._prototyping) return this;
		this._current = $empty;
		var value = (this.initialize) ? this.initialize.apply(this, arguments) : this;
		delete this._current; delete this.caller;
		return value;
	}.extend(this);
	
	newClass.implement(params);
	
	newClass.constructor = Class;
	newClass.prototype.constructor = newClass;

	return newClass;

};

Function.prototype.protect = function(){
	this._protected = true;
	return this;
};

Object.reset = function(object, key){
		
	if (key == null){
		for (var p in object) Object.reset(object, p);
		return object;
	}
	
	delete object[key];
	
	switch ($type(object[key])){
		case 'object':
			var F = function(){};
			F.prototype = object[key];
			var i = new F;
			object[key] = Object.reset(i);
		break;
		case 'array': object[key] = $unlink(object[key]); break;
	}
	
	return object;
	
};

new Native({name: 'Class', initialize: Class}).extend({

	instantiate: function(F){
		F._prototyping = true;
		var proto = new F;
		delete F._prototyping;
		return proto;
	},
	
	wrap: function(self, key, method){
		if (method._origin) method = method._origin;
		
		return function(){
			if (method._protected && this._current == null) throw new Error('The method "' + key + '" cannot be called.');
			var caller = this.caller, current = this._current;
			this.caller = current; this._current = arguments.callee;
			var result = method.apply(this, arguments);
			this._current = current; this.caller = caller;
			return result;
		}.extend({_owner: self, _origin: method, _name: key});

	}
	
});

Class.implement({
	
	implement: function(key, value){
		
		if ($type(key) == 'object'){
			for (var p in key) this.implement(p, key[p]);
			return this;
		}
		
		var mutator = Class.Mutators[key];
		
		if (mutator){
			value = mutator.call(this, value);
			if (value == null) return this;
		}
		
		var proto = this.prototype;

		switch ($type(value)){
			
			case 'function':
				if (value._hidden) return this;
				proto[key] = Class.wrap(this, key, value);
			break;
			
			case 'object':
				var previous = proto[key];
				if ($type(previous) == 'object') $mixin(previous, value);
				else proto[key] = $unlink(value);
			break;
			
			case 'array':
				proto[key] = $unlink(value);
			break;
			
			default: proto[key] = value;

		}
		
		return this;

	}
	
});

Class.Mutators = {
	
	Extends: function(parent){

		this.parent = parent;
		this.prototype = Class.instantiate(parent);

		this.implement('parent', function(){
			var name = this.caller._name, previous = this.caller._owner.parent.prototype[name];
			if (!previous) throw new Error('The method "' + name + '" has no parent.');
			return previous.apply(this, arguments);
		}.protect());

	},

	Implements: function(items){
		$splat(items).each(function(item){
			if (item instanceof Function) item = Class.instantiate(item);
			this.implement(item);
		}, this);

	}
	
};


/*
---

script: Class.Extras.js

description: Contains Utility Classes that can be implemented into your own Classes to ease the execution of many common tasks.

license: MIT-style license.

requires:
- /Class

provides: [Chain, Events, Options]

...
*/

var Chain = new Class({

	$chain: [],

	chain: function(){
		this.$chain.extend(Array.flatten(arguments));
		return this;
	},

	callChain: function(){
		return (this.$chain.length) ? this.$chain.shift().apply(this, arguments) : false;
	},

	clearChain: function(){
		this.$chain.empty();
		return this;
	}

});

var Events = new Class({

	$events: {},

	addEvent: function(type, fn, internal){
		type = Events.removeOn(type);
		if (fn != $empty){
			this.$events[type] = this.$events[type] || [];
			this.$events[type].include(fn);
			if (internal) fn.internal = true;
		}
		return this;
	},

	addEvents: function(events){
		for (var type in events) this.addEvent(type, events[type]);
		return this;
	},

	fireEvent: function(type, args, delay){
		type = Events.removeOn(type);
		if (!this.$events || !this.$events[type]) return this;
		this.$events[type].each(function(fn){
			fn.create({'bind': this, 'delay': delay, 'arguments': args})();
		}, this);
		return this;
	},

	removeEvent: function(type, fn){
		type = Events.removeOn(type);
		if (!this.$events[type]) return this;
		if (!fn.internal) this.$events[type].erase(fn);
		return this;
	},

	removeEvents: function(events){
		var type;
		if ($type(events) == 'object'){
			for (type in events) this.removeEvent(type, events[type]);
			return this;
		}
		if (events) events = Events.removeOn(events);
		for (type in this.$events){
			if (events && events != type) continue;
			var fns = this.$events[type];
			for (var i = fns.length; i--; i) this.removeEvent(type, fns[i]);
		}
		return this;
	}

});

Events.removeOn = function(string){
	return string.replace(/^on([A-Z])/, function(full, first){
		return first.toLowerCase();
	});
};

var Options = new Class({

	setOptions: function(){
		this.options = $merge.run([this.options].extend(arguments));
		if (!this.addEvent) return this;
		for (var option in this.options){
			if ($type(this.options[option]) != 'function' || !(/^on[A-Z]/).test(option)) continue;
			this.addEvent(option, this.options[option]);
			delete this.options[option];
		}
		return this;
	}

});


/*
---

script: Element.js

description: One of the most important items in MooTools. Contains the dollar function, the dollars function, and an handful of cross-browser, time-saver methods to let you easily work with HTML Elements.

license: MIT-style license.

requires:
- /Window
- /Document
- /Array
- /String
- /Function
- /Number
- /Hash

provides: [Element, Elements, $, $$, Iframe]

...
*/

var Element = new Native({

	name: 'Element',

	legacy: window.Element,

	initialize: function(tag, props){
		var konstructor = Element.Constructors.get(tag);
		if (konstructor) return konstructor(props);
		if (typeof tag == 'string') return document.newElement(tag, props);
		return document.id(tag).set(props);
	},

	afterImplement: function(key, value){
		Element.Prototype[key] = value;
		if (Array[key]) return;
		Elements.implement(key, function(){
			var items = [], elements = true;
			for (var i = 0, j = this.length; i < j; i++){
				var returns = this[i][key].apply(this[i], arguments);
				items.push(returns);
				if (elements) elements = ($type(returns) == 'element');
			}
			return (elements) ? new Elements(items) : items;
		});
	}

});

Element.Prototype = {$family: {name: 'element'}};

Element.Constructors = new Hash;

var IFrame = new Native({

	name: 'IFrame',

	generics: false,

	initialize: function(){
		var params = Array.link(arguments, {properties: Object.type, iframe: $defined});
		var props = params.properties || {};
		var iframe = document.id(params.iframe);
		var onload = props.onload || $empty;
		delete props.onload;
		props.id = props.name = $pick(props.id, props.name, iframe ? (iframe.id || iframe.name) : 'IFrame_' + $time());
		iframe = new Element(iframe || 'iframe', props);
		var onFrameLoad = function(){
			var host = $try(function(){
				return iframe.contentWindow.location.host;
			});
			if (!host || host == window.location.host){
				var win = new Window(iframe.contentWindow);
				new Document(iframe.contentWindow.document);
				$extend(win.Element.prototype, Element.Prototype);
			}
			onload.call(iframe.contentWindow, iframe.contentWindow.document);
		};
		var contentWindow = $try(function(){
			return iframe.contentWindow;
		});
		((contentWindow && contentWindow.document.body) || window.frames[props.id]) ? onFrameLoad() : iframe.addListener('load', onFrameLoad);
		return iframe;
	}

});

var Elements = new Native({

	initialize: function(elements, options){
		options = $extend({ddup: true, cash: true}, options);
		elements = elements || [];
		if (options.ddup || options.cash){
			var uniques = {}, returned = [];
			for (var i = 0, l = elements.length; i < l; i++){
				var el = document.id(elements[i], !options.cash);
				if (options.ddup){
					if (uniques[el.uid]) continue;
					uniques[el.uid] = true;
				}
				if (el) returned.push(el);
			}
			elements = returned;
		}
		return (options.cash) ? $extend(elements, this) : elements;
	}

});

Elements.implement({

	filter: function(filter, bind){
		if (!filter) return this;
		return new Elements(Array.filter(this, (typeof filter == 'string') ? function(item){
			return item.match(filter);
		} : filter, bind));
	}

});

Document.implement({

	newElement: function(tag, props){
		if (Browser.Engine.trident && props){
			['name', 'type', 'checked'].each(function(attribute){
				if (!props[attribute]) return;
				tag += ' ' + attribute + '="' + props[attribute] + '"';
				if (attribute != 'checked') delete props[attribute];
			});
			tag = '<' + tag + '>';
		}
		return document.id(this.createElement(tag)).set(props);
	},

	newTextNode: function(text){
		return this.createTextNode(text);
	},

	getDocument: function(){
		return this;
	},

	getWindow: function(){
		return this.window;
	},
	
	id: (function(){
		
		var types = {

			string: function(id, nocash, doc){
				id = doc.getElementById(id);
				return (id) ? types.element(id, nocash) : null;
			},
			
			element: function(el, nocash){
				$uid(el);
				if (!nocash && !el.$family && !(/^object|embed$/i).test(el.tagName)){
					var proto = Element.Prototype;
					for (var p in proto) el[p] = proto[p];
				};
				return el;
			},
			
			object: function(obj, nocash, doc){
				if (obj.toElement) return types.element(obj.toElement(doc), nocash);
				return null;
			}
			
		};

		types.textnode = types.whitespace = types.window = types.document = $arguments(0);
		
		return function(el, nocash, doc){
			if (el && el.$family && el.uid) return el;
			var type = $type(el);
			return (types[type]) ? types[type](el, nocash, doc || document) : null;
		};

	})()

});

if (window.$ == null) Window.implement({
	$: function(el, nc){
		return document.id(el, nc, this.document);
	}
});

Window.implement({

	$$: function(selector){
		if (arguments.length == 1 && typeof selector == 'string') return this.document.getElements(selector);
		var elements = [];
		var args = Array.flatten(arguments);
		for (var i = 0, l = args.length; i < l; i++){
			var item = args[i];
			switch ($type(item)){
				case 'element': elements.push(item); break;
				case 'string': elements.extend(this.document.getElements(item, true));
			}
		}
		return new Elements(elements);
	},

	getDocument: function(){
		return this.document;
	},

	getWindow: function(){
		return this;
	}

});

Native.implement([Element, Document], {

	getElement: function(selector, nocash){
		return document.id(this.getElements(selector, true)[0] || null, nocash);
	},

	getElements: function(tags, nocash){
		tags = tags.split(',');
		var elements = [];
		var ddup = (tags.length > 1);
		tags.each(function(tag){
			var partial = this.getElementsByTagName(tag.trim());
			(ddup) ? elements.extend(partial) : elements = partial;
		}, this);
		return new Elements(elements, {ddup: ddup, cash: !nocash});
	}

});

(function(){

var collected = {}, storage = {};
var props = {input: 'checked', option: 'selected', textarea: (Browser.Engine.webkit && Browser.Engine.version < 420) ? 'innerHTML' : 'value'};

var get = function(uid){
	return (storage[uid] || (storage[uid] = {}));
};

var clean = function(item, retain){
	if (!item) return;
	var uid = item.uid;
	if (Browser.Engine.trident){
		if (item.clearAttributes){
			var clone = retain && item.cloneNode(false);
			item.clearAttributes();
			if (clone) item.mergeAttributes(clone);
		} else if (item.removeEvents){
			item.removeEvents();
		}
		if ((/object/i).test(item.tagName)){
			for (var p in item){
				if (typeof item[p] == 'function') item[p] = $empty;
			}
			Element.dispose(item);
		}
	}	
	if (!uid) return;
	collected[uid] = storage[uid] = null;
};

var purge = function(){
	Hash.each(collected, clean);
	if (Browser.Engine.trident) $A(document.getElementsByTagName('object')).each(clean);
	if (window.CollectGarbage) CollectGarbage();
	collected = storage = null;
};

var walk = function(element, walk, start, match, all, nocash){
	var el = element[start || walk];
	var elements = [];
	while (el){
		if (el.nodeType == 1 && (!match || Element.match(el, match))){
			if (!all) return document.id(el, nocash);
			elements.push(el);
		}
		el = el[walk];
	}
	return (all) ? new Elements(elements, {ddup: false, cash: !nocash}) : null;
};

var attributes = {
	'html': 'innerHTML',
	'class': 'className',
	'for': 'htmlFor',
	'defaultValue': 'defaultValue',
	'text': (Browser.Engine.trident || (Browser.Engine.webkit && Browser.Engine.version < 420)) ? 'innerText' : 'textContent'
};
var bools = ['compact', 'nowrap', 'ismap', 'declare', 'noshade', 'checked', 'disabled', 'readonly', 'multiple', 'selected', 'noresize', 'defer'];
var camels = ['value', 'type', 'defaultValue', 'accessKey', 'cellPadding', 'cellSpacing', 'colSpan', 'frameBorder', 'maxLength', 'readOnly', 'rowSpan', 'tabIndex', 'useMap'];

bools = bools.associate(bools);

Hash.extend(attributes, bools);
Hash.extend(attributes, camels.associate(camels.map(String.toLowerCase)));

var inserters = {

	before: function(context, element){
		if (element.parentNode) element.parentNode.insertBefore(context, element);
	},

	after: function(context, element){
		if (!element.parentNode) return;
		var next = element.nextSibling;
		(next) ? element.parentNode.insertBefore(context, next) : element.parentNode.appendChild(context);
	},

	bottom: function(context, element){
		element.appendChild(context);
	},

	top: function(context, element){
		var first = element.firstChild;
		(first) ? element.insertBefore(context, first) : element.appendChild(context);
	}

};

inserters.inside = inserters.bottom;

Hash.each(inserters, function(inserter, where){

	where = where.capitalize();

	Element.implement('inject' + where, function(el){
		inserter(this, document.id(el, true));
		return this;
	});

	Element.implement('grab' + where, function(el){
		inserter(document.id(el, true), this);
		return this;
	});

});

Element.implement({

	set: function(prop, value){
		switch ($type(prop)){
			case 'object':
				for (var p in prop) this.set(p, prop[p]);
				break;
			case 'string':
				var property = Element.Properties.get(prop);
				(property && property.set) ? property.set.apply(this, Array.slice(arguments, 1)) : this.setProperty(prop, value);
		}
		return this;
	},

	get: function(prop){
		var property = Element.Properties.get(prop);
		return (property && property.get) ? property.get.apply(this, Array.slice(arguments, 1)) : this.getProperty(prop);
	},

	erase: function(prop){
		var property = Element.Properties.get(prop);
		(property && property.erase) ? property.erase.apply(this) : this.removeProperty(prop);
		return this;
	},

	setProperty: function(attribute, value){
		var key = attributes[attribute];
		if (value == undefined) return this.removeProperty(attribute);
		if (key && bools[attribute]) value = !!value;
		(key) ? this[key] = value : this.setAttribute(attribute, '' + value);
		return this;
	},

	setProperties: function(attributes){
		for (var attribute in attributes) this.setProperty(attribute, attributes[attribute]);
		return this;
	},

	getProperty: function(attribute){
		var key = attributes[attribute];
		var value = (key) ? this[key] : this.getAttribute(attribute, 2);
		return (bools[attribute]) ? !!value : (key) ? value : value || null;
	},

	getProperties: function(){
		var args = $A(arguments);
		return args.map(this.getProperty, this).associate(args);
	},

	removeProperty: function(attribute){
		var key = attributes[attribute];
		(key) ? this[key] = (key && bools[attribute]) ? false : '' : this.removeAttribute(attribute);
		return this;
	},

	removeProperties: function(){
		Array.each(arguments, this.removeProperty, this);
		return this;
	},

	hasClass: function(className){
		return this.className.contains(className, ' ');
	},

	addClass: function(className){
		if (!this.hasClass(className)) this.className = (this.className + ' ' + className).clean();
		return this;
	},

	removeClass: function(className){
		this.className = this.className.replace(new RegExp('(^|\\s)' + className + '(?:\\s|$)'), '$1');
		return this;
	},

	toggleClass: function(className){
		return this.hasClass(className) ? this.removeClass(className) : this.addClass(className);
	},

	adopt: function(){
		Array.flatten(arguments).each(function(element){
			element = document.id(element, true);
			if (element) this.appendChild(element);
		}, this);
		return this;
	},

	appendText: function(text, where){
		return this.grab(this.getDocument().newTextNode(text), where);
	},

	grab: function(el, where){
		inserters[where || 'bottom'](document.id(el, true), this);
		return this;
	},

	inject: function(el, where){
		inserters[where || 'bottom'](this, document.id(el, true));
		return this;
	},

	replaces: function(el){
		el = document.id(el, true);
		el.parentNode.replaceChild(this, el);
		return this;
	},

	wraps: function(el, where){
		el = document.id(el, true);
		return this.replaces(el).grab(el, where);
	},

	getPrevious: function(match, nocash){
		return walk(this, 'previousSibling', null, match, false, nocash);
	},

	getAllPrevious: function(match, nocash){
		return walk(this, 'previousSibling', null, match, true, nocash);
	},

	getNext: function(match, nocash){
		return walk(this, 'nextSibling', null, match, false, nocash);
	},

	getAllNext: function(match, nocash){
		return walk(this, 'nextSibling', null, match, true, nocash);
	},

	getFirst: function(match, nocash){
		return walk(this, 'nextSibling', 'firstChild', match, false, nocash);
	},

	getLast: function(match, nocash){
		return walk(this, 'previousSibling', 'lastChild', match, false, nocash);
	},

	getParent: function(match, nocash){
		return walk(this, 'parentNode', null, match, false, nocash);
	},

	getParents: function(match, nocash){
		return walk(this, 'parentNode', null, match, true, nocash);
	},
	
	getSiblings: function(match, nocash){
		return this.getParent().getChildren(match, nocash).erase(this);
	},

	getChildren: function(match, nocash){
		return walk(this, 'nextSibling', 'firstChild', match, true, nocash);
	},

	getWindow: function(){
		return this.ownerDocument.window;
	},

	getDocument: function(){
		return this.ownerDocument;
	},

	getElementById: function(id, nocash){
		var el = this.ownerDocument.getElementById(id);
		if (!el) return null;
		for (var parent = el.parentNode; parent != this; parent = parent.parentNode){
			if (!parent) return null;
		}
		return document.id(el, nocash);
	},

	getSelected: function(){
		return new Elements($A(this.options).filter(function(option){
			return option.selected;
		}));
	},

	getComputedStyle: function(property){
		if (this.currentStyle) return this.currentStyle[property.camelCase()];
		var computed = this.getDocument().defaultView.getComputedStyle(this, null);
		return (computed) ? computed.getPropertyValue([property.hyphenate()]) : null;
	},

	toQueryString: function(){
		var queryString = [];
		this.getElements('input, select, textarea', true).each(function(el){
			if (!el.name || el.disabled || el.type == 'submit' || el.type == 'reset' || el.type == 'file') return;
			var value = (el.tagName.toLowerCase() == 'select') ? Element.getSelected(el).map(function(opt){
				return opt.value;
			}) : ((el.type == 'radio' || el.type == 'checkbox') && !el.checked) ? null : el.value;
			$splat(value).each(function(val){
				if (typeof val != 'undefined') queryString.push(el.name + '=' + encodeURIComponent(val));
			});
		});
		return queryString.join('&');
	},

	clone: function(contents, keepid){
		contents = contents !== false;
		var clone = this.cloneNode(contents);
		var clean = function(node, element){
			if (!keepid) node.removeAttribute('id');
			if (Browser.Engine.trident){
				node.clearAttributes();
				node.mergeAttributes(element);
				node.removeAttribute('uid');
				if (node.options){
					var no = node.options, eo = element.options;
					for (var j = no.length; j--;) no[j].selected = eo[j].selected;
				}
			}
			var prop = props[element.tagName.toLowerCase()];
			if (prop && element[prop]) node[prop] = element[prop];
		};

		if (contents){
			var ce = clone.getElementsByTagName('*'), te = this.getElementsByTagName('*');
			for (var i = ce.length; i--;) clean(ce[i], te[i]);
		}

		clean(clone, this);
		return document.id(clone);
	},

	destroy: function(){
		Element.empty(this);
		Element.dispose(this);
		clean(this, true);
		return null;
	},

	empty: function(){
		$A(this.childNodes).each(function(node){
			Element.destroy(node);
		});
		return this;
	},

	dispose: function(){
		return (this.parentNode) ? this.parentNode.removeChild(this) : this;
	},

	hasChild: function(el){
		el = document.id(el, true);
		if (!el) return false;
		if (Browser.Engine.webkit && Browser.Engine.version < 420) return $A(this.getElementsByTagName(el.tagName)).contains(el);
		return (this.contains) ? (this != el && this.contains(el)) : !!(this.compareDocumentPosition(el) & 16);
	},

	match: function(tag){
		return (!tag || (tag == this) || (Element.get(this, 'tag') == tag));
	}

});

Native.implement([Element, Window, Document], {

	addListener: function(type, fn){
		if (type == 'unload'){
			var old = fn, self = this;
			fn = function(){
				self.removeListener('unload', fn);
				old();
			};
		} else {
			collected[this.uid] = this;
		}
		if (this.addEventListener) this.addEventListener(type, fn, false);
		else this.attachEvent('on' + type, fn);
		return this;
	},

	removeListener: function(type, fn){
		if (this.removeEventListener) this.removeEventListener(type, fn, false);
		else this.detachEvent('on' + type, fn);
		return this;
	},

	retrieve: function(property, dflt){
		var storage = get(this.uid), prop = storage[property];
		if (dflt != undefined && prop == undefined) prop = storage[property] = dflt;
		return $pick(prop);
	},

	store: function(property, value){
		var storage = get(this.uid);
		storage[property] = value;
		return this;
	},

	eliminate: function(property){
		var storage = get(this.uid);
		delete storage[property];
		return this;
	}

});

window.addListener('unload', purge);

})();

Element.Properties = new Hash;

Element.Properties.style = {

	set: function(style){
		this.style.cssText = style;
	},

	get: function(){
		return this.style.cssText;
	},

	erase: function(){
		this.style.cssText = '';
	}

};

Element.Properties.tag = {

	get: function(){
		return this.tagName.toLowerCase();
	}

};

Element.Properties.html = (function(){
	var wrapper = document.createElement('div');

	var translations = {
		table: [1, '<table>', '</table>'],
		select: [1, '<select>', '</select>'],
		tbody: [2, '<table><tbody>', '</tbody></table>'],
		tr: [3, '<table><tbody><tr>', '</tr></tbody></table>']
	};
	translations.thead = translations.tfoot = translations.tbody;

	var html = {
		set: function(){
			var html = Array.flatten(arguments).join('');
			var wrap = Browser.Engine.trident && translations[this.get('tag')];
			if (wrap){
				var first = wrapper;
				first.innerHTML = wrap[1] + html + wrap[2];
				for (var i = wrap[0]; i--;) first = first.firstChild;
				this.empty().adopt(first.childNodes);
			} else {
				this.innerHTML = html;
			}
		}
	};

	html.erase = html.set;

	return html;
})();

if (Browser.Engine.webkit && Browser.Engine.version < 420) Element.Properties.text = {
	get: function(){
		if (this.innerText) return this.innerText;
		var temp = this.ownerDocument.newElement('div', {html: this.innerHTML}).inject(this.ownerDocument.body);
		var text = temp.innerText;
		temp.destroy();
		return text;
	}
};


/*
---

script: Element.Event.js

description: Contains Element methods for dealing with events. This file also includes mouseenter and mouseleave custom Element Events.

license: MIT-style license.

requires: 
- /Element
- /Event

provides: [Element.Event]

...
*/

Element.Properties.events = {set: function(events){
	this.addEvents(events);
}};

Native.implement([Element, Window, Document], {

	addEvent: function(type, fn){
		var events = this.retrieve('events', {});
		events[type] = events[type] || {'keys': [], 'values': []};
		if (events[type].keys.contains(fn)) return this;
		events[type].keys.push(fn);
		var realType = type, custom = Element.Events.get(type), condition = fn, self = this;
		if (custom){
			if (custom.onAdd) custom.onAdd.call(this, fn);
			if (custom.condition){
				condition = function(event){
					if (custom.condition.call(this, event)) return fn.call(this, event);
					return true;
				};
			}
			realType = custom.base || realType;
		}
		var defn = function(){
			return fn.call(self);
		};
		var nativeEvent = Element.NativeEvents[realType];
		if (nativeEvent){
			if (nativeEvent == 2){
				defn = function(event){
					event = new Event(event, self.getWindow());
					if (condition.call(self, event) === false) event.stop();
				};
			}
			this.addListener(realType, defn);
		}
		events[type].values.push(defn);
		return this;
	},

	removeEvent: function(type, fn){
		var events = this.retrieve('events');
		if (!events || !events[type]) return this;
		var pos = events[type].keys.indexOf(fn);
		if (pos == -1) return this;
		events[type].keys.splice(pos, 1);
		var value = events[type].values.splice(pos, 1)[0];
		var custom = Element.Events.get(type);
		if (custom){
			if (custom.onRemove) custom.onRemove.call(this, fn);
			type = custom.base || type;
		}
		return (Element.NativeEvents[type]) ? this.removeListener(type, value) : this;
	},

	addEvents: function(events){
		for (var event in events) this.addEvent(event, events[event]);
		return this;
	},

	removeEvents: function(events){
		var type;
		if ($type(events) == 'object'){
			for (type in events) this.removeEvent(type, events[type]);
			return this;
		}
		var attached = this.retrieve('events');
		if (!attached) return this;
		if (!events){
			for (type in attached) this.removeEvents(type);
			this.eliminate('events');
		} else if (attached[events]){
			while (attached[events].keys[0]) this.removeEvent(events, attached[events].keys[0]);
			attached[events] = null;
		}
		return this;
	},

	fireEvent: function(type, args, delay){
		var events = this.retrieve('events');
		if (!events || !events[type]) return this;
		events[type].keys.each(function(fn){
			fn.create({'bind': this, 'delay': delay, 'arguments': args})();
		}, this);
		return this;
	},

	cloneEvents: function(from, type){
		from = document.id(from);
		var fevents = from.retrieve('events');
		if (!fevents) return this;
		if (!type){
			for (var evType in fevents) this.cloneEvents(from, evType);
		} else if (fevents[type]){
			fevents[type].keys.each(function(fn){
				this.addEvent(type, fn);
			}, this);
		}
		return this;
	}

});

Element.NativeEvents = {
	click: 2, dblclick: 2, mouseup: 2, mousedown: 2, contextmenu: 2, //mouse buttons
	mousewheel: 2, DOMMouseScroll: 2, //mouse wheel
	mouseover: 2, mouseout: 2, mousemove: 2, selectstart: 2, selectend: 2, //mouse movement
	keydown: 2, keypress: 2, keyup: 2, //keyboard
	focus: 2, blur: 2, change: 2, reset: 2, select: 2, submit: 2, //form elements
	load: 1, unload: 1, beforeunload: 2, resize: 1, move: 1, DOMContentLoaded: 1, readystatechange: 1, //window
	error: 1, abort: 1, scroll: 1 //misc
};

(function(){

var $check = function(event){
	var related = event.relatedTarget;
	if (related == undefined) return true;
	if (related === false) return false;
	return ($type(this) != 'document' && related != this && related.prefix != 'xul' && !this.hasChild(related));
};

Element.Events = new Hash({

	mouseenter: {
		base: 'mouseover',
		condition: $check
	},

	mouseleave: {
		base: 'mouseout',
		condition: $check
	},

	mousewheel: {
		base: (Browser.Engine.gecko) ? 'DOMMouseScroll' : 'mousewheel'
	}

});

})();


/*
---

script: Element.Style.js

description: Contains methods for interacting with the styles of Elements in a fashionable way.

license: MIT-style license.

requires:
- /Element

provides: [Element.Style]

...
*/

Element.Properties.styles = {set: function(styles){
	this.setStyles(styles);
}};

Element.Properties.opacity = {

	set: function(opacity, novisibility){
		if (!novisibility){
			if (opacity == 0){
				if (this.style.visibility != 'hidden') this.style.visibility = 'hidden';
			} else {
				if (this.style.visibility != 'visible') this.style.visibility = 'visible';
			}
		}
		if (!this.currentStyle || !this.currentStyle.hasLayout) this.style.zoom = 1;
		if (Browser.Engine.trident) this.style.filter = (opacity == 1) ? '' : 'alpha(opacity=' + opacity * 100 + ')';
		this.style.opacity = opacity;
		this.store('opacity', opacity);
	},

	get: function(){
		return this.retrieve('opacity', 1);
	}

};

Element.implement({

	setOpacity: function(value){
		return this.set('opacity', value, true);
	},

	getOpacity: function(){
		return this.get('opacity');
	},

	setStyle: function(property, value){
		switch (property){
			case 'opacity': return this.set('opacity', parseFloat(value));
			case 'float': property = (Browser.Engine.trident) ? 'styleFloat' : 'cssFloat';
		}
		property = property.camelCase();
		if ($type(value) != 'string'){
			var map = (Element.Styles.get(property) || '@').split(' ');
			value = $splat(value).map(function(val, i){
				if (!map[i]) return '';
				return ($type(val) == 'number') ? map[i].replace('@', Math.round(val)) : val;
			}).join(' ');
		} else if (value == String(Number(value))){
			value = Math.round(value);
		}
		this.style[property] = value;
		return this;
	},

	getStyle: function(property){
		switch (property){
			case 'opacity': return this.get('opacity');
			case 'float': property = (Browser.Engine.trident) ? 'styleFloat' : 'cssFloat';
		}
		property = property.camelCase();
		var result = this.style[property];
		if (!$chk(result)){
			result = [];
			for (var style in Element.ShortStyles){
				if (property != style) continue;
				for (var s in Element.ShortStyles[style]) result.push(this.getStyle(s));
				return result.join(' ');
			}
			result = this.getComputedStyle(property);
		}
		if (result){
			result = String(result);
			var color = result.match(/rgba?\([\d\s,]+\)/);
			if (color) result = result.replace(color[0], color[0].rgbToHex());
		}
		if (Browser.Engine.presto || (Browser.Engine.trident && !$chk(parseInt(result, 10)))){
			if (property.test(/^(height|width)$/)){
				var values = (property == 'width') ? ['left', 'right'] : ['top', 'bottom'], size = 0;
				values.each(function(value){
					size += this.getStyle('border-' + value + '-width').toInt() + this.getStyle('padding-' + value).toInt();
				}, this);
				return this['offset' + property.capitalize()] - size + 'px';
			}
			if ((Browser.Engine.presto) && String(result).test('px')) return result;
			if (property.test(/(border(.+)Width|margin|padding)/)) return '0px';
		}
		return result;
	},

	setStyles: function(styles){
		for (var style in styles) this.setStyle(style, styles[style]);
		return this;
	},

	getStyles: function(){
		var result = {};
		Array.flatten(arguments).each(function(key){
			result[key] = this.getStyle(key);
		}, this);
		return result;
	}

});

Element.Styles = new Hash({
	left: '@px', top: '@px', bottom: '@px', right: '@px',
	width: '@px', height: '@px', maxWidth: '@px', maxHeight: '@px', minWidth: '@px', minHeight: '@px',
	backgroundColor: 'rgb(@, @, @)', backgroundPosition: '@px @px', color: 'rgb(@, @, @)',
	fontSize: '@px', letterSpacing: '@px', lineHeight: '@px', clip: 'rect(@px @px @px @px)',
	margin: '@px @px @px @px', padding: '@px @px @px @px', border: '@px @ rgb(@, @, @) @px @ rgb(@, @, @) @px @ rgb(@, @, @)',
	borderWidth: '@px @px @px @px', borderStyle: '@ @ @ @', borderColor: 'rgb(@, @, @) rgb(@, @, @) rgb(@, @, @) rgb(@, @, @)',
	zIndex: '@', 'zoom': '@', fontWeight: '@', textIndent: '@px', opacity: '@'
});

Element.ShortStyles = {margin: {}, padding: {}, border: {}, borderWidth: {}, borderStyle: {}, borderColor: {}};

['Top', 'Right', 'Bottom', 'Left'].each(function(direction){
	var Short = Element.ShortStyles;
	var All = Element.Styles;
	['margin', 'padding'].each(function(style){
		var sd = style + direction;
		Short[style][sd] = All[sd] = '@px';
	});
	var bd = 'border' + direction;
	Short.border[bd] = All[bd] = '@px @ rgb(@, @, @)';
	var bdw = bd + 'Width', bds = bd + 'Style', bdc = bd + 'Color';
	Short[bd] = {};
	Short.borderWidth[bdw] = Short[bd][bdw] = All[bdw] = '@px';
	Short.borderStyle[bds] = Short[bd][bds] = All[bds] = '@';
	Short.borderColor[bdc] = Short[bd][bdc] = All[bdc] = 'rgb(@, @, @)';
});


/*
---

script: Element.Dimensions.js

description: Contains methods to work with size, scroll, or positioning of Elements and the window object.

license: MIT-style license.

credits:
- Element positioning based on the [qooxdoo](http://qooxdoo.org/) code and smart browser fixes, [LGPL License](http://www.gnu.org/licenses/lgpl.html).
- Viewport dimensions based on [YUI](http://developer.yahoo.com/yui/) code, [BSD License](http://developer.yahoo.com/yui/license.html).

requires:
- /Element

provides: [Element.Dimensions]

...
*/

(function(){

Element.implement({

	scrollTo: function(x, y){
		if (isBody(this)){
			this.getWindow().scrollTo(x, y);
		} else {
			this.scrollLeft = x;
			this.scrollTop = y;
		}
		return this;
	},

	getSize: function(){
		if (isBody(this)) return this.getWindow().getSize();
		return {x: this.offsetWidth, y: this.offsetHeight};
	},

	getScrollSize: function(){
		if (isBody(this)) return this.getWindow().getScrollSize();
		return {x: this.scrollWidth, y: this.scrollHeight};
	},

	getScroll: function(){
		if (isBody(this)) return this.getWindow().getScroll();
		return {x: this.scrollLeft, y: this.scrollTop};
	},

	getScrolls: function(){
		var element = this, position = {x: 0, y: 0};
		while (element && !isBody(element)){
			position.x += element.scrollLeft;
			position.y += element.scrollTop;
			element = element.parentNode;
		}
		return position;
	},

	getOffsetParent: function(){
		var element = this;
		if (isBody(element)) return null;
		if (!Browser.Engine.trident) return element.offsetParent;
		while ((element = element.parentNode) && !isBody(element)){
			if (styleString(element, 'position') != 'static') return element;
		}
		return null;
	},

	getOffsets: function(){
		if (this.getBoundingClientRect){
			var bound = this.getBoundingClientRect(),
				html = document.id(this.getDocument().documentElement),
				htmlScroll = html.getScroll(),
				elemScrolls = this.getScrolls(),
				elemScroll = this.getScroll(),
				isFixed = (styleString(this, 'position') == 'fixed');

			return {
				x: bound.left.toInt() + elemScrolls.x - elemScroll.x + ((isFixed) ? 0 : htmlScroll.x) - html.clientLeft,
				y: bound.top.toInt()  + elemScrolls.y - elemScroll.y + ((isFixed) ? 0 : htmlScroll.y) - html.clientTop
			};
		}

		var element = this, position = {x: 0, y: 0};
		if (isBody(this)) return position;

		while (element && !isBody(element)){
			position.x += element.offsetLeft;
			position.y += element.offsetTop;

			if (Browser.Engine.gecko){
				if (!borderBox(element)){
					position.x += leftBorder(element);
					position.y += topBorder(element);
				}
				var parent = element.parentNode;
				if (parent && styleString(parent, 'overflow') != 'visible'){
					position.x += leftBorder(parent);
					position.y += topBorder(parent);
				}
			} else if (element != this && Browser.Engine.webkit){
				position.x += leftBorder(element);
				position.y += topBorder(element);
			}

			element = element.offsetParent;
		}
		if (Browser.Engine.gecko && !borderBox(this)){
			position.x -= leftBorder(this);
			position.y -= topBorder(this);
		}
		return position;
	},

	getPosition: function(relative){
		if (isBody(this)) return {x: 0, y: 0};
		var offset = this.getOffsets(),
				scroll = this.getScrolls();
		var position = {
			x: offset.x - scroll.x,
			y: offset.y - scroll.y
		};
		var relativePosition = (relative && (relative = document.id(relative))) ? relative.getPosition() : {x: 0, y: 0};
		return {x: position.x - relativePosition.x, y: position.y - relativePosition.y};
	},

	getCoordinates: function(element){
		if (isBody(this)) return this.getWindow().getCoordinates();
		var position = this.getPosition(element),
				size = this.getSize();
		var obj = {
			left: position.x,
			top: position.y,
			width: size.x,
			height: size.y
		};
		obj.right = obj.left + obj.width;
		obj.bottom = obj.top + obj.height;
		return obj;
	},

	computePosition: function(obj){
		return {
			left: obj.x - styleNumber(this, 'margin-left'),
			top: obj.y - styleNumber(this, 'margin-top')
		};
	},

	setPosition: function(obj){
		return this.setStyles(this.computePosition(obj));
	}

});


Native.implement([Document, Window], {

	getSize: function(){
		if (Browser.Engine.presto || Browser.Engine.webkit){
			var win = this.getWindow();
			return {x: win.innerWidth, y: win.innerHeight};
		}
		var doc = getCompatElement(this);
		return {x: doc.clientWidth, y: doc.clientHeight};
	},

	getScroll: function(){
		var win = this.getWindow(), doc = getCompatElement(this);
		return {x: win.pageXOffset || doc.scrollLeft, y: win.pageYOffset || doc.scrollTop};
	},

	getScrollSize: function(){
		var doc = getCompatElement(this), min = this.getSize();
		return {x: Math.max(doc.scrollWidth, min.x), y: Math.max(doc.scrollHeight, min.y)};
	},

	getPosition: function(){
		return {x: 0, y: 0};
	},

	getCoordinates: function(){
		var size = this.getSize();
		return {top: 0, left: 0, bottom: size.y, right: size.x, height: size.y, width: size.x};
	}

});

// private methods

var styleString = Element.getComputedStyle;

function styleNumber(element, style){
	return styleString(element, style).toInt() || 0;
};

function borderBox(element){
	return styleString(element, '-moz-box-sizing') == 'border-box';
};

function topBorder(element){
	return styleNumber(element, 'border-top-width');
};

function leftBorder(element){
	return styleNumber(element, 'border-left-width');
};

function isBody(element){
	return (/^(?:body|html)$/i).test(element.tagName);
};

function getCompatElement(element){
	var doc = element.getDocument();
	return (!doc.compatMode || doc.compatMode == 'CSS1Compat') ? doc.html : doc.body;
};

})();

//aliases
Element.alias('setPosition', 'position'); //compatability

Native.implement([Window, Document, Element], {

	getHeight: function(){
		return this.getSize().y;
	},

	getWidth: function(){
		return this.getSize().x;
	},

	getScrollTop: function(){
		return this.getScroll().y;
	},

	getScrollLeft: function(){
		return this.getScroll().x;
	},

	getScrollHeight: function(){
		return this.getScrollSize().y;
	},

	getScrollWidth: function(){
		return this.getScrollSize().x;
	},

	getTop: function(){
		return this.getPosition().y;
	},

	getLeft: function(){
		return this.getPosition().x;
	}

});


/*
---

script: Selectors.js

description: Adds advanced CSS-style querying capabilities for targeting HTML Elements. Includes pseudo selectors.

license: MIT-style license.

requires:
- /Element

provides: [Selectors]

...
*/

Native.implement([Document, Element], {

	getElements: function(expression, nocash){
		expression = expression.split(',');
		var items, local = {};
		for (var i = 0, l = expression.length; i < l; i++){
			var selector = expression[i], elements = Selectors.Utils.search(this, selector, local);
			if (i != 0 && elements.item) elements = $A(elements);
			items = (i == 0) ? elements : (items.item) ? $A(items).concat(elements) : items.concat(elements);
		}
		return new Elements(items, {ddup: (expression.length > 1), cash: !nocash});
	}

});

Element.implement({

	match: function(selector){
		if (!selector || (selector == this)) return true;
		var tagid = Selectors.Utils.parseTagAndID(selector);
		var tag = tagid[0], id = tagid[1];
		if (!Selectors.Filters.byID(this, id) || !Selectors.Filters.byTag(this, tag)) return false;
		var parsed = Selectors.Utils.parseSelector(selector);
		return (parsed) ? Selectors.Utils.filter(this, parsed, {}) : true;
	}

});

var Selectors = {Cache: {nth: {}, parsed: {}}};

Selectors.RegExps = {
	id: (/#([\w-]+)/),
	tag: (/^(\w+|\*)/),
	quick: (/^(\w+|\*)$/),
	splitter: (/\s*([+>~\s])\s*([a-zA-Z#.*:\[])/g),
	combined: (/\.([\w-]+)|\[(\w+)(?:([!*^$~|]?=)(["']?)([^\4]*?)\4)?\]|:([\w-]+)(?:\(["']?(.*?)?["']?\)|$)/g)
};

Selectors.Utils = {

	chk: function(item, uniques){
		if (!uniques) return true;
		var uid = $uid(item);
		if (!uniques[uid]) return uniques[uid] = true;
		return false;
	},

	parseNthArgument: function(argument){
		if (Selectors.Cache.nth[argument]) return Selectors.Cache.nth[argument];
		var parsed = argument.match(/^([+-]?\d*)?([a-z]+)?([+-]?\d*)?$/);
		if (!parsed) return false;
		var inta = parseInt(parsed[1], 10);
		var a = (inta || inta === 0) ? inta : 1;
		var special = parsed[2] || false;
		var b = parseInt(parsed[3], 10) || 0;
		if (a != 0){
			b--;
			while (b < 1) b += a;
			while (b >= a) b -= a;
		} else {
			a = b;
			special = 'index';
		}
		switch (special){
			case 'n': parsed = {a: a, b: b, special: 'n'}; break;
			case 'odd': parsed = {a: 2, b: 0, special: 'n'}; break;
			case 'even': parsed = {a: 2, b: 1, special: 'n'}; break;
			case 'first': parsed = {a: 0, special: 'index'}; break;
			case 'last': parsed = {special: 'last-child'}; break;
			case 'only': parsed = {special: 'only-child'}; break;
			default: parsed = {a: (a - 1), special: 'index'};
		}

		return Selectors.Cache.nth[argument] = parsed;
	},

	parseSelector: function(selector){
		if (Selectors.Cache.parsed[selector]) return Selectors.Cache.parsed[selector];
		var m, parsed = {classes: [], pseudos: [], attributes: []};
		while ((m = Selectors.RegExps.combined.exec(selector))){
			var cn = m[1], an = m[2], ao = m[3], av = m[5], pn = m[6], pa = m[7];
			if (cn){
				parsed.classes.push(cn);
			} else if (pn){
				var parser = Selectors.Pseudo.get(pn);
				if (parser) parsed.pseudos.push({parser: parser, argument: pa});
				else parsed.attributes.push({name: pn, operator: '=', value: pa});
			} else if (an){
				parsed.attributes.push({name: an, operator: ao, value: av});
			}
		}
		if (!parsed.classes.length) delete parsed.classes;
		if (!parsed.attributes.length) delete parsed.attributes;
		if (!parsed.pseudos.length) delete parsed.pseudos;
		if (!parsed.classes && !parsed.attributes && !parsed.pseudos) parsed = null;
		return Selectors.Cache.parsed[selector] = parsed;
	},

	parseTagAndID: function(selector){
		var tag = selector.match(Selectors.RegExps.tag);
		var id = selector.match(Selectors.RegExps.id);
		return [(tag) ? tag[1] : '*', (id) ? id[1] : false];
	},

	filter: function(item, parsed, local){
		var i;
		if (parsed.classes){
			for (i = parsed.classes.length; i--; i){
				var cn = parsed.classes[i];
				if (!Selectors.Filters.byClass(item, cn)) return false;
			}
		}
		if (parsed.attributes){
			for (i = parsed.attributes.length; i--; i){
				var att = parsed.attributes[i];
				if (!Selectors.Filters.byAttribute(item, att.name, att.operator, att.value)) return false;
			}
		}
		if (parsed.pseudos){
			for (i = parsed.pseudos.length; i--; i){
				var psd = parsed.pseudos[i];
				if (!Selectors.Filters.byPseudo(item, psd.parser, psd.argument, local)) return false;
			}
		}
		return true;
	},

	getByTagAndID: function(ctx, tag, id){
		if (id){
			var item = (ctx.getElementById) ? ctx.getElementById(id, true) : Element.getElementById(ctx, id, true);
			return (item && Selectors.Filters.byTag(item, tag)) ? [item] : [];
		} else {
			return ctx.getElementsByTagName(tag);
		}
	},

	search: function(self, expression, local){
		var splitters = [];

		var selectors = expression.trim().replace(Selectors.RegExps.splitter, function(m0, m1, m2){
			splitters.push(m1);
			return ':)' + m2;
		}).split(':)');

		var items, filtered, item;

		for (var i = 0, l = selectors.length; i < l; i++){

			var selector = selectors[i];

			if (i == 0 && Selectors.RegExps.quick.test(selector)){
				items = self.getElementsByTagName(selector);
				continue;
			}

			var splitter = splitters[i - 1];

			var tagid = Selectors.Utils.parseTagAndID(selector);
			var tag = tagid[0], id = tagid[1];

			if (i == 0){
				items = Selectors.Utils.getByTagAndID(self, tag, id);
			} else {
				var uniques = {}, found = [];
				for (var j = 0, k = items.length; j < k; j++) found = Selectors.Getters[splitter](found, items[j], tag, id, uniques);
				items = found;
			}

			var parsed = Selectors.Utils.parseSelector(selector);

			if (parsed){
				filtered = [];
				for (var m = 0, n = items.length; m < n; m++){
					item = items[m];
					if (Selectors.Utils.filter(item, parsed, local)) filtered.push(item);
				}
				items = filtered;
			}

		}

		return items;

	}

};

Selectors.Getters = {

	' ': function(found, self, tag, id, uniques){
		var items = Selectors.Utils.getByTagAndID(self, tag, id);
		for (var i = 0, l = items.length; i < l; i++){
			var item = items[i];
			if (Selectors.Utils.chk(item, uniques)) found.push(item);
		}
		return found;
	},

	'>': function(found, self, tag, id, uniques){
		var children = Selectors.Utils.getByTagAndID(self, tag, id);
		for (var i = 0, l = children.length; i < l; i++){
			var child = children[i];
			if (child.parentNode == self && Selectors.Utils.chk(child, uniques)) found.push(child);
		}
		return found;
	},

	'+': function(found, self, tag, id, uniques){
		while ((self = self.nextSibling)){
			if (self.nodeType == 1){
				if (Selectors.Utils.chk(self, uniques) && Selectors.Filters.byTag(self, tag) && Selectors.Filters.byID(self, id)) found.push(self);
				break;
			}
		}
		return found;
	},

	'~': function(found, self, tag, id, uniques){
		while ((self = self.nextSibling)){
			if (self.nodeType == 1){
				if (!Selectors.Utils.chk(self, uniques)) break;
				if (Selectors.Filters.byTag(self, tag) && Selectors.Filters.byID(self, id)) found.push(self);
			}
		}
		return found;
	}

};

Selectors.Filters = {

	byTag: function(self, tag){
		return (tag == '*' || (self.tagName && self.tagName.toLowerCase() == tag));
	},

	byID: function(self, id){
		return (!id || (self.id && self.id == id));
	},

	byClass: function(self, klass){
		return (self.className && self.className.contains && self.className.contains(klass, ' '));
	},

	byPseudo: function(self, parser, argument, local){
		return parser.call(self, argument, local);
	},

	byAttribute: function(self, name, operator, value){
		var result = Element.prototype.getProperty.call(self, name);
		if (!result) return (operator == '!=');
		if (!operator || value == undefined) return true;
		switch (operator){
			case '=': return (result == value);
			case '*=': return (result.contains(value));
			case '^=': return (result.substr(0, value.length) == value);
			case '$=': return (result.substr(result.length - value.length) == value);
			case '!=': return (result != value);
			case '~=': return result.contains(value, ' ');
			case '|=': return result.contains(value, '-');
		}
		return false;
	}

};

Selectors.Pseudo = new Hash({

	// w3c pseudo selectors

	checked: function(){
		return this.checked;
	},
	
	empty: function(){
		return !(this.innerText || this.textContent || '').length;
	},

	not: function(selector){
		return !Element.match(this, selector);
	},

	contains: function(text){
		return (this.innerText || this.textContent || '').contains(text);
	},

	'first-child': function(){
		return Selectors.Pseudo.index.call(this, 0);
	},

	'last-child': function(){
		var element = this;
		while ((element = element.nextSibling)){
			if (element.nodeType == 1) return false;
		}
		return true;
	},

	'only-child': function(){
		var prev = this;
		while ((prev = prev.previousSibling)){
			if (prev.nodeType == 1) return false;
		}
		var next = this;
		while ((next = next.nextSibling)){
			if (next.nodeType == 1) return false;
		}
		return true;
	},

	'nth-child': function(argument, local){
		argument = (argument == undefined) ? 'n' : argument;
		var parsed = Selectors.Utils.parseNthArgument(argument);
		if (parsed.special != 'n') return Selectors.Pseudo[parsed.special].call(this, parsed.a, local);
		var count = 0;
		local.positions = local.positions || {};
		var uid = $uid(this);
		if (!local.positions[uid]){
			var self = this;
			while ((self = self.previousSibling)){
				if (self.nodeType != 1) continue;
				count ++;
				var position = local.positions[$uid(self)];
				if (position != undefined){
					count = position + count;
					break;
				}
			}
			local.positions[uid] = count;
		}
		return (local.positions[uid] % parsed.a == parsed.b);
	},

	// custom pseudo selectors

	index: function(index){
		var element = this, count = 0;
		while ((element = element.previousSibling)){
			if (element.nodeType == 1 && ++count > index) return false;
		}
		return (count == index);
	},

	even: function(argument, local){
		return Selectors.Pseudo['nth-child'].call(this, '2n+1', local);
	},

	odd: function(argument, local){
		return Selectors.Pseudo['nth-child'].call(this, '2n', local);
	},
	
	selected: function(){
		return this.selected;
	},
	
	enabled: function(){
		return (this.disabled === false);
	}

});


/*
---

script: DomReady.js

description: Contains the custom event domready.

license: MIT-style license.

requires:
- /Element.Event

provides: [DomReady]

...
*/

Element.Events.domready = {

	onAdd: function(fn){
		if (Browser.loaded) fn.call(this);
	}

};

(function(){

	var domready = function(){
		if (Browser.loaded) return;
		Browser.loaded = true;
		window.fireEvent('domready');
		document.fireEvent('domready');
	};
	
	window.addEvent('load', domready);

	if (Browser.Engine.trident){
		var temp = document.createElement('div');
		(function(){
			($try(function(){
				temp.doScroll(); // Technique by Diego Perini
				return document.id(temp).inject(document.body).set('html', 'temp').dispose();
			})) ? domready() : arguments.callee.delay(50);
		})();
	} else if (Browser.Engine.webkit && Browser.Engine.version < 525){
		(function(){
			(['loaded', 'complete'].contains(document.readyState)) ? domready() : arguments.callee.delay(50);
		})();
	} else {
		document.addEvent('DOMContentLoaded', domready);
	}

})();


/*
---

script: JSON.js

description: JSON encoder and decoder.

license: MIT-style license.

See Also: <http://www.json.org/>

requires:
- /Array
- /String
- /Number
- /Function
- /Hash

provides: [JSON]

...
*/

var JSON = new Hash(this.JSON && {
	stringify: JSON.stringify,
	parse: JSON.parse
}).extend({
	
	$specialChars: {'\b': '\\b', '\t': '\\t', '\n': '\\n', '\f': '\\f', '\r': '\\r', '"' : '\\"', '\\': '\\\\'},

	$replaceChars: function(chr){
		return JSON.$specialChars[chr] || '\\u00' + Math.floor(chr.charCodeAt() / 16).toString(16) + (chr.charCodeAt() % 16).toString(16);
	},

	encode: function(obj){
		switch ($type(obj)){
			case 'string':
				return '"' + obj.replace(/[\x00-\x1f\\"]/g, JSON.$replaceChars) + '"';
			case 'array':
				return '[' + String(obj.map(JSON.encode).clean()) + ']';
			case 'object': case 'hash':
				var string = [];
				Hash.each(obj, function(value, key){
					var json = JSON.encode(value);
					if (json) string.push(JSON.encode(key) + ':' + json);
				});
				return '{' + string + '}';
			case 'number': case 'boolean': return String(obj);
			case false: 
				if(isNaN(obj) || Math.abs(obj)==Infinity)
					return String(obj);
				return 'null';
		}
		return null;
	},

	decode: function(string, secure){
		if ($type(string) != 'string' || !string.length) return null;
		if (secure && !(/^[,:{}\[\]0-9.\-+Eaeflnr-u \n\r\t]*$/).test(string.replace(/\\./g, '@').replace(/"[^"\\\n\r]*"/g, ''))) return null;
		return eval('(' + string + ')');
	}

});

Native.implement([Hash, Array, String, Number], {

	toJSON: function(){
		return JSON.encode(this);
	}

});


/*
---

script: Cookie.js

description: Class for creating, reading, and deleting browser Cookies.

license: MIT-style license.

credits:
- Based on the functions by Peter-Paul Koch (http://quirksmode.org).

requires:
- /Options

provides: [Cookie]

...
*/

var Cookie = new Class({

	Implements: Options,

	options: {
		path: false,
		domain: false,
		duration: false,
		secure: false,
		document: document
	},

	initialize: function(key, options){
		this.key = key;
		this.setOptions(options);
	},

	write: function(value){
		value = encodeURIComponent(value);
		if (this.options.domain) value += '; domain=' + this.options.domain;
		if (this.options.path) value += '; path=' + this.options.path;
		if (this.options.duration){
			var date = new Date();
			date.setTime(date.getTime() + this.options.duration * 24 * 60 * 60 * 1000);
			value += '; expires=' + date.toGMTString();
		}
		if (this.options.secure) value += '; secure';
		this.options.document.cookie = this.key + '=' + value;
		return this;
	},

	read: function(){
		var value = this.options.document.cookie.match('(?:^|;)\\s*' + this.key.escapeRegExp() + '=([^;]*)');
		return (value) ? decodeURIComponent(value[1]) : null;
	},

	dispose: function(){
		new Cookie(this.key, $merge(this.options, {duration: -1})).write('');
		return this;
	}

});

Cookie.write = function(key, value, options){
	return new Cookie(key, options).write(value);
};

Cookie.read = function(key){
	return new Cookie(key).read();
};

Cookie.dispose = function(key, options){
	return new Cookie(key, options).dispose();
};


/*
---

script: Swiff.js

description: Wrapper for embedding SWF movies. Supports External Interface Communication.

license: MIT-style license.

credits: 
- Flash detection & Internet Explorer + Flash Player 9 fix inspired by SWFObject.

requires:
- /Options
- /$util

provides: [Swiff]

...
*/

var Swiff = new Class({

	Implements: [Options],

	options: {
		id: null,
		height: 1,
		width: 1,
		container: null,
		properties: {},
		params: {
			quality: 'high',
			allowScriptAccess: 'always',
			wMode: 'transparent',
			swLiveConnect: true
		},
		callBacks: {},
		vars: {}
	},

	toElement: function(){
		return this.object;
	},

	initialize: function(path, options){
		this.instance = 'Swiff_' + $time();

		this.setOptions(options);
		options = this.options;
		var id = this.id = options.id || this.instance;
		var container = document.id(options.container);

		Swiff.CallBacks[this.instance] = {};

		var params = options.params, vars = options.vars, callBacks = options.callBacks;
		var properties = $extend({height: options.height, width: options.width}, options.properties);

		var self = this;

		for (var callBack in callBacks){
			Swiff.CallBacks[this.instance][callBack] = (function(option){
				return function(){
					return option.apply(self.object, arguments);
				};
			})(callBacks[callBack]);
			vars[callBack] = 'Swiff.CallBacks.' + this.instance + '.' + callBack;
		}

		params.flashVars = Hash.toQueryString(vars);
		if (Browser.Engine.trident){
			properties.classid = 'clsid:D27CDB6E-AE6D-11cf-96B8-444553540000';
			params.movie = path;
		} else {
			properties.type = 'application/x-shockwave-flash';
			properties.data = path;
		}
		var build = '<object id="' + id + '"';
		for (var property in properties) build += ' ' + property + '="' + properties[property] + '"';
		build += '>';
		for (var param in params){
			if (params[param]) build += '<param name="' + param + '" value="' + params[param] + '" />';
		}
		build += '</object>';
		this.object = ((container) ? container.empty() : new Element('div')).set('html', build).firstChild;
	},

	replaces: function(element){
		element = document.id(element, true);
		element.parentNode.replaceChild(this.toElement(), element);
		return this;
	},

	inject: function(element){
		document.id(element, true).appendChild(this.toElement());
		return this;
	},

	remote: function(){
		return Swiff.remote.apply(Swiff, [this.toElement()].extend(arguments));
	}

});

Swiff.CallBacks = {};

Swiff.remote = function(obj, fn){
	var rs = obj.CallFunction('<invoke name="' + fn + '" returntype="javascript">' + __flash__argumentsToXML(arguments, 2) + '</invoke>');
	return eval(rs);
};


/*
---

script: Fx.js

description: Contains the basic animation logic to be extended by all other Fx Classes.

license: MIT-style license.

requires:
- /Chain
- /Events
- /Options

provides: [Fx]

...
*/

var Fx = new Class({

	Implements: [Chain, Events, Options],

	options: {
		/*
		onStart: $empty,
		onCancel: $empty,
		onComplete: $empty,
		*/
		fps: 50,
		unit: false,
		duration: 500,
		link: 'ignore'
	},

	initialize: function(options){
		this.subject = this.subject || this;
		this.setOptions(options);
		this.options.duration = Fx.Durations[this.options.duration] || this.options.duration.toInt();
		var wait = this.options.wait;
		if (wait === false) this.options.link = 'cancel';
	},

	getTransition: function(){
		return function(p){
			return -(Math.cos(Math.PI * p) - 1) / 2;
		};
	},

	step: function(){
		var time = $time();
		if (time < this.time + this.options.duration){
			var delta = this.transition((time - this.time) / this.options.duration);
			this.set(this.compute(this.from, this.to, delta));
		} else {
			this.set(this.compute(this.from, this.to, 1));
			this.complete();
		}
	},

	set: function(now){
		return now;
	},

	compute: function(from, to, delta){
		return Fx.compute(from, to, delta);
	},

	check: function(){
		if (!this.timer) return true;
		switch (this.options.link){
			case 'cancel': this.cancel(); return true;
			case 'chain': this.chain(this.caller.bind(this, arguments)); return false;
		}
		return false;
	},

	start: function(from, to){
		if (!this.check(from, to)) return this;
		this.from = from;
		this.to = to;
		this.time = 0;
		this.transition = this.getTransition();
		this.startTimer();
		this.onStart();
		return this;
	},

	complete: function(){
		if (this.stopTimer()) this.onComplete();
		return this;
	},

	cancel: function(){
		if (this.stopTimer()) this.onCancel();
		return this;
	},

	onStart: function(){
		this.fireEvent('start', this.subject);
	},

	onComplete: function(){
		this.fireEvent('complete', this.subject);
		if (!this.callChain()) this.fireEvent('chainComplete', this.subject);
	},

	onCancel: function(){
		this.fireEvent('cancel', this.subject).clearChain();
	},

	pause: function(){
		this.stopTimer();
		return this;
	},

	resume: function(){
		this.startTimer();
		return this;
	},

	stopTimer: function(){
		if (!this.timer) return false;
		this.time = $time() - this.time;
		this.timer = $clear(this.timer);
		return true;
	},

	startTimer: function(){
		if (this.timer) return false;
		this.time = $time() - this.time;
		this.timer = this.step.periodical(Math.round(1000 / this.options.fps), this);
		return true;
	}

});

Fx.compute = function(from, to, delta){
	return (to - from) * delta + from;
};

Fx.Durations = {'short': 250, 'normal': 500, 'long': 1000};


/*
---

script: Fx.CSS.js

description: Contains the CSS animation logic. Used by Fx.Tween, Fx.Morph, Fx.Elements.

license: MIT-style license.

requires:
- /Fx
- /Element.Style

provides: [Fx.CSS]

...
*/

Fx.CSS = new Class({

	Extends: Fx,

	//prepares the base from/to object

	prepare: function(element, property, values){
		values = $splat(values);
		var values1 = values[1];
		if (!$chk(values1)){
			values[1] = values[0];
			values[0] = element.getStyle(property);
		}
		var parsed = values.map(this.parse);
		return {from: parsed[0], to: parsed[1]};
	},

	//parses a value into an array

	parse: function(value){
		value = $lambda(value)();
		value = (typeof value == 'string') ? value.split(' ') : $splat(value);
		return value.map(function(val){
			val = String(val);
			var found = false;
			Fx.CSS.Parsers.each(function(parser, key){
				if (found) return;
				var parsed = parser.parse(val);
				if ($chk(parsed)) found = {value: parsed, parser: parser};
			});
			found = found || {value: val, parser: Fx.CSS.Parsers.String};
			return found;
		});
	},

	//computes by a from and to prepared objects, using their parsers.

	compute: function(from, to, delta){
		var computed = [];
		(Math.min(from.length, to.length)).times(function(i){
			computed.push({value: from[i].parser.compute(from[i].value, to[i].value, delta), parser: from[i].parser});
		});
		computed.$family = {name: 'fx:css:value'};
		return computed;
	},

	//serves the value as settable

	serve: function(value, unit){
		if ($type(value) != 'fx:css:value') value = this.parse(value);
		var returned = [];
		value.each(function(bit){
			returned = returned.concat(bit.parser.serve(bit.value, unit));
		});
		return returned;
	},

	//renders the change to an element

	render: function(element, property, value, unit){
		element.setStyle(property, this.serve(value, unit));
	},

	//searches inside the page css to find the values for a selector

	search: function(selector){
		if (Fx.CSS.Cache[selector]) return Fx.CSS.Cache[selector];
		var to = {};
		Array.each(document.styleSheets, function(sheet, j){
			var href = sheet.href;
			if (href && href.contains('://') && !href.contains(document.domain)) return;
			var rules = sheet.rules || sheet.cssRules;
			Array.each(rules, function(rule, i){
				if (!rule.style) return;
				var selectorText = (rule.selectorText) ? rule.selectorText.replace(/^\w+/, function(m){
					return m.toLowerCase();
				}) : null;
				if (!selectorText || !selectorText.test('^' + selector + '$')) return;
				Element.Styles.each(function(value, style){
					if (!rule.style[style] || Element.ShortStyles[style]) return;
					value = String(rule.style[style]);
					to[style] = (value.test(/^rgb/)) ? value.rgbToHex() : value;
				});
			});
		});
		return Fx.CSS.Cache[selector] = to;
	}

});

Fx.CSS.Cache = {};

Fx.CSS.Parsers = new Hash({

	Color: {
		parse: function(value){
			if (value.match(/^#[0-9a-f]{3,6}$/i)) return value.hexToRgb(true);
			return ((value = value.match(/(\d+),\s*(\d+),\s*(\d+)/))) ? [value[1], value[2], value[3]] : false;
		},
		compute: function(from, to, delta){
			return from.map(function(value, i){
				return Math.round(Fx.compute(from[i], to[i], delta));
			});
		},
		serve: function(value){
			return value.map(Number);
		}
	},

	Number: {
		parse: parseFloat,
		compute: Fx.compute,
		serve: function(value, unit){
			return (unit) ? value + unit : value;
		}
	},

	String: {
		parse: $lambda(false),
		compute: $arguments(1),
		serve: $arguments(0)
	}

});


/*
---

script: Fx.Tween.js

description: Formerly Fx.Style, effect to transition any CSS property for an element.

license: MIT-style license.

requires: 
- /Fx.CSS

provides: [Fx.Tween, Element.fade, Element.highlight]

...
*/

Fx.Tween = new Class({

	Extends: Fx.CSS,

	initialize: function(element, options){
		this.element = this.subject = document.id(element);
		this.parent(options);
	},

	set: function(property, now){
		if (arguments.length == 1){
			now = property;
			property = this.property || this.options.property;
		}
		this.render(this.element, property, now, this.options.unit);
		return this;
	},

	start: function(property, from, to){
		if (!this.check(property, from, to)) return this;
		var args = Array.flatten(arguments);
		this.property = this.options.property || args.shift();
		var parsed = this.prepare(this.element, this.property, args);
		return this.parent(parsed.from, parsed.to);
	}

});

Element.Properties.tween = {

	set: function(options){
		var tween = this.retrieve('tween');
		if (tween) tween.cancel();
		return this.eliminate('tween').store('tween:options', $extend({link: 'cancel'}, options));
	},

	get: function(options){
		if (options || !this.retrieve('tween')){
			if (options || !this.retrieve('tween:options')) this.set('tween', options);
			this.store('tween', new Fx.Tween(this, this.retrieve('tween:options')));
		}
		return this.retrieve('tween');
	}

};

Element.implement({

	tween: function(property, from, to){
		this.get('tween').start(arguments);
		return this;
	},

	fade: function(how){
		var fade = this.get('tween'), o = 'opacity', toggle;
		how = $pick(how, 'toggle');
		switch (how){
			case 'in': fade.start(o, 1); break;
			case 'out': fade.start(o, 0); break;
			case 'show': fade.set(o, 1); break;
			case 'hide': fade.set(o, 0); break;
			case 'toggle':
				var flag = this.retrieve('fade:flag', this.get('opacity') == 1);
				fade.start(o, (flag) ? 0 : 1);
				this.store('fade:flag', !flag);
				toggle = true;
			break;
			default: fade.start(o, arguments);
		}
		if (!toggle) this.eliminate('fade:flag');
		return this;
	},

	highlight: function(start, end){
		if (!end){
			end = this.retrieve('highlight:original', this.getStyle('background-color'));
			end = (end == 'transparent') ? '#fff' : end;
		}
		var tween = this.get('tween');
		tween.start('background-color', start || '#ffff88', end).chain(function(){
			this.setStyle('background-color', this.retrieve('highlight:original'));
			tween.callChain();
		}.bind(this));
		return this;
	}

});


/*
---

script: Fx.Morph.js

description: Formerly Fx.Styles, effect to transition any number of CSS properties for an element using an object of rules, or CSS based selector rules.

license: MIT-style license.

requires:
- /Fx.CSS

provides: [Fx.Morph]

...
*/

Fx.Morph = new Class({

	Extends: Fx.CSS,

	initialize: function(element, options){
		this.element = this.subject = document.id(element);
		this.parent(options);
	},

	set: function(now){
		if (typeof now == 'string') now = this.search(now);
		for (var p in now) this.render(this.element, p, now[p], this.options.unit);
		return this;
	},

	compute: function(from, to, delta){
		var now = {};
		for (var p in from) now[p] = this.parent(from[p], to[p], delta);
		return now;
	},

	start: function(properties){
		if (!this.check(properties)) return this;
		if (typeof properties == 'string') properties = this.search(properties);
		var from = {}, to = {};
		for (var p in properties){
			var parsed = this.prepare(this.element, p, properties[p]);
			from[p] = parsed.from;
			to[p] = parsed.to;
		}
		return this.parent(from, to);
	}

});

Element.Properties.morph = {

	set: function(options){
		var morph = this.retrieve('morph');
		if (morph) morph.cancel();
		return this.eliminate('morph').store('morph:options', $extend({link: 'cancel'}, options));
	},

	get: function(options){
		if (options || !this.retrieve('morph')){
			if (options || !this.retrieve('morph:options')) this.set('morph', options);
			this.store('morph', new Fx.Morph(this, this.retrieve('morph:options')));
		}
		return this.retrieve('morph');
	}

};

Element.implement({

	morph: function(props){
		this.get('morph').start(props);
		return this;
	}

});


/*
---

script: Fx.Transitions.js

description: Contains a set of advanced transitions to be used with any of the Fx Classes.

license: MIT-style license.

credits:
- Easing Equations by Robert Penner, <http://www.robertpenner.com/easing/>, modified and optimized to be used with MooTools.

requires:
- /Fx

provides: [Fx.Transitions]

...
*/

Fx.implement({

	getTransition: function(){
		var trans = this.options.transition || Fx.Transitions.Sine.easeInOut;
		if (typeof trans == 'string'){
			var data = trans.split(':');
			trans = Fx.Transitions;
			trans = trans[data[0]] || trans[data[0].capitalize()];
			if (data[1]) trans = trans['ease' + data[1].capitalize() + (data[2] ? data[2].capitalize() : '')];
		}
		return trans;
	}

});

Fx.Transition = function(transition, params){
	params = $splat(params);
	return $extend(transition, {
		easeIn: function(pos){
			return transition(pos, params);
		},
		easeOut: function(pos){
			return 1 - transition(1 - pos, params);
		},
		easeInOut: function(pos){
			return (pos <= 0.5) ? transition(2 * pos, params) / 2 : (2 - transition(2 * (1 - pos), params)) / 2;
		}
	});
};

Fx.Transitions = new Hash({

	linear: $arguments(0)

});

Fx.Transitions.extend = function(transitions){
	for (var transition in transitions) Fx.Transitions[transition] = new Fx.Transition(transitions[transition]);
};

Fx.Transitions.extend({

	Pow: function(p, x){
		return Math.pow(p, x[0] || 6);
	},

	Expo: function(p){
		return Math.pow(2, 8 * (p - 1));
	},

	Circ: function(p){
		return 1 - Math.sin(Math.acos(p));
	},

	Sine: function(p){
		return 1 - Math.sin((1 - p) * Math.PI / 2);
	},

	Back: function(p, x){
		x = x[0] || 1.618;
		return Math.pow(p, 2) * ((x + 1) * p - x);
	},

	Bounce: function(p){
		var value;
		for (var a = 0, b = 1; 1; a += b, b /= 2){
			if (p >= (7 - 4 * a) / 11){
				value = b * b - Math.pow((11 - 6 * a - 11 * p) / 4, 2);
				break;
			}
		}
		return value;
	},

	Elastic: function(p, x){
		return Math.pow(2, 10 * --p) * Math.cos(20 * p * Math.PI * (x[0] || 1) / 3);
	}

});

['Quad', 'Cubic', 'Quart', 'Quint'].each(function(transition, i){
	Fx.Transitions[transition] = new Fx.Transition(function(p){
		return Math.pow(p, [i + 2]);
	});
});


/*
---

script: Request.js

description: Powerful all purpose Request Class. Uses XMLHTTPRequest.

license: MIT-style license.

requires:
- /Element
- /Chain
- /Events
- /Options
- /Browser

provides: [Request]

...
*/

var Request = new Class({

	Implements: [Chain, Events, Options],

	options: {/*
		onRequest: $empty,
		onComplete: $empty,
		onCancel: $empty,
		onSuccess: $empty,
		onFailure: $empty,
		onException: $empty,*/
		url: '',
		data: '',
		headers: {
			'X-Requested-With': 'XMLHttpRequest',
			'Accept': 'text/javascript, text/html, application/xml, text/xml, */*'
		},
		async: true,
		format: false,
		method: 'post',
		link: 'ignore',
		isSuccess: null,
		emulation: true,
		urlEncoded: true,
		encoding: 'utf-8',
		evalScripts: false,
		evalResponse: false,
		noCache: false
	},

	initialize: function(options){
		this.xhr = new Browser.Request();
		this.setOptions(options);
		this.options.isSuccess = this.options.isSuccess || this.isSuccess;
		this.headers = new Hash(this.options.headers);
	},

	onStateChange: function(){
		if (this.xhr.readyState != 4 || !this.running) return;
		this.running = false;
		this.status = 0;
		$try(function(){
			this.status = this.xhr.status;
		}.bind(this));
		this.xhr.onreadystatechange = $empty;
		if (this.options.isSuccess.call(this, this.status)){
			this.response = {text: this.xhr.responseText, xml: this.xhr.responseXML};
			this.success(this.response.text, this.response.xml);
		} else {
			this.response = {text: null, xml: null};
			this.failure();
		}
	},

	isSuccess: function(){
		return ((this.status >= 200) && (this.status < 300));
	},

	processScripts: function(text){
		if (this.options.evalResponse || (/(ecma|java)script/).test(this.getHeader('Content-type'))) return $exec(text);
		return text.stripScripts(this.options.evalScripts);
	},

	success: function(text, xml){
		this.onSuccess(this.processScripts(text), xml);
	},

	onSuccess: function(){
		this.fireEvent('complete', arguments).fireEvent('success', arguments).callChain();
	},

	failure: function(){
		this.onFailure();
	},

	onFailure: function(){
		this.fireEvent('complete').fireEvent('failure', this.xhr);
	},

	setHeader: function(name, value){
		this.headers.set(name, value);
		return this;
	},

	getHeader: function(name){
		return $try(function(){
			return this.xhr.getResponseHeader(name);
		}.bind(this));
	},

	check: function(){
		if (!this.running) return true;
		switch (this.options.link){
			case 'cancel': this.cancel(); return true;
			case 'chain': this.chain(this.caller.bind(this, arguments)); return false;
		}
		return false;
	},

	send: function(options){
		if (!this.check(options)) return this;
		this.running = true;

		var type = $type(options);
		if (type == 'string' || type == 'element') options = {data: options};

		var old = this.options;
		options = $extend({data: old.data, url: old.url, method: old.method}, options);
		var data = options.data, url = String(options.url), method = options.method.toLowerCase();

		switch ($type(data)){
			case 'element': data = document.id(data).toQueryString(); break;
			case 'object': case 'hash': data = Hash.toQueryString(data);
		}

		if (this.options.format){
			var format = 'format=' + this.options.format;
			data = (data) ? format + '&' + data : format;
		}

		if (this.options.emulation && !['get', 'post'].contains(method)){
			var _method = '_method=' + method;
			data = (data) ? _method + '&' + data : _method;
			method = 'post';
		}

		if (this.options.urlEncoded && method == 'post'){
			var encoding = (this.options.encoding) ? '; charset=' + this.options.encoding : '';
			this.headers.set('Content-type', 'application/x-www-form-urlencoded' + encoding);
		}

		if (this.options.noCache){
			var noCache = 'noCache=' + new Date().getTime();
			data = (data) ? noCache + '&' + data : noCache;
		}

		var trimPosition = url.lastIndexOf('/');
		if (trimPosition > -1 && (trimPosition = url.indexOf('#')) > -1) url = url.substr(0, trimPosition);

		if (data && method == 'get'){
			url = url + (url.contains('?') ? '&' : '?') + data;
			data = null;
		}

		this.xhr.open(method.toUpperCase(), url, this.options.async);

		this.xhr.onreadystatechange = this.onStateChange.bind(this);

		this.headers.each(function(value, key){
			try {
				this.xhr.setRequestHeader(key, value);
			} catch (e){
				this.fireEvent('exception', [key, value]);
			}
		}, this);

		this.fireEvent('request');
		this.xhr.send(data);
		if (!this.options.async) this.onStateChange();
		return this;
	},

	cancel: function(){
		if (!this.running) return this;
		this.running = false;
		this.xhr.abort();
		this.xhr.onreadystatechange = $empty;
		this.xhr = new Browser.Request();
		this.fireEvent('cancel');
		return this;
	}

});

(function(){

var methods = {};
['get', 'post', 'put', 'delete', 'GET', 'POST', 'PUT', 'DELETE'].each(function(method){
	methods[method] = function(){
		var params = Array.link(arguments, {url: String.type, data: $defined});
		return this.send($extend(params, {method: method}));
	};
});

Request.implement(methods);

})();

Element.Properties.send = {

	set: function(options){
		var send = this.retrieve('send');
		if (send) send.cancel();
		return this.eliminate('send').store('send:options', $extend({
			data: this, link: 'cancel', method: this.get('method') || 'post', url: this.get('action')
		}, options));
	},

	get: function(options){
		if (options || !this.retrieve('send')){
			if (options || !this.retrieve('send:options')) this.set('send', options);
			this.store('send', new Request(this.retrieve('send:options')));
		}
		return this.retrieve('send');
	}

};

Element.implement({

	send: function(url){
		var sender = this.get('send');
		sender.send({data: this, url: url || sender.options.url});
		return this;
	}

});


/*
---

script: Request.HTML.js

description: Extends the basic Request Class with additional methods for interacting with HTML responses.

license: MIT-style license.

requires:
- /Request
- /Element

provides: [Request.HTML]

...
*/

Request.HTML = new Class({

	Extends: Request,

	options: {
		update: false,
		append: false,
		evalScripts: true,
		filter: false
	},

	processHTML: function(text){
		var match = text.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
		text = (match) ? match[1] : text;

		var container = new Element('div');

		return $try(function(){
			var root = '<root>' + text + '</root>', doc;
			if (Browser.Engine.trident){
				doc = new ActiveXObject('Microsoft.XMLDOM');
				doc.async = false;
				doc.loadXML(root);
			} else {
				doc = new DOMParser().parseFromString(root, 'text/xml');
			}
			root = doc.getElementsByTagName('root')[0];
			if (!root) return null;
			for (var i = 0, k = root.childNodes.length; i < k; i++){
				var child = Element.clone(root.childNodes[i], true, true);
				if (child) container.grab(child);
			}
			return container;
		}) || container.set('html', text);
	},

	success: function(text){
		var options = this.options, response = this.response;

		response.html = text.stripScripts(function(script){
			response.javascript = script;
		});

		var temp = this.processHTML(response.html);

		response.tree = temp.childNodes;
		response.elements = temp.getElements('*');

		if (options.filter) response.tree = response.elements.filter(options.filter);
		if (options.update) document.id(options.update).empty().set('html', response.html);
		else if (options.append) document.id(options.append).adopt(temp.getChildren());
		if (options.evalScripts) $exec(response.javascript);

		this.onSuccess(response.tree, response.elements, response.html, response.javascript);
	}

});

Element.Properties.load = {

	set: function(options){
		var load = this.retrieve('load');
		if (load) load.cancel();
		return this.eliminate('load').store('load:options', $extend({data: this, link: 'cancel', update: this, method: 'get'}, options));
	},

	get: function(options){
		if (options || ! this.retrieve('load')){
			if (options || !this.retrieve('load:options')) this.set('load', options);
			this.store('load', new Request.HTML(this.retrieve('load:options')));
		}
		return this.retrieve('load');
	}

};

Element.implement({

	load: function(){
		this.get('load').send(Array.link(arguments, {data: Object.type, url: String.type}));
		return this;
	}

});


/*
---

script: Request.JSON.js

description: Extends the basic Request Class with additional methods for sending and receiving JSON data.

license: MIT-style license.

requires:
- /Request JSON

provides: [Request.HTML]

...
*/

Request.JSON = new Class({

	Extends: Request,

	options: {
		secure: true
	},

	initialize: function(options){
		this.parent(options);
		this.headers.extend({'Accept': 'application/json', 'X-Request': 'JSON'});
	},

	success: function(text){
		this.response.json = JSON.decode(text, this.options.secure);
		this.onSuccess(this.response.json, text);
	}

});
//MooTools More, <http://mootools.net/more>. Copyright (c) 2006-2009 Aaron Newton <http://clientcide.com/>, Valerio Proietti <http://mad4milk.net> & the MooTools team <http://mootools.net/developers>, MIT Style License.

/*
---

script: More.js

description: MooTools More

license: MIT-style license

authors:
- Guillermo Rauch
- Thomas Aylott
- Scott Kyle

requires:
- core:1.2.4/MooTools

provides: [MooTools.More]

...
*/

MooTools.More = {
	'version': '1.2.4.4',
	'build': '6f6057dc645fdb7547689183b2311063bd653ddf'
};

/*
---

script: MooTools.Lang.js

description: Provides methods for localization.

license: MIT-style license

authors:
- Aaron Newton

requires:
- core:1.2.4/Events
- /MooTools.More

provides: [MooTools.Lang]

...
*/

(function(){

	var data = {
		language: 'en-US',
		languages: {
			'en-US': {}
		},
		cascades: ['en-US']
	};
	
	var cascaded;

	MooTools.lang = new Events();

	$extend(MooTools.lang, {

		setLanguage: function(lang){
			if (!data.languages[lang]) return this;
			data.language = lang;
			this.load();
			this.fireEvent('langChange', lang);
			return this;
		},

		load: function() {
			var langs = this.cascade(this.getCurrentLanguage());
			cascaded = {};
			$each(langs, function(set, setName){
				cascaded[setName] = this.lambda(set);
			}, this);
		},

		getCurrentLanguage: function(){
			return data.language;
		},

		addLanguage: function(lang){
			data.languages[lang] = data.languages[lang] || {};
			return this;
		},

		cascade: function(lang){
			var cascades = (data.languages[lang] || {}).cascades || [];
			cascades.combine(data.cascades);
			cascades.erase(lang).push(lang);
			var langs = cascades.map(function(lng){
				return data.languages[lng];
			}, this);
			return $merge.apply(this, langs);
		},

		lambda: function(set) {
			(set || {}).get = function(key, args){
				return $lambda(set[key]).apply(this, $splat(args));
			};
			return set;
		},

		get: function(set, key, args){
			if (cascaded && cascaded[set]) return (key ? cascaded[set].get(key, args) : cascaded[set]);
		},

		set: function(lang, set, members){
			this.addLanguage(lang);
			langData = data.languages[lang];
			if (!langData[set]) langData[set] = {};
			$extend(langData[set], members);
			if (lang == this.getCurrentLanguage()){
				this.load();
				this.fireEvent('langChange', lang);
			}
			return this;
		},

		list: function(){
			return Hash.getKeys(data.languages);
		}

	});

})();

/*
---

script: Log.js

description: Provides basic logging functionality for plugins to implement.

license: MIT-style license

authors:
- Guillermo Rauch
- Thomas Aylott
- Scott Kyle

requires:
- core:1.2.4/Class
- /MooTools.More

provides: [Log]

...
*/

(function(){

var global = this;

var log = function(){
	if (global.console && console.log){
		try {
			console.log.apply(console, arguments);
		} catch(e) {
			console.log(Array.slice(arguments));
		}
	} else {
		Log.logged.push(arguments);
	}
	return this;
};

var disabled = function(){
	this.logged.push(arguments);
	return this;
};

this.Log = new Class({
	
	logged: [],
	
	log: disabled,
	
	resetLog: function(){
		this.logged.empty();
		return this;
	},

	enableLog: function(){
		this.log = log;
		this.logged.each(function(args){
			this.log.apply(this, args);
		}, this);
		return this.resetLog();
	},

	disableLog: function(){
		this.log = disabled;
		return this;
	}
	
});

Log.extend(new Log).enableLog();

// legacy
Log.logger = function(){
	return this.log.apply(this, arguments);
};

})();

/*
---

script: Class.Refactor.js

description: Extends a class onto itself with new property, preserving any items attached to the class's namespace.

license: MIT-style license

authors:
- Aaron Newton

requires:
- core:1.2.4/Class
- /MooTools.More

provides: [Class.refactor]

...
*/

Class.refactor = function(original, refactors){

	$each(refactors, function(item, name){
		var origin = original.prototype[name];
		if (origin && (origin = origin._origin) && typeof item == 'function') original.implement(name, function(){
			var old = this.previous;
			this.previous = origin;
			var value = item.apply(this, arguments);
			this.previous = old;
			return value;
		}); else original.implement(name, item);
	});

	return original;

};

/*
---

script: Class.Binds.js

description: Automagically binds specified methods in a class to the instance of the class.

license: MIT-style license

authors:
- Aaron Newton

requires:
- core:1.2.4/Class
- /MooTools.More

provides: [Class.Binds]

...
*/

Class.Mutators.Binds = function(binds){
    return binds;
};

Class.Mutators.initialize = function(initialize){
	return function(){
		$splat(this.Binds).each(function(name){
			var original = this[name];
			if (original) this[name] = original.bind(this);
		}, this);
		return initialize.apply(this, arguments);
	};
};


/*
---

script: Class.Occlude.js

description: Prevents a class from being applied to a DOM element twice.

license: MIT-style license.

authors:
- Aaron Newton

requires: 
- core/1.2.4/Class
- core:1.2.4/Element
- /MooTools.More

provides: [Class.Occlude]

...
*/

Class.Occlude = new Class({

	occlude: function(property, element){
		element = document.id(element || this.element);
		var instance = element.retrieve(property || this.property);
		if (instance && !$defined(this.occluded))
			return this.occluded = instance;

		this.occluded = false;
		element.store(property || this.property, this);
		return this.occluded;
	}

});

/*
---

script: Array.Extras.js

description: Extends the Array native object to include useful methods to work with arrays.

license: MIT-style license

authors:
- Christoph Pojer

requires:
- core:1.2.4/Array

provides: [Array.Extras]

...
*/
Array.implement({

	min: function(){
		return Math.min.apply(null, this);
	},

	max: function(){
		return Math.max.apply(null, this);
	},

	average: function(){
		return this.length ? this.sum() / this.length : 0;
	},

	sum: function(){
		var result = 0, l = this.length;
		if (l){
			do {
				result += this[--l];
			} while (l);
		}
		return result;
	},

	unique: function(){
		return [].combine(this);
	},

	shuffle: function(){
		for (var i = this.length; i && --i;){
			var temp = this[i], r = Math.floor(Math.random() * ( i + 1 ));
			this[i] = this[r];
			this[r] = temp;
		}
		return this;
	}

});

/*
---

script: Date.js

description: Extends the Date native object to include methods useful in managing dates.

license: MIT-style license

authors:
- Aaron Newton
- Nicholas Barthelemy - https://svn.nbarthelemy.com/date-js/
- Harald Kirshner - mail [at] digitarald.de; http://digitarald.de
- Scott Kyle - scott [at] appden.com; http://appden.com

requires:
- core:1.2.4/Array
- core:1.2.4/String
- core:1.2.4/Number
- core:1.2.4/Lang
- core:1.2.4/Date.English.US
- /MooTools.More

provides: [Date]

...
*/

(function(){

var Date = this.Date;

if (!Date.now) Date.now = $time;

Date.Methods = {
	ms: 'Milliseconds',
	year: 'FullYear',
	min: 'Minutes',
	mo: 'Month',
	sec: 'Seconds',
	hr: 'Hours'
};

['Date', 'Day', 'FullYear', 'Hours', 'Milliseconds', 'Minutes', 'Month', 'Seconds', 'Time', 'TimezoneOffset',
	'Week', 'Timezone', 'GMTOffset', 'DayOfYear', 'LastMonth', 'LastDayOfMonth', 'UTCDate', 'UTCDay', 'UTCFullYear',
	'AMPM', 'Ordinal', 'UTCHours', 'UTCMilliseconds', 'UTCMinutes', 'UTCMonth', 'UTCSeconds'].each(function(method){
	Date.Methods[method.toLowerCase()] = method;
});

var pad = function(what, length){
	return new Array(length - String(what).length + 1).join('0') + what;
};

Date.implement({

	set: function(prop, value){
		switch ($type(prop)){
			case 'object':
				for (var p in prop) this.set(p, prop[p]);
				break;
			case 'string':
				prop = prop.toLowerCase();
				var m = Date.Methods;
				if (m[prop]) this['set' + m[prop]](value);
		}
		return this;
	},

	get: function(prop){
		prop = prop.toLowerCase();
		var m = Date.Methods;
		if (m[prop]) return this['get' + m[prop]]();
		return null;
	},

	clone: function(){
		return new Date(this.get('time'));
	},

	increment: function(interval, times){
		interval = interval || 'day';
		times = $pick(times, 1);

		switch (interval){
			case 'year':
				return this.increment('month', times * 12);
			case 'month':
				var d = this.get('date');
				this.set('date', 1).set('mo', this.get('mo') + times);
				return this.set('date', d.min(this.get('lastdayofmonth')));
			case 'week':
				return this.increment('day', times * 7);
			case 'day':
				return this.set('date', this.get('date') + times);
		}

		if (!Date.units[interval]) throw new Error(interval + ' is not a supported interval');

		return this.set('time', this.get('time') + times * Date.units[interval]());
	},

	decrement: function(interval, times){
		return this.increment(interval, -1 * $pick(times, 1));
	},

	isLeapYear: function(){
		return Date.isLeapYear(this.get('year'));
	},

	clearTime: function(){
		return this.set({hr: 0, min: 0, sec: 0, ms: 0});
	},

	diff: function(date, resolution){
		if ($type(date) == 'string') date = Date.parse(date);
		
		return ((date - this) / Date.units[resolution || 'day'](3, 3)).toInt(); // non-leap year, 30-day month
	},

	getLastDayOfMonth: function(){
		return Date.daysInMonth(this.get('mo'), this.get('year'));
	},

	getDayOfYear: function(){
		return (Date.UTC(this.get('year'), this.get('mo'), this.get('date') + 1) 
			- Date.UTC(this.get('year'), 0, 1)) / Date.units.day();
	},

	getWeek: function(){
		return (this.get('dayofyear') / 7).ceil();
	},
	
	getOrdinal: function(day){
		return Date.getMsg('ordinal', day || this.get('date'));
	},

	getTimezone: function(){
		return this.toString()
			.replace(/^.*? ([A-Z]{3}).[0-9]{4}.*$/, '$1')
			.replace(/^.*?\(([A-Z])[a-z]+ ([A-Z])[a-z]+ ([A-Z])[a-z]+\)$/, '$1$2$3');
	},

	getGMTOffset: function(){
		var off = this.get('timezoneOffset');
		return ((off > 0) ? '-' : '+') + pad((off.abs() / 60).floor(), 2) + pad(off % 60, 2);
	},

	setAMPM: function(ampm){
		ampm = ampm.toUpperCase();
		var hr = this.get('hr');
		if (hr > 11 && ampm == 'AM') return this.decrement('hour', 12);
		else if (hr < 12 && ampm == 'PM') return this.increment('hour', 12);
		return this;
	},

	getAMPM: function(){
		return (this.get('hr') < 12) ? 'AM' : 'PM';
	},

	parse: function(str){
		this.set('time', Date.parse(str));
		return this;
	},

	isValid: function(date) {
		return !!(date || this).valueOf();
	},

	format: function(f){
		if (!this.isValid()) return 'invalid date';
		f = f || '%x %X';
		f = formats[f.toLowerCase()] || f; // replace short-hand with actual format
		var d = this;
		return f.replace(/%([a-z%])/gi,
			function($0, $1){
				switch ($1){
					case 'a': return Date.getMsg('days')[d.get('day')].substr(0, 3);
					case 'A': return Date.getMsg('days')[d.get('day')];
					case 'b': return Date.getMsg('months')[d.get('month')].substr(0, 3);
					case 'B': return Date.getMsg('months')[d.get('month')];
					case 'c': return d.toString();
					case 'd': return pad(d.get('date'), 2);
					case 'H': return pad(d.get('hr'), 2);
					case 'I': return ((d.get('hr') % 12) || 12);
					case 'j': return pad(d.get('dayofyear'), 3);
					case 'm': return pad((d.get('mo') + 1), 2);
					case 'M': return pad(d.get('min'), 2);
					case 'o': return d.get('ordinal');
					case 'p': return Date.getMsg(d.get('ampm'));
					case 'S': return pad(d.get('seconds'), 2);
					case 'U': return pad(d.get('week'), 2);
					case 'w': return d.get('day');
					case 'x': return d.format(Date.getMsg('shortDate'));
					case 'X': return d.format(Date.getMsg('shortTime'));
					case 'y': return d.get('year').toString().substr(2);
					case 'Y': return d.get('year');
					case 'T': return d.get('GMTOffset');
					case 'Z': return d.get('Timezone');
				}
				return $1;
			}
		);
	},

	toISOString: function(){
		return this.format('iso8601');
	}

});

Date.alias('toISOString', 'toJSON');
Date.alias('diff', 'compare');
Date.alias('format', 'strftime');

var formats = {
	db: '%Y-%m-%d %H:%M:%S',
	compact: '%Y%m%dT%H%M%S',
	iso8601: '%Y-%m-%dT%H:%M:%S%T',
	rfc822: '%a, %d %b %Y %H:%M:%S %Z',
	'short': '%d %b %H:%M',
	'long': '%B %d, %Y %H:%M'
};

var parsePatterns = [];
var nativeParse = Date.parse;

var parseWord = function(type, word, num){
	var ret = -1;
	var translated = Date.getMsg(type + 's');

	switch ($type(word)){
		case 'object':
			ret = translated[word.get(type)];
			break;
		case 'number':
			ret = translated[month - 1];
			if (!ret) throw new Error('Invalid ' + type + ' index: ' + index);
			break;
		case 'string':
			var match = translated.filter(function(name){
				return this.test(name);
			}, new RegExp('^' + word, 'i'));
			if (!match.length)    throw new Error('Invalid ' + type + ' string');
			if (match.length > 1) throw new Error('Ambiguous ' + type);
			ret = match[0];
	}

	return (num) ? translated.indexOf(ret) : ret;
};

Date.extend({

	getMsg: function(key, args) {
		return MooTools.lang.get('Date', key, args);
	},

	units: {
		ms: $lambda(1),
		second: $lambda(1000),
		minute: $lambda(60000),
		hour: $lambda(3600000),
		day: $lambda(86400000),
		week: $lambda(608400000),
		month: function(month, year){
			var d = new Date;
			return Date.daysInMonth($pick(month, d.get('mo')), $pick(year, d.get('year'))) * 86400000;
		},
		year: function(year){
			year = year || new Date().get('year');
			return Date.isLeapYear(year) ? 31622400000 : 31536000000;
		}
	},

	daysInMonth: function(month, year){
		return [31, Date.isLeapYear(year) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month];
	},

	isLeapYear: function(year){
		return ((year % 4 === 0) && (year % 100 !== 0)) || (year % 400 === 0);
	},

	parse: function(from){
		var t = $type(from);
		if (t == 'number') return new Date(from);
		if (t != 'string') return from;
		from = from.clean();
		if (!from.length) return null;

		var parsed;
		parsePatterns.some(function(pattern){
			var bits = pattern.re.exec(from);
			return (bits) ? (parsed = pattern.handler(bits)) : false;
		});

		return parsed || new Date(nativeParse(from));
	},

	parseDay: function(day, num){
		return parseWord('day', day, num);
	},

	parseMonth: function(month, num){
		return parseWord('month', month, num);
	},

	parseUTC: function(value){
		var localDate = new Date(value);
		var utcSeconds = Date.UTC(
			localDate.get('year'),
			localDate.get('mo'),
			localDate.get('date'),
			localDate.get('hr'),
			localDate.get('min'),
			localDate.get('sec')
		);
		return new Date(utcSeconds);
	},

	orderIndex: function(unit){
		return Date.getMsg('dateOrder').indexOf(unit) + 1;
	},

	defineFormat: function(name, format){
		formats[name] = format;
	},

	defineFormats: function(formats){
		for (var name in formats) Date.defineFormat(name, formats[name]);
	},

	parsePatterns: parsePatterns, // this is deprecated
	
	defineParser: function(pattern){
		parsePatterns.push((pattern.re && pattern.handler) ? pattern : build(pattern));
	},
	
	defineParsers: function(){
		Array.flatten(arguments).each(Date.defineParser);
	},
	
	define2DigitYearStart: function(year){
		startYear = year % 100;
		startCentury = year - startYear;
	}

});

var startCentury = 1900;
var startYear = 70;

var regexOf = function(type){
	return new RegExp('(?:' + Date.getMsg(type).map(function(name){
		return name.substr(0, 3);
	}).join('|') + ')[a-z]*');
};

var replacers = function(key){
	switch(key){
		case 'x': // iso8601 covers yyyy-mm-dd, so just check if month is first
			return ((Date.orderIndex('month') == 1) ? '%m[.-/]%d' : '%d[.-/]%m') + '([.-/]%y)?';
		case 'X':
			return '%H([.:]%M)?([.:]%S([.:]%s)?)? ?%p? ?%T?';
	}
	return null;
};

var keys = {
	d: /[0-2]?[0-9]|3[01]/,
	H: /[01]?[0-9]|2[0-3]/,
	I: /0?[1-9]|1[0-2]/,
	M: /[0-5]?\d/,
	s: /\d+/,
	o: /[a-z]*/,
	p: /[ap]\.?m\.?/,
	y: /\d{2}|\d{4}/,
	Y: /\d{4}/,
	T: /Z|[+-]\d{2}(?::?\d{2})?/
};

keys.m = keys.I;
keys.S = keys.M;

var currentLanguage;

var recompile = function(language){
	currentLanguage = language;
	
	keys.a = keys.A = regexOf('days');
	keys.b = keys.B = regexOf('months');
	
	parsePatterns.each(function(pattern, i){
		if (pattern.format) parsePatterns[i] = build(pattern.format);
	});
};

var build = function(format){
	if (!currentLanguage) return {format: format};
	
	var parsed = [];
	var re = (format.source || format) // allow format to be regex
	 .replace(/%([a-z])/gi,
		function($0, $1){
			return replacers($1) || $0;
		}
	).replace(/\((?!\?)/g, '(?:') // make all groups non-capturing
	 .replace(/ (?!\?|\*)/g, ',? ') // be forgiving with spaces and commas
	 .replace(/%([a-z%])/gi,
		function($0, $1){
			var p = keys[$1];
			if (!p) return $1;
			parsed.push($1);
			return '(' + p.source + ')';
		}
	).replace(/\[a-z\]/gi, '[a-z\\u00c0-\\uffff]'); // handle unicode words

	return {
		format: format,
		re: new RegExp('^' + re + '$', 'i'),
		handler: function(bits){
			bits = bits.slice(1).associate(parsed);
			var date = new Date().clearTime();
			if ('d' in bits) handle.call(date, 'd', 1);
			if ('m' in bits || 'b' in bits || 'B' in bits) handle.call(date, 'm', 1);
			for (var key in bits) handle.call(date, key, bits[key]);
			return date;
		}
	};
};

var handle = function(key, value){
	if (!value) return this;

	switch(key){
		case 'a': case 'A': return this.set('day', Date.parseDay(value, true));
		case 'b': case 'B': return this.set('mo', Date.parseMonth(value, true));
		case 'd': return this.set('date', value);
		case 'H': case 'I': return this.set('hr', value);
		case 'm': return this.set('mo', value - 1);
		case 'M': return this.set('min', value);
		case 'p': return this.set('ampm', value.replace(/\./g, ''));
		case 'S': return this.set('sec', value);
		case 's': return this.set('ms', ('0.' + value) * 1000);
		case 'w': return this.set('day', value);
		case 'Y': return this.set('year', value);
		case 'y':
			value = +value;
			if (value < 100) value += startCentury + (value < startYear ? 100 : 0);
			return this.set('year', value);
		case 'T':
			if (value == 'Z') value = '+00';
			var offset = value.match(/([+-])(\d{2}):?(\d{2})?/);
			offset = (offset[1] + '1') * (offset[2] * 60 + (+offset[3] || 0)) + this.getTimezoneOffset();
			return this.set('time', this - offset * 60000);
	}

	return this;
};

Date.defineParsers(
	'%Y([-./]%m([-./]%d((T| )%X)?)?)?', // "1999-12-31", "1999-12-31 11:59pm", "1999-12-31 23:59:59", ISO8601
	'%Y%m%d(T%H(%M%S?)?)?', // "19991231", "19991231T1159", compact
	'%x( %X)?', // "12/31", "12.31.99", "12-31-1999", "12/31/2008 11:59 PM"
	'%d%o( %b( %Y)?)?( %X)?', // "31st", "31st December", "31 Dec 1999", "31 Dec 1999 11:59pm"
	'%b( %d%o)?( %Y)?( %X)?', // Same as above with month and day switched
	'%Y %b( %d%o( %X)?)?', // Same as above with year coming first
	'%o %b %d %X %T %Y' // "Thu Oct 22 08:11:23 +0000 2009"
);

MooTools.lang.addEvent('langChange', function(language){
	if (MooTools.lang.get('Date')) recompile(language);
}).fireEvent('langChange', MooTools.lang.getCurrentLanguage());

})();

/*
---

script: Date.Extras.js

description: Extends the Date native object to include extra methods (on top of those in Date.js).

license: MIT-style license

authors:
- Aaron Newton
- Scott Kyle

requires:
- /Date

provides: [Date.Extras]

...
*/

Date.implement({

	timeDiffInWords: function(relative_to){
		return Date.distanceOfTimeInWords(this, relative_to || new Date);
	},

	timeDiff: function(to, joiner){
		if (to == null) to = new Date;
		var delta = ((to - this) / 1000).toInt();
		if (!delta) return '0s';
		
		var durations = {s: 60, m: 60, h: 24, d: 365, y: 0};
		var duration, vals = [];
		
		for (var step in durations){
			if (!delta) break;
			if ((duration = durations[step])){
				vals.unshift((delta % duration) + step);
				delta = (delta / duration).toInt();
			} else {
				vals.unshift(delta + step);
			}
		}
		
		return vals.join(joiner || ':');
	}

});

Date.alias('timeDiffInWords', 'timeAgoInWords');

Date.extend({

	distanceOfTimeInWords: function(from, to){
		return Date.getTimePhrase(((to - from) / 1000).toInt());
	},

	getTimePhrase: function(delta){
		var suffix = (delta < 0) ? 'Until' : 'Ago';
		if (delta < 0) delta *= -1;
		
		var units = {
			minute: 60,
			hour: 60,
			day: 24,
			week: 7,
			month: 52 / 12,
			year: 12,
			eon: Infinity
		};
		
		var msg = 'lessThanMinute';
		
		for (var unit in units){
			var interval = units[unit];
			if (delta < 1.5 * interval){
				if (delta > 0.75 * interval) msg = unit;
				break;
			}
			delta /= interval;
			msg = unit + 's';
		}
		
		return Date.getMsg(msg + suffix).substitute({delta: delta.round()});
	}

});


Date.defineParsers(

	{
		// "today", "tomorrow", "yesterday"
		re: /^(?:tod|tom|yes)/i,
		handler: function(bits){
			var d = new Date().clearTime();
			switch(bits[0]){
				case 'tom': return d.increment();
				case 'yes': return d.decrement();
				default: 	return d;
			}
		}
	},

	{
		// "next Wednesday", "last Thursday"
		re: /^(next|last) ([a-z]+)$/i,
		handler: function(bits){
			var d = new Date().clearTime();
			var day = d.getDay();
			var newDay = Date.parseDay(bits[2], true);
			var addDays = newDay - day;
			if (newDay <= day) addDays += 7;
			if (bits[1] == 'last') addDays -= 7;
			return d.set('date', d.getDate() + addDays);
		}
	}

);


/*
---

script: Hash.Extras.js

description: Extends the Hash native object to include getFromPath which allows a path notation to child elements.

license: MIT-style license

authors:
- Aaron Newton

requires:
- core:1.2.4/Hash.base
- /MooTools.More

provides: [Hash.Extras]

...
*/

Hash.implement({

	getFromPath: function(notation){
		var source = this.getClean();
		notation.replace(/\[([^\]]+)\]|\.([^.[]+)|[^[.]+/g, function(match){
			if (!source) return null;
			var prop = arguments[2] || arguments[1] || arguments[0];
			source = (prop in source) ? source[prop] : null;
			return match;
		});
		return source;
	},

	cleanValues: function(method){
		method = method || $defined;
		this.each(function(v, k){
			if (!method(v)) this.erase(k);
		}, this);
		return this;
	},

	run: function(){
		var args = arguments;
		this.each(function(v, k){
			if ($type(v) == 'function') v.run(args);
		});
	}

});

/*
---

script: String.Extras.js

description: Extends the String native object to include methods useful in managing various kinds of strings (query strings, urls, html, etc).

license: MIT-style license

authors:
- Aaron Newton
- Guillermo Rauch

requires:
- core:1.2.4/String
- core:1.2.4/$util
- core:1.2.4/Array

provides: [String.Extras]

...
*/

(function(){
  
var special = ['Ã€','Ã ','Ã�','Ã¡','Ã‚','Ã¢','Ãƒ','Ã£','Ã„','Ã¤','Ã…','Ã¥','Ä‚','Äƒ','Ä„','Ä…','Ä†','Ä‡','ÄŒ','Ä�','Ã‡','Ã§', 'ÄŽ','Ä�','Ä�','Ä‘', 'Ãˆ','Ã¨','Ã‰','Ã©','ÃŠ','Ãª','Ã‹','Ã«','Äš','Ä›','Ä˜','Ä™', 'Äž','ÄŸ','ÃŒ','Ã¬','Ã�','Ã­','ÃŽ','Ã®','Ã�','Ã¯', 'Ä¹','Äº','Ä½','Ä¾','Å�','Å‚', 'Ã‘','Ã±','Å‡','Åˆ','Åƒ','Å„','Ã’','Ã²','Ã“','Ã³','Ã�?','Ã´','Ã•','Ãµ','Ã–','Ã¶','Ã˜','Ã¸','Å‘','Å˜','Å™','Å�?','Å•','Å ','Å¡','Åž','ÅŸ','Åš','Å›', 'Å¤','Å¥','Å¤','Å¥','Å¢','Å£','Ã™','Ã¹','Ãš','Ãº','Ã›','Ã»','Ãœ','Ã¼','Å®','Å¯', 'Å¸','Ã¿','Ã½','Ã�','Å½','Å¾','Å¹','Åº','Å»','Å¼', 'Ãž','Ã¾','Ã�','Ã°','ÃŸ','Å’','Å“','Ã†','Ã¦','Âµ'];

var standard = ['A','a','A','a','A','a','A','a','Ae','ae','A','a','A','a','A','a','C','c','C','c','C','c','D','d','D','d', 'E','e','E','e','E','e','E','e','E','e','E','e','G','g','I','i','I','i','I','i','I','i','L','l','L','l','L','l', 'N','n','N','n','N','n', 'O','o','O','o','O','o','O','o','Oe','oe','O','o','o', 'R','r','R','r', 'S','s','S','s','S','s','T','t','T','t','T','t', 'U','u','U','u','U','u','Ue','ue','U','u','Y','y','Y','y','Z','z','Z','z','Z','z','TH','th','DH','dh','ss','OE','oe','AE','ae','u'];

var tidymap = {
	"[\xa0\u2002\u2003\u2009]": " ",
	"\xb7": "*",
	"[\u2018\u2019]": "'",
	"[\u201c\u201d]": '"',
	"\u2026": "...",
	"\u2013": "-",
	"\u2014": "--",
	"\uFFFD": "&raquo;"
};

var getRegForTag = function(tag, contents) {
	tag = tag || '';
	var regstr = contents ? "<" + tag + "[^>]*>([\\s\\S]*?)<\/" + tag + ">" : "<\/?" + tag + "([^>]+)?>";
	reg = new RegExp(regstr, "gi");
	return reg;
};

String.implement({

	standardize: function(){
		var text = this;
		special.each(function(ch, i){
			text = text.replace(new RegExp(ch, 'g'), standard[i]);
		});
		return text;
	},

	repeat: function(times){
		return new Array(times + 1).join(this);
	},

	pad: function(length, str, dir){
		if (this.length >= length) return this;
		var pad = (str == null ? ' ' : '' + str).repeat(length - this.length).substr(0, length - this.length);
		if (!dir || dir == 'right') return this + pad;
		if (dir == 'left') return pad + this;
		return pad.substr(0, (pad.length / 2).floor()) + this + pad.substr(0, (pad.length / 2).ceil());
	},

	getTags: function(tag, contents){
		return this.match(getRegForTag(tag, contents)) || [];
	},

	stripTags: function(tag, contents){
		return this.replace(getRegForTag(tag, contents), '');
	},

	tidy: function(){
		var txt = this.toString();
		$each(tidymap, function(value, key){
			txt = txt.replace(new RegExp(key, 'g'), value);
		});
		return txt;
	}

});

})();

/*
---

script: String.QueryString.js

description: Methods for dealing with URI query strings.

license: MIT-style license

authors:
- Sebastian MarkbÃ¥ge, Aaron Newton, Lennart Pilon, Valerio Proietti

requires:
- core:1.2.4/Array
- core:1.2.4/String
- /MooTools.More

provides: [String.QueryString]

...
*/

String.implement({

	parseQueryString: function(){
		var vars = this.split(/[&;]/), res = {};
		if (vars.length) vars.each(function(val){
			var index = val.indexOf('='),
				keys = index < 0 ? [''] : val.substr(0, index).match(/[^\]\[]+/g),
				value = decodeURIComponent(val.substr(index + 1)),
				obj = res;
			keys.each(function(key, i){
				var current = obj[key];
				if(i < keys.length - 1)
					obj = obj[key] = current || {};
				else if($type(current) == 'array')
					current.push(value);
				else
					obj[key] = $defined(current) ? [current, value] : value;
			});
		});
		return res;
	},

	cleanQueryString: function(method){
		return this.split('&').filter(function(val){
			var index = val.indexOf('='),
			key = index < 0 ? '' : val.substr(0, index),
			value = val.substr(index + 1);
			return method ? method.run([key, value]) : $chk(value);
		}).join('&');
	}

});

/*
---

script: URI.js

description: Provides methods useful in managing the window location and uris.

license: MIT-style license

authors:
- Sebastian Markbåge
- Aaron Newton

requires:
- core:1.2.4/Selectors
- /String.QueryString

provides: URI

...
*/

var URI = new Class({

	Implements: Options,

	options: {
		/*base: false*/
	},

	regex: /^(?:(\w+):)?(?:\/\/(?:(?:([^:@\/]*):?([^:@\/]*))?@)?([^:\/?#]*)(?::(\d*))?)?(\.\.?$|(?:[^?#\/]*\/)*)([^?#]*)(?:\?([^#]*))?(?:#(.*))?/,
	parts: ['scheme', 'user', 'password', 'host', 'port', 'directory', 'file', 'query', 'fragment'],
	schemes: {http: 80, https: 443, ftp: 21, rtsp: 554, mms: 1755, file: 0},

	initialize: function(uri, options){
		this.setOptions(options);
		var base = this.options.base || URI.base;
		if(!uri) uri = base;
		
		if (uri && uri.parsed) this.parsed = $unlink(uri.parsed);
		else this.set('value', uri.href || uri.toString(), base ? new URI(base) : false);
	},

	parse: function(value, base){
		var bits = value.match(this.regex);
		if (!bits) return false;
		bits.shift();
		return this.merge(bits.associate(this.parts), base);
	},

	merge: function(bits, base){
		if ((!bits || !bits.scheme) && (!base || !base.scheme)) return false;
		if (base){
			this.parts.every(function(part){
				if (bits[part]) return false;
				bits[part] = base[part] || '';
				return true;
			});
		}
		bits.port = bits.port || this.schemes[bits.scheme.toLowerCase()];
		bits.directory = bits.directory ? this.parseDirectory(bits.directory, base ? base.directory : '') : '/';
		return bits;
	},

	parseDirectory: function(directory, baseDirectory) {
		directory = (directory.substr(0, 1) == '/' ? '' : (baseDirectory || '/')) + directory;
		if (!directory.test(URI.regs.directoryDot)) return directory;
		var result = [];
		directory.replace(URI.regs.endSlash, '').split('/').each(function(dir){
			if (dir == '..' && result.length > 0) result.pop();
			else if (dir != '.') result.push(dir);
		});
		return result.join('/') + '/';
	},

	combine: function(bits){
		return bits.value || bits.scheme + '://' +
			(bits.user ? bits.user + (bits.password ? ':' + bits.password : '') + '@' : '') +
			(bits.host || '') + (bits.port && bits.port != this.schemes[bits.scheme] ? ':' + bits.port : '') +
			(bits.directory || '/') + (bits.file || '') +
			(bits.query ? '?' + bits.query : '') +
			(bits.fragment ? '#' + bits.fragment : '');
	},

	set: function(part, value, base){
		if (part == 'value'){
			var scheme = value.match(URI.regs.scheme);
			if (scheme) scheme = scheme[1];
			if (scheme && !$defined(this.schemes[scheme.toLowerCase()])) this.parsed = { scheme: scheme, value: value };
			else this.parsed = this.parse(value, (base || this).parsed) || (scheme ? { scheme: scheme, value: value } : { value: value });
		} else if (part == 'data') {
			this.setData(value);
		} else {
			this.parsed[part] = value;
		}
		return this;
	},

	get: function(part, base){
		switch(part){
			case 'value': return this.combine(this.parsed, base ? base.parsed : false);
			case 'data' : return this.getData();
		}
		return this.parsed[part] || '';
	},

	go: function(){
		document.location.href = this.toString();
	},

	toURI: function(){
		return this;
	},

	getData: function(key, part){
		var qs = this.get(part || 'query');
		if (!$chk(qs)) return key ? null : {};
		var obj = qs.parseQueryString();
		return key ? obj[key] : obj;
	},

	setData: function(values, merge, part){
		if (typeof values == 'string'){
			data = this.getData();
			data[arguments[0]] = arguments[1];
			values = data;
		} else if (merge) {
			values = $merge(this.getData(), values);
		}
		return this.set(part || 'query', Hash.toQueryString(values));
	},

	clearData: function(part){
		return this.set(part || 'query', '');
	}

});

URI.prototype.toString = URI.prototype.valueOf = function(){
	return this.get('value');
};

URI.regs = {
	endSlash: /\/$/,
	scheme: /^(\w+):/,
	directoryDot: /\.\/|\.$/
};

URI.base = new URI(document.getElements('base[href]', true).getLast(), {base: document.location});

String.implement({

	toURI: function(options){
		return new URI(this, options);
	}

});

/*
---

script: URI.Relative.js

description: Extends the URI class to add methods for computing relative and absolute urls.

license: MIT-style license

authors:
- Sebastian MarkbÃ¥ge


requires:
- /Class.refactor
- /URI

provides: [URI.Relative]

...
*/

URI = Class.refactor(URI, {

	combine: function(bits, base){
		if (!base || bits.scheme != base.scheme || bits.host != base.host || bits.port != base.port)
			return this.previous.apply(this, arguments);
		var end = bits.file + (bits.query ? '?' + bits.query : '') + (bits.fragment ? '#' + bits.fragment : '');

		if (!base.directory) return (bits.directory || (bits.file ? '' : './')) + end;

		var baseDir = base.directory.split('/'),
			relDir = bits.directory.split('/'),
			path = '',
			offset;

		var i = 0;
		for(offset = 0; offset < baseDir.length && offset < relDir.length && baseDir[offset] == relDir[offset]; offset++);
		for(i = 0; i < baseDir.length - offset - 1; i++) path += '../';
		for(i = offset; i < relDir.length - 1; i++) path += relDir[i] + '/';

		return (path || (bits.file ? '' : './')) + end;
	},

	toAbsolute: function(base){
		base = new URI(base);
		if (base) base.set('directory', '').set('file', '');
		return this.toRelative(base);
	},

	toRelative: function(base){
		return this.get('value', new URI(base));
	}

});

/*
---

script: Element.Delegation.js

description: Extends the Element native object to include the delegate method for more efficient event management.

credits:
- "Event checking based on the work of Daniel Steigerwald. License: MIT-style license.	Copyright: Copyright (c) 2008 Daniel Steigerwald, daniel.steigerwald.cz"

license: MIT-style license

authors:
- Aaron Newton
- Daniel Steigerwald

requires:
- core:1.2.4/Element.Event
- core:1.2.4/Selectors
- /MooTools.More

provides: [Element.Delegation]

...
*/

(function(addEvent, removeEvent){
	
	var match = /(.*?):relay\(([^)]+)\)$/,
		combinators = /[+>~\s]/,
		splitType = function(type){
			var bits = type.match(match);
			return !bits ? {event: type} : {
				event: bits[1],
				selector: bits[2]
			};
		},
		check = function(e, selector){
			var t = e.target;
			if (combinators.test(selector = selector.trim())){
				var els = this.getElements(selector);
				for (var i = els.length; i--; ){
					var el = els[i];
					if (t == el || el.hasChild(t)) return el;
				}
			} else {
				for ( ; t && t != this; t = t.parentNode){
					if (Element.match(t, selector)) return document.id(t);
				}
			}
			return null;
		};

	Element.implement({

		addEvent: function(type, fn){
			var splitted = splitType(type);
			if (splitted.selector){
				var monitors = this.retrieve('$moo:delegateMonitors', {});
				if (!monitors[type]){
					var monitor = function(e){
						var el = check.call(this, e, splitted.selector);
						if (el) this.fireEvent(type, [e, el], 0, el);
					}.bind(this);
					monitors[type] = monitor;
					addEvent.call(this, splitted.event, monitor);
				}
			}
			return addEvent.apply(this, arguments);
		},

		removeEvent: function(type, fn){
			var splitted = splitType(type);
			if (splitted.selector){
				var events = this.retrieve('events');
				if (!events || !events[type] || (fn && !events[type].keys.contains(fn))) return this;

				if (fn) removeEvent.apply(this, [type, fn]);
				else removeEvent.apply(this, type);

				events = this.retrieve('events');
				if (events && events[type] && events[type].keys.length == 0){
					var monitors = this.retrieve('$moo:delegateMonitors', {});
					removeEvent.apply(this, [splitted.event, monitors[type]]);
					delete monitors[type];
				}
				return this;
			}
			return removeEvent.apply(this, arguments);
		},

		fireEvent: function(type, args, delay, bind){
			var events = this.retrieve('events');
			if (!events || !events[type]) return this;
			events[type].keys.each(function(fn){
				fn.create({bind: bind || this, delay: delay, arguments: args})();
			}, this);
			return this;
		}

	});

})(Element.prototype.addEvent, Element.prototype.removeEvent);

/*
---

script: Element.Measure.js

description: Extends the Element native object to include methods useful in measuring dimensions.

credits: "Element.measure / .expose methods by Daniel Steigerwald License: MIT-style license. Copyright: Copyright (c) 2008 Daniel Steigerwald, daniel.steigerwald.cz"

license: MIT-style license

authors:
- Aaron Newton

requires:
- core:1.2.4/Element.Style
- core:1.2.4/Element.Dimensions
- /MooTools.More

provides: [Element.Measure]

...
*/

Element.implement({

	measure: function(fn){
		var vis = function(el) {
			return !!(!el || el.offsetHeight || el.offsetWidth);
		};
		if (vis(this)) return fn.apply(this);
		var parent = this.getParent(),
			restorers = [],
			toMeasure = []; 
		while (!vis(parent) && parent != document.body) {
			toMeasure.push(parent.expose());
			parent = parent.getParent();
		}
		var restore = this.expose();
		var result = fn.apply(this);
		restore();
		toMeasure.each(function(restore){
			restore();
		});
		return result;
	},

	expose: function(){
		if (this.getStyle('display') != 'none') return $empty;
		var before = this.style.cssText;
		this.setStyles({
			display: 'block',
			position: 'absolute',
			visibility: 'hidden'
		});
		return function(){
			this.style.cssText = before;
		}.bind(this);
	},

	getDimensions: function(options){
		options = $merge({computeSize: false},options);
		var dim = {};
		var getSize = function(el, options){
			return (options.computeSize)?el.getComputedSize(options):el.getSize();
		};
		var parent = this.getParent('body');
		if (parent && this.getStyle('display') == 'none'){
			dim = this.measure(function(){
				return getSize(this, options);
			});
		} else if (parent){
			try { //safari sometimes crashes here, so catch it
				dim = getSize(this, options);
			}catch(e){}
		} else {
			dim = {x: 0, y: 0};
		}
		return $chk(dim.x) ? $extend(dim, {width: dim.x, height: dim.y}) : $extend(dim, {x: dim.width, y: dim.height});
	},

	getComputedSize: function(options){
		options = $merge({
			styles: ['padding','border'],
			plains: {
				height: ['top','bottom'],
				width: ['left','right']
			},
			mode: 'both'
		}, options);
		var size = {width: 0,height: 0};
		switch (options.mode){
			case 'vertical':
				delete size.width;
				delete options.plains.width;
				break;
			case 'horizontal':
				delete size.height;
				delete options.plains.height;
				break;
		}
		var getStyles = [];
		//this function might be useful in other places; perhaps it should be outside this function?
		$each(options.plains, function(plain, key){
			plain.each(function(edge){
				options.styles.each(function(style){
					getStyles.push((style == 'border') ? style + '-' + edge + '-' + 'width' : style + '-' + edge);
				});
			});
		});
		var styles = {};
		getStyles.each(function(style){ styles[style] = this.getComputedStyle(style); }, this);
		var subtracted = [];
		$each(options.plains, function(plain, key){ //keys: width, height, plains: ['left', 'right'], ['top','bottom']
			var capitalized = key.capitalize();
			size['total' + capitalized] = size['computed' + capitalized] = 0;
			plain.each(function(edge){ //top, left, right, bottom
				size['computed' + edge.capitalize()] = 0;
				getStyles.each(function(style, i){ //padding, border, etc.
					//'padding-left'.test('left') size['totalWidth'] = size['width'] + [padding-left]
					if (style.test(edge)){
						styles[style] = styles[style].toInt() || 0; //styles['padding-left'] = 5;
						size['total' + capitalized] = size['total' + capitalized] + styles[style];
						size['computed' + edge.capitalize()] = size['computed' + edge.capitalize()] + styles[style];
					}
					//if width != width (so, padding-left, for instance), then subtract that from the total
					if (style.test(edge) && key != style &&
						(style.test('border') || style.test('padding')) && !subtracted.contains(style)){
						subtracted.push(style);
						size['computed' + capitalized] = size['computed' + capitalized]-styles[style];
					}
				});
			});
		});

		['Width', 'Height'].each(function(value){
			var lower = value.toLowerCase();
			if(!$chk(size[lower])) return;

			size[lower] = size[lower] + this['offset' + value] + size['computed' + value];
			size['total' + value] = size[lower] + size['total' + value];
			delete size['computed' + value];
		}, this);

		return $extend(styles, size);
	}

});

/*
---

script: Element.Position.js

description: Extends the Element native object to include methods useful positioning elements relative to others.

license: MIT-style license

authors:
- Aaron Newton

requires:
- core:1.2.4/Element.Dimensions
- /Element.Measure

provides: [Elements.Position]

...
*/

(function(){

var original = Element.prototype.position;

Element.implement({

	position: function(options){
		//call original position if the options are x/y values
		if (options && ($defined(options.x) || $defined(options.y))) return original ? original.apply(this, arguments) : this;
		$each(options||{}, function(v, k){ if (!$defined(v)) delete options[k]; });
		options = $merge({
			// minimum: { x: 0, y: 0 },
			// maximum: { x: 0, y: 0},
			relativeTo: document.body,
			position: {
				x: 'center', //left, center, right
				y: 'center' //top, center, bottom
			},
			edge: false,
			offset: {x: 0, y: 0},
			returnPos: false,
			relFixedPosition: false,
			ignoreMargins: false,
			ignoreScroll: false,
			allowNegative: false
		}, options);
		//compute the offset of the parent positioned element if this element is in one
		var parentOffset = {x: 0, y: 0}, 
				parentPositioned = false;
		/* dollar around getOffsetParent should not be necessary, but as it does not return
		 * a mootools extended element in IE, an error occurs on the call to expose. See:
		 * http://mootools.lighthouseapp.com/projects/2706/tickets/333-element-getoffsetparent-inconsistency-between-ie-and-other-browsers */
		var offsetParent = this.measure(function(){
			return document.id(this.getOffsetParent());
		});
		if (offsetParent && offsetParent != this.getDocument().body){
			parentOffset = offsetParent.measure(function(){
				return this.getPosition();
			});
			parentPositioned = offsetParent != document.id(options.relativeTo);
			options.offset.x = options.offset.x - parentOffset.x;
			options.offset.y = options.offset.y - parentOffset.y;
		}
		//upperRight, bottomRight, centerRight, upperLeft, bottomLeft, centerLeft
		//topRight, topLeft, centerTop, centerBottom, center
		var fixValue = function(option){
			if ($type(option) != 'string') return option;
			option = option.toLowerCase();
			var val = {};
			if (option.test('left')) val.x = 'left';
			else if (option.test('right')) val.x = 'right';
			else val.x = 'center';
			if (option.test('upper') || option.test('top')) val.y = 'top';
			else if (option.test('bottom')) val.y = 'bottom';
			else val.y = 'center';
			return val;
		};
		options.edge = fixValue(options.edge);
		options.position = fixValue(options.position);
		if (!options.edge){
			if (options.position.x == 'center' && options.position.y == 'center') options.edge = {x:'center', y:'center'};
			else options.edge = {x:'left', y:'top'};
		}

		this.setStyle('position', 'absolute');
		var rel = document.id(options.relativeTo) || document.body,
				calc = rel == document.body ? window.getScroll() : rel.getPosition(),
				top = calc.y, left = calc.x;

		var dim = this.getDimensions({computeSize: true, styles:['padding', 'border','margin']});
		var pos = {},
				prefY = options.offset.y,
				prefX = options.offset.x,
				winSize = window.getSize();
		switch(options.position.x){
			case 'left':
				pos.x = left + prefX;
				break;
			case 'right':
				pos.x = left + prefX + rel.offsetWidth;
				break;
			default: //center
				pos.x = left + ((rel == document.body ? winSize.x : rel.offsetWidth)/2) + prefX;
				break;
		}
		switch(options.position.y){
			case 'top':
				pos.y = top + prefY;
				break;
			case 'bottom':
				pos.y = top + prefY + rel.offsetHeight;
				break;
			default: //center
				pos.y = top + ((rel == document.body ? winSize.y : rel.offsetHeight)/2) + prefY;
				break;
		}
		if (options.edge){
			var edgeOffset = {};

			switch(options.edge.x){
				case 'left':
					edgeOffset.x = 0;
					break;
				case 'right':
					edgeOffset.x = -dim.x-dim.computedRight-dim.computedLeft;
					break;
				default: //center
					edgeOffset.x = -(dim.totalWidth/2);
					break;
			}
			switch(options.edge.y){
				case 'top':
					edgeOffset.y = 0;
					break;
				case 'bottom':
					edgeOffset.y = -dim.y-dim.computedTop-dim.computedBottom;
					break;
				default: //center
					edgeOffset.y = -(dim.totalHeight/2);
					break;
			}
			pos.x += edgeOffset.x;
			pos.y += edgeOffset.y;
		}
		pos = {
			left: ((pos.x >= 0 || parentPositioned || options.allowNegative) ? pos.x : 0).toInt(),
			top: ((pos.y >= 0 || parentPositioned || options.allowNegative) ? pos.y : 0).toInt()
		};
		var xy = {left: 'x', top: 'y'};
		['minimum', 'maximum'].each(function(minmax) {
			['left', 'top'].each(function(lr) {
				var val = options[minmax] ? options[minmax][xy[lr]] : null;
				if (val != null && pos[lr] < val) pos[lr] = val;
			});
		});
		if (rel.getStyle('position') == 'fixed' || options.relFixedPosition){
			var winScroll = window.getScroll();
			pos.top+= winScroll.y;
			pos.left+= winScroll.x;
		}
		if (options.ignoreScroll) {
			var relScroll = rel.getScroll();
			pos.top-= relScroll.y;
			pos.left-= relScroll.x;
		}
		if (options.ignoreMargins) {
			pos.left += (
				options.edge.x == 'right' ? dim['margin-right'] : 
				options.edge.x == 'center' ? -dim['margin-left'] + ((dim['margin-right'] + dim['margin-left'])/2) : 
					- dim['margin-left']
			);
			pos.top += (
				options.edge.y == 'bottom' ? dim['margin-bottom'] : 
				options.edge.y == 'center' ? -dim['margin-top'] + ((dim['margin-bottom'] + dim['margin-top'])/2) : 
					- dim['margin-top']
			);
		}
		pos.left = Math.ceil(pos.left);
		pos.top = Math.ceil(pos.top);
		if (options.returnPos) return pos;
		else this.setStyles(pos);
		return this;
	}

});

})();

/*
---

script: Element.Shortcuts.js

description: Extends the Element native object to include some shortcut methods.

license: MIT-style license

authors:
- Aaron Newton

requires:
- core:1.2.4/Element.Style
- /MooTools.More

provides: [Element.Shortcuts]

...
*/

Element.implement({

	isDisplayed: function(){
		return this.getStyle('display') != 'none';
	},

	isVisible: function(){
		var w = this.offsetWidth,
			h = this.offsetHeight;
		return (w == 0 && h == 0) ? false : (w > 0 && h > 0) ? true : this.isDisplayed();
	},

	toggle: function(){
		return this[this.isDisplayed() ? 'hide' : 'show']();
	},

	hide: function(){
		var d;
		try {
			//IE fails here if the element is not in the dom
			d = this.getStyle('display');
		} catch(e){}
		return this.store('originalDisplay', d || '').setStyle('display', 'none');
	},

	show: function(display){
		display = display || this.retrieve('originalDisplay') || 'block';
		return this.setStyle('display', (display == 'none') ? 'block' : display);
	},

	swapClass: function(remove, add){
		return this.removeClass(remove).addClass(add);
	}

});


/*
---

script: Fx.Elements.js

description: Effect to change any number of CSS properties of any number of Elements.

license: MIT-style license

authors:
- Valerio Proietti

requires:
- core:1.2.4/Fx.CSS
- /MooTools.More

provides: [Fx.Elements]

...
*/

Fx.Elements = new Class({

	Extends: Fx.CSS,

	initialize: function(elements, options){
		this.elements = this.subject = $$(elements);
		this.parent(options);
	},

	compute: function(from, to, delta){
		var now = {};
		for (var i in from){
			var iFrom = from[i], iTo = to[i], iNow = now[i] = {};
			for (var p in iFrom) iNow[p] = this.parent(iFrom[p], iTo[p], delta);
		}
		return now;
	},

	set: function(now){
		for (var i in now){
			var iNow = now[i];
			for (var p in iNow) this.render(this.elements[i], p, iNow[p], this.options.unit);
		}
		return this;
	},

	start: function(obj){
		if (!this.check(obj)) return this;
		var from = {}, to = {};
		for (var i in obj){
			var iProps = obj[i], iFrom = from[i] = {}, iTo = to[i] = {};
			for (var p in iProps){
				var parsed = this.prepare(this.elements[i], p, iProps[p]);
				iFrom[p] = parsed.from;
				iTo[p] = parsed.to;
			}
		}
		return this.parent(from, to);
	}

});

/*
---

script: Fx.Accordion.js

description: An Fx.Elements extension which allows you to easily create accordion type controls.

license: MIT-style license

authors:
- Valerio Proietti

requires:
- core:1.2.4/Element.Event
- /Fx.Elements

provides: [Fx.Accordion]

...
*/

Fx.Accordion = new Class({

	Extends: Fx.Elements,

	options: {/*
		onActive: $empty(toggler, section),
		onBackground: $empty(toggler, section),
		fixedHeight: false,
		fixedWidth: false,
		*/
		display: 0,
		show: false,
		height: true,
		width: false,
		opacity: true,
		alwaysHide: false,
		trigger: 'click',
		initialDisplayFx: true,
		returnHeightToAuto: true
	},

	initialize: function(){
		var params = Array.link(arguments, {
			'container': Element.type, //deprecated
			'options': Object.type,
			'togglers': $defined,
			'elements': $defined
		});
		this.parent(params.elements, params.options);
		this.togglers = $$(params.togglers);
		this.previous = -1;
		this.internalChain = new Chain();
		if (this.options.alwaysHide) this.options.wait = true;
		if ($chk(this.options.show)){
			this.options.display = false;
			this.previous = this.options.show;
		}
		if (this.options.start){
			this.options.display = false;
			this.options.show = false;
		}
		this.effects = {};
		if (this.options.opacity) this.effects.opacity = 'fullOpacity';
		if (this.options.width) this.effects.width = this.options.fixedWidth ? 'fullWidth' : 'offsetWidth';
		if (this.options.height) this.effects.height = this.options.fixedHeight ? 'fullHeight' : 'scrollHeight';
		for (var i = 0, l = this.togglers.length; i < l; i++) this.addSection(this.togglers[i], this.elements[i]);
		this.elements.each(function(el, i){
			if (this.options.show === i){
				this.fireEvent('active', [this.togglers[i], el]);
			} else {
				for (var fx in this.effects) el.setStyle(fx, 0);
			}
		}, this);
		if ($chk(this.options.display) || this.options.initialDisplayFx === false) this.display(this.options.display, this.options.initialDisplayFx);
		if (this.options.fixedHeight !== false) this.options.returnHeightToAuto = false;
		this.addEvent('complete', this.internalChain.callChain.bind(this.internalChain));
	},

	addSection: function(toggler, element){
		toggler = document.id(toggler);
		element = document.id(element);
		var test = this.togglers.contains(toggler);
		this.togglers.include(toggler);
		this.elements.include(element);
		var idx = this.togglers.indexOf(toggler);
		var displayer = this.display.bind(this, idx);
		toggler.store('accordion:display', displayer);
		toggler.addEvent(this.options.trigger, displayer);
		if (this.options.height) element.setStyles({'padding-top': 0, 'border-top': 'none', 'padding-bottom': 0, 'border-bottom': 'none'});
		if (this.options.width) element.setStyles({'padding-left': 0, 'border-left': 'none', 'padding-right': 0, 'border-right': 'none'});
		element.fullOpacity = 1;
		if (this.options.fixedWidth) element.fullWidth = this.options.fixedWidth;
		if (this.options.fixedHeight) element.fullHeight = this.options.fixedHeight;
		element.setStyle('overflow', 'hidden');
		if (!test){
			for (var fx in this.effects) element.setStyle(fx, 0);
		}
		return this;
	},

	detach: function(){
		this.togglers.each(function(toggler) {
			toggler.removeEvent(this.options.trigger, toggler.retrieve('accordion:display'));
		}, this);
	},

	display: function(index, useFx){
		if (!this.check(index, useFx)) return this;
		useFx = $pick(useFx, true);
		if (this.options.returnHeightToAuto){
			var prev = this.elements[this.previous];
			if (prev && !this.selfHidden){
				for (var fx in this.effects){
					prev.setStyle(fx, prev[this.effects[fx]]);
				}
			}
		}
		index = ($type(index) == 'element') ? this.elements.indexOf(index) : index;
		if ((this.timer && this.options.wait) || (index === this.previous && !this.options.alwaysHide)) return this;
		this.previous = index;
		var obj = {};
		this.elements.each(function(el, i){
			obj[i] = {};
			var hide;
			if (i != index){
				hide = true;
			} else if (this.options.alwaysHide && ((el.offsetHeight > 0 && this.options.height) || el.offsetWidth > 0 && this.options.width)){
				hide = true;
				this.selfHidden = true;
			}
			this.fireEvent(hide ? 'background' : 'active', [this.togglers[i], el]);
			for (var fx in this.effects) obj[i][fx] = hide ? 0 : el[this.effects[fx]];
		}, this);
		this.internalChain.chain(function(){
			if (this.options.returnHeightToAuto && !this.selfHidden){
				var el = this.elements[index];
				if (el) el.setStyle('height', 'auto');
			};
		}.bind(this));
		return useFx ? this.start(obj) : this.set(obj);
	}

});

/*
	Compatibility with 1.2.0
*/
var Accordion = new Class({

	Extends: Fx.Accordion,

	initialize: function(){
		this.parent.apply(this, arguments);
		var params = Array.link(arguments, {'container': Element.type});
		this.container = params.container;
	},

	addSection: function(toggler, element, pos){
		toggler = document.id(toggler);
		element = document.id(element);
		var test = this.togglers.contains(toggler);
		var len = this.togglers.length;
		if (len && (!test || pos)){
			pos = $pick(pos, len - 1);
			toggler.inject(this.togglers[pos], 'before');
			element.inject(toggler, 'after');
		} else if (this.container && !test){
			toggler.inject(this.container);
			element.inject(this.container);
		}
		return this.parent.apply(this, arguments);
	}

});

/*
---

script: Fx.Move.js

description: Defines Fx.Move, a class that works with Element.Position.js to transition an element from one location to another.

license: MIT-style license

authors:
- Aaron Newton

requires:
- core:1.2.4/Fx.Morph
- /Element.Position

provides: [Fx.Move]

...
*/

Fx.Move = new Class({

	Extends: Fx.Morph,

	options: {
		relativeTo: document.body,
		position: 'center',
		edge: false,
		offset: {x: 0, y: 0}
	},

	start: function(destination){
		return this.parent(this.element.position($merge(this.options, destination, {returnPos: true})));
	}

});

Element.Properties.move = {

	set: function(options){
		var morph = this.retrieve('move');
		if (morph) morph.cancel();
		return this.eliminate('move').store('move:options', $extend({link: 'cancel'}, options));
	},

	get: function(options){
		if (options || !this.retrieve('move')){
			if (options || !this.retrieve('move:options')) this.set('move', options);
			this.store('move', new Fx.Move(this, this.retrieve('move:options')));
		}
		return this.retrieve('move');
	}

};

Element.implement({

	move: function(options){
		this.get('move').start(options);
		return this;
	}

});


/*
---

script: Fx.Reveal.js

description: Defines Fx.Reveal, a class that shows and hides elements with a transition.

license: MIT-style license

authors:
- Aaron Newton

requires:
- core:1.2.4/Fx.Morph
- /Element.Shortcuts
- /Element.Measure

provides: [Fx.Reveal]

...
*/

Fx.Reveal = new Class({

	Extends: Fx.Morph,

	options: {/*	  
		onShow: $empty(thisElement),
		onHide: $empty(thisElement),
		onComplete: $empty(thisElement),
		heightOverride: null,
		widthOverride: null, */
		link: 'cancel',
		styles: ['padding', 'border', 'margin'],
		transitionOpacity: !Browser.Engine.trident4,
		mode: 'vertical',
		display: 'block',
		hideInputs: Browser.Engine.trident ? 'select, input, textarea, object, embed' : false
	},

	dissolve: function(){
		try {
			if (!this.hiding && !this.showing){
				if (this.element.getStyle('display') != 'none'){
					this.hiding = true;
					this.showing = false;
					this.hidden = true;
					this.cssText = this.element.style.cssText;
					var startStyles = this.element.getComputedSize({
						styles: this.options.styles,
						mode: this.options.mode
					});
					this.element.setStyle('display', this.options.display);
					if (this.options.transitionOpacity) startStyles.opacity = 1;
					var zero = {};
					$each(startStyles, function(style, name){
						zero[name] = [style, 0];
					}, this);
					this.element.setStyle('overflow', 'hidden');
					var hideThese = this.options.hideInputs ? this.element.getElements(this.options.hideInputs) : null;
					this.$chain.unshift(function(){
						if (this.hidden){
							this.hiding = false;
							$each(startStyles, function(style, name){
								startStyles[name] = style;
							}, this);
							this.element.style.cssText = this.cssText;
							this.element.setStyle('display', 'none');
							if (hideThese) hideThese.setStyle('visibility', 'visible');
						}
						this.fireEvent('hide', this.element);
						this.callChain();
					}.bind(this));
					if (hideThese) hideThese.setStyle('visibility', 'hidden');
					this.start(zero);
				} else {
					this.callChain.delay(10, this);
					this.fireEvent('complete', this.element);
					this.fireEvent('hide', this.element);
				}
			} else if (this.options.link == 'chain'){
				this.chain(this.dissolve.bind(this));
			} else if (this.options.link == 'cancel' && !this.hiding){
				this.cancel();
				this.dissolve();
			}
		} catch(e){
			this.hiding = false;
			this.element.setStyle('display', 'none');
			this.callChain.delay(10, this);
			this.fireEvent('complete', this.element);
			this.fireEvent('hide', this.element);
		}
		return this;
	},

	reveal: function(){
		try {
			if (!this.showing && !this.hiding){
				if (this.element.getStyle('display') == 'none' ||
					 this.element.getStyle('visiblity') == 'hidden' ||
					 this.element.getStyle('opacity') == 0){
					this.showing = true;
					this.hiding = this.hidden =  false;
					var startStyles;
					this.cssText = this.element.style.cssText;
					//toggle display, but hide it
					this.element.measure(function(){
						//create the styles for the opened/visible state
						startStyles = this.element.getComputedSize({
							styles: this.options.styles,
							mode: this.options.mode
						});
					}.bind(this));
					$each(startStyles, function(style, name){
						startStyles[name] = style;
					});
					//if we're overridding height/width
					if ($chk(this.options.heightOverride)) startStyles.height = this.options.heightOverride.toInt();
					if ($chk(this.options.widthOverride)) startStyles.width = this.options.widthOverride.toInt();
					if (this.options.transitionOpacity) {
						this.element.setStyle('opacity', 0);
						startStyles.opacity = 1;
					}
					//create the zero state for the beginning of the transition
					var zero = {
						height: 0,
						display: this.options.display
					};
					$each(startStyles, function(style, name){ zero[name] = 0; });
					//set to zero
					this.element.setStyles($merge(zero, {overflow: 'hidden'}));
					//hide inputs
					var hideThese = this.options.hideInputs ? this.element.getElements(this.options.hideInputs) : null;
					if (hideThese) hideThese.setStyle('visibility', 'hidden');
					//start the effect
					this.start(startStyles);
					this.$chain.unshift(function(){
						this.element.style.cssText = this.cssText;
						this.element.setStyle('display', this.options.display);
						if (!this.hidden) this.showing = false;
						if (hideThese) hideThese.setStyle('visibility', 'visible');
						this.callChain();
						this.fireEvent('show', this.element);
					}.bind(this));
				} else {
					this.callChain();
					this.fireEvent('complete', this.element);
					this.fireEvent('show', this.element);
				}
			} else if (this.options.link == 'chain'){
				this.chain(this.reveal.bind(this));
			} else if (this.options.link == 'cancel' && !this.showing){
				this.cancel();
				this.reveal();
			}
		} catch(e){
			this.element.setStyles({
				display: this.options.display,
				visiblity: 'visible',
				opacity: 1
			});
			this.showing = false;
			this.callChain.delay(10, this);
			this.fireEvent('complete', this.element);
			this.fireEvent('show', this.element);
		}
		return this;
	},

	toggle: function(){
		if (this.element.getStyle('display') == 'none' ||
			 this.element.getStyle('visiblity') == 'hidden' ||
			 this.element.getStyle('opacity') == 0){
			this.reveal();
		} else {
			this.dissolve();
		}
		return this;
	},

	cancel: function(){
		this.parent.apply(this, arguments);
		this.element.style.cssText = this.cssText;
		this.hidding = false;
		this.showing = false;
	}

});

Element.Properties.reveal = {

	set: function(options){
		var reveal = this.retrieve('reveal');
		if (reveal) reveal.cancel();
		return this.eliminate('reveal').store('reveal:options', options);
	},

	get: function(options){
		if (options || !this.retrieve('reveal')){
			if (options || !this.retrieve('reveal:options')) this.set('reveal', options);
			this.store('reveal', new Fx.Reveal(this, this.retrieve('reveal:options')));
		}
		return this.retrieve('reveal');
	}

};

Element.Properties.dissolve = Element.Properties.reveal;

Element.implement({

	reveal: function(options){
		this.get('reveal', options).reveal();
		return this;
	},

	dissolve: function(options){
		this.get('reveal', options).dissolve();
		return this;
	},

	nix: function(){
		var params = Array.link(arguments, {destroy: Boolean.type, options: Object.type});
		this.get('reveal', params.options).dissolve().chain(function(){
			this[params.destroy ? 'destroy' : 'dispose']();
		}.bind(this));
		return this;
	},

	wink: function(){
		var params = Array.link(arguments, {duration: Number.type, options: Object.type});
		var reveal = this.get('reveal', params.options);
		reveal.reveal().chain(function(){
			(function(){
				reveal.dissolve();
			}).delay(params.duration || 2000);
		});
	}


});

/*
---

script: Fx.Scroll.js

description: Effect to smoothly scroll any element, including the window.

license: MIT-style license

authors:
- Valerio Proietti

requires:
- core:1.2.4/Fx
- core:1.2.4/Element.Event
- core:1.2.4/Element.Dimensions
- /MooTools.More

provides: [Fx.Scroll]

...
*/

Fx.Scroll = new Class({

	Extends: Fx,

	options: {
		offset: {x: 0, y: 0},
		wheelStops: true
	},

	initialize: function(element, options){
		this.element = this.subject = document.id(element);
		this.parent(options);
		var cancel = this.cancel.bind(this, false);

		if ($type(this.element) != 'element') this.element = document.id(this.element.getDocument().body);

		var stopper = this.element;

		if (this.options.wheelStops){
			this.addEvent('start', function(){
				stopper.addEvent('mousewheel', cancel);
			}, true);
			this.addEvent('complete', function(){
				stopper.removeEvent('mousewheel', cancel);
			}, true);
		}
	},

	set: function(){
		var now = Array.flatten(arguments);
		if (Browser.Engine.gecko) now = [Math.round(now[0]), Math.round(now[1])];
		this.element.scrollTo(now[0], now[1]);
	},

	compute: function(from, to, delta){
		return [0, 1].map(function(i){
			return Fx.compute(from[i], to[i], delta);
		});
	},

	start: function(x, y){
		if (!this.check(x, y)) return this;
		var scrollSize = this.element.getScrollSize(),
			scroll = this.element.getScroll(), 
			values = {x: x, y: y};
		for (var z in values){
			var max = scrollSize[z];
			if ($chk(values[z])) values[z] = ($type(values[z]) == 'number') ? values[z] : max;
			else values[z] = scroll[z];
			values[z] += this.options.offset[z];
		}
		return this.parent([scroll.x, scroll.y], [values.x, values.y]);
	},

	toTop: function(){
		return this.start(false, 0);
	},

	toLeft: function(){
		return this.start(0, false);
	},

	toRight: function(){
		return this.start('right', false);
	},

	toBottom: function(){
		return this.start(false, 'bottom');
	},

	toElement: function(el){
		var position = document.id(el).getPosition(this.element);
		return this.start(position.x, position.y);
	},

	scrollIntoView: function(el, axes, offset){
		axes = axes ? $splat(axes) : ['x','y'];
		var to = {};
		el = document.id(el);
		var pos = el.getPosition(this.element);
		var size = el.getSize();
		var scroll = this.element.getScroll();
		var containerSize = this.element.getSize();
		var edge = {
			x: pos.x + size.x,
			y: pos.y + size.y
		};
		['x','y'].each(function(axis) {
			if (axes.contains(axis)) {
				if (edge[axis] > scroll[axis] + containerSize[axis]) to[axis] = edge[axis] - containerSize[axis];
				if (pos[axis] < scroll[axis]) to[axis] = pos[axis];
			}
			if (to[axis] == null) to[axis] = scroll[axis];
			if (offset && offset[axis]) to[axis] = to[axis] + offset[axis];
		}, this);
		if (to.x != scroll.x || to.y != scroll.y) this.start(to.x, to.y);
		return this;
	},

	scrollToCenter: function(el, axes, offset){
		axes = axes ? $splat(axes) : ['x', 'y'];
		el = $(el);
		var to = {},
			pos = el.getPosition(this.element),
			size = el.getSize(),
			scroll = this.element.getScroll(),
			containerSize = this.element.getSize(),
			edge = {
				x: pos.x + size.x,
				y: pos.y + size.y
			};

		['x','y'].each(function(axis){
			if(axes.contains(axis)){
				to[axis] = pos[axis] - (containerSize[axis] - size[axis])/2;
			}
			if(to[axis] == null) to[axis] = scroll[axis];
			if(offset && offset[axis]) to[axis] = to[axis] + offset[axis];
		}, this);
		if (to.x != scroll.x || to.y != scroll.y) this.start(to.x, to.y);
		return this;
	}

});


/*
---

script: Fx.Slide.js

description: Effect to slide an element in and out of view.

license: MIT-style license

authors:
- Valerio Proietti

requires:
- core:1.2.4/Fx Element.Style
- /MooTools.More

provides: [Fx.Slide]

...
*/

Fx.Slide = new Class({

	Extends: Fx,

	options: {
		mode: 'vertical',
		wrapper: false,
		hideOverflow: true
	},

	initialize: function(element, options){
		this.addEvent('complete', function(){
			this.open = (this.wrapper['offset' + this.layout.capitalize()] != 0);
			if (this.open) this.wrapper.setStyle('height', '');
			if (this.open && Browser.Engine.webkit419) this.element.dispose().inject(this.wrapper);
		}, true);
		this.element = this.subject = document.id(element);
		this.parent(options);
		var wrapper = this.element.retrieve('wrapper');
		var styles = this.element.getStyles('margin', 'position', 'overflow');
		if (this.options.hideOverflow) styles = $extend(styles, {overflow: 'hidden'});
		if (this.options.wrapper) wrapper = document.id(this.options.wrapper).setStyles(styles);
		this.wrapper = wrapper || new Element('div', {
			styles: styles
		}).wraps(this.element);
		this.element.store('wrapper', this.wrapper).setStyle('margin', 0);
		this.now = [];
		this.open = true;
	},

	vertical: function(){
		this.margin = 'margin-top';
		this.layout = 'height';
		this.offset = this.element.offsetHeight;
	},

	horizontal: function(){
		this.margin = 'margin-left';
		this.layout = 'width';
		this.offset = this.element.offsetWidth;
	},

	set: function(now){
		this.element.setStyle(this.margin, now[0]);
		this.wrapper.setStyle(this.layout, now[1]);
		return this;
	},

	compute: function(from, to, delta){
		return [0, 1].map(function(i){
			return Fx.compute(from[i], to[i], delta);
		});
	},

	start: function(how, mode){
		if (!this.check(how, mode)) return this;
		this[mode || this.options.mode]();
		var margin = this.element.getStyle(this.margin).toInt();
		var layout = this.wrapper.getStyle(this.layout).toInt();
		var caseIn = [[margin, layout], [0, this.offset]];
		var caseOut = [[margin, layout], [-this.offset, 0]];
		var start;
		switch (how){
			case 'in': start = caseIn; break;
			case 'out': start = caseOut; break;
			case 'toggle': start = (layout == 0) ? caseIn : caseOut;
		}
		return this.parent(start[0], start[1]);
	},

	slideIn: function(mode){
		return this.start('in', mode);
	},

	slideOut: function(mode){
		return this.start('out', mode);
	},

	hide: function(mode){
		this[mode || this.options.mode]();
		this.open = false;
		return this.set([-this.offset, 0]);
	},

	show: function(mode){
		this[mode || this.options.mode]();
		this.open = true;
		return this.set([0, this.offset]);
	},

	toggle: function(mode){
		return this.start('toggle', mode);
	}

});

Element.Properties.slide = {

	set: function(options){
		var slide = this.retrieve('slide');
		if (slide) slide.cancel();
		return this.eliminate('slide').store('slide:options', $extend({link: 'cancel'}, options));
	},

	get: function(options){
		if (options || !this.retrieve('slide')){
			if (options || !this.retrieve('slide:options')) this.set('slide', options);
			this.store('slide', new Fx.Slide(this, this.retrieve('slide:options')));
		}
		return this.retrieve('slide');
	}

};

Element.implement({

	slide: function(how, mode){
		how = how || 'toggle';
		var slide = this.get('slide'), toggle;
		switch (how){
			case 'hide': slide.hide(mode); break;
			case 'show': slide.show(mode); break;
			case 'toggle':
				var flag = this.retrieve('slide:flag', slide.open);
				slide[flag ? 'slideOut' : 'slideIn'](mode);
				this.store('slide:flag', !flag);
				toggle = true;
			break;
			default: slide.start(how, mode);
		}
		if (!toggle) this.eliminate('slide:flag');
		return this;
	}

});


/*
---

script: Fx.SmoothScroll.js

description: Class for creating a smooth scrolling effect to all internal links on the page.

license: MIT-style license

authors:
- Valerio Proietti

requires:
- core:1.2.4/Selectors
- /Fx.Scroll

provides: [Fx.SmoothScroll]

...
*/

var SmoothScroll = Fx.SmoothScroll = new Class({

	Extends: Fx.Scroll,

	initialize: function(options, context){
		context = context || document;
		this.doc = context.getDocument();
		var win = context.getWindow();
		this.parent(this.doc, options);
		this.links = $$(this.options.links || this.doc.links);
		var location = win.location.href.match(/^[^#]*/)[0] + '#';
		this.links.each(function(link){
			if (link.href.indexOf(location) != 0) {return;}
			var anchor = link.href.substr(location.length);
			if (anchor) this.useLink(link, anchor);
		}, this);
		if (!Browser.Engine.webkit419) {
			this.addEvent('complete', function(){
				win.location.hash = this.anchor;
			}, true);
		}
	},

	useLink: function(link, anchor){
		var el;
		link.addEvent('click', function(event){
			if (el !== false && !el) el = document.id(anchor) || this.doc.getElement('a[name=' + anchor + ']');
			if (el) {
				event.preventDefault();
				this.anchor = anchor;
				this.toElement(el).chain(function(){
					this.fireEvent('scrolledTo', [link, el]);
				}.bind(this));
				link.blur();
			}
		}.bind(this));
	}
});

/*
---

script: Fx.Sort.js

description: Defines Fx.Sort, a class that reorders lists with a transition.

license: MIT-style license

authors:
- Aaron Newton

requires:
- core:1.2.4/Element.Dimensions
- /Fx.Elements
- /Element.Measure

provides: [Fx.Sort]

...
*/

Fx.Sort = new Class({

	Extends: Fx.Elements,

	options: {
		mode: 'vertical'
	},

	initialize: function(elements, options){
		this.parent(elements, options);
		this.elements.each(function(el){
			if (el.getStyle('position') == 'static') el.setStyle('position', 'relative');
		});
		this.setDefaultOrder();
	},

	setDefaultOrder: function(){
		this.currentOrder = this.elements.map(function(el, index){
			return index;
		});
	},

	sort: function(newOrder){
		if ($type(newOrder) != 'array') return false;
		var top = 0,
			left = 0,
			next = {},
			zero = {},
			vert = this.options.mode == 'vertical';
		var current = this.elements.map(function(el, index){
			var size = el.getComputedSize({styles: ['border', 'padding', 'margin']});
			var val;
			if (vert){
				val = {
					top: top,
					margin: size['margin-top'],
					height: size.totalHeight
				};
				top += val.height - size['margin-top'];
			} else {
				val = {
					left: left,
					margin: size['margin-left'],
					width: size.totalWidth
				};
				left += val.width;
			}
			var plain = vert ? 'top' : 'left';
			zero[index] = {};
			var start = el.getStyle(plain).toInt();
			zero[index][plain] = start || 0;
			return val;
		}, this);
		this.set(zero);
		newOrder = newOrder.map(function(i){ return i.toInt(); });
		if (newOrder.length != this.elements.length){
			this.currentOrder.each(function(index){
				if (!newOrder.contains(index)) newOrder.push(index);
			});
			if (newOrder.length > this.elements.length)
				newOrder.splice(this.elements.length-1, newOrder.length - this.elements.length);
		}
		var margin = top = left = 0;
		newOrder.each(function(item, index){
			var newPos = {};
			if (vert){
				newPos.top = top - current[item].top - margin;
				top += current[item].height;
			} else {
				newPos.left = left - current[item].left;
				left += current[item].width;
			}
			margin = margin + current[item].margin;
			next[item]=newPos;
		}, this);
		var mapped = {};
		$A(newOrder).sort().each(function(index){
			mapped[index] = next[index];
		});
		this.start(mapped);
		this.currentOrder = newOrder;
		return this;
	},

	rearrangeDOM: function(newOrder){
		newOrder = newOrder || this.currentOrder;
		var parent = this.elements[0].getParent();
		var rearranged = [];
		this.elements.setStyle('opacity', 0);
		//move each element and store the new default order
		newOrder.each(function(index){
			rearranged.push(this.elements[index].inject(parent).setStyles({
				top: 0,
				left: 0
			}));
		}, this);
		this.elements.setStyle('opacity', 1);
		this.elements = $$(rearranged);
		this.setDefaultOrder();
		return this;
	},

	getDefaultOrder: function(){
		return this.elements.map(function(el, index){
			return index;
		});
	},

	forward: function(){
		return this.sort(this.getDefaultOrder());
	},

	backward: function(){
		return this.sort(this.getDefaultOrder().reverse());
	},

	reverse: function(){
		return this.sort(this.currentOrder.reverse());
	},

	sortByElements: function(elements){
		return this.sort(elements.map(function(el){
			return this.elements.indexOf(el);
		}, this));
	},

	swap: function(one, two){
		if ($type(one) == 'element') one = this.elements.indexOf(one);
		if ($type(two) == 'element') two = this.elements.indexOf(two);
		
		var newOrder = $A(this.currentOrder);
		newOrder[this.currentOrder.indexOf(one)] = two;
		newOrder[this.currentOrder.indexOf(two)] = one;
		return this.sort(newOrder);
	}

});

/*
---

script: Drag.js

description: The base Drag Class. Can be used to drag and resize Elements using mouse events.

license: MIT-style license

authors:
- Valerio Proietti
- Tom Occhinno
- Jan Kassens

requires:
- core:1.2.4/Events
- core:1.2.4/Options
- core:1.2.4/Element.Event
- core:1.2.4/Element.Style
- /MooTools.More

provides: [Drag]

*/

var Drag = new Class({

	Implements: [Events, Options],

	options: {/*
		onBeforeStart: $empty(thisElement),
		onStart: $empty(thisElement, event),
		onSnap: $empty(thisElement)
		onDrag: $empty(thisElement, event),
		onCancel: $empty(thisElement),
		onComplete: $empty(thisElement, event),*/
		snap: 6,
		unit: 'px',
		grid: false,
		style: true,
		limit: false,
		handle: false,
		invert: false,
		preventDefault: false,
		stopPropagation: false,
		modifiers: {x: 'left', y: 'top'}
	},

	initialize: function(){
		var params = Array.link(arguments, {'options': Object.type, 'element': $defined});
		this.element = document.id(params.element);
		this.document = this.element.getDocument();
		this.setOptions(params.options || {});
		var htype = $type(this.options.handle);
		this.handles = ((htype == 'array' || htype == 'collection') ? $$(this.options.handle) : document.id(this.options.handle)) || this.element;
		this.mouse = {'now': {}, 'pos': {}};
		this.value = {'start': {}, 'now': {}};

		this.selection = (Browser.Engine.trident) ? 'selectstart' : 'mousedown';

		this.bound = {
			start: this.start.bind(this),
			check: this.check.bind(this),
			drag: this.drag.bind(this),
			stop: this.stop.bind(this),
			cancel: this.cancel.bind(this),
			eventStop: $lambda(false)
		};
		this.attach();
	},

	attach: function(){
		this.handles.addEvent('mousedown', this.bound.start);
		return this;
	},

	detach: function(){
		this.handles.removeEvent('mousedown', this.bound.start);
		return this;
	},

	start: function(event){
		if (event.rightClick) return;
		if (this.options.preventDefault) event.preventDefault();
		if (this.options.stopPropagation) event.stopPropagation();
		this.mouse.start = event.page;
		this.fireEvent('beforeStart', this.element);
		var limit = this.options.limit;
		this.limit = {x: [], y: []};
		for (var z in this.options.modifiers){
			if (!this.options.modifiers[z]) continue;
			if (this.options.style) this.value.now[z] = this.element.getStyle(this.options.modifiers[z]).toInt();
			else this.value.now[z] = this.element[this.options.modifiers[z]];
			if (this.options.invert) this.value.now[z] *= -1;
			this.mouse.pos[z] = event.page[z] - this.value.now[z];

			if(isNaN(this.mouse.pos[z]))			//hackity hackity hackity
				this.mouse.pos[z] = event.page[z] - this.element.getPosition()[z]; //hackity
			
			if (limit && limit[z]){
				for (var i = 2; i--; i){
					if ($chk(limit[z][i])) this.limit[z][i] = $lambda(limit[z][i])();
				}
			}
		}
		if ($type(this.options.grid) == 'number') this.options.grid = {x: this.options.grid, y: this.options.grid};
		this.document.addEvents({mousemove: this.bound.check, mouseup: this.bound.cancel});
		this.document.addEvent(this.selection, this.bound.eventStop);
	},

	check: function(event){
		if (this.options.preventDefault) event.preventDefault();
		var distance = Math.round(Math.sqrt(Math.pow(event.page.x - this.mouse.start.x, 2) + Math.pow(event.page.y - this.mouse.start.y, 2)));
		if (distance > this.options.snap){
			this.cancel();
			this.document.addEvents({
				mousemove: this.bound.drag,
				mouseup: this.bound.stop
			});
			this.fireEvent('start', [this.element, event]).fireEvent('snap', this.element);
		}
	},

	drag: function(event){
		if (this.options.preventDefault) event.preventDefault();
		this.mouse.now = event.page;
		for (var z in this.options.modifiers){
			if (!this.options.modifiers[z]) continue;
			this.value.now[z] = this.mouse.now[z] - this.mouse.pos[z];
			if (this.options.invert) this.value.now[z] *= -1;
			if (this.options.limit && this.limit[z]){
				if ($chk(this.limit[z][1]) && (this.value.now[z] > this.limit[z][1])){
					this.value.now[z] = this.limit[z][1];
				} else if ($chk(this.limit[z][0]) && (this.value.now[z] < this.limit[z][0])){
					this.value.now[z] = this.limit[z][0];
				}
			}
			if (this.options.grid[z]) this.value.now[z] -= ((this.value.now[z] - (this.limit[z][0]||0)) % this.options.grid[z]);
			if (this.options.style) {
				this.element.setStyle(this.options.modifiers[z], this.value.now[z] + this.options.unit);
			} else {
				this.element[this.options.modifiers[z]] = this.value.now[z];
			}
		}
		this.fireEvent('drag', [this.element, event]);
	},

	cancel: function(event){
		this.document.removeEvent('mousemove', this.bound.check);
		this.document.removeEvent('mouseup', this.bound.cancel);
		if (event){
			this.document.removeEvent(this.selection, this.bound.eventStop);
			this.fireEvent('cancel', this.element);
		}
	},

	stop: function(event){
		this.document.removeEvent(this.selection, this.bound.eventStop);
		this.document.removeEvent('mousemove', this.bound.drag);
		this.document.removeEvent('mouseup', this.bound.stop);
		if (event) this.fireEvent('complete', [this.element, event]);
	}

});

Element.implement({

	makeResizable: function(options){
		var drag = new Drag(this, $merge({modifiers: {x: 'width', y: 'height'}}, options));
		this.store('resizer', drag);
		return drag.addEvent('drag', function(){
			this.fireEvent('resize', drag);
		}.bind(this));
	}

});


/*
---

script: Drag.Move.js

description: A Drag extension that provides support for the constraining of draggables to containers and droppables.

license: MIT-style license

authors:
- Valerio Proietti
- Tom Occhinno
- Jan Kassens
- Aaron Newton
- Scott Kyle

requires:
- core:1.2.4/Element.Dimensions
- /Drag

provides: [Drag.Move]

...
*/

Drag.Move = new Class({

	Extends: Drag,

	options: {/*
		onEnter: $empty(thisElement, overed),
		onLeave: $empty(thisElement, overed),
		onDrop: $empty(thisElement, overed, event),*/
		droppables: [],
		container: false,
		precalculate: false,
		includeMargins: true,
		checkDroppables: true
	},

	initialize: function(element, options){
		this.parent(element, options);
		element = this.element;
		
		this.droppables = $$(this.options.droppables);
		this.container = document.id(this.options.container);
		
		if (this.container && $type(this.container) != 'element')
			this.container = document.id(this.container.getDocument().body);
		
		var styles = element.getStyles('left', 'top', 'position');
		if (styles.left == 'auto' || styles.top == 'auto')
			element.setPosition(element.getPosition(element.getOffsetParent()));
		
		if (styles.position == 'static')
			element.setStyle('position', 'absolute');

		this.addEvent('start', this.checkDroppables, true);

		this.overed = null;
	},

	start: function(event){
		if (this.container) this.options.limit = this.calculateLimit();
		
		if (this.options.precalculate){
			this.positions = this.droppables.map(function(el){
				return el.getCoordinates();
			});
		}
		
		this.parent(event);
	},
	
	calculateLimit: function(){
		var offsetParent = this.element.getOffsetParent(),
			containerCoordinates = this.container.getCoordinates(offsetParent),
			containerBorder = {},
			elementMargin = {},
			elementBorder = {},
			containerMargin = {},
			offsetParentPadding = {};

		['top', 'right', 'bottom', 'left'].each(function(pad){
			containerBorder[pad] = this.container.getStyle('border-' + pad).toInt();
			elementBorder[pad] = this.element.getStyle('border-' + pad).toInt();
			elementMargin[pad] = this.element.getStyle('margin-' + pad).toInt();
			containerMargin[pad] = this.container.getStyle('margin-' + pad).toInt();
			offsetParentPadding[pad] = offsetParent.getStyle('padding-' + pad).toInt();
		}, this);

		var width = this.element.offsetWidth + elementMargin.left + elementMargin.right,
			height = this.element.offsetHeight + elementMargin.top + elementMargin.bottom,
			left = 0,
			top = 0,
			right = containerCoordinates.right - containerBorder.right - width,
			bottom = containerCoordinates.bottom - containerBorder.bottom - height;

		if (this.options.includeMargins){
			left += elementMargin.left;
			top += elementMargin.top;
		} else {
			right += elementMargin.right;
			bottom += elementMargin.bottom;
		}
		
		if (this.element.getStyle('position') == 'relative'){
			var coords = this.element.getCoordinates(offsetParent);
			coords.left -= this.element.getStyle('left').toInt();
			coords.top -= this.element.getStyle('top').toInt();
			
			left += containerBorder.left - coords.left;
			top += containerBorder.top - coords.top;
			right += elementMargin.left - coords.left;
			bottom += elementMargin.top - coords.top;
			
			if (this.container != offsetParent){
				left += containerMargin.left + offsetParentPadding.left;
				top += (Browser.Engine.trident4 ? 0 : containerMargin.top) + offsetParentPadding.top;
			}
		} else {
			left -= elementMargin.left;
			top -= elementMargin.top;
			
			if (this.container == offsetParent){
				right -= containerBorder.left;
				bottom -= containerBorder.top;
			} else {
				left += containerCoordinates.left + containerBorder.left;
				top += containerCoordinates.top + containerBorder.top;
			}
		}
		
		return {
			x: [left, right],
			y: [top, bottom]
		};
	},

	checkAgainst: function(el, i){
		el = (this.positions) ? this.positions[i] : el.getCoordinates();
		var now = this.mouse.now;
		return (now.x > el.left && now.x < el.right && now.y < el.bottom && now.y > el.top);
	},

	checkDroppables: function(){
		var overed = this.droppables.filter(this.checkAgainst, this).getLast();
		if (this.overed != overed){
			if (this.overed) this.fireEvent('leave', [this.element, this.overed]);
			if (overed) this.fireEvent('enter', [this.element, overed]);
			this.overed = overed;
		}
	},

	drag: function(event){
		this.parent(event);
		if (this.options.checkDroppables && this.droppables.length) this.checkDroppables();
	},

	stop: function(event){
		this.checkDroppables();
		this.fireEvent('drop', [this.element, this.overed, event]);
		this.overed = null;
		return this.parent(event);
	}

});

Element.implement({

	makeDraggable: function(options){
		var drag = new Drag.Move(this, options);
		this.store('dragger', drag);
		return drag;
	}

});


/*
---

script: Slider.js

description: Class for creating horizontal and vertical slider controls.

license: MIT-style license

authors:
- Valerio Proietti

requires:
- core:1.2.4/Element.Dimensions
- /Class.Binds
- /Drag
- /Element.Dimensions
- /Element.Measure

provides: [Slider]

...
*/

var Slider = new Class({

	Implements: [Events, Options],

	Binds: ['clickedElement', 'draggedKnob', 'scrolledElement'],

	options: {/*
		onTick: $empty(intPosition),
		onChange: $empty(intStep),
		onComplete: $empty(strStep),*/
		onTick: function(position){
			if (this.options.snap) position = this.toPosition(this.step);
			this.knob.setStyle(this.property, position);
		},
		initialStep: 0,
		snap: false,
		offset: 0,
		range: false,
		wheel: false,
		steps: 100,
		mode: 'horizontal'
	},

	initialize: function(element, knob, options){
		this.setOptions(options);
		this.element = document.id(element);
		this.knob = document.id(knob);
		this.previousChange = this.previousEnd = this.step = -1;
		var offset, limit = {}, modifiers = {'x': false, 'y': false};
		switch (this.options.mode){
			case 'vertical':
				this.axis = 'y';
				this.property = 'top';
				offset = 'offsetHeight';
				break;
			case 'horizontal':
				this.axis = 'x';
				this.property = 'left';
				offset = 'offsetWidth';
		}
		
		this.full = this.element.measure(function(){ 
			this.half = this.knob[offset] / 2; 
			return this.element[offset] - this.knob[offset] + (this.options.offset * 2); 
		}.bind(this));
		
		this.min = $chk(this.options.range[0]) ? this.options.range[0] : 0;
		this.max = $chk(this.options.range[1]) ? this.options.range[1] : this.options.steps;
		this.range = this.max - this.min;
		this.steps = this.options.steps || this.full;
		this.stepSize = Math.abs(this.range) / this.steps;
		this.stepWidth = this.stepSize * this.full / Math.abs(this.range) ;

		this.knob.setStyle('position', 'relative').setStyle(this.property, this.options.initialStep ? this.toPosition(this.options.initialStep) : - this.options.offset);
		modifiers[this.axis] = this.property;
		limit[this.axis] = [- this.options.offset, this.full - this.options.offset];

		var dragOptions = {
			snap: 0,
			limit: limit,
			modifiers: modifiers,
			onDrag: this.draggedKnob,
			onStart: this.draggedKnob,
			onBeforeStart: (function(){
				this.isDragging = true;
			}).bind(this),
			onCancel: function() {
				this.isDragging = false;
			}.bind(this),
			onComplete: function(){
				this.isDragging = false;
				this.draggedKnob();
				this.end();
			}.bind(this)
		};
		if (this.options.snap){
			dragOptions.grid = Math.ceil(this.stepWidth);
			dragOptions.limit[this.axis][1] = this.full;
		}

		this.drag = new Drag(this.knob, dragOptions);
		this.attach();
	},

	attach: function(){
		this.element.addEvent('mousedown', this.clickedElement);
		if (this.options.wheel) this.element.addEvent('mousewheel', this.scrolledElement);
		this.drag.attach();
		return this;
	},

	detach: function(){
		this.element.removeEvent('mousedown', this.clickedElement);
		this.element.removeEvent('mousewheel', this.scrolledElement);
		this.drag.detach();
		return this;
	},

	set: function(step){
		if (!((this.range > 0) ^ (step < this.min))) step = this.min;
		if (!((this.range > 0) ^ (step > this.max))) step = this.max;

		this.step = Math.round(step);
		this.checkStep();
		this.fireEvent('tick', this.toPosition(this.step));
		this.end();
		return this;
	},

	clickedElement: function(event){
		if (this.isDragging || event.target == this.knob) return;

		var dir = this.range < 0 ? -1 : 1;
		var position = event.page[this.axis] - this.element.getPosition()[this.axis] - this.half;
		position = position.limit(-this.options.offset, this.full -this.options.offset);

		this.step = Math.round(this.min + dir * this.toStep(position));
		this.checkStep();
		this.fireEvent('tick', position);
		this.end();
	},

	scrolledElement: function(event){
		var mode = (this.options.mode == 'horizontal') ? (event.wheel < 0) : (event.wheel > 0);
		this.set(mode ? this.step - this.stepSize : this.step + this.stepSize);
		event.stop();
	},

	draggedKnob: function(){
		var dir = this.range < 0 ? -1 : 1;
		var position = this.drag.value.now[this.axis];
		position = position.limit(-this.options.offset, this.full -this.options.offset);
		this.step = Math.round(this.min + dir * this.toStep(position));
		this.checkStep();
	},

	checkStep: function(){
		if (this.previousChange != this.step){
			this.previousChange = this.step;
			this.fireEvent('change', this.step);
		}
	},

	end: function(){
		if (this.previousEnd !== this.step){
			this.previousEnd = this.step;
			this.fireEvent('complete', this.step + '');
		}
	},

	toStep: function(position){
		var step = (position + this.options.offset) * this.stepSize / this.full * this.steps;
		return this.options.steps ? Math.round(step -= step % this.stepSize) : step;
	},

	toPosition: function(step){
		return (this.full * Math.abs(this.min - step)) / (this.steps * this.stepSize) - this.options.offset;
	}

});

/*
---

script: Sortables.js

description: Class for creating a drag and drop sorting interface for lists of items.

license: MIT-style license

authors:
- Tom Occhino

requires:
- /Drag.Move

provides: [Slider]

...
*/

var Sortables = new Class({

	Implements: [Events, Options],

	options: {/*
		onSort: $empty(element, clone),
		onStart: $empty(element, clone),
		onComplete: $empty(element),*/
		snap: 4,
		opacity: 1,
		clone: false,
		revert: false,
		handle: false,
		constrain: false
	},

	initialize: function(lists, options){
		this.setOptions(options);
		this.elements = [];
		this.lists = [];
		this.idle = true;

		this.addLists($$(document.id(lists) || lists));
		if (!this.options.clone) this.options.revert = false;
		if (this.options.revert) this.effect = new Fx.Morph(null, $merge({duration: 250, link: 'cancel'}, this.options.revert));
	},

	attach: function(){
		this.addLists(this.lists);
		return this;
	},

	detach: function(){
		this.lists = this.removeLists(this.lists);
		return this;
	},

	addItems: function(){
		Array.flatten(arguments).each(function(element){
			this.elements.push(element);
			var start = element.retrieve('sortables:start', this.start.bindWithEvent(this, element));
			(this.options.handle ? element.getElement(this.options.handle) || element : element).addEvent('mousedown', start);
		}, this);
		return this;
	},

	addLists: function(){
		Array.flatten(arguments).each(function(list){
			this.lists.push(list);
			this.addItems(list.getChildren());
		}, this);
		return this;
	},

	removeItems: function(){
		return $$(Array.flatten(arguments).map(function(element){
			this.elements.erase(element);
			var start = element.retrieve('sortables:start');
			(this.options.handle ? element.getElement(this.options.handle) || element : element).removeEvent('mousedown', start);
			
			return element;
		}, this));
	},

	removeLists: function(){
		return $$(Array.flatten(arguments).map(function(list){
			this.lists.erase(list);
			this.removeItems(list.getChildren());
			
			return list;
		}, this));
	},

	getClone: function(event, element){
		if (!this.options.clone) return new Element('div').inject(document.body);
		if ($type(this.options.clone) == 'function') return this.options.clone.call(this, event, element, this.list);
		var clone = element.clone(true).setStyles({
			margin: '0px',
			position: 'absolute',
			visibility: 'hidden',
			'width': element.getStyle('width')
		});
		//prevent the duplicated radio inputs from unchecking the real one
		if (clone.get('html').test('radio')) {
			clone.getElements('input[type=radio]').each(function(input, i) {
				input.set('name', 'clone_' + i);
			});
		}
		
		return clone.inject(this.list).setPosition(element.getPosition(element.getOffsetParent()));
	},

	getDroppables: function(){
		var droppables = this.list.getChildren();
		if (!this.options.constrain) droppables = this.lists.concat(droppables).erase(this.list);
		return droppables.erase(this.clone).erase(this.element);
	},

	insert: function(dragging, element){
		var where = 'inside';
		if (this.lists.contains(element)){
			this.list = element;
			this.drag.droppables = this.getDroppables();
		} else {
			where = this.element.getAllPrevious().contains(element) ? 'before' : 'after';
		}
		this.element.inject(element, where);
		this.fireEvent('sort', [this.element, this.clone]);
	},

	start: function(event, element){
		if (!this.idle) return;
		this.idle = false;
		this.element = element;
		this.opacity = element.get('opacity');
		this.list = element.getParent();
		this.clone = this.getClone(event, element);

		this.drag = new Drag.Move(this.clone, {
			snap: this.options.snap,
			container: this.options.constrain && this.element.getParent(),
			droppables: this.getDroppables(),
			onSnap: function(){
				event.stop();
				this.clone.setStyle('visibility', 'visible');
				this.element.set('opacity', this.options.opacity || 0);
				this.fireEvent('start', [this.element, this.clone]);
			}.bind(this),
			onEnter: this.insert.bind(this),
			onCancel: this.reset.bind(this),
			onComplete: this.end.bind(this)
		});

		this.clone.inject(this.element, 'before');
		this.drag.start(event);
	},

	end: function(){
		this.drag.detach();
		this.element.set('opacity', this.opacity);
		if (this.effect){
			var dim = this.element.getStyles('width', 'height');
			var pos = this.clone.computePosition(this.element.getPosition(this.clone.offsetParent));
			this.effect.element = this.clone;
			this.effect.start({
				top: pos.top,
				left: pos.left,
				width: dim.width,
				height: dim.height,
				opacity: 0.25
			}).chain(this.reset.bind(this));
		} else {
			this.reset();
		}
	},

	reset: function(){
		this.idle = true;
		this.clone.destroy();
		this.fireEvent('complete', this.element);
	},

	serialize: function(){
		var params = Array.link(arguments, {modifier: Function.type, index: $defined});
		var serial = this.lists.map(function(list){
			return list.getChildren().map(params.modifier || function(element){
				return element.get('id');
			}, this);
		}, this);

		var index = params.index;
		if (this.lists.length == 1) index = 0;
		return $chk(index) && index >= 0 && index < this.lists.length ? serial[index] : serial;
	}

});


/*
---

script: Request.JSONP.js

description: Defines Request.JSONP, a class for cross domain javascript via script injection.

license: MIT-style license

authors:
- Aaron Newton
- Guillermo Rauch

requires:
- core:1.2.4/Element
- core:1.2.4/Request
- /Log

provides: [Request.JSONP]

...
*/

Request.JSONP = new Class({

	Implements: [Chain, Events, Options, Log],

	options: {/*
		onRetry: $empty(intRetries),
		onRequest: $empty(scriptElement),
		onComplete: $empty(data),
		onSuccess: $empty(data),
		onCancel: $empty(),
		log: false,
		*/
		url: '',
		data: {},
		retries: 0,
		timeout: 0,
		link: 'ignore',
		callbackKey: 'callback',
		injectScript: document.head
	},

	initialize: function(options){
		this.setOptions(options);
		if (this.options.log) this.enableLog();
		this.running = false;
		this.requests = 0;
		this.triesRemaining = [];
	},

	check: function(){
		if (!this.running) return true;
		switch (this.options.link){
			case 'cancel': this.cancel(); return true;
			case 'chain': this.chain(this.caller.bind(this, arguments)); return false;
		}
		return false;
	},

	send: function(options){
		if (!$chk(arguments[1]) && !this.check(options)) return this;

		var type = $type(options), 
				old = this.options, 
				index = $chk(arguments[1]) ? arguments[1] : this.requests++;
		if (type == 'string' || type == 'element') options = {data: options};

		options = $extend({data: old.data, url: old.url}, options);

		if (!$chk(this.triesRemaining[index])) this.triesRemaining[index] = this.options.retries;
		var remaining = this.triesRemaining[index];

		(function(){
			var script = this.getScript(options);
			this.log('JSONP retrieving script with url: ' + script.get('src'));
			this.fireEvent('request', script);
			this.running = true;

			(function(){
				if (remaining){
					this.triesRemaining[index] = remaining - 1;
					if (script){
						script.destroy();
						this.send(options, index).fireEvent('retry', this.triesRemaining[index]);
					}
				} else if(script && this.options.timeout){
					script.destroy();
					this.cancel().fireEvent('failure');
				}
			}).delay(this.options.timeout, this);
		}).delay(Browser.Engine.trident ? 50 : 0, this);
		return this;
	},

	cancel: function(){
		if (!this.running) return this;
		this.running = false;
		this.fireEvent('cancel');
		return this;
	},

	getScript: function(options){
		var index = Request.JSONP.counter,
				data;
		Request.JSONP.counter++;

		switch ($type(options.data)){
			case 'element': data = document.id(options.data).toQueryString(); break;
			case 'object': case 'hash': data = Hash.toQueryString(options.data);
		}

		var src = options.url + 
			 (options.url.test('\\?') ? '&' :'?') + 
			 (options.callbackKey || this.options.callbackKey) + 
			 '=Request.JSONP.request_map.request_'+ index + 
			 (data ? '&' + data : '');
		if (src.length > 2083) this.log('JSONP '+ src +' will fail in Internet Explorer, which enforces a 2083 bytes length limit on URIs');

		var script = new Element('script', {type: 'text/javascript', src: src});
		Request.JSONP.request_map['request_' + index] = function(){ this.success(arguments, script); }.bind(this);
		return script.inject(this.options.injectScript);
	},

	success: function(args, script){
		if (script) script.destroy();
		this.running = false;
		this.log('JSONP successfully retrieved: ', args);
		this.fireEvent('complete', args).fireEvent('success', args).callChain();
	}

});

Request.JSONP.counter = 0;
Request.JSONP.request_map = {};

/*
---

script: Request.Queue.js

description: Controls several instances of Request and its variants to run only one request at a time.

license: MIT-style license

authors:
- Aaron Newton

requires:
- core:1.2.4/Element
- core:1.2.4/Request
- /Log

provides: [Request.Queue]

...
*/

Request.Queue = new Class({

	Implements: [Options, Events],

	Binds: ['attach', 'request', 'complete', 'cancel', 'success', 'failure', 'exception'],

	options: {/*
		onRequest: $empty(argsPassedToOnRequest),
		onSuccess: $empty(argsPassedToOnSuccess),
		onComplete: $empty(argsPassedToOnComplete),
		onCancel: $empty(argsPassedToOnCancel),
		onException: $empty(argsPassedToOnException),
		onFailure: $empty(argsPassedToOnFailure),
		onEnd: $empty,
		*/
		stopOnFailure: true,
		autoAdvance: true,
		concurrent: 1,
		requests: {}
	},

	initialize: function(options){
		if(options){
			var requests = options.requests;
			delete options.requests;	
		}
		this.setOptions(options);
		this.requests = new Hash;
		this.queue = [];
		this.reqBinders = {};
		
		if(requests) this.addRequests(requests);
	},

	addRequest: function(name, request){
		this.requests.set(name, request);
		this.attach(name, request);
		return this;
	},

	addRequests: function(obj){
		$each(obj, function(req, name){
			this.addRequest(name, req);
		}, this);
		return this;
	},

	getName: function(req){
		return this.requests.keyOf(req);
	},

	attach: function(name, req){
		if (req._groupSend) return this;
		['request', 'complete', 'cancel', 'success', 'failure', 'exception'].each(function(evt){
			if(!this.reqBinders[name]) this.reqBinders[name] = {};
			this.reqBinders[name][evt] = function(){
				this['on' + evt.capitalize()].apply(this, [name, req].extend(arguments));
			}.bind(this);
			req.addEvent(evt, this.reqBinders[name][evt]);
		}, this);
		req._groupSend = req.send;
		req.send = function(options){
			this.send(name, options);
			return req;
		}.bind(this);
		return this;
	},

	removeRequest: function(req){
		var name = $type(req) == 'object' ? this.getName(req) : req;
		if (!name && $type(name) != 'string') return this;
		req = this.requests.get(name);
		if (!req) return this;
		['request', 'complete', 'cancel', 'success', 'failure', 'exception'].each(function(evt){
			req.removeEvent(evt, this.reqBinders[name][evt]);
		}, this);
		req.send = req._groupSend;
		delete req._groupSend;
		return this;
	},

	getRunning: function(){
		return this.requests.filter(function(r){
			return r.running;
		});
	},

	isRunning: function(){
		return !!(this.getRunning().getKeys().length);
	},

	send: function(name, options){
		var q = function(){
			this.requests.get(name)._groupSend(options);
			this.queue.erase(q);
		}.bind(this);
		q.name = name;
		if (this.getRunning().getKeys().length >= this.options.concurrent || (this.error && this.options.stopOnFailure)) this.queue.push(q);
		else q();
		return this;
	},

	hasNext: function(name){
		return (!name) ? !!this.queue.length : !!this.queue.filter(function(q){ return q.name == name; }).length;
	},

	resume: function(){
		this.error = false;
		(this.options.concurrent - this.getRunning().getKeys().length).times(this.runNext, this);
		return this;
	},

	runNext: function(name){
		if (!this.queue.length) return this;
		if (!name){
			this.queue[0]();
		} else {
			var found;
			this.queue.each(function(q){
				if (!found && q.name == name){
					found = true;
					q();
				}
			});
		}
		return this;
	},

	runAll: function() {
		this.queue.each(function(q) {
			q();
		});
		return this;
	},

	clear: function(name){
		if (!name){
			this.queue.empty();
		} else {
			this.queue = this.queue.map(function(q){
				if (q.name != name) return q;
				else return false;
			}).filter(function(q){ return q; });
		}
		return this;
	},

	cancel: function(name){
		this.requests.get(name).cancel();
		return this;
	},

	onRequest: function(){
		this.fireEvent('request', arguments);
	},

	onComplete: function(){
		this.fireEvent('complete', arguments);
		if (!this.queue.length) this.fireEvent('end');
	},

	onCancel: function(){
		if (this.options.autoAdvance && !this.error) this.runNext();
		this.fireEvent('cancel', arguments);
	},

	onSuccess: function(){
		if (this.options.autoAdvance && !this.error) this.runNext();
		this.fireEvent('success', arguments);
	},

	onFailure: function(){
		this.error = true;
		if (!this.options.stopOnFailure && this.options.autoAdvance) this.runNext();
		this.fireEvent('failure', arguments);
	},

	onException: function(){
		this.error = true;
		if (!this.options.stopOnFailure && this.options.autoAdvance) this.runNext();
		this.fireEvent('exception', arguments);
	}

});


/*
---

script: Request.Periodical.js

description: Requests the same URL to pull data from a server but increases the intervals if no data is returned to reduce the load

license: MIT-style license

authors:
- Christoph Pojer

requires:
- core:1.2.4/Request
- /MooTools.More

provides: [Request.Periodical]

...
*/

Request.implement({

	options: {
		initialDelay: 5000,
		delay: 5000,
		limit: 60000
	},

	startTimer: function(data){
		var fn = function(){
			if (!this.running) this.send({data: data});
		};
		this.timer = fn.delay(this.options.initialDelay, this);
		this.lastDelay = this.options.initialDelay;
		this.completeCheck = function(response){
			$clear(this.timer);
			this.lastDelay = (response) ? this.options.delay : (this.lastDelay + this.options.delay).min(this.options.limit);
			this.timer = fn.delay(this.lastDelay, this);
		};
		return this.addEvent('complete', this.completeCheck);
	},

	stopTimer: function(){
		$clear(this.timer);
		return this.removeEvent('complete', this.completeCheck);
	}

});

/*
---

script: Assets.js

description: Provides methods to dynamically load JavaScript, CSS, and Image files into the document.

license: MIT-style license

authors:
- Valerio Proietti

requires:
- core:1.2.4/Element.Event
- /MooTools.More

provides: [Assets]

...
*/

var Asset = {

	javascript: function(source, properties){
		properties = $extend({
			onload: $empty,
			document: document,
			check: $lambda(true)
		}, properties);
		
		if (properties.onLoad) properties.onload = properties.onLoad;
		
		var script = new Element('script', {src: source, type: 'text/javascript'});

		var load = properties.onload.bind(script), 
			check = properties.check, 
			doc = properties.document;
		delete properties.onload;
		delete properties.check;
		delete properties.document;

		script.addEvents({
			load: load,
			readystatechange: function(){
				if (['loaded', 'complete'].contains(this.readyState)) load();
			}
		}).set(properties);

		if (Browser.Engine.webkit419) var checker = (function(){
			if (!$try(check)) return;
			$clear(checker);
			load();
		}).periodical(50);

		return script.inject(doc.head);
	},

	css: function(source, properties){
		return new Element('link', $merge({
			rel: 'stylesheet',
			media: 'screen',
			type: 'text/css',
			href: source
		}, properties)).inject(document.head);
	},

	image: function(source, properties){
		properties = $merge({
			onload: $empty,
			onabort: $empty,
			onerror: $empty
		}, properties);
		var image = new Image();
		var element = document.id(image) || new Element('img');
		['load', 'abort', 'error'].each(function(name){
			var type = 'on' + name;
			var cap = name.capitalize();
			if (properties['on' + cap]) properties[type] = properties['on' + cap];
			var event = properties[type];
			delete properties[type];
			image[type] = function(){
				if (!image) return;
				if (!element.parentNode){
					element.width = image.width;
					element.height = image.height;
				}
				image = image.onload = image.onabort = image.onerror = null;
				event.delay(1, element, element);
				element.fireEvent(name, element, 1);
			};
		});
		image.src = element.src = source;
		if (image && image.complete) image.onload.delay(1);
		return element.set(properties);
	},

	images: function(sources, options){
		options = $merge({
			onComplete: $empty,
			onProgress: $empty,
			onError: $empty,
			properties: {}
		}, options);
		sources = $splat(sources);
		var images = [];
		var counter = 0;
		return new Elements(sources.map(function(source){
			return Asset.image(source, $extend(options.properties, {
				onload: function(){
					options.onProgress.call(this, counter, sources.indexOf(source));
					counter++;
					if (counter == sources.length) options.onComplete();
				},
				onerror: function(){
					options.onError.call(this, counter, sources.indexOf(source));
					counter++;
					if (counter == sources.length) options.onComplete();
				}
			}));
		}));
	}

};

/*
---

script: Color.js

description: Class for creating and manipulating colors in JavaScript. Supports HSB -> RGB Conversions and vice versa.

license: MIT-style license

authors:
- Valerio Proietti

requires:
- core:1.2.4/Array
- core:1.2.4/String
- core:1.2.4/Number
- core:1.2.4/Hash
- core:1.2.4/Function
- core:1.2.4/$util

provides: [Color]

...
*/

var Color = new Native({

	initialize: function(color, type){
		if (arguments.length >= 3){
			type = 'rgb'; color = Array.slice(arguments, 0, 3);
		} else if (typeof color == 'string'){
			if (color.match(/rgb/)) color = color.rgbToHex().hexToRgb(true);
			else if (color.match(/hsb/)) color = color.hsbToRgb();
			else color = color.hexToRgb(true);
		}
		type = type || 'rgb';
		switch (type){
			case 'hsb':
				var old = color;
				color = color.hsbToRgb();
				color.hsb = old;
			break;
			case 'hex': color = color.hexToRgb(true); break;
		}
		color.rgb = color.slice(0, 3);
		color.hsb = color.hsb || color.rgbToHsb();
		color.hex = color.rgbToHex();
		return $extend(color, this);
	}

});

Color.implement({

	mix: function(){
		var colors = Array.slice(arguments);
		var alpha = ($type(colors.getLast()) == 'number') ? colors.pop() : 50;
		var rgb = this.slice();
		colors.each(function(color){
			color = new Color(color);
			for (var i = 0; i < 3; i++) rgb[i] = Math.round((rgb[i] / 100 * (100 - alpha)) + (color[i] / 100 * alpha));
		});
		return new Color(rgb, 'rgb');
	},

	invert: function(){
		return new Color(this.map(function(value){
			return 255 - value;
		}));
	},

	setHue: function(value){
		return new Color([value, this.hsb[1], this.hsb[2]], 'hsb');
	},

	setSaturation: function(percent){
		return new Color([this.hsb[0], percent, this.hsb[2]], 'hsb');
	},

	setBrightness: function(percent){
		return new Color([this.hsb[0], this.hsb[1], percent], 'hsb');
	}

});

var $RGB = function(r, g, b){
	return new Color([r, g, b], 'rgb');
};

var $HSB = function(h, s, b){
	return new Color([h, s, b], 'hsb');
};

var $HEX = function(hex){
	return new Color(hex, 'hex');
};

Array.implement({

	rgbToHsb: function(){
		var red = this[0],
				green = this[1],
				blue = this[2],
				hue = 0;
		var max = Math.max(red, green, blue),
				min = Math.min(red, green, blue);
		var delta = max - min;
		var brightness = max / 255,
				saturation = (max != 0) ? delta / max : 0;
		if(saturation != 0) {
			var rr = (max - red) / delta;
			var gr = (max - green) / delta;
			var br = (max - blue) / delta;
			if (red == max) hue = br - gr;
			else if (green == max) hue = 2 + rr - br;
			else hue = 4 + gr - rr;
			hue /= 6;
			if (hue < 0) hue++;
		}
		return [Math.round(hue * 360), Math.round(saturation * 100), Math.round(brightness * 100)];
	},

	hsbToRgb: function(){
		var br = Math.round(this[2] / 100 * 255);
		if (this[1] == 0){
			return [br, br, br];
		} else {
			var hue = this[0] % 360;
			var f = hue % 60;
			var p = Math.round((this[2] * (100 - this[1])) / 10000 * 255);
			var q = Math.round((this[2] * (6000 - this[1] * f)) / 600000 * 255);
			var t = Math.round((this[2] * (6000 - this[1] * (60 - f))) / 600000 * 255);
			switch (Math.floor(hue / 60)){
				case 0: return [br, t, p];
				case 1: return [q, br, p];
				case 2: return [p, br, t];
				case 3: return [p, q, br];
				case 4: return [t, p, br];
				case 5: return [br, p, q];
			}
		}
		return false;
	}

});

String.implement({

	rgbToHsb: function(){
		var rgb = this.match(/\d{1,3}/g);
		return (rgb) ? rgb.rgbToHsb() : null;
	},

	hsbToRgb: function(){
		var hsb = this.match(/\d{1,3}/g);
		return (hsb) ? hsb.hsbToRgb() : null;
	}

});


/*
---

script: Group.js

description: Class for monitoring collections of events

license: MIT-style license

authors:
- Valerio Proietti

requires:
- core:1.2.4/Events
- /MooTools.More

provides: [Group]

...
*/

var Group = new Class({

	initialize: function(){
		this.instances = Array.flatten(arguments);
		this.events = {};
		this.checker = {};
	},

	addEvent: function(type, fn){
		this.checker[type] = this.checker[type] || {};
		this.events[type] = this.events[type] || [];
		if (this.events[type].contains(fn)) return false;
		else this.events[type].push(fn);
		this.instances.each(function(instance, i){
			instance.addEvent(type, this.check.bind(this, [type, instance, i]));
		}, this);
		return this;
	},

	check: function(type, instance, i){
		this.checker[type][i] = true;
		var every = this.instances.every(function(current, j){
			return this.checker[type][j] || false;
		}, this);
		if (!every) return;
		this.checker[type] = {};
		this.events[type].each(function(event){
			event.call(this, this.instances, instance);
		}, this);
	}

});


/*
---

script: Hash.Cookie.js

description: Class for creating, reading, and deleting Cookies in JSON format.

license: MIT-style license

authors:
- Valerio Proietti
- Aaron Newton

requires:
- core:1.2.4/Cookie
- core:1.2.4/JSON
- /MooTools.More

provides: [Hash.Cookie]

...
*/

Hash.Cookie = new Class({

	Extends: Cookie,

	options: {
		autoSave: true
	},

	initialize: function(name, options){
		this.parent(name, options);
		this.load();
	},

	save: function(){
		var value = JSON.encode(this.hash);
		if (!value || value.length > 4096) return false; //cookie would be truncated!
		if (value == '{}') this.dispose();
		else this.write(value);
		return true;
	},

	load: function(){
		this.hash = new Hash(JSON.decode(this.read(), true));
		return this;
	}

});

Hash.each(Hash.prototype, function(method, name){
	if (typeof method == 'function') Hash.Cookie.implement(name, function(){
		var value = method.apply(this.hash, arguments);
		if (this.options.autoSave) this.save();
		return value;
	});
});

/*
---

script: IframeShim.js

description: Defines IframeShim, a class for obscuring select lists and flash objects in IE.

license: MIT-style license

authors:
- Aaron Newton

requires:
- core:1.2.4/Element.Event
- core:1.2.4/Element.Style
- core:1.2.4/Options Events
- /Element.Position
- /Class.Occlude

provides: [IframeShim]

...
*/

var IframeShim = new Class({

	Implements: [Options, Events, Class.Occlude],

	options: {
		className: 'iframeShim',
		src: 'javascript:false;document.write("");',
		display: false,
		zIndex: null,
		margin: 0,
		offset: {x: 0, y: 0},
		browsers: (Browser.Engine.trident4 || (Browser.Engine.gecko && !Browser.Engine.gecko19 && Browser.Platform.mac))
	},

	property: 'IframeShim',

	initialize: function(element, options){
		this.element = document.id(element);
		if (this.occlude()) return this.occluded;
		this.setOptions(options);
		this.makeShim();
		return this;
	},

	makeShim: function(){
		if(this.options.browsers){
			var zIndex = this.element.getStyle('zIndex').toInt();

			if (!zIndex){
				zIndex = 1;
				var pos = this.element.getStyle('position');
				if (pos == 'static' || !pos) this.element.setStyle('position', 'relative');
				this.element.setStyle('zIndex', zIndex);
			}
			zIndex = ($chk(this.options.zIndex) && zIndex > this.options.zIndex) ? this.options.zIndex : zIndex - 1;
			if (zIndex < 0) zIndex = 1;
			this.shim = new Element('iframe', {
				src: this.options.src,
				scrolling: 'no',
				frameborder: 0,
				styles: {
					zIndex: zIndex,
					position: 'absolute',
					border: 'none',
					filter: 'progid:DXImageTransform.Microsoft.Alpha(style=0,opacity=0)'
				},
				'class': this.options.className
			}).store('IframeShim', this);
			var inject = (function(){
				this.shim.inject(this.element, 'after');
				this[this.options.display ? 'show' : 'hide']();
				this.fireEvent('inject');
			}).bind(this);
			if (!IframeShim.ready) window.addEvent('load', inject);
			else inject();
		} else {
			this.position = this.hide = this.show = this.dispose = $lambda(this);
		}
	},

	position: function(){
		if (!IframeShim.ready || !this.shim) return this;
		var size = this.element.measure(function(){ 
			return this.getSize(); 
		});
		if (this.options.margin != undefined){
			size.x = size.x - (this.options.margin * 2);
			size.y = size.y - (this.options.margin * 2);
			this.options.offset.x += this.options.margin;
			this.options.offset.y += this.options.margin;
		}
		this.shim.set({width: size.x, height: size.y}).position({
			relativeTo: this.element,
			offset: this.options.offset
		});
		return this;
	},

	hide: function(){
		if (this.shim) this.shim.setStyle('display', 'none');
		return this;
	},

	show: function(){
		if (this.shim) this.shim.setStyle('display', 'block');
		return this.position();
	},

	dispose: function(){
		if (this.shim) this.shim.dispose();
		return this;
	},

	destroy: function(){
		if (this.shim) this.shim.destroy();
		return this;
	}

});

window.addEvent('load', function(){
	IframeShim.ready = true;
});

/*
---

script: HtmlTable.js

description: Builds table elements with methods to add rows.

license: MIT-style license

authors:
- Aaron Newton

requires:
- core:1.2.4/Options
- core:1.2.4/Events
- /Class.Occlude

provides: [HtmlTable]

...
*/

var HtmlTable = new Class({

	Implements: [Options, Events, Class.Occlude],

	options: {
		properties: {
			cellpadding: 0,
			cellspacing: 0,
			border: 0
		},
		rows: [],
		headers: [],
		footers: []
	},

	property: 'HtmlTable',

	initialize: function(){
		var params = Array.link(arguments, {options: Object.type, table: Element.type});
		this.setOptions(params.options);
		this.element = params.table || new Element('table', this.options.properties);
		if (this.occlude()) return this.occluded;
		this.build();
	},

	build: function(){
		this.element.store('HtmlTable', this);

		this.body = document.id(this.element.tBodies[0]) || new Element('tbody').inject(this.element);
		$$(this.body.rows);

		if (this.options.headers.length) this.setHeaders(this.options.headers);
		else this.thead = document.id(this.element.tHead);
		if (this.thead) this.head = document.id(this.thead.rows[0]);

		if (this.options.footers.length) this.setFooters(this.options.footers);
		this.tfoot = document.id(this.element.tFoot);
		if (this.tfoot) this.foot = document.id(this.thead.rows[0]);

		this.options.rows.each(function(row){
			this.push(row);
		}, this);

		['adopt', 'inject', 'wraps', 'grab', 'replaces', 'dispose'].each(function(method){
				this[method] = this.element[method].bind(this.element);
		}, this);
	},

	toElement: function(){
		return this.element;
	},

	empty: function(){
		this.body.empty();
		return this;
	},

	set: function(what, items) {
		var target = (what == 'headers') ? 'tHead' : 'tFoot';
		this[target.toLowerCase()] = (document.id(this.element[target]) || new Element(target.toLowerCase()).inject(this.element, 'top')).empty();
		var data = this.push(items, {}, this[target.toLowerCase()], what == 'headers' ? 'th' : 'td');
		if (what == 'headers') this.head = document.id(this.thead.rows[0]);
		else this.foot = document.id(this.thead.rows[0]);
		return data;
	},

	setHeaders: function(headers){
		this.set('headers', headers);
		return this;
	},

	setFooters: function(footers){
		this.set('footers', footers);
		return this;
	},

	push: function(row, rowProperties, target, tag){
		var tds = row.map(function(data){
			var td = new Element(tag || 'td', data.properties),
				type = data.content || data || '',
				element = document.id(type);
			if($type(type) != 'string' && element) td.adopt(element);
			else td.set('html', type);

			return td;
		});

		return {
			tr: new Element('tr', rowProperties).inject(target || this.body).adopt(tds),
			tds: tds
		};
	}

});


/*
---

script: HtmlTable.Zebra.js

description: Builds a stripy table with methods to add rows.

license: MIT-style license

authors:
- Harald Kirschner
- Aaron Newton

requires:
- /HtmlTable
- /Class.refactor

provides: [HtmlTable.Zebra]

...
*/

HtmlTable = Class.refactor(HtmlTable, {

	options: {
		classZebra: 'table-tr-odd',
		zebra: true
	},

	initialize: function(){
		this.previous.apply(this, arguments);
		if (this.occluded) return this.occluded;
		if (this.options.zebra) this.updateZebras();
	},

	updateZebras: function(){
		Array.each(this.body.rows, this.zebra, this);
	},

	zebra: function(row, i){
		return row[((i % 2) ? 'remove' : 'add')+'Class'](this.options.classZebra);
	},

	push: function(){
		var pushed = this.previous.apply(this, arguments);
		if (this.options.zebra) this.updateZebras();
		return pushed;
	}

});

/*
---

script: HtmlTable.Sort.js

description: Builds a stripy, sortable table with methods to add rows.

license: MIT-style license

authors:
- Harald Kirschner
- Aaron Newton

requires:
- core:1.2.4/Hash
- /HtmlTable
- /Class.refactor
- /Element.Delegation
- /Date

provides: [HtmlTable.Sort]

...
*/

HtmlTable = Class.refactor(HtmlTable, {

	options: {/*
		onSort: $empty, */
		sortIndex: 0,
		sortReverse: false,
		parsers: [],
		defaultParser: 'string',
		classSortable: 'table-sortable',
		classHeadSort: 'table-th-sort',
		classHeadSortRev: 'table-th-sort-rev',
		classNoSort: 'table-th-nosort',
		classGroupHead: 'table-tr-group-head',
		classGroup: 'table-tr-group',
		classCellSort: 'table-td-sort',
		classSortSpan: 'table-th-sort-span',
		sortable: false
	},

	initialize: function () {
		this.previous.apply(this, arguments);
		if (this.occluded) return this.occluded;
		this.sorted = {index: null, dir: 1};
		this.bound = {
			headClick: this.headClick.bind(this)
		};
		this.sortSpans = new Elements();
		if (this.options.sortable) {
			this.enableSort();
			if (this.options.sortIndex != null) this.sort(this.options.sortIndex, this.options.sortReverse);
		}
	},

	attachSorts: function(attach){
		this.element.removeEvents('click:relay(th)');
		//TODO - bug in mootools?
		this.bound = {
			headClick: this.headClick.bind(this)
		};
		//end changes
		this.element[$pick(attach, true) ? 'addEvent' : 'removeEvent']('click:relay(th)', this.bound.headClick);
	},

	setHeaders: function(){
		this.previous.apply(this, arguments);
		if (this.sortEnabled) this.detectParsers();
	},
	
	detectParsers: function(force){
		if (!this.head) return;
		var parsers = this.options.parsers, 
				rows = this.body.rows;

		// auto-detect
		this.parsers = $$(this.head.cells).map(function(cell, index) {
			if (!force && (cell.hasClass(this.options.classNoSort) || cell.retrieve('htmltable-parser'))) return cell.retrieve('htmltable-parser');
			var thDiv = new Element('div');
			$each(cell.childNodes, function(node) {
				thDiv.adopt(node);
			});
			thDiv.inject(cell);
			var sortSpan = new Element('span', {'html': '&#160;', 'class': this.options.classSortSpan}).inject(thDiv, 'top');
			
			this.sortSpans.push(sortSpan);

			var parser = parsers[index], 
					cancel;
			switch ($type(parser)) {
				case 'function': parser = {convert: parser}; cancel = true; break;
				case 'string': parser = parser; cancel = true; break;
			}
			if (!cancel) {
				HtmlTable.Parsers.some(function(current) {
					var match = current.match;
					if (!match) return false;
					for (var i = 0, j = rows.length; i < j; i++) {
						var text = $(rows[i].cells[index]).get('html').clean();
						if (text && match.test(text)) {
							parser = current;
							return true;
						}
					}
				});
			}

			if (!parser) parser = this.options.defaultParser;
			cell.store('htmltable-parser', parser);
			return parser;
		}, this);
	},

	headClick: function(event, el) {
		if (!this.head || el.hasClass(this.options.classNoSort)) return;
		var index = Array.indexOf(this.head.cells, el);
		this.sort(index);
		return false;
	},

	sort: function(index, reverse, pre) {
		if (!this.head) return;
		pre = !!(pre);
		var classCellSort = this.options.classCellSort;
		var classGroup = this.options.classGroup, 
				classGroupHead = this.options.classGroupHead;

		if (!pre) {
			if (index != null) {
				if (this.sorted.index == index) {
					this.sorted.reverse = !(this.sorted.reverse);
				} else {
					if (this.sorted.index != null) {
						this.sorted.reverse = false;
						this.head.cells[this.sorted.index].removeClass(this.options.classHeadSort).removeClass(this.options.classHeadSortRev);
					} else {
						this.sorted.reverse = true;
					}
					this.sorted.index = index;
				}
			} else {
				index = this.sorted.index;
			}

			if (reverse != null) this.sorted.reverse = reverse;

			var head = document.id(this.head.cells[index]);
			if (head) {
				head.addClass(this.options.classHeadSort);
				if (this.sorted.reverse) head.addClass(this.options.classHeadSortRev);
				else head.removeClass(this.options.classHeadSortRev);
			}

			this.body.getElements('td').removeClass(this.options.classCellSort);
		}

		var parser = this.parsers[index];
		if ($type(parser) == 'string') parser = HtmlTable.Parsers.get(parser);
		if (!parser) return;

		if (!Browser.Engine.trident) {
			var rel = this.body.getParent();
			this.body.dispose();
		}

		var data = Array.map(this.body.rows, function(row, i) {
			var value = parser.convert.call(document.id(row.cells[index]));

			return {
				position: i,
				value: value,
				toString:  function() {
					return value.toString();
				},
j:row.cells[0].get('text')
			};
		}, this);
		//TODO need this to provide a more stable sorting
		if (this.sorted.reverse)
			data.reverse(true);

		data.sort(function(a, b){
			if (a.value === b.value) return 0;
			return a.value > b.value ? 1 : -1;
		});

		if (!this.sorted.reverse) data.reverse(true);

		var i = data.length, body = this.body;
		var j, position, entry, group;

		while (i) {
			var item = data[--i];
			position = item.position;
			var row = body.rows[position];
			if (row.disabled) continue;

			if (!pre) {
				if (group === item.value) {
					row.removeClass(classGroupHead).addClass(classGroup);
				} else {
					group = item.value;
					row.removeClass(classGroup).addClass(classGroupHead);
				}
				if (this.zebra) this.zebra(row, i);

				row.cells[index].addClass(classCellSort);
			}

			body.appendChild(row);
			for (j = 0; j < i; j++) {
				if (data[j].position > position) data[j].position--;
			}
		};
		data = null;
		if (rel) rel.grab(body);

		return this.fireEvent('sort', [body, index]);
	},

	reSort: function(){
		if (this.sortEnabled) this.sort.call(this, this.sorted.index, this.sorted.reverse);
		return this;
	},

	enableSort: function(){
		this.element.addClass(this.options.classSortable);
		this.attachSorts(true);
		this.detectParsers();
		this.sortEnabled = true;
		return this;
	},

	disableSort: function(){
		this.element.removeClass(this.options.classSortable);
		this.attachSorts(false);
		this.sortSpans.each(function(span) { span.destroy(); });
		this.sortSpans.empty();
		this.sortEnabled = false;
		return this;
	}

});

HtmlTable.Parsers = new Hash({

	'date': {
		match: /^\d{2}[-\/ ]\d{2}[-\/ ]\d{2,4}$/,
		convert: function() {
			return Date.parse(this.get('text')).format('db');
		},
		type: 'date'
	},
	'input-checked': {
		match: / type="(radio|checkbox)" /,
		convert: function() {
			return this.getElement('input').checked;
		}
	},
	'input-value': {
		match: /<input/,
		convert: function() {
			return this.getElement('input').value;
		}
	},
	'number': {
		match: /^\d+[^\d.,]*$/,
		convert: function() {
			return this.get('text').toInt();
		},
		number: true
	},
	'numberLax': {
		match: /^[^\d]+\d+$/,
		convert: function() {
			return this.get('text').replace(/[^-?^0-9]/, '').toInt();
		},
		number: true
	},
	'float': {
		match: /^[\d]+\.[\d]+/,
		convert: function() {
			return this.get('text').replace(/[^-?^\d.]/, '').toFloat();
		},
		number: true
	},
	'floatLax': {
		match: /^[^\d]+[\d]+\.[\d]+$/,
		convert: function() {
			return this.get('text').replace(/[^-?^\d.]/, '');
		},
		number: true
	},
	'string': {
		match: null,
		convert: function() {
			return this.get('text');
		}
	},
	'title': {
		match: null,
		convert: function() {
			return this.title;
		}
	}

});



/*
---

script: HtmlTable.Select.js

description: Builds a stripy, sortable table with methods to add rows. Rows can be selected with the mouse or keyboard navigation.

license: MIT-style license

authors:
- Harald Kirschner
- Aaron Newton

requires:
- /Keyboard
- /HtmlTable
- /Class.refactor
- /Element.Delegation

provides: [HtmlTable.Select]

...
*/

HtmlTable = Class.refactor(HtmlTable, {

	options: {
		/*onRowFocus: $empty,
		onRowUnfocus: $empty,*/
		useKeyboard: true,
		classRowSelected: 'table-tr-selected',
		classRowHovered: 'table-tr-hovered',
		classSelectable: 'table-selectable',
		allowMultiSelect: true,
		selectable: false
	},

	initialize: function(){
		this.previous.apply(this, arguments);
		if (this.occluded) return this.occluded;
		this.selectedRows = new Elements();
		this.bound = {
			mouseleave: this.mouseleave.bind(this),
			focusRow: this.focusRow.bind(this)
		};
		if (this.options.selectable) this.enableSelect();
	},

	enableSelect: function(){
		this.selectEnabled = true;
		this.attachSelects();
		this.element.addClass(this.options.classSelectable);
	},

	disableSelect: function(){
		this.selectEnabled = false;
		this.attach(false);
		this.element.removeClass(this.options.classSelectable);
	},

	attachSelects: function(attach){
		attach = $pick(attach, true);
		var method = attach ? 'addEvents' : 'removeEvents';
		this.element[method]({
			mouseleave: this.bound.mouseleave
		});
		this.body[method]({
			'click:relay(tr)': this.bound.focusRow
		});
		if (this.options.useKeyboard || this.keyboard){
			if (!this.keyboard) this.keyboard = new Keyboard({
				events: {
					down: function(e) {
						e.preventDefault();
						this.shiftFocus(1);
					}.bind(this),
					up: function(e) {
						e.preventDefault();
						this.shiftFocus(-1);
					}.bind(this),
					enter: function(e) {
						e.preventDefault();
						if (this.hover) this.focusRow(this.hover);
					}.bind(this)
				},
				active: true
			});
			this.keyboard[attach ? 'activate' : 'deactivate']();
		}
		this.updateSelects();
	},

	mouseleave: function(){
		if (this.hover) this.leaveRow(this.hover);
	},

	focus: function(){
		if (this.keyboard) this.keyboard.activate();
	},

	blur: function(){
		if (this.keyboard) this.keyboard.deactivate();
	},

	push: function(){
		var ret = this.previous.apply(this, arguments);
		this.updateSelects();
		return ret;
	},

	updateSelects: function(){
		Array.each(this.body.rows, function(row){
			var binders = row.retrieve('binders');
			if ((binders && this.selectEnabled) || (!binders && !this.selectEnabled)) return;
			if (!binders){
				binders = {
					mouseenter: this.enterRow.bind(this, [row]),
					mouseleave: this.leaveRow.bind(this, [row])
				};
				row.store('binders', binders).addEvents(binders);
			} else {
				row.removeEvents(binders);
			}
		}, this);
	},

	enterRow: function(row){
		if (this.hover) this.hover = this.leaveRow(this.hover);
		this.hover = row.addClass(this.options.classRowHovered);
	},

	shiftFocus: function(offset){
		if (!this.hover) return this.enterRow(this.body.rows[0]);
		var to = Array.indexOf(this.body.rows, this.hover) + offset;
		if (to < 0) to = 0;
		if (to >= this.body.rows.length) to = this.body.rows.length - 1;
		if (this.hover == this.body.rows[to]) return this;
		this.enterRow(this.body.rows[to]);
	},

	leaveRow: function(row){
		row.removeClass(this.options.classRowHovered);
	},

	focusRow: function(){
		var row = arguments[1] || arguments[0]; //delegation passes the event first
		if (!this.body.getChildren().contains(row)) return;
		var unfocus = function(row){
			this.selectedRows.erase(row);
			row.removeClass(this.options.classRowSelected);
			this.fireEvent('rowUnfocus', [row, this.selectedRows]);
		}.bind(this);
		if (!this.options.allowMultiSelect) this.selectedRows.each(unfocus);
		if (!this.selectedRows.contains(row)) {
			this.selectedRows.push(row);
			row.addClass(this.options.classRowSelected);
			this.fireEvent('rowFocus', [row, this.selectedRows]);
		} else {
			unfocus(row);
		}
		return false;
	},

	selectAll: function(status){
		status = $pick(status, true);
		if (!this.options.allowMultiSelect && status) return;
		if (!status) this.selectedRows.removeClass(this.options.classRowSelected).empty();
		else this.selectedRows.combine(this.body.rows).addClass(this.options.classRowSelected);
		return this;
	},

	selectNone: function(){
		return this.selectAll(false);
	}

});


/*
---

script: Keyboard.js

description: KeyboardEvents used to intercept events on a class for keyboard and format modifiers in a specific order so as to make alt+shift+c the same as shift+alt+c.

license: MIT-style license

authors:
- Perrin Westrich
- Aaron Newton
- Scott Kyle

requires:
- core:1.2.4/Events
- core:1.2.4/Options
- core:1.2.4/Element.Event
- /Log

provides: [Keyboard]

...
*/

(function(){
	
	var Keyboard = this.Keyboard = new Class({

		Extends: Events,

		Implements: [Options, Log],

		options: {
			/*
			onActivate: $empty,
			onDeactivate: $empty,
			*/
			defaultEventType: 'keydown',
			active: false,
			events: {},
			nonParsedEvents: ['activate', 'deactivate', 'onactivate', 'ondeactivate', 'changed', 'onchanged']
		},

		initialize: function(options){
			this.setOptions(options);
			this.setup();
		}, 
		setup: function(){
			this.addEvents(this.options.events);
			//if this is the root manager, nothing manages it
			if (Keyboard.manager && !this.manager) Keyboard.manager.manage(this);
			if (this.options.active) this.activate();
		},

		handle: function(event, type){
			//Keyboard.stop(event) prevents key propagation
			if (event.preventKeyboardPropagation) return;
			
			var bubbles = !!this.manager;
			if (bubbles && this.activeKB){
				this.activeKB.handle(event, type);
				if (event.preventKeyboardPropagation) return;
			}
			this.fireEvent(type, event);
			
			if (!bubbles && this.activeKB) this.activeKB.handle(event, type);
		},

		addEvent: function(type, fn, internal){
			return this.parent(Keyboard.parse(type, this.options.defaultEventType, this.options.nonParsedEvents), fn, internal);
		},

		removeEvent: function(type, fn){
			return this.parent(Keyboard.parse(type, this.options.defaultEventType, this.options.nonParsedEvents), fn);
		},

		toggleActive: function(){
			return this[this.active ? 'deactivate' : 'activate']();
		},

		activate: function(instance){
			if (instance) {
				//if we're stealing focus, store the last keyboard to have it so the relenquish command works
				if (instance != this.activeKB) this.previous = this.activeKB;
				//if we're enabling a child, assign it so that events are now passed to it
				this.activeKB = instance.fireEvent('activate');
				Keyboard.manager.fireEvent('changed');
			} else if (this.manager) {
				//else we're enabling ourselves, we must ask our parent to do it for us
				this.manager.activate(this);
			}
			return this;
		},

		deactivate: function(instance){
			if (instance) {
				if(instance === this.activeKB) {
					this.activeKB = null;
					instance.fireEvent('deactivate');
					Keyboard.manager.fireEvent('changed');
				}
			}
			else if (this.manager) {
				this.manager.deactivate(this);
			}
			return this;
		},

		relenquish: function(){
			if (this.previous) this.activate(this.previous);
		},

		//management logic
		manage: function(instance){
			if (instance.manager) instance.manager.drop(instance);
			this.instances.push(instance);
			instance.manager = this;
			if (!this.activeKB) this.activate(instance);
			else this._disable(instance);
		},

		_disable: function(instance){
			if (this.activeKB == instance) this.activeKB = null;
		},

		drop: function(instance){
			this._disable(instance);
			this.instances.erase(instance);
		},

		instances: [],

		trace: function(){
			Keyboard.trace(this);
		},

		each: function(fn){
			Keyboard.each(this, fn);
		}

	});
	
	var parsed = {};
	var modifiers = ['shift', 'control', 'alt', 'meta'];
	var regex = /^(?:shift|control|ctrl|alt|meta)$/;
	
	Keyboard.parse = function(type, eventType, ignore){
		if (ignore && ignore.contains(type.toLowerCase())) return type;
		
		type = type.toLowerCase().replace(/^(keyup|keydown):/, function($0, $1){
			eventType = $1;
			return '';
		});

		if (!parsed[type]){
			var key, mods = {};
			type.split('+').each(function(part){
				if (regex.test(part)) mods[part] = true;
				else key = part;
			});

			mods.control = mods.control || mods.ctrl; // allow both control and ctrl
			
			var keys = [];
			modifiers.each(function(mod){
				if (mods[mod]) keys.push(mod);
			});
			
			if (key) keys.push(key);
			parsed[type] = keys.join('+');
		}

		return eventType + ':' + parsed[type];
	};

	Keyboard.each = function(keyboard, fn){
		var current = keyboard || Keyboard.manager;
		while (current){
			fn.run(current);
			current = current.activeKB;
		}
	};

	Keyboard.stop = function(event){
		event.preventKeyboardPropagation = true;
	};

	Keyboard.manager = new Keyboard({
		active: true
	});
	
	Keyboard.trace = function(keyboard){
		keyboard = keyboard || Keyboard.manager;
		keyboard.enableLog();
		keyboard.log('the following items have focus: ');
		Keyboard.each(keyboard, function(current){
			keyboard.log(document.id(current.widget) || current.wiget || current);
		});
	};
	
	var keys = new Hash();
	var handler = function(event){
		/*
		var keys = [];
		modifiers.each(function(mod){
			if (event[mod]) keys.push(mod);
		});
		
		if (!regex.test(event.key)) keys.push(event.key);

		Keyboard.manager.handle(event, event.type + ':' + keys.join('+'));
		*/
		
		modifiers.each(function(mod){
			if(event[mod]) {
				keys[mod] = true;
			}
		});
		if(event.type == 'keyup') {
			delete keys[event.key];
		} else if(event.type == 'keydown') {
			keys[event.key] = true;
		} else {
			alert("fooo"); //TODO - proper error handling
		}
        if(event.key == 'esc') {
            keys.empty();
        }
		Keyboard.manager.handle(event, event.type + ':' + keys.getKeys().join('+'));
	};
	
	document.addEvents({
		'keyup': handler,
		'keydown': handler
	});
	window.addEvent('blur', function(e) {
		// This lets us deal with someone holding down a key when they switch tabs
        keys.empty();
	});
	window.addEvent('click', function(e) {
        keys.empty();
	});

	Event.Keys.extend({
		'shift': 16,
		'control': 17,
		'alt': 18,
		'capslock': 20,
		'pageup': 33,
		'pagedown': 34,
		'end': 35,
		'home': 36,
		'numlock': 144,
		'scrolllock': 145,
		';': 186,
		'=': 187,
		',': 188,
		'-': Browser.Engine.Gecko ? 109 : 189,
		'.': 190,
		'/': 191,
		'`': 192,
		'[': 219,
		'\\': 220,
		']': 221,
		"'": 222
	});

})();


/*
---

script: Keyboard.js

description: Enhances Keyboard by adding the ability to name and describe keyboard shortcuts, and the ability to grab shortcuts by name and bind the shortcut to different keys.

license: MIT-style license

authors:
- Perrin Westrich

requires:
- core:1.2.4/Function
- /Keyboard.Extras

provides: [Keyboard.Extras]

...
*/
Keyboard.prototype.options.nonParsedEvents.combine(['rebound', 'onrebound']);

Keyboard.implement({

	/*
		shortcut should be in the format of:
		{
			'keys': 'shift+s', // the default to add as an event.
			'description': 'blah blah blah', // a brief description of the functionality.
			'handler': function(){} // the event handler to run when keys are pressed.
		}
	*/
	addShortcut: function(name, shortcut) {
		this.shortcuts = this.shortcuts || [];
		this.shortcutIndex = this.shortcutIndex || {};
		
		shortcut.getKeyboard = $lambda(this);
		shortcut.name = name;
		this.shortcutIndex[name] = shortcut;
		this.shortcuts.push(shortcut);
		if(shortcut.keys) this.addEvent(shortcut.keys, shortcut.handler);
		return this;
	},

	addShortcuts: function(obj){
		for(var name in obj) this.addShortcut(name, obj[name]);
		return this;
	},

	getShortcuts: function(){
		return this.shortcuts || [];
	},

	getShortcut: function(name){
		return (this.shortcutIndex || {})[name];
	}

});

Keyboard.rebind = function(newKeys, shortcuts){
	$splat(shortcuts).each(function(shortcut){
		shortcut.getKeyboard().removeEvent(shortcut.keys, shortcut.handler);
		shortcut.getKeyboard().addEvent(newKeys, shortcut.handler);
		shortcut.keys = newKeys;
		shortcut.getKeyboard().fireEvent('rebound');
	});
};


Keyboard.getActiveShortcuts = function(keyboard) {
	var activeKBS = [], activeSCS = [];
	Keyboard.each(keyboard, [].push.bind(activeKBS));
	activeKBS.each(function(kb){ activeSCS.extend(kb.getShortcuts()); });
	return activeSCS;
};

Keyboard.getShortcut = function(name, keyboard, opts){
	opts = opts || {};
	var shortcuts = opts.many ? [] : null,
		set = opts.many ? function(kb){
				var shortcut = kb.getShortcut(name);
				if(shortcut) shortcuts.push(shortcut);
			} : function(kb) { 
				if(!shortcuts) shortcuts = kb.getShortcut(name);
			};
	Keyboard.each(keyboard, set);
	return shortcuts;
};

Keyboard.getShortcuts = function(name, keyboard) {
	return Keyboard.getShortcut(name, keyboard, { many: true });
};


/*
---

script: Mask.js

description: Creates a mask element to cover another.

license: MIT-style license

authors:
- Aaron Newton

requires:
- core:1.2.4/Options
- core:1.2.4/Events
- core:1.2.4/Element.Event
- /Class.Binds
- /Element.Position
- /IframeShim

provides: [Mask]

...
*/

var Mask = new Class({

	Implements: [Options, Events],

	Binds: ['position'],

	options: {
		// onShow: $empty,
		// onHide: $empty,
		// onDestroy: $empty,
		// onClick: $empty,
		//inject: {
		//  where: 'after',
		//  target: null,
		//},
		// hideOnClick: false,
		// id: null,
		// destroyOnHide: false,
		style: {},
		'class': 'mask',
		maskMargins: false,
		useIframeShim: true,
		iframeShimOptions: {}
	},

	initialize: function(target, options){
		this.target = document.id(target) || document.id(document.body);
		this.target.store('Mask', this);
		this.setOptions(options);
		this.render();
		this.inject();
	},
	
	render: function() {
		this.element = new Element('div', {
			'class': this.options['class'],
			id: this.options.id || 'mask-' + $time(),
			styles: $merge(this.options.style, {
				display: 'none'
			}),
			events: {
				click: function(){
					this.fireEvent('click');
					if (this.options.hideOnClick) this.hide();
				}.bind(this)
			}
		});
		this.hidden = true;
	},

	toElement: function(){
		return this.element;
	},

	inject: function(target, where){
		where = where || this.options.inject ? this.options.inject.where : '' || this.target == document.body ? 'inside' : 'after';
		target = target || this.options.inject ? this.options.inject.target : '' || this.target;
		this.element.inject(target, where);
		if (this.options.useIframeShim) {
			this.shim = new IframeShim(this.element, this.options.iframeShimOptions);
			this.addEvents({
				show: this.shim.show.bind(this.shim),
				hide: this.shim.hide.bind(this.shim),
				destroy: this.shim.destroy.bind(this.shim)
			});
		}
	},

	position: function(){
		this.resize(this.options.width, this.options.height);
		this.element.position({
			relativeTo: this.target,
			position: 'topLeft',
			ignoreMargins: !this.options.maskMargins,
			ignoreScroll: this.target == document.body
		});
		return this;
	},

	resize: function(x, y){
		var opt = {
			styles: ['padding', 'border']
		};
		if (this.options.maskMargins) opt.styles.push('margin');
		var dim = this.target.getComputedSize(opt);
		if (this.target == document.body) {
			var win = window.getSize();
			if (dim.totalHeight < win.y) dim.totalHeight = win.y;
			if (dim.totalWidth < win.x) dim.totalWidth = win.x;
		}
		this.element.setStyles({
			width: $pick(x, dim.totalWidth, dim.x),
			height: $pick(y, dim.totalHeight, dim.y)
		});
		return this;
	},

	show: function(){
		if (!this.hidden) return this;
		window.addEvent('resize', this.position);
		this.position();
		this.showMask.apply(this, arguments);
		return this;
	},

	showMask: function(){
		this.element.setStyle('display', 'block');
		this.hidden = false;
		this.fireEvent('show');
	},

	hide: function(){
		if (this.hidden) return this;
		window.removeEvent('resize', this.position);
		this.hideMask.apply(this, arguments);
		if (this.options.destroyOnHide) return this.destroy();
		return this;
	},

	hideMask: function(){
		this.element.setStyle('display', 'none');
		this.hidden = true;
		this.fireEvent('hide');
	},

	toggle: function(){
		this[this.hidden ? 'show' : 'hide']();
	},

	destroy: function(){
		this.hide();
		this.element.destroy();
		this.fireEvent('destroy');
		this.target.eliminate('mask');
	}

});

Element.Properties.mask = {

	set: function(options){
		var mask = this.retrieve('mask');
		return this.eliminate('mask').store('mask:options', options);
	},

	get: function(options){
		if (options || !this.retrieve('mask')){
			if (this.retrieve('mask')) this.retrieve('mask').destroy();
			if (options || !this.retrieve('mask:options')) this.set('mask', options);
			this.store('mask', new Mask(this, this.retrieve('mask:options')));
		}
		return this.retrieve('mask');
	}

};

Element.implement({

	mask: function(options){
		this.get('mask', options).show();
		return this;
	},

	unmask: function(){
		this.get('mask').hide();
		return this;
	}

});

/*
---

script: Scroller.js

description: Class which scrolls the contents of any Element (including the window) when the mouse reaches the Element's boundaries.

license: MIT-style license

authors:
- Valerio Proietti

requires:
- core:1.2.4/Events
- core:1.2.4/Options
- core:1.2.4/Element.Event
- core:1.2.4/Element.Dimensions

provides: [Scroller]

...
*/

var Scroller = new Class({

	Implements: [Events, Options],

	options: {
		area: 20,
		velocity: 1,
		onChange: function(x, y){
			this.element.scrollTo(x, y);
		},
		fps: 50
	},

	initialize: function(element, options){
		this.setOptions(options);
		this.element = document.id(element);
		this.docBody = document.id(this.element.getDocument().body);
		this.listener = ($type(this.element) != 'element') ?  this.docBody : this.element;
		this.timer = null;
		this.bound = {
			attach: this.attach.bind(this),
			detach: this.detach.bind(this),
			getCoords: this.getCoords.bind(this)
		};
	},

	start: function(){
		this.listener.addEvents({
			mouseover: this.bound.attach,
			mouseout: this.bound.detach
		});
	},

	stop: function(){
		this.listener.removeEvents({
			mouseover: this.bound.attach,
			mouseout: this.bound.detach
		});
		this.detach();
		this.timer = $clear(this.timer);
	},

	attach: function(){
		this.listener.addEvent('mousemove', this.bound.getCoords);
	},

	detach: function(){
		this.listener.removeEvent('mousemove', this.bound.getCoords);
		this.timer = $clear(this.timer);
	},

	getCoords: function(event){
		this.page = (this.listener.get('tag') == 'body') ? event.client : event.page;
		if (!this.timer) this.timer = this.scroll.periodical(Math.round(1000 / this.options.fps), this);
	},

	scroll: function(){
		var size = this.element.getSize(), 
			scroll = this.element.getScroll(), 
			pos = this.element != this.docBody ? this.element.getOffsets() : {x: 0, y:0}, 
			scrollSize = this.element.getScrollSize(), 
			change = {x: 0, y: 0};
		for (var z in this.page){
			if (this.page[z] < (this.options.area + pos[z]) && scroll[z] != 0) {
				change[z] = (this.page[z] - this.options.area - pos[z]) * this.options.velocity;
			} else if (this.page[z] + this.options.area > (size[z] + pos[z]) && scroll[z] + size[z] != scrollSize[z]) {
				change[z] = (this.page[z] - size[z] + this.options.area - pos[z]) * this.options.velocity;
			}
		}
		if (change.y || change.x) this.fireEvent('change', [scroll.x + change.x, scroll.y + change.y]);
	}

});

/*
---

script: Tips.js

description: Class for creating nice tips that follow the mouse cursor when hovering an element.

license: MIT-style license

authors:
- Valerio Proietti
- Christoph Pojer

requires:
- core:1.2.4/Options
- core:1.2.4/Events
- core:1.2.4/Element.Event
- core:1.2.4/Element.Style
- core:1.2.4/Element.Dimensions
- /MooTools.More

provides: [Tips]

...
*/

(function(){

var read = function(option, element){
	return (option) ? ($type(option) == 'function' ? option(element) : element.get(option)) : '';
};

this.Tips = new Class({

	Implements: [Events, Options],

	options: {
		/*
		onAttach: $empty(element),
		onDetach: $empty(element),
		*/
		onShow: function(){
			this.tip.setStyle('display', 'block');
		},
		onHide: function(){
			this.tip.setStyle('display', 'none');
		},
		title: 'title',
		text: function(element){
			return element.get('rel') || element.get('href');
		},
		showDelay: 100,
		hideDelay: 100,
		className: 'tip-wrap',
		offset: {x: 16, y: 16},
		windowPadding: {x:0, y:0},
		fixed: false
	},

	initialize: function(){
		var params = Array.link(arguments, {options: Object.type, elements: $defined});
		this.setOptions(params.options);
		if (params.elements) this.attach(params.elements);
		this.container = new Element('div', {'class': 'tip'});
	},

	toElement: function(){
		if (this.tip) return this.tip;

		return this.tip = new Element('div', {
			'class': this.options.className,
			styles: {
				position: 'absolute',
				top: 0,
				left: 0
			}
		}).adopt(
			new Element('div', {'class': 'tip-top'}),
			this.container,
			new Element('div', {'class': 'tip-bottom'})
		).inject(document.body);
	},

	attach: function(elements){
		$$(elements).each(function(element){
			var title = read(this.options.title, element),
				text = read(this.options.text, element);
			
			element.erase('title').store('tip:native', title).retrieve('tip:title', title);
			element.retrieve('tip:text', text);
			this.fireEvent('attach', [element]);
			
			var events = ['enter', 'leave'];
			if (!this.options.fixed) events.push('move');
			
			events.each(function(value){
				var event = element.retrieve('tip:' + value);
				if (!event) event = this['element' + value.capitalize()].bindWithEvent(this, element);
				
				element.store('tip:' + value, event).addEvent('mouse' + value, event);
			}, this);
		}, this);
		
		return this;
	},

	detach: function(elements){
		$$(elements).each(function(element){
			['enter', 'leave', 'move'].each(function(value){
				element.removeEvent('mouse' + value, element.retrieve('tip:' + value)).eliminate('tip:' + value);
			});
			
			this.fireEvent('detach', [element]);
			
			if (this.options.title == 'title'){ // This is necessary to check if we can revert the title
				var original = element.retrieve('tip:native');
				if (original) element.set('title', original);
			}
		}, this);
		
		return this;
	},

	elementEnter: function(event, element){
		this.container.empty();
		
		['title', 'text'].each(function(value){
			var content = element.retrieve('tip:' + value);
			if (content) this.fill(new Element('div', {'class': 'tip-' + value}).inject(this.container), content);
		}, this);
		
		$clear(this.timer);
		this.timer = (function(){
			this.show(this, element);
			this.position((this.options.fixed) ? {page: element.getPosition()} : event);
		}).delay(this.options.showDelay, this);
	},

	elementLeave: function(event, element){
		$clear(this.timer);
		this.timer = this.hide.delay(this.options.hideDelay, this, element);
		this.fireForParent(event, element);
	},

	fireForParent: function(event, element){
		element = element.getParent();
		if (!element || element == document.body) return;
		if (element.retrieve('tip:enter')) element.fireEvent('mouseenter', event);
		else this.fireForParent(event, element);
	},

	elementMove: function(event, element){
		this.position(event);
	},

	position: function(event){
		if (!this.tip) document.id(this);

		var size = window.getSize(), scroll = window.getScroll(),
			tip = {x: this.tip.offsetWidth, y: this.tip.offsetHeight},
			props = {x: 'left', y: 'top'},
			obj = {};
		
		for (var z in props){
			obj[props[z]] = event.page[z] + this.options.offset[z];
			if ((obj[props[z]] + tip[z] - scroll[z]) > size[z] - this.options.windowPadding[z]) obj[props[z]] = event.page[z] - this.options.offset[z] - tip[z];
		}
		
		this.tip.setStyles(obj);
	},

	fill: function(element, contents){
		if(typeof contents == 'string') element.set('html', contents);
		else element.adopt(contents);
	},

	show: function(element){
		if (!this.tip) document.id(this);
		this.fireEvent('show', [this.tip, element]);
	},

	hide: function(element){
		if (!this.tip) document.id(this);
		this.fireEvent('hide', [this.tip, element]);
	}

});

})();

/*
---

script: Spinner.js

description: Adds a semi-transparent overlay over a dom element with a spinnin ajax icon.

license: MIT-style license

authors:
- Aaron Newton

requires:
- core:1.2.4/Fx.Tween
- /Class.refactor
- /Mask

provides: [Spinner]

...
*/

var Spinner = new Class({

	Extends: Mask,

	options: {
		/*message: false,*/
		'class':'spinner',
		containerPosition: {},
		content: {
			'class':'spinner-content'
		},
		messageContainer: {
			'class':'spinner-msg'
		},
		img: {
			'class':'spinner-img'
		},
		fxOptions: {
			link: 'chain'
		}
	},

	initialize: function(){
		this.parent.apply(this, arguments);
		this.target.store('spinner', this);

		//add this to events for when noFx is true; parent methods handle hide/show
		var deactivate = function(){ this.active = false; }.bind(this);
		this.addEvents({
			hide: deactivate,
			show: deactivate
		});
	},

	render: function(){
		this.parent();
		this.element.set('id', this.options.id || 'spinner-'+$time());
		this.content = document.id(this.options.content) || new Element('div', this.options.content);
		this.content.inject(this.element);
		if (this.options.message) {
			this.msg = document.id(this.options.message) || new Element('p', this.options.messageContainer).appendText(this.options.message);
			this.msg.inject(this.content);
		}
		if (this.options.img) {
			this.img = document.id(this.options.img) || new Element('div', this.options.img);
			this.img.inject(this.content);
		}
		this.element.set('tween', this.options.fxOptions);
	},

	show: function(noFx){
		if (this.active) return this.chain(this.show.bind(this));
		if (!this.hidden) {
			this.callChain.delay(20, this);
			return this;
		}
		this.active = true;
		return this.parent(noFx);
	},

	showMask: function(noFx){
		var pos = function(){
			this.content.position($merge({
				relativeTo: this.element
			}, this.options.containerPosition));
		}.bind(this);
		if (noFx) {
			this.parent();
			pos();
		} else {
			this.element.setStyles({
				display: 'block',
				opacity: 0
			}).tween('opacity', this.options.style.opacity || 0.9);
			pos();
			this.hidden = false;
			this.fireEvent('show');
			this.callChain();
		}
	},

	hide: function(noFx){
		if (this.active) return this.chain(this.hide.bind(this));
		if (this.hidden) {
			this.callChain.delay(20, this);
			return this;
		}
		this.active = true;
		return this.parent(noFx);
	},

	hideMask: function(noFx){
		if (noFx) return this.parent();
		this.element.tween('opacity', 0).get('tween').chain(function(){
			this.element.setStyle('display', 'none');
			this.hidden = true;
			this.fireEvent('hide');
			this.callChain();
		}.bind(this));
	},

	destroy: function(){
		this.content.destroy();
		this.parent();
		this.target.eliminate('spinner');
	}

});

Spinner.implement(new Chain);

if (window.Request) {
	Request = Class.refactor(Request, {
		
		options: {
			useSpinner: false,
			spinnerOptions: {},
			spinnerTarget: false
		},
		
		initialize: function(options){
			this._send = this.send;
			this.send = function(options){
				if (this.spinner) this.spinner.chain(this._send.bind(this, options)).show();
				else this._send(options);
				return this;
			};
			this.previous(options);
			var update = document.id(this.options.spinnerTarget) || document.id(this.options.update);
			if (this.options.useSpinner && update) {
				this.spinner = update.get('spinner', this.options.spinnerOptions);
				['onComplete', 'onException', 'onCancel'].each(function(event){
					this.addEvent(event, this.spinner.hide.bind(this.spinner));
				}, this);
			}
		},
		
		getSpinner: function(){
			return this.spinner;
		}
		
	});
}

Element.Properties.spinner = {

	set: function(options){
		var spinner = this.retrieve('spinner');
		return this.eliminate('spinner').store('spinner:options', options);
	},

	get: function(options){
		if (options || !this.retrieve('spinner')){
			if (this.retrieve('spinner')) this.retrieve('spinner').destroy();
			if (options || !this.retrieve('spinner:options')) this.set('spinner', options);
			new Spinner(this, this.retrieve('spinner:options'));
		}
		return this.retrieve('spinner');
	}

};

Element.implement({

	spin: function(options){
		this.get('spinner', options).show();
		return this;
	},

	unspin: function(){
		var opt = Array.link(arguments, {options: Object.type, callback: Function.type});
		this.get('spinner', opt.options).hide(opt.callback);
		return this;
	}

});

/*
---

script: Date.English.US.js

description: Date messages for US English.

license: MIT-style license

authors:
- Aaron Newton

requires:
- /Lang
- /Date

provides: [Date.English.US]

...
*/

MooTools.lang.set('en-US', 'Date', {

	months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
	days: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
	//culture's date order: MM/DD/YYYY
	dateOrder: ['month', 'date', 'year'],
	shortDate: '%m/%d/%Y',
	shortTime: '%I:%M%p',
	AM: 'AM',
	PM: 'PM',

	/* Date.Extras */
	ordinal: function(dayOfMonth){
		//1st, 2nd, 3rd, etc.
		return (dayOfMonth > 3 && dayOfMonth < 21) ? 'th' : ['th', 'st', 'nd', 'rd', 'th'][Math.min(dayOfMonth % 10, 4)];
	},

	lessThanMinuteAgo: 'less than a minute ago',
	minuteAgo: 'about a minute ago',
	minutesAgo: '{delta} minutes ago',
	hourAgo: 'about an hour ago',
	hoursAgo: 'about {delta} hours ago',
	dayAgo: '1 day ago',
	daysAgo: '{delta} days ago',
	weekAgo: '1 week ago',
	weeksAgo: '{delta} weeks ago',
	monthAgo: '1 month ago',
	monthsAgo: '{delta} months ago',
	yearAgo: '1 year ago',
	yearsAgo: '{delta} years ago',
	lessThanMinuteUntil: 'less than a minute from now',
	minuteUntil: 'about a minute from now',
	minutesUntil: '{delta} minutes from now',
	hourUntil: 'about an hour from now',
	hoursUntil: 'about {delta} hours from now',
	dayUntil: '1 day from now',
	daysUntil: '{delta} days from now',
	weekUntil: '1 week from now',
	weeksUntil: '{delta} weeks from now',
	monthUntil: '1 month from now',
	monthsUntil: '{delta} months from now',
	yearUntil: '1 year from now',
	yearsUntil: '{delta} years from now'

});
var tnoodle = tnoodle || {};
tnoodle.tnt = {
	version: '0.1.2',
	createOptionBox: function(config, optionKey, description, def, changeListener) {
		var checkbox = new Element('input', { id: optionKey, type: 'checkbox' });
		checkbox.checked = config.get(optionKey, def);
		checkbox.addEvent('change', function(e) {
			config.set(this.id, this.checked);
		});
		if(changeListener) {
			checkbox.addEvent('change', changeListener);
			changeListener.call(checkbox);
		}
		checkbox.addEvent('focus', function(e) {
			this.blur();
		});
		return new Element('div').adopt(checkbox).adopt(new Element('label', { 'html': description, 'for': optionKey }));
	},
	createOptions: function(showCallback, hiddenCallback, canHide) {
		var optionsButton = new Element('div', { html: 'v', 'class': 'optionsButton' });
		optionsButton.setStyles({
			width: 19,
			height: 22
		});

		var optionsDiv = new Element('div', { 'class': 'options' });
		optionsDiv.inject(document.body);
		var timer = null;
		var width = null;
		optionsDiv.show = function() {
			//This is a really weird hack for windows chrome
			//Apparently the first time the optionsDiv is shown,
			//it has the right size. However, if you resize the window
			//before showing it again, the size gets screwed up.
			//This is a cheap workaround. TODO - fix?
			if(!width) {
				width = optionsDiv.getSize().x-10-2; //-10 for padding, -2 for border
			} else {
				optionsDiv.setStyle('width', width);
			}

			if(timer !== null) {
				clearTimeout(timer);
			} else if(showCallback) {
				showCallback();
			}
			optionsDiv.position({relativeTo: optionsButton, position: 'bottomRight', edge: 'topRight'});
			optionsDiv.fade('in');
			optionsButton.morph('.optionsButtonHover');
		};
		function fireHidden() {
			timer = null;
			if(hiddenCallback) {
				hiddenCallback();
			}
		}
		optionsDiv.hide = function(e) {
			if(canHide && !canHide()) {
				return;
			}
			optionsDiv.fade('out');
			timer = setTimeout(fireHidden, 500);
			optionsButton.morph('.optionsButton');
		};
		optionsDiv.fade('hide');
		
		optionsButton.addEvent('mouseover', optionsDiv.show);
		optionsButton.addEvent('mouseout', optionsDiv.hide);
		optionsDiv.addEvent('mouseover', optionsDiv.show);
		optionsDiv.addEvent('mouseout', optionsDiv.hide);
		document.addEvent('mousedown', function(e) {
			if(!e.target) {
				e.target = e.srcElement; // freaking ie, man
			}

			if(!e.target.isOrIsChild(optionsDiv)) {
				// If we attempt to hide immediately, then
				// textboxes may still focused.
				// This lets focus events take place before
				// we attempt to hide the box.
				// Otherwise, it could fail when we call canHide().
				setTimeout(optionsDiv.hide, 0);
			}
		});
		return {
			div: optionsDiv,
			button: optionsButton
		};
	},
	grayOut_: null,
	grayOut: function(show) {
		if(this.grayOut_ === null) {
			this.grayOut_ = document.createElement('div');
			this.grayOut_.addClass('grayOut');
			document.body.appendChild(this.grayOut_);
		}
		if(show) {
			this.grayOut_.setStyle('display', 'inline');
		} else {
			this.grayOut_.setStyle('display', 'none');
		}
	},
	isGrayedOut: function() {
		return this.grayOut_ !== null && this.grayOut_.getStyle('display') != 'none';
	},
	createPopup: function(onShow, onHide, size, noGrayBg) {
        // The gray out must be created *before* any popups, else
        // they'll get hidden behind the gray out. This isn't the best solution,
        // but it is the easiest for now.
        tnoodle.tnt.grayOut(false);

		var popup = document.createElement('div');
		popup.className = 'popup';
		document.body.appendChild(popup);

		popup.show = function() {
			document.addEvent('keydown', keydown);
			window.addEvent('resize', popup.center);
			document.addEvent('mouseup', mouseup);
			document.addEvent('mousedown', mousedown);
			
			if(!noGrayBg) {
				tnoodle.tnt.grayOut(true);
			}
			this.style.display = 'inline';
			if(onShow) {
				onShow();
			}
            // Calling onShow() may cause a resize, so we don't
            // center until after
			this.center();
		}.bind(popup);
		popup.center = function() {
			var windowWidth = window.innerWidth || window.clientWidth;
			var windowHeight = window.innerHeight || window.clientHeight;
			var width, height;
			if($chk(size)) {
				width = windowWidth*size;
				height = windowHeight*size;
				this.setStyle('width', width);
				this.setStyle('height', height);
				innerDiv.setStyle('width', width);//-8);
				innerDiv.setStyle('height', height);//-8);
				if(innerDiv.resize) {
					// Oh man, this is just wonderful
					innerDiv.resize();
				}
			} else {
				innerDiv.setStyle('height', '');
				innerDiv.setStyle('width', '');
				if(innerDiv.reset) {
					//TODO - wowow
					innerDiv.reset();
				}
				width = parseInt(innerDiv.getStyle('width'), 10);
				height = parseInt(innerDiv.getStyle('height'), 10);
				var MAX_HEIGHT = windowHeight-20;
				var overflow = false;
				if(height > MAX_HEIGHT) {
					height = MAX_HEIGHT;
					overflow = true;
				}
				this.setStyle('width', width);
				this.setStyle('height', height);
				if(overflow && innerDiv.overflow) {
					innerDiv.overflow();
				}
			}
			height += 12; //TODO - border/padding
			this.style.top = (windowHeight - height)/2 + 'px';
			this.style.left = (windowWidth - width)/2 + 'px';
		}.bind(popup);
		popup.hide = function() {
			document.removeEvent('keydown', keydown);
			window.removeEvent('resize', popup.center);
			document.removeEvent('mouseup', mouseup);
			document.removeEvent('mousedown', mousedown);

			if(!noGrayBg) {
				tnoodle.tnt.grayOut(false);
			}
			this.style.display = 'none';
			if(onHide) {
				onHide();
			}
		}.bind(popup);
		popup.hide();

		function keydown(e) {
			if(e.key == 'esc') {
				popup.hide();
			}
		}
		var mouseDown = false;
		function mouseup(e) {
			mouseDown = false;
		}
		function mousedown(e) {
			mouseDown = true;
			if(!e.target) {
				e.target = e.srcElement; // freaking ie, man
			}

			if(!e.target.isOrIsChild(popup)) {
				popup.hide();
			}
		}
		
		// adding an inner div helps us get a nice border
		var innerDiv = document.createElement('div');
		innerDiv.show = popup.show;
		innerDiv.hide = popup.hide;
		popup.appendChild(innerDiv);
		return innerDiv;
	},
	createEditableList: function(items, onAdd, onRename, onDelete) {
		items = items.slice(); // We don't want to mutate the list passed in
		var list = new Element('select');
		list.setStyle('width', 100);
		list.setAttribute('multiple', 'multiple');
		for(var i = 0; i < items.length; i++) {
			list.options[i] = new Option(items[i], items[i]);
		}

		//TODO - add/edit functionality?!
		var editor = new Element('div');
		editor.adopt(list);
		return editor;
	},
	isSelecting: function() {
		return $$('.selecting').length > 0; //lol
	},
	selects_: [],
	textSizer_: null,
	createSelect: function(rightTip, leftTip) {
		rightTip = rightTip || null;
		var select = document.createElement('span');
		this.selects_.push(select);
		select.addClass('select');
		select.selectedIndex = 0;

		var selected = document.createElement('span');
		// Add a nice little upside down triangle
		var arrow = document.createElement('span');
		arrow.appendText('\u25BC');
		if(leftTip) {
			select.arrow1 = arrow.clone();
			select.arrow1.addClass('leftarrow');
			select.appendChild(select.arrow1);
		}
		select.appendChild(selected);
		select.arrow2 = arrow.clone();
		select.arrow2.addClass('rightarrow');
		select.appendChild(select.arrow2);
		
		var optionsDiv = document.createElement('div');
		optionsDiv.addClass('options');
		var selecting = false;
		optionsDiv.fade('hide');
		optionsDiv.inject(select);

		var options = [];
		var optionsHaveChanged = true;
		select.setOptions = function(new_options) {
			options = new_options;
			optionsHaveChanged = true;
			selectedIndex = null;
		};
		var THIS = this;
		function resizeStr(str, maxWidth) {
			if(!THIS.textSizer_) {
				THIS.textSizer_ = document.createElement('div');
				THIS.textSizer_.setStyle('position', 'absolute');
				document.body.adopt(THIS.textSizer_);
			} else {
				THIS.textSizer_.empty();
				THIS.textSizer_.setStyle('display', '');
			}
			THIS.textSizer_.appendText(str);
			if(THIS.textSizer_.getSize().x < maxWidth) {
				// The whole string fit! Yay!
				THIS.textSizer_.setStyle('display', 'none');
				return str;
			}
			// The whole string didn't fit, so we try to fit it with ellipsis
			THIS.textSizer_.empty();
			THIS.textSizer_.appendText("...");
			var i;
			for(i = 0; i < str.length && THIS.textSizer_.getSize().x < maxWidth; i++) {
				THIS.textSizer_.appendText(str[i]);
			}
			THIS.textSizer_.setStyle('display', 'none');
			return str.substring(0, i) + '...';
		}
		function fillWithOption(el, option, maxWidth) {
			if(!maxWidth) {
				maxWidth = Infinity;
			}
			el.empty();
			if(option.icon) {
				var img = document.createElement('img');
				img.setStyle('vertical-align', 'middle');
				img.setStyle('width', '32px');
				img.setStyle('height', '32px');
				img.setStyle('padding', '0px 2px 2px 0px');
				img.src = option.icon;
				el.appendChild(img);
				maxWidth -= 32 + 2;
			}
			maxWidth -= select.arrow2.getSize().x;
			if(select.arrow1) {
				maxWidth -= select.arrow1.getSize().x;
			}
			el.setStyle('font-weight', '');
			if(option.value === null) {
				el.setStyle('font-weight', 'bold');
			}
			el.appendText(resizeStr(option.text, maxWidth));
			if(option.text == "" && !option.icon) {
				// Nasty little hack to deal with empty options
				el.setStyle('height', '19px');
			}
		}
		var maxWidth = null;
		select.setMaxWidth = function(width) {
			maxWidth = width;
			
			// Trickyness to get past the dampening in showItem
			var index = selectedIndex;
			selectedIndex = null;
			showItem(index);
		};
		var selectedIndex = null;
		function showItem(index) {
			if(index == selectedIndex) {
				return;
			}
			fillWithOption(selected, options[index], maxWidth);
			selectedIndex = index;
		}
		select.setSelected = function(value) {
			if(optionsHaveChanged) {
				refresh();
			}
			var values = options.map(function(el) { return el.value; });
			var index = values.indexOf(value);
			if(index < 0) {
				//TODO - proper error messages
				//alert("Couldn't find " + value + ' in [' + values.join(",") + ']');
				console.log("Couldn't find " + value + ' in [' + values.join(",") + ']');
				index = 0;
			}
			
			showItem(index);
			select.selectedIndex = index;
			if(select.onchange) {
				select.onchange(select.arrow1 && select.arrow1.hasClass('hovered'));
			}
		};
		select.getSelected = function() {
			return options[this.selectedIndex].value;
		};
		var currOptions = null;
		var hoveredIndex = null;
		function clearOptions() {
			optionsDiv.getChildren('div').each(function(div) {
				div.removeClass('hovered');
			});
		}
		function hover() {
			clearOptions();
			this.addClass('hovered');
		}
		function mouseOver(e) {
			hoveredIndex = this.index;
		}
		function optionClicked() {
			select.setSelected(this.value);
		}
		var refresh = function() {
			if(disabled) {
				select.addClass('disabled');
			} else {
				select.removeClass('disabled');
			}

			if(!selecting) {
				// If we're not selecting, then we remove the arrow highlights
				if(select.arrow1) {
					select.arrow1.removeClass('hovered');
				}
				select.arrow2.removeClass('hovered');
			}
			if(mousePos !== null && select.containsPoint(mousePos)) {
				// Whether we're selecting or not, if the mouse is on top of the
				// status part of the select, we update the hovered dropdown arrow accordingly
				select.arrow2.removeClass('hovered');
				if(select.arrow1) {
					select.arrow1.removeClass('hovered');
					var pos = (mousePos.x - select.getPosition().x)/select.getSize().x;
					if(pos > 0.5) {
						select.arrow2.addClass('hovered');
					} else {
						select.arrow1.addClass('hovered');
					}
				} else {
					select.arrow2.addClass('hovered');
				}
			}
			select.title = select.arrow2.hasClass('hovered') ? rightTip : leftTip;
			var selected = options[select.selectedIndex];
			if(selected && selected.text != '') {
				select.title = selected.text + '\n' + select.title;
			}

			window.removeEvent('keydown', keyDown);
			window.removeEvent('click', windowClicked);
			if(selecting) {
				window.addEvent('keydown', keyDown);
				window.addEvent('click', windowClicked);
				if(optionsHaveChanged) {
					optionsHaveChanged = false;
					optionsDiv.empty();
					for(var i = 0; i < options.length; i++) {
						var option = document.createElement('div');
						option.addClass('option');
						fillWithOption(option, options[i]);
						option.value = options[i].value;
						option.index = i;
						optionsDiv.adopt(option);
						option.hover = hover;
						option.addEvent('mouseover', mouseOver);
						option.addEvent('click', optionClicked);					}
				}

				select.addClass('selecting');
				optionsDiv.position({relativeTo: select, position: 'bottomLeft', edge: 'topLeft'});
				var posX = optionsDiv.getPosition().x;
				var offscreen = posX + optionsDiv.getSize().x - document.body.getSize().x;
				if(offscreen > 0) {
					// Ensuring stuff stays onscreen...
					var left = optionsDiv.getStyle('left').toInt();
					left -= offscreen;
					optionsDiv.setStyle('left', left);
				}
				optionsDiv.fade('show');
				optionsDiv.getChildren()[hoveredIndex].hover();
				showItem(hoveredIndex);
			} else {
				if(options.length > select.selectedIndex) {
					showItem(select.selectedIndex);
				}
				optionsDiv.fade('hide');
				select.removeClass('selecting');
			}
		}.bind(select);

		select.addEvent('mouseover', function() {
			refresh();
		});
		var mousePos = null;
		select.addEvent('mouseout', function(e) {
			mousePos = null;
			refresh();
		});
		select.addEvent('mousemove', function(e) {
			mousePos = e.page;
			refresh();
		});
		select.show = function() {
			if(disabled) {
				return;
			}
			selecting = true;
			select.arrow2.addClass('hovered');
			hoveredIndex = this.selectedIndex;
			// If we run refresh() immediately, the current
			// mouse click will cause windowClicked() to get called,
			// which will make our dropdown invisible.
			setTimeout(refresh, 0);
		}.bind(select);
		select.addEvent('click', select.show);
		function windowClicked(e) {
			selecting = false;
			refresh();
		}
		function keyDown(e) {
			//TODO - search as you type for items?
			if(e.key == 'up') {
				hoveredIndex = (hoveredIndex+options.length-1) % options.length;
			} else if(e.key == 'down') {
				hoveredIndex = (hoveredIndex+1) % options.length;
			} else if(e.key == 'home') {
				hoveredIndex = 0;
			} else if(e.key == 'end') {
				hoveredIndex = options.length-1;
			}else if(e.key == 'enter') {
				select.setSelected(options[hoveredIndex].value);
				selecting = false;
			} else if(e.key == 'esc') {
				selecting = false;
			} else if(e.key == 'left' || e.key == 'right') {
				if(select.arrow1) {
					select.arrow1.toggleClass('hovered');
					select.arrow2.toggleClass('hovered');
				}
			} else if(e.key == 'tab') {
				e.stop();

				selecting = false;
				var selects = tnoodle.tnt.selects_;
				var delta = e.shift ? selects.length-1 : 1; // silly js modulo
				var index = (selects.indexOf(select) + delta) % selects.length;
				selects[index].show();
			} else {
				return;
			}
			refresh();
		}

		var disabled = false;
		select.setDisabled = function(new_disabled) {
			disabled = new_disabled;
			selecting = false;
			refresh();
		};

		refresh();
		return select;
	},
	ago: function(date) {
		var today = new Date();
		var i, agostr;
		var resolutions = [ 'year', 'month', 'day', 'hour', 'minute' ];
		for(i = 0; i < resolutions.length; i++) {
			agostr = date.diff(today, resolutions[i]);
			a = date; b = today;
			if(agostr > 0) {
				break;
			}
		}
		agostr = (i < resolutions.length) ? 
				agostr + " " + resolutions[i] + "(s)" :
				"seconds";
		return agostr;
	}
};

Element.implement({
	findAncestor: function(cond) {
		var el = this;
		while(el !== null && el !== undefined) {
			if(cond(el)) {
				return el;
			}
			el = el.parentNode;
		}
		return null;
	},
	isOrIsChild: function(par) {
		return this.findAncestor(function(e) { return e == par; }) !== null;
	},
	containsPoint: function(point, relativeTo) {
		var tl = this.getPosition(relativeTo);
		var size = this.getSize();
		return point.x >= tl.x && point.x < tl.x+size.x && point.y >= tl.y && point.y < tl.y+size.y;
	}
});

Array.implement({
	equals: function(arr) {
		if(arr === null) {
			return false;
		}
		if(this.length != arr.length) {
			return false;
		}
		for(var i = 0; i < arr.length; i++) {
			if(this[i].equals) { 
				if(!this[i].equals(arr[i])) {
					return false;
				}
			}
			if(this[i] !== arr[i]) {
				return false;
			}
		}
		return true;
	},
	containsAll: function(arr) {
		for(var i = 0; i < arr.length; i++) {
			if(!this.contains(arr[i])) {
				return false;
			}
		}
		return true;
	}
});
var TriLayout = new Class( {
	margin: 5,
	initialize: function(topLeft, bottomLeft, right, config) {
		this.config = config;
		this.topLeft = topLeft;
		this.bottomLeft = bottomLeft;
		this.right = right;

		topLeft.setStyle('position', 'absolute');
		bottomLeft.setStyle('position', 'absolute');
		right.setStyle('position', 'absolute');

		document.body.setStyle('overflow', 'hidden');
		
		this.resizeDiv = new Element('div');
		this.resizeDiv.setStyle('background-color', 'black');
		this.resizeDiv.show = function() {
			this.morph({ 'opacity': '1' });
		};
		this.resizeDiv.hide = function() {
			this.morph({ 'opacity': '0.01' });
		};

		this.resizeDiv.hide();
		this.resizeDiv.setStyle('height', 4);
		this.resizeDiv.setStyle('cursor', 'n-resize');
		this.resizeDiv.setStyle('position', 'absolute');
		this.resizeDiv.setStyle('z-index', '3');
		
		this.resizeDiv.addEvent('mouseover', this.resizeDiv.show);
		this.resizeDiv.addEvent('mouseout', this.resizeDiv.hide);

		var space = window.getSize();
		this.resizeDiv.setPosition({ x: 0, y: space.y - config.get('layout.sizerHeight', 100) });
		
		topLeft.setStyles({ 'top': this.margin, 'left': this.margin });
		bottomLeft.setStyles({ 'bottom': this.margin, 'left': this.margin });
		right.setStyles({ 'right': this.margin, 'top': this.margin, 'bottom': this.margin });
		document.body.adopt(topLeft);
		document.body.adopt(bottomLeft);
		document.body.adopt(right);
		
		document.body.adopt(this.resizeDiv);
		document.body.adopt(this.counterClockwise);
		document.body.adopt(this.clockwise);
		document.body.adopt(this.swap);
		
		var dragger = new Drag(this.resizeDiv, {
			snap: 0,
			modifiers: { x: null, y: 'top' } //only allow vertical dragging
		});
		function startDragging() {
			document.body.style.cursor = 'n-resize';
		}
		var stopDragging = function() {
			document.body.style.cursor = '';
			this.resizeDiv.hide();
		}.bind(this);
		dragger.addEvent('start', startDragging);
		dragger.addEvent('complete', stopDragging);
		dragger.addEvent('drag', function() {
			this.resizeDiv.show();
			this.saveSize();
			this.resize();
		}.bind(this));

		window.addEvent('resize', this.resize.bind(this));
		window.addEvent('load', this.resize.bind(this));
		setTimeout(this.resize.bind(this), 0);
	},
	saveSize: function() {
		this.config.set('layout.sizerHeight', window.getSize().y - this.resizeDiv.getPosition().y);
	},
	resize: function() {
		var top = window.getSize().y - this.config.get('layout.sizerHeight');
		var MIN_TIMER_HEIGHT = 50;
		var MIN_SCRAMBLE_HEIGHT = 70;
		if(top < MIN_TIMER_HEIGHT) {
			top = MIN_TIMER_HEIGHT;
		} else if(top > window.getSize().y - MIN_SCRAMBLE_HEIGHT) {
			top = window.getSize().y - MIN_SCRAMBLE_HEIGHT;
		}
		this.resizeDiv.setStyle('top', top);
		this.saveSize();
		this.position();
	},
	position: function() {
		var tl = this.topLeft;
		var bl = this.bottomLeft;
		var right = this.right;
		
		var tlVert = tl.getStyle('border-top').toInt() + tl.getStyle('border-bottom').toInt() + this.margin;
		var tlHorz = tl.getStyle('border-right').toInt() + tl.getStyle('border-left').toInt() + this.margin;

		var blVert = bl.getStyle('border-top').toInt() + bl.getStyle('border-bottom').toInt() + this.margin;
		var blHorz = bl.getStyle('border-right').toInt() + bl.getStyle('border-left').toInt() + this.margin;

		var rightVert = right.getStyle('border-top').toInt() + right.getStyle('border-bottom').toInt() + 2*this.margin;
		var rightHorz = right.getStyle('border-right').toInt() + right.getStyle('border-left').toInt() + this.margin;

		var pos = this.resizeDiv.getPosition();
		var size = this.resizeDiv.getSize();
		var centerY = pos.y + size.y;
		var space = window.getSize();
		
		this.resizeDiv.setStyle('width', space.x - right.getPreferredWidth() - this.margin);

		tl.setStyle('width', space.x - rightHorz - right.getPreferredWidth() - tlHorz);
		tl.setStyle('height', centerY - tlVert);

		bl.setStyle('width', space.x - rightHorz - right.getPreferredWidth() - blHorz);
		bl.setStyle('height', space.y - centerY - blVert);

		right.setStyle('width', right.getPreferredWidth());
		right.setStyle('height', space.y - rightVert);

		if(tl.resize) {
			tl.resize();
		}
		if(bl.resize) {
			bl.resize();
		}
		if(right.resize) {
			right.resize(false, true);
		}
	}
});
/*** STUPID IE ***/
if(!Array.prototype.map) {
	Array.prototype.map = function(func) {
		var new_arr = [];
		for(var i = 0; i < this.length; i++) {
			new_arr[i] = func(this[i]);
		}
		return new_arr;
	};
}
function xAddListener(obj, event, func, useCapture) {
	if(obj.addEventListener) {
		obj.addEventListener(event, func, useCapture);
	} else {
		obj.attachEvent('on'+event, function(e) { func.call(obj, e); });
	}
}

/*** END STUPID IE ***/
var tnoodle = tnoodle || {};

tnoodle.aveDescription = "Michael Gottlieb and I have agreed to extend the definition of a trimmed average from 5 and 12 solves to an arbitrary number of solves. The objective is to throw out ~10% of the solves, the best 5% and the worst 5%. Michael's clever idea to get this to coincide with the current definitions of RA 5 (see WCA) and RA 12 (by overwhelming convention) is to define the number of trimmed solves as:\n trimmed(n) = 2*ceil[ (n/10)/2 ] = (n/10) rounded up to the nearest even integer\n It should be easy to check that trimmed(5) = 2 and trimmed(12) = 2, as desired.";
tnoodle.TRIMMED = function(n) {
	return 2*Math.ceil( (n/10)/2 );
};

tnoodle.server = function(host, port) {
	this.serverUrl = "http://" + host + ":" + port;

	/**** Scramble server stuff ***/
	this.scrambleUrl = this.serverUrl + "/scramble/";
	this.viewUrl = this.serverUrl + "/view/";
	this.importUrl = this.serverUrl + "/import/";

	//TODO - document!	
	this.createAreas = function(faces, scale) {
		var deepJoin = function(arr, sep) {
			return arr.map(function(item) { return item.map(function(coord) { return coord*scale; }).join(sep); }).join(sep);
		};
		var areas = [];
		for(var faceName in faces) {
			if(faces.hasOwnProperty(faceName)) {
				var faceAreas = faces[faceName];
				for(var i = 0; i < faceAreas.length; i++) {
					var area = document.createElement('area');
					area.faceName = faceName;
					area.setAttribute('shape', 'poly');
					var coords = deepJoin(faceAreas[i], ",");
					area.setAttribute('coords', coords);
	
					areas.push(area);
				}
			}
		}
		return areas;
	};
	this.flattenColorScheme = function(colorScheme) {
		var faces = [];
		for(var face in colorScheme) {
			if(colorScheme.hasOwnProperty(face)) {
				faces.push(face);
			}
		}
		faces.sort();
		var scheme = '';
		for(var i = 0; i < faces.length; i++) {
			if(i > 0) { scheme += ','; }
			scheme += colorScheme[faces[i]];
		}
		return scheme;
	};
	
	this.loadPuzzles = function(callback) {
		return tnoodle.ajax(callback, this.scrambleUrl, null);
	};
	
	this.loadScramble = function(callback, puzzle, seed) {
		return this.loadScrambles(function(scrambles) { callback(scrambles[0]); }, puzzle, seed, 1);
	};
	this.loadScrambles = function(callback, puzzle, seed, count) {
		var query = {};
		if(seed) { query.seed = seed; }
		if(count) { query.count = count; }
		return tnoodle.ajax(callback, this.scrambleUrl + encodeURIComponent(puzzle) + ".json", query);
	};
	this.getScrambleImageUrl = function(puzzle, scramble, colorScheme, width, height) {
		var query = { "scramble": scramble };
		if(width) { query.width = width; }
		if(height) { query.height = height; }
		if(colorScheme) {
			query.scheme = this.flattenColorScheme(colorScheme);
		}
		return this.viewUrl + encodeURIComponent(puzzle) + ".png?" + tnoodle.toQueryString(query);
	};
	this.getPuzzleIconUrl = function(puzzle) {
		return this.viewUrl + encodeURIComponent(puzzle) + ".png?icon=true";
	};
	this.loadPuzzleImageInfo = function(callback, puzzle) {
		// callback must be a function(defaultPuzzleInfo)
		// where defaultPuzzleInfo.faces is a {} mapping face names to arrays of points
		// defaultPuzzleInfo.size is the size of the scramble image
		// defaultPuzzleInfo.colorScheme is a {} mapping facenames to hex color strings
		return tnoodle.ajax(callback, this.viewUrl + encodeURIComponent(puzzle) + ".json", null);
	};
	this.importScrambles = function(callback, url) {
		return tnoodle.ajax(callback, this.importUrl, { url: url });
	};
	
	var uploadForm = null;
	this.getUploadForm = function(onsubmit, onload) {
		//onsubmit and onload are only used the first time this method is called
		if(uploadForm === null) {
			sendFileIframe = document.createElement('iframe');
			sendFileIframe.style.display = 'none';
			sendFileIframe.name = 'sendFileIframe';
			sendFileIframe.src = 'about:blank';
			document.body.appendChild(sendFileIframe);
			var serverUrl = this.serverUrl;
			xAddListener(window, "message", function(e) {
				if(e.origin == serverUrl) {
					var scrambles = JSON.parse(e.data);
					onload(scrambles);
				} else {
					onload({error: "Bad origin: " + e.origin + ", expecting " + serveriUrl});
				}
			}, false);
			
			uploadForm = document.createElement('form');
			uploadForm.setAttribute('method', 'post');
			uploadForm.setAttribute('action', this.importUrl);
			uploadForm.setAttribute('enctype', 'multipart/form-data');
			uploadForm.setAttribute('target', 'sendFileIframe');
			xAddListener(uploadForm, 'submit', function() {
				var abortSubmit = { abort: function() { sendFileIframe.src='about:blank'; } };
				onsubmit(fileInput.value, submit, abortSubmit);
			}, false);
			
			var fileInput = document.createElement('input');
			fileInput.setAttribute('type', 'file');
			fileInput.setAttribute('name', 'scrambles');
			var submit = document.createElement('input');
			submit.type = 'submit';
			submit.value = 'Load Scrambles';
			
			uploadForm.appendChild(fileInput);
			uploadForm.appendChild(submit);
		}
		return uploadForm;
	};
	this.toString = function() {
		return this.serverUrl;
	};

	
	/**** Time server stuff ***/
	
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
				delete data[property];
				delete cookies[property];
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
				this.set(property, def); // This is pretty silly
				return def;
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
	

	this.createSession = function(puzzle, event) {
		//id is the number of seconds since the epoch encoded in base 36 for readability
		var id = Math.round(new Date().getTime()/1000).toString(36);
		if(id in sessions) {
			//we don't want duplicate session ids
			return null;
		}
		var sesh = new tnoodle.Session(this, id, puzzle, event);
		sessions.push(sesh);
		this.saveSessions();
		return sesh;
	};
	this.disposeSession = function(session) {
		var i = sessions.indexOf(session);
		if(i < 0) {
			//couldn't find the session
			return false;
		}
		sessions.splice(i, 1);
		this.saveSessions();
		return true;
	};
	this.getSessions = function(puzzle, event) {
		var sessions = this.sessions.slice();
		if($defined(puzzle)) {
			sessions = sessions.filter(function(session) { return session.getPuzzle() == puzzle; });
		}
		if($defined(event)) {
			sessions = sessions.filter(function(session) { return session.getEvent() == event; });
		}
		sessions.sort(function(a, b) {
			return b.getDate().diff(a.getDate());
		});
		return sessions;
	};

	var events = {};
	this.getEvents = function(new_puzzle) {
		//initializing the available events
		for(i = 0; i < sessions.length; i++) {
			var puzzle = sessions[i].getPuzzle();
			var event = sessions[i].getEvent();
			if(!(puzzle in events)) {
				events[puzzle] = [ '' ];
			}
			if(!events[puzzle].contains(event)) {
				events[puzzle].push(event);
			}
		}
		if(!(new_puzzle in events)) {
			events[new_puzzle] = [ '' ];
		}
		events[new_puzzle].sort();
		return events[new_puzzle];
	};
	this.createEvent = function(puzzle, event) {
		var events = this.getEvents(puzzle);
		if(!events.contains(event)) {
			events.push(event);
		}
		return true;
	};
	this.renameEvent = function(puzzle, oldevent, newevent) {
		//TODO - urgh... editing too?
	};
	this.removeEvent = function(puzzle, event) {
		//TODO - urgh... editing too?
	};
	this.getTags = function() {
		//TODO - optimize the hell out of this!
		var availableTags = {};
		var tags;
		for(var i = 0; i < sessions.length; i++) {
			var times = sessions[i].times;
			for(var j = 0; j < times.length; j++) {
				tags = times[j].tags;
				for(var k = 0; k < tags.length; k++) {
					availableTags[tags[k]] = true;
				}
			}
		}
		tags = [];
		for(var tag in availableTags) {
			if(availableTags.hasOwnProperty(tag)) {
				tags.push(tag);
			}
		}
		tags.sort();
		return tags;
	};

	// Utility function to copy all the properties from oldObj into newObj
	function copyTo(oldObj, newObj) {
		for(var key in oldObj) {
			if(oldObj.hasOwnProperty(key)) {
				newObj[key] = oldObj[key];
			}
		}
	}
	var sessions = this.configuration.get('sessions', []);
	//transforming sessions (a JSON object) into an array of Sessions of Times
	try {
		var newSessions = [];
		for(i = 0; i < sessions.length; i++) {
			var sesh = new tnoodle.Session(this);
			copyTo(sessions[i], sesh);
			for(var j = 0; j < sesh.times.length; j++) {
				var newTime = new tnoodle.Time(0);
				copyTo(sesh.times[j], newTime);
				sesh.times[j] = newTime;
				newTime.setSession(sesh);
			}
			if(sesh.times.length > 0) {
				newSessions.push(sesh);
			}
		}
		sessions = newSessions;
	} catch(error) {
		console.log(error);
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
	this.saveSessions = function() {
		if(pendingSave) {
			return;
		}
		pendingSave = true;
		setTimeout(bufferedSave, 500);
	};
	
	if(sessions.length === 0) {
		this.createSession("3x3x3", "");
	}
};

tnoodle.Time = function(time, scramble) {
	//this.session = null;
	var session = null;
	var server = null;
	this.setSession = function(sesh) {
		session = sesh;
		server = session.getServer();
	};
	/* time can be either a number or a string */
	this.format = function(key) {
		key = key || 'centis';
		var type = tnoodle.Time.timeKeyTypeMap[key];
		if(type == tnoodle.Time) {
			var time = server.formatTime(this[key]);
			if(key == 'centis') {
				if(this.penalty == "+2") {
					time += "+";
				}
			}
			return time;
		} else if(type == Date) {
			return this[key].toString();
		} else if(type == String) {
			return this[key].toString();
		} else if(type == Array) {
			return this[key].toString();
		} else if(type == Number) {
			return this[key].toString();
		} else {
			alert("Unrecognized type: " + type);
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
		server.saveSessions();
	};
	//penalty can be "+2" or "DNF"
	//anything else is assumed to be no penalty
	this.setPenalty = function(penalty) {
		if(penalty != "+2" && penalty != "DNF") {
			penalty = null;
		}
		if(penalty == this.penalty) {
			return;
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

		server.saveSessions();
		//TODO - optimize
		//session.solvePenalized(this);
	};
	//always returns one of null, "+2", "DNF"
	this.getPenalty = function() {
		return this.penalty;
	};
	this.setComment = function(comment) {
		this.comment = (comment === null) ? "" : comment;
		this.tags = this.comment.match(/#\S+/g) || [];

		server.saveSessions();
		//TODO - optimize
		//session.solveCommented(this);
	};
	this.getComment = function() {
		return this.comment === null ? "" : this.comment;
	};
	
	this.ra5 = this.ra12 = this.ra100 = null;
	this.penalty = null;
	this.index = null;
	this.tags = [];
	this.date = new Date().getTime();
	this.scramble = scramble;
	this.comment = null;
	
	if(typeof(time) === "number") {
		this.centis = this.rawCentis = time;
	} else {
		this.parse(time.toString());
	}
	
};
(function() { //neat trick to avoid cloverring our namespace with the nthEl function
function nthEl(n) {
	return function(a) {
		return a[n];
	};
}
var Time = tnoodle.Time;
var keyInfo = [
	[ 'index', '', null, Number ],
	[ 'centis', 'Time', null, Time ],
	[ 'ra5', 'Ra 5', 'Trimmed average of 5', Time ],
	[ 'ra12', 'Ra 12', 'Trimmed average of 12', Time ],
	[ 'ra100', 'Ra 100', 'Trimmed average of 100', Time ],
	[ 'sessionAve', 'Ave', tnoodle.aveDescription, Time ]
	//The following columns seem silly
	//[ 'tags', 'Tags', null, Array ],
	//[ 'date', 'Date', 'Milliseconds since the epoch', Date ],
	//[ 'scramble', 'Scramble', null, String ]
];
Time.KEY_INFO = keyInfo;
Time.timeKeys = keyInfo.map(nthEl(0));
Time.timeKeyNames = keyInfo.map(nthEl(1));
Time.timeKeyDescriptions = keyInfo.map(nthEl(2));
Time.timeKeyTypes = keyInfo.map(nthEl(3));
Time.timeKeyTypeMap = {};
for(var i = 0; i < keyInfo.length; i++) {
	Time.timeKeyTypeMap[keyInfo[i][0]] = keyInfo[i][3];
}
})();

tnoodle.Session = function(server, id, puzzle, event) {
	this.getServer = function() {
		return server;
	};
	this.id = id;
	this.comment = null;
	this.getDate = function() {
		return new Date(1000*parseInt(this.id, 36));
	};
	this.puzzle = puzzle;
	this.event = event || '';
	//times is an array of Time's
	this.times = [];
	
	this.setPuzzle = function(newPuzzle) {
		this.puzzle = newPuzzle;
		server.saveSessions();
	};
	this.getPuzzle = function() {
		return this.puzzle;
	};
	this.setEvent = function(event) {
		this.event = event || '';
		server.saveSessions();
	};
	this.getEvent = function() {
		if(this.event === null) {
			return '';
		}
		return this.event;
	};
	this.setComment = function(comment) {
		this.comment = comment == '' ? null : comment;
		server.saveSessions();
	};
	this.getComment = function(comment) {
		return this.comment;
	};
	this.toString = function() {
		if(this.event.length == '') {
			return this.puzzle;
		} else {
			return this.puzzle + ":" + this.event;
		}
	};
	this.solveCount = function(lastTime, size) {
		if(!$chk(lastTime) || !$chk(size)) {
			lastTime = this.times.length-1;
			size = this.times.length;
		}
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
		server.saveSessions();
	};
	//TODO - cache!
	this.bestWorst = function(key, lastSolve, size) {
		if(!$chk(lastSolve) || !$chk(size)) {
			lastSolve = this.times.length-1;
			size = this.times.length;
		}
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
		for(var i = lastSolve-size+1; i <= lastSolve; i++) {
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
		var times = trimSolves(lastSolve, count);
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
		var times = trimSolves(lastSolve, size, trimmed);
		if(times === null) {
			return null;
		}
		return times.map(function(a) { return a.centis; }).average();
	}
	function trimSolves(lastSolve, size, trimmed) {
		if(!$chk(trimmed)) {
			trimmed = tnoodle.TRIMMED(size);
		}
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
		var session = this;
		var action = {
			undo: function() {
				//TODO - this is causing exceptions
				time.setSession(null);
				this.disposeTime(time, true);
				unscramble(time);
			}.bind(this),
			redo: function(nothistory) {
				time.setSession(session);
				privateAdd(time);
				if(!nothistory) {
					scramble();
				}
			}
		};
		this.pushHistory(action);
		action.redo(true);
		server.saveSessions();
	};
	this.reindex = function() {
		var oldTimes = this.times.slice();
		this.times.length = 0;
		for(var i = 0; i < oldTimes.length; i++) {
			privateAdd(oldTimes[i]);
		}
		server.saveSessions();
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
	var str = '';
	str += 'Statistics for %d\n\n';
	str += 'Average of %n/%N: %a\n';
	str += 'Standard deviation: %s\n';
	str += 'Number of DNFs: %#dnf\n';
	str += 'Best time: %b\n';
	str += 'Worst time: %w\n\n';
	str += '%T';
	this.defaultFormatStr = str;
	this.formatTimes = function(raSize, formatStr) {
		var ra = (raSize > 0);
		var lastSolve;
		if(!ra) {
			lastSolve = this.times.length-1;
			raSize = this.times.length;
		} else {
			lastSolve = this.bestWorst('ra'+raSize).best.index;
		}
		var f = server.formatTime;

		var date = this.getDate();
		var solves = this.solveCount(lastSolve, raSize);
		var attempts = raSize;
		var average = f(computeRA(lastSolve, raSize));
		var stdDev = f(this.stdDev(lastSolve, raSize));

		var best_worst = this.bestWorst('centis', lastSolve, raSize);
		var best = f(best_worst.best.centis);
		var worst = f(best_worst.worst.centis);

		var detailedTimes = '';
		var simpleTimes = '';
		// NOTE: countingTimes may be null if we try to trim too many solves
		var countingTimes = trimSolves(lastSolve, raSize);
		var firstSolve = lastSolve-raSize+1;
		var tagCounts = {};
		for(var offset = 0; offset < raSize; offset++) {
			var i = firstSolve+offset;
			var time = this.times[i];
			for(var j = 0; j < time.tags.length; j++) {
				var tag = time.tags[j].toLowerCase();
				tagCounts[tag] = (tagCounts[tag] || 0) + 1;
			}
			var timeStr = time.format();
			if(countingTimes && !countingTimes.contains(time)) {
				timeStr = "(" + timeStr + ")";
			}
			simpleTimes += (i>0?', ':'') + timeStr;
			detailedTimes += (offset+1) + ". " + timeStr + " " + time.scramble + "\n";
		}

		// TODO - this thing is duplicated, GAH!!! find something better
		this.formatLegend = {
			'%d': [ 'Date', date ],
			'%n': [ 'Solves', solves ],
			'%N': [ 'Attempts', attempts ],
			'%s': [ 'Stdev', stdDev ],
			'%#TAG': [ '# of solves with #TAG (TAG is case-insensitve and can be +2/dnf)', 42 ],
			'%b': [ 'Best time', best ],
			'%w': [ 'Worst time', worst ],
			'%t': [ 'Times list', simpleTimes ],
			'%T': [ 'Times+scrambles list', detailedTimes ],
			'%a': [ 'Average', average ],
			'%%': [ '%', '%']
		};

		formatStr = formatStr.replace(/%#\S+/g, function(match) {
			return tagCounts[match.substring(2).toLowerCase()] || 0;
		});
		//TODO - switch to replaceall?
		// this doesn't work quite right... %%T
		for(var key in this.formatLegend) {
			if(this.formatLegend.hasOwnProperty(key)) {
				formatStr = formatStr.replace(key, this.formatLegend[key][1]);
			}
		}
		return formatStr;
	};
	this.formatLegend = {
		'%d': [ 'Date' ],
		'%n': [ 'Solves' ],
		'%N': [ 'Attempts' ],
		'%s': [ 'Stdev' ],
		'%#TAG': [ '# of solves with #TAG (TAG is case-insensitve and can be +2/dnf)' ],
		'%b': [ 'Best time' ],
		'%w': [ 'Worst time' ],
		'%t': [ 'Times list' ],
		'%T': [ 'Times+scrambles list' ],
		'%a': [ 'Average' ],
		'%%': [ '%', '%']
	};
};


/*** Utility functions ***/

tnoodle.ajax = function(callback, url, data) {
	var dataUrl = url; //this is to avoid clobbering our original url
	if(data) {
		if(dataUrl.indexOf("?") < 0) {
			dataUrl += "?";
		}
		dataUrl += tnoodle.toQueryString(data);
	}
	
	var xhr = new XMLHttpRequest();
	if(xhr.withCredentials === undefined) {
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
		if(xhr === null) {
			// freaking opera & ie, man
			// we'll make an attempt to use jsonp here
			tnoodle.jsonp(callback, url, data);
			return null;
		}
	} else {
		xhr.open('get', dataUrl, true);
	}
	xhr.onload = function() {
		callback(JSON.parse(this.responseText));
	};
	xhr.onerror = function(error) {
		callback({error: error});
	};
	try {
		xhr.send(null);
	} catch(err) {
		callback({error: err});
	}
	return xhr;
};
tnoodle.jsonpcount = 1;
tnoodle.jsonp = function(callback, url, data) {
	var callbackname = "tnoodle.jsonp.callback" + this.jsonpcount++;
	eval(callbackname + "=callback");
	if (url.indexOf("?") > -1) {
		url += "&callback="; 
	} else {
		url += "?callback=";
	}

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
		if(data.hasOwnProperty(key)) {
			url += "&" + encodeURIComponent(key) + "=" + encodeURIComponent(data[key]);
		}
	}
	if(url.length === 0) {
		return url;
	}
	
	return url.substring(1);
};
function xAddListener(obj, event, func, useCapture) {
	if(obj.addEventListener) {
		obj.addEventListener(event, func, useCapture);
	} else {
		obj.attachEvent('on' + event, function(e) {
			func.call(obj, e);
		});
	}
}

// callback is a function(color), where color is encoded as a hex string
function ColorChooser(callback) {
	function rgb2hex(rgb) {
		var r = rgb.r;
		var g = rgb.g;
		var b = rgb.b;
		if(r > 255 || r < 0 || g > 255 || g < 0 || b > 255 || b < 0) {
			return 'bad rgb';
		}
		return (0x1000000 | (r << 4 * 4) | (g << 4 * 2) | b).toString(16).substring(1);
	}
	function hex2rgb(hex) {
		var r = parseInt(hex.substring(0, 2), 16);
		var g = parseInt(hex.substring(2, 4), 16);
		var b = parseInt(hex.substring(4, 6), 16);
		return {
			r : r,
			g : g,
			b : b
		};
	}
	// http://www.easyrgb.com/index.php?X=MATH&H=19#text19
	// RGB from 0 to 255, returns HSL from 0 to 1
	function rgb2hsl(rgb) {
		var R = (rgb.r / 255);
		var G = (rgb.g / 255);
		var B = (rgb.b / 255);

		var Min = Math.min(R, G, B); // Min. value of RGB
		var Max = Math.max(R, G, B); // Max. value of RGB
		var del_Max = Max - Min; // Delta RGB value

		var L = (Max + Min) / 2;

		var H, S;
		if(del_Max === 0) { // This is a gray, no chroma...
			H = 0; // HSL results from 0 to 1
			S = 0;
		} else {
			// Chromatic data...
			if(L < 0.5) {
				S = del_Max / (Max + Min);
			} else {
				S = del_Max / (2 - Max - Min);
			}

			var del_R = (((Max - R) / 6) + (del_Max / 2)) / del_Max;
			var del_G = (((Max - G) / 6) + (del_Max / 2)) / del_Max;
			var del_B = (((Max - B) / 6) + (del_Max / 2)) / del_Max;

			if(R == Max) {
				H = del_B - del_G;
			} else if(G == Max) {
				H = (1 / 3) + del_R - del_B;
			} else if(B == Max) {
				H = (2 / 3) + del_G - del_R;
			}

			if(H < 0) {
				H += 1;
			}
			if(H > 1) {
				H -= 1;
			}
		}
		return {
			h : H,
			s : S,
			l : L
		};
	}

	// HSL from 0 to 1, returns RGB from 0 to 1
	function hsl2rgb(hsl) {
		var h = hsl.h;
		var s = hsl.s;
		var l = hsl.l;
		var m1, m2, hue;
		var r, g, b;
		if(s === 0) {
			r = g = b = (l * 255);
		} else {
			if(l <= 0.5) {
				m2 = l * (s + 1);
			} else {
				m2 = l + s - l * s;
			}
			m1 = l * 2 - m2;
			r = HueToRgb(m1, m2, h + 1 / 3);
			g = HueToRgb(m1, m2, h);
			b = HueToRgb(m1, m2, h - 1 / 3);
		}
		return {
			r : Math.round(r),
			g : Math.round(g),
			b : Math.round(b)
		};
	}

	function HueToRgb(m1, m2, hue) {
		var v;
		if(hue < 0) {
			hue += 1;
		} else if(hue > 1) {
			hue -= 1;
		}

		if(6 * hue < 1) {
			v = m1 + (m2 - m1) * hue * 6;
		} else if(2 * hue < 1) {
			v = m2;
		} else if(3 * hue < 2) {
			v = m1 + (m2 - m1) * (2 / 3 - hue) * 6;
		} else {
			v = m1;
		}

		return 255 * v;
	}
	function hsToIJ(hs) {
		var theta = hs.h * 2 * Math.PI;
		var x = Math.cos(theta) * hs.s;
		var y = Math.sin(theta) * hs.s;
		x *= color_radius / color_width;
		y *= color_radius / color_width;
		return {
			i : (y - 1) * 0.5 * color_width * -1,
			j : (x + 1) * 0.5 * color_width
		};
	}
	function i_jToHS(i, j) {
		var y = -i / (0.5 * color_width) + 1;
		var x = j / (0.5 * color_width) - 1;
		y *= color_width / color_radius;
		x *= color_width / color_radius;

		var h = Math.atan2(y, x) / (2 * Math.PI);
		if(h < 0) {
			h++;
		}
		var s = Math.sqrt(x * x + y * y);
		return {
			h : h,
			s : s
		};
	}
	function inColorCircle(e) {
		var pt = getPoint(e);
		return i_jToHS(pt.y, pt.x).s <= 1;
	}
	function inLum(e) {
		var pt = getPoint(e);
		return pt.x > color_width && pt.x < color_width + lum_width;
	}
	function getPoint(e) {
		if(e.offsetX && e.offsetY) {
			return {
				x : e.offsetX,
				y : e.offsetY
			};
		}
		var obj = e.target;
		var currleft = obj.offsetLeft;
		var currtop = obj.offsetTop;
		while((obj = obj.offsetParent)) {
			currleft += obj.offsetLeft;
			currtop += obj.offsetTop;
		}
		return {
			x : e.pageX - currleft,
			y : e.offsetY = e.pageY - currtop
		};
	}

	var color_width = 200;
	var color_radius = 180;
	var gap = 10;
	var lum_width = 35;
	var height = color_width;

	var box = document.createElement('canvas');
	var context = null;
	if(box.getContext) {
		box.setAttribute('width', color_width + lum_width);
		box.setAttribute('height', height);

		context = box.getContext('2d');
		var colorCircleData = context.getImageData(0, 0, color_width + gap, height);
		var data = colorCircleData.data;

		// not sure if the color patch should reflect the luminance or not
		var new_hsl = {
			l : 0.5
		};
		for(var i = 0; i < colorCircleData.height; i++) {
			for(var j = 0; j < color_width; j++) {
				var hs = i_jToHS(i, j);
				new_hsl.h = hs.h;
				new_hsl.s = hs.s;
				if(new_hsl.s > 1) {
					continue;
				}

				var rgb = hsl2rgb(new_hsl);
				var index = (i * colorCircleData.width + j) * 4;
				data[index] = rgb.r;
				data[index + 1] = rgb.g;
				data[index + 2] = rgb.b;
				data[index + 3] = 255;
			}
		}

		var draggingColorCircle = false, draggingLum = false;
		xAddListener(box, 'mousedown', function(e) {
			if(e.button === 0) {
				var cursor = "pointer";
				if(inColorCircle(e)) {
					draggingColorCircle = true;
				} else if(inLum(e)) {
					draggingLum = true;
				} else {
					cursor = "default";
				}
				box.style.cursor = cursor; // this doesn't work in stupid
											// chrome

				mouseMoved(e);
			}
		}, false);
		xAddListener(box, 'mouseup', function(e) {
			if(e.button === 0) {
				draggingColorCircle = draggingLum = false;
				box.style.cursor = "default";
				redraw();
			}
		}, false);

		var mouseMoved = function(e) {
			var pt;
			if(draggingColorCircle) {
				pt = getPoint(e);
				var hs = i_jToHS(pt.y, pt.x);
				hs.s = Math.min(1, hs.s);
				hs.l = selectedHSL.l;
				setSelectedHSL(hs);
			} else if(draggingLum) {
				pt = getPoint(e);
				var lum = 1 - (pt.y - gap) / (height - 2 * gap);
				lum = Math.min(1, Math.max(0, lum));
				var hsl = {
					h : selectedHSL.h,
					s : selectedHSL.s,
					l : lum
				};
				setSelectedHSL(hsl);
			}
		};
		xAddListener(box, 'mousemove', mouseMoved, false);
	}
	function redraw() {
		if(!context) {
			// not all browsers support the canvas element =(
			return;
		}
		context.clearRect(0, 0, color_width + lum_width, height);
		context.putImageData(colorCircleData, 0, 0);
		
		var i, rgb;
		var new_hsl = {
				h : selectedHSL.h,
				s : selectedHSL.s
		};
		var imgData = context.getImageData(color_width, 0, lum_width, height);
		var data = imgData.data;
		for(i = gap; i < imgData.height - gap; i++) {
			new_hsl.l = 1 - ((i - gap) / (imgData.height - 2 * gap));
			rgb = hsl2rgb(new_hsl);
			for( var j = gap; j < lum_width - gap; j++) {
				var index = (i * lum_width + j) * 4;
				data[index] = rgb.r;
				data[index + 1] = rgb.g;
				data[index + 2] = rgb.b;
				data[index + 3] = 255;
			}
		}
		context.putImageData(imgData, color_width, 0);
		
		rgb = [ selectedRGB.r, selectedRGB.g, selectedRGB.b ];
		for(i = 0; i < rgb.length; i++) {
			rgb[i] = 255 - rgb[i];
		}
		context.strokeStyle = 'rgb(' + rgb.join(',') + ')';
		if(!draggingColorCircle) {
			var ij = hsToIJ(selectedHSL);
			var x_size = 10;
			var x_hollow = 4;
			context.beginPath();
			context.moveTo(ij.j - x_size, ij.i);
			context.lineTo(ij.j - x_hollow, ij.i);
			context.closePath();
			context.stroke();
			context.beginPath();
			context.moveTo(ij.j + x_size, ij.i);
			context.lineTo(ij.j + x_hollow, ij.i);
			context.closePath();
			context.stroke();
			context.beginPath();
			context.moveTo(ij.j, ij.i + x_size);
			context.lineTo(ij.j, ij.i + x_hollow);
			context.closePath();
			context.stroke();
			context.beginPath();
			context.moveTo(ij.j, ij.i - x_size);
			context.lineTo(ij.j, ij.i - x_hollow);
			context.closePath();
			context.stroke();
		}
		
		// drawing lum
		var y = (1 - selectedHSL.l) * (height - 2 * gap) + gap;
		context.beginPath();
		context.moveTo(color_width, y);
		context.lineTo(color_width + gap, y);
		context.closePath();
		context.stroke();
		context.beginPath();
		context.moveTo(color_width + lum_width - gap, y);
		context.lineTo(color_width + lum_width, y);
		context.closePath();
		context.stroke();
	}

	var button_width = 110;

	function rgbChanged() {
		var rgb = {
			r : redBox.value,
			g : greenBox.value,
			b : blueBox.value
		};
		for(var key in rgb) {
			if(rgb.hasOwnProperty(key)) {
				rgb[key] = parseInt(rgb[key], 10);
				if(isNaN(rgb[key])) {
					rgb[key] = selectedRGB[r];
				}
				rgb[key] = Math.max(Math.min(rgb[key], 255), 0);
			}
		}
		setSelectedRGB(rgb);
	}

	function createRGBInput(color) {
		var label = document.createElement('label');
		label.setAttribute('for', color);
		label.style.fontFamily = 'monospace';
		label.appendChild(document.createTextNode(color + ': '));

		var input = document.createElement('input');
		input.id = color;
		input.style.width = 70 + 'px';
		input.style.marginRight = '4px';
		input.style.marginTop = '2px';
		input.setAttribute('type', 'number');
		input.setAttribute('min', 0);
		input.setAttribute('max', 255);
		input.setAttribute('step', 1);
		xAddListener(input, 'change', rgbChanged, false);

		var div = document.createElement('div');
		div.field = input;
		div.appendChild(label);
		div.appendChild(input);
		return div;
	}
	var accept = document.createElement('input');
	accept.setAttribute('type', 'button');
	accept.setAttribute('value', 'Accept');
	accept.style.width = button_width + 'px';

	var reset = document.createElement('input');
	reset.setAttribute('type', 'button');
	reset.setAttribute('value', 'Reset');
	reset.style.width = button_width + 'px';

	var red = createRGBInput('R');
	var redBox = red.field;
	var green = createRGBInput('G');
	var greenBox = green.field;
	var blue = createRGBInput('B');
	var blueBox = blue.field;

	var buttons = document.createElement('div');
	buttons.appendChild(red);
	buttons.appendChild(document.createElement('br'));
	buttons.appendChild(green);
	buttons.appendChild(document.createElement('br'));
	buttons.appendChild(blue);
	buttons.appendChild(document.createElement('br'));
	buttons.appendChild(reset);
	buttons.appendChild(document.createElement('br'));
	buttons.appendChild(accept);

	// TODO - the 15 and 26 were found via trial and error, and probably aren't
	// too solid
	var weird_gap = 15;
	var titlebar = 21;

	this.preferredWidth = weird_gap + button_width;
	this.preferredHeight = height;
	if(context) {
		this.preferredWidth += color_width + lum_width;
		// don't even bother figuring out what the next 2 lines do, just live
		// with them
		this.preferredHeight += titlebar;
		titlebar += 10;
	}
	var element = this.element = document.createElement('div');
	element.style.width = this.preferredWidth + 'px';
	element.style.height = this.preferredHeight + 'px';

	// buttons.style.cssFloat = 'right';
	buttons.style.position = 'absolute';
	// buttons.style.left = (this.preferredWidth-button_width)/2. + 'px';
	buttons.style.right = '5px';
	buttons.style.top = titlebar + 'px';

	this.element.appendChild(box);
	this.element.appendChild(buttons);

	xAddListener(accept, 'click', function() {
		callback(rgb2hex(selectedRGB));
	}, false);

	var defaultRGB, selectedRGB, selectedHSL;
	function setSelectedRGB(rgb) {
		selectedRGB = rgb;
		selectedHSL = rgb2hsl(rgb);
		redBox.value = selectedRGB.r;
		greenBox.value = selectedRGB.g;
		blueBox.value = selectedRGB.b;
		element.style.backgroundColor = '#' + rgb2hex(selectedRGB);
		redraw();
	}
	function setSelectedHSL(hsl) {
		selectedHSL = hsl;
		selectedRGB = hsl2rgb(hsl);
		redBox.value = selectedRGB.r;
		greenBox.value = selectedRGB.g;
		blueBox.value = selectedRGB.b;
		element.style.backgroundColor = '#' + rgb2hex(selectedRGB);
		redraw();
	}
	this.setDefaultColor = function(color) {
		defaultRGB = hex2rgb(color);
		setSelectedRGB(defaultRGB);
	};
	xAddListener(reset, 'click', function() {
		setSelectedRGB(defaultRGB);
	}, false);
}
//generated from http://ajaxload.info/
var WAITING_ICON_HEIGHT = 11;
var WAITING_ICON = 'media/ajax-loader.gif';

// LOADING_IMAGE = WAITING_ICON;
// from http://en.wikipedia.org/wiki/Data_URI_scheme
var LOADING_IMAGE = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAABGdBTUEAALGPC/xhBQAAAAlwSFlzAAALEwAACxMBAJqcGAAAAAd0SU1FB9YGARc5KB0XV+IAAAAddEVYdENvbW1lbnQAQ3JlYXRlZCB3aXRoIFRoZSBHSU1Q72QlbgAAAF1JREFUGNO9zL0NglAAxPEfdLTs4BZM4DIO4C7OwQg2JoQ9LE1exdlYvBBeZ7jqch9//q1uH4TLzw4d6+ErXMMcXuHWxId3KOETnnXXV6MJpcq2MLaI97CER3N0vr4MkhoXe0rZigAAAABJRU5ErkJggg==";

/*** START IE hacks ***/
// from http://snipplr.com/view.php?codeview&id=13523
if(!window.getComputedStyle) {
	window.getComputedStyle = function(el, pseudo) {
		this.el = el;
		this.getPropertyValue = function(prop) {
			var re = /(\-([a-z]){1})/g;
			if(prop == 'float') {
				prop = 'styleFloat';
			}
			if(re.test(prop)) {
				prop = prop.replace(re, function() {
					return arguments[2].toUpperCase();
				});
			}
			return el.currentStyle[prop] ? el.currentStyle[prop] : null;
		};
		return this;
	};
}
if(!String.prototype.trim) {
	String.prototype.trim = function() {
		return this.match(/\s*(\S*)\s*/)[1];
	};
}
function xAddListener(obj, event, func, useCapture) {
	if(obj.addEventListener) {
		obj.addEventListener(event, func, useCapture);
	} else {
		obj.attachEvent('on' + event, function(e) {
			func.call(obj, e);
		});
	}
}
/*** END IE HACKS ***/

function setUnfocusable(el) {
	xAddListener(el, 'focus', el.blur, false);
}
function randomString(length) {
	var MIN = 'a'.charCodeAt(0);
	var MAX = 'z'.charCodeAt(0);

	var str = "";
	for(var i = 0; i < length; i++) {
		str += String.fromCharCode(MIN + Math.floor(Math.random() * (MAX - MIN)));
	}

	return str;
}
function isInteger(s) {
	return s.toString().match(/^-?[0-9]+$/);
}

function deleteChildren(element) {
	while(element.firstChild) {
		element.removeChild(element.firstChild);
	}
}
function parsePx(px) {
	return parseInt(px.replace(/px/g, ""), 10);
}
function getPosition(el) {
	var currLeft = 0;
	var currTop = 0;
	while(el) {
		currLeft += el.offsetLeft;
		currTop += el.offsetTop;
		el = el.offsetParent;
	}
	return {
		x : currLeft,
		y : currTop
	};
}
// returns a shallow copy of obj
function clone(obj) {
	var o = {};
	for(var k in obj) {
		if(obj.hasOwnProperty(k)) {
			o[k] = obj[k];
		}
	}
	return o;
}

function ScrambleStuff(scrambler, loadedCallback, applet) {
	var configuration = scrambler.configuration;
	var puzzle = null;
	var colorScheme = null;
	var faceMap = null;
	var defaultColorScheme = null;
	var defaultSize = null;

	function puzzleChanged(altArrow) {
		newPuzzle = puzzleSelect.getSelected();

		if(newPuzzle == puzzle) {
			return;
		}
		
		if(importedScrambles) {
			if(confirm("Since you're changing puzzles, would you like to clear the currently imported scrambles?")) {
				importedScrambles = null;
			} else {
				scrambleIndex--;
			}
		}

		colorScheme = null; // reset colorscheme
		currTurn = null;
		faceMap = null; // this indicates if the current puzzle support images
		currScramble = null;
		puzzle = newPuzzle;
		scrambleImg.clear();

		if(!puzzle) {
			return;
		}

		// we only fire a change if a puzzle is actually selected
		firePuzzleChanged(altArrow);

		scramble();
		var width = configuration.get('scramble.' + puzzle + '.size.width', null);
		var height = configuration.get('scramble.' + puzzle + '.size.height', null);
		if(width && height) {
			scrambleDiv.style.height = height;
			scrambleDiv.style.width = width;
		} else {
			//we'll have to wait for the scramble info to load to know how big to make the scramble
			width = height = null;
		}

		scrambler.loadPuzzleImageInfo(
			function(puzzleImageInfo) {
				if(puzzleImageInfo.error) {
					faceMap = null; // scramble images are not supported
					scrambleDiv.setVisible(false, true);
				} else {
					// if the scramble has arrived, we format it into the turns
					if(currScramble) {
						formatScramble();
					}

					faceMap = puzzleImageInfo.faces;
					colorScheme = configuration.get('scramble.' + puzzle + '.colorScheme', clone(puzzleImageInfo.colorScheme));
					defaultColorScheme = puzzleImageInfo.colorScheme;

					defaultSize = puzzleImageInfo.size;
					if(!width || !height) {
						scrambleDiv.style.width = puzzleImageInfo.size.width + getScrambleHorzPadding() + "px";
						scrambleDiv.style.height = (puzzleImageInfo.size.height + getScrambleVertPadding()) + "px";
					}
					scrambleResized();
				}
			}, puzzle);
	}

	var scrambleChooser = document.createElement('input');
	scrambleChooser.setAttribute('type', 'number');
	scrambleChooser.setAttribute('min', 1);
	scrambleChooser.setAttribute('step', 1);
	xAddListener(scrambleChooser, 'change', function(e) {
		// the call to deleteChildren(scrambleInfo) in scramble()
		// causes this listener to get called
		if(scrambling) {
			return;
		}

		if(!isInteger(this.value)) {
			//don't do anything to scrambleIndex
		} else if(this.value < 1) {
			scrambleIndex = 0;
		} else if(this.value > importedScrambles.length) {
			scrambleIndex = importedScrambles.length - 1;
		} else {
			scrambleIndex = (this.value - 1);
		}
		// scramble() will update scrambleChooser.value
		scramble();
	}, false);
	function unscramble(time) {
		if(time.hasOwnProperty("importInfo") && time.importInfo.importedScrambles) {
			var info = time.importInfo;
			scrambleIndex = info.scrambleIndex;
			scrambleSrc = info.scrambleSrc;
			importedScrambles = info.importedScrambles;
			scramble();
		} else {
			scrambleIndex = 0;
			scrambleSrc = null;
			importedScrambles = null;
			scrambleLoaded(time.scramble);
		}
	}
	var scrambling = false;
	function scramble() {
		if(puzzle === null) {
			return;
		}
		scrambling = true;
		deleteChildren(scramblePre);

		if(importedScrambles && scrambleIndex >= importedScrambles.length) {
			scrambleIndex = 0;
			scrambleSrc = null;
			importedScrambles = null;
		}

		if(importedScrambles === null) {
			deleteChildren(scrambleInfo);

			scramblePre.appendChild(document.createTextNode('Loading scramble...'));
			resize(); //update scramble font size
			scrambler.loadScramble(scrambleLoaded, puzzle, null);
		} else {
			deleteChildren(scrambleInfo);
			scrambleInfo.appendChild(document.createTextNode(" Scramble ("));
			scrambleChooser.setAttribute('max', importedScrambles.length);
			scrambleChooser.setAttribute('size', 1 + Math.floor(Math.log(importedScrambles.length) / Math.log(10)));
			scrambleChooser.value = (scrambleIndex + 1);
			scrambleInfo.appendChild(scrambleChooser);
			scrambleInfo.appendChild(document.createTextNode("/" + importedScrambles.length + ")"));
			if(scrambleSrc) {
				scrambleInfo.appendChild(document.createTextNode(" from "));
				scrambleInfo.appendChild(scrambleSrc);
			}

			scrambleLoaded(importedScrambles[scrambleIndex]);
			scrambleIndex++;
		}

		fireScrambleChanged();
		scrambling = false;
	}
	function turnClicked(automated) {
		if(isChangingColorScheme) {
			// first, we cancel editing of the colorscheme
			changeColorsClicked.call(changeColors);
		}
		if(currTurn) {
			currTurn.className = 'turn';
		}
		currTurn = this;
		currTurn.className = 'currTurn';
		scrambleDiv.setVisible(true, automated);
		scrambleImg.drawScramble(currTurn.incrementalScramble);
	}
	function userClickedTurn() {
		turnClicked.call(this, false);
	}

	var currScramble = null;
	function scrambleLoaded(scramble) {
		currScramble = scramble;

		if(!faceMap) {
			// scramble images are not supported, so don't bother with links
			deleteChildren(scramblePre);
			scramblePre.appendChild(document.createTextNode(scramble));
			resize(); //update scramble font size
		} else {
			formatScramble();
		}
	}

	function formatScramble() {
		if(!currScramble) {
			return;
		}
		deleteChildren(scramblePre);
		var turns = currScramble.split(' ');
		var incrementalScramble = "";
		var maxLength = 0;
		var i, j, turn, newLines;
		for(i = 0; i < turns.length; i++) {
			newLines = turns[i].split("\n");
			for(j = 0; j < newLines.length; j++) {
				turn = newLines[j];
				maxLength = Math.max(maxLength, turn.length);
			}
		}
		for(i = 0; i < turns.length; i++) {
			newLines = turns[i].split("\n");
			for(j = 0; j < newLines.length; j++) {
				if(j > 0) {
					scramblePre.appendChild(document.createElement('br'));
				}
				turn = newLines[j];
				incrementalScramble += turn;
				//TODO - disable if the scramble fits on one line!
				var padding = "";
				if(maxLength - turn.length <= 3) {
					// We only pad if it can be done in <= 3 spaces.
					// If we can't, we'll just leave the turn be.
					// This is basically a hack so the "/" turns in sq1
					// don't get padded.
					for(var k = turn.length; k < maxLength; k++) {
						padding += " "; //padding so all turns take up the same amount of space
					}
				}
				var turnPadding = document.createElement('span');
				turnPadding.className = "padding";
				turnPadding.appendChild(document.createTextNode(padding));
				
				var turnLink = document.createElement('span');
				turnLink.appendChild(document.createTextNode(turn));
				turnLink.incrementalScramble = incrementalScramble;
				turnLink.className = 'turn';
				xAddListener(turnLink, 'click', userClickedTurn, false);
				scramblePre.appendChild(turnLink);
				scramblePre.appendChild(turnPadding);
				if(i == turns.length - 1) {
					turnClicked.call(turnLink, true);
				} else {
					incrementalScramble += " ";
					scramblePre.appendChild(document.createTextNode(' '));
				}
			}
		}
		resize(); //update scramble font size
	}

	var currFaceName = null;
	function faceClicked() {
		currFaceName = this.faceName;
		colorChooserDiv.style.display = 'inline';
		colorChooser.setDefaultColor(colorScheme[currFaceName]);
		deleteChildren(colorChooserHeaderText);
		colorChooserHeaderText.appendChild(document.createTextNode('Editing face ' + currFaceName));
	}

	function getScrambleVertPadding() {
		// var headerStyle = window.getComputedStyle(scrambleDivHeader, null);
		// var scrambleHeader = parsePx(headerStyle.getPropertyValue("height"))
		// + parsePx(headerStyle.getPropertyValue("border-bottom-width"));
		var scrambleHeader = 20 + 1 + 2; // apparently dynamically computing
		// this doesn't work on opera
		var scrambleStyle = window.getComputedStyle(scrambleImg, null);
		return parsePx(scrambleStyle.getPropertyValue("padding-top")) + parsePx(scrambleStyle.getPropertyValue("padding-bottom")) + scrambleHeader;
	}
	function getScrambleHorzPadding() {
		var scrambleStyle = window.getComputedStyle(scrambleImg, null);
		return parsePx(scrambleStyle.getPropertyValue("padding-left")) + parsePx(scrambleStyle.getPropertyValue("padding-right"));
	}

	function scrambleMoved() {
		configuration.set('scramble.location.top', scrambleDiv.style.top);
		configuration.set('scramble.location.left', scrambleDiv.style.left);
	}

	function scrambleResized() {
		var desiredWidth = parsePx(scrambleDiv.style.width) - getScrambleHorzPadding();
		var desiredWidthHeight = desiredWidth * defaultSize.height / defaultSize.width;
		var desiredHeight = parsePx(scrambleDiv.style.height) - getScrambleVertPadding();
		var desiredHeightWidth = desiredHeight * defaultSize.width / defaultSize.height;
		var imgWidth = Math.max(desiredWidth, desiredHeightWidth, defaultSize.width);
		var imgHeight = Math.max(desiredHeight, desiredWidthHeight, defaultSize.height);
		scrambleImg.style.width = imgWidth + "px";
		scrambleImg.style.height = imgHeight + "px";
		scrambleDiv.style.width = (imgWidth + getScrambleHorzPadding()) + "px";
		scrambleDiv.style.height = (imgHeight + getScrambleVertPadding()) + "px";
		positionWindows();
	}
	function saveScrambleSize() {
		configuration.set('scramble.' + puzzle + '.size.width', scrambleDiv.style.width);
		configuration.set('scramble.' + puzzle + '.size.height', scrambleDiv.style.height);
		scrambleImg.redraw();
		deleteChildren(scrambleImgMap);
		if(isChangingColorScheme) {
			var imgWidth = parsePx(scrambleDiv.style.width) - getScrambleHorzPadding();
			var scale = imgWidth / defaultSize.width;
			var areas = tnoodle.scrambles.createAreas(faceMap, scale);
			var updateHeader = function() {
				deleteChildren(scrambleHeaderText);
				scrambleHeaderText.appendChild(document.createTextNode(this.faceName));
			};
			var emptyHeader = function() {
				deleteChildren(scrambleHeaderText);
			};
			for(var i = 0; i < areas.length; i++) {
				var area = areas[i];
				area.setAttribute('alt', area.faceName);
				xAddListener(area, 'click', faceClicked, false);

				xAddListener(area, 'mouseover', updateHeader, false);
				xAddListener(area, 'mouseout', emptyHeader, false);
				scrambleImgMap.appendChild(area);
			}
		}
	}

	function changeColorsClicked() {
		isChangingColorScheme = !isChangingColorScheme;
		if(isChangingColorScheme) {
			if(currTurn) {
				currTurn.className = "turn";
			}
			this.className += " buttondown";
			resetColorScheme.style.display = 'inline';
			scrambleImg.redraw();
		} else {
			if(currTurn) { // curr turn will not be defined if we just changed puzzles
				turnClicked.call(currTurn, true);
			}
			this.className = this.className.replace(/\bbuttondown\b/, "");
			colorChooserDiv.style.display = 'none'; // close cholor chooser window
			resetColorScheme.style.display = 'none';
		}
		saveScrambleSize(); // force image area map to be created
	}

	function puzzlesLoaded(puzzles) {
		deleteChildren(scramblePre);
		puzzleSelect.setDisabled(false);
		var options = [];
		for(var i = 0; i < puzzles.length; i++) {
			var iconUrl = scrambler.getPuzzleIconUrl(puzzles[i][0]);
			options.push({ value: puzzles[i][0], text: puzzles[i][1], icon: iconUrl });
		}
		puzzleSelect.setOptions(options);
		loadedCallback(puzzles);
	}

	//this is up here so hide() can have access to it
	var waitingIcon = document.createElement('img');
	waitingIcon.src = WAITING_ICON;
	waitingIcon.style.display = 'none';
	waitingIcon.style.marginTop = (18 - 11) / 2 + 'px';
	waitingIcon.style.cssFloat = waitingIcon.style.styleFloat = 'right';
	
	var scrambleIndex = 0;
	var importedScrambles = null;
	function scramblesImported(scrambles) {
		newScrambles.value = scrambles.error || scrambles.join("\n");
		importButton.update();
		activeImportButton.disabled = false;
		waitingIcon.style.display = 'none';
	}

	var currImportLink = null;
	function setCurrImportLink(newLink) {
		scrambleSrc = null;
		if(currImportLink == newLink) {
			return false;
		}
		if(currImportLink) {
			currImportLink.className = currImportLink.className.replace(/\bdown\b/, '');
		}
		newLink.className += ' down';
		currImportLink = newLink;

		newScrambles.value = '';
		importButton.update();
		return true;
	}

	var activeImportRequest = null;
	var activeImportButton = null;
	var scrambleSrc = null;

	var urlForm = null;
	var urlText = null;
	var DEFAULT_URL = "http://nascarjon.us/sunday.txt";
	function promptImportUrl() {
		if(!setCurrImportLink(this)) {
			return;
		}
		if(urlForm === null) { // pretty much copied from promptSeed()
			urlForm = document.createElement('form');
			urlForm.style.cssFloat = urlForm.style.styleFloat = 'left'; // stupid
			// ie
			urlText = document.createElement('input');
			urlText.value = DEFAULT_URL;
			urlText.type = 'text';
			urlText.style.width = '200px';
			xAddListener(urlText, 'input', function(e) {
				loadScramblesButton.disabled = (this.value.length === 0);
			}, false);
			var loadScramblesButton = document.createElement('input');
			loadScramblesButton.type = 'submit';
			loadScramblesButton.value = 'Load Scrambles';
			urlForm.onsubmit = function() {
				var url = urlText.value;
				scrambleSrc = document.createElement('a');
				scrambleSrc.href = url;
				scrambleSrc.target = '_blank';
				scrambleSrc.appendChild(document.createTextNode(url));

				waitingIcon.style.display = 'inline';
				activeImportRequest = scrambler.importScrambles(scramblesImported, url);
				(activeImportButton = loadScramblesButton).disabled = true;
				return false;
			};

			urlForm.appendChild(urlText);
			urlForm.appendChild(loadScramblesButton);
		}
		deleteChildren(importArea);
		importArea.appendChild(urlForm);

		urlText.focus();
		urlText.select();
	}

	var uploadForm = null;
	function promptImportFile() {
		if(!setCurrImportLink(this)) {
			return;
		}
		if(uploadForm === null) {
			uploadForm = scrambler.getUploadForm(function(fileName, submitButton, request) {
				scrambleSrc = document.createElement('span');
				var em = document.createElement('em');
				em.appendChild(document.createTextNode(fileName));
				scrambleSrc.appendChild(em);

				waitingIcon.style.display = 'inline';
				activeImportRequest = request;
				(activeImportButton = submitButton).disabled = true;
			}, scramblesImported);
			uploadForm.style.cssFloat = uploadForm.style.styleFloat = 'left'; // stupid
			// ie
		}
		deleteChildren(importArea);
		importArea.appendChild(uploadForm);
	}

	var seedForm = null;
	var seedText = null;
	var scrambleCount = null;
	function promptSeed() {
		if(!setCurrImportLink(this)) {
			return;
		}
		if(seedForm === null) {
			seedForm = document.createElement('form');
			seedForm.style.cssFloat = seedForm.style.styleFloat = 'left'; // stupid ie

			seedText = document.createElement('input');
			seedText.setAttribute('type', 'text');
			seedText.style.width = '160px';
			seedText.setAttribute('title', "If you agree upon a seed with someone else, you'll be guaranteed to get the same scrambles as them. Leave blank for totally random scrambles.");

			scrambleCount = document.createElement('input');
			scrambleCount.setAttribute('type', 'number');
			scrambleCount.setAttribute('step', '1');
			scrambleCount.setAttribute('min', '1');
			scrambleCount.setAttribute('size', '4'); // adding 1 for opera
			scrambleCount.value = 12;

			var loadScramblesButton = document.createElement('input');
			loadScramblesButton.setAttribute('type', 'submit');
			loadScramblesButton.value = 'Seed Scrambles';
			seedForm.onsubmit = function() {
				var seed = seedText.value;
				if(seed.length === 0) {
					seed = null; // this will use pregenerated scrambles,
					// which should be a lot faster
				}

				var count = parseInt(scrambleCount.value, 10);
				if(!count) {
					return false;
				}
				scrambleSrc = document.createElement('span');
				scrambleSrc.appendChild(document.createTextNode("seed "));
				var linky = document.createElement('em');
				linky.appendChild(document.createTextNode(seed));
				scrambleSrc.appendChild(linky);

				waitingIcon.style.display = 'inline';
				activeImportRequest = scrambler.loadScrambles(scramblesImported, puzzle, seed, count);
				(activeImportButton = loadScramblesButton).disabled = true;
				return false;
			};

			seedForm.appendChild(seedText);
			seedForm.appendChild(scrambleCount);
			seedForm.appendChild(loadScramblesButton);
		}
		deleteChildren(importArea);
		importArea.appendChild(seedForm);

		seedText.value = randomString(10);
		seedText.focus();
		seedText.select();
	}

	var isChangingColorScheme = false;

	var scrambleArea = document.createElement('div');
	scrambleArea.className = 'scrambleArea';

	function show() {
		if(currImportLink === null) {
			//initialization
			promptImportUrl.call(importUrlLink);
		}
	}
	function hide() {
		// cancel any outgoing requests
		if(activeImportRequest) {
			activeImportRequest.abort();
		}
		if(activeImportButton) {
			activeImportButton.disabled = false;
		}
		waitingIcon.style.display = 'none';
	}
	
	var importDiv = tnoodle.tnt.createPopup(show, hide);
	
	var importDivTabs = document.createElement('span');
	importDiv.appendChild(importDivTabs);
	
	var importUrlLink = document.createElement('span');
	importUrlLink.title = "Import scrambles from url";
	importUrlLink.className = 'link';
	xAddListener(importUrlLink, 'click', promptImportUrl, false);
	importUrlLink.appendChild(document.createTextNode('From Url'));
	importDivTabs.appendChild(importUrlLink);
	importDivTabs.appendChild(document.createTextNode(' '));

	var importFileLink = document.createElement('span');
	importFileLink.title = "Import scrambles from file";
	importFileLink.className = 'link';
	xAddListener(importFileLink, 'click', promptImportFile, false);
	importFileLink.appendChild(document.createTextNode('From File'));
	importDivTabs.appendChild(importFileLink);
	importDivTabs.appendChild(document.createTextNode(' '));

	var seedLink = document.createElement('span');
	seedLink.title = "Generate scrambles from a seed, perfect for racing!";
	seedLink.className = 'link';
	xAddListener(seedLink, 'click', promptSeed, false);
	seedLink.appendChild(document.createTextNode('Seed'));
	importDivTabs.appendChild(seedLink);

	var tempDiv = document.createElement('div');
	tempDiv.style.overflow = 'hidden'; // need this for ie
	importDiv.appendChild(tempDiv);

	var importArea = document.createElement('span');
	tempDiv.appendChild(importArea);

	tempDiv.appendChild(waitingIcon);

	var newScrambles = document.createElement('textarea');
	newScrambles.setAttribute('wrap', 'off');
	newScrambles.style.width = '420px';
	newScrambles.style.height = '180px';
	newScrambles.getScrambles = function() {
		var scrambles = newScrambles.value.split('\n');
		for( var i = scrambles.length - 1; i >= 0; i--) {
			if(scrambles[i].trim().length === 0) {
				scrambles.splice(i, 1); // remove all empty rows
			}
		}
		return scrambles;
	};
	importDiv.appendChild(newScrambles);

	tempDiv = document.createElement('div');
	tempDiv.style.textAlign = 'right';
	importDiv.appendChild(tempDiv);

	var importButton = document.createElement('input');
	importButton.type = 'button';
	importButton.update = function() {
		var scrambles = newScrambles.getScrambles();
		importButton.value = 'Import';
		if(scrambles.length > 0) {
			importButton.value += ' ' + scrambles.length + " scramble(s)";
		}
		importButton.disabled = scrambles.length === 0;
	};

	xAddListener(newScrambles, 'input', function(e) {
		importButton.update();
	});
	xAddListener(importButton, 'click', function() {
		var scrambles = newScrambles.getScrambles();
		if(scrambles.length > 0) {
			importedScrambles = scrambles;
			scrambleIndex = 0;
			scramble();
			importDiv.hide();
		}
	}, false);
	tempDiv.appendChild(importButton);

	var cancelImportButton = document.createElement('input');
	cancelImportButton.type = 'button';
	cancelImportButton.value = 'Cancel';
	xAddListener(cancelImportButton, 'click', function() {
		importDiv.hide();
	});
	tempDiv.appendChild(cancelImportButton);

	var scrambleHeader = document.createElement('div');
	scrambleHeader.className = 'scrambleHeader';
	scrambleArea.appendChild(scrambleHeader);

	var importLink = document.createElement('span');
	importLink.className = 'link';
	importLink.appendText('Import');
	xAddListener(importLink, 'click', importDiv.show, false);
	scrambleHeader.appendChild(importLink);
	scrambleHeader.appendChild(document.createTextNode(' '));

	var newScrambleLink = document.createElement('span');
	newScrambleLink.className = 'link';
	newScrambleLink.title = "Get a new scramble (Note: Clears any imported scrambles!)";
	newScrambleLink.appendText('New scramble');
	xAddListener(newScrambleLink, 'click', function() {
		if(!importedScrambles || confirm('This will clear any imported scrambles, are you sure you want to continue?')) {
			importedScrambles = null;
			scramble();
		}
	}, false);
	scrambleHeader.appendChild(newScrambleLink);

	/*
	 * TODO use something like zero copy here? or do what google maps does and
	 * popup a selected text box? var copyLink = document.createElement('span');
	 * copyLink.className = 'link'; xAddListener(copyLink, 'click', function() {
	 * console.log(this); }, false);
	 * copyLink.appendChild(document.createTextNode('Copy'));
	 * scrambleHeader.appendChild(copyLink);
	 * scrambleHeader.appendChild(document.createTextNode(' '));
	 */

	var scrambleInfo = document.createElement('span');
	scrambleHeader.appendChild(scrambleInfo);

	var scramblePre = document.createElement('pre');
	scramblePre.className = 'scrambleText';
	scrambleArea.appendChild(scramblePre);

	var scrambleDiv = document.createElement('div');
	scrambleDiv.style.display = 'none';
	scrambleDiv.className = 'window';
	document.body.appendChild(scrambleDiv);

	var scrambleDivHeader = document.createElement("div");
	scrambleDivHeader.className = 'titlebar';
	scrambleDiv.appendChild(scrambleDivHeader);
	scrambleDiv.setStyle('z-index', 4);
	scrambleDiv.id = 'scrambleDiv'; // have to have an id to make it draggable
	scrambleDiv.invisiblePuzzles = configuration.get('scramble.invisiblePuzzles', {});
	scrambleDiv.setVisible = function(visible, automated) {
		if(automated) {
			visible &= !this.invisiblePuzzles[puzzle];
		} else {
			this.invisiblePuzzles[puzzle] = !visible;
			configuration.set('scramble.invisiblePuzzles', this.invisiblePuzzles);
		}
		if(visible) {
			scrambleDiv.style.display = 'inline';
			//we must wait for the scramble to become visible before we make it fit on the page
			setTimeout(positionWindows, 0);
		} else {
			if(currTurn) {
				currTurn.className = 'turn';
			}
			scrambleDiv.style.display = 'none';
			colorChooserDiv.style.display = 'none';
		}
	};

	var scrambleHeaderText = document.createElement("span");
	scrambleHeaderText.className = 'titletext';
	scrambleDivHeader.appendChild(scrambleHeaderText);

	var closeScramble = document.createElement('span');
	closeScramble.appendChild(document.createTextNode('X'));
	closeScramble.className = 'button close';
	closeScramble.title = 'Close';
	xAddListener(closeScramble, 'click', function() {
		scrambleDiv.setVisible(false, false);
	}, false);
	scrambleDivHeader.appendChild(closeScramble);

	var minimizeScramble = document.createElement('span');
	minimizeScramble.appendChild(document.createTextNode('*'));
	minimizeScramble.className = 'button close';
	minimizeScramble.title = 'Reset size';
	xAddListener(minimizeScramble, 'click', function() {
		scrambleDiv.style.width = defaultSize.width + getScrambleHorzPadding() + "px";
		scrambleDiv.style.height = defaultSize.height	+ getScrambleVertPadding() + "px";
		scrambleResized();
		saveScrambleSize();
	}, false);
	scrambleDivHeader.appendChild(minimizeScramble);

	var changeColors = document.createElement('span');
	changeColors.className = 'button changeColors';
	changeColors.setAttribute('title', 'Change color scheme');
	xAddListener(changeColors, 'click', changeColorsClicked, false);
	scrambleDivHeader.appendChild(changeColors);

	var resetColorScheme = document.createElement('span');
	// resetColorScheme.appendChild(document.createTextNode('*'));
	resetColorScheme.setAttribute('title', 'Reset color scheme');
	resetColorScheme.className = 'button reset';
	resetColorScheme.style.display = 'none';
	xAddListener(resetColorScheme, 'click', function() {
		if(confirm("Reset the color scheme?")) {
			colorScheme = clone(defaultColorScheme);
			configuration.set('scramble.' + puzzle + '.colorScheme', colorScheme);
			scrambleImg.drawScramble("");
		}
	}, false);
	scrambleDivHeader.appendChild(resetColorScheme);
	// end scrambleDivHeader

	var scrambleImg = document.createElement('img');
	scrambleImg.setAttribute('usemap', '#scrambleImgMap');
	scrambleDiv.appendChild(scrambleImg);

	scrambleImg.redraw = function() {
		this.drawScramble(isChangingColorScheme ? "" : currScramble);
	};
	scrambleImg.drawScramble = function(scramble) {
		// no need to waste bandwidth unless we're
		// actually displaying images
		if(scrambleDiv.style.display != 'none') {
			if(scramble != currScramble) {
				// since the next image may take a while to load, we place a holder
				this.clear();
			}
			var width = configuration.get('scramble.' + puzzle + '.size.width', null);
			var height = configuration.get('scramble.' + puzzle + '.size.height', null);
			if(!width || !height) {
				width = height = null;
			} else {
				width = width.toInt() - getScrambleHorzPadding();
				height = height.toInt() - getScrambleVertPadding();
			}
			this.src = scrambler.getScrambleImageUrl(puzzle, scramble, colorScheme, width, height);
		}
	};
	scrambleImg.clear = function() {
		this.src = LOADING_IMAGE;
	};

	var scrambleImgMap = document.createElement('map');
	scrambleImgMap.setAttribute('name', 'scrambleImgMap');
	scrambleDiv.appendChild(scrambleImgMap);

	var resizeDiv = document.createElement('div');
	resizeDiv.className = "dragresize dragresize-br";
	scrambleDiv.appendChild(resizeDiv);
	// end scrambleDiv

	// Defaulting to 30px to make room for "Sign In" and "Help" links
	scrambleDiv.style.top = configuration.get('scramble.location.top', '30px');
	scrambleDiv.style.left = configuration.get('scramble.location.left', '0px');

	var scrambleDrag = new Drag(scrambleDiv, {
		handle : scrambleDivHeader
	});
	scrambleDrag.addEvent('complete', scrambleMoved);

	var scrambleResize = scrambleDiv.makeResizable( {
		handle : resizeDiv,
		snap : 0
	});
	scrambleResize.addEvent('drag', scrambleResized);
	scrambleResize.addEvent('complete', saveScrambleSize);

	var puzzleSelect = tnoodle.tnt.createSelect('Click to open last session of puzzle', 'Click to change session puzzle');
	puzzleSelect.onchange = puzzleChanged;
	puzzleSelect.setDisabled(true);

	var colorChooserDiv = document.createElement('div');
	colorChooserDiv.id = 'colorChooserDiv'; // need an id to make it draggable
	colorChooserDiv.className = 'window';
	colorChooserDiv.style.zIndex = 5;
	document.body.appendChild(colorChooserDiv);
	var titlebar = document.createElement('div');
	titlebar.className = 'titlebar';
	colorChooserDiv.appendChild(titlebar);
	var colorChooserHeaderText = document.createElement('span');
	colorChooserHeaderText.className = 'titletext';
	titlebar.appendChild(colorChooserHeaderText);

	var closeColorChooser = document.createElement('span');
	closeColorChooser.className = "button";
	closeColorChooser.appendChild(document.createTextNode('X'));
	xAddListener(closeColorChooser, 'click', function() {
		colorChooserDiv.style.display = 'none';
	}, false);
	titlebar.appendChild(closeColorChooser);
	// end titlebar
	var colorChooser = new ColorChooser(function(newColor) {
		colorScheme[currFaceName] = newColor;
		configuration.set('scramble.' + puzzle + '.colorScheme', colorScheme);
		colorChooserDiv.style.display = 'none';
		scrambleImg.redraw();
	});
	colorChooserDiv.appendChild(colorChooser.element);
	// end colorChooserDiv

	colorChooserDiv.style.width = colorChooser.preferredWidth + 'px';
	colorChooserDiv.style.height = colorChooser.preferredHeight + 'px';
	colorChooserDiv.style.display = 'none';
	var colorChooserDrag = new Drag(colorChooserDiv, {
		handle : titlebar
	});

	scramblePre.appendChild(document.createTextNode('Connecting to ' + scrambler.toString() + "..."));
	scrambler.loadPuzzles(puzzlesLoaded);

	// public variables
	this.puzzleSelect = puzzleSelect;
	this.scrambleArea = scrambleArea;
	this.scrambler = scrambler;

	// public methods
	this.scramble = scramble;
	this.unscramble = unscramble;
	this.getSelectedPuzzle = function() {
		return puzzle;
	};
	this.setSelectedPuzzle = function(newPuzzle) {
		puzzleSelect.setSelected(newPuzzle);
	};
	this.getScramble = function() {
		return currScramble;
	};
	this.getImportInfo = function() {
		return {
			importedScrambles: importedScrambles,
			scrambleIndex: scrambleIndex-1,
			scrambleSrc: scrambleSrc
		};
	};
	this.importScrambles = function(scrambles, src) {
		scrambleSrc = src;
		importedScrambles = scrambles;
		scrambleIndex = 0;
		scramble();
	};
	
	function adjustFontSize() {
		var paddingSpans = $$('.padding');
		paddingSpans.each(function(el) {
			el.setStyle('display', '');
		});
		var height = scramblePre.getStyle("height").toInt();
		// Increase font size until the scramble doesn't fit.
		// Sometimes, this can get stuck in an inf loop where
		// scramblePre grows to accomodate the increasing font
		// size. We hold onto the original height to prevent this.
		var f = scramblePre.getStyle('font-size').toInt();
		while(scramblePre.clientHeight >= scramblePre.scrollHeight) {
			scramblePre.setStyle('font-size', ++f);
			if(f > height) {
				break;
			}
		}
		
		// Decrease font size until the scramble fits
		do {
			scramblePre.setStyle('font-size', f--);
			if(f <= 10) {
				break;
			}
		} while(scramblePre.clientHeight < scramblePre.scrollHeight);

		if(paddingSpans.length > 0) {
			if(paddingSpans[0].getPosition().y == paddingSpans[paddingSpans.length-1].getPosition().y) {
				//the scramble is only taking up 1 row! so we disable the padding
				paddingSpans.each(function(el) {
					el.setStyle('display', 'none');
				});
			}

		}
	}
	
	this.resize = function() {
		var space = $('scrambles').getSize();
		space.y -= $('scrambleBorder').getSize().y + 2; //add 2 for border
		$$('.scrambleArea')[0].setStyle('height', space.y);
		space.y -= $$('.scrambleHeader')[0].getSize().y;
		var scrambleText = $$('.scrambleText')[0];
		var paddingVert = scrambleText.getStyle('padding-top').toInt() + scrambleText.getStyle('padding-bottom').toInt();
		var paddingHorz = scrambleText.getStyle('padding-left').toInt() + scrambleText.getStyle('padding-right').toInt();
		space.y -= paddingVert;
		if(space.y < 0) {
			space.y = 0;
		}
		space.x -= paddingHorz; //this doesn't work if there's a vertical scrollbar
		scramblePre.setStyle('height', space.y);
		
		adjustFontSize();
	};
	var resize = this.resize;

	var scrambleListeners = [];
	this.addScrambleChangeListener = function(l) {
		scrambleListeners.push(l);
	};
	function fireScrambleChanged() {
		for( var i = 0; i < scrambleListeners.length; i++) {
			scrambleListeners[i]();
		}
	}

	this.toggleScrambleView = function() {
		if(scrambleDiv.style.display == 'none') {
			var turns = $$('.turn'); //fun with css!
			turnClicked.call(turns[turns.length-1], false);
		} else {
			scrambleDiv.setVisible(false);
		}
	};

	var puzzleListeners = [];
	this.addPuzzleChangeListener = function(l) {
		puzzleListeners.push(l);
	};
	function firePuzzleChanged(altArrow) {
		for( var i = 0; i < puzzleListeners.length; i++) {
			puzzleListeners[i](puzzle, altArrow);
		}
	}
	
	function ensureVisible(el) {
		var pos = el.getPosition();
		pos.x--; pos.y--; //assuming the border is 1px
		var size = el.getSize();
		var avail = window.getSize();
		// NOTE: the order of the min, max is important here!
		// We can never let windows be clipped on the right hand size, else we lose
		// ability to resize them!
		pos.x = Math.min(Math.max(0, pos.x), avail.x-size.x-2);
		pos.y = Math.min(Math.max(0, pos.y), avail.y-size.y-1);
		el.getParent().setPosition(pos); //must position the parent, not the titlebar
	}
	var positioning = false;
	function positionWindows() {
		// We don't want this method to get called while it's getting called,
		// and we also don't want it to be called when the scramble isn't even visible
		if(positioning || scrambleDiv.style.display != 'inline') {
			return;
		}
		positioning = true;
		ensureVisible(scrambleDivHeader);
		ensureVisible(titlebar);
		scrambleMoved();
		positioning = false;
	}
	scrambleDrag.addEvent('complete', positionWindows);
	colorChooserDrag.addEvent('complete', positionWindows);
	window.addEvent('resize', positionWindows);
}
var KeyboardTimer = new Class({
	delay: 500, //mandatory delay in ms to wait between stopping the timer and starting the timer again
	decimalPlaces: 2,
	frequency: 0.01,
	CHAR_AR: 1/2, 
	INSPECTION: 0,
	initialize: function(parent, server, scrambleStuff) {
		var timer = this;

		this.scrambleStuff = scrambleStuff;
		this.parent = parent;
		this.server = server;
		this.config = server.configuration;
		
		this.timer = new Element('div');
		this.timer.id = 'time';
		this.timer.inject(parent);
		this.timer.setStyle('position', 'relative'); //this lets us manually center the text with js
		
		this.fullscreenBG = new Element('div', { 'class': 'fullscreenTimerBg' });
		this.fullscreenBG.setStyle('display', 'none');
		this.fullscreenBG.inject(document.body);
		
		function shownCallback() { }
		function hiddenCallback() { }
		function canHide() {
			return document.activeElement != updateFrequency && document.activeElement != inspectionSeconds;
		}
		var options = tnoodle.tnt.createOptions(shownCallback, hiddenCallback, canHide);
		var optionsDiv = options.div;
		var optionsButton = options.button;
		optionsButton.setStyles({
			position: 'absolute',
			top: 2,
			right: 5
		});
		optionsButton.inject(parent);
		
		var updateFrequency = new Element('input', {type: 'text', 'name': 'timer.frequency', size: 3});
		var frequencyChanged = function(e) {
			if(!updateFrequency.value.match(/^\d+(\.\d*)?|\.\d+$/)) {
				updateFrequency.value = "0.01";
			}
			
			if(updateFrequency.value.indexOf('.') < 0) {
				this.decimalPlaces = 0;
			} else {
				this.decimalPlaces = updateFrequency.value.length - updateFrequency.value.indexOf('.') - 1;
			}
			
			server.configuration.set('timer.frequency', updateFrequency.value);
			this.frequency = updateFrequency.value.toFloat();
		}.bind(this);
		updateFrequency.addEvent('change', frequencyChanged);
		updateFrequency.value = this.config.get('timer.frequency', "0.01");
		frequencyChanged();
		
		var frequencyDiv = new Element('div');
		frequencyDiv.adopt(updateFrequency);
		frequencyDiv.adopt(new Element('label', { 'for': 'timer.frequency', html: 'Update frequency (seconds)' }));
		optionsDiv.adopt(frequencyDiv);
		
		var inspectionDiv = new Element('div');
		var inspectionChanged = function(e) {
			var str = inspectionSeconds.value;
			if(!str.match(/^\d+$/)) {
				str = '0'; //TODO so sleepy...
				inspectionSeconds.value = str;
			}
			this.INSPECTION = str.toInt(10);
			server.configuration.set('timer.inspectionSeconds', this.INSPECTION);
		}.bind(this);
		var inspectionSeconds = document.createElement('input');
        inspectionSeconds.setAttribute('type', 'number');
        inspectionSeconds.setProperties({'type': 'number', 'name': 'timer.inspectionSeconds', 'min': "0"});
        inspectionSeconds.setStyle('width', 52);
        inspectionSeconds.setStyle('margin-left', 2);
        //TODO - for some crazy reason, chrome is not displaying the spinners
		inspectionDiv.adopt(inspectionSeconds);
		inspectionDiv.adopt(new Element('label', { 'for': 'timer.inspectionSeconds', html: 'second WCA inspection' }));
		inspectionSeconds.addEvent('change', inspectionChanged);
		optionsDiv.adopt(inspectionDiv);
		inspectionSeconds.value = "" + this.config.get('timer.inspectionSeconds', '');
		inspectionChanged();

		optionsDiv.adopt(tnoodle.tnt.createOptionBox(server.configuration, 'timer.fullscreenWhileTiming', 'Fullscreen while timing', false));


		var keys = new Hash();
		this.keys = keys;
		
		this.reset(); //this will update the display
		
        function stopTimer() {
            if(!timer.timing) {
                alert('We should be timing if this is being called!'); //TODO - proper error message solution...
            }
            timer.timing = false;
            timer.timerStop = new Date().getTime();

            timer.pendingTime = true;
            timer.stopRender(); // this will cause a redraw()
            timer.fireNewTime();
        }
		var keysDown = false;
		window.addEvent('keydown', function(e) {
			keys.set(e.key, true);
			if(!timer.isFocused()) {
				return;
			}
			if(e.key == 'tab') {
				// This is a fun little hack:
				//   Pressing tab could cause the timer to lose focus,
				//   but even if it does, at this point in time
				//   timer.isFocused() will still return true.
				//   We must return to the dispatch thread and *then* call
				//   redraw, which will clear the keysDown css of our timer display.
				setTimeout(function() {
					timer.redraw();
				}, 0);
			}
			if(e.key == 'space') {
				// This is needed to stop space from scrolling on ff
				e.stop();
			}
			if(timer.config.get('timer.enableStackmat')) {
				return;
			}
			keysDown = timer.keysDown();
			if(timer.timing) {
				if(timer.startKeys().length > 1 && !keysDown) {
					// If the user has specified more than one key
					// to start the timer, then it is likely that they
					// want to emulate the functionality of a stackmat,
					// so we only stop the timer if they're holding down
					// all the keys they specified.
					return;
				}
                stopTimer();
			} else {
				timer.redraw();
			}
		});
		window.addEvent('keyup', function(e) {
			keys.erase(e.key);
			if(!timer.isFocused() || timer.config.get('timer.enableStackmat')) {
				// A key may have been released which was 
				// being held down when the timer lost focus
				timer.redraw();
				return;
			}
			
			if(timer.pendingTime) {
				timer.pendingTime = (keys.getLength() > 0);
			} else if(keysDown && !timer.keysDown()) {
				keysDown = false;
				if(timer.hasDelayPassed()) {
					if(timer.INSPECTION > 0 && !timer.inspecting) {
						// if inspection's on and we're not inspecting, let's start!
						timer.inspectionStart = new Date().getTime();
						timer.inspecting = true;
						//TODO - it's likely that we could use lastTime to hold our
						//penalties, and thereby clean up a good bit of code
						timer.lastTime = null;
					} else if(timer.timing) {
                        // It is possible to witness keyup events without a
                        // preceeding keydown. This can happen when exiting
                        // a screensaver or when switching tabs. Either way,
                        // we treat this is a request to stop the timer.
                        // Huge thanks to Dan Dzoan for pointing this out!
                        stopTimer();
                    } else{
						// starting timer
						timer.lastTime = null;
						timer.inspecting = false;
						timer.timerStart = new Date().getTime();
						timer.timing = true;
						timer.scramble = scrambleStuff.getScramble();
						timer.importInfo = scrambleStuff.getImportInfo();
						scrambleStuff.scramble();
					}
					timer.startRender();
				}
			}
			//even thought this may be odd behavior, it's better to do this
			//then have the timer freeze up on a user
			if(e.key == 'space' || e.key == 'esc') { //releasing space or esc resets the keyboard state
				resetKeys();
			}
			
			timer.redraw();
		});
		function resetKeys() {
			keys.empty();
			keysDown = false;
			timer.pendingTime = false;
			timer.redraw();
		}
		window.addEvent('click', function(e) {
			resetKeys();
		});
		window.addEvent('blur', function(e) {
			//when the page loses focus, we clear the keyboard state
			resetKeys();
		});
		
		function stackmatError(error) {
			//TODO - pretty error message?
			alert("Error loading stackmat: " + error);
		}
		
		var acceptedTime = false;
		function stackmatUpdated(state) {
			if(state !== null) {
				if(!time.timing && state.running) {
					//this mean that the timer just started running,
					//so we want to update the scramble
					timer.scramble = scrambleStuff.getScramble();
					timer.importInfo = scrambleStuff.getImportInfo();
					timer.scrambleStuff.scramble(); //TODO - test this out using a stackmat!
				}
				timer.timing = state.running;
				timer.stackCentis = state.centis;
				timer.inspecting = false; //TODO - stackmat inspection
				timer.inspectionStart = null;
				timer.redraw();
				//TODO - animate hand status!
				//TODO - animate timer on/off status
				if(timer.timing) {
					acceptedTime = false;
				} else if(state.centis > 0 && !acceptedTime) {
					// new time!
					acceptedTime = true; //this is to prevent redetecting the same time over and over
					timer.fireNewTime();
				}
			}
		}
		
		function stackmatEnabled() {
			timer.reset();
			if(this.checked) {
				tnoodle.stackmat.enable(stackmatUpdated, stackmatError);
			} else {
				tnoodle.stackmat.disable();
			}
		}
		optionsDiv.adopt(tnoodle.tnt.createOptionBox(server.configuration, 'timer.enableStackmat', 'Enable stackmat', false, stackmatEnabled));
		//TODO - add remaining stackmat config options!!!
	},
	lastTime: null,
	fireNewTime: function() {
		var time = new tnoodle.Time(this.getTimeCentis(), this.scramble);
		this.lastTime = time;
		var penalty = this.getPenalty();
		if(penalty) {
			time.setPenalty(penalty);
		}
		time.importInfo = this.importInfo;
		var addTime = function() {
			this.fireEvent('newTime', [ time ]);
		}.bind(this);
		//the timer lags if we don't queue up the addition of the time like this
		setTimeout(addTime, 0);
	},
	hasDelayPassed: function() {
		return new Date().getTime() - this.timerStop > this.delay;
	},
	isFocused: function() {
		// This is kinda weird, we want to avoid activating the timer 
		// if we're in a textarea, textfield, or input field
		var focusedEl = document.activeElement.nodeName.toLowerCase();
		var isEditing = focusedEl == 'textarea' || focusedEl == 'input';
		return !isEditing && !tnoodle.tnt.isSelecting() && !tnoodle.tnt.isGrayedOut();
	},
	getTimeCentis: function() {
		if(this.config.get('timer.enableStackmat')) {
			return this.stackCentis;
		} else {
			var end = (this.timing ? new Date().getTime() : this.timerStop);
			return Math.round((end - this.timerStart)/10);
		}
	},
	getInspectionElapsedSeconds: function() {
		var time = this.inspecting ? new Date().getTime() : this.timerStart;
		return ((time - this.inspectionStart)/1000).toInt();
	},
	getPenalty: function() {
		if(this.INSPECTION === 0) {
			return null;
		}
		var secondsLeft = this.INSPECTION-this.getInspectionElapsedSeconds();
		if(secondsLeft <= -2) {
			return "DNF";
		} else if(secondsLeft <= 0) {
			return "+2";
		}
		return null;
	},
	//mootools doesn't like having a toString method? wtf?!
	stringy: function() {
		if(this.inspecting) {
			var penalty = this.getPenalty();
			return penalty ? penalty : (this.INSPECTION-this.getInspectionElapsedSeconds()).toString();
		} else {
			var decimalPlaces = 2;
			var centis = this.getTimeCentis();
			if(this.timing) {
				if(this.frequency === 0) {
					return "...";
				}
				centis = (this.frequency*100)*(Math.round(centis / (this.frequency*100)));
				decimalPlaces = this.decimalPlaces;
			} else if(this.lastTime) {
				// This little tricky bit lets the user see penalties they've applied to the
				// most recent solve.
				return this.lastTime.format();
			}
			return this.server.formatTime(centis, decimalPlaces);
		}
	},
	timerId: null,
	startRender: function() {
		if(this.timerId === null) {
			this.timerId = this.redraw.periodical(this.frequency*1000, this);
		}
	},
	stopRender: function() {
		$clear(this.timerId);
		this.timerId = null;
		this.redraw();
	},
	reset: function() {
		this.stackCentis = 0;
		this.timing = false;
		this.timerStart = 0;
		this.timerStop = 0;
		this.inspecting = false;
		this.inspectionStart = null;
		
		this.stopRender();
	},
	startKeys: function() {
		var startKey = this.config.get("shortcuts."+tnoodle.tnt.KEYBOARD_TIMER_SHORTCUT, 'space');
		return startKey.split("+");
    },
	keysDown: function() {
		return !this.pendingTime && this.keys.getKeys().containsAll(this.startKeys());
	},
	redraw: function() {
		var string = this.stringy();
		var colorClass = this.inspecting ? 'inspecting' : '';
		var keysDown = this.keysDown();
		if(this.isFocused() && keysDown && this.hasDelayPassed()) {
			if(!this.inspecting) {
				// we still want people to see their inspection time when they're pressing spacebar
				string = this.server.formatTime(0, this.decimalPlaces);
			}
			colorClass = 'keysDown';
		}
		this.timer.set('html', string);
		this.timer.erase('class');
		this.timer.addClass(colorClass);
		this.timer.setStyle('width', '');
		this.timer.setStyle('height', '');
		
		var parent;
		if(this.config.get('timer.fullscreenWhileTiming') && this.timing) {
			parent = window;
			this.timer.addClass('fullscreenTimer');
			this.fullscreenBG.setStyle('display', '');
		} else {
			parent = this.parent;
			this.fullscreenBG.setStyle('display', 'none');
		}
		
		var maxSize = parent.getSize();
		var fontSize = Math.min(maxSize.y, maxSize.x/(this.CHAR_AR*string.length));
		this.timer.setStyle('font-size', fontSize);
		
		//now that we've computed its font size, we center the time vertically
		var offset = (maxSize.y - this.timer.getSize().y)/2;
		this.timer.setStyle('top', offset);
		this.timer.setStyle('width', maxSize.x);
		this.timer.setStyle('height', maxSize.y-offset); //hack hackity hack hack
	}
});
KeyboardTimer.implement(new Events());
var SCROLLBAR_WIDTH = 16;
var TimesTable = new Class({
	Extends: HtmlTable,
	cols: null,
	headers: null,
	selectedRASize: 12,
	initialize: function(id, server, scrambleStuff) {
		this.server = server;
		this.configuration = server.configuration;
		this.scrambleStuff = scrambleStuff;
		this.cols = tnoodle.Time.timeKeys;
		this.headers = tnoodle.Time.timeKeyNames;
		
		var table = this;
		HtmlTable.Parsers.time = {
			match: /^.*$/,
			convert: function(a, b, c) {
				if(this.isOrIsChild(table.addRow)) {
					return Infinity;
				}
				return this.getParent().time[this.key];
			},
			number: true
		};
		//this parser will ignore our sizer tr
		HtmlTable.Parsers.num = {
			match: HtmlTable.Parsers.number.match,
			convert: function() {
				if(this.isOrIsChild(table.addRow)) {
					return Infinity;
				}
				//We can't just look at the html because of the delete thingy
				var val = this.getParent().time.format(this.key).toInt();
				return val;
			},
			number: HtmlTable.Parsers.number.number
		};
		var time = HtmlTable.Parsers.time;
		var num = HtmlTable.Parsers.num;
		var parsers = tnoodle.Time.timeKeyTypes.map(function(type) {
			if(type == Number) {
				return num;
			} else if(type == tnoodle.Time) {
				return time;
			} else {
				return null;
			}
		});
		this.parent(id, {
			headers: this.headers,
			parsers: parsers,
			rows: [],
			sortable: true,
			zebra: false
		});
		this.addEvent('onSort', function(tbody, index) {
			//TODO - this code gets calls when resort() is called, which is kind of inefficient
			
			this.configuration.set('times.sort', this.sorted);
			this.scrollToLastTime();
			
			//sorting can change the box around the best ra
			this.tbody.getChildren('tr').each(function(tr) {
				tr.refresh();
			});
		});
		
		this.emptyRow = [];
		for(var i = 0; i < this.cols.length; i++) {
			this.emptyRow.push('');
		}
		
		//we create the add time row
		this.addRow = this.createRow(null);
		this.addRow.addClass('addTime');
		
		//there needs to be some dummy content in this row so it gets sized correctly
		//only vertical sizing matters though
		this.infoRow = this.set('footers', this.emptyRow).tr;

		var format = server.formatTime;
		this.infoRow.refresh = function() {
			var cells = this.infoRow.getChildren();
			for(var col = 0; col < this.cols.length; col++) {
				var key = this.cols[col];
				var cell = cells[col];
				if(key == 'index') {
					cell.set('html', this.session.solveCount()+"/"+this.session.attemptCount());
					if(this.session.attemptCount() > 0) {
						cell.setStyle('cursor', 'pointer');
						cell.title = 'Click to show stats for session';
					} else {
						cell.setStyle('cursor', '');
						cell.title = '';
					}
				} else if(key == 'sessionAve') {
					cell.set('html', '&sigma; = ' + format(this.session.stdDev()));	
					cell.title = 'This is the standard deviation of all times that count toward your average';
				} else {
					var best = this.session.bestWorst(key).best;
					cell.set('html', format(best.centis));
					cell.removeClass('bestRA');
					if(best.index !== null) {
						cell.addClass('bestTime');
						cell.addClass('bestRA');

						cell.setStyle('cursor', 'pointer');
						if(key == 'centis') {
							cell.title = 'Click to select best time';
						} else {
							cell.title = 'Click to show stats for best ' + key;
						}
					} else {
						cell.setStyle('cursor', '');
						cell.title = '';
					}
				}
			}
		}.bind(this);

		var statsPopup = tnoodle.tnt.createPopup(null, null, 0.7);
		statsPopup.resize = function() {
			var size = statsPopup.getSize();
			var height = size.y - 5*2 - statsTabs.getSize().y;
			var width = size.x - 2; // 2 for border
			tabArea.setStyle('width', width);
			tabArea.setStyle('height', height);
			height -= legend.getSize().y;// + resetFormatButton.getSize().y + 10;
			statsArea.setStyle('width', width-4);
			statsArea.setStyle('height', height-4);
		};

		var statsTabs = document.createElement('ul');
		statsTabs.addClass('tabs');
		var statsTab = document.createElement('li');
		statsTab.appendText('Stats');
		function activateStats() {
			statsArea.removeEvent('click', saveFormat);
			statsArea.removeEvent('keyup', saveFormat);
			statsTab.addClass('active');
			statsTab.addClass('white');
			configureTab.removeClass('active');
			legend.setStyle('display', 'none');
			resetFormatButton.setStyle('display', 'none');
			statsPopup.resize();

			statsArea.value = table.session.formatTimes(statsPopup.raSize, getFormat());
			statsArea.focus();
		}
		statsTab.addEvent('click', activateStats);

		var configureTab = document.createElement('li');
		function getFormat() {
			return table.configuration.get('times.statsFormat', table.session.defaultFormatStr);
		}
		function saveFormat() {
			table.configuration.set('times.statsFormat', statsArea.value);
		}
		function resetFormat() {
			if(confirm('Are you sure you want to reset the format string?')) {
				table.configuration.set('times.statsFormat', null);
				statsArea.value = getFormat();
			}
		}
		function activateConfigure() {
			statsTab.removeClass('active');
			configureTab.addClass('active');
			legend.setStyle('display', '');
			resetFormatButton.setStyle('display', '');
			statsPopup.resize();
			statsArea.value = getFormat();
			statsArea.addEvent('click', saveFormat);
			statsArea.addEvent('keyup', saveFormat);
			statsArea.focus();
		}
		configureTab.addEvent('click', activateConfigure);
		configureTab.appendText('Format');
		statsTabs.appendChild(statsTab);
		statsTabs.appendChild(configureTab);
		statsPopup.appendChild(statsTabs);

		var statsArea = document.createElement('textarea');
		statsArea.setStyle('border', 'none');
		statsArea.setStyle('resize', 'none');
		statsArea.setAttribute('wrap', 'off');

		var legend = new Element('div');
		legend.setStyle('border-bottom', '1px solid black');
		var resetFormatButton = document.createElement('input');
		resetFormatButton.type = 'button';
		resetFormatButton.addEvent('click', resetFormat);
		resetFormatButton.value = "Reset";
		var tabArea = new Element('div');
		tabArea.setStyle('border', '1px solid black');
		tabArea.setStyle('margin-top', '3px');
		statsPopup.appendChild(tabArea);
		tabArea.appendChild(legend);
		tabArea.appendChild(statsArea);

		function showStats(raSize) {
			statsPopup.raSize = raSize;

			legend.empty();
			var ul = new Element('ul');
			ul.setStyle('padding-left', '30px');
			ul.setStyle('margin', '0px');
			legend.adopt(ul);
			for(var key in table.session.formatLegend) {
				if(table.session.formatLegend.hasOwnProperty(key)) {
					var desc = table.session.formatLegend[key][0];
					ul.adopt(new Element('li', {html: "<b>" + key + "</b>: " + desc}));
				}
			}
			legend.appendChild(resetFormatButton);
			
			statsPopup.show();
			activateStats();
		}

		var oldRASize = null;
		var selectedRA_TD = null;
		function applyCurr(td) {
			td.addClass('currentRA');
			td.addClass('topCurrentRA');
			td.addClass('bottomCurrentRA');
		}
		function removeCurr(td) {
			td.removeClass('currentRA');
			td.removeClass('topCurrentRA');
			td.removeClass('bottomCurrentRA');
		}
		this.infoRow.getChildren().each(function(td, index) {
			// Note that the cursor css and html title
			// are set in infoRow.refresh.
			var key = table.cols[index];
			if(key.match(/^ra[0-9]+$/)) {
				var raSize = key.substring(2).toInt();
				td.addEvent('click', function(e) {
					if(this.getStyle('cursor') == 'pointer') {
						// Clicking is only enabled if the cursor is a pointer
						showStats(raSize);
					}
				});
			} else if(key == "index") {
				td.addEvent('click', function(e) {
					if(this.getStyle('cursor') == 'pointer') {
						// Clicking is only enabled if the cursor is a pointer
						showStats(-1);
					}
				});
			} else if(key == "centis") {
				td.addEvent('click', function(e) {
					var bestIndex = table.session.bestWorst(key).best.index;
					var rows = table.tbody.getChildren();
					for(var i = 0; i < rows.length; i++) {
						if(rows[i] == addRow) {
							continue;
						}
						if(rows[i].time.index == bestIndex) {
							deselectRows();
							rows[i].hover(); //hovering is necessary to get the timeHoverDiv to show up
							selectRow(rows[i]);
							table.scrollToRow(rows[i]);
							e.stop(); // If we don't stop the event, it will clear our selection!
							return;
						}
					}
				});
				return;
			} else {
				// We have nothing useful to do when this cell is clicked
				return;
			}
			/*
			if(raSize == table.selectedRASize) {
				selectedRA_TD = td;
				applyCurr(td);
			}

			td.addEvent('dblclick', function(e) {
				if(selectedRA_TD == td) {
					return;
				}
				removeCurr(selectedRA_TD);
				selectedRA_TD = td;
				oldRASize = null;
			});
			td.addEvent('mouseover', function(e) {
				oldRASize = table.selectedRASize;
				table.selectedRASize = raSize;
				table.refreshData();
				applyCurr(td);
			});
			td.addEvent('mouseout', function(e) {
				if(oldRASize && oldRASize != table.selectedRASize) {
					table.selectedRASize = oldRASize;
					removeCurr(td);
					table.refreshData();
				}
			});
			*/
		});
		
		this.thead = $(this).getChildren('thead')[0];
		this.thead.getChildren('tr')[0].getChildren('th').each(function(th, index) {
			var title = tnoodle.Time.timeKeyDescriptions[index];
			if(title) {
				th.title = title;
			}
		});
		this.tbody = $(this).getChildren('tbody')[0];
		this.tfoot = $(this).getChildren('tfoot')[0];
		this.parent = $(this).getParent();
		
		var columnOptions = tnoodle.tnt.createOptions();
		var columnOptionsHeader = document.createElement('th');
		this.thead.getChildren()[0].adopt(columnOptionsHeader.adopt(columnOptions.button));
		columnOptionsHeader.setStyles({
			cursor: 'default',
			padding: 0,
			borderRight: 'none',
			borderBottom: '1px'
		});
		columnOptions.button.setStyle('width', SCROLLBAR_WIDTH);
		
		var defaultCols = [ 'index', 'centis', 'ra5', 'ra12', 'ra100', 'sessionAve' ];
		var initing = true;
		var refreshCols = function() {
			if(initing) {
				return;
			}
			this.refreshData();
		}.bind(this);
		for(i = 0; i < this.cols.length; i++) {
			var col = this.cols[i];
			// We need at least these three columns to always be present
			// in order to impose a minimum size on the times table.
			if(col == 'centis') {// || col == 'index' || col == 'sessionAve') {
				// We set these columns to be visible, just in case they weren't
				// This can happen in an old version of tnt.
				server.configuration.set('table.' + col, true);
				continue;
			}
			var desc = this.headers[i];
			var opt = tnoodle.tnt.createOptionBox(server.configuration, 'table.' + col, desc, defaultCols.contains(col), refreshCols);
			columnOptions.div.adopt(opt);
		}
		initing = false;
		
		var selectedRows = [];
		var mostRecentRow = null;
		var addRow = this.addRow;
		function selectRow(row) {
			if(selectedRows.contains(row)) {
				return;
			}
			row.select();
			selectedRows.push(row);
		}
		function deselectRows(ignoreRow) {
			var ignorePresent = selectedRows.contains(ignoreRow);
			for(var i = selectedRows.length-1; i >= 0; i--) {
				var row = selectedRows[i];
				if(!ignoreRow || row != ignoreRow) {
					row.deselect();
				}
			}
			if(ignoreRow) {
				if(!ignorePresent) {
					selectRow(ignoreRow);
				}
				selectedRows = [ ignoreRow ];
			} else {
				selectedRows = [];
			}

			// This gets ride of the errorField if we were editing a time
			// This gets rid of the hover if we're hovering over times,
			// but I guess that's ok behavior
			if(timeHoverDiv.tr) {
				timeHoverDiv.commentArea.blur();
				setTimeout(timeHoverDiv.tr.unhover.bind(timeHoverDiv.tr, null, true), 0);
			}
			// Unfortunately, the call to unhover() doesn't result in
			// hiding the timeHoverDiv, so we do so explicitly.
			timeHoverDiv.hide(true);
		}
		this.deselectRows = deselectRows;
		this.promptTime = function() {
			deselectRows();
			this.addRow.hover(); //hovering is necessary to get the timeHoverDiv to show up
			selectRow(this.addRow);
		}.bind(this);
		window.addEvent('click', function(e) {
			var timeHoverChild = e.target.findAncestor(function(e) {
				return e == timeHoverDiv;
			});
			if(e.rightClick || timeHoverChild) {
				// We don't let right clicking or clicking on the timeHover deselect a row
				return;
			}
			//TODO - is there a better way of checking nodeName?
			var row = e.target.findAncestor(function(el) { return el.nodeName == 'TR'; });
			if(row) {
				if(!row.isOrIsChild(table.tbody)) {
					return;
				}
				if(e.control) {
					if(table.addRow.selected || row === table.addRow) {
						return;
					}

					// Deselecting and reselecting all of the current rows
					// ensures that none of the rows are currently editing
					selectedRows.each(function(row) { row.deselect(); row.select(); });

					if(selectedRows.contains(row)) {
						// NOTE: We don't bother updating mostRecentRow
						// This behavior may seem a little odd, but this
						// will happen so infrequently, I can't imagine it'll
						// matter.
						row.deselect();
						selectedRows.erase(row);
					} else {
						selectRow(row);
						mostRecentRow = row;
					}
				} else if(e.shift && mostRecentRow.isOrIsChild($(table))) {
					if(row === table.addRow) {
						return;
					}
					deselectRows();
					selectRow(mostRecentRow);
					var start = mostRecentRow;
					var between = [];
					// Try going forward from mostRecentRow to find row
					while(start !== null && start !== row) {
						between.push(start);
						start = start.getNext();
					}
					if(start === null) {
						// That didn't work, row must be behind mostRecentRow!
						start = mostRecentRow;
						between.length = 0;
						while(start !== null && start != row) {
							between.push(start);
							start = start.getPrevious();
						}
					}
					between.each(function(row) {
						selectRow(row);
					});
					selectRow(row);
				} else {
					var edit = selectedRows.contains(row);
					deselectRows(row);
					if(edit) {
						row.editing = true;
						row.refresh();
					}
					if(row === table.addRow) {
						mostRecentRow = null;
					} else {
						mostRecentRow = row;
					}
				}
			} else {
				// Something other than a row of our table was clicked,
				// so we clear the current selection
				// If the user is holding down ctrl or shift, we give them a chance
				// to keep selecting rows.
				if(e.control || e.shift) {
					return;
				}
				deselectRows();
			}
		});
		window.addEvent('keydown', function(e) {
			if(e.key == 'esc') {
				deselectRows();
			} else if(e.key == 'delete') {
				var times = "";
				for(var i = 0; i < selectedRows.length; i++) {
					var row = selectedRows[i];
					// check to make sure the time is even in the session
					if(this.session.times.contains(row.time)) {
						times += "," + row.time.format();
					}
				}
				if(times.length === 0) {
					return;
				} else {
					times = times.substring(1);
					if(confirm('Are you sure you want to delete these times?\n' + times)) {
						this.deleteRows(selectedRows);
					}
				}
			}
		}.bind(this));

		
		var timeHoverDiv = new Element('div');
		timeHoverDiv.fade('hide');
		timeHoverDiv.setStyles({
			position: 'absolute',
			backgroundColor: 'white',
			zIndex: 4
		});
		var makeLabelAndSettable = function(el) {
			var label = new Element('label', {'for': el.id});
			label.setStyle('display', 'block');
			el.setText = function(text) {
				label.set('html', text);
				el.inject(label, 'top');
			};
			return label;
		};
		
		var fieldSet = new Element('fieldset');
		fieldSet.setStyle('display', 'inline');
		fieldSet.setStyle('padding', 0);
		fieldSet.setStyle('border', 'none');
		fieldSet.setStyle('vertical-align', 'top');

		var noPenalty = new Element('input', { type: 'radio', name: 'penalty', id: 'noPenalty', value: 'noPenalty' });
		fieldSet.adopt(makeLabelAndSettable(noPenalty));
		var plusTwo = new Element('input', { type: 'radio', name: 'penalty', id: 'plusTwo', value: 'plusTwo' });
		fieldSet.adopt(makeLabelAndSettable(plusTwo));
		var dnf = new Element('input', { type: 'radio', name: 'penalty', id: 'dnf', value: 'dnf' });
		fieldSet.adopt(makeLabelAndSettable(dnf));
		
		var form = new Element('form');
		var commentArea = new Element('textarea');
		timeHoverDiv.commentArea = commentArea;
		form.adopt(commentArea);
		var height = 75;
		var margin = 4;
		var padding = 2;
		commentArea.setStyle('height', height);
		commentArea.setStyle('margin', margin);
		commentArea.setStyle('padding', padding);
		commentArea.setStyle('border', '1px solid black');
		commentArea.setStyle('resize', 'none');
		form.setStyle('height', height+2*(margin+padding+1));
		commentArea.setText = function(text) {
			if(text == "") {
				commentArea.setStyle('color', 'gray');
				commentArea.value = "Enter comment here";
			} else {
				commentArea.setStyle('color', 'black');
				commentArea.value = text;
			}
		};
		commentArea.saveComment = function() {
			// Nastyness to save the comment
			if(timeHoverDiv.time !== null && commentArea.getStyle('color') == 'black') {
				timeHoverDiv.time.setComment(commentArea.value);
				commentArea.blur();
			}
		};
		commentArea.addEvent('focus', function() {
			if(commentArea.getStyle('color') == 'gray') {
				commentArea.value = '';
				commentArea.setStyle('color', 'black');
			}
			setTimeout(function() {
				commentArea.select();
			}, 0);
		});

		form.setStyle('border', '2px solid black');
		form.adopt(fieldSet);
		var importScramble = document.createElement('span');
		importScramble.addClass('link');
		importScramble.title = 'Click to load scramble';
		var scrambledCube = document.createElement('img');
		scrambledCube.src = 'media/cube_scrambled.png';
		scrambledCube.style.width=24+'px';
		scrambledCube.style.height=24+'px';
		importScramble.adopt(scrambledCube);
		importScramble.addEvent('click', function() {
			var src = document.createTextNode(timeHoverDiv.time.format() + 's solve');
			table.scrambleStuff.importScrambles([ timeHoverDiv.time.scramble ], src);
		});
		fieldSet.adopt(importScramble);
		fieldSet.addEvent('change', function(e) {
			if(noPenalty.checked) {
				timeHoverDiv.time.setPenalty(null);
			} else if(dnf.checked) {
				timeHoverDiv.time.setPenalty("DNF");
			} else if(plusTwo.checked) {
				timeHoverDiv.time.setPenalty("+2");
			} else {
				//this shouldn't happen
			}
			table.session.reindex();
			table.refreshData();
		});
		

		timeHoverDiv.form = form;
		document.body.adopt(timeHoverDiv);
		timeHoverDiv.addEvent('mouseover', function(e) {
			timeHoverDiv.tr.hover();
			timeHoverDiv.show();
		});
		timeHoverDiv.addEvent('mouseout', function(e) {
			// This should help dampen the unexpected mouseout events
			if(timeHoverDiv.containsPoint(e.page)) {
				return;
			}
			timeHoverDiv.tr.unhover();	
		});
		var errorField = new Element('div', { 'class': 'errorField' });
		timeHoverDiv.errorField = errorField;
		timeHoverDiv.show = function(tr, time) {
			if(tr) {
				commentArea.saveComment();
				//TODO - comment AAAA
				if(!timeHoverDiv.tr || !timeHoverDiv.tr.editing) {
					timeHoverDiv.tr = tr;
					timeHoverDiv.time = time;
				}
				timeHoverDiv.form.dispose();
				timeHoverDiv.errorField.dispose();
				// if we don't dispose of the form and errorField first, it'll get destroyed
				timeHoverDiv.empty();
				if(timeHoverDiv.tr.editing) {
					timeHoverDiv.adopt(errorField);
				} else if(timeHoverDiv.time !== null) {
					timeHoverDiv.commentArea.setText(time.getComment());
					timeHoverDiv.adopt(timeHoverDiv.form);
					noPenalty.setText(server.formatTime(time.rawCentis));
					dnf.setText("DNF");
					plusTwo.setText(server.formatTime(time.rawCentis+2*100)+"+");

					// Select the correct penalty
					var penalties = { "null": noPenalty, "DNF": dnf, "+2": plusTwo };
					// Note that calling String(null) = "null". Some browsers
					// don't like null keys in dictionaries
					penalties[String(time.getPenalty())].checked = true;
				}
			}
			var el = timeHoverDiv.tr.getChildren()[1];
			if(el.isOrIsChild(this.tbody)) {
				timeHoverDiv.position({relativeTo: el.getParent(), position: 'left', edge: 'right'});
				timeHoverDiv.fade('show');
				timeHoverDiv.visible = true;
			} else {
				timeHoverDiv.fade('out');
				timeHoverDiv.visible = false;
			}
		}.bind(this);
		var fader = timeHoverDiv.fade;
		timeHoverDiv.fade = function(str) {
			timeHoverDiv.get('tween').cancel();
			fader.call(timeHoverDiv, str);
		};
		timeHoverDiv.hide = function(immediately) {
			//TODO - comment! SEE A
			if(!timeHoverDiv.visible) {
				return;
			}
			function hide() {
				commentArea.saveComment();
				timeHoverDiv.fade(immediately ? 'hide' : 'out');
				timeHoverDiv.visible = false;
			}
			if(!timeHoverDiv.tr || !timeHoverDiv.tr.editing) {
				if(immediately) {
					hide();
				} else {
					setTimeout(hide, 0);
				}
			}
		};
		this.timeHoverDiv = timeHoverDiv;
	},
	comment: function() {
		this.lastAddedRow.hover();
		this.timeHoverDiv.commentArea.focus();
	},
	penalize: function(penalty) {
		this.lastAddedRow.time.setPenalty(penalty);
		this.session.reindex();
		this.refreshData();
	},
	deleteRows: function(rows) {
		var times = [];
		rows.each(function(row) {
			times.push(row.time);
			row.dispose();
		}.bind(this));
		this.session.disposeTimes(times);
		//changing the time could very well affect more than this row
		//maybe someday we could be more efficient about the changes
		this.refreshData();
		this.resizeCols(); //changing the time may change the size of a column
		// timeHoverDiv.show will hide itself
		this.timeHoverDiv.show();
	},
	undo: function() {
		this.session.undo();
		this.setSession(this.session);
	},
	redo: function() {
		this.session.redo();
		this.setSession(this.session);
	},
	freshSession: false,
	setSession: function(session) {
		this.freshSession = true;
		this.session = session;
		this.addRow.dispose(); //if we don't remove this row before calling empty(), it's children will get disposed
		this.empty();
		this.addRow.inject(this.tbody); // adding the addRow back
		this.session.times.each(function(time) {
			this.createRow(time);
		}.bind(this));

		this.refreshData();
	},
	reset: function() {
		this.session.reset();
		this.setSession(this.session);
	},
	addTime: function(time) {
		this.session.addTime(time, this.scrambleStuff.scramble, this.scrambleStuff.unscramble);
		this.createRow(time);
		this.refreshData();
		this.scrollToLastTime();
	},
	scrollToLastTime: function() {
		if(this.lastAddedRow) {
			var row = this.lastAddedRow;
			if(row.nextSibling == this.addRow) {
				// this little hack will ensure that the addRow is visible
				// whenever we're near the bottom
				row = this.addRow;
			}
			this.scrollToRow(row);
		}
	},
	scrollToRow: function(tr) {
		var scrollTop = this.tbody.scrollTop;
		var scrollBottom = scrollTop + this.tbody.getSize().y;
		
		var elTop = tr.getPosition(tr.getParent()).y;
		var elBottom = tr.getSize().y + elTop;
		
		if(elTop < scrollTop) {
			//we scroll up just until the top of the row is visible
			this.tbody.scrollTo(0, elTop);
		} else if(elBottom > scrollBottom) {
			//we scroll down just until the bottom of the element is visible
			var delta = elBottom - scrollBottom;
			delta += 3; //add a couple for the border, TODO - compute border!
			this.tbody.scrollTo(0, scrollTop + delta);
		} else {
			//the element's on screen!
		}
	},
	
	//private!
	resort: function(preserveScrollbar) {
		var scrollTop = this.tbody.scrollTop; //save scroll amount
		var sort = this.configuration.get('times.sort', { index: 0, reverse: false });
		this.sort(sort.index, sort.reverse);
		
		if(preserveScrollbar) {
			this.tbody.scrollTo(0, scrollTop); //restore scroll amount
		}
	},
	refreshData: function() {
		var refreshCols = function(tr) {
			var cells = tr.getChildren('td');
			//nasty hack to get the headers of the thead
			if(cells.length === 0) {
				cells = tr.getChildren('th');
			}
			for(var i = 0; i < this.cols.length; i++) {
				var colEnabled = this.configuration.get('table.' + this.cols[i], true);
				if(colEnabled) {
					cells[i].setStyle('display', '');
				} else {
					cells[i].setStyle('display', 'none');
				}
			}
		}.bind(this);
		
		// The calls to toggle() seem to screw up scrolling to the edited time
		//$(this).toggle(); //prevent flickering?
		this.tbody.getChildren('tr').each(function(tr) {
			tr.refresh();
			refreshCols(tr);
		});
		this.thead.getChildren('tr').each(refreshCols);
		this.tfoot.getChildren('tr').each(refreshCols);
		this.resort(true);
		this.infoRow.refresh();
		//$(this).toggle(); //prevent flickering?
		this.resizeCols();
		this.fireEvent('tableChanged');
	},
	editCell: function(cell, time) {
		if(cell.textField && cell.textField.isOrIsChild(cell)) {
			// we must be editing currently
			// The above comment makes no sense --jfly
			return;
		}
		var width = cell.getStyle('width').toInt() + cell.getStyle('padding-left').toInt() + cell.getStyle('padding-right').toInt();
		var height = cell.getStyle('height').toInt() + cell.getStyle('padding-top').toInt() + cell.getStyle('padding-bottom').toInt();
		cell.setStyle('padding', 0);
		var textField = new Element('input');
		cell.textField = textField;
		textField.value = time ? time.format() : "";
		textField.setStyle('border', 'none');
		textField.setStyle('width', width);
		//TODO - the sizing isn't quite right on FF, be careful not to break this on chrome!
		textField.setStyle('height', height);
		textField.setStyle('text-align', 'right'); //not sure this is a good idea, left align might make a good visual indicator
		textField.setStyle('padding', 0);

		textField.addEvent('keydown', function(e) {
			if(e.key == 'enter') {
				try {
					this.deselectRows();
					if(time) {
						time.parse(textField.value);
						this.session.reindex();
						this.refreshData();
					} else {
						var newTime = new tnoodle.Time(this.session, textField.value, this.scrambleStuff.getScramble());
						this.addTime(newTime);
						this.scrambleStuff.scramble();

						this.promptTime();
					}
				} catch(error) {
					// No need for an alert
					alert("Error entering time " + textField.value + "\n" + error);
				}
			}
		}.bind(this));
		
		var timeChanged = function(e) {
			try {
				var test = new tnoodle.Time(null, textField.value);
				this.timeHoverDiv.errorField.set('html', '');
			} catch(error) {
				this.timeHoverDiv.errorField.set('html', error);
			}
			this.timeHoverDiv.show();
		}.bind(this);
		//TODO - how do you listen for input in mootools?
		xAddListener(textField, 'input', timeChanged, false);
		timeChanged();

		cell.empty();
		cell.adopt(textField);
		
		textField.focus(); //this has the added benefit of making the row visible
		textField.select();

		//TODO - comment see AAAA
		this.timeHoverDiv.show(cell.getParent(), time);
	},
	timeHoverDiv: null,
	lastAddedRow: null,
	createRow: function(time) {
		var tr = this.push(this.emptyRow).tr;
		tr.time = time;
		this.lastAddedRow = tr;
		var server = this.server;
		var session = this.session;
		var cols = this.cols;
		var table = this;
		tr.refresh = function() {
			tr.editing = tr.editing && tr.selected;
			if(tr.selected) {
				tr.addClass('selected');
			} else {
				tr.removeClass('selected');
			}
			if(tr.hovered) {
				tr.addClass('hovered');
				setTimeout(function() {
					//This table may actually be hidden during this call...
					//so positioning the hoverDiv doesn't work until later.
					//TODO OMG WTF LOL, if there's only 1 call to show(), the
					//hover is sized incorrectly when esc is pressed
					this.timeHoverDiv.show(tr, tr.time);
					//this.timeHoverDiv.show(tr, tr.time);
				}.bind(this), 0);
			} else {
				tr.removeClass('hovered');
			}
			var deleteTime = function() {
				this.deleteRows([tr]);
			}.bind(this);
			var cells = tr.getChildren();
			for(var col = 0; col < table.cols.length; col++) {
				var key = table.cols[col];
				try{
					cells[col].key = key;
				} catch(err) {
					console.log(err);
					//TODO - debugging code to hopefully figure out intermittent failure
					console.log(tr);
					console.log(cells);
					console.log(col);
					console.log(table.cols);
					console.log(key);
				}
				if(time === null) {
					if(key == 'centis') {
						if(tr.selected) {
							tr.editing = true;
							this.editCell(cells[col], null);
						} else {
							cells[col].setStyle('padding', '');
							cells[col].set('html', '<u>A</u>dd time');
						}
					}
					continue;
				}
				if(key == 'index') {
					cells[col].removeEvent('click');
					if(tr.hovered) {
						cells[col].set('html', 'X');
						cells[col].addClass('deleteTime');
						cells[col].addEvent('click', deleteTime);
					} else {
						cells[col].set('html', time.index + 1);
						cells[col].removeClass('deleteTime');
					}
				} else if(key == 'centis') {
					if(tr.editing) {
						this.editCell(cells[col], time);
					} else {
						cells[col].set('html', time.format());
						cells[col].removeClass('bestRA');
						cells[col].removeClass('currentRA');
						cells[col].removeClass('topCurrentRA');
						cells[col].removeClass('bottomCurrentRA');
						cells[col].removeClass('bestTime');
						cells[col].removeClass('worstTime');
						cells[col].setStyle('padding', '');
						var bw = session.bestWorst();
						if(time.index == bw.best.index) {
							cells[col].addClass('bestTime');
						} else if(time.index == bw.worst.index) {
							cells[col].addClass('worstTime');
						}
						var selectedRASize = this.selectedRASize;
						var bestRA = session.bestWorst('ra' + selectedRASize).best;
						var attemptCount = session.attemptCount();
						if(attemptCount >= selectedRASize) {
							if(bestRA.index - selectedRASize < time.index && time.index <= bestRA.index) {
								cells[col].addClass('bestRA');
							}
							if(table.sorted.index === 0) {
								var firstSolve = session.attemptCount()-selectedRASize;
								var lastSolve = session.attemptCount()-1;
								if(firstSolve <= time.index && time.index <= lastSolve) {
									cells[col].addClass('currentRA');
								}
								
								if(table.sorted.reverse) {
									//the top/bottom are switched
									var temp = lastSolve;
									lastSolve = firstSolve;
									firstSolve = temp;
								}
								
								if(time.index == firstSolve) {
									cells[col].addClass('topCurrentRA');
								} else if(time.index == lastSolve) {
									cells[col].addClass('bottomCurrentRA');
								}
							}
						}
					}
				} else {
					cells[col].set('html', time.format(key));
					var bestIndex = session.bestWorst(key).best.index;
					cells[col].removeClass('bestRA');
					if(bestIndex == time.index) {
						cells[col].addClass('bestRA');
					}
				}
			}
		}.bind(this);

		tr.hover = function() {
			table.tbody.getChildren('tr').each(function(row) {
				if(tr == row) {
					return;
				}
				//ridiculous...
				if(row.hovered) {
					table.timeHoverDiv.commentArea.blur();
					row.unhover();
				}
			});
			if(this.pendingUnhover) {
				clearTimeout(this.pendingUnhover);
				this.pendingUnhover = null;
			}
			if(this.hovered) {
				return;
			}
			this.hovered = true;
			this.refresh();
			table.timeHoverDiv.show(this, time);
		};
		tr.unhover = function(e, immediately) {
			if(this.pendingUnhover) {
				return;
			}
			if(document.activeElement == table.timeHoverDiv.commentArea) {
				return;
			}
			// If you place the cursor right on a vertical
			// line between cells, it's considered a mouse-out.
			// This prevents that.
			if(e && tr.containsPoint(e.page)) {
				return;
			}
			this.hovered = false;
			this.pendingUnhover = setTimeout(function() {
				this.refresh();
				this.pendingUnhover = null;
			}.bind(this), 100);
			table.timeHoverDiv.hide(immediately);
		};
		tr.select = function() {
			this.selected = true;
			this.refresh();
		};
		tr.deselect = function() {
			//TODO - remove yourself from the select array!
			this.selected = false;
			this.editing = false;
			this.unhover(null, true);
			this.refresh();
		};
		tr.addEvent('mouseover', tr.hover);
		tr.addEvent('mouseout', tr.unhover);
		return tr;
	},
	resizeCols: function() {
		var i, j;
		var infoCells = this.infoRow.getChildren('td');
		var addTimeCells = this.addRow.getChildren('td');
		var headerRow = this.thead.getChildren('tr')[0];
		var headers = headerRow.getChildren('th');
		var tds = [];
		
		// ok, this is way nasty, but it seems to be the only way
		// to free up the space necessary for this table to get sized correctly
		$(this).getParent().getParent().setStyle('width', null);
		
		//clearing all column widths
		this.tfoot.getChildren('tr').each(function(tr) {
			tr.setStyle('width', null);
		});
		this.tbody.setStyle('width', null); //we want everything to size itself as if there's enough space
		infoCells.each(function(td) {
			td.setStyle('width', null);
		});
		addTimeCells.each(function(td) {
			td.setStyle('width', null);
		});
		headers.each(function(td) {
			td.setStyle('width', null);
		});
		headerRow.setStyle('width', null);
		
		var preferredWidth = 0;
		
		var visibleColCount = 0;
		var resizeme = [headers, infoCells, addTimeCells];
		for(i = 0; i < this.headers.length; i++) {
			if(headers[i].getStyle('display') == 'none') {
				continue;
			}
			visibleColCount++;
			var maxWidth = 0;
			var maxWidthIndex = 0;
			var padding = 0;
			for(j = 0; j < resizeme.length; j++) {
				if(!resizeme[j]) {
					continue;
				}
				var newWidth = resizeme[j][i].getSize().x + 1; //add one for border
				
				if(newWidth >= maxWidth) {
					maxWidth = newWidth;
					maxWidthIndex = j;

					padding = resizeme[j][i].getStyle('padding-left').toInt() + resizeme[j][i].getStyle('padding-right').toInt() + 1; //add one for border
				}
			}
			preferredWidth += maxWidth;
			for(j = 0; j < resizeme.length; j++) {
				//setting everyone to the max width
				if(!resizeme[j]) {
					continue;
				}
				resizeme[j][i].setStyle('width', maxWidth - padding);
			}
		}

		preferredWidth += SCROLLBAR_WIDTH; //this accounts for the vert scrollbar
		var MIN_WIDTH = 0;
		if(preferredWidth < MIN_WIDTH) {
			var extra = (MIN_WIDTH-preferredWidth)/visibleColCount;
			preferredWidth = MIN_WIDTH;
			for(i = 0; i < this.headers.length; i++) {
				if(headers[i].getStyle('display') == 'none') {
					continue;
				}
				for(j = 0; j < resizeme.length; j++) {
					if(!resizeme[j]) {
						continue;
					}
					var cell = resizeme[j][i];
					var oldWidth = cell.getStyle('width').toInt();
					cell.setStyle('width', oldWidth+extra);
				}
			}
		}
		this.preferredWidth = preferredWidth;

		this.tfoot.getChildren('tr').each(function(tr) {
			tr.setStyle('width', preferredWidth-SCROLLBAR_WIDTH);
		});
		this.tbody.setStyle('width', preferredWidth);
		headerRow.setStyle('width', preferredWidth);
		headerRow.setStyle('border-bottom', '1px solid black');
		
		if(this.manager) {
			this.manager.position();
		}
	},
	getTableSpace: function() {
		var space = this.parent.getSize();
		var offset = $(this).getPosition($(this).getParent());
		space.y -= offset.y;
		return space;
	},
	resize: function(forceScrollToLatest) {
		if(!this.session) {
			return; //we're not ready to size this until we have a session
		}

		var maxSize = this.getTableSpace();
		maxSize.y -= $(this).getStyle('margin-bottom').toInt();
		maxSize.y -= this.thead.getSize().y;
		maxSize.y -= this.tfoot.getSize().y;
		this.tbody.setStyle('height', maxSize.y);

		if(this.freshSession) {
			this.freshSession = false;
			this.scrollToLastTime();
		} else if(forceScrollToLatest) {
			this.scrollToLastTime();
		}
	},
	getPreferredWidth: function() {
		return this.preferredWidth + 2; //i have no idea what this 2 is for...
	}
});
TimesTable.implement(new Events());
var tnoodle = tnoodle || {};
tnoodle.stackmat = {
	//TODO - allow querying of mixers!
	//TODO - allow setting of inverted!
	//TODO - generate this file from stackmat project?
	applet: null,
	enable: function(updateCallback, errorCallback, stackmatValue, mixerIndex) {
		if(tnoodle.stackmat.applet !== null) {
			tnoodle.stackmat.disable();
		}
		
		window.stackmatUpdateCallback = updateCallback;
		window.stackmatErrorCallback = errorCallback;
		
		function createParam(key, val) {
			var param = document.createElement('param');
			param.setAttribute('name', key);
			param.setAttribute('value', val);
			return param;
		}
		var applet = document.createElement('applet');
		applet.style.width = '0px';
		applet.style.height = '0px';
		applet.style.visibility = 'hidden';
		applet.setAttribute('codebase', 'java/');
		applet.setAttribute('archive', 'StackApplet.jar');
		applet.setAttribute('code', 'net.gnehzr.tnoodle.stackmat.StackApplet');
		applet.setAttribute('mayscript', 'mayscript');
		applet.appendChild(createParam('updateCallback', 'stackmatUpdateCallback'));
		applet.appendChild(createParam('errorCallback', 'stackmatErrorCallback'));
		if(stackmatValue) {
			applet.appendChild(createParam('stackmatValue', stackmatValue));
		}
		if(mixerIndex) {
			applet.appendChild(createParam('mixer', mixerIndex));
		}
		document.body.appendChild(applet);
		tnoodle.stackmat.applet = applet;
	},
	disable: function() {
		if(tnoodle.stackmat.applet === null) { return; }
		document.body.removeChild(tnoodle.stackmat.applet);
		tnoodle.stackmat.applet = null;
		window.stackmatUpdateCallback(); // we want them to be notified that the timer is OFF
	},
	isOn: function() {
		if(tnoodle.stackmat.applet === null) {
			return false;
		}
		return tnoodle.stackmat.applet.isOn();
	}
};
window.addEvent('domready', function() {
	var server = new tnoodle.server(location.hostname, location.port);
	var configuration = server.configuration;
	
	function onPuzzlesLoaded(puzzles) {
		var puzzle = configuration.get('scramble.puzzle', '3x3x3');
		scrambleStuff.setSelectedPuzzle(puzzle);
	}
	var scrambleStuff = new ScrambleStuff(server, onPuzzlesLoaded);
	document.getElementById('puzzleChooser').appendChild(scrambleStuff.puzzleSelect);
	document.getElementById('scrambleArea').appendChild(scrambleStuff.scrambleArea);

	var timer = new KeyboardTimer($('timer'), server, scrambleStuff);
	var session = null;
	
	var updatingSession = false;
	scrambleStuff.addPuzzleChangeListener(function(newPuzzle, updateSession) {
		updatingSession = true;
		if(updateSession) {
			session.setPuzzle(newPuzzle);
		} else {
			session = null;
		}
		configuration.set('scramble.puzzle', newPuzzle);
		eventSelect.refresh();
		updatingSession = false;
	});

	function getEvents() {
		return server.getEvents(scrambleStuff.getSelectedPuzzle());
	}
	var eventSelect = tnoodle.tnt.createSelect('Click to open last session with event', 'Click to change current session event');
	eventSelect.refresh = function() {
		var events = getEvents();
		var options = [];
		for(var i = 0; i < events.length; i++) {
			var txt = events[i];
			options.push({ value: events[i], text: txt });
		}
		options.push({ value: null, text: 'Edit' });
		eventSelect.setOptions(options);

		var event;
		if(session === null) {
			event = configuration.get('scramble.puzzle.event', '');
			if(events.indexOf(event) < 0) {
				event = events[0];
			}
		} else {
			event = session.getEvent();
		}
		eventSelect.setSelected(event);
	};
	eventSelect.linebreak = new Element('br');
	$('puzzleChooser').adopt(eventSelect.linebreak);
	$('puzzleChooser').adopt(eventSelect);

	eventSelect.onchange = function(updateSession) {
		var event = eventSelect.getSelected();
		if(event === null) {
			// We don't want to leave the "Edit" option selected
			eventSelect.setSelected(session.getEvent() || '');
			/*
			var editEventsPopup = tnoodle.tnt.createPopup(null, eventSelect.refresh);
			var onAdd = function(newItem) {
				server.createEvent(session.getPuzzle(), newItem);
			};
			var onRename = function(oldItem, newItem) {
				server.renameEvent(session.getPuzzle(), oldItem, newItem);
			};
			var onDelete = function(oldItem) {
				server.deleteEvent(session.getPuzzle(), oldItem);
			};
			editEventsPopup.appendChild(tnoodle.tnt.createEditableList(getEvents(), onAdd, onRename, onDelete));
			editEventsPopup.show();
			*/
			var newEvent = prompt("Enter name of new event (this will become a pretty gui someday, I promise!)");
			if(newEvent) {
				server.createEvent(session.getPuzzle(), newEvent);
				eventSelect.refresh();
			}
			return;
		}
		if(!updateSession && !updatingSession) {
			session = null;
		} else if(session !== null) {
			session.setEvent(event);
		}
		configuration.set('scramble.puzzle.event', event);
		sessionSelect.refresh();
	}; //for some reason, the change event doesn't fire until the select loses focus

	//TODO - actually delete this
	var sessionSelect = tnoodle.tnt.createSelect('Click to open session');
	sessionSelect.linebreak = new Element('br');
	sessionSelect.linebreak.setStyle('font-size', 22); // omg, this is disgusting
	//$('puzzleChooser').adopt(sessionSelect.linebreak);
	//$('puzzleChooser').adopt(sessionSelect);
	sessionSelect.refresh = function() {
		var puzzle = scrambleStuff.getSelectedPuzzle();
		var event = eventSelect.getSelected();

		var options = [];
		options.push({ value: null, text: 'New session' });

		var sessions = server.getSessions(puzzle, event);
		sessions.reverse(); // We want to list our sessions starting with the most recent
		if(sessions.length === 0) {
			sessions.push(server.createSession(puzzle, event));
		}
		for(var i = 0; i < sessions.length; i++) {
			var date = sessions[i].getDate().format('%b %d, %Y %H:%M');
			options.push({ value: sessions[i], text: date });
		}
		sessionSelect.setOptions(options);
		if(session === null || sessions.indexOf(session) < 0) {
			// If the current session was just deleted,
			// select the newest one
			session = sessions[0];
		}
		sessionSelect.setSelected(session);
	};
	sessionSelect.onchange = function(e) {
		session = sessionSelect.getSelected();
		if(session === null) {
			// New session will create & select a new session
			newSession();
			return;
		}
		timesTable.setSession(session);
		$('sessionComment').refresh();
	};
	$('sessionComment').refresh = function() {
		var comment = session.getComment();
		if(comment === null) {
			$('sessionComment').value = 'Enter comment here';
			$('sessionComment').setStyle('color', 'gray');
		} else {
			$('sessionComment').value = comment;
			$('sessionComment').setStyle('color', 'black');
		}
	};
	$('sessionComment').addEvent('focus', function() {
		if(this.getStyle('color') == 'gray') {
			this.value = '';
			this.setStyle('color', 'black');
		}
		setTimeout(this.select.bind(this), 0);
	});
	$('sessionComment').addEvent('keydown', function(e) {
		if(e.key == "enter" || e.key == "esc") {
			this.blur();
		}
	});
	$('sessionComment').addEvent('blur', function() {
		session.setComment($('sessionComment').value);
		$('sessionComment').refresh();
	});

	//we try to be clever and change the href only after the anchor has been clicked
	//this should save us the bother of generating the csv over and over again
	//TODO - this is probably getting called twice when clicking, due to the mousedown event, and then the click event
	function downloadCSV() {
		var keys = server.timeKeys;
		var data = server.timeKeyNames.join(',')+"\n";
		
		var times = session.times;
		for(var i = 0; i < session.times.length; i++) {
			var time = session.times[i];
			for(var j = 0; j < keys.length; j++) {
				var key = keys[j];
				var val = time.format(key);
				//we surround each value with double quotes and escape each double quote, just to be safe
				val = val === null ?
						'' :
						'"' + val.replace(/"/g, '""') + '"';
				data += val + ',';
			}
			data += "\n";
		}
		var uri = 'data:text/csv;charset=utf8,' + encodeURIComponent(data);
		this.href = uri;
	}
	function resetSession() {
		timesTable.reset();
	}
	function deleteSession() {
		if(confirm("Are you sure you want to delete the session?")) {
			server.disposeSession(session);
			sessionSelect.refresh(); // This will cause the latest session to be selected
		}
	}
	function newSession() {
		var puzzle = scrambleStuff.getSelectedPuzzle();
		var event = eventSelect.getSelected();
		// We create a new session, and then refresh our list
		// Refreshing will cause session to be selected
		session = server.createSession(puzzle, event);
		sessionSelect.refresh();
	}
	
	var timesTable = new TimesTable($('timesTable'), server, scrambleStuff);
	timer.addEvent('newTime', function(time) {
		//TODO - this may need to wait for the sessions to load...
		timesTable.addTime(time);
	});
	timesTable.addEvent('tableChanged', function() {
		//timer.setStringy(timesTable.lastAddedRow.time.format());
		timer.redraw();
	});
	
	$('newSession').addEvent('click', newSession);
	$('resetSession').addEvent('click', resetSession);
	$('deleteSession').addEvent('click', deleteSession);
	$('downloadCSV').addEvent('click', downloadCSV);
	$('downloadCSV').addEvent('mousedown', downloadCSV);

	$('timer').resize = function() {
		timer.redraw();
	};
	$('scrambles').resize = scrambleStuff.resize;
	function getMaxWidth(el) {
		// Returns the maximum size the element can take up without falling
		// off the right side of the screen.
		return document.body.getSize().x - el.getPosition().x - 20;
	}
	$('times').resize = function() {
		var available = $('times').getSize();
		var remainingHeight = available.y - $('timesArea').getStyle('border-top').toInt() - $('timesArea').getStyle('border-bottom').toInt();
		$('timesArea').setStyle('height', remainingHeight);
		var seshCommentWidth = available.x - 30;
		$('sessionComment').setStyle('width', Math.max(50, seshCommentWidth));

		var selects = [ scrambleStuff.puzzleSelect, eventSelect, sessionSelect ];
		selects.each(function(select) {
			if(select.linebreak) {
				select.linebreak.setStyle('display', 'none');
			}
			select.setMaxWidth(null);
		});
		selects.each(function(select) {
			var maxWidth = getMaxWidth(select);
			if(select.linebreak && select.getSize().x > maxWidth) {
				select.linebreak.setStyle('display', '');
				// Adding a newline gives us more space
				maxWidth = getMaxWidth(select);
			}
			select.setMaxWidth(maxWidth);
		});
		
		timesTable.resize();
	};
	$('times').getPreferredWidth = function() {
		return timesTable.getPreferredWidth();
	};

	
	var triLayout = new TriLayout($('timer'), $('scrambles'), $('times'), configuration);
	timesTable.manager = triLayout;
	
	//TODO - yeah...
	aboutText = '<h2 style="margin: 0;">TNoodle Timer (TNT) v' + tnoodle.tnt.version + '</h2><br/>' +
				'Created by Jeremy Fleischman from the ashes of CCT.<br/>' +
				'Thanks to Leyan Lo for ideas/couch';
	var aboutPopup = tnoodle.tnt.createPopup();
	aboutPopup.innerHTML = aboutText;
	$('aboutLink').addEvent('click', function() {
		aboutPopup.show();
	});
	
	$('helpLink').doClick = function() {
		helpPopup.refresh();
		helpPopup.show();
	};
	$('helpLink').addEvent('click', $('helpLink').doClick);
	
	// This subclass of Keyboard ensures that
	// shortcuts only work when we're not timing,
	// editing a text box, or doing something else
	// we care about.
	var editingShortcutField = null;
	var BlockingKeyboard = new Class({
		Extends: Keyboard,
		handle: function(event, type) {
			if(document.activeElement == editingShortcutField) {
				var type_keys = type.split(":");
				if(type_keys[1].contains('tab')) {
					return;
				}
				if(type_keys[1] == "") {
					return;
				}
				event.stop();
				if(type_keys[1].contains('backspace')) {
					type_keys[1] = "";
				}
				if(type_keys[0] == "keydown") {
                    setTimeout(function() {
                        // For some reason, calling event.stop() isn't
                        // enough to stpo opera from adding the key to the textfield
                        // This little hack seems to work, however
                        editingShortcutField.value = type_keys[1];
                    }, 0);
					editingShortcutField.shortcut.keys = type_keys[1];
					highlightDuplicates();
				}
			}
			if(!timer.timing && timer.isFocused() && !timer.keysDown() && !timer.pendingTime) {
				this.parent(event, type);
			}
		}
	});

	function resizeScrambleArea(delta) {
		var scrambleSpace = configuration.get('layout.sizerHeight');
		scrambleSpace += delta;
		configuration.set('layout.sizerHeight', scrambleSpace);
		triLayout.resize();
	}
	function scrollTable(delta) {
		return function(e) {
			e.stop();
			var pos;
			if(delta == Infinity) {
				pos = timesTable.tbody.scrollHeight;
			} else if(delta == -Infinity) {
				pos = 0;
			} else {
				pos = timesTable.tbody.scrollTop + delta;
			}
			timesTable.tbody.scrollTo(0, pos);
		};
	}

	var keyboard = new BlockingKeyboard();
	tnoodle.tnt.KEYBOARD_TIMER_SHORTCUT = 'Start timer (try "a+;")';
	var shortcuts = new Hash({
		'Times': [
			{
				description: tnoodle.tnt.KEYBOARD_TIMER_SHORTCUT,
				'default': 'space',
				handler: null
			},
			{
				description: 'Comment on last solve',
				'default': 'c',
				handler: timesTable.comment.bind(timesTable)
			},
			{
				description: 'Add time',
				'default': 'alt+a',
				handler: timesTable.promptTime.bind(timesTable)
			},
			{
				description: 'No penalty',
				'default': 'i',
				handler: timesTable.penalize.bind(timesTable, null)
			},
			{
				description: '+2',
				'default': 'o',
				handler: timesTable.penalize.bind(timesTable, '+2')
			},
			{
				description: 'DNF',
				'default': 'p',
				handler: timesTable.penalize.bind(timesTable, 'DNF')
			},
			{
				description: 'Undo',
				'default': 'control+z',
				handler: timesTable.undo.bind(timesTable)
			},
			{
				description: 'Redo',
				'default': 'control+y',
				handler: timesTable.redo.bind(timesTable)
			}
		],
		'Sessions': [
			{
				description: 'Reset session',
				'default': 'r',
				handler: function() {
					if(confirm("Are you sure you want to reset the session?")) {
						resetSession();
					}
				}
			},
			{
				description: 'Delete session',
				'default': 'd',
				handler: deleteSession
			},
			{
				description: 'New session',
				'default': 'n',
				handler: function() {
					if(confirm("Are you sure you wish to create a new session?")) {
						newSession();
					}
				}
			},
			{
				description: 'Comment on session',
				'default': 'shift+c',
				handler: $('sessionComment').focus.bind($('sessionComment'))
			}
		],
		'Gui stuff': [
			{
				description: '+10px scramble area',
				'default': '=',
				handler: resizeScrambleArea.bind(null, 10)
			},
			{
				description: '-10px scramble area',
				'default': '-',
				handler: resizeScrambleArea.bind(null, -10)
			},
			{
				description: '+50px scramble area',
				'default': 'shift+=',
				handler: resizeScrambleArea.bind(null, 50)
			},
			{
				description: '-50px scramble area',
				'default': 'shift+-',
				handler: resizeScrambleArea.bind(null, -50)
			},
			{
				description: 'Toggle scramble view',
				'default': 's',
				handler: scrambleStuff.toggleScrambleView
			},
			{
				description: 'Scroll up times table',
				'default': 'pageup',
				handler: scrollTable(-100)
			},
			{
				description: 'Scroll down times table',
				'default': 'pagedown',
				handler: scrollTable(100)
			},
			{
				description: 'Scroll to top of times table',
				'default': 'home',
				handler: scrollTable(-Infinity)
			},
			{
				description: 'Scroll to bottom of times table',
				'default': 'end',
				handler: scrollTable(Infinity)
			}
		],
		'Miscellaneous': [
			{
				description: 'Help',
				'default': 'shift+/',
				handler: $('helpLink').doClick
			},
			{
				description: 'Select puzzle',
				'default': 'q',
				handler: scrambleStuff.puzzleSelect.show
			},
			{
				description: 'Select event',
				'default': 'w',
				handler: eventSelect.show
			},
			{
				description: 'Select session',
				'default': 'e',
				handler: sessionSelect.show
			}
		]
	});
	function getShortcutKeys(shortcut) {
		var keys = shortcut.keys;
		if(keys === null || keys === undefined) {
			keys = shortcut['default'] || '';
		}
		return keys;
	}
	function getShortcutMap() {
		var shortcutMap = {};
		shortcuts.getValues().each(function(category) {
			category.each(function(shortcut) {
				var keys = getShortcutKeys(shortcut);
				var shortArr = shortcutMap[keys];
				if(!shortArr) {
					shortArr = [];
					shortcutMap[keys] = shortArr;
				}
				shortArr.push(shortcut);
			});
		});
		return new Hash(shortcutMap);
	}

	shortcuts.getValues().each(function(category) {
		category.each(function(shortcut) {
			var keys = configuration.get('shortcuts.' + shortcut.description, null);
			shortcut.keys = keys;
		});
	});


    function keyStopper(func) {
        return function(e) {
            e.stop();
            // Silly hack for opera. Apparently calling stop() isn't enough
            // to stop keypress events from entering text into a textfield.
            setTimeout(func, 0);
        };
    }
	// NOTE: We don't need to explicitly call this function in
	//       order to initialize stuff, because the onHide() method
	//       calls it, and onHide() is called by createPopup().
	function addShortcutListeners() {
		keyboard.removeEvents();
		getShortcutMap().getValues().each(function(shortcuts) {
			for(var i = 0; i < shortcuts.length; i++) {
				var shortcut = shortcuts[0];
				var keys = shortcut.keys;
				configuration.set('shortcuts.' + shortcut.description, keys);
				keys = getShortcutKeys(shortcut);
				if(keys !== '' && shortcuts.length == 1 && shortcut.handler) {
					// If we have duplicate shortcuts, don't program any of them
					// Note that we still save all the settings to configuration
					keyboard.addEvent(keys, keyStopper(shortcut.handler));
				}
			}
		});
	}
	function highlightDuplicates() {
		//TODO - do something more clever to detect n & n+m
		getShortcutMap().getValues().each(function(shortcuts) {
			var duplicates = shortcuts.length > 1;
			for(var i = 0; i < shortcuts.length; i++) {
				var shortcut = shortcuts[i];
				shortcut.editor.setStyle('color', '');
				shortcut.editor.setStyle('border-color', '');
				if(getShortcutKeys(shortcut) !== '' && duplicates) {
					shortcut.editor.setStyle('color', 'red');
					shortcut.editor.setStyle('border-color', 'red');
				}
			}
		});
	}
	function onHide() {
		addShortcutListeners();
	}

	var helpPopup = tnoodle.tnt.createPopup(null, onHide);

	helpPopup.refresh = function() {
		helpPopup.empty();
		var shortcutsDiv = document.createElement('div');
		shortcutsDiv.setStyle("overflow", 'auto');
		helpPopup.overflow = function() {
			var size = helpPopup.getParent().getSize();
			shortcutsDiv.setStyle("height", size.y-40);
			shortcutsDiv.setStyle("margin-right", '');
		};
		helpPopup.reset = function() {
			//TODO - wow this is nasty
			shortcutsDiv.setStyle("height", '');
			shortcutsDiv.setStyle("width", '');
			shortcutsDiv.setStyle("margin-right", 21);
		};
		helpPopup.appendChild(shortcutsDiv);
		shortcuts.getKeys().each(function(category) {
			var categorySpan = document.createElement('span');
			categorySpan.appendText(category);
			categorySpan.setStyle('font-weight', 'bold');
			shortcutsDiv.appendChild(categorySpan);
			shortcuts[category].each(function(shortcut) {
				var shortcutDiv = document.createElement('div');
				shortcutDiv.setStyle('margin-left', 10);

				var label = document.createElement('label');
				label.setStyle('font-size', '12px');
				label.setStyle('float', 'left');
				//label.setStyle('margin-left', 10);
				label.setStyle('width', 200);
				label.appendText(shortcut.description + ':');
				shortcutDiv.appendChild(label);

				var textField = document.createElement('input');
				textField.setStyle('width', 60);
				textField.type = 'text';
				textField.value = getShortcutKeys(shortcut);
				textField.shortcut = shortcut;
				textField.addEvent('keydown', function(e) {
					if(e.key == 'esc') {
						// If we don't stop the event, then the popup will disappear
						e.stop();
						this.blur();
					}
				});
				//TODO - check for copy paste, does keyup really work?
				//textField.addEvent('keyup', function(e) {
					//this.shortcut.keys = this.value;
					//highlightDuplicates();
				//});
				textField.addEvent('focus', function() {
					editingShortcutField = this;
				});
				//textField.addEvent('change', function() {
					//this.shortcut.keys = this.value;
					//highlightDuplicates();
				//});
				shortcutDiv.appendChild(textField);
				shortcut.editor = textField;

				shortcutsDiv.appendChild(shortcutDiv);
			});
		});
		highlightDuplicates();
		var reset = document.createElement('input');
		reset.type = 'button';
		reset.value = 'Reset';
		reset.addEvent('click', function() {
			if(!confirm('This will reset all shortcuts! Are you sure you wish to continue?')) {
				return;
			}
			shortcuts.getValues().each(function(category) {
				category.each(function(shortcut) {
					shortcut.keys = shortcut['default'] || '';
				});
			});
			helpPopup.refresh();
		});
		helpPopup.appendChild(reset);
	};

	$('bgLink').reset = function() {
		$('bgLink').empty();
		$('bgLink').appendText('Set background');
	};
	var bgImg = $$('.background')[0];
	var bgImgSize = null;
	function setBgUrl(url) {
		if(url === undefined || url === null) {
			url = "";
		}
		configuration.set('gui.backgroundImage', url);
		if(url == "") {
			$('bgLink').reset();
			bgImg.setStyle('display', 'none');
			window.removeEvent('resize', resizeBgImg);
		} else {
			if(bgImg.src == url) {
				// This is more efficient + the load event won't
				// fire if we don't change the src
				return;
			}
			$('bgLink').empty();
			$('bgLink').appendText('Loading...');
			bgImgSize = null;
			bgImg.src = url;
			bgImg.setStyle('display', 'inline');
			bgImg.setStyle('width', '');
			bgImg.setStyle('height', '');
			// neat little trick to keep the image from showing up until it has loaded
			bgImg.setStyle('opacity', '0');
			bgImg.addEvent('load', function() {
				$('bgLink').reset();
				bgImgSize = bgImg.getSize();
				resizeBgImg();
				bgImg.setStyle('opacity', '1');
			});
			bgImg.addEvent('error', function() {
				$('bgLink').reset();
				$('bgLink').appendText(' (failed to load: ' + url + ')');
			});
			window.addEvent('resize', resizeBgImg);
		}
	}
	function resizeBgImg() {
		if(bgImgSize === null) {
			// image hasn't loaded yet, so there's nothing we can do
			return;
		}
		var available = document.body.getSize();
		var height = available.y;
		var width = Math.max(available.x, available.y * (bgImgSize.x/bgImgSize.y));
		height = width * bgImgSize.y/bgImgSize.x;
		bgImg.setStyle('width', width);
		bgImg.setStyle('height', height);

		bgImg.setStyle('left', (available.x - width) / 2);
		bgImg.setStyle('top', (available.y - height) / 2);
	}
	$('bgLink').addEvent('click', function() {
		var url = prompt("Url?", configuration.get('gui.backgroundImage')); 
		if(url !== null) {
			setBgUrl(url);
		}
	});
	setBgUrl(configuration.get('gui.backgroundImage', ''));
});
