var tnoodle = tnoodle || {};
tnoodle.tnt = {
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
	createPopup: function(onShow, onHide, size) {
		var popup = document.createElement('div');
		popup.className = 'popup';
		popup.style.zIndex = 5; //this belongs on top
		document.body.appendChild(popup);

		popup.show = function() {
			this.style.display = 'inline';
			this.center();
			if(onShow) {
				onShow();
			}
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
				innerDiv.setStyle('width', width-8);
				innerDiv.setStyle('height', height-8);
			} else {
				width = parseInt(this.getStyle('width'), 10);
				height = parseInt(this.getStyle('height'), 10);
			}
			this.style.top = (windowHeight - height)/2 + 'px';
			this.style.left = (windowWidth - width)/2 + 'px';
		}.bind(popup);
		popup.hide = function() {
			this.style.display = 'none';
			if(onHide) {
				onHide();
			}
		}.bind(popup);
		popup.hide();
		document.addEvent('keydown', function(e) {
			if(e.key == 'esc') {
				popup.hide();
			}
		});
		window.addEvent('resize', popup.center);

		var mouseDown = false;
		document.addEvent('mouseup', function(e) {
			mouseDown = false;
		});
		document.addEvent('mousedown', function(e) {
			mouseDown = true;
			if(!e.target) {
				e.target = e.srcElement; // freaking ie, man
			}

			if(!e.target.isOrIsChild(popup)) {
				popup.hide();
			}
		});
		
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
