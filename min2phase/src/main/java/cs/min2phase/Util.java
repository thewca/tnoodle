package cs.min2phase;

class Util {
	//Moves
	static final byte Ux1 = 0;
	static final byte Ux2 = 1;
	static final byte Ux3 = 2;
	static final byte Rx1 = 3;
	static final byte Rx2 = 4;
	static final byte Rx3 = 5;
	static final byte Fx1 = 6;
	static final byte Fx2 = 7;
	static final byte Fx3 = 8;
	static final byte Dx1 = 9;
	static final byte Dx2 = 10;
	static final byte Dx3 = 11;
	static final byte Lx1 = 12;
	static final byte Lx2 = 13;
	static final byte Lx3 = 14;
	static final byte Bx1 = 15;
	static final byte Bx2 = 16;
	static final byte Bx3 = 17;

	//Facelets
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

	//Colors
	static final byte U = 0;
	static final byte R = 1;
	static final byte F = 2;
	static final byte D = 3;
	static final byte L = 4;
	static final byte B = 5;

	static final byte[][] cornerFacelet = {
		{ U9, R1, F3 }, { U7, F1, L3 }, { U1, L1, B3 }, { U3, B1, R3 },
		{ D3, F9, R7 }, { D1, L9, F7 }, { D7, B9, L7 }, { D9, R9, B7 }
	};
	static final byte[][] edgeFacelet = {
		{ U6, R2 }, { U8, F2 }, { U4, L2 }, { U2, B2 }, { D6, R8 }, { D2, F8 },
		{ D4, L8 }, { D8, B8 }, { F6, R4 }, { F4, L6 }, { B6, L4 }, { B4, R6 }
	};

	static int[][] Cnk = new int[13][13];
	static String[] move2str = {
		"U ", "U2", "U'", "R ", "R2", "R'", "F ", "F2", "F'",
		"D ", "D2", "D'", "L ", "L2", "L'", "B ", "B2", "B'"
	};
	static int[] ud2std = {Ux1, Ux2, Ux3, Rx2, Fx2, Dx1, Dx2, Dx3, Lx2, Bx2, Rx1, Rx3, Fx1, Fx3, Lx1, Lx3, Bx1, Bx3};
	static int[] std2ud = new int[18];
	static int[] ckmv2bit = new int[11];

	static void toCubieCube(byte[] f, CubieCube ccRet) {
		byte ori;
		for (int i = 0; i < 8; i++)
			ccRet.ca[i] = 0;// invalidate corners
		for (int i = 0; i < 12; i++)
			ccRet.ea[i] = 0;// and edges
		byte col1, col2;
		for (byte i = 0; i < 8; i++) {
			// get the colors of the cubie at corner i, starting with U/D
			for (ori = 0; ori < 3; ori++)
				if (f[cornerFacelet[i][ori]] == U || f[cornerFacelet[i][ori]] == D)
					break;
			col1 = f[cornerFacelet[i][(ori + 1) % 3]];
			col2 = f[cornerFacelet[i][(ori + 2) % 3]];

			for (byte j = 0; j < 8; j++) {
				if (col1 == cornerFacelet[j][1] / 9 && col2 == cornerFacelet[j][2] / 9) {
					// in cornerposition i we have cornercubie j
					ccRet.ca[i] = (byte) (ori % 3 << 3 | j);
					break;
				}
			}
		}
		for (byte i = 0; i < 12; i++) {
			for (byte j = 0; j < 12; j++) {
				if (f[edgeFacelet[i][0]] == edgeFacelet[j][0] / 9
				        && f[edgeFacelet[i][1]] == edgeFacelet[j][1] / 9) {
					ccRet.ea[i] = (byte) (j << 1);
					break;
				}
				if (f[edgeFacelet[i][0]] == edgeFacelet[j][1] / 9
				        && f[edgeFacelet[i][1]] == edgeFacelet[j][0] / 9) {
					ccRet.ea[i] = (byte) (j << 1 | 1);
					break;
				}
			}
		}
	}

	static String toFaceCube(CubieCube cc) {
		char[] f = new char[54];
		char[] ts = {'U', 'R', 'F', 'D', 'L', 'B'};
		for (int i = 0; i < 54; i++) {
			f[i] = ts[i / 9];
		}
		for (byte c = 0; c < 8; c++) {
			int j = cc.ca[c] & 0x7;// cornercubie with index j is at
			// cornerposition with index c
			int ori = cc.ca[c] >> 3;// Orientation of this cubie
			for (byte n = 0; n < 3; n++)
				f[cornerFacelet[c][(n + ori) % 3]] = ts[cornerFacelet[j][n] / 9];
		}
		for (byte e = 0; e < 12; e++) {
			int j = cc.ea[e] >> 1;// edgecubie with index j is at edgeposition
			// with index e
			int ori = cc.ea[e] & 1;// Orientation of this cubie
			for (byte n = 0; n < 2; n++)
				f[edgeFacelet[e][(n + ori) % 2]] = ts[edgeFacelet[j][n] / 9];
		}
		return new String(f);
	}

	static int getNParity(int idx, int n) {
		int p = 0;
		for (int i = n - 2; i >= 0; i--) {
			p ^= idx % (n - i);
			idx /= (n - i);
		}
		return p & 1;
	}

	static byte setVal(int val0, int val, boolean isEdge) {
		return (byte) (isEdge ? (val << 1 | val0 & 1) : (val | val0 & 0xf8));
	}

	static int getVal(int val0, boolean isEdge) {
		return isEdge ? val0 >> 1 : val0 & 7;
	}

	static void setNPerm(byte[] arr, int idx, int n, boolean isEdge) {
		long val = 0xFEDCBA9876543210L;
		long extract = 0;
		for (int p = 2; p <= n; p++) {
			extract = extract << 4 | idx % p;
			idx /= p;
		}
		for (int i = 0; i < n - 1; i++) {
			int v = ((int) extract & 0xf) << 2;
			extract >>= 4;
			arr[i] = setVal(arr[i], (int) (val >> v & 0xf), isEdge);
			long m = (1L << v) - 1;
			val = val & m | val >> 4 & ~m;
		}
		arr[n - 1] = setVal(arr[n - 1], (int) (val & 0xf), isEdge);
	}

	static int getNPerm(byte[] arr, int n, boolean isEdge) {
		int idx = 0;
		long val = 0xFEDCBA9876543210L;
		for (int i = 0; i < n - 1; i++) {
			int v = getVal(arr[i], isEdge) << 2;
			idx = (n - i) * idx + (int) (val >> v & 0xf);
			val -= 0x1111111111111110L << v;
		}
		return idx;
	}

	static int getComb(byte[] arr, int mask, boolean isEdge) {
		int end = arr.length - 1;
		int idxC = 0, r = 4;
		for (int i = end; i >= 0; i--) {
			int perm = getVal(arr[i], isEdge);
			if ((perm & 0xc) == mask) {
				idxC += Cnk[i][r--];
			}
		}
		return idxC;
	}

	static void setComb(byte[] arr, int idxC, int mask, boolean isEdge) {
		int end = arr.length - 1;
		int r = 4, fill = end;
		for (int i = end; i >= 0; i--) {
			if (idxC >= Cnk[i][r]) {
				idxC -= Cnk[i][r--];
				arr[i] = setVal(arr[i], r | mask, isEdge);
			} else {
				if ((fill & 0xc) == mask) {
					fill -= 4;
				}
				arr[i] = setVal(arr[i], fill--, isEdge);
			}
		}
	}

	static {
		for (int i = 0; i < 18; i++) {
			std2ud[ud2std[i]] = i;
		}
		for (int i = 0; i < 10; i++) {
			int ix = ud2std[i] / 3;
			ckmv2bit[i] = 0;
			for (int j = 0; j < 10; j++) {
				int jx = ud2std[j] / 3;
				ckmv2bit[i] |= ((ix == jx) || ((ix % 3 == jx % 3) && (ix >= jx)) ? 1 : 0) << j;
			}
		}
		ckmv2bit[10] = 0;
		for (int i = 0; i < 13; i++) {
			Cnk[i][0] = Cnk[i][i] = 1;
			for (int j = 1; j < i; j++) {
				Cnk[i][j] = Cnk[i - 1][j - 1] + Cnk[i - 1][j];
			}
		}
	}
}
