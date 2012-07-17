/**
	Copyright (C) 2012  Shuang Chen
	
	This program is free software: you can redistribute it and/or modify
	it under the terms of the GNU General Public License as published by
	the Free Software Foundation, either version 3 of the License, or
	(at your option) any later version.
	
	This program is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
	GNU General Public License for more details.
	
	You should have received a copy of the GNU General Public License
	along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
package cs.threephase;

import static cs.threephase.Moves.*;
import static cs.threephase.Util.*;
import static cs.threephase.Center2.rlmv;
import static cs.threephase.Center2.ctmv;
import static cs.threephase.Center2.ctprun;
import static cs.threephase.Center2.rlrot;
import static cs.threephase.Center1.symmult;
import static cs.threephase.Center1.ctsmv;
import static cs.threephase.Center1.csprun;
import static cs.threephase.Center1.symmove;

import java.util.*;

public final class Search implements Runnable {
	final static int PHASE1_SOLUTIONS = 10000;
	final static int PHASE2_ATTEMPS = 500;
	final static int PHASE2_SOLUTIONS = 100;
	final static int PHASE3_ATTEMPS = 50;

	static int[] count = new int[1];

	int[] move1 = new int[15];
	int[] move2 = new int[20];
	int[] move3 = new int[20];
	int length1 = 0;
	int length2 = 0;
	int maxlength2;	
	boolean add1 = false;
//	int[][] edges = new int[15][];
//	int[][] syms = new int[15][];
	public FullCube c;
	FullCube c1 = new FullCube();
	FullCube c2 = new FullCube();
	Center2 ct2 = new Center2();
	Center3 ct3 = new Center3();
	Edge3 e12 = new Edge3();
	Edge3[] tempe = new Edge3[20];
	
	CornerCube cube3st = new CornerCube();
	CornerCube cube3 = new CornerCube();
	cs.min2phase.Search search333 = new cs.min2phase.Search();

	int valid1 = 0;
	public String solution = "";
	public long endtime;

	FullCube[] arr = new FullCube[PHASE1_SOLUTIONS];
	int arridx = 0;
	FullCube[] arr2 = new FullCube[PHASE2_SOLUTIONS];
	int arr2idx = 0;
		

	public Search() {
		for (int i=0; i<20; i++) {
			tempe[i] = new Edge3();
		}
	}
	
	public static String tostr(int[] moves) {
		StringBuilder s = new StringBuilder();
		for (int m : moves) {
			s.append(move2str[m]).append(' ');
		}
		
		s.append(String.format(" (%d moves)", moves.length));
		return s.toString();
	}
	
	public static int[] tomove(String s) {
		s = s.replaceAll("\\s", "");
		int[] arr = new int[s.length()];
		int j = 0;
		for (int i=0, length=s.length(); i<length; i++) {
			int axis = -1;
			switch (s.charAt(i)) {
				case 'U':	axis = 0;	break;
				case 'R':	axis = 1;	break;
				case 'F':	axis = 2;	break;
				case 'D':	axis = 3;	break;
				case 'L':	axis = 4;	break;
				case 'B':	axis = 5;	break;
				case 'u':	axis = 6;	break;
				case 'r':	axis = 7;	break;
				case 'f':	axis = 8;	break;
				case 'd':	axis = 9;	break;
				case 'l':	axis = 10;	break;
				case 'b':	axis = 11;	break;
				default:	continue;
			}
			axis *= 3;
			if (++i<length) {
				switch (s.charAt(i)) {
					case '2':	axis++;		break;
					case '\'':	axis+=2;	break;
					default:	--i;
				}
			}
			arr[j++] = axis;
		}
		
		int[] ret = new int[j];
		while (--j>=0) {
			ret[j] = arr[j];
		}
		return ret;
	}

	public static void main(String[] args) {
		int inf;
		if (args.length == 0) {
			inf = 0;
		} else {
			inf = Integer.parseInt(args[0]);
		}
		Search first = new Search();
		for (int i=inf; i!=0; --i) {
//			first.randomMove();
			System.out.println(first.randomMove());
			System.out.println(String.format("%5.2f\t%f", first.totlen / 1.0 / (inf-i+1), first.tottime / (inf-i+1) / 1000000.0));
		}
	}
	
	static {
		System.out.println("Initialization...");
		Center1.init();
		Center2.init();
		Center3.init();
		Edge3.init();
		cs.min2phase.Tools.init();
		System.out.println("OK");	
	}
	
	static Random r = new Random(42);
	
	public String randomMove() {
		int[] moveseq = new int[40];
		int lm = 36;
		for (int i=0; i<40;) {
			int m = r.nextInt(27);
			if (!ckmv[lm][m]) {
				moveseq[i++] = m;
				lm = m;
			}
		}
		System.out.println(tostr(moveseq));
		return solve(moveseq);
	}
	
	public String solve(String scramble) {
		int[] moveseq = tomove(scramble);
		return solve(moveseq);
	}
	
	public String solve(int[] moveseq) {
		calc(moveseq);
		return solution;	
	}
	
	public String getScramble() {
		calc(System.currentTimeMillis());
		return solution;
	}
	
	public void calc(long seed) {
	    c = new FullCube(seed);
	    run();
	}
	
	public void calc(int[] moveseq) {
		c = new FullCube(moveseq);
		cube3st = new CornerCube();
		for (int i=0; i<moveseq.length; i++) {
			cube3st.doMove(moveseq[i] % 18);
		}
		run();
	}
	
	int totlen = 0;
	long tottime = 0;
	
	public void run() {
		solution = "";
		int ud = new Center1(c, 0).getsym();
		int fb = new Center1(c, 1).getsym();
		int rl = new Center1(c, 2).getsym();

		arridx = 0;
		arr2idx = 0;
		
		long time = System.nanoTime();

		for (length1=0; length1<100; length1++) {
			if (search1(rl>>>6, rl&0x3f, length1, 36, 0) 
					|| search1(ud>>>6, ud&0x3f, length1, 36, 0)
					|| search1(fb>>>6, fb&0x3f, length1, 36, 0))
				break;
		}

		Arrays.sort(arr, 0, arridx);
//		System.out.println(arridx);
		
//		System.out.println(System.nanoTime() - time);
		
		OUT:
		for (int length12=arr[0].value; length12<100; length12++) {
//			System.out.println(length12);
			for (int i=0; i<Math.min(arridx, PHASE2_ATTEMPS); i++) {
				if (arr[i].value > length12) {
					break;
				}
				if (length12 - arr[i].length1 >= 9) {
					continue;
				}
				c1.set(arr[i]);
				ct2.set(c1);
				int s2ct = ct2.getct();
				int s2rl = ct2.getrl();
				length1 = arr[i].length1;
				length2 = length12 - arr[i].length1;
				if (search2(s2ct, s2rl, length2, 28, 0)) {
					break OUT;
				}
			}
		}
		
		Arrays.sort(arr2, 0, arr2idx);
		int length123, index = 0;
		int solcnt = 0;
//		System.out.println(arr2idx);

//		System.out.println(System.nanoTime() - time);

		OUT2:
		for (length123=arr2[0].value; length123<100; length123++) {
//			System.out.println(length123);
			for (int i=0; i<Math.min(arr2idx, PHASE3_ATTEMPS); i++) {
				if (arr2[i].value > length123) {
					break;
				}
				if (length123 - arr2[i].length1 - arr2[i].length2 > 13) {
					continue;
				}
				int eparity = e12.set(arr2[i]);
				ct3.set(arr2[i], eparity);
				int ct = ct3.getct();
				int edge = e12.get();
				int prun = e12.getprun(edge);
				if (prun <= length123 - arr2[i].length1 - arr2[i].length2 
						&& search3(edge, ct, prun, length123 - arr2[i].length1 - arr2[i].length2, 20, 0)) {
					solcnt++;
//					System.out.println(length123 + " " + solcnt);
//					if (solcnt == 5) {
						index = i;
						break OUT2;
//					}
				}
			}
		}
//		System.out.println(length123);
		
//		System.out.println(System.nanoTime() - time);

		FullCube solcube = new FullCube(arr2[index]);
		move1 = solcube.moveseq1;
		move2 = solcube.moveseq2;
		length1 = solcube.length1;
		length2 = solcube.length2;
		int length = length123 - length1 - length2;

		StringBuffer str = new StringBuffer();
		cube3.copy(cube3st);
		FullCube cube4 = new FullCube(c);
		
		str.append("Step 1 : ");
		for (int i=0; i<length1; i++) {
			cube3.doMove(move1[i] % 18);
			cube4.move(move1[i]);
			str.append(move2str[move1[i]]);
			str.append(' ');
		}
		if (solcube.add1) {
			str.append('[');
			cube3.doMove(move1[length1] % 18);
			cube4.move(move1[length1]);
			str.append(move2str[move1[length1]]);
			str.append(' ');
			cube3.doMove(move1[length1+1] % 18);
			cube4.move(move1[length1+1]);
			str.append(move2str[move1[length1+1]]);
			str.append(']');
		}
		str.append(String.format(" (%d moves) \n", length1));
		str.append("Step 2 : ");
		for (int i=0; i<length2; i++) {
			cube3.doMove(move2[i] % 18);
			cube4.move(move2[i]);
			str.append(move2str[move2[i]]);
			str.append(' ');
		}
		str.append(String.format(" (%d moves) \n", length2));
		str.append("Step 3 : ");
		for (int i=0; i<length; i++) {
			cube3.doMove(move3std[move3[i]] % 18);
			cube4.move(move3std[move3[i]]);
			str.append(move2str[move3std[move3[i]]]);
			str.append(' ');
		}
		str.append(String.format(" (%d moves) \n", length));
//		System.out.println(length1 + length2 + length);

		String facelet = cube4.to333Facelet(cube3);
		String sol = search333.solution(facelet, 20, 100, 30, 0);
		if (sol.startsWith("Error 8")) {
			sol = search333.solution(facelet, 21, 1000000, 30, 0);
		}
		int len333 = sol.length() / 3;
		if (len333 < 15) {
			System.out.println(str);
			System.out.println(sol);
			throw new RuntimeException();
		}
		System.out.println(System.nanoTime() - time);

		str.append("3x3x3  : ");
		str.append(sol.replaceAll(" +", " "));
		str.append(String.format(" (%d moves) \n", len333));
		str.append(String.format("Total  : %d moves\n", length1 + length2 + length + len333));

//		System.out.println(sol);
		synchronized (solution) {
			solution = str.toString();
		}

		totlen += length1 + length2 + length + len333;
		tottime += System.nanoTime() - time;

	}

	public void calc(FullCube s) {
		c = s;
		run();
	}

	public final boolean search1(int ct, int sym, int maxl, int lm, int depth) {
		if (ct==0) {
			return maxl == 0 && init2(sym, lm);
		}
		if (csprun[ct] > maxl) {
			return false;
		}
		for (int m=0; m<27; m++) {
			if (ckmv[lm][m]) {
				m+=2;
				continue;
			}
			int ctx = ctsmv[ct][symmove[sym][m]];
			int symx = symmult[sym][ctx&0x03f];
			ctx>>>=6;
			move1[depth] = m;
			if (search1(ctx, symx, maxl-1, m, depth+1)) {
				return true;
			}
		}
		return false;
	}
	
	final boolean init2(int sym, int lm) {
		c1.set(c);
		for (int i=0; i<length1; i++) {
			c1.move(move1[i]);
		}

		switch (Center1.finish[sym]) {
		case 0 :
			c1.move(fx1);
			c1.move(bx3);
			move1[length1] = fx1;
			move1[length1+1] = bx3;
			add1 = true;
			sym = 21;
			break;
		case 12869 :
			c1.move(ux1);
			c1.move(dx3);
			move1[length1] = ux1;
			move1[length1+1] = dx3;
			add1 = true;
			sym = 36;
			break;
		case 735470 : 
			add1 = false;
		}
		ct2.set(c1);
		int s2ct = ct2.getct();
		int s2rl = ct2.getrl();
		int ctp = ctprun[s2ct*70+s2rl];
		
		if (arr[arridx] == null) {
			arr[arridx] = new FullCube(c1);
		} else {
			arr[arridx].set(c1);
		}
		arr[arridx].value = ctp + length1;
		arr[arridx].length1 = length1;
		arr[arridx].add1 = add1;
		for (int i=0; i<length1; i++) {
			arr[arridx].moveseq1[i] = move1[i];
		}
		if (add1) {
			arr[arridx].moveseq1[length1] = move1[length1];
			arr[arridx].moveseq1[length1+1] = move1[length1+1];			
		}
		arridx++;
		return arridx == arr.length;
	}

	public final boolean search2(int ct, int rl, int maxl, int lm, int depth) {
		if (ct==0 && ctprun[rl] == 0) {
			return maxl == 0 && init3();
		}
		for (int m=0; m<23; m++) {
			if (ckmv2[lm][m]) {
				continue;
			}
			int ctx = ctmv[ct][m];
			int rlx = rlmv[rl][m];
				
			int prun = ctprun[ctx * 70 + rlx];
			if (prun >= maxl) {
				if (prun > maxl) {
					m = skipAxis2[m];
				}
				continue;
			}

			int mt = move2std[m];
			move2[depth] = mt;
			if (search2(ctx, rlx, maxl-1, m, depth+1)) {
				return true;
			}
		}
		return false;
	}	

	final boolean init3() {
		c2.set(c1);
		for (int i=0; i<length2; i++) {
			c2.move(move2[i]);
		}
		if (!c2.checkEdge()) {
			return false;
		}
//		System.out.println(c2.checkEdge() + " " + length2);
		int eparity = e12.set(c2);
		ct3.set(c2, eparity);
		int ct = ct3.getct();
		int edge = e12.get();
		int prun = e12.getprun(edge);
		if (arr2[arr2idx] == null) {
			arr2[arr2idx] = new FullCube(c2);
		} else {
			arr2[arr2idx].set(c2);
		}
		arr2[arr2idx].value = length1 + length2 + Math.max(prun, Center3.prun[ct]);
		arr2[arr2idx].length2 = length2;
		for (int i=0; i<length2; i++) {
			arr2[arr2idx].moveseq2[i] = move2[i];
		}
		arr2idx++;

		return arr2idx == arr2.length;
	}
	
	public final boolean search3(int edge, int ct, int prun, int maxl, int lm, int depth) {
		if (maxl == 0) {
			return edge==0 && ct==0;
		}
		tempe[depth].set(edge);
		for (int m=0; m<17; m++) {
			if (ckmv3[lm][m]) {
				m = skipAxis3[m];
				continue;
			}
				
			int ctx = Center3.ctmove[ct][m];
			int prun1 = Center3.prun[ctx];
			if (prun1 >= maxl) {
				if (prun1 > maxl && m < 14) {
					m = skipAxis3[m];
				}
				continue;
			}
			int edgex = Edge3.getmv(tempe[depth].edge, m);
			int prunx = Edge3.getprun(edgex, prun);
			if (prunx >= maxl) {
				if (prunx > maxl && m < 14) {
					m = skipAxis3[m];
				}
				continue;
			}

			if (search3(edgex, ctx, prunx, maxl-1, m, depth+1)) {
				move3[depth] = m;
				return true;
			}
		}
		return false;
	}
}
