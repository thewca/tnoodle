package cg.fivephase;

import java.io.File;
import java.io.FileOutputStream;
import java.io.BufferedOutputStream;
import java.io.FileInputStream;
import java.io.BufferedInputStream;

abstract class Pruning {

	protected long num_positions;
	protected int n_packed;
	protected byte[] ptable;
	protected byte[] ptable_packed;
	protected int num_moves;
	protected long count = 0;
	protected int unique_count = 0;
	protected File fname;
	protected int back_dist = 30;

	private static int[] nd = new int[30 * 4];
	private static byte[] get_packed = new byte[243*8];

	static {
		for (int i=0; i<243; i++) {
			for (int j=0; j<5; j++) {
				int l = i;
				for (int k=1; k<=j; k++)
					l /= 3;
				get_packed[i*8+j] = (byte)(l % 3);
			}
		}
		for (int i=0; i<30; i++) {
			for (int j=0; j<3; j++) {
				nd[i*4+j] = i + (j - i + 30 + 1) % 3 - 1;
			}
		}
	}

	abstract void init ();

	public int get_dist (long idx){
		return (ptable[(int)(idx>>2)] >> ((idx & 0x3) << 1)) & 0x3;
	}

	protected void set_dist (long idx, int value){
		ptable[(int)(idx>>2)] |= (byte)(value << ((idx & 0x3) << 1));
		count++;
	}

	abstract long do_move (long idx, int move);

	public void analyse (){
		int i, dist;
		long idx, old_count = 0;
		int max_dist = 30;	//MAX_DISTANCE;

		long new_count = count;
		for (dist = 0; dist < max_dist && new_count > 0 && dist < back_dist; ++dist) {
			System.out.println(" dist "+dist+": "+new_count+" positions.");
			old_count = count;
			for (idx = 0; idx < num_positions; ++idx) {
				if (get_dist(idx) == (((dist + 2) % 3) + 1)){
					generate (idx, 0, (dist % 3) + 1);
				}
			}
			new_count = count - old_count;
		}
		System.out.println("Switch to backward search");
		for (; dist < max_dist && new_count > 0; ++dist) {
			System.out.println(" dist "+dist+": "+new_count+" positions.");
			old_count = count;
			for (idx = 0; idx < num_positions; ++idx) {
				if (get_dist(idx) == 0){
					generate (idx, ((dist + 2) % 3) + 1, (dist % 3) + 1);
				}
			}
			new_count = count - old_count;
		}

		System.out.println("Generate "+count+" positions and "+unique_count+" unique.");

		System.out.println("Packing table: "+(num_positions/4+1)+" -> "+n_packed);
		pack();
	}

	protected void generate (long idx, int dist, int new_dist){
		int i, j;

		for (i = 0; i < num_moves; ++i) {
			long idx2 = do_move (idx, i);
			if (get_dist(idx2) == dist){
				unique_count++;
				if ( dist == 0 )
					saveIdxAndSyms( idx2, new_dist );
				else {
					saveIdxAndSyms( idx, new_dist );
					break;
				}
			}
		}
	}

	abstract void saveIdxAndSyms (long idx, int dist);

	private void pack (){ /* Taken from Chen Shuang's 8 step solver */
		for (int i=0; i<n_packed; i++) {
			int n = 1;
			int value = 0;
			for (int j=0; j<4; j++){
				value += n * (get_dist(4L*i+j) % 3);
				n *= 3;
			}
			if ((n_packed*4L+i) < num_positions)
				value += n * (get_dist(n_packed*4L+i) % 3);
			ptable_packed[i] = (byte)value;
		}
		ptable = null;
		System.gc();
	}

	public final int get_dist_packed(long idx) {
		if (idx < n_packed*4L) {
			int data = ptable_packed[(int)(idx >>> 2)]&0x0FF;
			return get_packed[(data<<3) | (int)(idx & 3)];
		} else {
			int data = ptable_packed[(int)(idx-n_packed*4L)]&0x0FF;
			return get_packed[(data<<3) | 4];
		}
	}

	public final int new_dist(long idx, int dist) {
		return nd[(dist << 2) | get_dist_packed(idx)];
	}
}
