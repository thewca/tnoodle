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

var twistyContainer;
var camera, scene, renderer;
var floorPiece;

var stats = null;

/* http://tauday.com/ ;-) */
Math.TAU = Math.PI*2;

/*
 * Initialization Methods
 */

function start_twisty() {

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
  var material = new THREE.MeshLambertMaterial({color: 0xFF8800});
  floorPiece = new THREE.Mesh( new THREE.PlaneGeometry(2, 2), material);
  floorPiece.rotation.x = Math.TAU/4;
  floorPiece.doubleSided = true;
  
  scene.addObject( floorPiece );

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

function updatePuzzle() {
  
  floorPiece.rotation.z += 0.01;
  
}

function animate() {

  updatePuzzle();

  renderer.render( scene, camera );
  if (stats) {
    stats.update();
  }

  // If we get here successfully, do it again!
  requestAnimationFrame( animate );

}