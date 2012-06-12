package cg.fivephase;

public final class CubeStage5 {

	public int edge; // (1051584)
	public int sym; // (1051584)
	public int center; // (1728)
	public int corner; // (96)

	public static PruningStage5EdgCen prune_table_edgcen;
	public static PruningStage5EdgCor prune_table_edgcor;

	public final void copyTo (CubeStage5 cube1){
		cube1.center = center;
		cube1.corner = corner;
		cube1.edge = edge;
		cube1.sym = sym;
	}

	public final void do_move (int sqs_move_code){
		center = Tables.move_table_cenSTAGE5[center][sqs_move_code];
		corner = Tables.move_table_cornerSTAGE5[corner][sqs_move_code];

		int newEdge = Tables.move_table_symEdgeSTAGE5[edge][Symmetry.moveConjugate5[sqs_move_code][sym]];

		sym = Symmetry.symIdxMultiply[newEdge & 0x3F][sym];
		edge = newEdge >> 6;
	}

	public boolean is_solved (){

		if (center == 0 && corner == 0 && edge == 0) {
			return true;
		}
		if (edge == 21616 && Tables.move_table_corner_conjSTAGE5[corner][sym] == 66 && Tables.move_table_cen_conjSTAGE5[center][sym] == 143)
			return true;
		return false;
	}

	public boolean edges_corners_solved (){

		if (corner == 0 && edge == 0) {
			return true;
		}
		if (edge == 21616 && Tables.move_table_corner_conjSTAGE5[corner][sym] == 66)
			return true;
		return false;
	}

	public boolean edges_centers_solved (){

		if (center == 0 && edge == 0) {
			return true;
		}
		if (edge == 21616 && Tables.move_table_cen_conjSTAGE5[center][sym] == 143)
			return true;
		return false;
	}

	/* Convert functions */

	public void convert_edges_to_std_cube (int edge2, CubeState result_cube){
		int i;

		int ep1 = edge2 % 96;
		int ep2 = (edge2/96) % 96;
		int ep3 = edge2/(96*96);
		int rep = Tables.sqs_perm_to_rep[ep1/4];
		Constants.perm_n_unpack (4, ep1/4, result_cube.m_edge, 0);
		Constants.perm_n_unpack (4, Tables.sqs_rep_to_perm[rep][ep1 % 4], result_cube.m_edge, 4);
		rep = Tables.sqs_perm_to_rep[ep2/4];
		Constants.perm_n_unpack (4, ep2/4, result_cube.m_edge, 8);
		Constants.perm_n_unpack (4, Tables.sqs_rep_to_perm[rep][ep2 % 4], result_cube.m_edge, 12);
		rep = Tables.sqs_perm_to_rep[ep3/4];
		Constants.perm_n_unpack (4, ep3/4, result_cube.m_edge, 16);
		Constants.perm_n_unpack (4, Tables.sqs_rep_to_perm[rep][ep3 % 4], result_cube.m_edge, 20);
		for (i = 0; i < 24; ++i) {
			result_cube.m_edge[i] += 4*(i/4);
		}
	}

	private static byte sqs_to_std_cor[] = { 0, 2, 5, 7, 1, 3, 4, 6 };

	public void convert_corners_to_std_cube (CubeState result_cube){
		int i;
		byte[] old_m_cor = new byte[8];

		int rep = Tables.sqs_perm_to_rep[corner/4];
		Constants.perm_n_unpack (4, corner/4, old_m_cor, 0);
		Constants.perm_n_unpack (4, Tables.sqs_rep_to_perm[rep][corner % 4], old_m_cor, 4);
		for (i = 0; i < 8; ++i) {
			old_m_cor[i] += (byte)(4*(i/4));
		}

		//We must convert between "standard"-style cubie numbering and the "square"-style
		//cubie numbering for the corner and center cubies. Edge cubies need no such translation.
		for (i = 0; i < 8; ++i) {
			result_cube.m_cor[sqs_to_std_cor[i]] = sqs_to_std_cor[old_m_cor[i]];
		}
	}

	private static byte sqs_to_std_cen[] = {
		0,  2,  3,  1,  6,  4,  5,  7,
		8, 10, 11,  9, 14, 12, 13, 15,
		16, 18, 19, 17, 22, 20, 21, 23
	};

	public void convert_centers_to_std_cube (CubeState result_cube){
		int i;
		byte[] old_m_cen = new byte[24];

		int cen1 = center % 12;
		int cen2 = (center/12) % 12;
		int cen3 = center/(12*12);
		int x = (Tables.squares_cen_map[cen1] << 16) | (Tables.squares_cen_map[cen2] << 8) | Tables.squares_cen_map[cen3];
		int b = 0x800000;
		for (i = 0; i < 24; ++i) {
			old_m_cen[i] = (byte) (2*(i/8) + ((x & b) == 0 ? 0 : 1));
			b >>= 1;
		}

		//We must convert between "standard"-style cubie numbering and the "square"-style
		//cubie numbering for the corner and center cubies. Edge cubies need no such translation.
		for (i = 0; i < 24; ++i) {
			result_cube.m_cen[sqs_to_std_cen[i]] = (byte)(sqs_to_std_cen[4*old_m_cen[i]]/4);
		}
	}

	/* Pruning functions */

	public final int get_dist_edgcen (){
		int idx = edge * Constants.N_STAGE5_CENTER_PERM + Tables.move_table_cen_conjSTAGE5[center][sym];
		return prune_table_edgcen.get_dist_packed(idx);
	}

	public final int new_dist_edgcen (int dist){
		int idx = edge * Constants.N_STAGE5_CENTER_PERM + Tables.move_table_cen_conjSTAGE5[center][sym];
		return prune_table_edgcen.new_dist(idx, dist);
	}

	public int getDistanceEdgCen (){
		CubeStage5 cube1 = new CubeStage5();
		CubeStage5 cube2 = new CubeStage5();
		int mov_idx, mc, j, dist1, dist2;
		int nDist = 0;
		
		copyTo (cube1);
		dist1 = cube1.get_dist_edgcen();

		while (! cube1.edges_centers_solved()) {

			boolean noMoves=true;
			for (mov_idx = 0; mov_idx < Constants.N_STAGE5_MOVES; ++mov_idx) {
				cube1.copyTo (cube2);
				cube2.do_move (mov_idx);
				dist2 = cube2.get_dist_edgcen();

				if (((dist2+1) % 3) != dist1) continue;
				cube2.copyTo (cube1);
				nDist++;
				dist1 = dist2;
				noMoves=false;
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
