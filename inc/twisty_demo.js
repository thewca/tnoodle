/*
 * twisty_demo.js
 * 
 * Demonstration and testing harness for WSOH.
 * 
 */

$(document).ready(function() {

  log("Document ready.");

  initializeTwisty({
    "type": "cube",
    "dimension": 3
  });

  animate();

});

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