package cs.min2phase;

class CoordCube {
	static final int N_MOVES = 18;
	static final int N_MOVES2 = 10;

	static final int N_SLICE = 495;
	static final int N_TWIST = 2187;
	static final int N_TWIST_SYM = 324;
	static final int N_FLIP = 2048;
	static final int N_FLIP_SYM = 336;
	static final int N_PERM = 40320;
	static final int N_PERM_SYM = 2768;
	static final int N_MPERM = 24;
	static final int N_COMB = Search.USE_COMBP_PRUN ? 140 : 70;
	static final int P2_PARITY_MOVE = Search.USE_COMBP_PRUN ? 0xA5 : 0;

	//XMove = Move Table
	//XPrun = Pruning Table
	//XConj = Conjugate Table

	//phase1
	static char[][] UDSliceMove = new char[N_SLICE][N_MOVES];
	static char[][] TwistMove = new char[N_TWIST_SYM][N_MOVES];
	static char[][] FlipMove = new char[N_FLIP_SYM][N_MOVES];
	static char[][] UDSliceConj = new char[N_SLICE][8];
	static int[] UDSliceTwistPrun = new int[N_SLICE * N_TWIST_SYM / 8 + 1];
	static int[] UDSliceFlipPrun = new int[N_SLICE * N_FLIP_SYM / 8 + 1];
	static int[] TwistFlipPrun = Search.USE_TWIST_FLIP_PRUN ? new int[N_FLIP * N_TWIST_SYM / 8 + 1] : null;

	//phase2
	static char[][] CPermMove = new char[N_PERM_SYM][N_MOVES2];
	static char[][] EPermMove = new char[N_PERM_SYM][N_MOVES2];
	static char[][] MPermMove = new char[N_MPERM][N_MOVES2];
	static char[][] MPermConj = new char[N_MPERM][16];
	static char[][] CCombPMove;// = new char[N_COMB][N_MOVES2];
	static char[][] CCombPConj = new char[N_COMB][16];
	static int[] MCPermPrun = new int[N_MPERM * N_PERM_SYM / 8 + 1];
	static int[] EPermCCombPPrun = new int[N_COMB * N_PERM_SYM / 8 + 1];

	/**
	 *  0: not initialized, 1: partially initialized, 2: finished
	 */
	static int initLevel = 0;

	static synchronized void init(boolean fullInit) {
		if (initLevel == 2 || initLevel == 1 && !fullInit) {
			return;
		}
		if (initLevel == 0) {
			CubieCube.initPermSym2Raw();
			initCPermMove();
			initEPermMove();
			initMPermMoveConj();
			initCombPMoveConj();

			CubieCube.initFlipSym2Raw();
			CubieCube.initTwistSym2Raw();
			initFlipMove();
			initTwistMove();
			initUDSliceMoveConj();
		}
		initMCPermPrun(fullInit);
		initPermCombPPrun(fullInit);
		initSliceTwistPrun(fullInit);
		initSliceFlipPrun(fullInit);
		if (Search.USE_TWIST_FLIP_PRUN) {
			initTwistFlipPrun(fullInit);
		}
		initLevel = fullInit ? 2 : 1;
	}

	static void setPruning(int[] table, int index, int value) {
		table[index >> 3] ^= value << (index << 2); // index << 2 <=> (index & 7) << 2
	}

	static int getPruning(int[] table, int index) {
		return table[index >> 3] >> (index << 2) & 0xf; // index << 2 <=> (index & 7) << 2
	}

	static void initUDSliceMoveConj() {
		CubieCube c = new CubieCube();
		CubieCube d = new CubieCube();
		for (int i = 0; i < N_SLICE; i++) {
			c.setUDSlice(i);
			for (int j = 0; j < N_MOVES; j += 3) {
				CubieCube.EdgeMult(c, CubieCube.moveCube[j], d);
				UDSliceMove[i][j] = (char) d.getUDSlice();
			}
			for (int j = 0; j < 16; j += 2) {
				CubieCube.EdgeConjugate(c, CubieCube.SymMultInv[0][j], d);
				UDSliceConj[i][j >> 1] = (char) d.getUDSlice();
			}
		}
		for (int i = 0; i < N_SLICE; i++) {
			for (int j = 0; j < N_MOVES; j += 3) {
				int udslice = UDSliceMove[i][j];
				for (int k = 1; k < 3; k++) {
					udslice = UDSliceMove[udslice][j];
					UDSliceMove[i][j + k] = (char) udslice;
				}
			}
		}
	}

	static void initFlipMove() {
		CubieCube c = new CubieCube();
		CubieCube d = new CubieCube();
		for (int i = 0; i < N_FLIP_SYM; i++) {
			c.setFlip(CubieCube.FlipS2R[i]);
			for (int j = 0; j < N_MOVES; j++) {
				CubieCube.EdgeMult(c, CubieCube.moveCube[j], d);
				FlipMove[i][j] = (char) d.getFlipSym();
			}
		}
	}

	static void initTwistMove() {
		CubieCube c = new CubieCube();
		CubieCube d = new CubieCube();
		for (int i = 0; i < N_TWIST_SYM; i++) {
			c.setTwist(CubieCube.TwistS2R[i]);
			for (int j = 0; j < N_MOVES; j++) {
				CubieCube.CornMult(c, CubieCube.moveCube[j], d);
				TwistMove[i][j] = (char) d.getTwistSym();
			}
		}
	}

	static void initCPermMove() {
		CubieCube c = new CubieCube();
		CubieCube d = new CubieCube();
		for (int i = 0; i < N_PERM_SYM; i++) {
			c.setCPerm(CubieCube.EPermS2R[i]);
			for (int j = 0; j < N_MOVES2; j++) {
				CubieCube.CornMult(c, CubieCube.moveCube[Util.ud2std[j]], d);
				CPermMove[i][j] = (char) d.getCPermSym();
			}
		}
	}

	static void initEPermMove() {
		CubieCube c = new CubieCube();
		CubieCube d = new CubieCube();
		for (int i = 0; i < N_PERM_SYM; i++) {
			c.setEPerm(CubieCube.EPermS2R[i]);
			for (int j = 0; j < N_MOVES2; j++) {
				CubieCube.EdgeMult(c, CubieCube.moveCube[Util.ud2std[j]], d);
				EPermMove[i][j] = (char) d.getEPermSym();
			}
		}
	}

	static void initMPermMoveConj() {
		CubieCube c = new CubieCube();
		CubieCube d = new CubieCube();
		for (int i = 0; i < N_MPERM; i++) {
			c.setMPerm(i);
			for (int j = 0; j < N_MOVES2; j++) {
				CubieCube.EdgeMult(c, CubieCube.moveCube[Util.ud2std[j]], d);
				MPermMove[i][j] = (char) d.getMPerm();
			}
			for (int j = 0; j < 16; j++) {
				CubieCube.EdgeConjugate(c, CubieCube.SymMultInv[0][j], d);
				MPermConj[i][j] = (char) d.getMPerm();
			}
		}
	}

	static void initCombPMoveConj() {
		CubieCube c = new CubieCube();
		CubieCube d = new CubieCube();
		CCombPMove = new char[N_COMB][N_MOVES2];
		for (int i = 0; i < N_COMB; i++) {
			c.setCComb(i % 70);
			for (int j = 0; j < N_MOVES2; j++) {
				CubieCube.CornMult(c, CubieCube.moveCube[Util.ud2std[j]], d);
				CCombPMove[i][j] = (char) (d.getCComb() + 70 * ((P2_PARITY_MOVE >> j & 1) ^ (i / 70)));
			}
			for (int j = 0; j < 16; j++) {
				CubieCube.CornConjugate(c, CubieCube.SymMultInv[0][j], d);
				CCombPConj[i][j] = (char) (d.getCComb() + 70 * (i / 70));
			}
		}
	}

	static boolean hasZero(int val) {
		return ((val - 0x11111111) & ~val & 0x88888888) != 0;
	}

	//          |   4 bits  |   4 bits  |   4 bits  |  2 bits | 1b |  1b |   4 bits  |
	//PrunFlag: | MIN_DEPTH | MAX_DEPTH | INV_DEPTH | Padding | P2 | E2C | SYM_SHIFT |
	static void initRawSymPrun(int[] PrunTable,
	                           final char[][] RawMove, final char[][] RawConj,
	                           final char[][] SymMove, final char[] SymState,
	                           final int PrunFlag, final boolean fullInit) {

		final int SYM_SHIFT = PrunFlag & 0xf;
		final int SYM_E2C_MAGIC = ((PrunFlag >> 4) & 1) == 1 ? CubieCube.SYM_E2C_MAGIC : 0x00000000;
		final boolean IS_PHASE2 = ((PrunFlag >> 5) & 1) == 1;
		final int INV_DEPTH = PrunFlag >> 8 & 0xf;
		final int MAX_DEPTH = PrunFlag >> 12 & 0xf;
		final int MIN_DEPTH = PrunFlag >> 16 & 0xf;
		final int SEARCH_DEPTH = fullInit ? MAX_DEPTH : MIN_DEPTH;

		final int SYM_MASK = (1 << SYM_SHIFT) - 1;
		final boolean ISTFP = RawMove == null;
		final int N_RAW = ISTFP ? N_FLIP : RawMove.length;
		final int N_SIZE = N_RAW * SymMove.length;
		final int N_MOVES = IS_PHASE2 ? 10 : 18;
		final int NEXT_AXIS_MAGIC = N_MOVES == 10 ? 0x42 : 0x92492;

		int depth = getPruning(PrunTable, N_SIZE) - 1;
		int done = 0;

		// long tt = System.nanoTime();

		if (depth == -1) {
			for (int i = 0; i < N_SIZE / 8 + 1; i++) {
				PrunTable[i] = 0x11111111;
			}
			setPruning(PrunTable, 0, 0 ^ 1);
			depth = 0;
			done = 1;
		}

		while (depth < SEARCH_DEPTH) {
			int mask = (depth + 1) * 0x11111111 ^ 0xffffffff;
			for (int i = 0; i < PrunTable.length; i++) {
				int val = PrunTable[i] ^ mask;
				val &= val >> 1;
				PrunTable[i] += val & (val >> 2) & 0x11111111;
			}

			boolean inv = depth > INV_DEPTH;
			int select = inv ? (depth + 2) : depth;
			int selArrMask = select * 0x11111111;
			int check = inv ? depth : (depth + 2);
			depth++;
			int xorVal = depth ^ (depth + 1);
			int val = 0;
			for (int i = 0; i < N_SIZE; i++, val >>= 4) {
				if ((i & 7) == 0) {
					val = PrunTable[i >> 3];
					if (!hasZero(val ^ selArrMask)) {
						i += 7;
						continue;
					}
				}
				if ((val & 0xf) != select) {
					continue;
				}
				int raw = i % N_RAW;
				int sym = i / N_RAW;
				int flip = 0, fsym = 0;
				if (ISTFP) {
					flip = CubieCube.FlipR2S[raw];
					fsym = flip & 7;
					flip >>= 3;
				}

				for (int m = 0; m < N_MOVES; m++) {
					int symx = SymMove[sym][m];
					int rawx;
					if (ISTFP) {
						rawx = CubieCube.FlipS2RF[
						           FlipMove[flip][CubieCube.Sym8Move[m << 3 | fsym]] ^
						           fsym ^ (symx & SYM_MASK)];
					} else {
						rawx = RawConj[RawMove[raw][m]][symx & SYM_MASK];

					}
					symx >>= SYM_SHIFT;
					int idx = symx * N_RAW + rawx;
					int prun = getPruning(PrunTable, idx);
					if (prun != check) {
						if (prun < depth - 1) {
							m += NEXT_AXIS_MAGIC >> m & 3;
						}
						continue;
					}
					done++;
					if (inv) {
						setPruning(PrunTable, i, xorVal);
						break;
					}
					setPruning(PrunTable, idx, xorVal);
					for (int j = 1, symState = SymState[symx]; (symState >>= 1) != 0; j++) {
						if ((symState & 1) != 1) {
							continue;
						}
						int idxx = symx * N_RAW;
						if (ISTFP) {
							idxx += CubieCube.FlipS2RF[CubieCube.FlipR2S[rawx] ^ j];
						} else {
							idxx += RawConj[rawx][j ^ (SYM_E2C_MAGIC >> (j << 1) & 3)];
						}
						if (getPruning(PrunTable, idxx) == check) {
							setPruning(PrunTable, idxx, xorVal);
							done++;
						}
					}
				}
			}
			// System.out.println(String.format("%2d%10d%10f", depth, done, (System.nanoTime() - tt) / 1e6d));
		}
	}

	static void initTwistFlipPrun(boolean fullInit) {
		initRawSymPrun(
		    TwistFlipPrun,
		    null, null,
		    TwistMove, CubieCube.SymStateTwist, 0x19603,
		    fullInit
		);
	}

	static void initSliceTwistPrun(boolean fullInit) {
		initRawSymPrun(
		    UDSliceTwistPrun,
		    UDSliceMove, UDSliceConj,
		    TwistMove, CubieCube.SymStateTwist, 0x69603,
		    fullInit
		);
	}

	static void initSliceFlipPrun(boolean fullInit) {
		initRawSymPrun(
		    UDSliceFlipPrun,
		    UDSliceMove, UDSliceConj,
		    FlipMove, CubieCube.SymStateFlip, 0x69603,
		    fullInit
		);
	}

	static void initMCPermPrun(boolean fullInit) {
		initRawSymPrun(
		    MCPermPrun,
		    MPermMove, MPermConj,
		    CPermMove, CubieCube.SymStatePerm, 0x8ea34,
		    fullInit
		);
	}

	static void initPermCombPPrun(boolean fullInit) {
		initRawSymPrun(
		    EPermCCombPPrun,
		    CCombPMove, CCombPConj,
		    EPermMove, CubieCube.SymStatePerm, 0x7d824,
		    fullInit
		);
	}


	int twist;
	int tsym;
	int flip;
	int fsym;
	int slice;
	int prun;

	int twistc;
	int flipc;

	CoordCube() { }

	void set(CoordCube node) {
		this.twist = node.twist;
		this.tsym = node.tsym;
		this.flip = node.flip;
		this.fsym = node.fsym;
		this.slice = node.slice;
		this.prun = node.prun;

		if (Search.USE_CONJ_PRUN) {
			this.twistc = node.twistc;
			this.flipc = node.flipc;
		}
	}

	void calcPruning(boolean isPhase1) {
		prun = Math.max(
		           Math.max(
		               getPruning(UDSliceTwistPrun,
		                          twist * N_SLICE + UDSliceConj[slice][tsym]),
		               getPruning(UDSliceFlipPrun,
		                          flip * N_SLICE + UDSliceConj[slice][fsym])),
		           Math.max(
		               Search.USE_CONJ_PRUN ? getPruning(TwistFlipPrun,
		                       (twistc >> 3) << 11 | CubieCube.FlipS2RF[flipc ^ (twistc & 7)]) : 0,
		               Search.USE_TWIST_FLIP_PRUN ? getPruning(TwistFlipPrun,
		                       twist << 11 | CubieCube.FlipS2RF[flip << 3 | (fsym ^ tsym)]) : 0));
	}

	boolean setWithPrun(CubieCube cc, int depth) {
		twist = cc.getTwistSym();
		flip = cc.getFlipSym();
		tsym = twist & 7;
		twist = twist >> 3;

		prun = Search.USE_TWIST_FLIP_PRUN ? getPruning(TwistFlipPrun,
		        twist << 11 | CubieCube.FlipS2RF[flip ^ tsym]) : 0;
		if (prun > depth) {
			return false;
		}

		fsym = flip & 7;
		flip = flip >> 3;

		slice = cc.getUDSlice();
		prun = Math.max(prun, Math.max(
		                    getPruning(UDSliceTwistPrun,
		                               twist * N_SLICE + UDSliceConj[slice][tsym]),
		                    getPruning(UDSliceFlipPrun,
		                               flip * N_SLICE + UDSliceConj[slice][fsym])));
		if (prun > depth) {
			return false;
		}

		if (Search.USE_CONJ_PRUN) {
			CubieCube pc = new CubieCube();
			CubieCube.CornConjugate(cc, 1, pc);
			CubieCube.EdgeConjugate(cc, 1, pc);
			twistc = pc.getTwistSym();
			flipc = pc.getFlipSym();
			prun = Math.max(prun,
			                getPruning(TwistFlipPrun,
			                           (twistc >> 3) << 11 | CubieCube.FlipS2RF[flipc ^ (twistc & 7)]));
		}

		return prun <= depth;
	}

	/**
	 * @return pruning value
	 */
	int doMovePrun(CoordCube cc, int m, boolean isPhase1) {
		slice = UDSliceMove[cc.slice][m];

		flip = FlipMove[cc.flip][CubieCube.Sym8Move[m << 3 | cc.fsym]];
		fsym = (flip & 7) ^ cc.fsym;
		flip >>= 3;

		twist = TwistMove[cc.twist][CubieCube.Sym8Move[m << 3 | cc.tsym]];
		tsym = (twist & 7) ^ cc.tsym;
		twist >>= 3;

		prun = Math.max(
		           Math.max(
		               getPruning(UDSliceTwistPrun,
		                          twist * N_SLICE + UDSliceConj[slice][tsym]),
		               getPruning(UDSliceFlipPrun,
		                          flip * N_SLICE + UDSliceConj[slice][fsym])),
		           Search.USE_TWIST_FLIP_PRUN ? getPruning(TwistFlipPrun,
		                   twist << 11 | CubieCube.FlipS2RF[flip << 3 | (fsym ^ tsym)]) : 0);
		return prun;
	}

	int doMovePrunConj(CoordCube cc, int m) {
		m = CubieCube.SymMove[3][m];
		flipc = FlipMove[cc.flipc >> 3][CubieCube.Sym8Move[m << 3 | cc.flipc & 7]] ^ (cc.flipc & 7);
		twistc = TwistMove[cc.twistc >> 3][CubieCube.Sym8Move[m << 3 | cc.twistc & 7]] ^ (cc.twistc & 7);
		return getPruning(TwistFlipPrun,
		                  (twistc >> 3) << 11 | CubieCube.FlipS2RF[flipc ^ (twistc & 7)]);
	}
}
