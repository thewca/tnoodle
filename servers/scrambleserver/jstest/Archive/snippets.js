setBG1:function(val){
var v = Math.round(val * 2.55), grey = v+','+v+','+v, shape = 'radial';

if (Browser.Engine.gecko && window.hasOwnProperty("onhashchange"))
	this.e.crShade.setStyle('background-image','-moz-'+shape+'-gradient(center center, circle closest-side, rgb('+grey+') '+(100-(this.val||1))+'%,  rgba('+grey+',0)100%)');//rgb('+grey+'),
else if (Browser.Engine.trident && shape == 'linear')
	this.e.crShade.setStyle(
		Browser.Engine.version < 4 ? 'filter':'-ms-filter',
		'progid:DXImageTransform.Microsoft.Gradient(GradientType=0, StartColorStr="#FF'+000000+'", EndColorStr="#00'+000000+'")'
	);
else if (Browser.Engine.webkit)
	this.e.crShade.setStyle('background','-webkit-gradient('+shape+', center center, 0, center center, '+70.5+', from(rgb('+grey+')), to(rgba('+grey+',0))');
else this.e.crBox.setStyle('background-color', 'rgb('+grey+')');
},
	
function Firefox36(){
	var FF36;
	// Any of the below will return true if browser is 3.6, false for 3.5
	FF36 = !!new Element('div').setStyle('background','-moz-linear-gradient(red, blue)').getStyle('background'); 
	
	FF36 = window.hasOwnProperty('onhashchange');
	FF36 = Hash.has(window, 'onhashchange');
}

/*
Notes:
#1:
Zero degrees on the sphere is assumed to be at the the 12:00 position.  
This differs from classic trig, which assumes zero to be at 3:00.
To switch to classic, make the following changes:
In updateBox: 
	h = Math.atan2(y,x) * 180 / Math.PI,
In setBox:
	left :this.radius + radius * Math.cos(angle) ,
	top  :this.radius + radius * Math.sin(angle) 

#2:
Full support in Firefox 3.6, and webkit.
Support for linear in trident.
Fallback hsg support for Opera, Trident/radial, FF 3.5, other browsers.
Regarding IE support:
	a. Overview of filters: 
		http://msdn.microsoft.com/en-us/library/ms532853%28VS.85%29.aspx
		http://www.ssi-developer.net/css/visual-filters.shtml
	b. The gradient filter does not support a start [or end] point, and cannot do radial.
		http://msdn.microsoft.com/en-us/library/ms532997%28VS.85%29.aspx
	c. The light filter may well be able to do a controlled radial gradient, though I failed to create one.
		It allows for any numbers of points, cones or ambiences.
		http://msdn.microsoft.com/en-us/library/ms533011%28VS.85%29.aspx
		http://www.javascriptkit.com/filters/light.shtml
	d. The alpha linear filter supports start [and end] points.
		[It also allows for angle gradients. The gradient is applied to the whole element, not just the background.]  
		The radial filter does not support start points [though it does support endpoints]
		http://msdn.microsoft.com/en-us/library/ms532967%28VS.85%29.aspx
		http://www.javascriptkit.com/filters/alpha.shtml
	e. [Other useful filters are Composite, which allows for elements to be combined. and BasicImage: Rotation, opacity, greyscale, mirror, xray, etc. 
*/

	shading: function(){
		var bgs = "background-image: -moz-radial-gradient(rgba(255,255,255,1), rgba(255,255,255,0)),\
		-webkit-gradient(radial, center center, 0, center center, 70.5, from(green), to(yellow))";
	},