package cg.fivephase;

import static cg.fivephase.Constants.*;

import java.io.File;

public final class PruningStage4 extends Pruning {

	void init (){
		int i;
		fname = new File( tables_path, "stage4_"+METRIC_STR+"_prune.rbk" );

		// Definition of the allowed moves.
		num_moves = N_STAGE4_SLICE_MOVES;

		// Creation of the pruning table.
		num_positions = N_STAGE4_SYMEDGE_CONFIGS*N_STAGE4_CORNER_CONFIGS*N_STAGE4_CENTER_CONFIGS;
		int n = (int)(num_positions/4 + 1);
		ptable = new byte[n];
		for (i = 0; i < n; ++i) {
			ptable[i] = 0;
		}
		n_packed = (int)(num_positions/5 + 1);
		ptable_packed = new byte[n_packed];

		// Fill the solved states.
		for (i = 0; i < STAGE4_NUM_SOLVED_CENTER_CONFIGS; ++i) {
			set_dist( Tables.bm4of8_to_70[stage4_solved_centers_bm[i]], 3);
		}
		unique_count = 5;
		back_dist = 12;
	}

	long do_move (long idx, int move){
		byte cen = (byte)(idx % N_STAGE4_CENTER_CONFIGS);
		int rest = (int)(idx / N_STAGE4_CENTER_CONFIGS);
		short cor = (short) (rest % N_STAGE4_CORNER_CONFIGS);
		int edge = rest / N_STAGE4_CORNER_CONFIGS;
	
		int newEdge = Tables.move_table_symEdgeSTAGE4[edge][move];
		int sym = newEdge & 0xF;
		int edgeRep = newEdge >> 4;

		cen = Tables.move_table_cenSTAGE4[cen][move];
		cen = Tables.move_table_cen_conjSTAGE4[cen][sym];

		cor = Tables.move_table_cornerSTAGE4[cor][move];
		cor = Tables.move_table_corner_conjSTAGE4[cor][sym];

		return (edgeRep*N_STAGE4_CORNER_CONFIGS + cor) * N_STAGE4_CENTER_CONFIGS + cen;
	}

	void saveIdxAndSyms (long idx, int dist){
		set_dist (idx, dist);

		byte cen = (byte)(idx % N_STAGE4_CENTER_CONFIGS);
		int rest = (int)(idx / N_STAGE4_CENTER_CONFIGS);
		short cor = (short) (rest % N_STAGE4_CORNER_CONFIGS);
		int edge = rest / N_STAGE4_CORNER_CONFIGS;

		int symI = 0;
		int syms = Tables.hasSymEdgeSTAGE4[edge];
		while (syms != 0){
			if(( syms & 0x1 ) == 1 ){
				byte cen2 = Tables.move_table_cen_conjSTAGE4[cen][symI];
				short cor2 = Tables.move_table_corner_conjSTAGE4[cor][symI];
				set_dist ((edge*N_STAGE4_CORNER_CONFIGS + cor2) * N_STAGE4_CENTER_CONFIGS + cen2, dist);
			}
			symI++;
			syms >>= 1;
		}
	}

}
