package cs.threephase;
import java.util.*;
import java.io.*;
import static cs.threephase.Util.*;
import static cs.threephase.Moves.*;

final class Edge3 implements Runnable {
	int[] edge = new int[12];
	int[] temp;

	static int[] prun;
	static byte[] prunP = new byte[12*11*10*9*8*7*6*5*4*3/5];
	
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
	
	private static int[] ptb = new int[16 * 4];
	private static byte[] GetPacked = new byte[243*8];
	private static int[] fact = {19958400, 1814400, 181440, 20160, 2520, 360, 60, 12, 3, 1};
	static int[] factX = {1, 1, 2/2, 6/2, 24/2, 120/2, 720/2, 5040/2, 40320/2, 362880/2, 3628800/2, 39916800/2, 479001600/2};
	
	static void init() {
	
		for (int i=0; i<243; i++) {
			for (int j=0; j<5; j++) {
				int l = i;
				for (int k=1; k<=j; k++)
					l /= 3;
				GetPacked[i*8+j] = (byte)(l % 3);
			}
		}
		for (int i=0; i<16; i++) {
			for (int j=0; j<3; j++) {
				ptb[i*4+j] = i + (j - i + 18 + 1) % 3 - 1;
			}
		}

		initPrun();
	}
	
	static void initPrun() {
		if (!read(prunP, 0, prunP.length, "Edge3.prunP")) {
			createPrun();
			write(prunP, 0, prunP.length, "Edge3.prunP");
		}	
	}
	
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
					if (inv) {
						for (int m=0; m<17; m++) {
							if (getpruning2(getmv(this.edge, m)) == found) {
								setpruning2(i + offset, depp3);
								break;
							}
						}					
					} else {
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
	}
	
	static void getAndSet(int index, int value) {
		int shift = (index & 0x0f) << 1, idx = index >> 4;
		if (((prun[idx] >> shift) & 3) == 3) {
			prun[idx] ^= value << shift;
			++done;
			if ((done & 0x3ffff) == 0) {
				System.out.print(String.format("%5.2f%%\r", done / 2395008.0));
			}								
		}
	}
	
	final static int SPLIT = 2;
	
	int idx = 0;
	
	static int done = 0;
	static int depth = 0;
	
	static void createPrun() {
		System.out.println("Create Phase3 Edge Pruning Table...");
		prun = new int[12*11*10*9*8*7*6*5*4*3/16];
		Arrays.fill(prun, (int)-1);
		setpruning2(0, 3);
		
		for (depth=0; depth<13; depth++) {
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
			System.out.println(String.format("%2d%10d", depth+1, done));
		}

		for (int i=0; i<12*11*10*9*8*7*6*5*4*3/5; i++) {
			int n = 1;
			int value = 0;
			for (int j=0; j<4; j++) {
				value += n * getpruning2(4*i+j);
				n *= 3;
			}
			value += n * getpruning2(12*11*10*9*8*7*6*5*4*3/5*4+i);
			prunP[i] = (byte)value;
		}
		prun = null;
		System.gc();
	}
	
	final static void setpruning2(int index, int value) {
		int xorv = value << ((index & 0x0f) << 1);
		index >>= 4;
		
		synchronized(prun) {
			prun[index] ^= xorv;
			done++;
		}
	
//		prun[index >>> 4] ^= value << ((index & 0x0f) << 1);
		if ((done & 0x3ffff) == 0) {
			System.out.print(String.format("%5.2f%%\r", done / 2395008.0));
		}								
	}
	
	final static int getpruning2(int index) {
		return ((prun[index >>> 4] >>> (((index & 0x0f) << 1))) & 3);
	}
	
	final static int getpruningP(int index) {
		if (index < 12*11*10*9*8*7*6*5*4*3/5*4) {
			int data = prunP[index >>> 2]&0x0ff;
			return GetPacked[(data<<3) | (index & 3)];
		} else {
			int data = prunP[index-12*11*10*9*8*7*6*5*4*3/5*4]&0x0ff;
			return GetPacked[(data<<3) | 4];
		}
	}
	
	final static int getprun(int edge, int prun) {
		return ptb[(prun << 2) | getpruningP(edge)];
	}
	
	final int getprun(int edge) {
		int depth = 0;
		int depm3 = getpruningP(edge);
		while (edge!=0) {
			if (depm3 == 0) {
				depm3 = 2;
			} else {
				depm3--;
			}
			set(edge);
			for (int m=0; m<17; m++) {
				int edgex = getmv(this.edge, m);
				if (getpruningP(edgex)==depm3) {
					depth++;
					edge = edgex;
					break;
				}
			}
		}
		return depth;
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
