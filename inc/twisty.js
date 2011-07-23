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
  camera.position = new THREE.Vector3(0, 4, 6);

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

  renderer.render(scene, camera);

};

function startStats() {

  stats = new Stats();
  stats.domElement.style.position = 'absolute';
  stats.domElement.style.top = '0px';
  stats.domElement.style.left = '0px';
  twistyContainer.appendChild( stats.domElement );

}

var twisties = {"plane": createPlaneTwisty, "cube": createCubeTwisty, "blank": createBlankTwisty};

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

  return {"twisty": piece, "updateTwistyCallback": updateTwistyCallback};

}

/*
 * Blank twisty. More useful as a template.
 */
function createBlankTwisty(twistyType) {
  
  log("Creating cube twisty.");

  var blankObject = new THREE.Object3D();
  
  var updateTwistyCallback = function(twisty) {
  };

  return {"twisty": blankObject, "updateTwistyCallback": updateTwistyCallback};

}

/*
 * Rubik's Cube NxNxN
 */
function createCubeTwisty(twistyType) {
  
  log("Creating cube twisty.");

  var cubeObject = new THREE.Object3D();
  var cubePieces = [];
  
  var updateTwistyCallback = function(twisty) {
  };

  return {"twisty": cubeObject, "updateTwistyCallback": updateTwistyCallback};

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