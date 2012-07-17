package cs.threephase;

import cs.threephase.Moves;

class Solution {
	int[] moveseq = new int[30];
	int length = 0;
	
	int value = 0;
	
	
	Solution() {
	
	}
	
	public String toString() {
		StringBuilder sb = new StringBuilder();
		for (int i=0; i<length; i++) {
			sb.append(Moves.move2str[moveseq[i]]);
			sb.append(' ');
		}
		sb.append("(");
		sb.append(length);
		sb.append("f)");
		return sb.toString();
	}
}
