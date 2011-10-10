/*
 * twisty_demo.js
 * 
 * Demonstration and testing harness for WSOH.
 * 
 * TOOD
 * - Fix document.getElementById(...) calls.
        // TODO somehow be able to cancel/prevent a move?
        // TODO clicking on canvas doesn't seem to focus window in firefox
        // TODO clicking and dragging is weird when the mouse leaves the window
 * 
 */

var cache = window.applicationCache;
function updateReadyCache() {
  window.applicationCache.swapCache();
  location.reload(true); // For now
}

var currentCubeSize = parseInt($("#cubeDimension").val());

var CubeState = {
  solved: 0,
  scrambling: 1,
  scrambled: 2,
  solving: 3,
};
var cubeState = null;

$(document).ready(function() {

  /*
   * Caching Stuff.
   */

  cache.addEventListener('updateready', updateReadyCache, false);

  log("Document ready.");

  var twistyScene = new twistyjs.TwistyScene();
  $("#twistyContainer").append($(twistyScene.getDomElement()));

  function setCubeSize(dim) {
    if (dim != currentCubeSize) {
      twistyScene.initializeTwisty({
        "type": "cube",
        "dimension": dim,
        allowDragging: true,
        showFps: true,
      });
      cubeState = CubeState.solved;
      resetTimer();
      currentCubeSize = dim;
      $("#cubeDimension").blur(); 
      twistyScene.resize();
    }
  }
  setCubeSize(3);

  $("#cubeDimension").bind("input", function() {
    var dim = parseInt($("#cubeDimension").val());
    if (!dim) {
      dim = 3;
    }
    dim = Math.min(Math.max(dim, 1), 16);
    setCubeSize(dim);
    return false;
  });

  $("#alg_ccc").bind("click", function() {
    twistyScene.animateMoves(makeCCC(parseInt($("#cubeDimension").val())));
  });

  $("#lucasparity").bind("click", function() {
    twistyScene.animateMoves(lucasparity);
  });

  $("#alg_superflip").bind("click", function() {
    twistyScene.animateMoves(superflip);
  });

  $("#parsed_alg1").bind("click", function() {
    twistyScene.animateMoves(stringToAlg($("#parse_alg").val()));
  });

  twistyScene.cam(0);

  $("#enableOfflineSupport").bind("click", function() {
    window.location.href = "offline.html";
  });

  $("#createCanvasPNG").bind("click", function() {
    var canvas = twistyScene.getCanvas();
    var img = canvas.toDataURL("image/png");
    log("Generating image...");
    $("#canvasPNG").fadeTo(0, 0);
    $("#canvasPNG").html('<a href="' + img + '" target="blank"><img src="'+img+'"/></a>');
    $("#canvasPNG").fadeTo("slow", 1);
  });


  $(window).resize(twistyScene.resize);

  // TODO add visual indicator of cube focus --jfly
  // clear up canvasFocused stuff...
  //$("#twistyContainer").addClass("canvasFocused");
  //$("#twistyContainer").removeClass("canvasFocused");

  $(window).keydown(function(e) {
    // This is kinda weird, we want to avoid turning the cube
    // if we're in a textarea, or input field.
    var focusedEl = document.activeElement.nodeName.toLowerCase();
    var isEditing = focusedEl == 'textarea' || focusedEl == 'input';
    if(isEditing) {
      return;
    }

    var keyCode = e.keyCode;
    switch(keyCode) {
      case 27:
        var twisty = twistyScene.getTwisty();
        twistyScene.initializeTwisty(twisty["type"]);
        cubeState = CubeState.solved;
        resetTimer();
        e.preventDefault();
        break;

      case 32:
        if (!isTiming()) {
          var twisty = twistyScene.getTwisty();
          var scramble = twisty.generateScramble(twisty);
          // We're going to get notified of the scrambling, and we don't
          // want to start the timer when that's happening, so we keep track
          // of the fact that we're scrambling.
          cubeState = CubeState.scrambling;
          twistyScene.applyMoves(scramble);
          cubeState = CubeState.scrambled;
          resetTimer();
        }
        e.preventDefault();
        break;
    }

    twistyScene.keydown(e);
  });

  twistyScene.addMoveListener(function(move, started) {
    if(started) {
      if(cubeState == CubeState.scrambling) {
        // We don't want to start the timer if we're scrambling the cube.
      } else if(cubeState == CubeState.scrambled) {
        var twisty = twistyScene.getTwisty();
        if(twisty.isInspectionLegalMove(twisty, move)) {
          return;
        }
        startTimer();
        cubeState = CubeState.solving;
      }
    } else {
      var twisty = twistyScene.getTwisty();
      if(cubeState == CubeState.solving && twisty.isSolved(twisty)) {
        cubeState = CubeState.solved;
        stopTimer();
      }
    }
  });

  var startTime = null;
  var stopTime = null;
  function startTimer() {
    startTime = new Date().getTime();
    stopTime = null;
    refreshTimer();
    startRefreshTimerLoop();
  }
  function isTiming() {
    return startTime != null && stopTime == null;
  }
  function stopTimer() {
    assert(startTime);
    stopTime = new Date().getTime();
    refreshTimer();
    stopRefreshTimerLoop();
  }

  function resetTimer() {
    startTime = null;
    stopTime = null;
    refreshTimer();
    stopRefreshTimerLoop();
  }

  function refreshTimer() {
    var timer = $("#timer");
    timer.removeClass("reset running stopped");
    if(isTiming()) {
      timer.addClass("running");
      timer.text(prettyTime(new Date().getTime()));
    } else if(startTime == null) {
      assert(stopTime == null);
      timer.addClass("reset");
      timer.text("[Timer]");
    } else if(stopTime != null) {
      assert(startTime);
      timer.addClass("stopped");
      timer.text(prettyTime(stopTime));
    }
  }

  var pendingTimerRefresh = null;
  function startRefreshTimerLoop() {
    if(pendingTimerRefresh == null) {
      pendingTimerRefresh = requestAnimFrame(refreshTimerLoop, $('#timer')[0]);
    }
  }
  function stopRefreshTimerLoop() {
    if(pendingTimerRefresh != null) {
      cancelRequestAnimFrame(pendingTimerRefresh);
      pendingTimerRefresh = null;
    }
  }
  function refreshTimerLoop() {
    refreshTimer();
    if(pendingTimerRefresh != null) {
      pendingTimerRefresh = requestAnimFrame(refreshTimerLoop, $('#timer')[0]);
    }
  }

  function pad(n, minLength) {
    var str = '' + n;
    while (str.length < minLength) {
      str = '0' + str;
    }
    return str;
  }

  function prettyTime(endTime) {
    var cumulative = endTime - startTime;
    var str = "";
    str += Math.floor(cumulative/1000/60);
    str += ":";
    str += pad(Math.floor(cumulative/1000 % 60), 2);
    str += ".";
    str += pad(Math.floor((cumulative % 1000) / 10), 2);
    return str;
  }

});

/*
 * Convenience Logging
 */

var logCounter = 0;

function log(obj) {
  if(typeof(console) !== "undefined" && console.log) {
    console.log(obj);
  }
  var previousHTML = $("#debug").html();
  previousHTML = (logCounter++) + ". " + obj + "<hr/>" + previousHTML;
  $("#debug").html(previousHTML);
}

function err(obj) {
  if(typeof(console) !== "undefined" && console.error) {
    console.error(obj);
  }
  var previousHTML = $("#debug").html();
  previousHTML = "<div class='err'>" + (logCounter++) + ". " + obj + "</div><hr/>" + previousHTML;
  $("#debug").html(previousHTML);
}

/*
 * Algs for testing
 */

var sune = [
[1, 1, "R", 1],
[1, 1, "U", 1],
[1, 1, "R", -1],
[1, 1, "U", 1],
[1, 1, "R", 1],
[1, 1, "U", 2],
[1, 1, "R", -1]
];
var ccc = [
[1, 1, "L", -1],
[1, 1, "U", 1],
[1, 1, "R", -1],
[1, 1, "F", -1],
[1, 1, "U", 1],
[1, 1, "L", -2],
[1, 1, "U", -2],
[1, 1, "L", -1],
[1, 1, "U", -1],
[1, 1, "L", 1],
[1, 1, "U", -2],
[1, 1, "D", 1],
[1, 1, "R", -1],
[1, 1, "D", -1],
[1, 1, "F", 2],
[1, 1, "R", 2],
[1, 1, "U", -1]
];
var ccc7 = [
[1, 1, "L", -1],
[1, 1, "U", 1],
[1, 1, "R", -1],
[1, 1, "F", -1],
[1, 1, "U", 1],
[1, 1, "L", -2],
[1, 1, "U", -2],
[1, 1, "L", -1],
[1, 1, "U", -1],
[1, 1, "L", 1],
[1, 1, "U", -2],
[1, 1, "D", 1],
[1, 1, "R", -1],
[1, 1, "D", -1],
[1, 1, "F", 2],
[1, 1, "R", 2],
[1, 1, "U", -1],
[1, 2, "L", -1],
[1, 2, "U", 1],
[1, 2, "R", -1],
[1, 2, "F", -1],
[1, 2, "U", 1],
[1, 2, "L", -2],
[1, 2, "U", -2],
[1, 2, "L", -1],
[1, 2, "U", -1],
[1, 2, "L", 1],
[1, 2, "U", -2],
[1, 2, "D", 1],
[1, 2, "R", -1],
[1, 2, "D", -1],
[1, 2, "F", 2],
[1, 2, "R", 2],
[1, 2, "U", -1],
[1, 3, "L", -1],
[1, 3, "U", 1],
[1, 3, "R", -1],
[1, 3, "F", -1],
[1, 3, "U", 1],
[1, 3, "L", -2],
[1, 3, "U", -2],
[1, 3, "L", -1],
[1, 3, "U", -1],
[1, 3, "L", 1],
[1, 3, "U", -2],
[1, 3, "D", 1],
[1, 3, "R", -1],
[1, 3, "D", -1],
[1, 3, "F", 2],
[1, 3, "R", 2],
[1, 3, "U", -1]
];
var layers = [
[1, 1, "R", 1],
[1, 1, "U", 1],
[1, 2, "R", 1],
[1, 2, "U", 1],
[1, 3, "R", 1],
[1, 3, "U", 1],
[1, 4, "R", 1],
[1, 4, "U", 1],
[1, 5, "R", 1],
[1, 5, "U", 1],
[2, 5, "R", 1],
[2, 5, "U", 1],
[3, 5, "R", 1],
[3, 5, "U", 1],
[4, 5, "R", 1],
[4, 5, "U", 1],
];
var lucasparity = [
[1, 2, "R", 1],
[1, 1, "U", 2],
[1, 4, "R", 1],
[1, 2, "R", 1],
[1, 1, "U", 2],
[1, 2, "R", 1],
[1, 1, "U", 2],
[1, 2, "R", -1],
[1, 1, "U", 2],
[1, 2, "L", 1],
[1, 1, "U", 2],
[1, 2, "R", -1],
[1, 1, "U", 2],
[1, 2, "R", 1],
[1, 1, "U", 2],
[1, 2, "R", -1],
[1, 1, "U", 2],
[1, 2, "R", -1]
];
var superflip = [
[2, 2, "R", 1],
[1, 1, "U", -1],
[2, 2, "R", 1],
[1, 1, "U", -1],
[2, 2, "R", 1],
[1, 1, "U", -1],
[2, 2, "R", 1],
[1, 1, "U", -1],
[1, 3, "U", -1],
[1, 3, "R", -1],
[2, 2, "R", 1],
[1, 1, "U", -1],
[2, 2, "R", 1],
[1, 1, "U", -1],
[2, 2, "R", 1],
[1, 1, "U", -1],
[2, 2, "R", 1],
[1, 1, "U", -1],
[1, 3, "U", -1],
[1, 3, "R", -1],
[2, 2, "R", 1],
[1, 1, "U", -1],
[2, 2, "R", 1],
[1, 1, "U", -1],
[2, 2, "R", 1],
[1, 1, "U", -1],
[2, 2, "R", 1],
[1, 1, "U", -1],
[1, 3, "U", -1],
[1, 3, "R", -1],
];

function makeCCC(n) {

  var cccMoves = [];

  for (var i = 1; i<=n/2; i++) {
    var moreMoves = [
[1, i, "L", -1],
[1, i, "U", 1],
[1, i, "R", -1],
[1, i, "F", -1],
[1, i, "U", 1],
[1, i, "L", -2],
[1, i, "U", -2],
[1, i, "L", -1],
[1, i, "U", -1],
[1, i, "L", 1],
[1, i, "U", -2],
[1, i, "D", 1],
[1, i, "R", -1],
[1, i, "D", -1],
[1, i, "F", 2],
[1, i, "R", 2],
[1, i, "U", -1]
];

    cccMoves = cccMoves.concat(moreMoves);
  }

  return cccMoves;

}
