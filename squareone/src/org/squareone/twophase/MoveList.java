package org.squareone.twophase;

import java.io.PrintStream;

public class MoveList {

	int list[] = new int[100];		//actual list of moves
	int lngth;			//length of list;
	int lngthtwst;		//number of twists

	MoveList() { lngth = 0; lngthtwst = 0;}

	public void push(int m){ 
		list[lngth++]=m; if(m==0) lngthtwst++;
	}

	public int pull() {
		if(lngth != 0){
			if(list[--lngth]==0) lngthtwst--;
			return list[lngth];
		}else{
			return 0;
		}
	}

	public int readlist(int a){ return a<lngth? list[a] : 0; }

	public int length() { return lngth; }

	public int lengthtwist() { return lngthtwst; }

	public void outputturn(PrintStream os, int a){
		while (a < 0) a += 12;
		while (a >= 12) a -= 12;
		if(a<=6){
			os.print(a);
		}
		else{
			os.print('-');
			os.print(12-a);
		}
	}

	public void outputmove(PrintStream os, int a, int b){
		if( (a%12) != 0 || (b%12) != 0 ){
			os.print(" (");
			outputturn(os,a);
			os.print(',');
			outputturn(os,b);
			os.print(')');
		}
	}

	public void printGen(PrintStream os){
		int mu = 0, md = 0;
		int i;
		for (i = lngth - 1; i >= 0; i--) {
			if (list[i] == 0) {
				outputmove(os, mu, md);
				mu = md = 0;
				os.print(" /");
			} else if (list[i] > 0) {
				mu = -list[i];
			} else {
				md = list[i];
			}
		}
		outputmove(os, mu, md);
	}


	public void print(PrintStream os){
		int b,c;
		for(int a=0; a<lngth; a++){
			b=list[a];
			if(b==0) os.print(" /");
			else if(b>0){
				if(a<lngth-1 && (c=list[a+1])<0){
					outputmove(os,b,-c); a++;
				}else outputmove(os,b,0);
			}else if(b<0) outputmove(os,0,-b);
				
		}
		//os.println("");
		//os.println("    [" + lngthtwst + '|' + lngth + ']');
	}
}
