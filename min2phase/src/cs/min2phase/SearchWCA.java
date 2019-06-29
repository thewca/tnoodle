/**
    Copyright (C) 2015  Shuang Chen

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
package cs.min2phase;

/**
 * Rubik's Cube Solver.<br>
 * A much faster and smaller implemention of Two-Phase Algorithm.<br>
 * Symmetry is used to reduce memory used.<br>
 * Total Memory used is about 1MB.<br>
 * @author Shuang Chen
 */
public class SearchWCA extends Search {

	static String[] move2str = {
		"U", "U2", "U'", "R", "R2", "R'", "F", "F2", "F'",
		"D", "D2", "D'", "L", "L2", "L'", "B", "B2", "B'"
	};

	static java.util.HashMap<String, Integer> str2axis = new java.util.HashMap<String, Integer>();
	static {
		for (int i = 0; i < move2str.length; i++) {
			str2axis.put(move2str[i], i / 3 % 3);
		}
	}

	// for 6 urfIdx
	int[] firstMoveFilter;
	int[] lastMoveFilter;
	boolean isAxisRestricted;
	long startTime = 0;

	@Override
	public synchronized String solution(String facelets, int maxDepth, long probeMax, long probeMin, int verbose) {
		return solution(facelets, maxDepth, probeMax, probeMin, verbose, null, null);
	}

	public synchronized String solution(String facelets, int maxDepth, long probeMax, long probeMin, int verbose, String firstAxisRestrictionStr, String lastAxisRestrictionStr) {
		firstMoveFilter = new int[6];
		lastMoveFilter = new int[6];
		isAxisRestricted = false;
		if (firstAxisRestrictionStr != null) {
			if (!str2axis.containsKey(firstAxisRestrictionStr)) {
				return "Error 9";
			}
			int firstAxisRestriction = str2axis.get(firstAxisRestrictionStr);
			for (int i = 0; i < 3; i++) {
				firstMoveFilter[i] |= 0xe07 << CubieCube.urfMove[(3 - i) % 3][firstAxisRestriction * 3] / 3 * 3;
				lastMoveFilter[i + 3] |= 0xe07 << CubieCube.urfMove[(3 - i) % 3][firstAxisRestriction * 3] / 3 * 3;
			}
			isAxisRestricted = true;
		}
		if (lastAxisRestrictionStr != null) {
			if (!str2axis.containsKey(lastAxisRestrictionStr)) {
				return "Error 9";
			}
			int lastAxisRestriction = str2axis.get(lastAxisRestrictionStr);
			for (int i = 0; i < 3; i++) {
				lastMoveFilter[i] |= 0xe07 << CubieCube.urfMove[(3 - i) % 3][lastAxisRestriction * 3] / 3 * 3;
				firstMoveFilter[i + 3] |= 0xe07 << CubieCube.urfMove[(3 - i) % 3][lastAxisRestriction * 3] / 3 * 3;
			}
			isAxisRestricted = true;
		}
		init();
		startTime = System.currentTimeMillis();
		return super.solution(facelets, maxDepth, probeMax, probeMin, verbose);
	}

	@Override
	protected void initSearch() {
		super.initSearch();
		if (isAxisRestricted) {
			selfSym = 1;
			conjMask = (TRY_INVERSE ? 0 : 0x38) | (TRY_THREE_AXES ? 0 : 0x36);
			maxPreMoves = conjMask > 7 ? 0 : MAX_PRE_MOVES;
		}
	}

	@Override
	protected int phase1PreMoves(int maxl, int lm, CubieCube cc, int ssym) {
		if (maxl == maxPreMoves - 1 && (lastMoveFilter[urfIdx] >> lm & 1) != 0) {
			return 1;
		}
		return super.phase1PreMoves(maxl, lm, cc, ssym);
	}

	@Override
	protected int phase1(CoordCube node, int ssym, int maxl, int lm) {
		if (maxl == depth1 - 1 && (firstMoveFilter[urfIdx] >> lm & 1) != 0) {
			return 1;
		}
		return super.phase1(node, ssym, maxl, lm);
	}

	@Override
	protected int initPhase2Pre() {
		isRec = false;
		if (System.currentTimeMillis() - startTime >= (solution == null ? probeMax : probeMin)) {
			return 0;
		}
		probe = -1;
		return super.initPhase2Pre();
	}

	@Override
	protected int phase2(int edge, int esym, int corn, int csym, int mid, int maxl, int depth, int lm) {
		if (depth1 == 0 && depth == 1 && (firstMoveFilter[urfIdx] >> lm & 1) != 0) {
			return 1;
		}
		if (edge == 0 && corn == 0 && mid == 0 && (preMoveLen > 0 || (lastMoveFilter[urfIdx] >> Util.ud2std[lm] & 1) == 0)) {
			return maxl;
		}
		int moveMask = Util.ckmv2bit[lm];
		for (int m = 0; m < 10; m++) {
			if ((moveMask >> m & 1) != 0) {
				m += 0x42 >> m & 3;
				continue;
			}
			int midx = CoordCube.MPermMove[mid][m];
			int cornx = CoordCube.CPermMove[corn][CubieCube.SymMoveUD[csym][m]];
			int csymx = CubieCube.SymMult[cornx & 0xf][csym];
			cornx >>= 4;
			int edgex = CoordCube.EPermMove[edge][CubieCube.SymMoveUD[esym][m]];
			int esymx = CubieCube.SymMult[edgex & 0xf][esym];
			edgex >>= 4;
			int edgei = CubieCube.getPermSymInv(edgex, esymx, false);
			int corni = CubieCube.getPermSymInv(cornx, csymx, true);

			int prun = CoordCube.getPruning(CoordCube.EPermCCombPPrun,
			                                (edgei >> 4) * CoordCube.N_COMB + CoordCube.CCombPConj[CubieCube.Perm2CombP[corni >> 4] & 0xff][CubieCube.SymMultInv[edgei & 0xf][corni & 0xf]]);
			if (prun > maxl + 1) {
				return maxl - prun + 1;
			} else if (prun >= maxl) {
				m += 0x42 >> m & 3 & (maxl - prun);
				continue;
			}
			prun = Math.max(
			           CoordCube.getPruning(CoordCube.MCPermPrun,
			                                cornx * CoordCube.N_MPERM + CoordCube.MPermConj[midx][csymx]),
			           CoordCube.getPruning(CoordCube.EPermCCombPPrun,
			                                edgex * CoordCube.N_COMB + CoordCube.CCombPConj[CubieCube.Perm2CombP[cornx] & 0xff][CubieCube.SymMultInv[esymx][csymx]]));
			if (prun >= maxl) {
				m += 0x42 >> m & 3 & (maxl - prun);
				continue;
			}
			int ret = phase2(edgex, esymx, cornx, csymx, midx, maxl - 1, depth + 1, m);
			if (ret >= 0) {
				move[depth] = Util.ud2std[m];
				return ret;
			}
		}
		return -1;
	}

	@Override
	protected String solutionToString() {
		StringBuffer sb = new StringBuffer();
		int urf = (verbose & INVERSE_SOLUTION) != 0 ? (urfIdx + 3) % 6 : urfIdx;
		if (urf < 3) {
			for (int s = 0; s < sol; s++) {
				if ((verbose & USE_SEPARATOR) != 0 && s == depth1) {
					sb.append(".");
				}
				sb.append(move2str[CubieCube.urfMove[urf][moveSol[s]]]).append(' ');
			}
		} else {
			for (int s = sol - 1; s >= 0; s--) {
				sb.append(move2str[CubieCube.urfMove[urf][moveSol[s]]]).append(' ');
				if ((verbose & USE_SEPARATOR) != 0 && s == depth1) {
					sb.append(".");
				}
			}
		}
		if ((verbose & APPEND_LENGTH) != 0) {
			sb.append("(").append(sol).append("f)");
		}
		return sb.toString();
	}

}
