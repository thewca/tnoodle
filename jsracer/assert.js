function getSourceContext(file, line) {
	var PADDING = 2;

	var context = 'File: ' + file + ':' + line + '\n';
	var p = new printStackTrace.implementation();
	for(var curLine = line-PADDING; curLine <= line+PADDING; curLine++) {
		context += ( line == curLine ? '>' : '   ' ) + curLine + ":    " + p.getSource(file)[curLine-1] + '\n';
	}
	return context;
}

window.onerror = function(msg, file, line, stackTrace) {
	var context = getSourceContext(file, line);
	if(!stackTrace) {
		var stackTrace = printStackTrace();
		// This cuts out the backtrace in stacktrace.js
		stackTrace = stackTrace.slice(3);
	}
	alert(msg + "\n\n" + context + "\n" + stackTrace.join('\n'));
};

function assert(condition, message) {
	if(!condition) {
		var p = new printStackTrace.implementation();
		var result = p.run(null);
		stackTrace = p.guessAnonymousFunctions(result);
		// This cuts out the backtrace in stacktrace.js
		stackTrace = stackTrace.slice(3);
		assertionFrame = stackTrace[0];
		var reAssertion = /.* \((.*):([0-9]+):([0-9]+)\)/;
		var m = reAssertion.exec(assertionFrame);
		var assertion = null;
		if(m) {
			var file = m[1];
			var line = parseInt(m[2], 10);
			assertion = p.getSource(file)[line - 1]; // ahh, indexing from 1
		} else {
			assertion = 'Could not retrieve line of code at ' + assertionFrame;
		}
		window.onerror("Assertion failure!\n" + message, file, line, stackTrace);
	}
}
