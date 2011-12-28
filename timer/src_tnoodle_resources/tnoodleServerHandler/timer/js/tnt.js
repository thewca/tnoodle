var tnoodle = tnoodle || {};
tnoodle.tnt = {
	version: '%%VERSION%%',
	isTextEditing: function() {
		var focusedEl = document.activeElement.nodeName.toLowerCase();
		return ( focusedEl == 'textarea' || focusedEl == 'input' );
	},
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
			visible = true;
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
		var visible = false;
		popup.hide = function() {
			visible = false;
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
		popup.isVisible = function() {
			return visible;
		}.bind(popup);
		popup.hide();

		function keydown(e) {
			if(e.key == 'esc') {
				popup.hide();
				e.stop();
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
		for(var i = 0; i < this.selects_.length; i++) {
			if(this.selects_[i].selecting) {
				return true;
			}
		}
		return false;
	},
	selects_: [],
	textSizer_: null,
	createSelect: function(rightTip, leftTip) {
		rightTip = rightTip || null;
		var select = document.createElement('span');
		this.selects_.push(select);
		select.addClass('select');
		select.selectedIndex = 0;

		function createOptionSpan() {
			var span = document.createElement('span');
			var img = document.createElement('img');
			img.setStyle('vertical-align', 'middle');
			img.setStyle('width', '32px');
			img.setStyle('height', '32px');
			img.setStyle('padding', '0px 2px 2px 0px');
			img.setStyle('display', 'none');
			span.appendChild(img);
			var optionTextSpan = document.createElement('span');
			span.appendChild(optionTextSpan);

			span.img = img;
			span.textSpan = optionTextSpan;
			return span;
		}
		function fillWithOption(el, option, maxWidth) {
			if(!maxWidth) {
				maxWidth = Infinity;
			}

			el.setStyle('height', '');
			el.img.setStyle('display', 'none');
			if(option.icon) {
				el.img.setStyle('display', 'inline');
				if(el.img.src != option.icon) {
					el.img.src = option.icon;
				}
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
			el.textSpan.empty();
			el.textSpan.appendText(resizeStr(option.text, maxWidth));
			if(option.text === "" && !option.icon) {
				// Nasty little hack to deal with empty options
				el.setStyle('height', '19px');
			}
		}
		var selected = createOptionSpan();
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
		select.selecting = false;
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
				assert(false, "Couldn't find " + value + ' in [' + values.join(",") + ']');
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
			optionsDiv.getChildren('span').each(function(div) {
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

			if(!select.selecting) {
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
			if(selected && selected.text !== '') {
				select.title = selected.text + '\n' + select.title;
			}

			window.removeEvent('keydown', keyDown);
			window.removeEvent('click', windowClicked);
			if(select.selecting) {
				window.addEvent('keydown', keyDown);
				window.addEvent('click', windowClicked);
				if(optionsHaveChanged) {
					optionsHaveChanged = false;
					optionsDiv.empty();
					for(var i = 0; i < options.length; i++) {
						var option = createOptionSpan();
						option.setStyle('display', 'block');
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
			select.selecting = true;
			select.arrow2.addClass('hovered');
			hoveredIndex = this.selectedIndex;
			// If we run refresh() immediately, the current
			// mouse click will cause windowClicked() to get called,
			// which will make our dropdown invisible.
			setTimeout(refresh, 0);
		}.bind(select);
		select.addEvent('click', select.show);
		function windowClicked(e) {
			select.selecting = false;
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
				select.selecting = false;
			} else if(e.key == 'esc') {
				select.selecting = false;
			} else if(e.key == 'left' || e.key == 'right') {
				if(select.arrow1) {
					select.arrow1.toggleClass('hovered');
					select.arrow2.toggleClass('hovered');
				}
			} else if(e.key == 'tab') {
				e.stop();

				select.selecting = false;
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
			select.selecting = false;
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
