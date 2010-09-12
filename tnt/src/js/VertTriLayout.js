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
		this.resizeDiv.show = function() {
			this.morph({ 'background-color': '#000' });
		};
		this.resizeDiv.hide = function() {
			this.morph({ 'background-color': '#fff' });
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
		function stopDragging() {
			document.body.style.cursor = '';
		}
		dragger.addEvent('start', startDragging);
		dragger.addEvent('complete', stopDragging);
		dragger.addEvent('drag', function() {
			this.resizeDiv.show();
			this.config.set('layout.sizerHeight', window.getSize().y - this.resizeDiv.getPosition().y);
			this.position();
		}.bind(this));

		window.addEvent('resize', this.resize.bind(this));
		window.addEvent('load', this.resize.bind(this));
		setTimeout(this.resize.bind(this), 0);
	},
	resize: function() {
		this.resizeDiv.setStyle('top', window.getSize().y - this.config.get('layout.sizerHeight'));
		
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
			right.resize();
		}
	}
});
