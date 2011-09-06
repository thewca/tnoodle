package org.squareone.twophase;


public class HalfLayer {
	public char name[] = new char[7];	// string with C/E's to show piece order
	public char turns[] = new char[6];	// Turns which make layer twistable again (max of 5, ends in 0)
	public int corners, edges, pieces;	//number of pieces

	HalfLayer(char[] s1, char[] s2){ set(s1,s2); }

	public void set(char[] s1, char[] s2){
		System.arraycopy(s1, 0, name, 0, s1.length);
		System.arraycopy(s2, 0, turns, 0, s2.length);
		corners=edges=0;
		int i=0;
		for(i=0; i<s1.length; i++){
			if(name[i]=='E') edges++; else corners++;
		}
		corners>>=1;
		pieces=edges+corners;
	}
}
