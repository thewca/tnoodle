package org.squareone.twophase;

import java.util.Arrays;

public class Layer {

	public char name[] = new char[13];	// string with C/E's to show piece order
	public int turn;		// Least turn (1-6) which make layer twistable again.
	public boolean turnParity;		// Set if this turn changes the parity
	public int nextLeft, nextRight;	// Numbers of next layerhalves when turned

	Layer(HalfLayer h1, HalfLayer h2){ set(h1,h2); }

	public boolean equals(char[] s){ return Arrays.equals( name, s); }

	public void set(HalfLayer h1, HalfLayer h2){
		System.arraycopy(h1.name, 0, name, 0, 6);
		System.arraycopy(h2.name, 0, name, 6, 6);

		int t=(h1.pieces+h2.pieces)&1;
		//get least turn that makes layer twistable again
		int i,j;
		i=j=0; turn=6;
		while( h1.turns[i]!= '0' && h2.turns[j]!= '0' ){
			if     ( h1.turns[i] > h2.turns[j] ) j++;
			else if( h1.turns[i] < h2.turns[j] ) i++;
			else { turn=h1.turns[i]-'0'; break; }
		}

		//calculate the permutation parity of this move;
		boolean par = false;
		if(t==0){
			for(t=0;t<turn;t++){
				if( name[11-t]!='c' ) par=!par;
			}
		}
		turnParity=par;
	}
}
