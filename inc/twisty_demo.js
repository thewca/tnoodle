/*
 * twisty_demo.js
 * 
 * Demonstration and testing harness for WSOH.
 * 
 */

var cache = window.applicationCache;
function updateReadyCache() {
  window.applicationCache.swapCache();
  location.reload(true); // For now
}

var currentCubeSize = parseInt($("#cubeDimension").val());

$(document).ready(function() {

  /*
   * Caching Stuff.
   */

  cache.addEventListener('updateready', updateReadyCache, false);

  log("Document ready.");

  initializeTwisty({
    "type": "cube",
    "dimension": 3
  });

  $("#cubeDimension").bind("input", function() {
    var dim = parseInt($("#cubeDimension").val());
    if (!dim) {
      dim = 3;
    }
    dim = Math.min(Math.max(dim, 1), 16);
    if (dim != currentCubeSize) {
      initializeTwisty({
        "type": "cube",
        "dimension": dim
      });
      currentCubeSize = dim;
      $("#cubeDimension").blur(); 
    }
  });

  $("#alg_ccc").bind("click", function() {
    addMoves(makeCCC(parseInt($("#cubeDimension").val())));
  });

  $("#lucasparity").bind("click", function() {
    addMoves(lucasparity);
  });

  $("#alg_superflip").bind("click", function() {
    addMoves(superflip);
  });

  cam(0);


  document.getElementById("twistyContainer").addEventListener( 'mousedown', onDocumentMouseDown, false );
  document.getElementById("twistyContainer").addEventListener( 'touchstart', onDocumentTouchStart, false );
  document.getElementById("twistyContainer").addEventListener( 'touchmove', onDocumentTouchMove, false );


  $("#offlineSupport").bind("click", function() {
    window.location.href = "offline.html";
  });

});

var theta = 0;
var mouseXLast = 0;

function cam(deltaTheta) {
  theta += deltaTheta;
  moveCamera(theta);
}

function onDocumentMouseDown( event ) {
  $("#cubeDimension").blur(); 
  event.preventDefault();
  document.getElementById("twistyContainer").addEventListener( 'mousemove', onDocumentMouseMove, false );
  document.getElementById("twistyContainer").addEventListener( 'mouseup', onDocumentMouseUp, false );
  document.getElementById("twistyContainer").addEventListener( 'mouseout', onDocumentMouseOut, false );
  mouseXLast = event.clientX;
}

function onDocumentMouseMove( event ) {
  mouseX = event.clientX;
  cam((mouseXLast - mouseX)/256);
  mouseXLast = mouseX;
}

function onDocumentMouseUp( event ) {
  document.getElementById("twistyContainer").removeEventListener( 'mousemove', onDocumentMouseMove, false );
  document.getElementById("twistyContainer").removeEventListener( 'mouseup', onDocumentMouseUp, false );
  document.getElementById("twistyContainer").removeEventListener( 'mouseout', onDocumentMouseOut, false );
}

function onDocumentMouseOut( event ) {
  document.getElementById("twistyContainer").removeEventListener( 'mousemove', onDocumentMouseMove, false );
  document.getElementById("twistyContainer").removeEventListener( 'mouseup', onDocumentMouseUp, false );
  document.getElementById("twistyContainer").removeEventListener( 'mouseout', onDocumentMouseOut, false );
}

function onDocumentTouchStart( event ) {
  if ( event.touches.length == 1 ) {
    event.preventDefault();
    mouseXLast = event.touches[0].pageX;
  }
}

function onDocumentTouchMove( event ) {
  if ( event.touches.length == 1 ) {
    event.preventDefault();
    mouseX = event.touches[0].pageX;
    cam((mouseXLast - mouseX)/256);
    mouseXLast = mouseX;
  }
}

/*
 * Convenience Logging
 */

var logCounter = 0;

function log(obj) {
  console.log(obj);
  var previousHTML = $("#debug").html();
  previousHTML = (logCounter++) + ". " + obj + "<hr/>" + previousHTML;
  $("#debug").html(previousHTML);
}

function err(obj) {
  console.error(obj);
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