(function() {
  twistyjs.registerTwisty("cube", createCubeTwisty);
  /*
   * Algorithm Helper Methods
   */

  //TODO 20110906: Slice moves.
  var pattern = /((\d*)-)?(\d*)([UFRBLDufrbldxyz])([\d]*)('?)/g;
  var pattern_move = /^((\d*)-)?(\d*)([UFRBLDufrbldxyz])([\d]*)('?)$/;

  var sliceMap = {"x": "R", "y": "U", "z": "F"};
  var reverseSliceMap = {"R": "x", "U": "y", "F": "z"};
  function stringToMoveSiGN(moveString) {
    var parts = pattern_move.exec(moveString);

    var outStartSlice = 1;
    var outEndSlice = 1; 
    var baseMove = parts[4]; 
    var amount = 1;

    if (/[UFRBLD]/g.test(baseMove)) {
      var outEndSliceParsed = parseInt(parts[3]);
      if (!isNaN(outEndSliceParsed )) {
        outStartSlice = 1;
        outEndSlice = outEndSliceParsed;
      }
    }

    if (/[ufrbld]/g.test(baseMove)) {

      baseMove = baseMove.toUpperCase();
      outEndSlice = 2;

      var outEndSliceParsed = parseInt(parts[3]);
      if (!isNaN(outEndSliceParsed )) {
        outEndSlice = outEndSliceParsed;
      }

      var outStartSliceParsed = parseInt(parts[2]);
      if (!isNaN(outStartSliceParsed )) {
        outStartSlice = outStartSliceParsed ;
      }
    }

    if (/[xyz]/g.test(baseMove)) {
   
      outStartSlice = 1;
      outEndSlice = -1;
      
      
      baseMove = sliceMap[baseMove];
      
    }
    
    /* Amount */
    
    var amountParsed = parseInt(parts[5]);
    if (!isNaN(amountParsed)) {
      amount = amountParsed;
    }
    if (parts[6] == "'") {
      amount *= -1;
    }
    
    /* Return */
    
    return [outStartSlice, outEndSlice, baseMove, amount];
  }

  function stringToAlg(algString) {
    var moveStrings = algString.match(pattern);
    var alg = [];
    
    for (i in moveStrings) {
      var move = stringToMoveSiGN(moveStrings[i]);
      alg.push(move);
    }
    
    return alg;
  }

  // Command-line testing:
  /*
  var lucasparity1 = "rU2xrU2rU2r'U2lU2r'U2rU2r'U2r'";
  var alg1 = "R3' x2 U 2R2 1-4r' 2L M' S";
  var parsedAlg1 = stringToAlg(alg1);
  */
  var moveDelimiter = " ";

  function moveToString(move) {
    var prefix = "";

    var midfix = move[2];
    if(move[1] == -1) {
        // This is a rotation
        midfix = reverseSliceMap[midfix];
    } else if(move[0] != 1 && move[1] != 1) {
      prefix = "" + move[0] + "-" + move[1];
    }

    var postfix = Math.abs(move[3]);
    if (postfix == 1) {
      postfix = "";
    }
    if (move[3] < 0) {
      postfix += "'";
    }

    return prefix + midfix + postfix;
  }

  function algToString(moves) {
    return moves.map(moveToString).join(" ");
  }

  /*
   * Rubik's Cube NxNxN
   */
  function createCubeTwisty(twistyScene, twistyParameters) {

    log("Creating cube twisty.");

    // Cube Variables
    var cubeObject = new THREE.Object3D();
    var cubePieces = [];

    //Defaults
    var cubeOptions = {
      "stickerBorder": true,
      "stickerWidth": 1.8,
      "doubleSided": true,
      "opacity": 1,
      "dimension": 3,
      "faceColors": [0xffffff, 0xff8800, 0x009900, 0xff0000, 0x0000ff, 0xffff00],
      "scale": 1,
    };

    // Passed Parameters
    for (option in cubeOptions) {
      if(option in twistyParameters) {
        log("Setting option \"" + option + "\" to " + twistyParameters[option]);
        cubeOptions[option] = twistyParameters[option];
      }
  };

    // Cube Constants
    var numSides = 6;

    // Cube Materials
    var materials = [];
    var borderMaterial = new THREE.MeshBasicMaterial( { color: 0x000000, wireframe: true, wireframeLinewidth: 2 } );
    borderMaterial.opacity = cubeOptions["opacity"];
    for (var i = 0; i < numSides; i++) {
      var material = new THREE.MeshBasicMaterial( { color: cubeOptions["faceColors"][i] });
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

        var sticker = new THREE.Object3D();

        
        var meshes = [ materials[i] ];
        if (cubeOptions["stickerBorder"]) {
          meshes.push(borderMaterial);
        }
        /* This is here purely for speed comparison purposes.
         if (cubeOptions["stickerBorder"]) {
          var geometry = new THREE.Geometry();
          geometry.vertices.push( new THREE.Vertex( new THREE.Vector3(-cubeOptions["stickerWidth"]/2, -cubeOptions["stickerWidth"]/2, 0) ) );
          geometry.vertices.push( new THREE.Vertex( new THREE.Vector3(+cubeOptions["stickerWidth"]/2, -cubeOptions["stickerWidth"]/2, 0) ) );
          geometry.vertices.push( new THREE.Vertex( new THREE.Vector3(+cubeOptions["stickerWidth"]/2, +cubeOptions["stickerWidth"]/2, 0) ) );
          geometry.vertices.push( new THREE.Vertex( new THREE.Vector3(-cubeOptions["stickerWidth"]/2, +cubeOptions["stickerWidth"]/2, 0) ) );
          geometry.vertices.push( new THREE.Vertex( new THREE.Vector3(-cubeOptions["stickerWidth"]/2, -cubeOptions["stickerWidth"]/2, 0) ) );
          var border = new THREE.Line( geometry, new THREE.LineBasicMaterial( { color: 0x000000, opacity: cubeOptions.opacity } ) );

          sticker.addChild(border);
        */

        var stickerInterior = new THREE.Mesh(new THREE.PlaneGeometry(cubeOptions["stickerWidth"], cubeOptions["stickerWidth"]), meshes);
        stickerInterior.doubleSided = cubeOptions["doubleSided"];
        sticker.addChild(stickerInterior);

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
      //var rott = matrix4Power(sidesRot[currentMove[2]], 1);

      var state = twisty["cubePieces"];

      for (var faceIndex = 0; faceIndex < state.length; faceIndex++) {
        var faceStickers = state[faceIndex];
        for (var stickerIndex = 0; stickerIndex < faceStickers.length; stickerIndex++) {
          // TODO - sticker isn't really a good name for this --jfly
          var sticker = state[faceIndex][stickerIndex];

          // TODO - merge this and animateMoveCallback!
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
               sticker[0].copy(roty);
               sticker[1].update();
             }
        }
      }

    };

    function generateRandomState(twisty) {
      var dim = twisty["options"]["dimension"];
      var n = 32;
      var newMoves = [];
      for (var i=0; i<n; i++) {
        var random1 = 1 + Math.floor(Math.random()*dim/2);
        var random2 = random1 + Math.floor(Math.random()*dim/2);
        var random3 = Math.floor(Math.random()*6);
        var random4 = [-2, -1, 1, 2][Math.floor(Math.random()*4)];

        var newMove = [random1, random2, ["U", "L", "F", "R", "B", "D"][random3], random4];

        newMoves.push(newMove);
      }

      return newMoves;
    }

    var iS = 1;
    var oS = 1;
    var iSi = cubeOptions["dimension"];
    var cubeKeyMapping = {
      73: "R",
      75: "R'",
      87: "B",
      79: "B'",
      83: "D",
      76: "D'",
      68: "L",
      69: "L'",
      74: "U",
      70: "U'",
      72: "F",
      71: "F'",
      186: "y",
      59: "y",//y (TODO - why is this needed for firefox?)
      65: "y'",
      85: "r",
      77: "r'",
      86: "l",
      82: "l'",
      84: "x",
      89: "x",
      78: "x'",
      66: "x'",
      // 190: "M'", TODO - stringToMoveSiGN doesn't support slice turns
      80: "z",
      81: "z'"
    }
    var moveForKey = function(twisty, e) {
      if(e.altKey || e.ctrlKey) {
        return null;
      }

      var keyCode = e.keyCode;
      if (keyCode in cubeKeyMapping) {
        return cubeKeyMapping[keyCode];
      }
      return null;
    }

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

    var isInspectionLegalMove = function(twisty, move) {
      return "xyz".indexOf(move.substring(0, 1)) >= 0;
    };

    return {
      "type": twistyParameters,
      "options": cubeOptions,
      "3d": cubeObject,
      "cubePieces": cubePieces,
      "animateMoveCallback": animateMoveCallback,
      "advanceMoveCallback": advanceMoveCallback,
      "isSolved": isSolved,
      "isInspectionLegalMove": isInspectionLegalMove,
      "generateRandomState": generateRandomState,
      "moveForKey": moveForKey,
      "algToString": algToString,
      "stringToAlg": stringToAlg,
    };

  }

})();
