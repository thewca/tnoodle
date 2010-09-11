function xAddListener(obj, event, func, useCapture) {
	if(obj.addEventListener) {
		obj.addEventListener(event, func, useCapture);
	} else {
		obj.attachEvent('on' + event, function(e) {
			func.call(obj, e);
		});
	}
}

// callback is a function(color), where color is encoded as a hex string
function ColorChooser(callback) {
	function rgb2hex(rgb) {
		var r = rgb.r;
		var g = rgb.g;
		var b = rgb.b;
		if(r > 255 || r < 0 || g > 255 || g < 0 || b > 255 || b < 0) {
			return 'bad rgb';
		}
		return (0x1000000 | (r << 4 * 4) | (g << 4 * 2) | b).toString(16).substring(1);
	}
	function hex2rgb(hex) {
		var r = parseInt(hex.substring(0, 2), 16);
		var g = parseInt(hex.substring(2, 4), 16);
		var b = parseInt(hex.substring(4, 6), 16);
		return {
			r : r,
			g : g,
			b : b
		};
	}
	// http://www.easyrgb.com/index.php?X=MATH&H=19#text19
	// RGB from 0 to 255, returns HSL from 0 to 1
	function rgb2hsl(rgb) {
		var R = (rgb.r / 255);
		var G = (rgb.g / 255);
		var B = (rgb.b / 255);

		var Min = Math.min(R, G, B); // Min. value of RGB
		var Max = Math.max(R, G, B); // Max. value of RGB
		var del_Max = Max - Min; // Delta RGB value

		var L = (Max + Min) / 2;

		var H, S;
		if(del_Max === 0) { // This is a gray, no chroma...
			H = 0; // HSL results from 0 to 1
			S = 0;
		} else {
			// Chromatic data...
			if(L < 0.5) {
				S = del_Max / (Max + Min);
			} else {
				S = del_Max / (2 - Max - Min);
			}

			var del_R = (((Max - R) / 6) + (del_Max / 2)) / del_Max;
			var del_G = (((Max - G) / 6) + (del_Max / 2)) / del_Max;
			var del_B = (((Max - B) / 6) + (del_Max / 2)) / del_Max;

			if(R == Max) {
				H = del_B - del_G;
			} else if(G == Max) {
				H = (1 / 3) + del_R - del_B;
			} else if(B == Max) {
				H = (2 / 3) + del_G - del_R;
			}

			if(H < 0) {
				H += 1;
			}
			if(H > 1) {
				H -= 1;
			}
		}
		return {
			h : H,
			s : S,
			l : L
		};
	}

	// HSL from 0 to 1, returns RGB from 0 to 1
	function hsl2rgb(hsl) {
		var h = hsl.h;
		var s = hsl.s;
		var l = hsl.l;
		var m1, m2, hue;
		var r, g, b;
		if(s === 0) {
			r = g = b = (l * 255);
		} else {
			if(l <= 0.5) {
				m2 = l * (s + 1);
			} else {
				m2 = l + s - l * s;
			}
			m1 = l * 2 - m2;
			r = HueToRgb(m1, m2, h + 1 / 3);
			g = HueToRgb(m1, m2, h);
			b = HueToRgb(m1, m2, h - 1 / 3);
		}
		return {
			r : Math.round(r),
			g : Math.round(g),
			b : Math.round(b)
		};
	}

	function HueToRgb(m1, m2, hue) {
		var v;
		if(hue < 0) {
			hue += 1;
		} else if(hue > 1) {
			hue -= 1;
		}

		if(6 * hue < 1) {
			v = m1 + (m2 - m1) * hue * 6;
		} else if(2 * hue < 1) {
			v = m2;
		} else if(3 * hue < 2) {
			v = m1 + (m2 - m1) * (2 / 3 - hue) * 6;
		} else {
			v = m1;
		}

		return 255 * v;
	}
	function hsToIJ(hs) {
		var theta = hs.h * 2 * Math.PI;
		var x = Math.cos(theta) * hs.s;
		var y = Math.sin(theta) * hs.s;
		x *= color_radius / color_width;
		y *= color_radius / color_width;
		return {
			i : (y - 1) * 0.5 * color_width * -1,
			j : (x + 1) * 0.5 * color_width
		};
	}
	function i_jToHS(i, j) {
		var y = -i / (0.5 * color_width) + 1;
		var x = j / (0.5 * color_width) - 1;
		y *= color_width / color_radius;
		x *= color_width / color_radius;

		var h = Math.atan2(y, x) / (2 * Math.PI);
		if(h < 0) {
			h++;
		}
		var s = Math.sqrt(x * x + y * y);
		return {
			h : h,
			s : s
		};
	}
	function inColorCircle(e) {
		var pt = getPoint(e);
		return i_jToHS(pt.y, pt.x).s <= 1;
	}
	function inLum(e) {
		var pt = getPoint(e);
		return pt.x > color_width && pt.x < color_width + lum_width;
	}
	function getPoint(e) {
		if(e.offsetX && e.offsetY) {
			return {
				x : e.offsetX,
				y : e.offsetY
			};
		}
		var obj = e.target;
		var currleft = obj.offsetLeft;
		var currtop = obj.offsetTop;
		while((obj = obj.offsetParent)) {
			currleft += obj.offsetLeft;
			currtop += obj.offsetTop;
		}
		return {
			x : e.pageX - currleft,
			y : e.offsetY = e.pageY - currtop
		};
	}

	var color_width = 200;
	var color_radius = 180;
	var gap = 10;
	var lum_width = 35;
	var height = color_width;

	var box = document.createElement('canvas');
	var context = null;
	if(box.getContext) {
		box.setAttribute('width', color_width + lum_width);
		box.setAttribute('height', height);

		context = box.getContext('2d');
		var colorCircleData = context.getImageData(0, 0, color_width + gap, height);
		var data = colorCircleData.data;

		// not sure if the color patch should reflect the luminance or not
		new_hsl = {
			l : 0.5
		};
		for( var i = 0; i < colorCircleData.height; i++) {
			for(var j = 0; j < color_width; j++) {
				var hs = i_jToHS(i, j);
				new_hsl.h = hs.h;
				new_hsl.s = hs.s;
				if(new_hsl.s > 1) {
					continue;
				}

				var rgb = hsl2rgb(new_hsl);
				var index = (i * colorCircleData.width + j) * 4;
				data[index] = rgb.r;
				data[index + 1] = rgb.g;
				data[index + 2] = rgb.b;
				data[index + 3] = 255;
			}
		}

		var draggingColorCircle = false, draggingLum = false;
		xAddListener(box, 'mousedown', function(e) {
			if(e.button === 0) {
				var cursor = "pointer";
				if(inColorCircle(e)) {
					draggingColorCircle = true;
				} else if(inLum(e)) {
					draggingLum = true;
				} else {
					cursor = "default";
				}
				box.style.cursor = cursor; // this doesn't work in stupid
											// chrome

				mouseMoved(e);
			}
		}, false);
		xAddListener(box, 'mouseup', function(e) {
			if(e.button === 0) {
				draggingColorCircle = draggingLum = false;
				box.style.cursor = "default";
				redraw();
			}
		}, false);

		var mouseMoved = function(e) {
			var pt;
			if(draggingColorCircle) {
				pt = getPoint(e);
				var hs = i_jToHS(pt.y, pt.x);
				hs.s = Math.min(1, hs.s);
				hs.l = selectedHSL.l;
				setSelectedHSL(hs);
			} else if(draggingLum) {
				pt = getPoint(e);
				var lum = 1 - (pt.y - gap) / (height - 2 * gap);
				lum = Math.min(1, Math.max(0, lum));
				var hsl = {
					h : selectedHSL.h,
					s : selectedHSL.s,
					l : lum
				};
				setSelectedHSL(hsl);
			}
		};
		xAddListener(box, 'mousemove', mouseMoved, false);
	}
	function redraw() {
		if(!context) {
			// not all browsers support the canvas element =(
			return;
		}
		context.clearRect(0, 0, color_width + lum_width, height);
		context.putImageData(colorCircleData, 0, 0);
		
		var i, rgb;
		var new_hsl = {
				h : selectedHSL.h,
				s : selectedHSL.s
		};
		var imgData = context.getImageData(color_width, 0, lum_width, height);
		var data = imgData.data;
		for(i = gap; i < imgData.height - gap; i++) {
			new_hsl.l = 1 - ((i - gap) / (imgData.height - 2 * gap));
			rgb = hsl2rgb(new_hsl);
			for( var j = gap; j < lum_width - gap; j++) {
				var index = (i * lum_width + j) * 4;
				data[index] = rgb.r;
				data[index + 1] = rgb.g;
				data[index + 2] = rgb.b;
				data[index + 3] = 255;
			}
		}
		context.putImageData(imgData, color_width, 0);
		
		rgb = [ selectedRGB.r, selectedRGB.g, selectedRGB.b ];
		for(i = 0; i < rgb.length; i++) {
			rgb[i] = 255 - rgb[i];
		}
		context.strokeStyle = 'rgb(' + rgb.join(',') + ')';
		if(!draggingColorCircle) {
			var ij = hsToIJ(selectedHSL);
			var x_size = 10;
			var x_hollow = 4;
			context.beginPath();
			context.moveTo(ij.j - x_size, ij.i);
			context.lineTo(ij.j - x_hollow, ij.i);
			context.closePath();
			context.stroke();
			context.beginPath();
			context.moveTo(ij.j + x_size, ij.i);
			context.lineTo(ij.j + x_hollow, ij.i);
			context.closePath();
			context.stroke();
			context.beginPath();
			context.moveTo(ij.j, ij.i + x_size);
			context.lineTo(ij.j, ij.i + x_hollow);
			context.closePath();
			context.stroke();
			context.beginPath();
			context.moveTo(ij.j, ij.i - x_size);
			context.lineTo(ij.j, ij.i - x_hollow);
			context.closePath();
			context.stroke();
		}
		
		// drawing lum
		var y = (1 - selectedHSL.l) * (height - 2 * gap) + gap;
		context.beginPath();
		context.moveTo(color_width, y);
		context.lineTo(color_width + gap, y);
		context.closePath();
		context.stroke();
		context.beginPath();
		context.moveTo(color_width + lum_width - gap, y);
		context.lineTo(color_width + lum_width, y);
		context.closePath();
		context.stroke();
	}

	var button_width = 110;

	function rgbChanged() {
		var rgb = {
			r : redBox.value,
			g : greenBox.value,
			b : blueBox.value
		};
		for(var key in rgb) {
			if(rgb.hasOwnProperty(key)) {
				rgb[key] = parseInt(rgb[key], 10);
				if(isNaN(rgb[key])) {
					rgb[key] = selectedRGB[r];
				}
				rgb[key] = Math.max(Math.min(rgb[key], 255), 0);
			}
		}
		setSelectedRGB(rgb);
	}

	function createRGBInput(color) {
		var label = document.createElement('label');
		label.setAttribute('for', color);
		label.style.fontFamily = 'monospace';
		label.appendChild(document.createTextNode(color + ': '));

		var input = document.createElement('input');
		input.id = color;
		input.style.width = 70 + 'px';
		input.style.marginRight = '4px';
		input.style.marginTop = '2px';
		input.setAttribute('type', 'number');
		input.setAttribute('min', 0);
		input.setAttribute('max', 255);
		input.setAttribute('step', 1);
		xAddListener(input, 'change', rgbChanged, false);

		var div = document.createElement('div');
		div.field = input;
		div.appendChild(label);
		div.appendChild(input);
		return div;
	}
	var accept = document.createElement('input');
	accept.setAttribute('type', 'button');
	accept.setAttribute('value', 'Accept');
	accept.style.width = button_width + 'px';

	var reset = document.createElement('input');
	reset.setAttribute('type', 'button');
	reset.setAttribute('value', 'Reset');
	reset.style.width = button_width + 'px';

	var red = createRGBInput('R');
	var redBox = red.field;
	var green = createRGBInput('G');
	var greenBox = green.field;
	var blue = createRGBInput('B');
	var blueBox = blue.field;

	var buttons = document.createElement('div');
	buttons.appendChild(red);
	buttons.appendChild(document.createElement('br'));
	buttons.appendChild(green);
	buttons.appendChild(document.createElement('br'));
	buttons.appendChild(blue);
	buttons.appendChild(document.createElement('br'));
	buttons.appendChild(reset);
	buttons.appendChild(document.createElement('br'));
	buttons.appendChild(accept);

	// TODO - the 15 and 26 were found via trial and error, and probably aren't
	// too solid
	var weird_gap = 15;
	var titlebar = 21;

	this.preferredWidth = weird_gap + button_width;
	this.preferredHeight = height;
	if(context) {
		this.preferredWidth += color_width + lum_width;
		// don't even bother figuring out what the next 2 lines do, just live
		// with them
		this.preferredHeight += titlebar;
		titlebar += 10;
	}
	var element = this.element = document.createElement('div');
	element.style.width = this.preferredWidth + 'px';
	element.style.height = this.preferredHeight + 'px';

	// buttons.style.cssFloat = 'right';
	buttons.style.position = 'absolute';
	// buttons.style.left = (this.preferredWidth-button_width)/2. + 'px';
	buttons.style.right = '5px';
	buttons.style.top = titlebar + 'px';

	this.element.appendChild(box);
	this.element.appendChild(buttons);

	xAddListener(accept, 'click', function() {
		callback(rgb2hex(selectedRGB));
	}, false);

	var defaultRGB, selectedRGB, selectedHSL;
	function setSelectedRGB(rgb) {
		selectedRGB = rgb;
		selectedHSL = rgb2hsl(rgb);
		redBox.value = selectedRGB.r;
		greenBox.value = selectedRGB.g;
		blueBox.value = selectedRGB.b;
		element.style.backgroundColor = '#' + rgb2hex(selectedRGB);
		redraw();
	}
	function setSelectedHSL(hsl) {
		selectedHSL = hsl;
		selectedRGB = hsl2rgb(hsl);
		redBox.value = selectedRGB.r;
		greenBox.value = selectedRGB.g;
		blueBox.value = selectedRGB.b;
		element.style.backgroundColor = '#' + rgb2hex(selectedRGB);
		redraw();
	}
	this.setDefaultColor = function(color) {
		defaultRGB = hex2rgb(color);
		setSelectedRGB(defaultRGB);
	};
	xAddListener(reset, 'click', function() {
		setSelectedRGB(defaultRGB);
	}, false);
}
