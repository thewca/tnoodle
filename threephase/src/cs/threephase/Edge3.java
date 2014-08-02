package cs.threephase;
import java.util.*;
import java.io.*;
import static cs.threephase.Util.*;
import static cs.threephase.Moves.*;

/*
 					13	1	
				4			17 
				16			5 
					0	12	
	4	16			0	12			5	17			1	13	
9			20	20			11	11			22	22			9 
21			8	8			23	23			10	10			21 
	19	7			15	3			18	6			14	2	
					15	3	
				7			18 
				19			6 
					2	14	
 */

public class Edge3 {

	static final int N_SYM = 1538;
	static final int N_RAW = 20160;
	static final int N_EPRUN = N_SYM * N_RAW;
	static final int MAX_DEPTH = 11;
	static int[] eprun = new int[N_EPRUN / 8];

	static int[] sym2raw = new int[N_SYM];
	static char[] symstate = new char[N_SYM];
	static int[] raw2sym = new int[11880];

	static int[] syminv = {0, 1, 6, 3, 4, 5, 2, 7};

	int[] edge = new int[12];
	int[] edgeo = new int[12];
	int[] temp;
	boolean isStd = true;

	static int[][] mvrot = new int[20 * 8][12];
	static int[][] mvroto = new int[20 * 8][12];
	static int[][] edgex = new int[20][12];
	static int[][] edgeox = new int[20][12];
	
	private static int[] fact = {19958400, 1814400, 181440, 20160, 2520, 360, 60, 12, 3, 1};
	static int[] factX = {1, 1, 2/2, 6/2, 24/2, 120/2, 720/2, 5040/2, 40320/2, 362880/2, 3628800/2, 39916800/2, 479001600/2};

	static void initEdgex() {
		Edge3 e = new Edge3();
		for (int m=0; m<20; m++) {
			e.set(0);
			e.move(m);
			for (int i=0; i<12; i++) {
				edgex[m][i] = e.edge[i];
			}
			e.get();
			for (int i=0; i<12; i++) {
				edgeox[m][i] = e.temp[i];
			}
		}

		for (int m=0; m<20; m++) {
			for (int r=0; r<8; r++) {
				e.set(0);
				e.move(m);
				e.rotate(r);
				for (int i=0; i<12; i++) {
					mvrot[m<<3|r][i] = e.edge[i];
				}
				e.get();
				for (int i=0; i<12; i++) {
					mvroto[m<<3|r][i] = e.temp[i];
				}
			}
		}
	}

	static void initRaw2Sym() {
		Edge3 e = new Edge3();		
		byte[] occ = new byte[11880/8];
		int count = 0;
		for (int i=0; i<11880; i++) {
			if ((occ[i>>>3]&(1<<(i&7))) == 0) {
				e.set4(i);
				for (int j=0; j<8; j++) {
					int idx = e.get4();
					if (idx == i) {
						symstate[count] |= 1 << j;
					}
					occ[idx>>3] |= (1<<(idx&7));
					raw2sym[idx] = count << 3 | syminv[j];
					e.rot(0);
					if (j%2==1) {
						e.rot(1);
						e.rot(2);
					}
				}
				sym2raw[count++] = i;
			}
		}
		assert count == 1538;
	}
	
	static void init() {
		initEdgex();
		initRaw2Sym();

		// if (!read(eprun, 0, eprun.length, "Edge3.prunS")) {
		// 	createPrun();
		// 	write(eprun, 0, eprun.length, "Edge3.prunS");
		// }
	}

	public String toString() {
		StringBuffer sb = new StringBuffer();
		for (int i=0; i<12; i++) {
			sb.append(String.format("%2c", "0123456789AB".charAt(edge[i])));
		}
		sb.append('\n');
		for (int i=0; i<12; i++) {
			sb.append(String.format("%2c", "0123456789AB".charAt(edgeo[i])));
		}
		return sb.toString();
	}

	static int done = 0;

	static void createPrun() {
		Edge3 e = new Edge3();
		Edge3 f = new Edge3();
		Edge3 g = new Edge3();

		Arrays.fill(eprun, -1);
		int depth = 0;
		done = 1;
		setPruning(eprun, 0, 0);

		while (done != N_EPRUN) {
			boolean inv = depth > 9;
			int find = inv ? 0xf : depth;
			int chk = inv ? depth : 0xf;

			if (depth >= MAX_DEPTH - 1) {
				break;
			}

			for (int i_=0; i_<N_EPRUN; i_+=8) {
				int val = eprun[i_ >> 3];
				if (!inv && val == -1) {
					continue;
				}
				for (int i=i_, end=i_+8; i<end; i++, val>>=4) {
					if ((val & 0xf) != find) {
						continue;
					}
					int symcord1 = i / N_RAW;
					int cord1 = sym2raw[symcord1];
					int cord2 = i % N_RAW;
					e.set(cord1 * N_RAW + cord2);

					for (int m=0; m<17; m++) {
						int cord1x = getmv4(e.edge, m);
						int symcord1x = raw2sym[cord1x];
						int symx = symcord1x & 0x7;
						symcord1x >>= 3;
						int cord2x = getmvrot(e.edge, m<<3|symx) % N_RAW;
						int idx = symcord1x * N_RAW + cord2x;
						if (getPruning(eprun, idx) != chk) {
							continue;
						}
						setPruning(eprun, inv ? i : idx, depth + 1);
						done++;
						if ((done & 0x3ffff) == 0) {
							System.out.print(String.format("%d\r", done));
						}
						if (inv) {
							break;
						}
						char symState = symstate[symcord1x];
						if (symState == 1){
							continue;
						}
						f.set(e);
						f.move(m);
						f.rotate(symx);
						for (int j=1; (symState >>= 1) != 0; j++) {
							if ((symState & 1) == 1) {
								g.set(f);
								g.rotate(j);
								int idxx = symcord1x * N_RAW + g.get() % N_RAW;
								if (getPruning(eprun, idxx) == chk) {
									setPruning(eprun, idxx, depth + 1);
									done++;
									if ((done & 0x3ffff) == 0) {
										System.out.print(String.format("%d\r", done));
									}
								}
							}
						}
					}
				}
			}
			depth++;
			System.out.println(String.format("%2d%10d", depth, done));
		}
	}

	public static double initStatus() {
		return done / 11742425.0;
	}

	static int[] FullEdgeMap = {0, 2, 4, 6, 1, 3, 7, 5, 8, 9, 10, 11};

	int getsym() {
		int cord1x = get4();
		int symcord1x = raw2sym[cord1x];
		int symx = symcord1x & 0x7;
		symcord1x >>= 3;
		rotate(symx);
		int cord2x = get() % N_RAW;
		return symcord1x * N_RAW + cord2x;
	}

	int set(EdgeCube c) {
		if (temp == null) {
			temp = new int[12];
		}
		for (int i=0; i<12; i++) {
			temp[i] = i;
			edge[i] = c.ep[FullEdgeMap[i]+12]%12;
		}
		int parity = 1;	//because of FullEdgeMap
		for (int i=0; i<12; i++) {
			while (edge[i] != i) {
				int t = edge[i];
				edge[i] = edge[t];
				edge[t] = t;
				int s = temp[i];
				temp[i] = temp[t];
				temp[t] = s;
				parity ^= 1;
			}
		}
		for (int i=0; i<12; i++) {
			edge[i] = temp[c.ep[FullEdgeMap[i]]%12];
		}
		return parity;
	}

	void set(Edge3 e) {
		for (int i=0; i<12; i++) {
			edge[i] = e.edge[i];
			edgeo[i] = e.edgeo[i];
		}
		isStd = e.isStd;
	}

	static int getmv(int[] ep, int mv) {
		int[] movo = edgeox[mv];
		int[] mov = edgex[mv];
		int idx = 0;
		long val = 0xba9876543210L;
		for (int i=0; i<10; i++) {
			int v = movo[ep[mov[i]]] << 2;
			idx *= 12 - i;
			idx += (val >> v) & 0xf;
			val -= 0x111111111110L << v;
		}
		return idx;	
	}

	static int getmv4(int[] ep, int mv) {
		int[] movo = edgeox[mv];
		int[] mov = edgex[mv];
		int idx = 0;
		long val = 0xba9876543210L;
		for (int i=0; i<4; i++) {
			int v = movo[ep[mov[i]]] << 2;
			idx *= 12 - i;
			idx += (val >> v) & 0xf;
			val -= 0x111111111110L << v;
		}
		return idx;	
	}

	static int getmvrot(int[] ep, int mrIdx) {
		int[] movo = mvroto[mrIdx];
		int[] mov = mvrot[mrIdx];
		int idx = 0;
		long val = 0xba9876543210L;
		for (int i=0; i<10; i++) {
			int v = movo[ep[mov[i]]] << 2;
			idx *= 12 - i;
			idx += (val >> v) & 0xf;
			val -= 0x111111111110L << v;
		}
		return idx;	

	}

	void std() {
		if (temp == null) {
			temp = new int[12];
		}
		for (int i=0; i<12; i++) {
			temp[edgeo[i]] = i;
		}

		for (int i=0; i<12; i++) {
			edge[i] = temp[edge[i]];
			edgeo[i] = i;
		}		
		isStd = true;
	}

	int get() {
		if (!isStd) {
			std();
		}
		int idx = 0;
		long val = 0xba9876543210L;
		for (int i=0; i<10; i++) {
			int v = edge[i] << 2;
			idx *= 12 - i;
			idx += (val >> v) & 0xf;
			val -= 0x111111111110L << v;
		}
		return idx;		
	}

	int get4() {
		if (!isStd) {
			std();
		}
		int idx = 0;
		long val = 0xba9876543210L;
		for (int i=0; i<4; i++) {
			int v = edge[i] << 2;
			idx *= 12 - i;
			idx += (val >> v) & 0xf;
			val -= 0x111111111110L << v;
		}
		return idx;		
	}

	void set(int idx) {
		long val = 0xba9876543210L;
		int parity = 0;
		for (int i=0; i<11; i++) {
			int p = factX[11-i];
			int v = idx / p;
			idx = idx % p;
			parity ^= v;
			v <<= 2;
			edge[i] = (int) ((val >> v) & 0xf);
			long m = (1L << v) - 1;
			val = (val & m) + ((val >> 4) & ~m);
		}
		if ((parity & 1) == 0) {
			edge[11] = (int)val;
		} else {
			edge[11] = edge[10];
			edge[10] = (int)val;
		}
		for (int i=0; i<12; i++) {
			edgeo[i] = i;
		}
		isStd = true;
	}

	void set4(int idx) {
		set(idx * factX[8]);
	}

	void move(int i) {
		isStd = false;
		switch (i) {
		case 0:		//U
			circle(edge, 0, 4, 1, 5);
			circle(edgeo, 0, 4, 1, 5);
			break;
		case 1:		//U2
			swap(edge, 0, 4, 1, 5);
			swap(edgeo, 0, 4, 1, 5);
			break;
		case 2:		//U'
			circle(edge, 0, 5, 1, 4);
			circle(edgeo, 0, 5, 1, 4);
			break;
		case 3:		//R2
			swap(edge, 5, 10, 6, 11);
			swap(edgeo, 5, 10, 6, 11);
			break;
		case 4:		//F
			circle(edge, 0, 11, 3, 8);
			circle(edgeo, 0, 11, 3, 8);
			break;
		case 5:		//F2
			swap(edge, 0, 11, 3, 8);
			swap(edgeo, 0, 11, 3, 8);
			break;
		case 6:		//F'
			circle(edge, 0, 8, 3, 11);
			circle(edgeo, 0, 8, 3, 11);
			break;
		case 7:		//D
			circle(edge, 2, 7, 3, 6);
			circle(edgeo, 2, 7, 3, 6);
			break;
		case 8:		//D2
			swap(edge, 2, 7, 3, 6);
			swap(edgeo, 2, 7, 3, 6);
			break;
		case 9:		//D'
			circle(edge, 2, 6, 3, 7);
			circle(edgeo, 2, 6, 3, 7);
			break;
		case 10:	//L2
			swap(edge, 4, 8, 7, 9);
			swap(edgeo, 4, 8, 7, 9);
			break;
		case 11:	//B
			circle(edge, 1, 9, 2, 10);
			circle(edgeo, 1, 9, 2, 10);
			break;
		case 12:	//B2
			swap(edge, 1, 9, 2, 10);
			swap(edgeo, 1, 9, 2, 10);
			break;
		case 13:	//B'
			circle(edge, 1, 10, 2, 9);
			circle(edgeo, 1, 10, 2, 9);
			break;
		case 14:	//u2
			swap(edge, 0, 4, 1, 5);
			swap(edgeo, 0, 4, 1, 5);
			swap(edge, 9, 11);
			swap(edgeo, 8, 10);
			break;
		case 15:	//r2
			swap(edge, 5, 10, 6, 11);
			swap(edgeo, 5, 10, 6, 11);
			swap(edge, 1, 3);
			swap(edgeo, 0, 2);
			break;
		case 16:	//f2
			swap(edge, 0, 11, 3, 8);
			swap(edgeo, 0, 11, 3, 8);
			swap(edge, 5, 7);
			swap(edgeo, 4, 6);
			break;
		case 17:	//d2
			swap(edge, 2, 7, 3, 6);
			swap(edgeo, 2, 7, 3, 6);
			swap(edge, 8, 10);
			swap(edgeo, 9, 11);
			break;
		case 18:	//l2
			swap(edge, 4, 8, 7, 9);
			swap(edgeo, 4, 8, 7, 9);
			swap(edge, 0, 2);
			swap(edgeo, 1, 3);
			break;
		case 19:	//b2
			swap(edge, 1, 9, 2, 10);
			swap(edgeo, 1, 9, 2, 10);
			swap(edge, 4, 6);
			swap(edgeo, 5, 7);
			break;		
		}
	}

	void rot(int r) {
		isStd = false;
		switch (r) {
		case 0:
			move(14);
			move(17);
			break;
		case 1:
			circlex(11, 5, 10, 6);//r
			circlex(5, 10, 6, 11);				
			circlex(1, 2, 3, 0);
			circlex(4, 9, 7, 8);//l'
			circlex(8, 4, 9, 7);				
			circlex(0, 1, 2, 3);
			break;
		case 2:
			swapx(4, 5); swapx(5, 4);
			swapx(11, 8); swapx(8, 11);
			swapx(7, 6); swapx(6, 7);
			swapx(9, 10); swapx(10, 9);
			swapx(1, 1); swapx(0, 0);
			swapx(3, 3); swapx(2, 2);
			break;
		}	
	}

	void rotate(int r) {
		while (r >= 2) {
			r -= 2;
			rot(1);
			rot(2);
		}
		if (r != 0) {
			rot(0);
		}
	}


	void circle(int[] arr, int a, int b, int c, int d) {
		int temp = arr[d];
		arr[d] = arr[c];
		arr[c] = arr[b];
		arr[b] = arr[a];
		arr[a] = temp;
	}

	void swap(int[] arr, int a, int b, int c, int d) {
		int temp = arr[a];
		arr[a] = arr[c];
		arr[c] = temp;
		temp = arr[b];
		arr[b] = arr[d];
		arr[d] = temp;
	}

	void swap(int[] arr, int x, int y) {
		int temp = arr[x];
		arr[x] = arr[y];
		arr[y] = temp;
	}

	void swapx(int x, int y) {
		int temp = edge[x];
		edge[x] = edgeo[y];
		edgeo[y] = temp;
	}

	void circlex(int a, int b, int c, int d) {
		int temp = edgeo[d];
		edgeo[d] = edge[c];
		edge[c] = edgeo[b];
		edgeo[b] = edge[a];
		edge[a] = temp;
	}
}
