package org.thewca.scrambleanalysis.utils;

import static org.junit.Assert.*;

import org.junit.Test;

public class MathUtilsTest {

	@Test
	public void test() {
		assertEquals(MathUtils.factorial(3), 6);
		assertEquals(MathUtils.nCp(8, 2), 28);
	}

}
