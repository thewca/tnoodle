package cs.min2phase;

class CubieCube {

	private static CubieCube temp = new CubieCube();
	static CubieCube[] CubeSym = new CubieCube[16];

	static CubieCube[] moveCube;
									
	static byte[] SymInv = new byte[16];
	static byte[][] SymMult = new byte[16][16];
	static byte[][] SymMove = new byte[16][18];
	static byte[][] Sym8Mult = new byte[8][8];
	static byte[][] Sym8Move = new byte[8][18];
//	static byte[] Sym8Inv = new byte[8];
	static byte[][] Sym8MultInv = new byte[8][8];
	static byte[][] SymMoveUD = new byte[16][10];	
	
	static char[] FlipS2R = new char[336];
	static char[] TwistS2R = new char[324];
	static char[] CPermS2R = new char[2768];
	static char[] EPermS2R = CPermS2R;

	static char[] MtoEPerm = new char[40320];
	static byte[][] merge = new byte[56][56];
	
	static char[] FlipR2S;// = new char[2048];
	static char[] TwistR2S;// = new char[2187];
	static char[] EPermR2S;// = new char[40320];
	static byte[] e2c = {0, 0, 0, 0, 1, 3, 1, 3, 1, 3, 1, 3, 0, 0, 0, 0};
	
	static CubieCube urf1 = new CubieCube(2531, 1373, 67026819, 1877);
	static CubieCube urf2 = new CubieCube(2089, 1906, 322752913, 255);
	static byte[][] urfMove = new byte[][] {{0, 1, 2, 3, 4, 5, 6, 7, 8, 9,10,11,12,13,14,15,16,17}, 
											{6, 7, 8, 0, 1, 2, 3, 4, 5,15,16,17, 9,10,11,12,13,14},
											{3, 4, 5, 6, 7, 8, 0, 1, 2,12,13,14,15,16,17, 9,10,11},
											{2, 1, 0, 5, 4, 3, 8, 7, 6,11,10, 9,14,13,12,17,16,15}, 
											{8, 7, 6, 2, 1, 0, 5, 4, 3,17,16,15,11,10, 9,14,13,12},
											{5, 4, 3, 8, 7, 6, 2, 1, 0,14,13,12,17,16,15,11,10, 9}};
	
	CubieCube() {
	}
	
	CubieCube(byte[] cp, byte[] co, byte[] ep, byte[] eo) {
		for (byte i = 0; i < 8; i++) {
			this.cp[i] = cp[i];
			this.co[i] = co[i];
		}
		for (byte i = 0; i < 12; i++) {
			this.ep[i] = ep[i];
			this.eo[i] = eo[i];
		}
	}
	
	CubieCube(int cperm, int twist, int eperm, int flip) {
		set8Perm(cp, (char)cperm);
		this.setTwist((char)twist);
		this.setEdgePerm(eperm);
		this.setFlip((char)flip);
	}
	
	CubieCube(CubieCube c) {
		this(c.cp, c.co, c.ep, c.eo);
	}
	
	void copy(CubieCube c) {
		for (byte i = 0; i < 8; i++) {
			this.cp[i] = c.cp[i];
			this.co[i] = c.co[i];
		}
		for (byte i = 0; i < 12; i++) {
			this.ep[i] = c.ep[i];
			this.eo[i] = c.eo[i];
		}	
	}
	
	void invCubieCube() {
		for (byte edge=0; edge<12; edge++)
			temps.ep[ep[edge]] = edge;
		for (byte edge=0; edge<12; edge++)
			temps.eo[edge] = eo[temps.ep[edge]];
		for (byte corn=0; corn<8; corn++)
			temps.cp[cp[corn]] = corn;
		for (byte corn=0; corn<8; corn++) {
			byte ori = co[temps.cp[corn]];
			temps.co[corn] = (byte) -ori;
			if (temps.co[corn] < 0)
				temps.co[corn] += 3;
		}
		copy(temps);
	}
	
	byte[] cp = {0, 1, 2, 3, 4, 5, 6, 7};
	byte[] co = {0, 0, 0, 0, 0, 0, 0, 0};
	byte[] ep = {0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11};
	byte[] eo = {0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0};
	CubieCube temps = null;//new CubieCube();
	
	char getFlip() {
		char idx = 0;
		for (byte i=0; i<11; i++) {
			idx |= eo[i] << i;
		}
		return idx;
	}
	
	char getFlipSym() {
		if (FlipR2S != null) {
			return FlipR2S[getFlip()];
		}
		for (char k=0; k<16; k+=2) {
			EdgeConjugate(this, SymInv[k], temps);
			char idx = Util.binarySearch(FlipS2R, temps.getFlip());
			if (idx != 0xffff) {
				return (char) ((idx << 3) | (k >>> 1));
			}
		}
		return 0;
	}
	
	void setFlip(char idx) {
		eo[11] = Util.bitOdd(idx);
		for (byte i=0; i<11; i++) {
			eo[i] = (byte) (idx & 1);
			idx >>>= 1;
		}
	}
	
	char getTwist() {
		char idx = 0;
		for (byte i=0; i<7; i++) {
			idx *= 3;
			idx += co[i];
		}
		return idx;
	}
	
	char getTwistSym() {
		if (TwistR2S != null) {
			return TwistR2S[getTwist()];
		}
		for (char k=0; k<16; k+=2) {
			CornConjugate(this, SymInv[k], temps);
			char idx = temps.getTwist();
			idx = Util.binarySearch(TwistS2R, idx);
			if (idx != 0xffff) {
				return (char) ((idx << 3) | (k >>> 1));
			}
		}
		return 0;
	}
	
	void setTwist(char idx) {
		char twst = 0;
		for (byte i=6; i>=0; i--) {
			twst += co[i] = (byte) (idx % 3);
			idx /= 3;
		}
		co[7] = (byte) ((15 - twst) % 3);
	}
	
	char getUDSlice() {
		char idx = 0;
		byte r = 4;
		for (byte i=0; i<12; i++) {
			if (ep[i] >= 8) {
				idx += Util.Cnk[11-i][r--];
			}
		}
		return idx;
	}
	
	void setUDSlice(char idx) {
		byte r = 4;
		for (byte i=0; i<12; i++) {
			if (idx >= Util.Cnk[11-i][r]) {
				idx -= Util.Cnk[11-i][r--];
				ep[i] = (byte) (11-r);
			} else {
				ep[i] = (byte) (i+r-4);
			}
		}
	}

	char getCPermSym() {
		if (EPermR2S != null) {
			char idx = EPermR2S[get8Perm(cp)];
			idx ^= e2c[idx&0x0f];
			return idx;
		}
		for (byte k=0; k<16; k++) {
			CornConjugate(this, SymInv[k], temps);
			char idx = Util.binarySearch(CPermS2R, get8Perm(temps.cp));
			if (idx != 0xffff) {
				return (char) ((idx << 4) | k);
			}
		}
		return 0;
	}	

	char getEPermSym() {
		if (EPermR2S != null) {
			return EPermR2S[get8Perm(ep)];
		}
		for (byte k=0; k<16; k++) {
			EdgeConjugate(this, SymInv[k], temps);
			char idx = Util.binarySearch(EPermS2R, get8Perm(temps.ep));
			if (idx != 0xffff) {
				return (char) ((idx << 4) | k);
			}
		}
		return 0;
	}	

	byte getMPerm() {
		int m = (1 << ep[11]);		
		int idx = 0;
		for (int i=10; i>=8; --i) {
			int t = 1 << ep[i];
			idx += Util.bitCount(m & (t - 1)) * Util.fact[11-i];
			m |= t;
		}
		return (byte)idx;
	}	
	
	void setMPerm(byte idx) {
		ep[11] = 8;
		for (int i=10; i>=8; i--) {
			ep[i] = (byte) (idx % (12-i) + 8);
			idx /= (12-i);
			for (int j=i+1; j<12; j++) {
				if (ep[j] >= ep[i])
					ep[j]++;
			}
		}	
	}
	
	char getMid3() {
		char idxA = 0;
		char idxB = 0;
		char mask = 0;
		byte r = 3;
		for (byte i=11; i>=0; i--) {
			if (ep[i] >= 9) {
				idxA += Util.Cnk[i][r--];
				int t = 1 << ep[i];
				idxB += Util.bitCount(mask & (t - 1)) * Util.fact[2-r];
				mask |= t;
			}
		}
		return (char) (idxA * 6 + idxB);
	}
	
	void setMid3(char idxA) {
		byte[] edge = Util.perm3[idxA % 6];
		idxA /= 6;
		byte r = 3;
		for (byte i=11; i>=0; i--) {
			if (idxA >= Util.Cnk[i][r]) {
				idxA -= Util.Cnk[i][r--];
				ep[i] = edge[2-r];
			} else {
				ep[i] = (byte) (8-i+r);
			}
		}	
	}
	
	char getURtoUL() {
		char idxA = 0;
		char idxB = 0;
		char mask = 0;
		byte r = 3;
		for (byte i=11; i>=0; i--) {
			if (ep[i] <= 2) {
				idxA += Util.Cnk[i][r--];
				int t = 1 << ep[i];
				idxB += Util.bitCount(mask & (t - 1)) * Util.fact[2-r];
				mask |= t;
			}
		}
		return (char) (idxA * 6 + idxB);	
	}

	char getDRtoDL() {
		char idxA = 0;
		char idxB = 0;
		char mask = 0;
		byte r = 3;
		for (byte i=11; i>=0; i--) {
			if (4 <= ep[i] && ep[i] <= 6) {
				idxA += Util.Cnk[i][r--];
				int t = 1 << ep[i];
				idxB += Util.bitCount(mask & (t - 1)) * Util.fact[2-r];
				mask |= t;
			}
		}
		return (char) (idxA * 6 + idxB);	
	}
	
	void setEdgePerm(int idx) {
		ep[11] = 0;
		for (int i=10; i>=0; i--) {
			ep[i] = (byte) (idx % (12-i));
			idx /= (12-i);
			for (int j=i+1; j<12; j++) {
				if (ep[j] >= ep[i])
					ep[j]++;
			}
		}			
	}
	
	int getEdgePerm() {
		int m = (1 << ep[11]);		
		int idx = 0;
		for (int i=10; i>=0; --i) {
			int t = 1 << ep[i];
			idx += Util.bitCount(m & (t - 1)) * Util.fact[11-i];
			m |= t;
		}
		return idx;		
	}
	
	final static void set8Perm(byte[] arr, char idx) {
		int val = 0x76543210;
		for (int i=0; i<7; i++) {
			int p = Util.fact[7-i];
			int v = idx / p;
			idx -= v*p;
			v <<= 2;
			arr[i] = (byte) ((val >> v) & 07);
			int m = (1 << v) - 1;
			val = (val & m) + ((val >> 4) & ~m);
		}
		arr[7] = (byte)val;
	}
	
	final static char get8Perm(byte[] arr) {
		int idx = 0;
		int val = 0x76543210;
		for (int i=0; i<7; i++) {
			int v = arr[i] << 2;
			idx = (8 - i) * idx + ((val >> v) & 07);
			val -= 0x11111110 << v;
		}
		return (char)idx;	
	}
	
	// Check a cubiecube for solvability. Return the error code.
	// 0: Cube is solvable
	// -2: Not all 12 edges exist exactly once
	// -3: Flip error: One edge has to be flipped
	// -4: Not all corners exist exactly once
	// -5: Twist error: One corner has to be twisted
	// -6: Parity error: Two corners ore two edges have to be exchanged
	int verify() {
		byte sum = 0;
		char edgeMask = 0;
		for (byte e=0; e<12; e++)
			edgeMask |= (1 << ep[e]);
		if (edgeMask != 0x0fff)
			return -2;// missing edges
		for (byte i=0; i<12; i++)
			sum ^= eo[i];
		if (sum % 2 != 0)
			return -3;
		char cornMask = 0;
		for (byte c=0; c<8; c++)
			cornMask |= (1 << cp[c]);
		if (cornMask != 0x00ff)		
			return -4;// missing corners
		sum = 0;
		for (byte i=0; i<8; i++)
			sum += co[i];
		if (sum % 3 != 0)
			return -5;// twisted corner
		if ((Util.get12Parity(getEdgePerm()) ^ Util.get8Parity(get8Perm(cp))) != 0)
			return -6;// parity error
		return 0;// cube ok
	}	

	static void CornMult(CubieCube a, CubieCube b, CubieCube prod) {
		for (byte corn=0; corn<8; corn++) {
			prod.cp[corn] = a.cp[b.cp[corn]];
			prod.co[corn] = (byte) ((a.co[b.cp[corn]] + b.co[corn]) % 3);
		}
	}	
	
	static void CornMultSym(CubieCube a, CubieCube b, CubieCube prod) {
		for (byte corn=0; corn<8; corn++) {
			prod.cp[corn] = a.cp[b.cp[corn]];
			byte oriA = a.co[b.cp[corn]];
			byte oriB = b.co[corn];
			byte ori = oriA;
			ori += (oriA<3) ? oriB : 3-oriB;
			ori %= 3;
			if (oriA < 3 ^ oriB < 3) {
				ori += 3;
			}
			prod.co[corn] = ori;
		}
	}	
	
	static void EdgeMult(CubieCube a, CubieCube b, CubieCube prod) {
		for (byte ed=0; ed<12; ed++) {
			prod.ep[ed] = a.ep[b.ep[ed]];
			prod.eo[ed] = (byte) (b.eo[ed] ^ a.eo[b.ep[ed]]);
		}
	}
	
	static synchronized void CornConjugate(CubieCube a, int idx, CubieCube b) {
		CornMultSym(CubeSym[SymInv[idx]], a, temp);
		CornMultSym(temp, CubeSym[idx], b);		
	}
	
	static synchronized void EdgeConjugate(CubieCube a, int idx, CubieCube b) {
		EdgeMult(CubeSym[SymInv[idx]], a, temp);
		EdgeMult(temp, CubeSym[idx], b);		
	}
	
	void URFConjugate() {
		CornMult(urf2, this, temps);
		CornMult(temps, urf1, this);		
		EdgeMult(urf2, this, temps);
		EdgeMult(temps, urf1, this);		    		
	}
	
	static void initMove() {
		CubieCube[] mc = new CubieCube[18];
		moveCube = new CubieCube[] {new CubieCube(15120, 0, 119750400, 0), 
									new CubieCube(21021, 1494, 323403417, 0), 
									new CubieCube(8064, 1236, 29441808, 802), 
									new CubieCube(9, 0, 5880, 0), 
									new CubieCube(1230, 412, 2949660, 0), 
									new CubieCube(224, 137, 328552, 1160)};
		for (byte m=0; m<6; m++) {
			mc[m*3] = moveCube[m];
			for (byte p=0; p<2; p++) {
				mc[m*3+p+1] = new CubieCube();
				EdgeMult(mc[m*3+p], moveCube[m], mc[m*3+p+1]);
				CornMult(mc[m*3+p], moveCube[m], mc[m*3+p+1]);
			}
		}
		moveCube = mc;	
	}
	
	static void initSym() {
		CubieCube c = new CubieCube();
		CubieCube d = new CubieCube();
		CubieCube temp;
		
		CubieCube f2 = new CubieCube(28783, 0, 259268407, 0);
		CubieCube u4 = new CubieCube(15138, 0, 119765538, 1792);
		CubieCube lr2 = new CubieCube(5167, 0, 83473207, 0);
		lr2.co = new byte[] { 3, 3, 3, 3, 3, 3, 3, 3 };

		for (byte i=0; i<16; i++) {
			CubeSym[i] = new CubieCube(c);
			CornMultSym(c, u4, d);
			EdgeMult(c, u4, d);
			temp = d;	d = c;	c = temp;
			if (i % 4 == 3) {
				CornMultSym(c, lr2, d);
				EdgeMult(c, lr2, d);
				temp = d;	d = c;	c = temp;				
			}
			if (i % 8 == 7) {
				CornMultSym(c, f2, d);
				EdgeMult(c, f2, d);
				temp = d;	d = c;	c = temp;
			}
		}
		for (byte j=0; j<16; j++) {
			for (byte k=0; k<16; k++) {
				CornMultSym(CubeSym[j], CubeSym[k], c);
				if (c.cp[0] == 0 && c.cp[1] == 1 && c.cp[2] == 2) {
					SymInv[j] = k;
					break;
				}
			}
		}
		for (byte i=0; i<16; i++) {
			for (byte j=0; j<16; j++) {
				CornMultSym(CubeSym[i], CubeSym[j], c);
				for (byte k=0; k<16; k++) {
					if (CubeSym[k].cp[0] == c.cp[0] && CubeSym[k].cp[1] == c.cp[1] && CubeSym[k].cp[2] == c.cp[2]) {
						SymMult[i][j] = k;
						break;
					}
				}
			}
		}
		for (byte j=0; j<18; j++) {
			for (byte s=0; s<16; s++) {
				CornConjugate(moveCube[j], SymInv[s], c);
				CONTINUE:
				for (byte m=0; m<18; m++) {
					for (byte i=0; i<8; i++) {
						if (c.cp[i] != moveCube[m].cp[i] || c.co[i] != moveCube[m].co[i]) {
							continue CONTINUE;
						}
					}
					SymMove[s][j] = m;
				}
			}
		}
		for (byte j=0; j<10; j++) {
			for (byte s=0; s<16; s++) {
				SymMoveUD[s][j] = Util.std2ud[SymMove[s][Util.ud2std[j]]];
			}
		}
		for (byte j=0; j<8; j++) {
			for (byte s=0; s<8; s++) {
				Sym8Mult[s][j] = (byte) (SymMult[s<<1][j<<1]>>>1);
			}
		}
		for (byte j=0; j<18; j++) {
			for (byte s=0; s<8; s++) {
				Sym8Move[s][j] = SymMove[s<<1][j];
			}
		}
		for (byte j=0; j<8; j++) {
			for (byte s=0; s<8; s++) {
				Sym8MultInv[j][s] = Sym8Mult[j][SymInv[s<<1]>>1];
			}
		}
	}

	static void initSym2Raw() {
		CubieCube c = new CubieCube();
		CubieCube d = new CubieCube();
		int[] occ = new int[40320 / 32];
		char count = 0;
		for (char i=0; i<2048/32; occ[i++] = 0);
		for (char i=0; i<2048; i++) {
			if ((occ[i>>>5]&(1<<(i&0x1f))) == 0) {
				c.setFlip(i);
				for (byte s=0; s<16; s+=2) {
					EdgeConjugate(c, s, d);
					char idx = d.getFlip();
					occ[idx>>>5] |= 1<<(idx&0x1f);
					FlipR2S[idx] = (char) ((count << 3) | (s >>> 1));
				}
				FlipS2R[count++] = i;
			}
		}
		count = 0;
		for (char i=0; i<2187/32+1; occ[i++] = 0);
		for (char i=0; i<2187; i++) {
			if ((occ[i>>>5]&(1<<(i&0x1f))) == 0) {
				c.setTwist(i);
				for (byte s=0; s<16; s+=2) {
					CornConjugate(c, s, d);
					char idx = d.getTwist();
					occ[idx>>>5] |= 1<<(idx&0x1f);
					TwistR2S[idx] = (char) ((count << 3) | (s >>> 1));
				}
				TwistS2R[count++] = i;
			}
		}
		long[] mask = new long[56];
		for (char i=0; i<40320; i++) {
			set8Perm(c.ep, i);
			int a = c.getURtoUL() / 6;
			int b = c.getDRtoDL() / 6;
			mask[a] |= (1L << b);
		}
		for (byte i=0; i<56; i++) {
			count = 0;
			for (byte j=0; j<56; j++) {
				if ((mask[i]&(1L<<j)) != 0) {
					merge[i][j] = (byte) (count++);
				}
			}
		}
		count = 0;
		for (char i=0; i<40320/32; occ[i++] = 0);
		for (char i=0; i<40320; i++) {
			if ((occ[i>>>5]&(1<<(i&0x1f))) == 0) {
				set8Perm(c.ep, i);
//				c.setEPerm(i);
				for (byte s=0; s<16; s++) {
					EdgeConjugate(c, s, d);
					char idx = get8Perm(d.ep);
					occ[idx>>>5] |= 1<<(idx&0x1f);
					char a = d.getURtoUL();
					char b = d.getDRtoDL();
					char m = (char) (merge[a/6][b/6] * 4032 + a * 12 + b % 6 * 2 + Util.get8Parity(idx));
					MtoEPerm[m] = (char) (count << 4 | s);
					EPermR2S[idx] = (char) (count << 4 | s);
				}
				EPermS2R[count++] = i;
			}
		}
	}
	
	static {	
		initMove();
		initSym();
	}
	
	static void init() {
		FlipR2S = new char[2048];
		TwistR2S = new char[2187];
		EPermR2S = new char[40320];
		initSym2Raw();
	}
}
