package org.thewca.scrambleanalysis;

import net.gnehzr.tnoodle.puzzle.CubePuzzle.CubeState;

public class CubeHelper {

	/**
	 * For 3x3x3 only.
	 * 
	 * @param cubeState
	 * @return
	 */

	// For DB edge orientation, we only care about U/D, Equator F/B.
	private static int[] edgesIndex = { 1, 3, 5, 7, // U edges index
			28, 30, 32, 34, // D edges index
			21, 23, // Equator front
			48, 50 // Equator back
	};

	// Each edge has 2 stickers. This array represents, respectively, the index of
	// the other attached sticker.
	private static int[] attachedEdgesIndex = { 46, 37, 10, 19, // Attached to the U face.
			25, 43, 16, 52, // Attached to the D face
			41, 12, // Attached to Equator front
			39, 14 // Attached to Equator back
	};

	private static int[] cornersIndex = { 0, 2, 6, 8, // U corners
			27, 29, 33, 35 }; // D corners
	private static int[] cornersIndexClockWise = { 36, 45, 18, 9, // U twist clockwise
			42, 26, 53, 17, // D stickers
	};
	private static int[] cornersIndexCounterClockWise = { 47, 11, 38, 20, // U twists
			24, 15, 42, 51}; // D twists

	public static int countMisorientedEdges(CubeState cubeState) {
		String representation = cubeState.toFaceCube();
		assert representation.length() == 54 : "Expected size: 54 = 6x9 stickers.";

		int central = 4; // Index 4 represents the central sticker;
		int stickersPerFace = 9;

		char uColor = representation.charAt(central + 0 * stickersPerFace);
		char rColor = representation.charAt(central + 1 * stickersPerFace);
		char fColor = representation.charAt(central + 2 * stickersPerFace);
		char dColor = representation.charAt(central + 3 * stickersPerFace);
		char lColor = representation.charAt(central + 4 * stickersPerFace);
		char bColor = representation.charAt(central + 5 * stickersPerFace);
		
		int result = 0;
		for (int i=0; i<edgesIndex.length; i++) {
			
		}

		return 0;

	}

}
