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
	createSelect: function() {
		var select = document.createElement('span');
		select.addClass('select');
		select.selectedIndex = 0;

		var selected = document.createElement('span');
		selected.appendText('');
		select.appendChild(selected);
		// Add a nice little upside down triangle
		select.appendChild(document.createTextNode('\u25BC'));
		
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
		var selectedIndex = null;
		function showItem(index) {
			if(index == selectedIndex) {
				return;
			}
			selected.empty();
			var newEl = options[index].el.clone();
			selected.adopt(newEl);
			selectedIndex = index;
		}
		select.setSelected = function(value) {
			if(optionsHaveChanged) {
				refresh();
			}
			var index = options.map(function(el) { return el.value; }).indexOf(value);
			if(index < 0) {
				//TODO - proper error messages
				alert("Couldn't find " + value + ' in [' + options.join(",") + ']');
				index = 0;
			}
			
			showItem(index);
			select.selectedIndex = index;
			if(select.onchange) {
				select.onchange();
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
		function mouseOver() {
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
						option.adopt(options[i].el.clone());
						option.value = options[i].value;
						option.index = i;
						optionsDiv.adopt(option);
						option.hover = hover;
						option.addEvent('mouseover', mouseOver);
						option.addEvent('click', optionClicked);					}
				}

				select.addClass('selecting');
				optionsDiv.position({relativeTo: select, position: 'bottomLeft', edge: 'topLeft'});
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

		var mouseover = false;
		select.addEvent('mouseover', function() {
			mouseover = true;
			refresh();
		});
		select.addEvent('mouseout', function() {
			mouseover = false;
			refresh();
		});
		select.show = function() {
			if(disabled) {
				return;
			}
			selecting = !selecting;
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
	}
});
