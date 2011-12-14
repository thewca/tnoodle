/*YOU MAY USE THIS PACKAGE FOR FREE BUT YOU MUST INCLUDE AN APPROPRIATE CREDIT LINE.*/
package cs.min2phase;

/*
 * While an instances of the Search class is thread safe, it is highly recommended that
 * you create an instance of the Search class per thread. Otherwise, only one thread will
 * be able to solve a cube at a time (see the synchronized keyword on the solution() method?)
 * Just be sure to do something like:
 *  	private ThreadLocal<Search> twoPhaseSearcher = new ThreadLocal<Search>() {
 *			protected Search initialValue() {
 *				return new Search();
 *			};
 *		};
 */
final public class Search {

	int[] move = new int[31];

	int[] corn = new int[20];
	int[] csym = new int[20];
	int[] mid3 = new int[20];
	int[] e1 = new int[20];
	int[] e2 = new int[20];
	int urfidx;

	int[] twist = new int[6];
	int[] tsym = new int[6];
	int[] flip = new int[6];
	int[] fsym = new int[6];
	int[] slice = new int[6];
	int[] corn0 = new int[6];
	int[] csym0 = new int[6];
	int[] mid30 = new int[6];
	int[] e10 = new int[6];
	int[] e20 = new int[6];
	int[] prun = new int[6];

	int[] count = new int[6];
	byte[] f = new byte[54];

	int length1 = 0;
	int maxlength2 = 0;
	int sol = 999;
	int valid1 = 0;
	int valid2 = 0;
	String solution;
	boolean useSeparator = false;
	long timeOut;

	boolean inverse = false;

	/**
	 * Computes the solver string for a given cube.
	 *
	 * @param facelets
	 *          is the cube definition string format.
	 * <pre>
	 * The names of the facelet positions of the cube
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
	 * </pre>
	 * A cube definition string "UBL..." means for example: In position U1 we have the U-color, in position U2 we have the
	 * B-color, in position U3 we have the L color etc. according to the order U1, U2, U3, U4, U5, U6, U7, U8, U9, R1, R2,
	 * R3, R4, R5, R6, R7, R8, R9, F1, F2, F3, F4, F5, F6, F7, F8, F9, D1, D2, D3, D4, D5, D6, D7, D8, D9, L1, L2, L3, L4,
	 * L5, L6, L7, L8, L9, B1, B2, B3, B4, B5, B6, B7, B8, B9 of the enum constants.
	 * @param maxDepth
	 *          defines the maximal allowed maneuver length. For random cubes, a maxDepth of 21 usually will return a
	 *          solution in less than 0.5 seconds. With a maxDepth of 20 it takes a few seconds on average to find a
	 *          solution, but it may take much longer for specific cubes.
	 *
	 * @param timeOut
	 *          defines the maximum computing time of the method in milliseconds. If it does not return with a solution, it returns with
	 *          an error code.
	 *
	 * @param useSeparator
	 *          determines if a " . " separates the phase1 and phase2 parts of the solver string like in F' R B R L2 F .
	 *          U2 U D for example.<br>
	 * @return The solution string or an error code:<br>
	 *         Error 1: There is not exactly one facelet of each colour<br>
	 *         Error 2: Not all 12 edges exist exactly once<br>
	 *         Error 3: Flip error: One edge has to be flipped<br>
	 *         Error 4: Not all corners exist exactly once<br>
	 *         Error 5: Twist error: One corner has to be twisted<br>
	 *         Error 6: Parity error: Two corners or two edges have to be exchanged<br>
	 *         Error 7: No solution exists for the given maxDepth<br>
	 *         Error 8: Timeout, no solution within given time
	 */
	public synchronized String solution(String facelets, int maxDepth, long timeOut, boolean useSeparator, boolean inverse) {
		int s;
		Tools.init();
		// +++++++++++++++++++++check for wrong input +++++++++++++++++++++++++++++
		for (int i=0; i<6; count[i++]=0);
		try {
			for (int i=0; i<54; i++) {
				switch (facelets.charAt(i)) {
					case 'U':f[i] = 0;break;
					case 'R':f[i] = 1;break;
					case 'F':f[i] = 2;break;
					case 'D':f[i] = 3;break;
					case 'L':f[i] = 4;break;
					case 'B':f[i] = 5;break;
					default:
						return "Error 1";
				}
				count[f[i]]++;
			}
		} catch (Exception e) {
			return "Error 1";
		}
		for (int i=0; i<6; i++)
			if (count[i] != 9) {
				return "Error 1";
			}
		CubieCube cc = Util.toCubieCube(f);
		if ((s = cc.verify()) != 0)
			return "Error " + Math.abs(s);
		this.useSeparator = useSeparator;
		this.inverse = inverse;
		this.timeOut = System.currentTimeMillis() + timeOut;
		sol = maxDepth+1;
		return Solve(cc);
	}

	String Solve(CubieCube c) {
		c.temps = new CubieCube();
		for (int i=0; i<6; i++) {
			twist[i] = c.getTwistSym();
			tsym[i] = twist[i] & 7;
			twist[i] >>>= 3;
			flip[i] = c.getFlipSym();
			fsym[i] = flip[i] & 7;
			flip[i] >>>= 3;
			slice[i] = c.getUDSlice();
			corn0[i] = c.getCPermSym();
			csym0[i] = corn0[i] & 15;
			corn0[i] >>>= 4;
			mid30[i] = c.getMid3();
			e10[i] = c.getURtoUL();
			e20[i] = c.getDRtoDL();
			prun[i] = Math.max(Math.max(CoordCube.UDSliceTwistPrun[twist[i] * 495 + CoordCube.UDSliceConj[slice[i]][tsym[i]]],
							CoordCube.UDSliceFlipPrun[flip[i] * 495 + CoordCube.UDSliceConj[slice[i]][fsym[i]]]),
							CoordCube.TwistFlipPrun[twist[i] * 2688 + (flip[i] << 3 | CubieCube.Sym8MultInv[fsym[i]][tsym[i]])]);
			c.URFConjugate();
			if (i==2) {
				c.invCubieCube();
			}
		}
		solution = null;
		for (length1=0; length1<sol; length1++) {
			maxlength2 = Math.min(sol/2+1, sol-length1);
			for (urfidx=0; urfidx<6; urfidx++) {
				corn[0] = corn0[urfidx];
				csym[0] = csym0[urfidx];
				mid3[0] = mid30[urfidx];
				e1[0] = e10[urfidx];
				e2[0] = e20[urfidx];
				if ((prun[urfidx] <= length1)
						&& phase1(twist[urfidx], tsym[urfidx], flip[urfidx], fsym[urfidx],
									slice[urfidx], length1, 18)) {
					if (solution == null) {
						return "Error 8";
					} else {
						return solution;
					}
				}
			}
		}
		return "Error 7";
	}

	boolean phase1(int twist, int tsym, int flip, int fsym, int slice, int maxl, int lm) {
		if (twist==0 && flip==0 && slice==0 && maxl < 5) {
			return maxl == 0 && init2();
		}
		for (int m=0; m<18; m++) {
			if (Util.ckmv[lm][m]) {
				m+=2;
				continue;
			}
			int slicex = CoordCube.UDSliceMove[slice][m];
			int twistx = CoordCube.TwistMove[twist][CubieCube.Sym8Move[tsym][m]];
			int tsymx = CubieCube.Sym8Mult[twistx & 7][tsym];
			twistx >>>= 3;
			if (CoordCube.UDSliceTwistPrun[twistx * 495 + CoordCube.UDSliceConj[slicex][tsymx]] >= maxl) {
				continue;
			}
			int flipx = CoordCube.FlipMove[flip][CubieCube.Sym8Move[fsym][m]];
			int fsymx = CubieCube.Sym8Mult[flipx & 7][fsym];
			flipx >>>= 3;
			if (CoordCube.TwistFlipPrun[twistx * 2688 + (flipx << 3 | CubieCube.Sym8MultInv[fsymx][tsymx])] >= maxl
					||CoordCube.UDSliceFlipPrun[flipx * 495 + CoordCube.UDSliceConj[slicex][fsymx]] >= maxl) {
				continue;
			}

			move[length1-maxl] = m;
			valid1 = Math.min(valid1, length1-maxl);
			if (phase1(twistx, tsymx, flipx, fsymx, slicex, maxl-1, m)) {
				return true;
			}
		}
		return false;
	}

	boolean init2() {
		if (System.currentTimeMillis() > timeOut) {
			return true;
		}
		valid2 = Math.min(valid2, valid1);
		for (int i=valid1; i<length1; i++) {
			int m = move[i];
			corn[i+1] = CoordCube.CPermMove[corn[i]][CubieCube.SymMove[csym[i]][m]];
			csym[i+1] = CubieCube.SymMult[corn[i+1] & 15][csym[i]];
			corn[i+1] >>>= 4;
			mid3[i+1] = CoordCube.Mid3Move[mid3[i]][m];
		}
		valid1 = length1;
		int mid = CoordCube.Mid32MPerm[mid3[length1] % 24];
		int prun = CoordCube.MCPermPrun[corn[length1] * 24 + CoordCube.MPermConj[mid][csym[length1]]];
		if (prun >= maxlength2) {
			return false;
		}
		for (int i=valid2; i<length1; i++) {
			e1[i+1] = CoordCube.Mid3Move[e1[i]][move[i]];
			e2[i+1] = CoordCube.Mid3Move[e2[i]][move[i]];
		}
		valid2 = length1;
		int cornx = corn[length1];
		int ex = CubieCube.merge[e1[length1]/6][e2[length1]/6] * 4032
					 + e1[length1] * 12 + e2[length1] % 6 * 2 + (((CoordCube.CParity[cornx>>>3]>>>(cornx&7))&1) ^ Util.parity4[mid]);
		int edge = CubieCube.MtoEPerm[ex];
		int esym = edge & 15;
		edge >>>= 4;

		prun = Math.max(CoordCube.MEPermPrun[edge * 24 + CoordCube.MPermConj[mid][esym]], prun);
		if (prun >= maxlength2) {
			return false;
		}

		int lm = length1==0 ? 10 : Util.std2ud[move[length1-1]/3*3+1];
		for (int i=prun; i<maxlength2; i++) {
			if (phase2(edge, esym, corn[length1], csym[length1], mid, i, length1, lm)) {
				sol = length1 + i;
				StringBuffer sb = new StringBuffer();
				int urf = urfidx;
				if (inverse) {
					urf = (urf + 3) % 6;
				}
				if (urf < 3) {
					for (int s=0; s<length1; s++) {
						sb.append(Util.move2str[CubieCube.urfMove[urf][move[s]]]);
						sb.append(' ');
					}
					if (useSeparator) {
						sb.append('.');
					}
					for (int s=length1; s<sol; s++) {
						sb.append(Util.move2str[CubieCube.urfMove[urf][move[s]]]);
						sb.append(' ');
					}
				} else {
					for (int s=sol-1; s>=length1; s--) {
						sb.append(Util.move2str[CubieCube.urfMove[urf][move[s]]]);
						sb.append(' ');
					}
					if (useSeparator) {
						sb.append('.');
					}
					for (int s=length1-1; s>=0; s--) {
						sb.append(Util.move2str[CubieCube.urfMove[urf][move[s]]]);
						sb.append(' ');
					}
				}
				solution = sb.toString();
				return true;
			}
		}
		return false;
	}

	boolean phase2(int edge, int esym, int corn, int csym, int mid, int maxl, int depth, int lm) {
		if (edge==0 && corn==0 && mid==0) {
			return true;
		}
		for (int m=0; m<10; m++) {
			if (Util.ckmv2[lm][m]) {
				continue;
			}
			int midx = CoordCube.MPermMove[mid][m];
			int edgex = CoordCube.EPermMove[edge][CubieCube.SymMoveUD[esym][m]];
			int esymx = CubieCube.SymMult[edgex & 15][esym];
			edgex >>>= 4;
			if (CoordCube.MEPermPrun[edgex * 24 + CoordCube.MPermConj[midx][esymx]] >= maxl) {
				continue;
			}
			int cornx = CoordCube.CPermMove[corn][CubieCube.SymMove[csym][Util.ud2std[m]]];
			int csymx = CubieCube.SymMult[cornx & 15][csym];
			cornx >>>= 4;
			if (CoordCube.MCPermPrun[cornx * 24 + CoordCube.MPermConj[midx][csymx]] >= maxl) {
				continue;
			}
			move[depth] = Util.ud2std[m];
			if (phase2(edgex, esymx, cornx, csymx, midx, maxl-1, depth+1, m)) {
				return true;
			}
		}
		return false;
	}
}
