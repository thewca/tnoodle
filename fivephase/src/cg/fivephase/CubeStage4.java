package cg.fivephase;

public final class CubeStage4 {

	public int center; //center coordinate (70)
	public int corner; //corner coordinate	(420)
	public int edge; //sym edge coordinate (5968*16)
	public int sym;

	public static byte sqs_to_std[] = { 0, 2, 5, 7, 1, 3, 4, 6 };

	public static PruningStage4 prune_table;

	public final void copyTo (CubeStage4 cube1){
		cube1.edge = edge;
		cube1.sym = sym;
		cube1.corner = corner;
		cube1.center = center;
	}

	public final void do_move (int move_code){
		center = Tables.move_table_cenSTAGE4[center][move_code];
		corner = Tables.move_table_cornerSTAGE4[corner][move_code];

		int newEdge = Tables.move_table_symEdgeSTAGE4[edge][Symmetry.moveConjugate4[move_code][sym]];

		sym = Symmetry.symIdxMultiply[newEdge & 0xF][sym];
		edge = newEdge >> 4;
	}

	public boolean is_solved (){
		int i;

		if (corner != 0) {
			return false;	//not solved if wrong corner value
		}
		if (edge != 0) {
			return false;	//not solved if wrong edge value
		}
		for (i = 0; i < Constants.STAGE4_NUM_SOLVED_CENTER_CONFIGS; ++i)
			if (center == Tables.bm4of8_to_70[Constants.stage4_solved_centers_bm[i]])
				return true;	//If we found a matching center value, then it is solved.

		return false;
	}

	/* Convert functions */

	public void convert_corners_to_std_cube (CubeState result_cube){
		int i;
		byte[] t6 = new byte[4];
		byte[] t8 = new byte[8];
		//Note: for corners, "squares" style mapping is used in creating the "coordinate" value.
		//But the do_move function for std_cube assumes "standard" mapping.
		//Therefore the m_cor array must be converted accordingly using this conversion array.
		int cor_bm = Tables.bm4of8[corner / 6];
		Constants.perm_n_unpack (4, corner % 6, t6, 0);
		int a = 0;
		int b = 0;
		for (i = 0; i < 8; ++i) {
			if ((cor_bm & (1 << i)) == 0) {
				t8[i] = (byte)(4 + t6[b++]);
			} else {
				t8[i] = (byte)a++;
			}
		}
		for (i = 0; i < 8; ++i) {
			result_cube.m_cor[sqs_to_std[i]] = sqs_to_std[t8[i]];
		}
	}

	public void convert_centers_to_std_cube (CubeState result_cube){
		int i;
		int cenbm = Tables.bm4of8[center];
		for (i = 0; i < 8; ++i) {
			if ((cenbm & (1 << i)) == 0) {
				result_cube.m_cen[i] = 1;
			} else {
				result_cube.m_cen[i] = 0;
			}
		}
		for (i = 8; i < 24; ++i) {
			result_cube.m_cen[i] = (byte)(i/4);
		}
	}

	/* Pruning functions */

	public final int get_idx (){
		return (( edge * Constants.N_STAGE4_CORNER_CONFIGS + Tables.move_table_corner_conjSTAGE4[corner][sym] ) * Constants.N_STAGE4_CENTER_CONFIGS ) + Tables.move_table_cen_conjSTAGE4[center][sym];
	}

	public final int get_dist (){
		return prune_table.get_dist_packed(get_idx());
	}

	public final int new_dist (int dist){
		return prune_table.new_dist(get_idx(), dist);
	}

	public int getDistance (){
		CubeStage4 cube1 = new CubeStage4();
		CubeStage4 cube2 = new CubeStage4();
		int mov_idx, j, dist1, dist2;
		int nDist = 0;

		copyTo(cube1);
		dist1 = cube1.get_dist();

		while( ! cube1.is_solved ()) {

			boolean noMoves = true;
			for (mov_idx = 0; mov_idx < Constants.N_STAGE4_SLICE_MOVES; ++mov_idx) {
				cube1.copyTo(cube2);
				cube2.do_move (mov_idx);
				dist2 = cube2.get_dist();
				if (((dist2+1) % 3) != dist1) continue;
				cube2.copyTo(cube1);
				nDist++;
				dist1 = dist2;
				noMoves = false;
				break;
			}
			if( noMoves){
				System.out.println("Could not find a move that lowers the distance !!");
				break;
			}
		}
		return nDist;
	}
}
