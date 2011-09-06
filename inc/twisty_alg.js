
var debugAlg = false;

//TODO 20110906: Slice moves.
var pattern = /((\d*)-)?(\d*)([UFRBLDufrbldxyz])([\d]*)('?)/g;
var pattern_move = /^((\d*)-)?(\d*)([UFRBLDufrbldxyz])([\d]*)('?)$/;

function stringToMoveSiGN(moveString) {

  if (debugAlg) console.log("[Move] " + moveString);
  
  var parts = pattern_move.exec(moveString);
  if (debugAlg) console.log(parts);

  var outStartSlice = 1;
  var outEndSlice = 1; 
  var baseMove = parts[4]; 
  var amount = 1;

  if (/[UFRBLD]/g.test(baseMove)) {
    var outEndSliceParsed = parseInt(parts[3]);
    if (!isNaN(outEndSliceParsed )) {
      outStartSlice = outEndSliceParsed;
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
    
    var sliceMap = {"x": "R", "y": "U", "z": "F"};
    
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
  
  if (debugAlg) console.log(moveStrings);
  
  for (i in moveStrings) {
    var move = stringToMoveSiGN(moveStrings[i]);
    alg.push(move);
  }
  
  if (debugAlg) console.log(alg);
  
  return alg;
  
}

// Command-line testing:
/*
var lucasparity1 = "rU2xrU2rU2r'U2lU2r'U2rU2r'U2r'";
var alg1 = "R3' x2 U 2R2 1-4r' 2L M' S";
var parsedAlg1 = stringToAlg(alg1);
*/