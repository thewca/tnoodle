/*
 * twisty.js
 * 
 * Started by Lucas Garron, July 22, 2011 at WSOH
 * 
 */

/*
 * Global variables
 * (So that they persist outside of functions.)
 */

var twisty = null;

var moveProgress = null;
var currentMove = null;
var moveQueue = [];
var animating = false;

var twistyContainer = null;
var camera, scene, renderer;
var twistyCanvas;
var cameraTheta = 0;

var timing = false;
var startTime;

var stats = null;
if(typeof(log) == "undefined") {
  log = function(s) {
    console.log(s);
  };
}

/* http://tauday.com/ ;-) */
Math.TAU = Math.PI*2;

/*
 * Initialization Methods
 */

function initializeTwisty(twistyType) {

  if(twistyContainer) {
    $(twistyContainer).empty();
  } else {
    twistyContainer = $('<div/>');
    twistyContainer.css('width', '100%');
    twistyContainer.css('height', '100%');
    twistyContainer = twistyContainer[0];
  }
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
    twistyCanvas.addEventListener( 'mousedown', onDocumentMouseDown, false );
    twistyCanvas.addEventListener( 'touchstart', onDocumentTouchStart, false );
    twistyCanvas.addEventListener( 'touchmove', onDocumentTouchMove, false );
  }
  

  if(twistyType.showFps) {
    startStats();
  }
  // resizeTwisty creates the camera and calls render()
  resizeTwisty();
}

function resizeTwisty() {
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
}



var theta = 0;
var mouseXLast = 0;

function cam(deltaTheta) {
  theta += deltaTheta;
  moveCamera(theta);
}

function onDocumentMouseDown( event ) {
  event.preventDefault();
  twistyCanvas.addEventListener( 'mousemove', onDocumentMouseMove, false );
  twistyCanvas.addEventListener( 'mouseup', onDocumentMouseUp, false );
  twistyCanvas.addEventListener( 'mouseout', onDocumentMouseOut, false );
  mouseXLast = event.clientX;
}

function onDocumentMouseMove( event ) {
  mouseX = event.clientX;
  cam((mouseXLast - mouseX)/256);
  mouseXLast = mouseX;
}

function onDocumentMouseUp( event ) {
  twistyCanvas.removeEventListener( 'mousemove', onDocumentMouseMove, false );
  twistyCanvas.removeEventListener( 'mouseup', onDocumentMouseUp, false );
  twistyCanvas.removeEventListener( 'mouseout', onDocumentMouseOut, false );
}

function onDocumentMouseOut( event ) {
  twistyCanvas.removeEventListener( 'mousemove', onDocumentMouseMove, false );
  twistyCanvas.removeEventListener( 'mouseup', onDocumentMouseUp, false );
  twistyCanvas.removeEventListener( 'mouseout', onDocumentMouseOut, false );
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

// TODO - timing stuff doesn't belong in here --jfly
var startTimingFlag = false;

function setTimingFlag() {
  startTimingFlag = true;
  $("#timer").html("[Ready]");
}

function stopTimer() {
  startTimingFlag = false;
  timing = false;
}

function resetTimer() {
  stopTimer();
  $("#timer").html("[Timer]");
}

/*
 * Algorithm Helper Methods
 */
var moveDelimiter = " ";

function moveToString(move) {

  var prefix = "";
  if (!(move[0] == move[1] == 1)) {
    prefix = "" + move[0] + "-" + move[1];
  }

  var midfix = move[2];

  var postfix = Math.abs(move[3]);
  if (postfix == 1) {
    postfix = "";
  }
  if (move[3] < 0) {
    postfix += "'";
  }

  return prefix + midfix + postfix;

}

function movesToString(moves) {
  str = "";
  for (move in moves) {
    str += moveToString(moves[move]) + moveDelimiter;
  }
  //TODO: Use array.join.
  return str;
}

function startAnimation() { 

  if(!animating) {
    animating = true;
    //log("Starting move queue: " + movesToString(moveQueue));
    startMove();
    animate();
  }

}

function startTimer() {

  startTime = (new Date).getTime();

  if(!timing) {
    timing = true;
    animate();
  }
}

function startMove() {
  moveProgress = 0;

  currentMove = moveQueue.shift();
  //log(moveToString(currentMove));
  if (startTimingFlag) {
    if (!twisty.isInspectionLegalMove(currentMove)) {
      startTimer();
      startTimingFlag = false;
    }
  }

}

//TODO 20110906: Handle illegal moves robustly.
function addMoves(moves) {

  moveQueue = moveQueue.concat(moves);
  if (moveQueue.length > 0) {
    startAnimation();
  }

}


function applyMoves(moves) {

  moveQueue = moves;
  while (moveQueue.length > 0) {
    startMove();
    twisty["advanceMoveCallback"](twisty, currentMove);
  }
  render();

}

//TODO: Make time-based / framerate-compensating
function updateSpeed() {
  animationStep = Math.min(0.15 + 0.1*moveQueue.length, 1);
}

function queueRandomCubeMoves(dim, n) {

  var newMoves = [];

  for (var i=0; i<n; i++) {

    var random1 = 1+ Math.floor(Math.random()*dim/2);
    var random2 = random1 + Math.floor(Math.random()*dim/2);
    var random3 = Math.floor(Math.random()*6);
    var random4 = [-2, -1, 1, 2][Math.floor(Math.random()*4)];

    var newMove = [random1, random2, ["U", "L", "F", "R", "B", "D"][random3], random4];

    newMoves.push(newMove);

  }

  applyMoves(newMoves);

}

var animationStep = 0.1;

function stepAnimation() {

  moveProgress += animationStep;

  if (moveProgress < 1) {
    twisty["animateMoveCallback"](twisty, currentMove, moveProgress);
  }
  else {
    twisty["advanceMoveCallback"](twisty, currentMove);

    if (twisty.isSolved(twisty)) {
      stopTimer();
    }

    if (moveQueue.length == 0) {
      animating = false;
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

var animationLooping = false;
function animate(notUserInvoked) {
  if(!notUserInvoked && animationLooping) {
    return;
  }

  if (animating) {
    stepAnimation();
    render();
  }

  if (stats) {
    stats.update(); 
  }

  if (timing) {
    updateTimer();
  }

  // If we get here successfully, do it again!
  if (animating || timing) {
    animationLooping = true;
    requestAnimationFrame(animate.bind(null, true));
  } else {
    animationLooping = false;
  }

}

function pad(n, minLength) {
  var str = '' + n;
  while (str.length < minLength) {
    str = '0' + str;
  }
  return str;
}

function updateTimer() {
  cumulative = (new Date).getTime() - startTime;
  var str = "";
  str += Math.floor(cumulative/1000/60);
  str += ":";
  str += pad(Math.floor(cumulative/1000 % 60), 2);
  str += ".";
  str += pad(Math.floor((cumulative % 1000) / 10), 2);
  $("#timer").html(str);
}

function createTwisty(twistyType) {
   var twistyCreateFunction = twisties[twistyType.type];
   if(!twistyCreateFunction) {
     err('Twisty type "' + twistyType.type + '" is not recognized!');
     return null;
   }
   return twistyCreateFunction(twistyType);
}

/****************
 * 
 * Twisty Definitions
 * 
 */

var twisties = {
    "plane": createPlaneTwisty,
    "cube": createCubeTwisty,
    "blank": createBlankTwisty
};

/*
 * Something simple for fallback/testing.
 */
function createPlaneTwisty(twistyType) {

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
function createBlankTwisty(twistyType) {

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

/*
 * Rubik's Cube NxNxN
 */
function createCubeTwisty(twistyParameters) {

  log("Creating cube twisty.");

  // Cube Variables
  var cubeObject = new THREE.Object3D();
  var cubePieces = [];

  //Defaults
  var cubeOptions = {
      "stickerWidth": 1.8,
      "doubleSided": true,
      "opacity": 1,
      "dimension": 3,
      "faceColors": [0xffffff, 0xff8800, 0x00ff00, 0xff0000, 0x0000ff, 0xffff00],
      "scale": 1
  };

  // Passed Parameters
  for (option in cubeOptions) {
    if(option in twistyParameters) {
      log("Setting option \"" + option + "\" to " + twistyParameters[option]);
      cubeOptions[option] = twistyParameters[option];;
    }
  }

  // Cube Constants
  var numSides = 6;

  // Cube Materials
  var materials = [];

  for (var i = 0; i < numSides; i++) {
    var material = new THREE.MeshLambertMaterial( { color: cubeOptions["faceColors"][i]} );
    material.opacity = cubeOptions["opacity"];
    materials.push(material);
  }

  // Cube Helper Linear Algebra
  function axify(v1, v2, v3) {
    var ax = new THREE.Matrix4();
    ax.set(
        v1.x, v2.x, v3.x, 0,
        v1.y, v2.y, v3.y, 0,
        v1.z, v2.z, v3.z, 0,
        0   , 0   , 0   , 1
    );
    return ax;
  }

  var xx = new THREE.Vector3(1, 0, 0);
  var yy = new THREE.Vector3(0, 1, 0);
  var zz = new THREE.Vector3(0, 0, 1);
  var xxi = new THREE.Vector3(-1, 0, 0);
  var yyi = new THREE.Vector3(0, -1, 0);
  var zzi = new THREE.Vector3(0, 0, -1);

  var side_index = {
      "U": 0,
      "L": 1,
      "F": 2,
      "R": 3,
      "B": 4,
      "D": 5
  };
  var index_side = [ "U", "L", "F", "R", "B", "D" ];

  var sidesRot = {
      "U": axify(zz, yy, xxi),
      "L": axify(xx, zz, yyi),
      "F": axify(yyi, xx, zz),
      "R": axify(xx, zzi, yy),
      "B": axify(yy, xxi, zz),
      "D": axify(zzi, yy, xx)
  };
  var sidesNorm = {
      "U": yy,
      "L": xxi,
      "F": zz,
      "R": xx,
      "B": zzi,
      "D": yyi
  };
  var sidesRotAxis = {
      "U": yyi,
      "L": xx,
      "F": zzi,
      "R": xxi,
      "B": zz,
      "D": yy
  };
  var sidesUV = [
                 axify(xx, zzi, yy),
                 axify(zz, yy, xxi),
                 axify(xx, yy, zz),
                 axify(zzi, yy, xx),
                 axify(xxi, yy, zzi),
                 axify(xx, zz, yyi)
                 ];

  //Cube Object Generation
  for (var i = 0; i < numSides; i++) {
    var facePieces = [];
    cubePieces.push(facePieces);
    for (var su = 0; su < cubeOptions["dimension"]; su++) {
      for (var sv = 0; sv < cubeOptions["dimension"]; sv++) {

        var sticker = new THREE.Mesh(new THREE.PlaneGeometry(cubeOptions["stickerWidth"], cubeOptions["stickerWidth"]), materials[i]);
        sticker.doubleSided = cubeOptions["doubleSided"];

        var positionMatrix = new THREE.Matrix4();
        positionMatrix.setTranslation(
            su*2 - cubeOptions["dimension"] + 1,
            -(sv*2 - cubeOptions["dimension"] + 1),
            cubeOptions["dimension"]
        );    

        var transformationMatrix = new THREE.Matrix4();
        transformationMatrix.copy(sidesUV[i]);
        transformationMatrix.multiplySelf(positionMatrix);
        sticker.matrix.copy(transformationMatrix); 

        sticker.matrixAutoUpdate = false;
        sticker.update();

        facePieces.push([transformationMatrix, sticker]);
        cubeObject.addChild(sticker);    

      }
    }
  }

  function matrixVector3Dot(m, v) {
    return m.n14*v.x + m.n24*v.y + m.n34*v.z;
  }

  var actualScale = cubeOptions["scale"] * 0.5 / cubeOptions["dimension"];
  cubeObject.scale = new THREE.Vector3(actualScale, actualScale, actualScale);

  var animateMoveCallback = function(twisty, currentMove, moveProgress) {

    var rott = new THREE.Matrix4();
    rott.setRotationAxis(sidesRotAxis[currentMove[2]], moveProgress * currentMove[3] * Math.TAU/4);

    var state = twisty["cubePieces"];


    for (var faceIndex = 0; faceIndex < state.length; faceIndex++) {
      var faceStickers = state[faceIndex];
      for (var stickerIndex = 0; stickerIndex < faceStickers.length; stickerIndex++) {
        // TODO - sticker isn't really a good name for this --jfly
        var sticker = state[faceIndex][stickerIndex];

        // Support negative layer indices (e.g. for rotations)
        //TODO: Bug 20110906, if negative index ends up the same as start index, the animation is iffy. 
        var layerStart = currentMove[0];
        var layerEnd = currentMove[1];
        if (layerEnd < 0) {
          layerEnd = twisty["options"]["dimension"] + 1 + layerEnd;
        }

        var layer = matrixVector3Dot(sticker[1].matrix, sidesNorm[currentMove[2]]);
        if (
            layer < twisty["options"]["dimension"] - 2*layerStart + 2.5
            &&
            layer > twisty["options"]["dimension"] - 2*layerEnd - 0.5
           ) {
             var roty = rott.clone();
             roty.multiplySelf(sticker[0]);

             sticker[1].matrix.copy(roty);
             sticker[1].update();
           }
      }
    }

  };

  function matrix4Power(inMatrix, power) {

    var matrix = null;
    if (power < 0) {
      var matrixIdentity = new THREE.Matrix4();
      matrix = THREE.Matrix4.makeInvert(inMatrix, matrixIdentity);
    } else {
      matrix = inMatrix.clone();
    }

    var out = new THREE.Matrix4();
    for (var i=0; i < Math.abs(power); i++) {
      out.multiplySelf(matrix);
    }

    return out;

  }

  var advanceMoveCallback = function(twisty, currentMove) {

    var rott = matrix4Power(sidesRot[currentMove[2]], currentMove[3]);

    var state = twisty["cubePieces"];

    for (var faceIndex = 0; faceIndex < state.length; faceIndex++) {
      var faceStickers = state[faceIndex];
      for (var stickerIndex = 0; stickerIndex < faceStickers.length; stickerIndex++) {
        // TODO - sticker isn't really a good name for this --jfly
        var sticker = state[faceIndex][stickerIndex];

        var layer = matrixVector3Dot(sticker[1].matrix, sidesNorm[currentMove[2]]);
        if (
            layer < twisty["options"]["dimension"] - 2*currentMove[0] + 2.5
            &&
            layer > twisty["options"]["dimension"] - 2*currentMove[1] - 0.5
           ) {
             var roty = rott.clone();
             roty.multiplySelf(sticker[0]);

             sticker[1].matrix.copy(roty);
             sticker[0].copy(roty);
             sticker[1].update();
           }
      }
    }

  };

  var iS = 1;
  var oS = 1;
  var iSi = cubeOptions["dimension"];
  var cubeKeyMapping = {
      73: [iS, oS, "R", 1],
      75: [iS, oS, "R", -1],
      87: [iS, oS, "B", 1],
      79: [iS, oS, "B", -1],
      83: [iS, oS, "D", 1],
      76: [iS, oS, "D", -1],
      68: [iS, oS, "L", 1],
      69: [iS, oS, "L", -1],
      74: [iS, oS, "U", 1],
      70: [iS, oS, "U", -1],
      72: [iS, oS, "F", 1],
      71: [iS, oS, "F", -1],
      186: [iS, iSi, "U", 1],//y
      65: [iS, iSi, "U", -1],//y'
      85: [iS, oS+1, "R", 1],
      82: [iS, oS+1, "L", -1],
      77: [iS, oS+1, "R", -1],
      86: [iS, oS+1, "L", 1],
      84: [iS, iSi, "L", -1],
      89: [iS, iSi, "R", 1],
      78: [iS, iSi, "R", -1],
      66: [iS, iSi, "L", 1],
      190: [2, 2, "R", 1],//M'
      80: [iS, iSi, "F", 1],//y
      81: [iS, iSi, "F", -1],//y'
  }
  var keydownCallback = function(twisty, e) {

    var keyCode = e.keyCode;
    //log(keyCode);
    if (keyCode in cubeKeyMapping) {
      addMoves([cubeKeyMapping[keyCode]]);
      updateSpeed();
    }

    switch (keyCode) {

    case 27:
      initializeTwisty(twisty["type"]);
      resetTimer();
      break;

    case 32:
      if (!timing) {
        animationStep = 0.1;
        queueRandomCubeMoves(twisty["options"]["dimension"], 32);
        setTimingFlag();
      }
      break;

    case 37:
      moveCameraDelta(Math.TAU/48);
      break;

    case 39:
      moveCameraDelta(-Math.TAU/48);
      break;

    }

  };

  var ogCubePiecesCopy = [];
  for(var faceIndex = 0; faceIndex < cubePieces.length; faceIndex++) {
    var faceStickers = cubePieces[faceIndex];
    var ogFaceCopy = [];
    ogCubePiecesCopy.push(ogFaceCopy);
    for(var i = 0; i < faceStickers.length; i++) {
      ogFaceCopy.push(cubePieces[faceIndex][i][0].clone());
    }
  }
  function areMatricesEqual(m1, m2) {
    var flatM1 = m1.flatten();
    var flatM2 = m2.flatten();
    for (var i = 0; i < flatM1.length; i++) {
      if(flatM1[i] != flatM2[i]) {
        return false;
      }
    }
    return true;
  }
  var isSolved = function(twisty) {
    var state = twisty.cubePieces;
    var dimension = twisty["options"]["dimension"];


    // This implementation of isSolved simply checks that
    // all polygons have returned to their original locations.
    // There are 2 problems with this scheme:
    //  1. Re-orienting the cube makes every sticker look unsolved.
    //  2. A center is still solved even if it is rotated in place.
    //     This isn't a supercube!
    //
    // To deal with 1, we pick a sticker, and assume that it is solved.
    // We then derive what the necessary amount of rotation is to have
    // taken our solved cube and placed the sticker where it is now.
    //      netRotation * originalLocation = newLocation
    //      netRotation = newLocation * (1/originalLocation)
    // We then proceed to compare every sticker to netRotation*originalLocation.
    //
    // We deal with center stickers by apply all 4 rotations to the original location.
    // If any of them match the new location, then we consider the sticker solved.
    var faceIndex = 0;
    var stickerIndex = 0;
    var stickerState = state[faceIndex][stickerIndex][0];
    var matrixIdentity = new THREE.Matrix4();
    var netCubeRotations = THREE.Matrix4.makeInvert(
        ogCubePiecesCopy[faceIndex][stickerIndex], matrixIdentity);
    netCubeRotations = netCubeRotations.multiply(stickerState, netCubeRotations);

    for (var faceIndex = 0; faceIndex < state.length; faceIndex++) {
      var faceStickers = state[faceIndex];
      for (var stickerIndex = 0; stickerIndex < faceStickers.length; stickerIndex++) {
        // TODO - sticker isn't really a good name for this --jfly
        var currSticker = state[faceIndex][stickerIndex];
        var currState = currSticker[0];

        var i = Math.floor(stickerIndex / dimension);
        var j = stickerIndex % dimension;
        if(i > 0 && i < dimension - 1 && j > 0 && j < dimension - 1) {
          // Center stickers can still be solved even if they didn't make it
          // back to their original location (unless we're solving a supercube!)
          // We could skip the true centers on odd cubes, but I see no reason to do
          // so.
          var face = index_side[faceIndex];
          var rott = matrix4Power(sidesRot[face], 1);

          var rotatedOgState = ogCubePiecesCopy[faceIndex][stickerIndex].clone();
          var centerMatches = false;
          for(var i = 0; i < 4; i++) {
            var transformedRotatedOgState = new THREE.Matrix4();
            transformedRotatedOgState = ogState.multiply(netCubeRotations, rotatedOgState);
            if(areMatricesEqual(currState, transformedRotatedOgState)) {
              centerMatches = true;
              break;
            }

            rotatedOgState.multiply(rott, rotatedOgState);
          }
          if(!centerMatches) {
            return false;
          }
        } else {
          // Every non-center sticker should return to exactly where it was
          var ogState = new THREE.Matrix4();
          ogState = ogState.multiply(netCubeRotations, ogCubePiecesCopy[faceIndex][stickerIndex]);
          if(!areMatricesEqual(currState, ogState)) {
            return false;
          }
        }
      }
    }
    return true;
  };

  var isInspectionLegalMove = function(move) {
    if(move[0] == 1 && move[1] == twisty["options"]["dimension"]) {
      return true;
    }
    return false;
  };

  return {
    "type": twistyParameters,
    "options": cubeOptions,
    "3d": cubeObject,
    "cubePieces": cubePieces,
    "animateMoveCallback": animateMoveCallback,
    "advanceMoveCallback": advanceMoveCallback,
    "keydownCallback": keydownCallback,
    "isSolved": isSolved,
    "isInspectionLegalMove": isInspectionLegalMove
  };

}
