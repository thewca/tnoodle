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
	createSelect: function() {
		var select = document.createElement('span');
		select.selectedIndex = 0;
		select.setStyle('cursor', 'default');
		select.setStyle('border', '1px solid gray');
		select.setStyle('border-radius', '2px');
		select.setStyle('padding-left', '5px');

		select.setStyle('user-select', 'none');
		select.setStyle('-moz-user-select', 'none');
		select.setStyle('-webkit-user-select', 'none');

		var selected = document.createElement('span');
		selected.appendText('');
		select.appendChild(selected);
		select.appendChild(document.createTextNode('\u25BC'));
		
		var optionsDiv = document.createElement('div');
		optionsDiv.appendText('boohoo');
		var visible = false;
		optionsDiv.fade('hide');
		optionsDiv.inject(select);

		optionsDiv.setStyle('padding', '5px');
		optionsDiv.setStyle('z-index', '10'); //TODO -random
		optionsDiv.setStyle('position', 'absolute');
		optionsDiv.setStyle('background', '#e3e3e3');
		optionsDiv.setStyle('-webkit-box-shadow', '#8B8B8B 0px 4px 10px');

		var options = [];
		var optionsHaveChanged = true;
		select.setOptions = function(new_options) {
			options = new_options;
			optionsHaveChanged = true;
		};
		select.setSelected = function(value) {
			if(optionsHaveChanged) {
				refresh();
			}
			var index = options.map(function(el) { return el.value; }).indexOf(value);
			if(index < 0) {
				//TODO - proper error messages
				alert("Couldn't find " + value);
				index = 0;
			}
			
			selected.innerHTML = options[index].html;
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
				div.setStyle('background', '');
			});
		}
		var refresh = function() {
			if(disabled) {
				this.setStyle('color', 'gray');
			} else {
				this.setStyle('color', 'black');
			}
			if(mouseover && !disabled) {
				this.setStyle('border-color', 'black');
			} else {
				this.setStyle('border-color', 'gray');
			}
			window.removeEvent('keydown', keyDown);
			if(visible) {
				window.addEvent('keydown', keyDown);
				if(optionsHaveChanged) {
					optionsHaveChanged = false;
					optionsDiv.empty();
					for(var i = 0; i < options.length; i++) {
						var option = document.createElement('div');
						option.innerHTML = options[i].html;
						option.value = options[i].value;
						option.index = i;
						optionsDiv.adopt(option);
						option.hover = function() {
							clearOptions();
							this.setStyle('background', 'white');
						}.bind(option);
						option.addEvent('mouseover', function(i) {
							hoveredIndex = i;
						}.bind(null, i));
						option.addEvent('click', function() {
							select.setSelected(this.value);
						});
					}
				}

				select.setStyle('background', '-webkit-gradient(linear, 0% 40%, 0% 70%, from(#777), to(#999))');
				optionsDiv.position({relativeTo: select, position: 'bottomLeft', edge: 'topLeft'});
				optionsDiv.getChildren()[hoveredIndex].hover();
				selected.innerHTML = options[hoveredIndex].html;
				optionsDiv.fade('show');
			} else {
				if(options.length > select.selectedIndex) {
					selected.innerHTML = options[select.selectedIndex].html;
				}
				optionsDiv.fade('hide');
				select.setStyle('background', '-webkit-gradient(linear, 0% 40%, 0% 70%, from(#F9F9F9), to(#E3E3E3))');
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
		select.addEvent('click', function(e) {
			if(disabled) {
				return;
			}
			visible = !visible;
			hoveredIndex = this.selectedIndex;
			refresh();
			e.stop();
		});
		window.addEvent('click', function(e) {
			visible = false;
			refresh();
		}.bind(select));
		function keyDown(e) {
			if(e.key == 'up') {
				hoveredIndex = Math.max(0, hoveredIndex-1);
			} else if(e.key == 'down') {
				hoveredIndex = Math.min(options.length-1, hoveredIndex+1);
			} else if(e.key == 'enter') {
				select.setSelected(options[hoveredIndex].value);
				visible = false;
			} else if(e.key == 'esc') {
				visible = false;
			} else {
				return;
			}
			refresh();
		}

		var disabled = false;
		select.setDisabled = function(new_disabled) {
			disabled = new_disabled;
			visible = false;
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
