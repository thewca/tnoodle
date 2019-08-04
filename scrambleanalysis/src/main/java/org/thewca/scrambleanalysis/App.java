package org.thewca.scrambleanalysis;

import net.gnehzr.tnoodle.puzzle.CubePuzzle.CubeState;
import net.gnehzr.tnoodle.puzzle.ThreeByThreeCubePuzzle;
import net.gnehzr.tnoodle.scrambles.InvalidScrambleException;

import static org.thewca.scrambleanalysis.CubeHelper.countMisorientedEdges;

public class App {
	public static void main(String[] args) throws RepresentationException, InvalidScrambleException {
		
		String scramble = "R' U' F U2 L2 D L2 D' R2 U B2 F' U F' R U2 L' F R' B R U R' U' F";
		ThreeByThreeCubePuzzle cube = new ThreeByThreeCubePuzzle();
		
		CubeState solved = cube.getSolvedState();
		CubeState cubeState = (CubeState) solved.applyAlgorithm(scramble);
		String representation = cubeState.toFaceCube();
		
		System.out.println(countMisorientedEdges(representation));
	}
}
