/*
 * twisty_demo.js
 * 
 * Demonstration and testing harness for WSOH.
 * 
 */

/*
 * Convenience Logging
 */
function log(obj) {
  
  console.log(obj);

  var previousHTML = $("#debug").html();
  previousHTML = obj + "<br/><hr/>" + previousHTML;
  $("#debug").html(previousHTML);
  
}

$(document).ready(function() {

  log("Document ready.");

  start_twisty();

  animate();

});
