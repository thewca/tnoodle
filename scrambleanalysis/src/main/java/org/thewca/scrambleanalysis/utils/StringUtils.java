package org.thewca.scrambleanalysis.utils;

import java.util.Arrays;

public class StringUtils {
	
	/**
	 * Give two string, compares them ignoring order of chars.
	 * UFR == FRU = FRU
	 * @param st1
	 * @param st2
	 * @return
	 */
	public static boolean stringCompareIgnoringOrder(String st1, String st2) {
		if (st1.length() != st2.length()) {
			return false;
		}
		
		char[] chars1 = st1.toCharArray();
		char[] chars2 = st2.toCharArray();
		
		Arrays.sort(chars1);
		Arrays.sort(chars2);
		
		for (int i=0; i<st1.length(); i++) {
			if (chars1[i] != chars2[i]) {
				return false;
			}
		}
		
		return true;
	}

}
