package cs.threephase;

import java.util.*;
import static cs.threephase.Moves.*;
import static cs.threephase.Util.*;

class EdgeCube {

//	private static final int[] epmv = {0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
//										1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1};

	static int[][] EdgeColor = {{F, U}, {L, U}, {B, U}, {R, U}, {B, D}, {L, D}, {F, D}, {R, D}, {F, L}, {B, L}, {B, R}, {F, R}};

	static int[] EdgeMap = {F2, L2, B2, R2, B8, L8, F8, R8, F4, B6, B4, F6, U8, U4, U2, U6, D8, D4, D2, D6, L6, L4, R6, R4};


	byte[] ep = new byte[24];
//	int eparity = 0;

	EdgeCube() {
		for (byte i=0; i<24; i++) {
			ep[i] = i;
		}
	}

	EdgeCube(EdgeCube c) {
		copy(c);
	}

	EdgeCube(Random r) {
		this();
		for (int i=0; i<23; i++) {
			int t = i + r.nextInt(24-i);
			if (t != i) {
				byte m = ep[i];
				ep[i] = ep[t];
				ep[t] = m;
			}
		}
//		eparity = getParity();
	}

	EdgeCube(int[] moveseq) {
		this();
		for (int m=0; m<moveseq.length; m++) {
			move(m);
		}
	}

	int getParity() {
		return Util.parity(ep);
	}

	void copy(EdgeCube c) {
		for (int i=0; i<24; i++) {
			this.ep[i] = c.ep[i];
		}
//		this.eparity = c.eparity;
	}

	void print() {
		for (int i=0; i<24; i++) {
			System.out.print(ep[i]);
			System.out.print('\t');
		}
		System.out.println();
	}

	void fill333Facelet(char[] facelet) {
		for (int i=0; i<24; i++) {
			facelet[EdgeMap[i]] = colorMap4to3[EdgeColor[ep[i] % 12][ep[i] / 12]];
		}
	}

	boolean checkEdge() {
		int ck = 0;
		boolean parity = false;
		for (int i=0; i<12; i++) {
			ck |= 1 << ep[i];
			parity = parity != ep[i] >= 12;
		}
		ck &= ck >> 12;
		return ck == 0 && !parity;
	}

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

	void move(int m) {
//		eparity ^= epmv[m];
		int key = m % 3;
		m /= 3;
		switch (m) {
		case 0:	//U
			swap(ep, 0, 1, 2, 3, key);
			swap(ep, 12, 13, 14, 15, key);
			break;
		case 1:	//R
			swap(ep, 11, 15, 10, 19, key);
			swap(ep, 23, 3, 22, 7, key);
			break;
		case 2:	//F
			swap(ep, 0, 11, 6, 8, key);
			swap(ep, 12, 23, 18, 20, key);
			break;
		case 3:	//D
			swap(ep, 4, 5, 6, 7, key);
			swap(ep, 16, 17, 18, 19, key);
			break;
		case 4:	//L
			swap(ep, 1, 20, 5, 21, key);
			swap(ep, 13, 8, 17, 9, key);
			break;
		case 5:	//B
			swap(ep, 2, 9, 4, 10, key);
			swap(ep, 14, 21, 16, 22, key);
			break;
		case 6:	//u
			swap(ep, 0, 1, 2, 3, key);
			swap(ep, 12, 13, 14, 15, key);
			swap(ep, 9, 22, 11, 20, key);
			break;
		case 7:	//r
			swap(ep, 11, 15, 10, 19, key);
			swap(ep, 23, 3, 22, 7, key);
			swap(ep, 2, 16, 6, 12, key);
			break;
		case 8:	//f
			swap(ep, 0, 11, 6, 8, key);
			swap(ep, 12, 23, 18, 20, key);
			swap(ep, 3, 19, 5, 13, key);
			break;
		case 9:	//d
			swap(ep, 4, 5, 6, 7, key);
			swap(ep, 16, 17, 18, 19, key);
			swap(ep, 8, 23, 10, 21, key);
			break;
		case 10://l
			swap(ep, 1, 20, 5, 21, key);
			swap(ep, 13, 8, 17, 9, key);
			swap(ep, 14, 0, 18, 4, key);
			break;
		case 11://b
			swap(ep, 2, 9, 4, 10, key);
			swap(ep, 14, 21, 16, 22, key);
			swap(ep, 7, 15, 1, 17, key);
			break;
		}
	}
}
