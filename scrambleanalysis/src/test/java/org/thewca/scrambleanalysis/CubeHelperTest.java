package org.thewca.scrambleanalysis;

import static org.junit.Assert.assertEquals;
import static org.thewca.scrambleanalysis.CubeHelper.*;

import java.util.logging.Logger;

import org.junit.Test;

import net.gnehzr.tnoodle.puzzle.CubePuzzle.CubeState;
import net.gnehzr.tnoodle.puzzle.ThreeByThreeCubePuzzle;
import net.gnehzr.tnoodle.scrambles.InvalidScrambleException;

public class CubeHelperTest {

	ThreeByThreeCubePuzzle cube = new ThreeByThreeCubePuzzle();
	Logger logger = Logger.getLogger(CubeHelperTest.class.getName());

	public CubeHelperTest() {
	}

	@Test
	public void orientationTest() throws InvalidScrambleException, RepresentationException {
		int n = 50;

		// The number of misoriented edge must be even, corner orientation sum must be a multiple of 3.
		for (int i = 0; i < n; i++) {
			String scramble = cube.generateScramble();
			CubeState state = (CubeState) cube.getSolvedState().applyAlgorithm(scramble);
			String representation = state.toFaceCube();

			int misorientedEdges = countMisorientedEdges(representation);
			int cornerSum = cornerOrientationSum(representation);

			logger.info("Scramble: " + scramble);
			logger.info("Misoriented edges: " + misorientedEdges);
			logger.info("Corner sum: " + cornerSum);

			assertEquals(misorientedEdges % 2, 0);
			assertEquals(cornerSum % 3, 0);
		}
	}
}
