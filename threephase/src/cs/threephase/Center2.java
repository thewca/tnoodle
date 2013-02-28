package cs.threephase;

import static cs.threephase.Util.*;
import static cs.threephase.Moves.*;
import java.util.*;
/*
			0	1
			3	2

4	5		8	9		0	1		12	13
7	6		11	10		3	2		15	14

			4	5
			7	6
*/

class Center2 {

	int[] rl = new int[8];
	int[] ct = new int[16];
	int parity = 0;

	static int[][] rlmv = new int[70][28];
	static char[][] ctmv = new char[6435][28];
	static int[][] rlrot = new int[70][16];
	static int[][] ctrot = new int[6435][16];
	static byte[] ctprun = new byte[6435*35*2];

	private static int[] pmv = {0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1,
						0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0};

	static void init() {
		Center2 c = new Center2();

		for (int i=0; i<35*2; i++) {
			for (int m=0; m<28; m++) {
				c.setrl(i);
				c.move(move2std[m]);
				rlmv[i][m] = c.getrl();
			}
		}

		for (int i=0; i<70; i++) {
			c.setrl(i);
			for (int j=0; j<16; j++) {
				rlrot[i][j] = c.getrl();
				c.rot(0);
				if (j%2==1) c.rot(1);
				if (j%8==7) c.rot(2);
			}
		}

		for (int i=0; i<6435; i++) {
			c.setct(i);
			for (int j=0; j<16; j++) {
				ctrot[i][j] = c.getct();
				c.rot(0);
				if (j%2==1) c.rot(1);
				if (j%8==7) c.rot(2);
			}
		}

		for (int i=0; i<6435; i++) {
			for (int m=0; m<28; m++) {
				c.setct(i);
				c.move(move2std[m]);
				ctmv[i][m] = (char)c.getct();
			}
		}
		Arrays.fill(ctprun, (byte)-1);

		ctprun[0] = ctprun[18] = ctprun[28] = ctprun[46] = ctprun[54] = ctprun[56] = 0;
		int depth = 0;
		int done = 6;
		while (done != 6435*35*2) {
			for (int i=0; i<6435*35*2; i++) {
				if (ctprun[i]==depth) {
					int ct = i / 70;
					int rl = i % 70;
					for (int m=0; m<23; m++) {
						int ctx = ctmv[ct][m];
						int rlx = rlmv[rl][m];
						int idx = ctx * 70 + rlx;
						if (ctprun[idx] == -1) {
							ctprun[idx] = (byte)(depth+1);
							done++;
						}
					}
				}
			}
			depth++;
//			System.out.println(String.format("%2d%10d", depth, done));
		}
	}

	Center2() {

	}

	Center2(CenterCube c) {
		this();
		for (int i=0; i<16; i++) {
			ct[i] = c.ct[i] / 2;
		}
		for (int i=0; i<8; i++) {
			rl[i] = c.ct[i+16];
		}
	}

	void set(CenterCube c, int edgeParity) {
		for (int i=0; i<16; i++) {
			ct[i] = c.ct[i] / 2;
		}
		for (int i=0; i<8; i++) {
			rl[i] = c.ct[i+16];
		}
		parity = edgeParity;
	}

	int getrl() {
		int idx = 0;
		int r = 4;
		for (int i=6; i>=0; i--) {
			if (rl[i] != rl[7]) {
				idx += Cnk[i][r--];
			}
		}
		return idx * 2 + parity;
	}

	void setrl(int idx) {
		parity = idx & 1;
		idx >>>= 1;
		int r = 4;
		rl[7] = 0;
		for (int i=6; i>=0; i--) {
			if (idx >= Cnk[i][r]) {
				idx -= Cnk[i][r--];
				rl[i] = 1;
			} else {
				rl[i] = 0;
			}
		}
	}

	int getct() {
		int idx = 0;
		int r = 8;
		for (int i=14; i>=0; i--) {
			if (ct[i] != ct[15]) {
				idx += Cnk[i][r--];
			}
		}
		return idx;
	}

	void setct(int idx) {
		int r = 8;
		ct[15] = 0;
		for (int i=14; i>=0; i--) {
			if (idx >= Cnk[i][r]) {
				idx -= Cnk[i][r--];
				ct[i] = 1;
			} else {
				ct[i] = 0;
			}
		}
	}

	void rot(int r) {
		switch (r) {
			case 0:
				move(ux2);
				move(dx2);
				break;
			case 1:
				move(rx1);
				move(lx3);
				break;
			case 2:
				swap(ct, 0, 3, 1, 2, 1);
				swap(ct, 8, 11, 9, 10, 1);
				swap(ct, 4, 7, 5, 6, 1);
				swap(ct, 12, 15, 13, 14, 1);
				swap(rl, 0, 3, 5, 6, 1);
				swap(rl, 1, 2, 4, 7, 1);
				break;
		}
	}


	void move(int m) {
		parity ^= pmv[m];
		int key = m % 3;
		m /= 3;
		switch (m) {
			case 0:		//U
				swap(ct, 0, 1, 2, 3, key);
				break;
			case 1:		//R
				swap(rl, 0, 1, 2, 3, key);
				break;
			case 2:		//F
				swap(ct, 8, 9, 10, 11, key);
				break;
			case 3:		//D
				swap(ct, 4, 5, 6, 7, key);
				break;
			case 4:		//L
				swap(rl, 4, 5, 6, 7, key);
				break;
			case 5:		//B
				swap(ct, 12, 13, 14, 15, key);
				break;
			case 6:		//u
				swap(ct, 0, 1, 2, 3, key);
				swap(rl, 0, 5, 4, 1, key);
				swap(ct, 8, 9, 12, 13, key);
				break;
			case 7:		//r
				swap(rl, 0, 1, 2, 3, key);
				swap(ct, 1, 15, 5, 9, key);
				swap(ct, 2, 12, 6, 10, key);
				break;
			case 8:		//f
				swap(ct, 8, 9, 10, 11, key);
				swap(rl, 0, 3, 6, 5, key);
				swap(ct, 3, 2, 5, 4, key);
				break;
			case 9:		//d
				swap(ct, 4, 5, 6, 7, key);
				swap(rl, 3, 2, 7, 6, key);
				swap(ct, 11, 10, 15, 14, key);
				break;
			case 10:	//l
				swap(rl, 4, 5, 6, 7, key);
				swap(ct, 0, 8, 4, 14, key);
				swap(ct, 3, 11, 7, 13, key);
				break;
			case 11:	//b
				swap(ct, 12, 13, 14, 15, key);
				swap(rl, 1, 4, 7, 2, key);
				swap(ct, 1, 0, 7, 6, key);
				break;
		}
	}
}
