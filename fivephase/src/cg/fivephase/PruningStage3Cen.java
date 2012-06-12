package cg.fivephase;

import static cg.fivephase.Constants.*;

import java.io.File;

public final class PruningStage3Cen extends PruningFull {

	void init (){
		int i;
		fname = new File( tables_path, "stage3_cen_"+METRIC_STR+"_prune.rbk" );

		// Definition of the allowed moves.
		num_moves = N_STAGE3_SLICE_MOVES;

		// Creation of the pruning table.
		num_positions = N_STAGE3_SYMCENTER_CONFIGS;
		ptable = new byte[num_positions];
		for (i = 0; i < num_positions; ++i) {
			ptable[i] = -1;
		}

		// Fill the solved states.
		for (i = 0; i < STAGE3_NUM_SOLVED_SYM_CENTER_CONFIGS; ++i) {
			ptable[stage3_solved_sym_centers[i]] = 0;
			count++;
		}
		back_dist = 7;
	}

	int do_move (int idx, int move){
		int newCen = Tables.move_table_symCenterSTAGE3[idx][move];
		int cenRep = newCen >> 3;

		return cenRep;
	}

	void saveIdxAndSyms (int idx, int dist){
		ptable[idx] = (byte)dist;
		count++;
	}

}
