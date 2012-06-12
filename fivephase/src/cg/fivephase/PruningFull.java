package cg.fivephase;

import static cg.fivephase.Constants.*;

import java.io.File;
import java.io.FileOutputStream;
import java.io.BufferedOutputStream;
import java.io.FileInputStream;
import java.io.BufferedInputStream;

abstract class PruningFull {

	protected int num_positions;
	public byte[] ptable;
	protected int num_moves;
	protected int count = 0;
	protected int unique_count = 0;
	protected File fname;
	protected int back_dist = 16;

	abstract void init ();

	abstract int do_move (int idx, int move);

	public void analyse (){
		int i, dist;
		int idx, old_count = 0;
		int max_dist = 16;	//MAX_DISTANCE;

		int new_count = count;
		for (dist = 0; dist < max_dist && new_count > 0 && dist < back_dist; ++dist) {
			System.out.println(" dist "+dist+": "+new_count+" positions.");
			old_count = count;
			for (idx = 0; idx < num_positions; ++idx) {
				if (ptable[idx] == dist){
					generate (idx, -1, dist + 1);
				}
			}
			new_count = count - old_count;
		}
		System.out.println("Switch to backward search");
		for (; dist < max_dist && new_count > 0; ++dist) {
			System.out.println(" dist "+dist+": "+new_count+" positions.");
			old_count = count;
			for (idx = 0; idx < num_positions; ++idx) {
				if (ptable[idx] == -1){
					generate (idx, dist, dist + 1);
				}
			}
			new_count = count - old_count;
		}

		System.out.println("Generate "+count+" positions and "+unique_count+" unique.");
	}

	protected void generate (int idx, int dist, int new_dist){
		int i, j;

		for (i = 0; i < num_moves; ++i) {
			int idx2 = do_move (idx, i);
			if (ptable[idx2] == dist){
				unique_count++;
				if ( dist == -1 )
					saveIdxAndSyms( idx2, new_dist );
				else {
					saveIdxAndSyms( idx, new_dist );
					break;
				}
			}
		}
	}

	abstract void saveIdxAndSyms (int idx, int dist);

}
