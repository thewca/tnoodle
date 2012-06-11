// packager build Class-Extras/* History/*
/*
---

name: Class.Binds

description: A clean Class.Binds Implementation

authors: Scott Kyle (@appden), Christoph Pojer (@cpojer)

license: MIT-style license.

requires: [Core/Class, Core/Function]

provides: Class.Binds

...
*/

Class.Binds = new Class({

	$bound: {},

	bound: function(name){
		return this.$bound[name] ? this.$bound[name] : this.$bound[name] = this[name].bind(this);
	}

});

/*
---

name: Class.Instantiate

description: Simple Wrapper for Mass-Class-Instantiation

authors: Christoph Pojer (@cpojer)

license: MIT-style license.

requires: [Core/Class]

provides: Class.Instantiate

...
*/

Class.Instantiate = function(klass, options){
	var create = function(object){
		if (object.getInstanceOf && object.getInstanceOf(klass)) return;
		new klass(object, options);
	};

	return function(objects){
		objects.each(create);
	};
};

/*
---

name: Class.Singleton

description: Beautiful Singleton Implementation that is per-context or per-object/element

authors: Christoph Pojer (@cpojer)

license: MIT-style license.

requires: [Core/Class]

provides: Class.Singleton

...
*/

(function(){

var storage = {

	storage: {},

	store: function(key, value){
		this.storage[key] = value;
	},

	retrieve: function(key){
		return this.storage[key] || null;
	}

};

Class.Singleton = function(){
	this.$className = String.uniqueID();
};

Class.Singleton.prototype.check = function(item){
	if (!item) item = storage;

	var instance = item.retrieve('single:' + this.$className);
	if (!instance) item.store('single:' + this.$className, this);

	return instance;
};

var gIO = function(klass){

	var name = klass.prototype.$className;

	return name ? this.retrieve('single:' + name) : null;

};

if (('Element' in this) && Element.implement) Element.implement({getInstanceOf: gIO});

Class.getInstanceOf = gIO.bind(storage);

})();

/*
---

name: Class.Properties

description: Provides getters/setters sugar for your class properties.

authors: Christoph Pojer (@cpojer)

license: MIT-style license.

requires: [Core/Class, Core/String]

provides: Class.Properties

...
*/

(function(){

var setter = function(name){
	return function(value){
		this[name] = value;
		return this;
	};
};

var getter = function(name){
	return function(){
		return this[name] || null;
	};
};

Class.Mutators.Properties = function(properties){
	this.implement(properties);

	for (var prop in properties){
		var name = prop.replace(/^_+/, '').capitalize().camelCase();
		this.implement('set' + name, setter(prop));
		this.implement('get' + name, getter(prop));
	}
};

})();


/*
---

name: History

description: History Management via popstate or hashchange.

authors: Christoph Pojer (@cpojer)

license: MIT-style license.

requires: [Core/Events, Core/Element.Event, Class-Extras/Class.Binds]

provides: History

...
*/

(function(){

var events = Element.NativeEvents,
	location = window.location,
	base = location.pathname,
	history = window.history,
	hasPushState = ('pushState' in history),
	event = hasPushState ? 'popstate' : 'hashchange';

this.History = new new Class({

	Implements: [Class.Binds, Events],

	initialize: hasPushState ? function(){
		events[event] = 2;
		window.addEvent(event, this.bound('pop'));
	} : function(){
		events[event] = 1;
		window.addEvent(event, this.bound('pop'));

		this.hash = location.hash;
		var hashchange = ('onhashchange' in window);
		if (!(hashchange && (document.documentMode === undefined || document.documentMode > 7)))
			this.timer = this.check.periodical(200, this);
	},

	push: hasPushState ? function(url, title, state){
		if (base && base != url) base = null;
		
		history.pushState(state || null, title || null, url);
		this.onChange(url, state);
	} : function(url){
		location.hash = url;
	},

	replace: hasPushState ? function(url, title, state){
		history.replaceState(state || null, title || null, url);
	} : function(url){
		this.hash = '#' + url;
		this.push(url);
	},

	pop: hasPushState ? function(event){
		var url = location.pathname;
		if (url == base){
			base = null;
			return;
		}
		this.onChange(url, event.event.state);
	} : function(){
		var hash = location.hash;
		if (this.hash == hash) return;

		this.hash = hash;
		this.onChange(hash.substr(1));
	},

	onChange: function(url, state){
		this.fireEvent('change', [url, state || {}]);
	},

	back: function(){
		history.back();
	},

	forward: function(){
		history.forward();
	},
	
	getPath: function(){
		//return hasPushState ? location.pathname : location.hash.substr(1);
		return hasPushState ? location.pathname + location.search : location.hash.substr(1); // TODO - jfly push upstream?
	},

	hasPushState: function(){
		return hasPushState;
	},

	check: function(){
		if (this.hash != location.hash) this.pop();
	}

});

}).call(this);


/*
---

name: History.handleInitialState

description: Provides a helper method to handle the initial state of your application.

authors: Christoph Pojer (@cpojer)

license: MIT-style license.

requires: [History]

provides: History.handleInitialState

...
*/

History.handleInitialState = function(base){
	if (!base) base = '';
	var location = window.location,
		//pathname = location.pathname.substr(base.length),
		pathname = location.pathname.substr(base.length) + location.search,
		hash = location.hash,
		hasPushState = History.hasPushState();

	if (!hasPushState && pathname.length > 1){
		window.location = (base || '/') + '#' + pathname;
		return true;
	}

	if (!hash || hash.length <= 1) return false;
	if (hasPushState){
		(function(){
			History.push(hash.substr(1));
		}).delay(1);
		return false;
	}

	if (!pathname || pathname == '/') return false;
	window.location = (base || '/') + hash;
	return true;
};

