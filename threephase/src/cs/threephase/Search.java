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
import java.io.*;

public class Search implements Runnable {
	static final int PHASE1_SOLUTIONS = 10000;
	static final int PHASE2_ATTEMPS = 500;
	static final int PHASE2_SOLUTIONS = 100;
	static final int PHASE3_ATTEMPS = 100;

	PriorityQueue<FullCube> p1sols = new PriorityQueue<FullCube>(PHASE2_ATTEMPS, new FullCube.ValueComparator());

	static int[] count = new int[1];

	int[] move1 = new int[15];
	int[] move2 = new int[20];
	int[] move3 = new int[20];
	int length1 = 0;
	int length2 = 0;
	int maxlength2;	
	boolean add1 = false;
	public FullCube c;
	FullCube c1 = new FullCube();
	FullCube c2 = new FullCube();
	Center2 ct2 = new Center2();
	Center3 ct3 = new Center3();
	Edge3 e12 = new Edge3();
	Edge3[] tempe = new Edge3[20];

	cs.min2phase.Search search333 = new cs.min2phase.Search();

	int valid1 = 0;
	public String solution = "";
	public long endtime;

	int p1SolsCnt = 0;
	FullCube[] arr2 = new FullCube[PHASE2_SOLUTIONS];
	int arr2idx = 0;		

	public Search() {
		for (int i=0; i<20; i++) {
			tempe[i] = new Edge3();
		}
	}

	public static String tostr(int[] moves) {
		StringBuilder s = new StringBuilder();
		for (int m: moves) {
			s.append(move2str[m]).append(' ');
		}
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
		int n_solve;
		if (args.length == 0) {
			n_solve = 0;
		} else {
			n_solve = Integer.parseInt(args[0]);
		}
		Search first = new Search();
		int[] dis = new int[60];
		int lasttot = 0;
		for (int i=n_solve; i!=0; --i) {
			System.out.println(first.randomState());
			int curlen = first.totlen - lasttot;
			lasttot = first.totlen;
			dis[curlen]++;
			for (int j=0; j<60; j++) {
				if (dis[j] != 0) {
					System.out.println(String.format("%d\t%d\t%d", (n_solve-i+1), j, dis[j]));
				}
			}
			System.out.println(String.format("%5.2f\t%f", first.totlen / 1.0 / (n_solve-i+1), first.tottime / (n_solve-i+1) / 1000000.0));
		}
	}

	static {
		cs.min2phase.Tools.init();
		Util.init();
		Center1.createPrun();
		Center2.init();
		Center3.init();
	}

	static Random r = new Random(42);

	public String randomMove() {
		int[] moveseq = new int[40];
		int lm = 36;
		for (int i=0; i<moveseq.length;) {
			int m = r.nextInt(27);
			if (!ckmv[lm][m]) {
				moveseq[i++] = m;
				lm = m;
			}
		}
		System.out.println(tostr(moveseq));
		return solve(moveseq);
	}

	public String randomState() {
		calc(r.nextInt(0x7fffffff));
		return solution;
	}

	public String solve(String scramble) {
		int[] moveseq = tomove(scramble);
		return solve(moveseq);
	}

	public String solve(int[] moveseq) {
		calc(moveseq);
		return solution;	
	}

	public void calc(long seed) {
	    c = new FullCube(seed);
	    run();
	}

	public void calc(int[] moveseq) {
		c = new FullCube(moveseq);
		run();
	}

	public String randomState(Random r) {
		c = new FullCube(r);
		run();
		System.out.println(solution);
		return solution;
	}

	int totlen = 0;
	long tottime = 0;

	public void run() {
		solution = "";
		int ud = new Center1(c.getCenter(), 0).getsym();
		int fb = new Center1(c.getCenter(), 1).getsym();
		int rl = new Center1(c.getCenter(), 2).getsym();
		int udprun = csprun[ud >> 6];
		int fbprun = csprun[fb >> 6];
		int rlprun = csprun[rl >> 6];

		p1SolsCnt = 0;
		arr2idx = 0;
		p1sols.clear();

		long time = System.nanoTime();

		for (length1=Math.min(Math.min(udprun, fbprun), rlprun); length1<100; length1++) {
			if (rlprun <= length1 && search1(rl>>>6, rl&0x3f, length1, -1, 0) 
					|| udprun <= length1 && search1(ud>>>6, ud&0x3f, length1, -1, 0)
					|| fbprun <= length1 && search1(fb>>>6, fb&0x3f, length1, -1, 0)) {
				break;
			}
		}

		FullCube[] p1SolsArr = p1sols.toArray(new FullCube[0]);
		Arrays.sort(p1SolsArr, 0, p1SolsArr.length);

		int MAX_LENGTH2 = 9;
		int length12;
		do {
			OUT:
			for (length12=p1SolsArr[0].value; length12<100; length12++) {
				for (int i=0; i<p1SolsArr.length; i++) {
					if (p1SolsArr[i].value > length12) {
						break;
					}
					if (length12 - p1SolsArr[i].length1 > MAX_LENGTH2) {
						continue;
					}
					c1.copy(p1SolsArr[i]);
					ct2.set(c1.getCenter(), c1.getEdge().getParity());
					int s2ct = ct2.getct();
					int s2rl = ct2.getrl();
					length1 = p1SolsArr[i].length1;
					length2 = length12 - p1SolsArr[i].length1;

					if (search2(s2ct, s2rl, length2, 28, 0)) {
						break OUT;
					}
				}
			}
			MAX_LENGTH2++;
		} while (length12 == 100);

		Arrays.sort(arr2, 0, arr2idx);
		int length123, index = 0;
		int solcnt = 0;

		int MAX_LENGTH3 = 13;
		do {
			OUT2:
			for (length123=arr2[0].value; length123<100; length123++) {
				for (int i=0; i<Math.min(arr2idx, PHASE3_ATTEMPS); i++) {
					if (arr2[i].value > length123) {
						break;
					}
					if (length123 - arr2[i].length1 - arr2[i].length2 > MAX_LENGTH3) {
						continue;
					}
					int eparity = e12.set(arr2[i].getEdge());
					ct3.set(arr2[i].getCenter(), eparity ^ arr2[i].getCorner().getParity());
					int ct = ct3.getct();
					int edge = e12.get();
					int prun = Math.min(Util.getPruning(Edge3.eprun, e12.getsym()), Edge3.MAX_DEPTH);
					int lm = 20;

					if (prun <= length123 - arr2[i].length1 - arr2[i].length2 
							&& search3(edge, ct, length123 - arr2[i].length1 - arr2[i].length2, lm, 0)) {
						solcnt++;
	//					System.out.println(length123 + " " + solcnt);
	//					if (solcnt == 5) {
							index = i;
							break OUT2;
	//					}
					}
				}
			}
			MAX_LENGTH3++;
		} while (length123 == 100);

		FullCube solcube = new FullCube(arr2[index]);
		length1 = solcube.length1;
		length2 = solcube.length2;
		int length = length123 - length1 - length2;

		for (int i=0; i<length; i++) {
			solcube.move(move3std[move3[i]]);
		}

		String facelet = solcube.to333Facelet();
		String sol = search333.solution(facelet, 20, 100, 50, 0);
		if (sol.startsWith("Error 8")) {
			sol = search333.solution(facelet, 21, 1000000, 30, 0);
		}
		int len333 = sol.length() / 3;
		if (sol.startsWith("Error")) {
			System.out.println(sol);
			throw new RuntimeException();
		}
		int[] sol333 = tomove(sol);
		for (int i=0; i<sol333.length; i++) {
			solcube.move(sol333[i]);
		}

		StringBuffer str = new StringBuffer();
		str.append(solcube.getMoveString(true, false));

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

	boolean search1(int ct, int sym, int maxl, int lm, int depth) {
		if (ct==0) {
			return maxl == 0 && init2(sym, lm);
		}
		for (int axis=0; axis<27; axis+=3) {
			if (axis == lm || axis == lm - 9 || axis == lm - 18) {
				continue;
			}
			for (int power=0; power<3; power++) {
				int m = axis + power;
				int ctx = ctsmv[ct][symmove[sym][m]];
				int prun = csprun[ctx>>>6];
				if (prun >= maxl) {
					if (prun > maxl) {
						break;
					}
					continue;
				}
				int symx = symmult[sym][ctx&0x3f];
				ctx>>>=6;
				move1[depth] = m;
				if (search1(ctx, symx, maxl-1, axis, depth+1)) {
					return true;
				}
			}
		}
		return false;
	}

	boolean init2(int sym, int lm) {
		c1.copy(c);
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
			sym = 19;
			break;
		case 12869 :
			c1.move(ux1);
			c1.move(dx3);
			move1[length1] = ux1;
			move1[length1+1] = dx3;
			add1 = true;
			sym = 34;
			break;
		case 735470 : 
			add1 = false;
			sym = 0;
		}
		ct2.set(c1.getCenter(), c1.getEdge().getParity());
		int s2ct = ct2.getct();
		int s2rl = ct2.getrl();
		int ctp = ctprun[s2ct*70+s2rl];

		c1.value = ctp + length1;
		c1.length1 = length1;
		c1.add1 = add1;
		c1.sym = sym;
		p1SolsCnt++;

		FullCube next;
		if (p1sols.size() < PHASE2_ATTEMPS) {
			next = new FullCube(c1);
		} else {
			next = p1sols.poll();
			if (next.value > c1.value) {
				next.copy(c1);
			}
		}
		p1sols.add(next);

		return p1SolsCnt == PHASE1_SOLUTIONS;
	}

	boolean search2(int ct, int rl, int maxl, int lm, int depth) {
		if (ct==0 && ctprun[rl] == 0) {
			return maxl == 0 && init3();
		}
		for (int m=0; m<23; m++) {
			if (ckmv2[lm][m]) {
				m = skipAxis2[m];
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

			move2[depth] = move2std[m];
			if (search2(ctx, rlx, maxl-1, m, depth+1)) {
				return true;
			}
		}
		return false;
	}

	boolean init3() {
		c2.copy(c1);
		for (int i=0; i<length2; i++) {
			c2.move(move2[i]);
		}
		if (!c2.checkEdge()) {
			return false;
		}
		int eparity = e12.set(c2.getEdge());
		ct3.set(c2.getCenter(), eparity ^ c2.getCorner().getParity());
		int ct = ct3.getct();
		int edge = e12.get();
		int prun = Math.min(Util.getPruning(Edge3.eprun, e12.getsym()), Edge3.MAX_DEPTH);

		if (arr2[arr2idx] == null) {
			arr2[arr2idx] = new FullCube(c2);
		} else {
			arr2[arr2idx].copy(c2);
		}
		arr2[arr2idx].value = length1 + length2 + Math.max(prun, Center3.prun[ct]);
		arr2[arr2idx].length2 = length2;
		arr2idx++;

		return arr2idx == arr2.length;
	}

	public boolean search3(int edge, int ct, int maxl, int lm, int depth) {
		if (maxl == 0) {
			return edge == 0 && ct == 0;
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

			int cord1x = edgex / Edge3.N_RAW;
			int symcord1x = Edge3.raw2sym[cord1x];
			int symx = symcord1x & 0x7;
			symcord1x >>= 3;
			int cord2x = Edge3.getmvrot(tempe[depth].edge, m<<3|symx) % Edge3.N_RAW;

			int prunx = Math.min(Util.getPruning(Edge3.eprun, symcord1x * Edge3.N_RAW + cord2x), Edge3.MAX_DEPTH);
			if (prunx >= maxl) {
				if (prunx > maxl && m < 14) {
					m = skipAxis3[m];
				}
				continue;
			}

			if (search3(edgex, ctx, maxl - 1, m, depth + 1)) {
				move3[depth] = m;
				return true;
			}
		}
		return false;
	}
}
