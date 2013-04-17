var TriLayout = new Class( {
        rotation : 0,
        swaps : [ 0, 1, 2 ],
        margin : 5,
        initialize : function(q1, q2, bar, config) {
                this.config = config;
                this.rotation = config.get('layout.rotation', this.rotation);
                this.swaps = config.get('layout.order', this.swaps);
                var space = window.getSize();
                var center = config.get('layout.center', {
                        x : space.x / 2 - 3,
                        y : space.y / 2 - 3
                });

                q1.setStyle('position', 'absolute');
                q2.setStyle('position', 'absolute');
                bar.setStyle('position', 'absolute');
                this.divs = [ q1, q2, bar ];

                document.body.setStyle('overflow', 'hidden');
                this.resizeDiv = new Element('div');

                var margin = this.margin;
                var topLeft = {
                        'top' : margin,
                        'right' : null,
                        'left' : margin,
                        'bottom' : null
                };
                var topRight = {
                        'top' : margin,
                        'right' : margin,
                        'left' : null,
                        'bottom' : null
                };
                var bottomRight = {
                        'top' : null,
                        'right' : margin,
                        'left' : null,
                        'bottom' : margin
                };
                var bottomLeft = {
                        'top' : null,
                        'right' : null,
                        'left' : margin,
                        'bottom' : margin
                };

                this.quarterPositions = [ topLeft, topRight, bottomRight, bottomLeft ];

                var top = {
                        'top' : margin,
                        'right' : margin,
                        'left' : margin,
                        'bottom' : null
                };
                var right = {
                        'top' : margin,
                        'right' : margin,
                        'left' : null,
                        'bottom' : margin
                };
                var bottom = {
                        'top' : null,
                        'right' : margin,
                        'left' : margin,
                        'bottom' : margin
                };
                var left = {
                        'top' : margin,
                        'right' : null,
                        'left' : margin,
                        'bottom' : margin
                };

                barPositions = [ bottom, left, top, right ];

                this.counterClockwise = new Element('img', {
                        src: 'media/arrow_rotate_anticlockwise.png',
                        title: 'Rotate tris counter clockwise'
                });
                this.counterClockwise.setStyle('position', 'absolute');
                this.counterClockwise.setStyle('cursor', 'pointer');
                this.counterClockwise.fade('hide');

                this.clockwise = new Element('img', {
                        src: 'media/arrow_rotate_clockwise.png',
                        title: 'Rotate tris clockwise'
                });
                this.clockwise.setStyle('position', 'absolute');
                this.clockwise.setStyle('cursor', 'pointer');
                this.clockwise.fade('hide');

                this.swap = new Element('img', {
                        src: 'media/arrow_switch.png',
                        title: 'Swap tris'
                });
                this.swap.setStyle('position', 'absolute');
                this.swap.setStyle('cursor', 'pointer');
                this.swap.fade('hide');

                var showRotate = function() {
                        this.counterClockwise.position( {
                                relativeTo : this.resizeDiv,
                                edge : 'bottomRight',
                                position : 'topLeft'
                        });
                        this.clockwise.position( {
                                relativeTo : this.resizeDiv,
                                edge : 'bottomLeft',
                                position : 'topRight'
                        });
                        this.swap.position( {
                                relativeTo : this.resizeDiv,
                                edge : 'top',
                                position : 'bottom'
                        });

                        this.counterClockwise.fade('in');
                        this.clockwise.fade('in');
                        this.swap.fade('in');
                }.bind(this);

                var hideRotate = function() {
                        this.counterClockwise.fade('out');
                        this.clockwise.fade('out');
                        this.swap.fade('out');
                }.bind(this);

                this.resizeDiv.setStyle('width', 5);
                this.resizeDiv.setStyle('height', 5);
                this.resizeDiv.setStyle('border', '1px solid black');
                this.resizeDiv.setStyle('cursor', 'move');
                this.resizeDiv.setStyle('background-color', 'white');
                this.resizeDiv.setStyle('position', 'absolute');
                this.resizeDiv.setStyle('z-index', '3');
                this.clockwise.setStyle('z-index', '2');
                this.counterClockwise.setStyle('z-index', '2');
                this.swap.setStyle('z-index', '2');

                this.counterClockwise.addEvent('mouseover', showRotate);
                this.clockwise.addEvent('mouseover', showRotate);
                this.resizeDiv.addEvent('mouseover', showRotate);
                this.swap.addEvent('mouseover', showRotate);

                this.counterClockwise.addEvent('mouseout', hideRotate);
                this.clockwise.addEvent('mouseout', hideRotate);
                this.resizeDiv.addEvent('mouseout', hideRotate);
                this.swap.addEvent('mouseout', hideRotate);

                this.clockwise.addEvent('click', function() {
                        this.rotation = (this.rotation + 1) % 4;
                        this.resize();
                        config.set('layout.rotation', this.rotation);
                }.bind(this));
                this.counterClockwise.addEvent('click', function() {
                        this.rotation = (this.rotation + 3) % 4;
                        this.resize();
                        config.set('layout.rotation', this.rotation);
                }.bind(this));

                var maskCount = 0;
                function createMask(el) {
                        var mask = new Element('div');
                        mask.setStyle('border', '1px solid black');
                        mask.setStyle('background-color', 'rgba(100,100,100,.5)');
                        mask.setStyle('text-align', 'center');
                        mask.setStyle('position', 'absolute');
                        mask.setStyle('z-index', 1);
                        mask.toggle();
                        mask.masked = el;
                        mask.index = maskCount++;
                        mask.set('html', mask.index);
                        mask.resize = function() {
                                var size = mask.getSize();
                                mask.setStyle('font-size', Math.min(size.x, size.y));
                        };
                        document.body.adopt(mask);
                        return mask;
                }
                this.masks = [ createMask(q1), createMask(q2), createMask(bar) ];
                var swaps = this.swaps;
                var resize = this.resize.bind(this);
                this.masks.each(function(div) {
                        var others = this.masks.slice().erase(div);
                        var drag = new Drag.Move(div, {
                                droppables : others
                        });
                        drag.addEvent('drop', function(element, droppable, event) {
                                if(droppable) {
                                        droppable.setStyle('background-color', 'rgba(100,100,100,.5)');
                                        var a = swaps.indexOf(droppable.index);
                                        var b = swaps.indexOf(element.index);
                                        swaps[a] = element.index;
                                        swaps[b] = droppable.index;
                                        config.set('layout.order', swaps);
                                }
                                resize();
                        });

                        drag.addEvent('enter', function(element, droppable) {
                                droppable.setStyle('background-color', 'rgba(255,0,0,.5)');
                        });

                        drag.addEvent('leave', function(element, droppable) {
                                droppable.setStyle('background-color', 'rgba(100,100,100,.5)');
                        });

                        drag.addEvent('start', function() {
                                div.setStyle('z-index', 2);
                                div.setStyle('border', '1px dashed black');
                        });
                        drag.addEvent('complete', function() {
                                div.setStyle('z-index', 1);
                                div.setStyle('border', '1px solid black');
                        });
                }.bind(this));
                var swappingTris = false;
                this.masksVisible = false;
                var toggleMasks = function toggleMasks() {
                        if(this.masksVisible && swappingTris) {
                                // we don't disable the masks if swapping is enabled
                                return;
                        }
                        this.masksVisible = !this.masksVisible;
                        for( var i = 0; i < this.masks.length; i++) {
                                this.masks[i].toggle();
                                this.divs[i].toggle();
                        }
                        this.resize();
                }.bind(this);
                this.swap.addEvent('click', function() {
                        swappingTris = !swappingTris;
                        toggleMasks();
                });
                this.resizeDiv.setPosition(center);

                window.addEvent('resize', this.resize.bind(this));
                window.addEvent('load', this.resize.bind(this));
                // window.addEvent('focus', function(e) {
                // resizeTimesArea(true); //this seems to be helping with some resizing
                // issues i've been having
                // });
                setTimeout(this.resize.bind(this), 0);

                document.body.adopt(q1);
                document.body.adopt(q2);
                document.body.adopt(bar);
                document.body.adopt(this.resizeDiv);
                document.body.adopt(this.counterClockwise);
                document.body.adopt(this.clockwise);
                document.body.adopt(this.swap);

                var dragger = new Drag(this.resizeDiv, {
                        snap : 0
                });
                dragger.addEvent('start', toggleMasks);
                dragger.addEvent('complete', toggleMasks);
                dragger.addEvent('drag', function() {
                        showRotate();
                        this.resize();
                }.bind(this));
        },
        resize : function() {
                this.config.set('layout.center', this.resizeDiv.getPosition());
                if(this.masksVisible) {
                        this.position(this.masks);
                } else {
                        this.position(this.divs);
                }
        },
        position : function(divs) {
                var q1 = divs[this.swaps[0]];
                var q2 = divs[this.swaps[1]];
                var bar = divs[this.swaps[2]];
                var q1Vert = q1.getStyle('border-top').toInt() + q1.getStyle('border-bottom').toInt() + this.margin;
                var q1Horz = q1.getStyle('border-right').toInt() + q1.getStyle('border-left').toInt() + this.margin;

                var q2Vert = q2.getStyle('border-top').toInt() + q2.getStyle('border-bottom').toInt() + this.margin;
                var q2Horz = q2.getStyle('border-right').toInt() + q2.getStyle('border-left').toInt() + this.margin;

                var barVert = bar.getStyle('border-top').toInt() + bar.getStyle('border-bottom').toInt();
                var barHorz = bar.getStyle('border-right').toInt() + bar.getStyle('border-left').toInt();
                if(this.rotation % 2 === 0) {
                        barVert += this.margin;
                        barHorz += this.margin * 2;
                } else {
                        barVert += this.margin * 2;
                        barHorz += this.margin;
                }

                q1.setStyles(this.quarterPositions[this.rotation]);

                q2.setStyles(this.quarterPositions[(this.rotation + 1) % 4]);

                bar.setStyles(barPositions[this.rotation]);

                var pos = this.resizeDiv.getPosition();
                var size = this.resizeDiv.getSize();
                var centerX = pos.x + size.x - 3;
                var centerY = pos.y + size.y - 3;
                var space = window.getSize();

                // there may be a better way of doing this, but at least this is
                // readable and easy
                switch(this.rotation) {
                case 0:
                        q1.setStyle('width', centerX - q1Horz);
                        q1.setStyle('height', centerY - q1Vert);

                        q2.setStyle('width', space.x - centerX - q1Horz);
                        q2.setStyle('height', centerY - q1Vert);

                        bar.setStyle('width', space.x - barHorz);
                        bar.setStyle('height', space.y - centerY - barVert);
                        break;
                case 1:
                        q1.setStyle('width', space.x - centerX - q1Horz);
                        q1.setStyle('height', centerY - q1Vert);

                        q2.setStyle('width', space.x - centerX - q2Horz);
                        q2.setStyle('height', space.y - centerY - q2Vert);

                        bar.setStyle('width', centerX - barHorz);
                        bar.setStyle('height', space.y - barVert);
                        break;
                case 2:
                        q1.setStyle('width', space.x - centerX - q1Horz);
                        q1.setStyle('height', space.y - centerY - q1Vert);

                        q2.setStyle('width', centerX - q2Horz);
                        q2.setStyle('height', space.y - centerY - q2Vert);

                        bar.setStyle('width', space.x - barHorz);
                        bar.setStyle('height', centerY - barVert);
                        break;
                case 3:
                        q1.setStyle('width', centerX - q1Horz);
                        q1.setStyle('height', space.y - centerY - q1Vert);

                        q2.setStyle('width', centerX - q2Horz);
                        q2.setStyle('height', centerY - q2Vert);

                        bar.setStyle('width', space.x - centerX - barHorz);
                        bar.setStyle('height', space.y - barVert);
                        break;
                default:
                        // oh snaps
                }

                if(q1.resize) {
                        q1.resize();
                }
                if(q2.resize) {
                        q2.resize();
                }
                if(bar.resize) {
                        bar.resize();
                }
        }
});
