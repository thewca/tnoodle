package org.thewca.scrambleanalysis;

import static org.junit.Assert.assertNotNull;

import org.junit.Test;

public class ScrambleProviderTest {

	@Test
	public void test() {
		// Ew, not null tests.
		assertNotNull(ScrambleProvider.generateWcaScrambles(2));
	}

}
