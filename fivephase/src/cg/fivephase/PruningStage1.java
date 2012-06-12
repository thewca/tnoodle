package cg.fivephase;

import static cg.fivephase.Constants.*;

import java.io.File;

public final class PruningStage1 extends Pruning {

	void init (){
		int i;
		fname = new File( tables_path, "stage1_"+METRIC_STR+"_prune.rbk" );

		// Definition of the allowed moves.
		num_moves = N_BASIC_MOVES;

		// Creation of the pruning table.
		num_positions = N_CORNER_ORIENT*N_SYMEDGE_COMBO8;
		int n = (int)(num_positions/4 + 1);
		ptable = new byte[n];
		for (i = 0; i < n; ++i) {
			ptable[i] = 0;
		}
		n_packed = (int)(num_positions/5 + 1);
		ptable_packed = new byte[n_packed];

		// Fill the solved states.
		set_dist( 0*N_CORNER_ORIENT + 1906, 3);
		back_dist = 8;
	}

	long do_move (long idx, int move){
		short co = (short)(idx % N_CORNER_ORIENT);
		int edge = (int)(idx / N_CORNER_ORIENT);
		
		int newEdge = Tables.move_table_symEdgeSTAGE1[edge][move];
		int sym = newEdge & 0x3F;
		int edgeRep = newEdge >> 6;

		if (( METRIC == FTM ) || (( move % 6 ) < 3 ))
			co = Tables.move_table_co[co][basic_to_face[move]];
		co = Tables.move_table_co_conj[co][sym];

		return (long)(edgeRep*N_CORNER_ORIENT + co);
	}

	void saveIdxAndSyms (long idx, int dist){
		set_dist (idx, dist);

		short co = (short)(idx % N_CORNER_ORIENT);
		int edge = (int)(idx / N_CORNER_ORIENT);
		int symI = 0;
		long syms = Tables.hasSymEdgeSTAGE1[edge];
		while (syms != 0){
			if(( syms & 0x1L ) == 1 ){
				short co2 = Tables.move_table_co_conj[co][symI];
				set_dist (edge*N_CORNER_ORIENT + co2, dist);
			}
			symI++;
			syms >>= 1;
		}

	}
}
