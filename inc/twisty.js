/*
 * twisty.js
 * 
 * Started by Lucas Garron, July 22, 2011 at WSOH
 * Made classy by Jeremy Fleischman, October 7, 2011 during the flight to worlds
 * 
 */

var twistyjs = {};

(function() {

if(typeof(log) == "undefined") {
  log = function(s) {
    console.log(s);
  };
}

// This fixes https://github.com/lgarron/twisty.js/issues/3
if (!Function.prototype.bind) {
  Function.prototype.bind = function (oThis) {
    if (typeof this !== "function") {
      // closest thing possible to the ECMAScript 5 internal IsCallable function
      throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");
    }

    var fSlice = Array.prototype.slice,
        aArgs = fSlice.call(arguments, 1), 
        fToBind = this, 
        fNOP = function () {},
        fBound = function () {
          return fToBind.apply(this instanceof fNOP
                                 ? this
                                 : oThis || window,
                               aArgs.concat(fSlice.call(arguments)));
        };

    fNOP.prototype = this.prototype;
    fBound.prototype = new fNOP();

    return fBound;
  };
}

if(typeof(assert) == "undefined") {
  // TODO - this is pretty lame, we could use something like stacktrace.js
  // to get some useful information here.
  assert = function(cond, str) {
    if(!cond) {
      if(str) {
        throw str;
      } else {
        throw "Assertion Error";
      }
    }
  };
}

/****************
 * 
 * Twisty Plugins
 *
 * Plugins register themselves by calling twistyjs.registerTwisty.
 * This lets plugins be defined in different files.
 * 
 */

var twisties = {};
twistyjs.registerTwisty = function(twistyName, twistyConstructor) {
  assert(!(twistyName in twisties));
  twisties[twistyName] = twistyConstructor;
};

twistyjs.TwistyScene = function() {
  // that=this is a Crockford convention for accessing "this" inside of methods.
  var that = this;

  var twisty = null;
  var twistyType = null;
  var state = null;

  var moveProgress = null;
  var currentMove = null;
  var moveQueue = [];

  var camera, scene, renderer;
  var twistyCanvas;
  var cameraTheta = 0;

  var stats = null;

  /* http://tauday.com/ ;-) */
  Math.TAU = Math.PI*2;

  /*
   * Initialization Methods
   */
  var twistyContainer = $('<div/>');
  twistyContainer.css('width', '100%');
  twistyContainer.css('height', '100%');
  twistyContainer = twistyContainer[0];

  this.getDomElement = function() {
    return twistyContainer;
  };
  this.getCanvas = function() {
    return twistyCanvas;
  };
  this.getTwisty = function() {
    return twisty;
  };

  this.initializeTwisty = function(twistyType_) {
    twistyType = twistyType_;
    moveQueue = [];
    state = [];
    currentMove = null;
    moveProgress = 0;
    // We may have an animation queued up that is tied to the twistyCanvas.
    // Since we're about to destroy our twistyCanvas, that animation request
    // will never fire. Thus, we must explicitly stop animating here.
    stopAnimation();

    $(twistyContainer).empty();
    log("Canvas Size: " + $(twistyContainer).width() + " x " + $(twistyContainer).height());

    /*
     * Scene Setup
     */

    scene = new THREE.Scene();

    /*
     * 3D Object Creation
     */

    twisty = createTwisty(twistyType);
    scene.addObject(twisty["3d"]);

    /*
     * Go!
     */

    renderer = new THREE.CanvasRenderer();
    twistyCanvas = renderer.domElement;

    twistyContainer.appendChild(twistyCanvas);


    //TODO: figure out keybindings, shortcuts, touches, and mouse presses.
    //TODO: 20110905 bug: after pressing esc, cube dragging doesn't work.

    if(twistyType.allowDragging) {
      $(twistyContainer).css('cursor', 'move');
      twistyContainer.addEventListener( 'mousedown', onDocumentMouseDown, false );
      twistyContainer.addEventListener( 'touchstart', onDocumentTouchStart, false );
      twistyContainer.addEventListener( 'touchmove', onDocumentTouchMove, false );
    }


    if(twistyType.showFps) {
      startStats();
    }
    // resize creates the camera and calls render()
    that.resize();
  }

  this.resize = function() {
    // This function should be called after setting twistyContainer
    // to the desired size.
    var min = Math.min($(twistyContainer).width(), $(twistyContainer).height());
    camera = new THREE.Camera( 30, 1, 0, 1000 );
    moveCameraPure(0);
    camera.target.position = new THREE.Vector3(0, -0.075, 0);
    renderer.setSize(min, min);
    $(twistyCanvas).css('position', 'absolute');
    $(twistyCanvas).css('top', ($(twistyContainer).height()-min)/2);
    $(twistyCanvas).css('left', ($(twistyContainer).width()-min)/2);

    render();
  };

  this.keydown = function(e) {
    var keyCode = e.keyCode;
    var move = twisty.moveForKey(twisty, e);
    if(move) {
      that.addMoves(move);
      return;
    }

    switch (keyCode) {

      case 37:
        moveCameraDelta(Math.TAU/48);
        e.preventDefault();
        break;

      case 39:
        moveCameraDelta(-Math.TAU/48);
        e.preventDefault();
        break;

    }
  };



  var theta = 0;
  var mouseXLast = 0;

  this.cam = function(deltaTheta) {
    theta += deltaTheta;
    moveCamera(theta);
  }

  function onDocumentMouseDown( event ) {
    event.preventDefault();
    twistyContainer.addEventListener( 'mousemove', onDocumentMouseMove, false );
    twistyContainer.addEventListener( 'mouseup', onDocumentMouseUp, false );
    twistyContainer.addEventListener( 'mouseout', onDocumentMouseOut, false );
    mouseXLast = event.clientX;
  }

  function onDocumentMouseMove( event ) {
    mouseX = event.clientX;
    that.cam((mouseXLast - mouseX)/256);
    mouseXLast = mouseX;
  }

  function onDocumentMouseUp( event ) {
    twistyContainer.removeEventListener( 'mousemove', onDocumentMouseMove, false );
    twistyContainer.removeEventListener( 'mouseup', onDocumentMouseUp, false );
    twistyContainer.removeEventListener( 'mouseout', onDocumentMouseOut, false );
  }

  function onDocumentMouseOut( event ) {
    twistyContainer.removeEventListener( 'mousemove', onDocumentMouseMove, false );
    twistyContainer.removeEventListener( 'mouseup', onDocumentMouseUp, false );
    twistyContainer.removeEventListener( 'mouseout', onDocumentMouseOut, false );
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
      that.cam((mouseXLast - mouseX)/256);
      mouseXLast = mouseX;
    }
  }



  function render() {
    renderer.render(scene, camera);
  }

  function moveCameraPure(theta) {
    cameraTheta = theta;
    camera.position = new THREE.Vector3(2.5*Math.sin(theta), 2, 2.5*Math.cos(theta));
  }

  function moveCameraDelta(deltaTheta) {
    cameraTheta += deltaTheta;
    moveCameraPure(cameraTheta);
    render();
  }

  function moveCamera(theta) {
    moveCameraPure(theta);
    render();
  }

  var moveListeners = [];
  this.addMoveListener = function(listener) {
    moveListeners.push(listener);
  };
  this.removeMoveListener = function(listener) {
    var index = moveListeners.indexOf(listener);
    assert(index >= 0);
    delete moveListeners[index];
  };
  function fireMoveStarted(move) {
    for(var i = 0; i < moveListeners.length; i++) {
      moveListeners[i](move, true);
    }
  }
  function fireMoveEnded(move) {
    for(var i = 0; i < moveListeners.length; i++) {
      moveListeners[i](move, false);
    }
  }

  function startMove() {
    moveProgress = 0;
    if(moveQueue.length == 0) {
        currentMove = null;
        return;
    }

    assert(moveQueue.length > 0);
    currentMove = moveQueue.shift();
    fireMoveStarted(twisty.algToString([currentMove]));
  }

  //TODO 20110906: Handle illegal moves robustly.
  function queueMoves(moveStr) {
    moveQueue = moveQueue.concat(twisty.stringToAlg(moveStr));
  }
  this.animateMoves = function(moveStr) {
    queueMoves(moveStr);
    animationStep = 0.1;
    startAnimationIfNecessary();
  };

  this.addMoves = function(moveStr) {
    queueMoves(moveStr);
    updateSpeed();
    startAnimationIfNecessary();
  };

  this.flushMoveQueue = function() {
    animationStep = 1;
    startMove();
    while(currentMove != null) {
        stepAnimation();
    }
    render();
  };
  this.applyMoves = function(moveStr) {
    // TODO - what to do if there are moves in the queue?
    assert(moveQueue.length == 0);
    queueMoves(moveStr);
    that.flushMoveQueue();
  };

  // TODO "state" means some json-able object which fully represents
  // the current state of the puzzle. For now, this is just the
  // moves applied to the puzzle so far. This has the problem of growing
  // infinitely. Ideally, twisties should specify their own
  // getState() and setState() methods.
  this.getState = function() {
    return state.slice();
  };
  this.getFinalState = function() {
    var finalState = state.slice();
    if(currentMove) {
        finalState.push(currentMove);
    }
    for(var i = 0; i < moveQueue.length; i++) {
        finalState.push(moveQueue[i]);
    }
    return finalState;
  };
  this.setState = function(state) {
    that.initializeTwisty(twistyType);
    // TODO - don't notify the moveListeners while inside applyMoves!
    assert(moveQueue.length == 0);
    if(state) {
        moveQueue = moveQueue.concat(state);
        that.flushMoveQueue();
    }
  };

  //TODO: Make time-based / framerate-compensating
  function updateSpeed() {
    animationStep = Math.min(0.15 + 0.1*moveQueue.length, 1);
  }

  var animationStep = 0.1;

  function stepAnimation() {
    moveProgress += animationStep;

    if (moveProgress < 1) {
      twisty["animateMoveCallback"](twisty, currentMove, moveProgress);
    }
    else {
      twisty["advanceMoveCallback"](twisty, currentMove);
      state.push(currentMove);
      fireMoveEnded(twisty.algToString([currentMove]));

      currentMove = null;

      if (moveQueue.length == 0) {
        stopAnimation();
      }
      else {
        startMove();
      }

    }
  }

  function startStats() {
    stats = new Stats();
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.top = '0px';
    stats.domElement.style.left = '0px';
    twistyContainer.appendChild( stats.domElement );
    $(stats.domElement).click();
  }


  var pendingAnimationLoop = null;
  function stopAnimation() {
    if(pendingAnimationLoop != null) {
      cancelRequestAnimFrame(pendingAnimationLoop);
      pendingAnimationLoop = null;
    }
  }
  function startAnimationIfNecessary() {
    if(pendingAnimationLoop == null && moveQueue.length > 0) {
      //log("Starting move queue: " + movesToString(moveQueue));
      startMove();
      pendingAnimationLoop = requestAnimFrame(animateLoop, twistyCanvas);
    }
  }
  function animateLoop() {
    stepAnimation();
    render();

    if (stats) {
      stats.update(); 
    }

    // That was fun, lets do it again!
    // We check pendingAnimationLoop first, because the loop
    // may have been cancelled during stepAnimation().
    if(pendingAnimationLoop != null) {
      pendingAnimationLoop = requestAnimFrame(animateLoop, twistyCanvas);
    }
  }

  function createTwisty(twistyType) {
    var twistyCreateFunction = twisties[twistyType.type];
    if(!twistyCreateFunction) {
      err('Twisty type "' + twistyType.type + '" is not recognized!');
      return null;
    }

    // TODO - discuss the class heirarchy with Lucas
    //  Does it make sense for a TwistyScene to have an addMoves method?
    //  Scene implies (potentially) multiple twisties.
    //   Perhaps rename TwistyScene -> TwistyContainer?
    //  Alertatively, TwistyScene could become a Twisty base class, 
    //  and twisty instances inherit useful stuff like addMoves.
    //
    //  I personally prefer the first method for a couple of reasons:
    //   1. Classical inheritance in javascript is funky. This isn't a good
    //      reson to not do it, just personal preference.
    //   2. Creating a new twisty doesn't force recreation of the TwistyScene.
    //      Maybe this isn't an important case to optimize for, but to me
    //      it's evidence that having a persistent TwistyScene is the right
    //      way to go.
    return twistyCreateFunction(that, twistyType);
  }

};

  twistyjs.registerTwisty("plane", createPlaneTwisty);
  twistyjs.registerTwisty("blank", createBlankTwisty);

  /*
   * Something simple for fallback/testing.
   */
  function createPlaneTwisty(twistyScene, twistyType) {

    log("Creating plane twisty.");

    var cubePieces = [];

    var material = new THREE.MeshLambertMaterial({color: 0xFF8800});
    var plane = new THREE.Mesh( new THREE.PlaneGeometry(1, 1), material);
    plane.rotation.x = Math.TAU/4;
    plane.doubleSided = true;

    var updateTwistyCallback = function(twisty) {
      twisty["3d"].rotation.z += 0.01;
    };

    return {
      "type": twistyType,
      "3d": plane,
      "twisty": twisty,
      "updateTwistyCallback": updateTwistyCallback
    };

  }

  /*
   * Blank twisty. More useful as a template.
   */
  function createBlankTwisty(twistyScene, twistyType) {

    log("Creating cube twisty.");

    var blankObject = new THREE.Object3D();

    var updateTwistyCallback = function(twisty) {
    };

    return {
      "type": twistyType,
        "3d": blankObject,
        "updateTwistyCallback": updateTwistyCallback
    };

  }

})();
