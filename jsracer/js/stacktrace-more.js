function getSourceContext(file, line) {
    var PADDING = 2;

    var context = 'File: ' + file + ':' + line + '\n';
    try {
        var p = new printStackTrace.implementation();
        for(var curLine = line-PADDING; curLine <= line+PADDING; curLine++) {
            context += ( line == curLine ? '>' : '   ' ) + curLine + ":    " + p.getSource(file)[curLine-1] + '\n';
        }
    } catch(e) {
        context += e;
    }
    return context;
}

window.onerror = function(msg, file, line, stackTrace) {
    var context = getSourceContext(file, line);
    if(!stackTrace) {
        stackTrace = printStackTrace();
        // This cuts out the backtrace in stacktrace.js
        stackTrace = stackTrace.slice(3);
    }
    alert(msg + "\n\n" + context + "\n" + stackTrace.join('\n'));
};

var stacker = new printStackTrace.implementation();
function alertBacktrace(message, stackTrace) {
    var lastFrame = stackTrace[0];
    var reLineOfCode = /.* \((.*):([0-9]+):([0-9]+)\)/;
    var m = reLineOfCode.exec(lastFrame);
    var lineOfCode = null;
    var file = "?";
    var lineNumber = "?";
    if(m) {
        file = m[1];
        lineNumber = parseInt(m[2], 10);
        try {
            lineOfCode = stacker.getSource(file)[lineNumber - 1]; // ahh, indexing from 1
        } catch(e) {
            lineOfCode = e;
        }
    } else {
        lineOfCode = 'Could not retrieve line of code at ' + lastFrame;
    }
    window.onerror(message, file, lineNumber, stackTrace);
}

function alertException(error) {
    var msg = error.message;
    var stackTrace = printStackTrace({e:error});
    alertBacktrace(msg, stackTrace);
}

function assert(condition, errorMessage) {
    if(!condition) {
        var messageStr = "Assertion failure!";
        if(errorMessage) {
            messageStr += " " + errorMessage;
        }
        var result = stacker.run(null);
        var stackTrace = stacker.guessAnonymousFunctions(result);
        // This cuts out the backtrace in stacktrace.js
        stackTrace = stackTrace.slice(3);
        alertBacktrace(messageStr, stackTrace);
    }
}

