package cg.fivephase;

public final class CubeStage2 {

	public int centerF;
	public int symF;
	public int centerB;
	public int symB;
	public int edge;

	public static PruningStage2EdgCen prune_table_edgcen;

	public final void copyTo (CubeStage2 cube1){
		cube1.edge = edge;
		cube1.centerF = centerF;
		cube1.symF = symF;
		cube1.centerB = centerB;
		cube1.symB = symB;
	}

	public boolean edges_center_solved (boolean front){
		int i;
		int cen;

		if (( edge != 0 ) && ( edge != 414 ))
			return false;

		if (front) cen = centerF;
		else cen = centerB;
		for (i=0; i < Constants.STAGE2_NUM_SOLVED_SYMCENTER_CONFIGS; i++)
			if (cen == Constants.stage2_solved_symcenters[i])
				return true;

		return false;
	}

	public boolean is_solved (){
		int i;

		if (( edge != 0 ) && ( edge != 414 ))
			return false;

		for (i=0; i < Constants.STAGE2_NUM_SOLVED_SYMCENTER_CONFIGS; i++)
			if ((centerF == centerB) && (centerB == Constants.stage2_solved_symcenters[i]) && (( symF & 0x8 ) == ( symB & 0x8 )) && ( ((( symF & 0x8 ) == 0 ) && ( edge == 414 )) || ((( symF & 0x8 ) != 0 ) && ( edge == 0 )) ))
				return true;

		return false;
	}

	public final void do_move (int move_code){

		int newCen;

		newCen = Tables.move_table_symCenterSTAGE2[centerF][Symmetry.moveConjugate2[move_code][symF]];
		symF = Symmetry.symIdxMultiply[newCen & 0xF][symF];
		centerF = newCen >> 4;

		newCen = Tables.move_table_symCenterSTAGE2[centerB][Symmetry.moveConjugate2[move_code][symB]];
		symB = Symmetry.symIdxMultiply[newCen & 0xF][symB];
		centerB = newCen >> 4;

		edge = Tables.move_table_edgeSTAGE2[edge][move_code];
	}

	/* Convert functions */

	public void convert_centers_to_std_cube (int u, CubeState result_cube){
		int i;
		int cbmb = Tables.cloc_to_bm[u];
		int udlrf = 0;
		for (i = 0; i < 24; ++i) {
			if ((cbmb & (1 << i)) == 0) {
				result_cube.m_cen[i] = (byte)(udlrf++/4);
			} else {
				result_cube.m_cen[i] = 5;
			}
		}
	}

	public void convert_edges_to_std_cube (CubeState result_cube){
		int i;
		byte[] t6 = new byte[4];
		int edgeFbm = Tables.bm4of8[edge / 6];
		Constants.perm_n_unpack (4, edge % 6, t6, 0);
		for (i = 0; i < 16; ++i)
			result_cube.m_edge[i] = (byte)i;

		byte f = 16;
		int b = 0;
		for (i = 0; i < 8; ++i) {
			if ((edgeFbm & (1 << i)) == 0) {
				result_cube.m_edge[16 + i] = (byte)(20 + t6[b++]);
			} else {
				result_cube.m_edge[16 + i] = f++;
			}
		}
	}
}
