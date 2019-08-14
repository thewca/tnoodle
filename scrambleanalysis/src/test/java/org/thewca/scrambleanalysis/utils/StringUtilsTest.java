package org.thewca.scrambleanalysis.utils;

import static org.junit.Assert.*;

import org.junit.Test;

public class StringUtilsTest {

	@Test
	public void test() {
		assertTrue(StringUtils.stringCompareIgnoringOrder("FRU", "RUF"));
		assertTrue(StringUtils.stringCompareIgnoringOrder("UBL", "LBU"));
		assertTrue(StringUtils.stringCompareIgnoringOrder("ABC", "BAC"));

		assertFalse(StringUtils.stringCompareIgnoringOrder("FRU", "FRR"));
		assertFalse(StringUtils.stringCompareIgnoringOrder("AA", "AAA"));
	}

}
