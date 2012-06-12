package cg.fivephase;

import static cg.fivephase.Constants.*;

import java.io.File;

public final class PruningStage2EdgCen extends PruningFull {

	void init (){
		int i;
		fname = new File( tables_path, "stage2_edgcen_"+METRIC_STR+"_prune.rbk" );

		// Definition of the allowed moves.
		num_moves = N_STAGE2_SLICE_MOVES;

		// Creation of the pruning table.
		num_positions = N_SYMCENTER_COMBO4*N_STAGE2_EDGE_CONFIGS;
		ptable = new byte[num_positions];
		for (i = 0; i < num_positions; ++i) {
			ptable[i] = -1;
		}

		// Fill the (almost) solved states.
		for (i=0; i < STAGE2_NUM_SOLVED_SYMCENTER_CONFIGS; i++){
			ptable[stage2_solved_symcenters[i]*N_STAGE2_EDGE_CONFIGS + 414] = 0;
			count++;
			ptable[stage2_solved_symcenters[i]*N_STAGE2_EDGE_CONFIGS + 0  ] = 0;
			count++;
			unique_count++;
		}
		back_dist = 9;
	}

	int do_move (int idx, int move){
		short edge = (short)(idx % N_STAGE2_EDGE_CONFIGS);
		short cen = (short)(idx / N_STAGE2_EDGE_CONFIGS);

		short newCen = Tables.move_table_symCenterSTAGE2[cen][move];
		int sym = newCen & 0xF;
		int cenRep = newCen >> 4;

		edge = Tables.move_table_edgeSTAGE2[edge][move];
		edge = Tables.move_table_edge_conjSTAGE2[edge][sym];
		return cenRep*N_STAGE2_EDGE_CONFIGS + edge;
	}

	void saveIdxAndSyms (int idx, int dist){
		ptable[idx] = (byte)dist;
		count++;
		short edge = (short)(idx % N_STAGE2_EDGE_CONFIGS);
		short cen = (short)(idx / N_STAGE2_EDGE_CONFIGS);
		int symI = 0;
		int syms = Tables.hasSymCenterSTAGE2[cen];
		while (syms != 0){
			if(( syms & 0x1 ) == 1 ){
				short edge2 = Tables.move_table_edge_conjSTAGE2[edge][symI];
				ptable[cen*N_STAGE2_EDGE_CONFIGS + edge2] = (byte)dist;
				count++;
			}
			symI++;
			syms >>= 1;
		}
	}
}
