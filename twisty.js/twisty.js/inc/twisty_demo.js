/*
 * twisty_demo.js
 *
 * Demonstration and testing harness for WSOH.
 *
 * TOOD
 * - Fix document.getElementById(...) calls.
        // TODO I can imagine that some users of twisty.js would want to be able to have a Heise-style
        // inspection, where you are only allowed to do inspection moves during inspection, rather than
        // just starting the timer when they do a turn. This will require somehow being able to cancel/prevent a move?
        // TODO clicking on canvas doesn't seem to focus window in firefox
        // TODO clicking and dragging is weird when the mouse leaves the window
        // TODO keydown doesn't repeat on firefox
 *
 */

/*
 * Convenience Logging
 */

var logCounter = 0;

function log(obj) {
  if(typeof(console) !== "undefined") {
    var con = console;
    con.log(obj);
  }
  var previousHTML = $("#debug").html();
  previousHTML = (logCounter++) + ". " + obj + "<hr/>" + previousHTML;
  $("#debug").html(previousHTML);
}

function err(obj) {
  if(typeof(console) !== "undefined") {
    var con = console;
    con.error(obj);
  }
  var previousHTML = $("#debug").html();
  previousHTML = "<div class='err'>" + (logCounter++) + ". " + obj + "</div><hr/>" + previousHTML;
  $("#debug").html(previousHTML);
}

/*
 * Algs for testing
 */

var lucasparity = "r U2 x r U2 r U2 r' U2 l U2 r' U2 r U2 r' U2 r'";
var superflip = "U R2 F B R B2 R U2 L B2 R U' D' R2 F R' L B2 U2 F2";

function makeCCC(n) {
  var moves = [];
  var base = "L' U R' F' U L2 U2 L' U' L U2 D R' D' F2 R2 U'".split(" ");
  for(var i = 1; i<=n/2; i++) {
          for(var j = 0; j < base.length; j++) {
                  moves.push(i + base[j]);
          }
  }
  return moves.join(" ");
}

var cache = window.applicationCache;
function updateReadyCache() {
  window.applicationCache.swapCache();
  location.reload(true); // For now
}


function pad(n, minLength) {
  var str = '' + n;
  while (str.length < minLength) {
    str = '0' + str;
  }
  return str;
}

var startTime = null;
var stopTime = null;
function isTiming() {
  return startTime !== null && stopTime === null;
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

function refreshTimer() {
  var timer = $("#timer");
  timer.removeClass("reset running stopped");
  if(isTiming()) {
    timer.addClass("running");
    timer.text(prettyTime(new Date().getTime()));
  } else if(startTime === null) {
    assert(stopTime === null);
    timer.addClass("reset");
    timer.text("[Timer]");
  } else if(stopTime !== null) {
    assert(startTime);
    timer.addClass("stopped");
    timer.text(prettyTime(stopTime));
  }
}

var pendingTimerRefresh = null;
function refreshTimerLoop() {
  refreshTimer();
  if(pendingTimerRefresh !== null) {
    pendingTimerRefresh = requestAnimFrame(refreshTimerLoop, $('#timer')[0]);
  }
}
function startRefreshTimerLoop() {
  if(pendingTimerRefresh === null) {
    pendingTimerRefresh = requestAnimFrame(refreshTimerLoop, $('#timer')[0]);
  }
}
function stopRefreshTimerLoop() {
  if(pendingTimerRefresh !== null) {
    cancelRequestAnimFrame(pendingTimerRefresh);
    pendingTimerRefresh = null;
  }
}

function startTimer() {
  startTime = new Date().getTime();
  stopTime = null;
  refreshTimer();
  startRefreshTimerLoop();
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

var CubeState = {
  solved: 0,
  scrambling: 1,
  scrambled: 2,
  solving: 3
};
var cubeState = null;

$(document).ready(function() {

  /*
   * Caching Stuff.
   */

  function reDimensionCube() {
    var dim = parseInt($("#cubeDimension").val(), 10);
    if (!dim) {
      dim = 3;
    }
    dim = Math.min(Math.max(dim, 1), 16);
    if (dim != currentCubeSize) {
      currentCubeSize = dim;
      reloadCube();
    }
    resetTimer();
  }

  function reloadCube() {
    log(currentCubeSize);
    twistyScene.initializeTwisty({
      "type": "cube",
      "dimension": currentCubeSize,
      "stickerBorder": $("#sticker_border").is(':checked'),
      showFps: true
    });
    $("#cubeDimension").blur();
    twistyScene.resize();
    cubeState = CubeState.solved;
    resetTimer();
  }


  cache.addEventListener('updateready', updateReadyCache, false);

  log("Document ready.");

  var twistyScene = new twistyjs.TwistyScene();
  $("#twistyContainer").append($(twistyScene.getDomElement()));

  var currentCubeSize = parseInt($("#cubeDimension").val(), 10);
  reloadCube();

  $("#cubeDimension").bind("input", reDimensionCube);
  $("#sticker_border").bind("change", reloadCube);

  $("#alg_ccc").bind("click", function() {
    twistyScene.animateMoves(makeCCC(currentCubeSize));
  });

  $("#lucasparity").bind("click", function() {
    twistyScene.animateMoves(lucasparity);
  });

  $("#alg_superflip").bind("click", function() {
    twistyScene.animateMoves(superflip);
  });

  $("#parsed_alg1").bind("click", function() {
    twistyScene.animateMoves($("#parse_alg").val());
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
        reloadCube();
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
    var twisty;
    if(started) {
      if(cubeState == CubeState.scrambling) {
        // We don't want to start the timer if we're scrambling the cube.
      } else if(cubeState == CubeState.scrambled) {
        twisty = twistyScene.getTwisty();
        if(twisty.isInspectionLegalMove(twisty, move)) {
          return;
        }
        startTimer();
        cubeState = CubeState.solving;
      }
    } else {
      twisty = twistyScene.getTwisty();
      if(cubeState == CubeState.solving && twisty.isSolved(twisty)) {
        cubeState = CubeState.solved;
        stopTimer();
      }
    }
  });

});
