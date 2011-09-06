package org.squareone.twophase;


/***************************************************
*             Conversion functions                 *
***************************************************/

public class Perm {

	final static void num2Perm(char[] perm, char chr, int num, int n){
		/* convert perm number in range [0,8!> to permutation of 8 chars
		in permray, using characters chr to chr+7   */
		int c;
		int a,b;
		char[] w=new char[n];
		for(a=0;a<n;a++) w[a]=(char)(a + (int)chr);
		for(a=0;a<n;a++){
			c=num/(n-a);
			b=num-c*(n-a);
			num=c;
			perm[a]=w[b];
			while(++b <n) w[b-1]=w[b];
		}
	}

	final static int perm2Num(char[] perm, int n){
		/* convert permutation of n chars to number [0,n!> */
		int p;
		int a,b,c;

		p=0;
		for(a=n-1;a>=0;a--){
			c=0;
			for(b=a+1;b<n;b++){
				if(perm[b]<perm[a]) c++;
			}
			p=p*(n-a)+c;
		}

		return(p);
	}
}
