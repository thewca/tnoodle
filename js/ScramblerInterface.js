var ScramblerInterface = {};

(function() {

function assert(bool) {
	if(!bool) {
		throw "Assertion!";
	}
}

ScramblerInterface.ScramblerInterface = function(canZip, callbacks) {
	if(canZip) {
		assert(callbacks.showZip);
	}
	assert(callbacks.showScrambles);
	assert(callbacks.roundAdded);
	assert(callbacks.roundRemoved);
	assert(callbacks.titleChanged);
	
	this.div = document.createElement('div');
	this.div.appendChild(document.createTextNode("hello, world"));

	callbacks.roundAdded(function() {
		alert("done generating something...");
	});
};

})();
