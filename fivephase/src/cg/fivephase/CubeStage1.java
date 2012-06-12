package cg.fivephase;

import static cg.fivephase.Constants.Cnk;

public final class CubeStage1 {

	public int corner;
	public int edge;
	public int sym;

	public static PruningStage1 prune_table;

	public final void copyTo (CubeStage1 cube1){
		cube1.corner = corner;
		cube1.edge = edge;
		cube1.sym = sym;
	}

	public final void do_move (int move_code){
		if (( Constants.METRIC == Constants.FTM ) || (( move_code % 6 ) < 3 ))
			corner = Tables.move_table_co[corner][Constants.basic_to_face[move_code]];

		int newEdge = Tables.move_table_symEdgeSTAGE1[edge][Symmetry.moveConjugate[move_code][sym]];

		sym = Symmetry.symIdxMultiply[newEdge & 0x3F][sym];
		edge = newEdge >> 6 ;
	}

	public boolean is_solved (){
		if (( edge == 0 ) && Tables.move_table_co_conj[corner][sym] == 1906)
			return true;
		return false;
	}

	/* Convert functions */

	public void convert_edges_to_std_cube (int edge2, CubeState result_cube)
	{
		int r = 8;
		byte lrfb = 0;
		byte ud = 16;
		for (int i=23; i>=0; i--) {
			if (edge2 >= Cnk[i][r]) {
				edge2 -= Cnk[i][r--];
				result_cube.m_edge[i] = ud++;
			} else {
				result_cube.m_edge[i] = lrfb++;
			}
		}
	}

	public void convert_corners_to_std_cube (CubeState result_cube)
	{
		int i;

		int orientc = corner;
		int orientcmod3 = 0;
		for (i = 6; i >= 0; --i) {	//don't want 8th edge orientation
			byte fo = (byte)(orientc % 3);
			result_cube.m_cor[i] = (byte)(i + (fo << 3));
			orientcmod3 += fo;
			orientc /= 3;
		}
		result_cube.m_cor[7] = (byte)(7 + (((24 - orientcmod3) % 3) << 3));
	}

	/* Pruning functions */

	private final int get_idx (){
		return Constants.N_CORNER_ORIENT * edge + Tables.move_table_co_conj[corner][sym];
	}

	public final int get_dist (){
		return prune_table.get_dist_packed(get_idx());
	}

	public final int new_dist (int dist){
		return prune_table.new_dist(get_idx(), dist);
	}

	public int getDistance (){
		CubeStage1 cube1 = new CubeStage1();
		CubeStage1 cube2 = new CubeStage1();
		int mov_idx, j, dist1, dist2;
		int nDist = 0;

		copyTo (cube1);
		dist1 = cube1.get_dist();

		while( ! cube1.is_solved ()) {

			boolean noMoves=true;
			for (mov_idx = 0; mov_idx < Constants.N_BASIC_MOVES; ++mov_idx) {
				cube1.copyTo (cube2);
				cube2.do_move (mov_idx);
				dist2 = cube2.get_dist();
				if (((dist2+1) % 3) != dist1) continue; // If distance is not lowered by 1, continue.
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
