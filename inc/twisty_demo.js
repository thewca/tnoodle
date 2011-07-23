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
    "dimension": 4
  });
  
  addMoves(lucasparity);  

});

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