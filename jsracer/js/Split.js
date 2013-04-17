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

        leftElement.setStyle('top', 0);
        leftElement.setStyle('left', 0);
        leftElement.setStyle('position', 'absolute');

        rightElement.setStyle('top', 0);
        rightElement.setStyle('right', 0);
        rightElement.setStyle('position', 'absolute');
        

        var resizeBar = document.createElement('div');
        resizeBar.addClass('verticalResizeBar');
        var resizeBarVisible = document.createElement('div');
        resizeBarVisible.addClass('verticalResizeBarVisible');
        resizeBar.appendChild(resizeBarVisible);
        rightElement.appendChild(resizeBar);
        resizeBarVisible.fade('hide');
        resizeBar.addEvent('mouseover', function() {
                resizeBarVisible.fade('in');
        });
        resizeBar.addEvent('mouseout', function() {
                resizeBarVisible.fade('out');
        });

        resizeBar.setStyle('top', 0);
        rightElement.appendChild(resizeBar);

        var rightElementVisible = true;
        function setRightElementVisible(visible) {
                if(rightElementVisible == visible) {
                        rightElement.setVisible(visible);
                        return;
                }
                if(!rightElementVisible) {
                        rightElementVisible = true;

                        rightElement.setStyle('right', 0);
                        rightElement.setVisible(rightElementVisible);
                        resize();
                } else {
                        rightElementVisible = false;

                        rightElement.setStyle('right', MINIMIZED_SHOWING-rightElement.getSize().x);
                        rightElement.setVisible(rightElementVisible);
                        resize();
                }
        }

        resizeBar.addEvent('dblclick', setRightElementVisible);

        function resize(rightElementWidth) {
                var size = window.getSize();
                var width = size.x;
                var height = size.y;
                if(!rightElementWidth) {
                        rightElementWidth = rightElement.getSize().x;
                }
                var effectiveRightElementWidth = rightElementVisible ? rightElementWidth : MINIMIZED_SHOWING;
                var leftElementWidth = width - effectiveRightElementWidth;
                leftElement.setSize(leftElementWidth, height);
                rightElement.setSize(rightElementWidth, height);
        }
        function onDrag(e) {
                var size = window.getSize();
                var width = size.x;
                var height = size.y;
                var rightElementWidth = width - e.page.x;
                if(rightElementWidth < MINIMIZED_SHOWING) {
                        return;
                }
                resize(rightElementWidth);
        }


        var dragging = false;
        function stopDragging() {
                dragging = false;
                document.body.removeEvent('mousemove', onDrag);
        }
        function startDragging() {
                dragging = true;
                document.body.addEvent('mousemove', onDrag);
        }
        resizeBar.addEvent('mousedown', function(e) {
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
        document.body.addEvent('mouseup', function() {
                stopDragging();
        });

        window.addEvent('resize', function(e) {
                resize();
        });

  // support for smartphones/tablets...
        window.addEvent('orientationchange', function(e) {
                resize();
        });

        this.element = document.createElement('div');
        this.element.appendChild(leftElement);
        this.element.appendChild(rightElement);

        this.setRightElementVisible = setRightElementVisible;

        // Initialize everything
        setTimeout(function() {
                resize(200);
        }, 0);

        var that = this;
};

})();
