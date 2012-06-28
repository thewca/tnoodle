/**
 * Copyright (c) 2011, Shuang Chen
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *     * Redistributions of source code must retain the above copyright notice,
 *       this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above copyright
 *       notice, this list of conditions and the following disclaimer in the
 *       documentation and/or other materials provided with the distribution.
 *     * Neither the name of the <ORGANIZATION> nor the names of its
 *       contributors may be used to endorse or promote products derived from 
 *       this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE 
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
 * ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE
 * LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
 * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
 * SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
 * INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
 * CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) 
 * ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE 
 * POSSIBILITY OF SUCH DAMAGE.
 */
package cs.min2phase;

/**
 * Rubik's Cube Solver.<br>
 * A much faster and smaller implemention of Two-Phase Algorithm.<br>
 * Symmetry is used to reduce memory used.<br>
 * Total Memory used is about 1MB.<br>
 * @author Shuang Chen
 */
public class Search {

	private int[] move = new int[31];

	private int[] corn = new int[20];
	private int[] mid4 = new int[20];
	private int[] ud8e = new int[20];

	private int[] twist = new int[6];
	private int[] flip = new int[6];
	private int[] slice = new int[6];
	
	private int[] corn0 = new int[6];
	private int[] ud8e0 = new int[6];
	private int[] prun = new int[6];

	private byte[] f = new byte[54];

	private int urfIdx;
	private int depth1;
	private int maxDep2;
	private int sol;
	private int valid1;
	private int valid2;
	private String solution;
	private long timeOut;
	private long timeMin;
	private int verbose;
	private CubieCube cc = new CubieCube();
	
	/**
	 *     Verbose_Mask determines if a " . " separates the phase1 and phase2 parts of the solver string like in F' R B R L2 F .
	 *     U2 U D for example.<br>
	 */
	public static final int USE_SEPARATOR = 0x1;

	/**
	 *     Verbose_Mask determines if the solution will be inversed to a scramble/state generator.
	 */
	public static final int INVERSE_SOLUTION = 0x2;

	/**
	 *     Verbose_Mask determines if a tag such as "(21f)" will be appended to the solution.
	 */
	public static final int APPEND_LENGTH = 0x4;

	/**
	 * Computes the solver string for a given cube.
	 *
	 * @param facelets
	 * 		is the cube definition string format.<br>
	 * The names of the facelet positions of the cube:
	 * <pre>
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
	 *
	 * @param maxDepth
	 * 		defines the maximal allowed maneuver length. For random cubes, a maxDepth of 21 usually will return a
	 * 		solution in less than 0.02 seconds on average. With a maxDepth of 20 it takes about 0.1 seconds on average to find a
	 * 		solution, but it may take much longer for specific cubes.
	 *
	 * @param timeOut
	 * 		defines the maximum computing time of the method in milliseconds. If it does not return with a solution, it returns with
	 * 		an error code.
	 *
	 * @param timeMin
	 * 		defines the minimum computing time of the method in milliseconds. So, if a solution is found within given time, the
	 * 		computing will continue to find shorter solution(s). Btw, if timeMin > timeOut, timeMin will be set to timeOut.
	 *
	 * @param verbose
	 * 		determins the format of the solution(s). see USE_SEPARATOR, INVERSE_SOLUTION, APPEND_LENGTH
	 * 
	 * @return The solution string or an error code:<br>
	 * 		Error 1: There is not exactly one facelet of each colour<br>
	 * 		Error 2: Not all 12 edges exist exactly once<br>
	 * 		Error 3: Flip error: One edge has to be flipped<br>
	 * 		Error 4: Not all corners exist exactly once<br>
	 * 		Error 5: Twist error: One corner has to be twisted<br>
	 * 		Error 6: Parity error: Two corners or two edges have to be exchanged<br>
	 * 		Error 7: No solution exists for the given maxDepth<br>
	 * 		Error 8: Timeout, no solution within given time
	 */
	public synchronized String solution(String facelets, int maxDepth, long timeOut, long timeMin, int verbose) {
		int check = verify(facelets);
		if (check != 0) {
			return "Error " + Math.abs(check);
		}
		this.sol = maxDepth+1;
		this.timeOut = System.currentTimeMillis() + timeOut;
		this.timeMin = this.timeOut + Math.min(timeMin - timeOut, 0);
		this.verbose = verbose;
		this.solution = null;
		return solve(cc);
	}
	
	int verify(String facelets) {
		int count = 0x000000;
		try {
			for (int i=0; i<54; i++) {
				switch (facelets.charAt(i)) {
					case 'U':f[i] = 0; break;
					case 'R':f[i] = 1; break;
					case 'F':f[i] = 2; break;
					case 'D':f[i] = 3; break;
					case 'L':f[i] = 4; break;
					case 'B':f[i] = 5; break;
					default: return -1;
				}
				count += 1 << (f[i] << 2);
			}
		} catch (Exception e) {
			return -1;
		}
		if (count != 0x999999) {
			return -1;
		}
		Util.toCubieCube(f, cc);
		return cc.verify();
	}

	private String solve(CubieCube c) {
		Tools.init();
		int conjMask = 0;
		for (int i=0; i<6; i++) {
			twist[i] = c.getTwistSym();
			flip[i] = c.getFlipSym();
			slice[i] = c.getUDSlice();
			corn0[i] = c.getCPermSym();
			ud8e0[i] = c.getU4Comb() << 16 | c.getD4Comb();
			
			for (int j=0; j<i; j++) {	//If S_i^-1 * C * S_i == C, It's unnecessary to compute it again. 
				if (twist[i] == twist[j] && flip[i] == flip[j] && slice[i] == slice[j]
						&& corn0[i] == corn0[j] && ud8e0[i] == ud8e0[j]) {
					conjMask |= 1 << i;
					break;
				}
			}
			if ((conjMask & (1 << i)) == 0) {
				prun[i] = Math.max(Math.max(
					CoordCube.getPruning(CoordCube.UDSliceTwistPrun, 
						(twist[i]>>>3) * 495 + CoordCube.UDSliceConj[slice[i]&0x1ff][twist[i]&7]),
					CoordCube.getPruning(CoordCube.UDSliceFlipPrun, 
						(flip[i]>>>3) * 495 + CoordCube.UDSliceConj[slice[i]&0x1ff][flip[i]&7])),
					Tools.USE_TWIST_FLIP_PRUN ? CoordCube.getPruning(CoordCube.TwistFlipPrun, 
							(twist[i]>>>3) * 2688 + (flip[i] & 0xfff8 | CubieCube.Sym8MultInv[flip[i]&7][twist[i]&7])) : 0);
			}
			c.URFConjugate();
			if (i==2) {
				c.invCubieCube();
			}
		}
		for (depth1=0; depth1<sol; depth1++) {
			maxDep2 = Math.min(12, sol-depth1);
			for (urfIdx=0; urfIdx<6; urfIdx++) {
				if ((conjMask & (1 << urfIdx)) != 0) {
					continue;
				}
				corn[0] = corn0[urfIdx];
				mid4[0] = slice[urfIdx];
				ud8e[0] = ud8e0[urfIdx];
				if ((prun[urfIdx] <= depth1)
						&& phase1(twist[urfIdx]>>>3, twist[urfIdx]&7, flip[urfIdx]>>>3, flip[urfIdx]&7,
							slice[urfIdx]&0x1ff, depth1, -1) == 0) {
					return solution == null ? "Error 8" : solution;
				}
			}
		}
		return "Error 7";
	}
	
	/**
	 * @return
	 * 		0: Found or Timeout
	 * 		1: Try Next Power
	 * 		2: Try Next Axis
	 */
	private int phase1(int twist, int tsym, int flip, int fsym, int slice, int maxl, int lm) {
		if (twist==0 && flip==0 && slice==0 && maxl<5) {
			return maxl==0 ? initPhase2() : 1;
		}
		for (int axis=0; axis<18; axis+=3) {
			if (axis == lm || axis == lm-9) {
				continue;
			}
			for (int power=0; power<3; power++) {
				int m = axis + power;
				
				int slicex = CoordCube.UDSliceMove[slice][m] & 0x1ff;
				int twistx = CoordCube.TwistMove[twist][CubieCube.Sym8Move[tsym][m]];
				int tsymx = CubieCube.Sym8Mult[twistx & 7][tsym];
				twistx >>>= 3;
				int prun = CoordCube.getPruning(CoordCube.UDSliceTwistPrun, 
					twistx * 495 + CoordCube.UDSliceConj[slicex][tsymx]);
				if (prun > maxl) {
					break;
				} else if (prun == maxl) {
					continue;
				}
				int flipx = CoordCube.FlipMove[flip][CubieCube.Sym8Move[fsym][m]];
				int fsymx = CubieCube.Sym8Mult[flipx & 7][fsym];
				flipx >>>= 3;
				if (Tools.USE_TWIST_FLIP_PRUN) {
					prun = CoordCube.getPruning(CoordCube.TwistFlipPrun, 
						(twistx * 336 + flipx) << 3 | CubieCube.Sym8MultInv[fsymx][tsymx]);
					if (prun > maxl) {
						break;
					} else if (prun == maxl) {
						continue;
					}
				}
				prun = CoordCube.getPruning(CoordCube.UDSliceFlipPrun, 
					flipx * 495 + CoordCube.UDSliceConj[slicex][fsymx]);
				if (prun > maxl) {
					break;
				} else if (prun == maxl) {
					continue;
				}
				move[depth1-maxl] = m;
				valid1 = Math.min(valid1, depth1-maxl);
				int ret = phase1(twistx, tsymx, flipx, fsymx, slicex, maxl-1, axis);
				if (ret != 1) {
					return ret >> 1;
				}
			}		
		}
		return 1;
	}
	
	/**
	 * @return
	 * 		0: Found or Timeout
	 * 		1: Try Next Power
	 * 		2: Try Next Axis
	 */
	private int initPhase2() {
		if (System.currentTimeMillis() > (solution == null ? timeOut : timeMin)) {
			return 0;
		}
		valid2 = Math.min(valid2, valid1);
		int cidx = corn[valid1] >>> 4;
		int csym = corn[valid1] & 0xf;
		for (int i=valid1; i<depth1; i++) {
			int m = move[i];
			cidx = CoordCube.CPermMove[cidx][CubieCube.SymMove[csym][m]];
			csym = CubieCube.SymMult[cidx & 0xf][csym];
			cidx >>>= 4;
			corn[i+1] = cidx << 4 | csym;
			
			int cx = CoordCube.UDSliceMove[mid4[i] & 0x1ff][m];
			mid4[i+1] = Util.permMult[mid4[i]>>>9][cx>>>9]<<9|cx&0x1ff;
		}
		valid1 = depth1;
		int mid = mid4[depth1]>>>9;
		int prun = CoordCube.getPruning(CoordCube.MCPermPrun, cidx * 24 + CoordCube.MPermConj[mid][csym]);
		if (prun >= maxDep2) {
			return prun > maxDep2 ? 2 : 1;
		}
		
		int u4e = ud8e[valid2] >>> 16;
		int d4e = ud8e[valid2] & 0xffff;
		for (int i=valid2; i<depth1; i++) {
			int m = move[i];
			
			int cx = CoordCube.UDSliceMove[u4e & 0x1ff][m];
			u4e = Util.permMult[u4e>>>9][cx>>>9]<<9|cx&0x1ff;
			
			cx = CoordCube.UDSliceMove[d4e & 0x1ff][m];
			d4e = Util.permMult[d4e>>>9][cx>>>9]<<9|cx&0x1ff;
			
			ud8e[i+1] = u4e << 16 | d4e;
		}
		valid2 = depth1;

		int edge = CubieCube.MtoEPerm[494 - (u4e & 0x1ff) + (u4e >>> 9) * 70 + (d4e >>> 9) * 1680];
		int esym = edge & 15;
		edge >>>= 4;

		prun = Math.max(CoordCube.getPruning(CoordCube.MEPermPrun, edge * 24 + CoordCube.MPermConj[mid][esym]), prun);
		if (prun >= maxDep2) {
			return prun > maxDep2 ? 2 : 1;
		}

		int lm = depth1==0 ? 10 : Util.std2ud[move[depth1-1]/3*3+1];
		for (int depth2=prun; depth2<maxDep2; depth2++) {
			if (phase2(edge, esym, cidx, csym, mid, depth2, depth1, lm)) {
				sol = depth1 + depth2;
				maxDep2 = Math.min(12, sol-depth1);
				solution = solutionToString();
				return System.currentTimeMillis() > timeMin ? 0 : 1;
			}
		}
		return 1;
	}

	private boolean phase2(int eidx, int esym, int cidx, int csym, int mid, int maxl, int depth, int lm) {
		if (eidx==0 && cidx==0 && mid==0) {
			return true;
		}
		for (int m=0; m<10; m++) {
			if (Util.ckmv2[lm][m]) {
				continue;
			}
			int midx = CoordCube.MPermMove[mid][m];
			int cidxx = CoordCube.CPermMove[cidx][CubieCube.SymMove[csym][Util.ud2std[m]]];
			int csymx = CubieCube.SymMult[cidxx & 15][csym];
			cidxx >>>= 4;
			if (CoordCube.getPruning(CoordCube.MCPermPrun, 
					cidxx * 24 + CoordCube.MPermConj[midx][csymx]) >= maxl) {
				continue;
			}
			int eidxx = CoordCube.EPermMove[eidx][CubieCube.SymMoveUD[esym][m]];
			int esymx = CubieCube.SymMult[eidxx & 15][esym];
			eidxx >>>= 4;
			if (CoordCube.getPruning(CoordCube.MEPermPrun, 
					eidxx * 24 + CoordCube.MPermConj[midx][esymx]) >= maxl) {
				continue;
			}
			if (phase2(eidxx, esymx, cidxx, csymx, midx, maxl-1, depth+1, m)) {
				move[depth] = Util.ud2std[m];
				return true;
			}
		}
		return false;
	}
	
	private String solutionToString() {
		StringBuffer sb = new StringBuffer();
		int urf = (verbose & INVERSE_SOLUTION) != 0 ? (urfIdx + 3) % 6 : urfIdx;
		if (urf < 3) {
			for (int s=0; s<depth1; s++) {
				sb.append(Util.move2str[CubieCube.urfMove[urf][move[s]]]).append(' ');
			}
			if ((verbose & USE_SEPARATOR) != 0) {
				sb.append(".  ");
			}
			for (int s=depth1; s<sol; s++) {
				sb.append(Util.move2str[CubieCube.urfMove[urf][move[s]]]).append(' ');
			}
		} else {
			for (int s=sol-1; s>=depth1; s--) {
				sb.append(Util.move2str[CubieCube.urfMove[urf][move[s]]]).append(' ');
			}
			if ((verbose & USE_SEPARATOR) != 0) {
				sb.append(".  ");
			}
			for (int s=depth1-1; s>=0; s--) {
				sb.append(Util.move2str[CubieCube.urfMove[urf][move[s]]]).append(' ');
			}
		}
		if ((verbose & APPEND_LENGTH) != 0) {
			sb.append("(").append(sol).append("f)");
		}
		return sb.toString();
	}
}
