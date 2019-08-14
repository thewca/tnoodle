package org.thewca.scrambleanalysis;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;
import static org.thewca.scrambleanalysis.CubeHelper.cornerOrientationSum;
import static org.thewca.scrambleanalysis.CubeHelper.countMisorientedEdges;
import static org.thewca.scrambleanalysis.CubeHelper.getFinalPositionOfCorner;
import static org.thewca.scrambleanalysis.CubeHelper.getFinalPositionOfEdge;
import static org.thewca.scrambleanalysis.CubeHelper.hasParity;
import static org.thewca.scrambleanalysis.CubeHelper.isOrientedEdge;

import java.util.logging.Logger;

import org.junit.Test;

import net.gnehzr.tnoodle.puzzle.CubePuzzle.CubeState;
import net.gnehzr.tnoodle.puzzle.ThreeByThreeCubePuzzle;
import net.gnehzr.tnoodle.scrambles.InvalidMoveException;
import net.gnehzr.tnoodle.scrambles.InvalidScrambleException;

public class CubeHelperTest {

	ThreeByThreeCubePuzzle cube = new ThreeByThreeCubePuzzle();
	Logger logger = Logger.getLogger(CubeHelperTest.class.getName());

	@Test
	public void orientationTest() throws InvalidScrambleException, RepresentationException, InvalidMoveException {
		int n = 1;

		// The number of misoriented edge must be even, corner orientation sum must be a
		// multiple of 3.
		for (int i = 0; i < n; i++) {
			String scramble = cube.generateScramble();
			CubeState state = (CubeState) cube.getSolvedState().applyAlgorithm(scramble);
			String representation = state.toFaceCube();

			int misorientedEdges = countMisorientedEdges(representation);
			int cornerSum = cornerOrientationSum(representation);

			logger.info("Scramble: " + scramble);
			logger.info("Misoriented edges: " + misorientedEdges);
			logger.info("Corner sum: " + cornerSum);
			logger.info("Parity: " + hasParity(scramble));

			assertEquals(misorientedEdges % 2, 0);
			assertEquals(cornerSum % 3, 0);
		}
	}

	@Test
	public void hasParityTest() throws InvalidMoveException {
		String scramble = "U";
		assertTrue(hasParity(scramble));

		scramble = "U'";
		assertTrue(hasParity(scramble));

		scramble = "U2";
		assertFalse(hasParity(scramble));

		String yPerm = "F R U' R' U' R U R' F' R U R' U' R' F R F'";
		assertTrue(hasParity(yPerm));

		String uPerm = "R2 U' R' U' R U R U R U' R";
		assertFalse(hasParity(uPerm));
	}

	@Test
	public void countMisorientedEdgesTest() throws InvalidScrambleException, RepresentationException {
		String scramble1 = "F";
		String scramble2 = "F' B";
		String scramble3 = "F U F";

		CubeState state1 = (CubeState) cube.getSolvedState().applyAlgorithm(scramble1);
		String representation1 = state1.toFaceCube();
		int result1 = countMisorientedEdges(representation1);

		CubeState state2 = (CubeState) cube.getSolvedState().applyAlgorithm(scramble2);
		String representation2 = state2.toFaceCube();
		int result2 = countMisorientedEdges(representation2);

		CubeState state3 = (CubeState) cube.getSolvedState().applyAlgorithm(scramble3);
		String representation3 = state3.toFaceCube();
		int result3 = countMisorientedEdges(representation3);

		assertEquals(result1, 4);
		assertEquals(result2, 8);
		assertEquals(result3, 2);

		assertEquals(countMisorientedEdges(representation1), countMisorientedEdges(state1));
		assertEquals(countMisorientedEdges(representation2), countMisorientedEdges(state2));
		assertEquals(countMisorientedEdges(representation3), countMisorientedEdges(state3));
	}

	@Test
	public void isOrientedEdgeTest() throws InvalidScrambleException, RepresentationException {
		String scramble = "F B'";
		String representation = getRepresentation(scramble);

		assertTrue(isOrientedEdge(representation, 1));
		assertTrue(isOrientedEdge(representation, 2));
		assertTrue(isOrientedEdge(representation, 5));
		assertTrue(isOrientedEdge(representation, 6));

		assertFalse(isOrientedEdge(representation, 0));
		assertFalse(isOrientedEdge(representation, 3));
		assertFalse(isOrientedEdge(representation, 4));
		assertFalse(isOrientedEdge(representation, 7));
		assertFalse(isOrientedEdge(representation, 8));
		assertFalse(isOrientedEdge(representation, 9));
		assertFalse(isOrientedEdge(representation, 10));
		assertFalse(isOrientedEdge(representation, 11));
	}

	@Test
	public void getFinalPositionTest() throws InvalidScrambleException, RepresentationException {
		String scramble1 = "U2";
		String representation1 = getRepresentation(scramble1);

		String scramble2 = "R U R' U R U2 R'";
		String representation2 = getRepresentation(scramble2);
		
		assertEquals(getFinalPositionOfEdge(representation1, 0), 3);
		assertEquals(getFinalPositionOfEdge(representation2, 0), 1);

		assertEquals(getFinalPositionOfCorner(representation1, 0), 3);
		assertEquals(getFinalPositionOfCorner(representation2, 0), 3);
		
		assertEquals(getFinalPositionOfCorner(getRepresentation("R"), 1), 7);
		assertEquals(getFinalPositionOfCorner(getRepresentation("R'"), 1), 3);
	}

	private String getRepresentation(String scramble) throws InvalidScrambleException {
		CubeState state = (CubeState) cube.getSolvedState().applyAlgorithm(scramble);
		return state.toFaceCube();
	}
}
