package org.thewca.scrambleanalysis.statistics;

import static org.junit.Assert.*;

import org.junit.Test;

public class DistributionTest {

	@Test
	public void minimumSampleSizeTest() {
		assertNotNull(Distribution.minimumSampleSize());
	}

}
