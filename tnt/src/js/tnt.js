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
	createOptions: function(showCallback, hiddenCallback) {
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
			optionsDiv.fade('out');
			timer = setTimeout(fireHidden, 500);
			optionsButton.morph('.optionsButton');
		};
		optionsDiv.fade('hide');
		
		optionsButton.addEvent('mouseover', optionsDiv.show);
		optionsButton.addEvent('mouseout', optionsDiv.hide);
		optionsDiv.addEvent('mouseover', optionsDiv.show);
		optionsDiv.addEvent('mouseout', optionsDiv.hide);
		return {
			div: optionsDiv,
			button: optionsButton
		};
	},
	createPopup: function(show, hide) {
		var popup = document.createElement('div');
		popup.className = 'popup';
		popup.style.zIndex = 5; //this belongs on top
		document.body.appendChild(popup);

		popup.show = function() {
			this.style.display = 'inline';
			this.center();
			show();
		}.bind(popup);
		popup.center = function() {
			var windowWidth = window.innerWidth || window.clientWidth;
			var windowHeight = window.innerHeight || window.clientHeight;
			var importWidth = parseInt(this.getStyle('width'), 10);
			var importHeight = parseInt(this.getStyle('height'), 10);
			this.style.top = (windowHeight - importHeight)/2 + 'px';
			this.style.left = (windowWidth - importWidth)/2 + 'px';
		}.bind(popup);
		popup.hide = function() {
			this.style.display = 'none';
		}.bind(popup);
		popup.hide();
		document.addEvent('keydown', function(e) {
			if(e.keyCode == 27) {
				popup.hide();
			}
		});
		window.addEvent('resize', popup.center);
		return popup;
	}
};
