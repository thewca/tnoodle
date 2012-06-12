package cg.fivephase;

import static cg.fivephase.Constants.*;

import java.io.File;

public final class PruningStage3Edg extends PruningFull {

	void init (){
		int i;
		fname = new File( tables_path, "stage3_edg_"+METRIC_STR+"_prune.rbk" );

		// Definition of the allowed moves.
		num_moves = N_STAGE3_SLICE_MOVES;

		// Creation of the pruning table.
		num_positions = N_STAGE3_EDGE_CONFIGS*N_STAGE3_EDGE_PAR;
		ptable = new byte[num_positions];
		for (i = 0; i < num_positions; ++i) {
			ptable[i] = -1;
		}

		// Fill the solved states.
		ptable[494 << 1] = 0;
		count++;
		back_dist = 7;
	}

	int do_move (int idx, int move){
		int edge = idx >> 1;
		int par = idx & 0x1;

		int newEdge = Tables.move_table_edgeSTAGE3[edge][move];
		if( Constants.stage3_move_parity[move] )
			par = 1 - par;
		return (newEdge << 1) + par;
	}

	void saveIdxAndSyms (int idx, int dist){
		ptable[idx] = (byte)dist;
		count++;
	}
}
