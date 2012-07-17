package cs.threephase;

import java.util.*;
import static cs.threephase.Moves.*;
import static cs.threephase.Util.*;

public final class FullCube implements Comparable {
//TODO: split to CenterCube, EdgeCube, CornerCube.

	int[] ep = new int[24];
	int[] ct = new int[24];
	int cparity = 0;
	int eparity = 0;
	
	int value = 0;
	boolean add1 = false;
	int length1 = 0;
	int length2 = 0;
	int length3 = 0;
	
	int[] moveseq1 = new int[20];
	int[] moveseq2 = new int[20];
	int[] moveseq3 = new int[20];
	
	static final byte U1 = 0;
	static final byte U2 = 1;
	static final byte U3 = 2;
	static final byte U4 = 3;
	static final byte U5 = 4;
	static final byte U6 = 5;
	static final byte U7 = 6;
	static final byte U8 = 7;
	static final byte U9 = 8;
	static final byte R1 = 9;
	static final byte R2 = 10;
	static final byte R3 = 11;
	static final byte R4 = 12;
	static final byte R5 = 13;
	static final byte R6 = 14;
	static final byte R7 = 15;
	static final byte R8 = 16;
	static final byte R9 = 17;
	static final byte F1 = 18;
	static final byte F2 = 19;
	static final byte F3 = 20;
	static final byte F4 = 21;
	static final byte F5 = 22;
	static final byte F6 = 23;
	static final byte F7 = 24;
	static final byte F8 = 25;
	static final byte F9 = 26;
	static final byte D1 = 27;
	static final byte D2 = 28;
	static final byte D3 = 29;
	static final byte D4 = 30;
	static final byte D5 = 31;
	static final byte D6 = 32;
	static final byte D7 = 33;
	static final byte D8 = 34;
	static final byte D9 = 35;
	static final byte L1 = 36;
	static final byte L2 = 37;
	static final byte L3 = 38;
	static final byte L4 = 39;
	static final byte L5 = 40;
	static final byte L6 = 41;
	static final byte L7 = 42;
	static final byte L8 = 43;
	static final byte L9 = 44;
	static final byte B1 = 45;
	static final byte B2 = 46;
	static final byte B3 = 47;
	static final byte B4 = 48;
	static final byte B5 = 49;
	static final byte B6 = 50;
	static final byte B7 = 51;
	static final byte B8 = 52;
	static final byte B9 = 53;


	@Override
	public int compareTo(Object c) {
		if (c instanceof FullCube) {
			return this.value - ((FullCube)c).value;
		} else {
			return 0;
		}
	}
	
	private static final int[] cpmv = {1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 
										1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1};
	private static final int[] epmv = {0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 
										1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1};
	
	public FullCube() {
		for (int i=0; i<24; i++) {
			ep[i] = i;
			ct[i] = i / 4;
		}
	}

	public FullCube(FullCube c) {
		set(c);
	}
	
	public FullCube(long seed) {
		this();
		Random r = new Random(seed);
		for (int i=0; i<23; i++) {
			int t = i + r.nextInt(24-i);
			if (t != i) {
				int m = ep[i];
				ep[i] = ep[t];
				ep[t] = m;
				eparity ^= 1;
			}
		}		
		for (int i=0; i<23; i++) {
			int t = i + r.nextInt(24-i);
			if (t != i) {
				int m = ct[i];
				ct[i] = ct[t];
				ct[t] = m;
			}
		}
		cparity = r.nextInt(2);
	}
	
	public FullCube(int[] moveseq) {
		this();
		for (int m : moveseq) {
			move(m);
		}
	}
	
	public void set(FullCube c) {
		for (int i=0; i<24; i++) {
			this.ep[i] = c.ep[i];
			this.ct[i] = c.ct[i];
		}
		this.cparity = c.cparity;
		this.eparity = c.eparity;
		
		this.add1 = c.add1;
		this.length1 = c.length1;
		this.length2 = c.length2;
		this.length3 = c.length3;
		for (int i=0; i<20; i++) {
			this.moveseq1[i] = c.moveseq1[i];
			this.moveseq2[i] = c.moveseq2[i];
			this.moveseq3[i] = c.moveseq3[i];
		}
	}
	
	public void print() {
		for (int i=0; i<24; i++) {
			System.out.print(ct[i]);
			System.out.print('\t');
		}
		System.out.println();
		for (int i=0; i<24; i++) {
			System.out.print(ep[i]);
			System.out.print('\t');
		}
		System.out.println();
	}
	
	public boolean checkEdge() {
		int ck = 0;
		boolean parity = false;
		for (int i=0; i<12; i++) {
			ck |= 1 << ep[i];
			parity = parity != ep[i] >= 12;
		}
		ck &= ck >> 12;
		return ck == 0 && !parity;
	}

	final static int U = 0;
	final static int D = 1;
	final static int F = 2;
	final static int B = 3;
	final static int R = 4;
	final static int L = 5;

	final static int[][] EdgeColor = {{F, U}, {L, U}, {B, U}, {R, U}, {B, D}, {L, D}, {F, D}, {R, D}, {F, L}, {B, L}, {B, R}, {F, R}};

/*
Edge Cubies: 
					14	2	
				1			15
				13			3
					0	12	
	1	13			0	12			3	15			2	14	
9			20	20			11	11			22	22			9
21			8	8			23	23			10	10			21
	17	5			18	6			19	7			16	4	
					18	6	
				5			19
				17			7
					4	16	

Center Cubies: 
			0	1
			3	2

20	21		8	9		16	17		12	13
23	22		11	10		19	18		15	14

			4	5
			7	6

	 *             |************|
	 *             |*U1**U2**U3*|
	 *             |************|
	 *             |*U4**U5**U6*|
	 *             |************|
	 *             |*U7**U8**U9*|
	 *             |************|
	 * ************|************|************|************|
	 * *L1**L2**L3*|*F1**F2**F3*|*R1**R2**F3*|*B1**B2**B3*|
	 * ************|************|************|************|
	 * *L4**L5**L6*|*F4**F5**F6*|*R4**R5**R6*|*B4**B5**B6*|
	 * ************|************|************|************|
	 * *L7**L8**L9*|*F7**F8**F9*|*R7**R8**R9*|*B7**B8**B9*|
	 * ************|************|************|************|
	 *             |************|
	 *             |*D1**D2**D3*|
	 *             |************|
	 *             |*D4**D5**D6*|
	 *             |************|
	 *             |*D7**D8**D9*|
	 *             |************|
	 */
	 
	final static int[] map = {0, 3, 2, 5, 1, 4};
	final static int[] Edge2Edge = {F2, L2, B2, R2, B8, L8, F8, R8, F4, B6, B4, F6, U8, U4, U2, U6, D8, D4, D2, D6, L6, L4, R6, R4};

	String to333Facelet(CornerCube c) {
		int[] ret = new int[54];
		ret[U5] = map[ct[0]];
		ret[R5] = map[ct[16]];
		ret[F5] = map[ct[8]];
		ret[D5] = map[ct[4]];
		ret[L5] = map[ct[20]];
		ret[B5] = map[ct[12]];
		for (int i=0; i<24; i++) {
			ret[Edge2Edge[i]] = map[EdgeColor[ep[i] % 12][ep[i] / 12]];
		}

		for (int corn=0; corn<8; corn++) {
			byte j = c.cp[corn];
			byte ori = c.co[corn];
			for (int n=0; n<3; n++) {
				ret[cornerFacelet[corn][(n + ori) % 3]] = cornerFacelet[j][n]/9;
			}
		}

		char[] facemap = new char[6];
		facemap[ret[4]] = 'U';
		facemap[ret[13]] = 'R';
		facemap[ret[22]] = 'F';
		facemap[ret[31]] = 'D';
		facemap[ret[40]] = 'L';
		facemap[ret[49]] = 'B';
		StringBuffer sb = new StringBuffer();
		for (int i=0; i<54; i++) {
			sb.append(facemap[ret[i]]);
		}
		return sb.toString();
	}

	static final byte[][] cornerFacelet = { { U9, R1, F3 }, { U7, F1, L3 }, { U1, L1, B3 }, { U3, B1, R3 },
			{ D3, F9, R7 }, { D1, L9, F7 }, { D7, B9, L7 }, { D9, R9, B7 } };
	
	void move(int m) {
		cparity ^= cpmv[m];
		eparity ^= epmv[m];
		int key = m % 3;
		m /= 3;
		switch (m) {
			case 0:	//U
				swap(ct, 0, 1, 2, 3, key);
				swap(ep, 0, 1, 2, 3, key);
				swap(ep, 12, 13, 14, 15, key);				
				break;
			case 1:	//R
				swap(ct, 16, 17, 18, 19, key);
				swap(ep, 11, 15, 10, 19, key);
				swap(ep, 23, 3, 22, 7, key);				
				break;
			case 2:	//F
				swap(ct, 8, 9, 10, 11, key);
				swap(ep, 0, 11, 6, 8, key);
				swap(ep, 12, 23, 18, 20, key);				
				break;
			case 3:	//D
				swap(ct, 4, 5, 6, 7, key);
				swap(ep, 4, 5, 6, 7, key);
				swap(ep, 16, 17, 18, 19, key);				
				break;
			case 4:	//L
				swap(ct, 20, 21, 22, 23, key);
				swap(ep, 1, 20, 5, 21, key);
				swap(ep, 13, 8, 17, 9, key);				
				break;
			case 5:	//B
				swap(ct, 12, 13, 14, 15, key);
				swap(ep, 2, 9, 4, 10, key);
				swap(ep, 14, 21, 16, 22, key);				
				break;
			case 6:	//u
				swap(ct, 0, 1, 2, 3, key);
				swap(ct, 8, 20, 12, 16, key);
				swap(ct, 9, 21, 13, 17, key);
				swap(ep, 0, 1, 2, 3, key);
				swap(ep, 12, 13, 14, 15, key);				
				swap(ep, 9, 22, 11, 20, key);
				break;
			case 7:	//r
				swap(ct, 16, 17, 18, 19, key);
				swap(ct, 1, 15, 5, 9, key);
				swap(ct, 2, 12, 6, 10, key);
				swap(ep, 11, 15, 10, 19, key);
				swap(ep, 23, 3, 22, 7, key);				
				swap(ep, 2, 16, 6, 12, key);
				break;
			case 8:	//f
				swap(ct, 8, 9, 10, 11, key);
				swap(ct, 2, 19, 4, 21, key);
				swap(ct, 3, 16, 5, 22, key);
				swap(ep, 0, 11, 6, 8, key);
				swap(ep, 12, 23, 18, 20, key);				
				swap(ep, 3, 19, 5, 13, key);
				break;
			case 9:	//d
				swap(ct, 4, 5, 6, 7, key);
				swap(ct, 10, 18, 14, 22, key);
				swap(ct, 11, 19, 15, 23, key);
				swap(ep, 4, 5, 6, 7, key);
				swap(ep, 16, 17, 18, 19, key);				
				swap(ep, 8, 23, 10, 21, key);
				break;
			case 10://l
				swap(ct, 20, 21, 22, 23, key);
				swap(ct, 0, 8, 4, 14, key);
				swap(ct, 3, 11, 7, 13, key);
				swap(ep, 1, 20, 5, 21, key);
				swap(ep, 13, 8, 17, 9, key);				
				swap(ep, 14, 0, 18, 4, key);
				break;
			case 11://b
				swap(ct, 12, 13, 14, 15, key);
				swap(ct, 1, 20, 7, 18, key);
				swap(ct, 0, 23, 6, 17, key);
				swap(ep, 2, 9, 4, 10, key);
				swap(ep, 14, 21, 16, 22, key);				
				swap(ep, 7, 15, 1, 17, key);
				break;		
		}
	}
}
