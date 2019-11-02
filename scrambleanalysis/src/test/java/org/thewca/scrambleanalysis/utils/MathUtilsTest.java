package org.thewca.scrambleanalysis.utils;

import static org.junit.jupiter.api.Assertions.*;

import org.junit.jupiter.api.Test;

public class MathUtilsTest {

	@Test
	public void test() {
		assertEquals(MathUtils.factorial(3), 6);
		assertEquals(MathUtils.nCp(8, 2), 28);
	}

}
