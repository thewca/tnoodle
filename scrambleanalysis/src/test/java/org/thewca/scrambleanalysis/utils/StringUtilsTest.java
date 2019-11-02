package org.thewca.scrambleanalysis.utils;

import static org.junit.jupiter.api.Assertions.*;

import org.junit.jupiter.api.Test;

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
