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

var timing = false;
var startTime;

var stats = null;

/* http://tauday.com/ ;-) */
Math.TAU = Math.PI*2;

/*
 * Initialization Methods
 */

$(document).bind("keydown", keydownHandler);

function initializeTwisty(twistyType) {

  twistyContainer = $("#twistyContainer").get(0);
  log("Canvas Size: " + $(twistyContainer).width() + " x " + $(twistyContainer).height());

  /*
   * Scene Setup
   */
  camera = new THREE.Camera( 30, $(twistyContainer).width() / $(twistyContainer).height(), 0, 1000 );
  moveCameraPure(0);

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
  renderer.setSize($(twistyContainer).width(), $(twistyContainer).height());
  $(twistyContainer).html("");
  twistyContainer.appendChild(renderer.domElement);

  startStats();
  render()

};

function render() {
  renderer.render(scene, camera);
}

function moveCameraPure(theta) {
  camera.position = new THREE.Vector3(2.5*Math.sin(theta), 2, 2.5*Math.cos(theta));
}

function moveCamera(theta) {
  moveCameraPure(theta);
  render();
}

function keydownHandler(e) {
  twisty["keydownCallback"](twisty, e);
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
  // TODO: Use array.join.
  return str;
}

function startAnimation() {

  if(!animating) {
    //log("Starting move queue: " + movesToString(moveQueue));
    startMove();
    animating = true;
    animate();
  }

}

function startMove() {

  currentMove = moveQueue[0];
  //log(moveToString(currentMove));
  moveQueue.splice(0, 1);
  //moveProgress = moveProgress % 1;
  moveProgress = 0;

}

function addMoves(moves) {

  moveQueue = moveQueue.concat(moves);
  startAnimation();

}

function updateSpeed() {
  animationStep = Math.min(0.15 + 0.1*moveQueue.length, 0.5);
}

function queueRandomCubeMoves(n) {
  
  var newMoves = [];
  
  for (var i=0; i<n; i++) {
    
    var random1 = 1;
    var random2 = 1;
    var random3 = Math.floor(Math.random()*6);
    var random4 = [-2, -1, 1, 2][Math.floor(Math.random()*4)];
    
    var newMove = [random1, random2, ["U", "L", "F", "R", "B", "D"][random3], random4];
    
    newMoves.push(newMove);
    
  }

  addMoves(newMoves);
  
}

var animationStep = 0.1;

function stepAnimation() {

  moveProgress += animationStep;

  if (moveProgress < 1) {
    twisty["animateMoveCallback"](twisty, currentMove, moveProgress);
  }
  else {
    twisty["advanceMoveCallback"](twisty, currentMove);

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

}

function animate() {

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
    requestAnimationFrame(animate);
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

  for(var twistyTypeKey in twisties) {
    if (twistyType["type"] == twistyTypeKey) {
      twistyCreateFunction = twisties[twistyTypeKey]
      return twistyCreateFunction(twistyType);
    }
  }

  err("Twisty type \"" + twistyType["type"] + "\" is not recognized!");
  return null;

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
      "opacity": 0.95,
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

        cubePieces.push([i, transformationMatrix, sticker]);
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


    for (entry in state) {

      var layer = matrixVector3Dot(state[entry][2].matrix, sidesNorm[currentMove[2]]);
      if (
          layer < twisty["options"]["dimension"] - 2*currentMove[0] + 2.5
          &&
          layer > twisty["options"]["dimension"] - 2*currentMove[1] - 0.5
      ) {
        var roty = new THREE.Matrix4();
        roty.copy(rott);
        roty.multiplySelf(state[entry][1]);

        state[entry][2].matrix.copy(roty);
        state[entry][2].update();
      }
    }

  };

  function matrix4Power(inMatrix, power) {

    var matrixIdentity = new THREE.Matrix4();
    var matrix = new THREE.Matrix4();
    matrix.copy(inMatrix);
    if (power < 0) {
      matrix.copy(THREE.Matrix4.makeInvert(inMatrix, matrixIdentity));
    }

    var out = new THREE.Matrix4();
    for (var i=0; i < Math.abs(power); i++) {
      out.multiplySelf(matrix);
    }

    return out;

  }

  var advanceMoveCallback = function(twisty, currentMove) {

    var rott = new THREE.Matrix4();
    rott.copy(matrix4Power(sidesRot[currentMove[2]], currentMove[3]));

    var state = twisty["cubePieces"];

    for (entry in state) {

      var layer = matrixVector3Dot(state[entry][2].matrix, sidesNorm[currentMove[2]]);
      if (
          layer < twisty["options"]["dimension"] - 2*currentMove[0] + 2.5
          &&
          layer > twisty["options"]["dimension"] - 2*currentMove[1] - 0.5
      ) {
        var roty = new THREE.Matrix4();
        roty.copy(rott);
        roty.multiplySelf(state[entry][1]);

        state[entry][2].matrix.copy(roty);
        state[entry][1].copy(roty);
        state[entry][2].update();
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
      break;

    case 32:
      animationStep=0.5;
      queueRandomCubeMoves(32);
      animationStep = 0.1;
      startTime = (new Date).getTime();
      timing = true;
      break;

    }

  };

  return {
    "type": twistyParameters,
    "options": cubeOptions,
    "3d": cubeObject,
    "cubePieces": cubePieces,
    "animateMoveCallback": animateMoveCallback,
    "advanceMoveCallback": advanceMoveCallback,
    "keydownCallback": keydownCallback
  };

}