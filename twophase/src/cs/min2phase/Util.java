package cs.min2phase;

final class Util {
	//Edges
	final static byte UR = 0;
	final static byte UF = 1;
	final static byte UL = 2;
	final static byte UB = 3;
	final static byte DR = 4;
	final static byte DF = 5;
	final static byte DL = 6;
	final static byte DB = 7;
	final static byte FR = 8;
	final static byte FL = 9;
	final static byte BL = 10;
	final static byte BR = 11;
	
	//Corners
	final static byte URF = 0;
	final static byte UFL = 1;
	final static byte ULB = 2;
	final static byte UBR = 3;
	final static byte DFR = 4;
	final static byte DLF = 5;
	final static byte DBL = 6;
	final static byte DRB = 7;
	
	//Moves
	final static byte Ux1 = 0;
	final static byte Ux2 = 1;
	final static byte Ux3 = 2;
	final static byte Rx1 = 3;
	final static byte Rx2 = 4;
	final static byte Rx3 = 5;
	final static byte Fx1 = 6;
	final static byte Fx2 = 7;
	final static byte Fx3 = 8;
	final static byte Dx1 = 9;
	final static byte Dx2 = 10;
	final static byte Dx3 = 11;
	final static byte Lx1 = 12;
	final static byte Lx2 = 13;
	final static byte Lx3 = 14;
	final static byte Bx1 = 15;
	final static byte Bx2 = 16;
	final static byte Bx3 = 17;
	
	//Facelets
	final static byte U1 = 0;
	final static byte U2 = 1;
	final static byte U3 = 2;
	final static byte U4 = 3;
	final static byte U5 = 4;
	final static byte U6 = 5;
	final static byte U7 = 6;
	final static byte U8 = 7;
	final static byte U9 = 8;
	final static byte R1 = 9;
	final static byte R2 = 10;
	final static byte R3 = 11;
	final static byte R4 = 12;
	final static byte R5 = 13;
	final static byte R6 = 14;
	final static byte R7 = 15;
	final static byte R8 = 16;
	final static byte R9 = 17;
	final static byte F1 = 18;
	final static byte F2 = 19;
	final static byte F3 = 20;
	final static byte F4 = 21;
	final static byte F5 = 22;
	final static byte F6 = 23;
	final static byte F7 = 24;
	final static byte F8 = 25;
	final static byte F9 = 26;
	final static byte D1 = 27;
	final static byte D2 = 28;
	final static byte D3 = 29;
	final static byte D4 = 30;
	final static byte D5 = 31;
	final static byte D6 = 32;
	final static byte D7 = 33;
	final static byte D8 = 34;
	final static byte D9 = 35;
	final static byte L1 = 36;
	final static byte L2 = 37;
	final static byte L3 = 38;
	final static byte L4 = 39;
	final static byte L5 = 40;
	final static byte L6 = 41;
	final static byte L7 = 42;
	final static byte L8 = 43;
	final static byte L9 = 44;
	final static byte B1 = 45;
	final static byte B2 = 46;
	final static byte B3 = 47;
	final static byte B4 = 48;
	final static byte B5 = 49;
	final static byte B6 = 50;
	final static byte B7 = 51;
	final static byte B8 = 52;
	final static byte B9 = 53;
	
	//Colors
	final static byte U = 0;
	final static byte R = 1;
	final static byte F = 2;
	final static byte D = 3;
	final static byte L = 4;
	final static byte B = 5;
	
	final static byte[][] cornerFacelet = { { U9, R1, F3 }, { U7, F1, L3 }, { U1, L1, B3 }, { U3, B1, R3 },
			{ D3, F9, R7 }, { D1, L9, F7 }, { D7, B9, L7 }, { D9, R9, B7 } };
	final static byte[][] edgeFacelet = { { U6, R2 }, { U8, F2 }, { U4, L2 }, { U2, B2 }, { D6, R8 }, { D2, F8 },
			{ D4, L8 }, { D8, B8 }, { F6, R4 }, { F4, L6 }, { B6, L4 }, { B4, R6 } };
	final static byte[][] cornerColor = { { U, R, F }, { U, F, L }, { U, L, B }, { U, B, R }, { D, F, R }, { D, L, F },
			{ D, B, L }, { D, R, B } };
	final static byte[][] edgeColor = { { U, R }, { U, F }, { U, L }, { U, B }, { D, R }, { D, F }, { D, L }, { D, B },
			{ F, R }, { F, L }, { B, L }, { B, R } };

	static CubieCube toCubieCube(byte[] f) {
		byte ori;
		CubieCube ccRet = new CubieCube();
		for (int i = 0; i < 8; i++)
			ccRet.cp[i] = URF;// invalidate corners
		for (int i = 0; i < 12; i++)
			ccRet.ep[i] = UR;// and edges
		byte col1, col2;
		for (byte i=0; i<8; i++) {
			// get the colors of the cubie at corner i, starting with U/D
			for (ori = 0; ori < 3; ori++)
				if (f[cornerFacelet[i][ori]] == U || f[cornerFacelet[i][ori]] == D)
					break;
			col1 = f[cornerFacelet[i][(ori + 1) % 3]];
			col2 = f[cornerFacelet[i][(ori + 2) % 3]];

			for (byte j=0; j<8; j++) {
				if (col1 == cornerColor[j][1] && col2 == cornerColor[j][2]) {
					// in cornerposition i we have cornercubie j
					ccRet.cp[i] = j;
					ccRet.co[i] = (byte) (ori % 3);
					break;
				}
			}
		}
		for (byte i=0; i<12; i++) {
			for (byte j=0; j<12; j++) {
				if (f[edgeFacelet[i][0]] == edgeColor[j][0]
						&& f[edgeFacelet[i][1]] == edgeColor[j][1]) {
					ccRet.ep[i] = j;
					ccRet.eo[i] = 0;
					break;
				}
				if (f[edgeFacelet[i][0]] == edgeColor[j][1]
						&& f[edgeFacelet[i][1]] == edgeColor[j][0]) {
					ccRet.ep[i] = j;
					ccRet.eo[i] = 1;
					break;
				}
			}
		}
		return ccRet;
	}

	static String toFaceCube(CubieCube cc) {
		char[] f = new char[54];
		char[] ts = {'U', 'R', 'F', 'D', 'L', 'B'};
		for (char i=0; i<54; i++) {
			f[i] = ts[i/9];
		}
		for (byte c=0; c<8; c++) {
			byte i = c;
			byte j = cc.cp[i];// cornercubie with index j is at
			// cornerposition with index i
			byte ori = cc.co[i];// Orientation of this cubie
			for (byte n=0; n<3; n++)
				f[cornerFacelet[i][(n + ori) % 3]] = ts[cornerColor[j][n]];
		}
		for (byte e=0; e<12; e++) {
			byte i = e;
			byte j = cc.ep[i];// edgecubie with index j is at edgeposition
			// with index i
			byte ori = cc.eo[i];// Orientation of this cubie
			for (byte n=0; n<2; n++)
				f[edgeFacelet[i][(n + ori) % 2]] = ts[edgeColor[j][n]];
		}
		return new String(f);
	}
	
	final static int bitCount(int i) {
		i = i - ((i >>> 1) & 0x55555555);
		i = (i & 0x33333333) + ((i >>> 2) & 0x33333333);
		return (i + (i >>> 8) + (i >>> 4)) & 0x0f;
	}
/*	
	final static int bitCount8(int i) {
		i = i - ((i >>> 1) & 0x55555555);
		i = (i & 0x33333333) + ((i >>> 2) & 0x33333333);
		return (i + (i >>> 4)) & 0x0f;
	}
*/	
	final static byte bitOdd(char i) {
		i ^= i >>> 1;
		i ^= i >>> 2;
		i ^= i >>> 4;
		i ^= i >>> 8;
		return (byte) (i & 1);
	}
	
    static int numberOfTrailingZeros(char i) {
		char y;
		int n = 15;
		y = (char)(i << 8); if (y != 0) { n -= 8; i = y; }
		y = (char)(i << 4); if (y != 0) { n -= 4; i = y; }
		y = (char)(i << 2); if (y != 0) { n -= 2; i = y; }
		return n - ((i>>>14)&1);
    }
	
	final static char binarySearch(char[] arr, char key) {
		int length = arr.length;
		if (key <= arr[length-1]) {
			int l = 0;
			int r = length-1;
			while (l <= r) {
				int mid = (l+r)>>>1;
				char val = arr[mid];
				if (key > val) {
					l = mid + 1;
				} else if (key < val) {
					r = mid - 1;
				} else {
					return (char) (mid);
				}
			}
		}
		return 0xffff;
	}
	
	static byte get4Parity(byte idx) {
		byte p = 0;
		for (int i=2; i>=0; i--) {
			p += idx % (4-i);
			idx /= (4-i);
		}
		p &= 1;
		return p;
	}
	
	static byte get8Parity(char idx) {
		byte p = 0;
		for (int i=6; i>=0; i--) {
			p += idx % (8-i);
			idx /= 8-i;
		}
		p &= 1;
		return p;
	}
	
	static byte get12Parity(int idx) {
		byte p = 0;
		for (int i=10; i>=0; i--) {
			p += idx % (12-i);
			idx /= 12-i;
		}
		p &= 1;
		return p;
	}
	
	static char[][] Cnk = new char[12][12];
	static int[] fact = {1, 1, 2, 6, 24, 120, 720, 5040, 40320, 362880, 3628800, 39916800, 479001600};
	static String[] move2str = {"U", "U2", "U'", "R", "R2", "R'", "F", "F2", "F'", 
								"D", "D2", "D'", "L", "L2", "L'", "B", "B2", "B'"};
	static byte[] ud2std = {Ux1, Ux2, Ux3, Rx2, Fx2, Dx1, Dx2, Dx3, Lx2, Bx2};
	static byte[] std2ud = new byte[18];
	
	static boolean[][] ckmv = new boolean[19][18];
	static boolean[][] ckmv2 = new boolean[11][10];
	static byte[] parity4 = new byte[24];
	
	static byte[][] perm3 = {{11, 10, 9}, {10, 11, 9}, {11, 9, 10}, {9, 11, 10}, {10, 9, 11}, {9, 10, 11}};
	
	static {
		for (byte i=0; i<10; i++) {
			std2ud[ud2std[i]] = i;
		}
		for (byte i=0; i<18; i++) {
			for (byte j=0; j<18; j++) {
				ckmv[i][j] = (i/3 == j/3) || ((i/3%3 == j/3%3) && (i>=j));
			}
			ckmv[18][i] = false;
		}
		for (byte i=0; i<10; i++) {
			for (byte j=0; j<10; j++) {
				ckmv2[i][j] = ckmv[ud2std[i]][ud2std[j]];
			}
			ckmv2[10][i] = false;
		}
		for (byte i=0; i<12; i++) {
			Cnk[i][0] = 1;
			Cnk[i][i] = 1;
			for (byte j=1; j<i; j++) {
				Cnk[i][j] = (char) (Cnk[i-1][j-1] + Cnk[i-1][j]);
			}
		}
		for (byte i=0; i<24; i++) {
			parity4[i] = get4Parity(i);
		}
	}
}
