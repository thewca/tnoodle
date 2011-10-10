/**
 * Cancellable version of requestAnimationFrame.
 * http://notes.jetienne.com/2011/05/18/cancelRequestAnimFrame-for-paul-irish-requestAnimFrame.html
 * (found on http://paulirish.com/2011/requestanimationframe-for-smart-animating/)
 */
window.cancelRequestAnimFrame = (function() {
  return window.cancelAnimationFrame ||
  window.webkitCancelRequestAnimationFrame ||
  window.mozCancelRequestAnimationFrame ||
  window.oCancelRequestAnimationFrame ||
  window.msCancelRequestAnimationFrame ||
  clearTimeout;
})();

window.requestAnimFrame = (function() {
  return window.requestAnimationFrame || 
  window.webkitRequestAnimationFrame || 
  window.mozRequestAnimationFrame || 
  window.oRequestAnimationFrame || 
  window.msRequestAnimationFrame || 
  function(/* function */ callback, /* DOMElement */ element) {
    return window.setTimeout(callback, 1000 / 60);
  };
})();
