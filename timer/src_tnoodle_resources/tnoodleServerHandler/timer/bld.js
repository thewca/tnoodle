(function() {

// Hackiness because we don't have mootools =( 
Element.prototype.empty = function() {
	this.innerHTML = "";
};

Element.prototype.appendText = function(txt) {
	this.appendChild(document.createTextNode(txt));
};

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
	for(var i = 0; i < perm.length; i++) {
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

	// copy permutation array so as not to mutate it
	permutation = permutation.slice();

	var bufferStickers = getStickerIndices(buffer, stickersPerPiece);

	var cycle = [];
	while(!isSolved(permutation)) {
		var dest = permutation[buffer];
		if(bufferStickers.indexOf(dest) != -1) {
			// Our buffer is solved (perhaps misoriented), but the
			// whole cube isn't. We've got to break into a
			// new cycle, which means finding an unsolved sticker
			// that isn't our buffer.
			for(var i = 0; i < permutation.length; i++) {
				if(bufferStickers.indexOf(i) == -1 && permutation[i] != i) {
					dest = i;
					break;
				}
			}
		}
		cycle.push(dest);
		// Actually perform the 2 swap.
		cycleStickers(permutation, stickersPerPiece, [buffer, dest]);
	}
	return cycle;
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

function singmasterToCustom(sing) {
	return sing + "?";//<<< TODO
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
	"U": [ 0, 2, 4, 6 ],
	"F": [ 1, 8, 17, 10 ],
	"L": [ 11, 19, 13, 3 ],
	"B": [ 5, 12, 21, 14 ],
	"R": [ 7, 15, 23, 9 ],
	"D": [ 16, 22, 20, 18 ],
};

var faceToCornerCycle = {
	"U": [ 0, 3, 6, 9 ],
	"F": [ 10, 8, 14, 16 ],
	"L": [ 1, 11, 13, 23 ],
	"B": [ 4, 2, 22, 20 ],
	"R": [ 7, 5, 19, 17 ],
	"D": [ 12, 15, 18, 21 ],
};

function parseScramble(scramble) {
	var corners_edges = newCube();
	var corners = corners_edges[0];
	var edges = corners_edges[1];

	var turns = scramble.split(/[ \n]+/);
	for(var i = 0; i < turns.length; i++) {
		var turn = turns[i];
		if(turn == "") {
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
	// TODO - actually generate a scramble!
	return "R U R' U R U2 R'";
}

var cornerCycleSingmasterDiv, edgeCycleSingmasterDiv;
var cornerCycleDiv, edgeCycleDiv;
var scrambleInput, cornerBufferInput, edgeBufferInput;
var generateScrambleButton;
function load() {
	cornerCycleSingmasterDiv = document.getElementById('cornerCycleSingmaster');
	edgeCycleSingmasterDiv = document.getElementById('edgeCycleSingmaster');
	cornerCycleDiv = document.getElementById('cornerCycle');
	edgeCycleDiv = document.getElementById('edgeCycle');

	scrambleInput = document.getElementById('scramble');
	cornerBufferInput = document.getElementById('cornerBuffer');
	edgeBufferInput = document.getElementById('edgeBuffer');
	generateScrambleButton = document.getElementById('generateScramble');
	generateScrambleButton.addEventListener('click', function() {
		scrambleInput.value = generateScramble();
		scrambleChanged();
	}, false);

	scrambleInput.addEventListener('change', scrambleChanged, false);
	cornerBufferInput.addEventListener('change', scrambleChanged, false);
	edgeBufferInput.addEventListener('change', scrambleChanged, false);
	document.addEvent('hashchange', function(e) {
	});

	scrambleInput.value = generateScramble();
	scrambleChanged();
}

function printCycles(stickersPerCorner, pieces, indexToSing, bufferInput, singDiv, cycleDiv) {
	var buffer = bufferInput.value;
	var bufferIndex = -1;
	if(buffer.length == stickersPerCorner) {
		bufferIndex = nameToIndex(buffer);
	}
	if(bufferIndex == -1) {
		bufferIndex = 0;
	}
	buffer = indexToSing(bufferIndex);
	bufferInput.value = buffer;

	var cycle = toCycle(pieces, stickersPerCorner, bufferIndex);
	var cycleSing = cycle.map(indexToSing);
	var cycleCustom = cycleSing.map(singmasterToCustom);
	singDiv.empty();
	singDiv.appendText(cycleSing.join(" "));
	cycleDiv.empty();
	cycleDiv.appendText(cycleCustom.join(" "));
}

function scrambleChanged() {
	var scramble = scrambleInput.value;
	var success_corners_edges = parseScramble(scramble);
	var success = success_corners_edges[0];
	if(!success) {
		alert(success_corners_edges[1]);
		return;
	}
	var corners_edges = success_corners_edges[1];
	var corners = corners_edges[0];
	var edges = corners_edges[1];

	printCycles(3, corners, cornerIndexToSingmaster, cornerBufferInput, cornerCycleSingmasterDiv, cornerCycleDiv);
	printCycles(2, edges, edgeIndexToSingmaster, edgeBufferInput, edgeCycleSingmasterDiv, edgeCycleDiv);
}

window.addEventListener('load', load, false);

})();
