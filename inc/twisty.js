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

var twisty;
var twistyType;
var updateTwistyCallback;

var twistyContainer;
var camera, scene, renderer;

var stats = null;

/* http://tauday.com/ ;-) */
Math.TAU = Math.PI*2;

/*
 * Initialization Methods
 */

function start_twisty(twistyTypeIn) {

  twistyType = twistyTypeIn;

  twistyContainer = $("#twisty_container").get(0);
  log("Canvas Size: " + $(twistyContainer).width() + " x " + $(twistyContainer).height());

  /*
   * Scene Setup
   */
  camera = new THREE.Camera( 30, $(twistyContainer).width() / $(twistyContainer).height(), 0, 1000 );
  camera.position = new THREE.Vector3(0, 2, 3);

  scene = new THREE.Scene();

  /*
   * 3D Object Creation
   */

  var twistyData = createTwisty(twistyType);
  twisty = twistyData["twisty"];
  updateTwistyCallback = twistyData["updateTwistyCallback"];


  scene.addObject(twisty);

  /*
   * Go!
   */
  renderer = new THREE.CanvasRenderer();
  renderer.setSize($(twistyContainer).width(), $(twistyContainer).height());
  twistyContainer.appendChild(renderer.domElement);

  startStats();
  renderer.render(scene, camera);

};

function startStats() {

  stats = new Stats();
  stats.domElement.style.position = 'absolute';
  stats.domElement.style.top = '0px';
  stats.domElement.style.left = '0px';
  twistyContainer.appendChild( stats.domElement );

}

function animate() {

  updateTwistyCallback(twisty);

  renderer.render(scene, camera);
  if (stats) {
    stats.update();
  }

  // If we get here successfully, do it again!
  requestAnimationFrame( animate );

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
  var piece = new THREE.Mesh( new THREE.PlaneGeometry(2, 2), material);
  piece.rotation.x = Math.TAU/4;
  piece.doubleSided = true;

  var updateTwistyCallback = function(twisty) {
    twisty.rotation.z += 0.01;
  };

  return {
    "twisty": piece,
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
    "twisty": blankObject,
    "updateTwistyCallback": updateTwistyCallback
  };

}

/*
 * Rubik's Cube NxNxN
 */
function createCubeTwisty(twistyType) {

  log("Creating cube twisty.");

  // Cube Variables
  var cubeObject = new THREE.Object3D();
  var cubePieces = [];

  //Defaults
  var cubeOptions = {
      "sticker_width": 1.8,
      "doubleSided": true,
      "opacity": 0.95,
      "dimension": 3,
      "faceColors": [0xffffff, 0xff8800, 0x00ff00, 0xff0000, 0x0000ff, 0xffff00],
      "scale": 1
  };

  // Passed Parameters
  for (option in cubeOptions) {
    if(twistyType[option]) {
      cubeOptions[option] = twistyType[option];
    }
  }

  // Cube Constants
  var numSides = 6;
  log("Cube dimension: " + cubeOptions["dimension"]);

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

  var sides_uv = [
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

        var sticker = new THREE.Mesh(new THREE.PlaneGeometry(cubeOptions["sticker_width"], cubeOptions["sticker_width"]), materials[i]);
        sticker.doubleSided = cubeOptions["doubleSided"];

        var positionMatrix = new THREE.Matrix4();
        positionMatrix.setTranslation(
            su*2 - cubeOptions["dimension"] + 1,
            -(sv*2 - cubeOptions["dimension"] + 1),
            cubeOptions["dimension"]
        );    

        var transformationMatrix = new THREE.Matrix4();
        transformationMatrix.copy(sides_uv[i]);
        transformationMatrix.multiplySelf(positionMatrix);
        sticker.matrix.copy(transformationMatrix); 

        sticker.matrixAutoUpdate = false;
        sticker.update();

        cubePieces.push([i, transformationMatrix, sticker]);
        cubeObject.addChild(sticker);    

      }
    }
  }

  var actualScale = cubeOptions["scale"] * 0.5 / cubeOptions["dimension"];
  cubeObject.scale = new THREE.Vector3(actualScale, actualScale, actualScale);

  var updateTwistyCallback = function(twisty) {
    twisty.rotation.y += 0.01;
  };

  return {
    "twisty": cubeObject,
    "updateTwistyCallback": updateTwistyCallback
  };

}