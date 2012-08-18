package cs.threephase;
import java.util.*;
import java.io.*;
import static cs.threephase.Util.*;
import static cs.threephase.Moves.*;

public final class Edge3 implements Runnable {
	int[] edge = new int[12];
	int[] temp;

	static int[] prun;
	
	final static int[][] edgex = {	{ 3, 0, 1, 2, 4, 5, 6, 7, 8, 9,10,11},
									{ 2, 3, 0, 1, 4, 5, 6, 7, 8, 9,10,11},
									{ 1, 2, 3, 0, 4, 5, 6, 7, 8, 9,10,11},
									{ 0, 1, 2, 7, 4, 5, 6, 3, 8, 9,11,10},
									{ 8, 1, 2, 3, 4, 5,11, 7, 6, 9,10, 0},
									{ 6, 1, 2, 3, 4, 5, 0, 7,11, 9,10, 8},
									{11, 1, 2, 3, 4, 5, 8, 7, 0, 9,10, 6},
									{ 0, 1, 2, 3, 7, 4, 5, 6, 8, 9,10,11},
									{ 0, 1, 2, 3, 6, 7, 4, 5, 8, 9,10,11},
									{ 0, 1, 2, 3, 5, 6, 7, 4, 8, 9,10,11},
									{ 0, 5, 2, 3, 4, 1, 6, 7, 9, 8,10,11},
									{ 0, 1,10, 3, 9, 5, 6, 7, 8, 2, 4,11},
									{ 0, 1, 4, 3, 2, 5, 6, 7, 8,10, 9,11},
									{ 0, 1, 9, 3,10, 5, 6, 7, 8, 4, 2,11},
									{ 2, 3, 0, 1, 4, 5, 6, 7, 8,11,10, 9},
									{ 0, 1, 6, 7, 4, 5, 2, 3, 8, 9,11,10},
									{ 6, 1, 2, 5, 4, 3, 0, 7,11, 9,10, 8},
									{ 0, 1, 2, 3, 6, 7, 4, 5,10, 9, 8,11},
									{ 4, 5, 2, 3, 0, 1, 6, 7, 9, 8,10,11},
									{ 0, 7, 4, 3, 2, 5, 6, 1, 8,10, 9,11}};

	final static int[][] edgeox = {	{ 1, 2, 3, 0, 4, 5, 6, 7, 8, 9,10,11},
									{ 2, 3, 0, 1, 4, 5, 6, 7, 8, 9,10,11},
									{ 3, 0, 1, 2, 4, 5, 6, 7, 8, 9,10,11},
									{ 0, 1, 2, 7, 4, 5, 6, 3, 8, 9,11,10},
									{11, 1, 2, 3, 4, 5, 8, 7, 0, 9,10, 6},
									{ 6, 1, 2, 3, 4, 5, 0, 7,11, 9,10, 8},
									{ 8, 1, 2, 3, 4, 5,11, 7, 6, 9,10, 0},
									{ 0, 1, 2, 3, 5, 6, 7, 4, 8, 9,10,11},
									{ 0, 1, 2, 3, 6, 7, 4, 5, 8, 9,10,11},
									{ 0, 1, 2, 3, 7, 4, 5, 6, 8, 9,10,11},
									{ 0, 5, 2, 3, 4, 1, 6, 7, 9, 8,10,11},
									{ 0, 1, 9, 3,10, 5, 6, 7, 8, 4, 2,11},
									{ 0, 1, 4, 3, 2, 5, 6, 7, 8,10, 9,11},
									{ 0, 1,10, 3, 9, 5, 6, 7, 8, 2, 4,11},
									{ 2, 3, 0, 1, 4, 5, 6, 7,10, 9, 8,11},
									{ 4, 1, 2, 7, 0, 5, 6, 3, 8, 9,11,10},
									{ 6, 7, 2, 3, 4, 5, 0, 1,11, 9,10, 8},
									{ 0, 1, 2, 3, 6, 7, 4, 5, 8,11,10, 9},
									{ 0, 5, 6, 3, 4, 1, 2, 7, 9, 8,10,11},
									{ 0, 1, 4, 5, 2, 3, 6, 7, 8,10, 9,11}};
	
	private static int[] fact = {19958400, 1814400, 181440, 20160, 2520, 360, 60, 12, 3, 1};
	static int[] factX = {1, 1, 2/2, 6/2, 24/2, 120/2, 720/2, 5040/2, 40320/2, 362880/2, 3628800/2, 39916800/2, 479001600/2};
	
	int idx = 0;
	
	final static int MOD = 12;
	
	static int doneMod = 1;
	static byte[] modedTable = new byte[12*11*10*9*8*7*6*5*4*3/MOD/2];

	final static int SPLIT = 4;
	
	static int done = 0;
	static int depth = 0;
	static int depm3;// = depth % 3;
	static int depp3;// = 3 ^ ((depth+1) % 3);
	static boolean inv;// = depth > 10;
	static int check;// = inv ? 3 : depm3;
	static int found;// = inv ? depm3 : 3;	
	
	public void run() {
		int offset = 239500800 / SPLIT * idx;
		int[] mvarr = new int[17];
		for (int i=0; i<239500800 / SPLIT;) {
			int cx=prun[(i + offset)>>4];
			if (cx == -1 && !inv) {
				i+=16;
				continue;
			}
			for (int j=i+16; i<j; i++, cx>>=2) {
				if ((cx & 3) == check) {
					this.set(i + offset);
					for (int m=0; m<17; m++) {
						mvarr[m] = getmv(this.edge, m);
					}
					synchronized (prun) {
						for (int m=0; m<17; m++) {
							getAndSet(mvarr[m], depp3);
						}
					}
				}
			}
		}
	}
	
	static void getAndSet(int index, int value) {
		int shift = (index & 0x0f) << 1, idx = index >> 4;
		if (((prun[idx] >> shift) & 3) == 3) {
			prun[idx] ^= value << shift;
			++done;
			
			if (getPruning(modedTable, index/MOD) == 0xb) {
				setPruning(modedTable, index/MOD, depth+1);
				++doneMod;
			}

			if ((done & 0x3ffff) == 0) {
				System.out.print(String.format("%5.2f%%\t%d\r", done / 897632.96, doneMod));
			}
		}
	}

	public static double initStatus() {
		return done / 89763295.0;
	}

	static void createPrun() {
		System.out.println("Create Phase3 Edge Pruning Table...");
		prun = new int[12*11*10*9*8*7*6*5*4*3/16];
		Arrays.fill(prun, -1);
		Arrays.fill(modedTable, (byte)0xbb);
		setPruning(modedTable, 0, 0);
		prun[0] = 0xfffffffc;
		
		for (depth=0; depth<10; depth++) {
			depm3 = depth % 3;
			depp3 = 3 ^ ((depth+1) % 3);
			inv = depth > 10;
			check = inv ? 3 : depm3;
			found = inv ? depm3 : 3;
			Edge3[] ts = new Edge3[SPLIT];
			for (int i=0; i<SPLIT; i++) {
				ts[i] = new Edge3();
				ts[i].idx = i;
			}
			Thread[] r = new Thread[SPLIT];
			for (int i=0; i<SPLIT; i++) {
				r[i] = new Thread(ts[i]);
				r[i].start();
			}
			for (int i=0; i<SPLIT; i++) {
				try {
					r[i].join();
				} catch (Exception ea) {
					ea.printStackTrace();
				}
			}
			System.out.println(String.format("%2d%10d%10d", depth+1, done, doneMod));
		}
		prun = null;
		System.gc();
	}

	static void setPruning(byte[] table, int index, int value) {
		table[index >> 1] ^= (0x0b ^ value) << ((index & 1) << 2);
	}

	static int getPruning(byte[] table, int index) {
		return (table[index >> 1] >> ((index & 1) << 2)) & 0x0f;
	}

	static int getprunmod(int edge) {
		return getPruning(modedTable, edge/MOD);
	}

	int set(EdgeCube c) {
		if (temp == null) {
			temp = new int[12];
		}
		for (int i=0; i<12; i++) {
			temp[i] = i;
			edge[i] = c.ep[i+12]%12;
		}
		int parity = 0;
		for (int i=0; i<12; i++) {
			while (edge[i] != i) {
				int t = edge[i];
				edge[i] = edge[t];
				edge[t] = t;
				int s = temp[i];
				temp[i] = temp[t];
				temp[t] = s;
				parity ^= 1;
			}
		}
		for (int i=0; i<12; i++) {
			edge[i] = temp[c.ep[i]%12];
		}
		return parity;
	}

	static int getmv(int[] ep, int mv) {
		int[] movo = edgeox[mv];
		int[] mov = edgex[mv];
		int idx = 0;
		long val = 0xba9876543210L;
		for (int i=0; i<10; i++) {
			int v = movo[ep[mov[i]]] << 2;
			idx *= 12-i;
			idx += (val >> v) & 0xf;
			val -= 0x111111111110L << v;
		}
		return idx;	
	}
	
	static int[] movX = { 6,11, 0, 8, 2,10, 4, 9, 7, 3, 1, 5};
	static int[] movoX ={ 2,10, 4, 9, 6,11, 0, 8, 3, 7, 5, 1};

	int getmv_x() {
		int idx = 0;
		long val = 0xba9876543210L;
		for (int i=0; i<10; i++) {
			int v = movoX[edge[movX[i]]] << 2;
			idx *= 12-i;
			idx += (val >> v) & 0xf;
			val -= 0x111111111110L << v;
		}
		return idx;	
	}

	int get() {
		int idx = 0;
		long val = 0xba9876543210L;
		for (int i=0; i<10; i++) {
			int v = edge[i] << 2;
			idx *= 12-i;
			idx += (val >> v) & 0xf;
			val -= 0x111111111110L << v;
		}
		return idx;	
	}

	void set(int idx) {
		long val = 0xba9876543210L;
		int parity = 0;
		for (int i=0; i<11; i++) {
			int p = factX[11-i];
			int v = idx / p;
			idx -= v*p;
			parity ^= v;
			v <<= 2;
			edge[i] = (int) ((val >> v) & 0xf);
			long m = (1L << v) - 1;
			val = (val & m) + ((val >> 4) & ~m);
		}
		if ((parity & 1) == 0) {
			edge[11] = (int)val;
		} else {
			edge[11] = edge[10];
			edge[10] = (int)val;
		}
	}
}
