/*
---

script: Color.js

description: Class for creating and manipulating colors in JavaScript. Supports HSB -> RGB Conversions and vice versa.

license: MIT-style license

authors:
- Sam Goody
- Valerio Proietti

requires:
- core:1.2.4/Array
- core:1.2.4/String
- core:1.2.4/Number
- core:1.2.4/Hash
- core:1.2.4/Function
- core:1.2.4/$util

provides: [Color]

...
*/

var Color = new Native({

	initialize: function(color, type){
		if (arguments.length >= 3){
			type = 'rgb'; color = Array.slice(arguments, 0, 3);
		} else if (typeof color == 'string'){
			if (color.match(/rgb/)) color = color.rgbToHex().hexToRgb(true);
			else if (color.match(/hsb/)) color = color.hsbToRgb();
			else color = color.hexToRgb(true);
		}
		type = type || 'rgb';
		switch (type){
			case 'hsb':
				var old = color;
				color = color.hsbToRgb();
				color.hsb = old;
			break;
			case 'hex': color = color.hexToRgb(true); break;
		}
		color.rgb = color.slice(0, 3);
		color.hsb = color.hsb || color.rgbToHsb();
		color.hex = color.rgbToHex();
		return $extend(color, this);
	}

});

Color.implement({

	mix: function(){
		var colors = Array.slice(arguments);
		var alpha = ($type(colors.getLast()) == 'number') ? colors.pop() : 50;
		var rgb = this.slice();
		colors.each(function(color){
			color = new Color(color);
			for (var i = 0; i < 3; i++) rgb[i] = Math.round((rgb[i] / 100 * (100 - alpha)) + (color[i] / 100 * alpha));
		});
		return new Color(rgb, 'rgb');
	},

	invert: function(){
		return new Color(this.map(function(value){
			return 255 - value;
		}));
	},

	setHue: function(value){
		return new Color([value, this.hsb[1], this.hsb[2]], 'hsb');
	},

	setSaturation: function(percent){
		return new Color([this.hsb[0], percent, this.hsb[2]], 'hsb');
	},

	setBrightness: function(percent){
		return new Color([this.hsb[0], this.hsb[1], percent], 'hsb');
	}

});

var $RGB = function(r, g, b){
	return new Color([r, g, b], 'rgb');
};

var $HSB = function(h, s, b){
	return new Color([h, s, b], 'hsb');
};

var $HEX = function(hex){
	return new Color(hex, 'hex');
};

Array.implement({

	rgbToHsb: function(){
		var red = this[0],
				green = this[1],
				blue = this[2],
				hue = 0;
		var max = Math.max(red, green, blue),
				min = Math.min(red, green, blue);
		var delta = max - min;
		var brightness = max / 255,
				saturation = (max != 0) ? delta / max : 0;
		if(saturation != 0) {
			var rr = (max - red) / delta;
			var gr = (max - green) / delta;
			var br = (max - blue) / delta;
			if (red == max) hue = br - gr;
			else if (green == max) hue = 2 + rr - br;
			else hue = 4 + gr - rr;
			hue /= 6;
			if (hue < 0) hue++;
		}
		return [Math.round(hue * 360), Math.round(saturation * 100), Math.round(brightness * 100)];
	},

	hsbToRgb: function(){
		var br = Math.round(this[2] / 100 * 255);
		if (this[1] == 0){
			return [br, br, br];
		} else {
			var hue = this[0] % 360;
			var f = hue % 60;
			var p = Math.round((this[2] * (100 - this[1])) / 10000 * 255);
			var q = Math.round((this[2] * (6000 - this[1] * f)) / 600000 * 255);
			var t = Math.round((this[2] * (6000 - this[1] * (60 - f))) / 600000 * 255);
			switch (Math.floor(hue / 60)){
				case 0: return [br, t, p];
				case 1: return [q, br, p];
				case 2: return [p, br, t];
				case 3: return [p, q, br];
				case 4: return [t, p, br];
				case 5: return [br, p, q];
			}
		}
		return false;
	},
	
	fromRgb: function(space,decimal){
		var v, 
			hsl = 0, 
			rgb = $A(this).sort(function(a,b){
				return res = a - b 
			}),
			min = rgb[0], 
			max = rgb[2];
		
		switch((space||'').toLowerCase().slice(-1)){
			default : 
				v = max / 2.55; 
				span = v;  break; 
			case 'g': 
				v = min / (min - max + 255) * 100;
				span = 100;  break; 
			case 'l': 
				v = (+max + +min) / 5.1; 
				span = v * 2; 
				if (v > 50){ 
					span = 200 - span; 
					hsl = 100 - span; 
				}
		}

		var s = 100 * (min / 2.55 - v) / (hsl - v);
		var d = (100 * (rgb[1] / 2.55 - v) / s + v - hsl) / span;
		for(var ind = '', i = 0; i < 3; i++) ind += rgb.indexOf(this[i]);
		var h = '210,120,021,012,102,201,110,020,011,002,101,000'.indexOf(ind)/4%6;
		h += h%2 ? 1-d : d;
		return [h*60,s,v].map(function(i){ return decimal ? i||0 : Math.round(i||0) });	
	},

	toRgb: function(space,decimal){					
		var val = this[2] * 1, hsl = 0;
		switch((space||'v').slice(-1).toLowerCase()){
			default : span = val; break;
			case 'g': span = 100; break;
			case 'l': span = val * 2; 
				if (val > 50){
					span = 200 - span;
					hsl = 100 - span;
				}
		}
		var hue = this[0]%360/60, rad = Math.floor(hue), odd = rad%2; 
		var rgb = [], map = [0, (odd ? 1+rad-hue : hue-rad), 1];
		map.each(function(density,i){
			var index = Math.floor(hue / 2 + 5 + i * (odd||-1))%3;
			var color = this[1] / 100 * (density * span - val + hsl) + val;
			rgb[index] = decimal ? color * 2.55 : Math.round(color * 2.55);
			//rgb[index] = Math.round(color * 2.55);
		}, this);
		return rgb;
	}
});

String.implement({

	rgbToHsb: function(){
		var rgb = this.match(/\d{1,3}/g);
		return (rgb) ? rgb.rgbToHsb() : null;
	},

	hsbToRgb: function(){
		var hsb = this.match(/\d{1,3}/g);
		return (hsb) ? hsb.hsbToRgb() : null;
	},
	
	fromRgb: function(space){
		var rgb = this.match(/\d{1,3}/g);
		return (rgb) ? rgb.fromRgb(space) : null;
	},

	toRgb: function(space){
		var hsb = this.match(/\d{1,3}/g);
		return (hsb) ? hsb.toRgb(space) : null;
	}

});
/*
ToDo:
6,163,0 - infinity
168,4,4 - 360 / 0
*/