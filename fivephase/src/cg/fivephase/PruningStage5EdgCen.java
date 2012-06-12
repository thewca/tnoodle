package cg.fivephase;

import static cg.fivephase.Constants.*;

import java.io.File;

public final class PruningStage5EdgCen extends Pruning {

	void init (){
		int i;
		fname = new File( tables_path, "stage5_edgcen_"+METRIC_STR+"_prune.rbk" );

		// Definition of the allowed moves.
		num_moves = N_STAGE5_MOVES;

		// Creation of the pruning table.
		num_positions = (long)(N_STAGE5_SYMEDGE_PERM*N_STAGE5_CENTER_PERM);
		int n = (int)(num_positions/4 + 1);
		ptable = new byte[n];
		for (i = 0; i < n; ++i) {
			ptable[i] = 0;
		}
		n_packed = (int)(num_positions/5 + 1);
		ptable_packed = new byte[n_packed];

		// Fill the solved states.
		set_dist(0, 3);
		set_dist(21616*N_STAGE5_CENTER_PERM+143, 3);
		back_dist = 11;
	}

	long do_move (long idx, int move){
		short cen = (short)(idx % N_STAGE5_CENTER_PERM);
		int edge = (int)(idx / N_STAGE5_CENTER_PERM);

		int newEdge = Tables.move_table_symEdgeSTAGE5[edge][move];
		int sym = newEdge & 0x3F;
		int edgeRep = newEdge >> 6;

		cen = Tables.move_table_cenSTAGE5[cen][move];
		cen = Tables.move_table_cen_conjSTAGE5[cen][sym];
		return edgeRep*N_STAGE5_CENTER_PERM + cen;
	}

	void saveIdxAndSyms (long idx, int dist){
		set_dist (idx, dist);

		int edge = (int)(idx / N_STAGE5_CENTER_PERM);
		short cen = (short)(idx % N_STAGE5_CENTER_PERM);
		int symI = 0;
		long syms = Tables.hasSymEdgeSTAGE5[edge];
		while (syms != 0){
			if(( syms & 0x1L ) == 1 ){
				short cen2 = Tables.move_table_cen_conjSTAGE5[cen][symI];
				set_dist (edge*N_STAGE5_CENTER_PERM + cen2, dist);
			}
			symI++;
			syms >>= 1;
		}
	}
}
