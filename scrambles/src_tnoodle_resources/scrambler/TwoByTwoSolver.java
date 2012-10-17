package scrambler;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Random;

public class TwoByTwoSolver {
	public TwoByTwoSolver() {
		calcperm();
	}
//	int[] seq = new int[1000];
//	private boolean solved(){
//	    for (int i=0;i<24; i+=4){
//	        int c=posit[i];
//	        for(int j=1;j<4;j++)
//	            if(posit[i+j]!=c) return false;
//	    }
//	    return true;
//	}
	
	static int[][] cornerIndices = new int[][] { {15, 16, 21}, {13, 9, 17}, {12, 5, 8}, {14, 20, 4}, {3, 23, 18}, {1, 19, 11}, {0, 10, 7}, {2, 6, 22} };
	static String[] cornerNames = new String[] { "URF", 		"UBR", 		"ULB", 		"UFL", 			"DFR", 		"DRB", 		"DBL", 		"DLF" };

	static HashMap<Character, Integer> faceToIndex = new HashMap<Character, Integer>();
	static {
		faceToIndex.put('D', 1);
		faceToIndex.put('L', 2);
		faceToIndex.put('B', 5);
		faceToIndex.put('U', 4);
		faceToIndex.put('R', 3);
		faceToIndex.put('F', 0);
	}
	public int[] mix(Random r) {
		//Modified to choose a random state, rather than apply 500 random turns
		//-Jeremy Fleischman
		ArrayList<Integer> remaining = new ArrayList<Integer>(Arrays.asList(0, 1, 2, 3, 4, 5, 6));
		ArrayList<Integer> cp = new ArrayList<Integer>();
		while(remaining.size() > 0)
			cp.add(remaining.remove(r.nextInt(remaining.size())));
		//it would appear that the solver only works if the BLD piece is fixed, which is fine
		cp.add(7);

		int[] posit = new int[] {
		                1,1,1,1,
		                2,2,2,2,
		                5,5,5,5,
		                4,4,4,4,
		                3,3,3,3,
		                0,0,0,0};
	    ArrayList<Integer> co = new ArrayList<Integer>();
		int sum = 0;
		for(int i = 0; i < cp.size(); i++) {
			int orientation;
			if(i == cp.size() - 1)
				orientation = 0;
			else if(i == cp.size() - 2)
				orientation = (3 - sum) % 3;
			else
				orientation = r.nextInt(3);
			co.add(orientation);
			sum = (sum + orientation) % 3;
			for(int j = 0; j < 3; j++) {
				int jj = (j + orientation) % 3;
				posit[cornerIndices[i][j]] = faceToIndex.get(cornerNames[cp.get(i)].charAt(jj));
			}
		}
		return posit;
	}
	int[] piece = new int[] {15,16,16,21,21,15,  13,9,9,17,17,13,  14,20,20,4,4,14,  12,5,5,8,8,12,
	                        3,23,23,18,18,3,   1,19,19,11,11,1,  2,6,6,22,22,2,    0,10,10,7,7,0};
	int[] opp=new int[100];
	int auto;
	int[] tot;
//	private void calctot(){
//	    //count how many of each colour
//	    tot=new int[6];
//	    for(int e=0;e<24;e++)
//	    	tot[posit[e]]++;
//	}
	int[][] mov2fc = new int[6][];
	{
		mov2fc[0] = new int[] {0, 2, 3, 1, 23,19,10,6 ,22,18,11,7 }; //D
		mov2fc[1] = new int[] {4, 6, 7, 5, 12,20,2, 10,14,22,0, 8 }; //L
		mov2fc[2] = new int[] {8, 10,11,9, 12,7, 1, 17,13,5, 0, 19}; //B
		mov2fc[3] = new int[] {12,13,15,14,8, 17,21,4, 9, 16,20,5 }; //U
		mov2fc[4] = new int[] {16,17,19,18,15,9, 1, 23,13,11,3, 21 }; //R
		mov2fc[5] = new int[] {20,21,23,22,14,16,3, 6, 15,18,2, 4 }; //F
	}
//	private void domove(int y){
//	    int q=1+(y>>4);
//	    int f=y&15;
//	    while(q > 0){
//	        for(int i=0;i<mov2fc[f].length;i+=4){
//	            int c=posit[mov2fc[f][i]];
//	            posit[mov2fc[f][i]] = posit[mov2fc[f][i+3]];
//	            posit[mov2fc[f][i+3]] = posit[mov2fc[f][i+2]];
//	            posit[mov2fc[f][i+2]] = posit[mov2fc[f][i+1]];
//	            posit[mov2fc[f][i+1]] = c;
//	        }
//	        q--;
//	    }
//	}
	
	public static void main(String[] args) {
		CubeScrambler cs = new CubeScrambler(2);
		System.out.println(cs.generateScramble(new Random()));
	}
	
	static final String[] DIR_TO_STR = new String[] { "'", "2", ""};
	public String solve(int[] posit, int min_length, boolean reverse) {
	    //count all adjacent pairs (clockwise around corners)
		int[][] adj = new int[6][6];
	    for(int a=0;a<adj.length;a++)for(int b=0;b<adj[a].length;b++) adj[a][b] = 0;
	    for(int a=0;a<48;a+=2){
	        if(posit[piece[a]]<=5 && posit[piece[a+1]]<=5)
	            adj[posit[piece[a]]][posit[piece[a+1]]]++;
	    }
	    
	    int[] opp= new int[100];
	    for(int a=0;a<6;a++){
	        for(int b=0;b<6;b++){
	            if(a!=b && adj[a][b]+adj[b][a]==0) { opp[a] = b; opp[b] = a; }
	        }
	    }
	    //Each piece is determined by which of each pair of opposite colours it uses.
	    int[] ps=new int[100];
	    int[] tws=new int[100];
	    int a=0;
	    for(int d=0; d<7; d++){
	        int p=0;
	        for(int b=a;b<a+6;b+=2){
	            if(posit[piece[b]]==posit[piece[42]]) p+=4;
	            if(posit[piece[b]]==posit[piece[44]]) p+=1;
	            if(posit[piece[b]]==posit[piece[46]]) p+=2;
	        }
	        ps[d] = p;
	        if(posit[piece[a]]==posit[piece[42]] || posit[piece[a]]==opp[posit[piece[42]]]) tws[d] = 0;
	        else if(posit[piece[a+2]]==posit[piece[42]] || posit[piece[a+2]]==opp[posit[piece[42]]]) tws[d] = 1;
	        else tws[d] = 2;
	        a+=6;
	    }
	    //convert position to numbers
	    int q=0;
	    for(a=0;a<7;a++){
	        int b=0;
	        for(int c=0;c<7;c++){
	            if(ps[c]==a)break;
	            if(ps[c]>a)b++;
	        }
	        q=q*(7-a)+b;
	    }
	    int t=0;
	    for(a=5;a>=0;a--){
	        t=(int) (t*3+tws[a]-3*Math.floor(tws[a]/3));
	    }

		int[] sol=new int[100];
	    Arrays.fill(sol, -1);
	    for(int l=min_length;l<100;l++)
	    	if(search(0,q,t,l,-1, sol))
	    		break;

	    
	    StringBuffer turns = new StringBuffer();
	    
	    int scrambleLength;
	    for(scrambleLength=0;scrambleLength<sol.length && sol[scrambleLength] != -1;scrambleLength++) {}
	    
	    int startIndex;
	    int delta;
	    if(reverse) {
	    	startIndex = scrambleLength - 1;
	    	delta = -1;
	    } else {
	    	startIndex = 0;
	    	delta = 1;
	    }
	    for(int turnIndex = startIndex; turnIndex >= 0 && turnIndex < scrambleLength; turnIndex += delta) {
	    	char axis = "URF".charAt(sol[turnIndex]/10);
	    	int dir = (sol[turnIndex]%10);
	    	if(reverse) {
	    		dir = 2 - dir;
	    	}
		    String dirStr = DIR_TO_STR[dir];
		    turns.append(" " + axis + dirStr);
	    }
	    
	    // Remove beginning space, if there is one
	    if(turns.length() > 0) {
	    	turns.replace(0, 1, "");
	    }
	    return turns.toString();
	}
	private boolean search(int d, int q, int t, int l, int lm, int[] sol) {
	    //searches for solution, from position q|t, in l moves exactly. last move was lm, current depth=d
	    if(l==0) {
	        if(q==0 && t==0) {
	            return true;
	        }
	    } else {
	        if(perm[q]>l || twst[t]>l)
	        	return false;
	        int p,s,a,m;
	        for(m=0;m<3;m++){
	            if(m!=lm){
	                p=q; s=t;
	                for(a=0;a<3;a++){
	                    p=permmv[p][m];
	                    s=twstmv[s][m];
	                    sol[d] = 10*m+a;
	                    if(search(d+1,p,s,l-1,m, sol))
	                    	return true;
	                }
	            }
	        }
	    }
	    return false;
	}
	int[] perm=new int[5040];
	int[] twst=new int[729];
	int[][] permmv=new int[5040][100];
	int[][] twstmv=new int[729][100];
	private void calcperm() {
	    //calculate solving arrays
	    //first permutation
	 
	    for(int p=0;p<5040;p++) {
	        perm[p] = -1;
	        for(int m=0;m<3;m++) {
	            permmv[p][m] = getprmmv(p,m);
	        }
	    }
	 
	    perm[0] = 0;
	    for(int l=0;l<=6;l++) {
	        int n=0;
	        for(int p=0;p<5040;p++) {
	            if(perm[p]==l){
	                for(int m=0;m<3;m++) {
	                    int q=p;
	                    for(int c=0;c<3;c++) {
	                        q=permmv[q][m];
	                        if(perm[q]==-1)
	                        	perm[q] = l+1; n++;
	                    }
	                }
	            }
	        }
	    }
	 
	    //then twist
	    for(int p=0;p<729;p++) {
	        twst[p] = -1;
	        for(int m=0;m<3;m++) {
	            twstmv[p][m] = gettwsmv(p,m);
	        }
	    }
	 
	    twst[0] = 0;
	    for(int l=0;l<=5;l++) {
	        int n=0;
	        for(int p=0;p<729;p++) {
	            if(twst[p]==l){
	                for(int m=0;m<3;m++) {
	                    int q=p;
	                    for(int c=0;c<3;c++) {
	                        q=twstmv[q][m];
	                        if(twst[q]==-1)
	                        	twst[q] = l+1; n++;
	                    }
	                }
	            }
	        }
	    }
	    //remove wait sign
	}
	private int getprmmv(int p, int m) {
	    //given position p<5040 and move m<3, return new position number
	    int a,b,c,q;
	    //convert number into array;
	    int[] ps=new int[100];
	    q=p;
	    for(a=1;a<=7;a++) {
	        b=q%a;
	        q=(q-b)/a;
	        for(c=a-1;c>=b;c--)
	        	ps[c+1] = ps[c];
	        ps[b] = 7-a;
	    }
	    //perform move on array
	    if(m==0){
	        //U
	        c=ps[0];ps[0] = ps[1];ps[1] = ps[3];ps[3] = ps[2];ps[2] = c;
	    }else if(m==1){
	        //R
	    	c=ps[0];ps[0] = ps[4];ps[4] = ps[5];ps[5] = ps[1];ps[1] = c;
	    }else if(m==2){
	        //F
	    	c=ps[0];ps[0] = ps[2];ps[2] = ps[6];ps[6] = ps[4];ps[4] = c;
	    }
	    //convert array back to number
	    q=0;
	    for(a=0;a<7;a++){
	        b=0;
	        for(c=0;c<7;c++){
	            if(ps[c]==a)break;
	            if(ps[c]>a)b++;
	        }
	        q=q*(7-a)+b;
	    }
	    return q;
	}
	private int gettwsmv(int p, int m){
	    //given orientation p<729 and move m<3, return new orientation number
	    int a,b,c,d,q;
	    //convert number into array;
	   	int[] ps=new int[100];
	    q=p;
	    d=0;
	    for(a=0;a<=5;a++){
	        c=(int) Math.floor(q/3);
	        b=q-3*c;
	        q=c;
	        ps[a] = b;
	        d-=b;if(d<0)d+=3;
	    }
	    ps[6] = d;
	    //perform move on array
	    if(m==0){
	        //U
	    	c=ps[0];ps[0] = ps[1];ps[1] = ps[3];ps[3] = ps[2];ps[2] = c;
	    }else if(m==1){
	        //R
	    	c=ps[0];ps[0] = ps[4];ps[4] = ps[5];ps[5] = ps[1];ps[1] = c;
	    	ps[0] += 2; ps[1]++; ps[5] += 2; ps[4]++;
	    }else if(m==2){
	        //F
	    	c=ps[0];ps[0] = ps[2];ps[2] = ps[6];ps[6] = ps[4];ps[4] = c;
	    	ps[2] += 2; ps[0]++; ps[4] += 2; ps[6]++;
	    }
	    //convert array back to number
	    q=0;
	    for(a=5;a>=0;a--){
	        q=q*3+(ps[a]%3);
	    }
	    return q;
	}
	
}
