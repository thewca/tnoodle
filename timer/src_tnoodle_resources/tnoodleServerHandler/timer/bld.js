(function() {

var defaultColorScheme = {
  "U": new Color("#fff"), // white
  "F": new Color("#009000"), // green
  "L": new Color("#FF8C00"), // orange
  "B": new Color("#00f"), // blue
  "R": new Color("#f00"), // red
  "D": new Color("#FFFF00") // yellow
};

// Why doesn't javascript have a freaking assert?
function assert(bool) {
	if(!bool) {
		alert("Uh oh");
	}
}

function isPermutation(perm) {
	var found = {};
	for(var i = 0; i < perm.length; i++) {
		found[perm[i]] = true;
	}
	for(i = 0; i < perm.length; i++) {
		if(!found[i]) {
			return false;
		}
	}
	return true;
}

function isSolved(perm) {
	for(var i = 0; i < perm.length; i++) {
		if(perm[i] != i) {
			return false;
		}
	}
	return true;
}

function getStickerIndices(piece, stickersPerPiece) {
	var stickerOffset = piece % stickersPerPiece;
	var pieceBase = piece - stickerOffset;
	
	var indices = [];
	for(var i = 0; i < stickersPerPiece; i++) {
		var index = pieceBase + ( (stickerOffset + i) % stickersPerPiece );
		indices.push(index);
	}
	return indices;
}

function cycleStickers(permutation, stickersPerPiece, cycle) {
	var permutationCopy = permutation.slice();

	for(var i = 0; i < cycle.length; i++) {
		var dest = cycle[i];
		var destStickers = getStickerIndices(dest, stickersPerPiece);

		// Freaking java-style modulo
		var src = cycle[( i - 1 + cycle.length ) % cycle.length];
		var srcStickers = getStickerIndices(src, stickersPerPiece);

		for(var j = 0; j < stickersPerPiece; j++) {
			var s = srcStickers[j];
			var d = destStickers[j];
			permutation[d] = permutationCopy[s];
		}
	}
}

function toCycle(permutation, stickersPerPiece, buffer) {
	assert(isPermutation(permutation));

  if(isSolved(permutation)) {
    return [];
  }

	var bufferStickers = getStickerIndices(buffer, stickersPerPiece);

  var cycles = [];
  var dest = permutation[buffer];

  function shootTo(dest) {
    var permutationCopy = permutation.slice();
    cycleStickers(permutationCopy, stickersPerPiece, [buffer, dest]);
    var nextCycles = toCycle(permutationCopy, stickersPerPiece, buffer);
    var node = { dest: dest, children: nextCycles };
    cycles.push(node);
  }

  if(bufferStickers.indexOf(dest) != -1) {
    // Our buffer is solved (perhaps misoriented), but the
    // whole cube isn't. We've got to break into a
    // new cycle, which means finding an unsolved sticker
    // that isn't our buffer.
    for(var i = 0; i < permutation.length; i++) {
      if(bufferStickers.indexOf(i) == -1 && permutation[i] != i) {
        // Found an unsolved sticker that isn't our buffer!
        shootTo(i);
      }
    }
  } else {
    shootTo(dest);
  }
  return cycles;
}

/*

legend:
     U

   L F R B

     D

corners:
        0  3
        9  6
   
 1 11  10  8   7  5   4  2
23 13  14 16  17 19  20 22
        
       12 15  
       21 18

edges:
           4
         2   6
           0

   3       1       7       5
13  11  10   8   9  15  14  12
  19      17      23      21

          16
        18  22
          20 
*/

function cornerIndexToSingmaster(index) {
	function stickerToFace(index) {
		switch(index) {
			case 0:
			case 3:
			case 6:
			case 9:
				return "U";
			case 8:
			case 10:
			case 14:
			case 16:
				return "F";
			case 1:
			case 11:
			case 13:
			case 23:
				return "L";
			case 2:
			case 4:
			case 20:
			case 22:
				return "B";
			case 5:
			case 7:
			case 17:
			case 19:
				return "R";
			case 12:
			case 15:
			case 18:
			case 21:
				return "D";
		}
	}
	var stickers = getStickerIndices(index, 3);
	return stickers.map(stickerToFace).join("");
}

function edgeIndexToSingmaster(index) {
	function stickerToFace(index) {
		switch(index) {
			case 0:
			case 2:
			case 4:
			case 6:
				return "U";
			case 1:
			case 8:
			case 10:
			case 17:
				return "F";
			case 3:
			case 11:
			case 13:
			case 19:
				return "L";
			case 5:
			case 12:
			case 14:
			case 21:
				return "B";
			case 7:
			case 9:
			case 15:
			case 23:
				return "R";
			case 16:
			case 18:
			case 20:
			case 22:
				return "D";
		}
	}
	var stickers = getStickerIndices(index, 2);
	return stickers.map(stickerToFace).join("");
}

function nameToIndex(name) {
	if(name.length != 2 && name.length != 3) {
		return -1;
	}
	var indexToName = null;
	if(name.length == 2) {
		indexToName = edgeIndexToSingmaster;
	} else {
		indexToName = cornerIndexToSingmaster;
	}
	for(var i = 0; i < 4*6; i++) {
		var potentialName = indexToName(i);
		if(potentialName[0] == name[0]) {
			// We want something like ULB and UBL to match
			// but not UF and FU
			var matches = true;
			for(var j = 1; j < potentialName.length; j++) {
				if(name.substring(1).indexOf(potentialName[j]) == -1) {
					matches = false;
					break;
				}
			}
			if(matches) {
				return i;
			}
		}
	}
	return -1;
}

function newCube() {
	var corners = [];
	var edges = [];
	for(var i = 0; i < 6*4; i++) {
		corners.push(i);
		edges.push(i);
	}
	return [ corners, edges ];
}

var faceToEdgeCycle = {
	"U": [ 4, 6, 0, 2 ],
	"F": [ 1, 8, 17, 10 ],
	"L": [ 3, 11, 19, 13 ],
	"B": [ 5, 12, 21, 14 ],
	"R": [ 7, 15, 23, 9 ],
	"D": [ 16, 22, 20, 18 ]
};

var faceToCornerCycle = {
	"U": [ 0, 3, 6, 9 ],
	"F": [ 10, 8, 16, 14 ],
	"L": [ 1, 11, 13, 23 ],
	"B": [ 4, 2, 22, 20 ],
	"R": [ 7, 5, 19, 17 ],
	"D": [ 12, 15, 18, 21 ]
};

function parseScramble(scramble) {
	var corners_edges = newCube();
	var corners = corners_edges[0];
	var edges = corners_edges[1];

	var turns = scramble.split(/[ \n]+/);
	for(var i = 0; i < turns.length; i++) {
		var turn = turns[i];
		if(turn === "") {
			continue;
		}
		var face = turn[0];
		var dirStr = turn.substring(1);
		var dir_count = { '': 1, "2": 2, "2'": 2, "'": 3 };
		if(!(dirStr in dir_count)) {
			return [ false, "Invalid dir " + dirStr ];
		}
		var dir = dir_count[dirStr];
		if("FURBLD".indexOf(face) == -1) {
			return [ false, "Invalid face " + face ];
		}
		for(var j = 0; j < dir; j++) {
			var edgeCycle = faceToEdgeCycle[face];
			var cornerCycle = faceToCornerCycle[face];
			cycleStickers(corners, 3, cornerCycle);
			cycleStickers(edges, 2, edgeCycle);
		}
	}

	return [ true, corners_edges ];
}

function generateScramble() {
	tnoodleServer.loadScramble(function(scramble) {
    scrambleInput.value = scramble;
    inputsChanged();
  }, '333');
}

var cornerCycleSingmasterDiv, edgeCycleSingmasterDiv;
var cornerCycleDiv, edgeCycleDiv;
var customSchemeDiv;
var scrambleInput, cornerBufferInput, edgeBufferInput;
var generateScrambleButton;
var tnoodleServer;
function load() {
	tnoodleServer = new tnoodle.server();

	cornerCycleSingmasterDiv = document.getElementById('cornerCycleSingmaster');
	edgeCycleSingmasterDiv = document.getElementById('edgeCycleSingmaster');
	cornerCycleDiv = document.getElementById('cornerCycle');
	edgeCycleDiv = document.getElementById('edgeCycle');
	customSchemeDiv = document.getElementById('customScheme');

	scrambleInput = document.getElementById('scramble');
	cornerBufferInput = document.getElementById('cornerBuffer');
	edgeBufferInput = document.getElementById('edgeBuffer');
	generateScrambleButton = document.getElementById('generateScramble');
	generateScrambleButton.addEventListener('click', function() {
		generateScramble();
	}, false);

	scrambleInput.addEventListener('change', inputsChanged, false);
	cornerBufferInput.addEventListener('change', inputsChanged, false);
	edgeBufferInput.addEventListener('change', inputsChanged, false);
	window.addEventListener('hashchange', function(e) {
    urlChanged();
	}, false);

  drawCube();

  window.addEvent('resize', resizeCube);
  resizeCube();

	urlChanged();

	//runSimulation();
}

function runSimulation() {
 function simulateSolves(n) {
    var cornerCycleLengths = [];
    var edgeCycleLengths = [];
    function printStats(arr, name) {
      if(arr.length === 0) {
        return;
      }
      var ave = arr.reduce(function(a, b) { return a+b; })/arr.length;
      var CON = console;//jslint
      CON.log(arr.length + " " + name + ' ave: ' + ave);
      CON.log(arr.length + " " + name + ' max: ' + Math.max.apply(null, arr));
      CON.log(arr.length + " " + name + ' min: ' + Math.min.apply(null, arr));
    }
    
    function analyzeScrambles(scrambles) {
      function getLengthOfCycle(cycles) {
        var length = 0;
        while(cycles.length > 0) {
          length++;
          cycles = cycles[0].children;
        }
        return length;
      }
      for(var i = 0; i < scrambles.length; i++) {
        var scramble = scrambles[i];
        var success_corners_edges = parseScramble(scramble);
        var success = success_corners_edges[0];
        if(!success) {
          alert(success_corners_edges[1]);
          return;
        }
        var corners_edges = success_corners_edges[1];
        var corners = corners_edges[0];
        var edges = corners_edges[1];
        var cornerCycles = toCycle(corners, 3, 0);
        var edgeCycles = toCycle(edges, 2, 0);
		if(getLengthOfCycle(cornerCycles) > 10) {
            var CON = console;//jslint
			CON.log(scramble);
		}
        cornerCycleLengths.push(getLengthOfCycle(cornerCycles));
        edgeCycleLengths.push(getLengthOfCycle(edgeCycles));
      }
      printStats(cornerCycleLengths, "corners");
      printStats(edgeCycleLengths, "edges");
      if(cornerCycleLengths.length < n) {
        tnoodleServer.loadScrambles(analyzeScrambles, '333', null, 100);
      }
    }
    analyzeScrambles([]);
  }
  //simulateSolves(1000);
}

function toQueryString(o) {
  var str = "";
  var keys = Object.keys(o);
  for(var i = 0; i < keys.length; i++) {
    var key = keys[i];
    str += "&" + encodeURIComponent(key) + "=" + o[key];
  }
  if(str.length > 0) {
    // Remove beginning "&", if it exists.
    str = str.substring(1);
  }
  return str;
}

function inputsChanged() {
  var params = {};
  params.scramble = scrambleInput.value;
  params.cornerBuffer = cornerBufferInput.value;
  params.edgeBuffer = edgeBufferInput.value;
  var customScheme = {};
  var singLocation, singSticker;
  for(var i = 0; i < 4*6; i++) {
    singLocation = cornerIndexToSingmaster(i);
    singSticker = stickerInputs[singLocation].sticker;
    customScheme[singSticker] = stickerInputs[singLocation].value;
  }
  for(i = 0; i < 4*6; i++) {
    singLocation = edgeIndexToSingmaster(i);
    singSticker = stickerInputs[singLocation].sticker;
    customScheme[singSticker] = stickerInputs[singLocation].value;
  }
  params.customScheme = JSON.stringify(customScheme);

  var colorScheme = {};
  for(var face in centerButtons) {
    if(centerButtons.hasOwnProperty(face)) {
      colorScheme[face] = centerButtons[face].color.hex;
    }
  }
  params.colorScheme = JSON.stringify(colorScheme);

  var hash = "#" + toQueryString(params);
  if(location.hash == hash) {
    // We need to explicitly call urlChanged here, even though the url
    // didn't change, because someone may have cleared a text box that we
    // want to fill in with a default value.
    urlChanged();
  } else {
    // If location.hash != hash, then setting location.hash conviniently fires
    // hashchange for us, so there's no need to explicitly call urlChanged.
    location.hash = hash;
  }
}

function printCycles(stickersPerPiece, pieces, bufferInput, indexToStr, cycleDiv, breakIns) {
  breakIns = breakIns || {};
	var buffer = bufferInput.value;
	var bufferIndex = -1;
	if(buffer.length == stickersPerPiece) {
		bufferIndex = nameToIndex(buffer);
	}
	if(bufferIndex == -1) {
		bufferIndex = 0;
	}
  if(stickersPerPiece == 2) {
    buffer = edgeIndexToSingmaster(bufferIndex);
  } else if(stickersPerPiece == 3) {
    buffer = cornerIndexToSingmaster(bufferIndex);
  } else {
    // TODO - do this outside of printCycles, and only call toCycle once!
    assert(false);
  }
	bufferInput.value = buffer;

	cycleDiv.empty();

  function breakInChanged() {
    breakIns[this.breakIndex] = this.selectedIndex;
    printCycles(stickersPerPiece, pieces, bufferInput, indexToStr, cycleDiv, breakIns);
  }
	var cycles = toCycle(pieces, stickersPerPiece, bufferIndex);
  var breakIndex = 0;
  var str;
  while(cycles.length > 0) {
    var index = 0;
    if(cycles.length > 1) {
      index = breakIns[breakIndex] || 0;

      var breakInSelect = document.createElement('select');
      breakInSelect.breakIndex = breakIndex++;
      for(var i = 0; i < cycles.length; i++) {
        str = indexToStr(cycles[i].dest);
        breakInSelect.options[i] = new Option(str, str);
      }
      breakInSelect.selectedIndex = index;
      breakInSelect.addEvent('change', breakInChanged);
      cycleDiv.appendChild(breakInSelect);
      cycleDiv.appendText(" ");
    } else {
      str = indexToStr(cycles[index].dest);
      cycleDiv.appendText(str + " ");
    }
    cycles = cycles[index].children;
  }
}

var colorScheme = null;
function urlChanged() {
  var params = location.hash.substring(1).parseQueryString();

	var scramble = params.scramble || "";
  scrambleInput.value = scramble;
  
  var cornerBuffer = params.cornerBuffer;
  if(!cornerBuffer) {
    cornerBuffer = "";
  }
  cornerBufferInput.value = cornerBuffer;

  var edgeBuffer = params.edgeBuffer;
  if(!edgeBuffer) {
    edgeBuffer = "";
  }
  edgeBufferInput.value = edgeBuffer;

	var success_corners_edges = parseScramble(scramble);
	var success = success_corners_edges[0];
	if(!success) {
		alert(success_corners_edges[1]);
		return;
	}
	var corners_edges = success_corners_edges[1];
	var corners = corners_edges[0];
	var edges = corners_edges[1];

  colorScheme = {};
  if(params.colorScheme) {
    try {
      colorScheme = JSON.parse(params.colorScheme);
    } catch(err) {
      alert(err);
    }
  }
  for(var face in defaultColorScheme) {
    if(defaultColorScheme.hasOwnProperty(face)) {
      if(colorScheme[face]) {
        colorScheme[face] = new Color(colorScheme[face]);
        if(isNaN(colorScheme[face][0]) ||
           isNaN(colorScheme[face][1]) ||
           isNaN(colorScheme[face][2])) {
          colorScheme[face] = null;
        }
      }
      if(!colorScheme[face]) {
        colorScheme[face] = new Color(defaultColorScheme[face]);
      }
    }
  }

  customScheme = {};
  if(params.customScheme) {
    try {
      customScheme = JSON.parse(params.customScheme);
    } catch(err2) {
      alert(err2);
    }
  }

  function setStickerColor(sticker, face) {
    sticker.setStyle('background-color', colorScheme[face]);
    sticker.setStyle('color', new Color(colorScheme[face]).invert());
  }
  var singLocation, stickerInput, singSticker;
  for(var i = 0; i < corners.length; i++) {
    singLocation = cornerIndexToSingmaster(i);
    stickerInput = stickerInputs[singLocation];
    singSticker = cornerIndexToSingmaster(corners[i]);
    stickerInput.sticker = singSticker;
    stickerInput.value = cornerIndexToCustom(corners[i]);

    face = singSticker[0];
    setStickerColor(stickerInput, face);
  }
  for(i = 0; i < edges.length; i++) {
    singLocation = edgeIndexToSingmaster(i);
    stickerInput = stickerInputs[singLocation];
    singSticker = edgeIndexToSingmaster(edges[i]);
    stickerInput.sticker = singSticker;
    stickerInput.value = edgeIndexToCustom(edges[i]);

    face = singSticker[0];
    setStickerColor(stickerInput, face);
  }
  for(face in colorScheme) {
    if(colorScheme.hasOwnProperty(face)) {
      var center = centerButtons[face];
      center.color = colorScheme[face];
      center.colorPicker.manualSet(center.color);
      center.colorPicker.setBackupColor(center.color);
      setStickerColor(center, face);
    }
  }


	printCycles(3, corners, cornerBufferInput, cornerIndexToSingmaster, cornerCycleSingmasterDiv);
	printCycles(3, corners, cornerBufferInput, cornerIndexToCustom, cornerCycleDiv);
	printCycles(2, edges, edgeBufferInput, edgeIndexToSingmaster, edgeCycleSingmasterDiv);
	printCycles(2, edges, edgeBufferInput, edgeIndexToCustom, edgeCycleDiv);
}

var customScheme = null;
function edgeIndexToCustom(index) {
  var sing = edgeIndexToSingmaster(index);
  return customScheme[sing] || sing;
}
function cornerIndexToCustom(index) {
  var sing = cornerIndexToSingmaster(index);
  return customScheme[sing] || sing;
}

function colorChanged(color) {
  color = new Color(color.rgb);
  this.color = color;
  inputsChanged();
}

var stickerInputs = {};
var centerButtons = {};
function drawCube() {
  var faceRows = [ "U", "LFRB", "D" ];
  for(var row = 0; row < faceRows.length; row++) {
    var faceRow = faceRows[row];
    var faceRowDiv = document.createElement('div');
    faceRowDiv.addClass("faceRow");
    if(faceRow.length == 1) {
      // If there's only one face in this row,
      // we'll need a little css to align things.
      faceRowDiv.addClass("singleFaceRow");
    }
    customSchemeDiv.appendChild(faceRowDiv);
    for(var i = 0; i < faceRow.length; i++) {
      var faceDiv = document.createElement('div');
      faceDiv.addClass("face");
      faceRowDiv.appendChild(faceDiv);
      var face = faceRow[i];
      for(var j = 0; j < 3; j++) {
        var stickerRowDiv = document.createElement('div');
        stickerRowDiv.addClass("stickerRow");
        faceDiv.appendChild(stickerRowDiv);
        for(var k = 0; k < 3; k++) {
          var index = j*3 + k;
          if(index == 4) {
            var center = document.createElement('div');
            center.face = face;

            center.disabled = true;
            center.addClass("sticker");
            center.addClass("center");
            // MooRainbow allows for multiple simultaneous pickers to be visible,
            // but they'll only work if they have unique ids.
            center.colorPicker = new MooRainbow(center, {
              id: face + 'Picker',
              onComplete: colorChanged.bind(center)
            });
            center.appendText(face);
            centerButtons[face] = center;
            stickerRowDiv.appendChild(center);
          } else {
            var input = document.createElement('input');
            input.addEvent('click', input.select);
            input.addEvent('change', inputsChanged);
            input.addClass("sticker");
            var stickerIndex, sing;
            if(index % 2 === 0) {
              // corner
              index = { 0: 0, 2: 1, 8: 2, 6: 3 }[index];
              stickerIndex = faceToCornerCycle[face][index];
              sing = cornerIndexToSingmaster(stickerIndex);
              stickerInputs[sing] = input;
            } else {
              // edge
              index = { 1: 0, 5: 1, 7: 2, 3: 3 }[index];
              stickerIndex = faceToEdgeCycle[face][index];
              sing = edgeIndexToSingmaster(stickerIndex);
              stickerInputs[sing] = input;
            }
            stickerRowDiv.appendChild(input);
          }
        }
      }
    }
  }
}

function resizeCube() {
  var size = window.getSize();
  var vertMargin = document.body.getStyle('margin-top').toInt() + document.body.getStyle('margin-bottom').toInt();
  var horzMargin = document.body.getStyle('margin-left').toInt() + document.body.getStyle('margin-right').toInt();
  // Gah. Isn't there some css magic to accomplish this?
  document.body.setStyle('width', size.x - horzMargin);
  document.body.setStyle('height', size.y - vertMargin);
  // And this?
  customSchemeDiv.setStyle('height', document.body.getSize().y - customSchemeDiv.getPosition().y - vertMargin);

  var faceMargin = 5;
  var faces = $$('.face');
  faces.setStyle('margin', faceMargin);

  var availableSpace = customSchemeDiv.getSize();
  var stickerWidth = Math.floor((availableSpace.x - 4*2*faceMargin) / 12);
  var stickerHeight = Math.floor((availableSpace.y - 3*2*faceMargin) / 9);
  stickerWidth = Math.max(20, Math.min(stickerHeight, stickerWidth));
  stickerHeight = stickerWidth;

  var stickers = $$('.sticker');
  stickers.setStyle('height', stickerHeight);
  stickers.setStyle('width', stickerWidth);

  var centers = $$('.center');
  centers.setStyle('height', stickerHeight - 2);
  centers.setStyle('width', stickerWidth - 2);
  centers.setStyle('line-height', stickerHeight);

  var singleFaceRows = $$('.singleFaceRow');
  var faceWidth = stickerWidth*3;
  singleFaceRows.setStyle('left', faceWidth + 2*faceMargin);
  singleFaceRows.setStyle('width', faceWidth + 2*faceMargin);
}

window.addEventListener('load', load, false);

})();
