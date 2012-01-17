var Split = {};

(function() {

// The number of pixels of the rightElement we show when it is minimized
var MINIMIZED_SHOWING = 20;

Split.VerticalSplit = function(leftElement, rightElement) {
	assert(leftElement.setSize);
	assert(rightElement.setSize);
	assert(rightElement.setVisible);

	leftElement.parent = this;
	rightElement.parent = this;

	leftElement.css('top', 0);
	leftElement.css('left', 0);
	leftElement.css('position', 'absolute');

	rightElement.css('top', 0);
	rightElement.css('right', 0);
	rightElement.css('position', 'absolute');
	

	var resizeBar = $('<div/>');
	resizeBar.addClass('verticalResizeBar');
	var resizeBarVisible = $('<div/>');
	resizeBarVisible.addClass('verticalResizeBarVisible');
	resizeBar.append(resizeBarVisible);
	rightElement.append(resizeBar);
	resizeBarVisible.css('opacity', 0);
	resizeBar.hover(
		function() {
			resizeBarVisible.stop();
			resizeBarVisible.animate({opacity: 1});
		},
		function() {
			resizeBarVisible.stop();
			resizeBarVisible.animate({opacity: 0});
		}
	);

	resizeBar.css('top', 0);
	rightElement.append(resizeBar);

	var rightElementVisible = true;
	function setRightElementVisible(visible) {
		if(rightElementVisible == visible) {
			rightElement.setVisible(visible);
			return;
		}
		if(!rightElementVisible) {
			rightElementVisible = true;
			rightElement.animate({right: 0}, 200, function() {
				rightElement.setVisible(rightElementVisible);
				resize();
			});
		} else {
			rightElementVisible = false;
			rightElement.animate({right: MINIMIZED_SHOWING-rightElement.outerWidth()}, 200, function() {
				rightElement.setVisible(rightElementVisible);
				resize();
			});
		}
	}

	resizeBar.dblclick(setRightElementVisible);

	function resize(rightElementWidth) {
		var height = $(window).height();
		if(!rightElementWidth) {
			rightElementWidth = $(rightElement).width();
		}
		var effectiveRightElementWidth = rightElementVisible ? rightElementWidth : MINIMIZED_SHOWING;
		var leftElementWidth = $(window).width() - effectiveRightElementWidth;
		leftElement.setSize(leftElementWidth, height);
		rightElement.setSize(rightElementWidth, height);
	}
	function onDrag(e) {
		var height = $(window).height();
		var rightElementWidth = $(window).width() - e.pageX;
		if(rightElementWidth < MINIMIZED_SHOWING) {
			return;
		}
		resize(rightElementWidth);
	}


	var dragging = false;
	function stopDragging() {
		dragging = false;
		$('body').unbind('mousemove', onDrag);
	}
	function startDragging() {
		dragging = true;
		$('body').mousemove(onDrag);
	}
	resizeBar.mousedown(function(e) {
		e.preventDefault(); // This prevents text selection
		if(!rightElementVisible) {
			return;
		}
		if(dragging) {
			stopDragging();
		} else {
			startDragging();
		}
	});
	$('body').mouseup(function() {
		stopDragging();
	});

	$(window).resize(function(e) {
		resize();
	});

	this.element = $('<div/>');
	this.element.append(leftElement);
	this.element.append(rightElement);

	this.setRightElementVisible = setRightElementVisible;

	// Initialize everything
	setTimeout(function() {
		resize(200);
	}, 0);

	var that = this;
};

})();
