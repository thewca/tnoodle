package cs.sq12phase;

class Square {
	int edgeperm;		//number encoding the edge permutation 0-40319
	int cornperm;		//number encoding the corner permutation 0-40319
	boolean topEdgeFirst;	//true if top layer starts with edge left of seam
	boolean botEdgeFirst;	//true if bottom layer starts with edge right of seam
	int ml;			//shape of middle layer (+/-1, or 0 if ignored)
	
	static byte SquarePrun[] = new byte[40320 * 2];			//pruning table; #twists to solve corner|edge permutation
	
	static char TwistMove[] = new char[40320];			//transition table for twists
	static char TopMove[] = new char[40320];			//transition table for top layer turns
	static char BottomMove[] = new char[40320];			//transition table for bottom layer turns

//	static int Perm2Comb[] = new int[40320];
//	static int Comb2Perm[] = new int[70];
	
//	static int PermCombPrunEdge[] = new int[40320 * 70 * 4 * 2];
//	static int PermCombPrunCorner[] = new int[40320 * 70 * 4 * 2];

	private static int[] fact = {1, 1, 2, 6, 24, 120, 720, 5040};

	static void set8Perm(byte[] arr, int idx) {
		int val = 0x76543210;
		for (int i=0; i<7; i++) {
			int p = fact[7-i];
			int v = idx / p;
			idx -= v*p;
			v <<= 2;
			arr[i] = (byte) ((val >> v) & 07);
			int m = (1 << v) - 1;
			val = (val & m) + ((val >> 4) & ~m);
		}
		arr[7] = (byte)val;
	}

	static char get8Perm(byte[] arr) {
		int idx = 0;
		int val = 0x76543210;
		for (int i=0; i<7; i++) {
			int v = arr[i] << 2;
			idx = (8 - i) * idx + ((val >> v) & 07);
			val -= 0x11111110 << v;
		}
		return (char)idx;
	}

	static int[][] Cnk = new int[12][12];

	static int get8Comb(byte[] arr) {
		int idx = 0, r = 4;
		for (int i=0; i<8; i++) {
			if (arr[i] >= 4) {
				idx += Cnk[7-i][r--];
			}
		}
		return idx;
	}	
	
	static {
		init();
	}
	
	static void init() {
		for (int i=0; i<12; i++) {
			Cnk[i][0] = 1;
			Cnk[i][i] = 1;
			for (int j=1; j<i; j++) {
				Cnk[i][j] = Cnk[i-1][j-1] + Cnk[i-1][j];
			}
		}
		byte[] pos = new byte[8];
		byte temp;
		
//		for (int i=0; i<70; i++) {
//			Comb2Perm[i] = -1;
//		}
		
		for(int i=0;i<40320;i++){
			//twist
			set8Perm(pos, i);
//			int comb = get8Comb(pos);
//			if (Comb2Perm[comb] == -1) {
//				Comb2Perm[comb] = i;
//			}
//			assert comb<70;
//			Perm2Comb[i] = comb;
			
			temp=pos[2];pos[2]=pos[4];pos[4]=temp;
			temp=pos[3];pos[3]=pos[5];pos[5]=temp;
			TwistMove[i]=get8Perm(pos);
	
			//top layer turn
			set8Perm(pos, i);
			temp=pos[0]; pos[0]=pos[1]; pos[1]=pos[2]; pos[2]=pos[3]; pos[3]=temp;
			TopMove[i]=get8Perm(pos);

			//bottom layer turn
			set8Perm(pos, i);
			temp=pos[4]; pos[4]=pos[5]; pos[5]=pos[6]; pos[6]=pos[7]; pos[7]=temp;
			BottomMove[i]=get8Perm(pos);
		}	
	
		for (int i=0; i<40320*2; i++) {
			SquarePrun[i] = -1;
		}
		SquarePrun[0] = 0;
		int depth = 0;
		int done = 1;
		while (done < 40320 * 2) {
			boolean inv = depth >= 11;
			int find = inv ? -1 : depth;
			int check = inv ? depth : -1;
			++depth; 
			OUT:
			for (int i=0; i<40320*2; i++) {
				if (SquarePrun[i] == find) {
					int idx = i >> 1;
					int ml = i & 1;

					//try twist
					int idxx = TwistMove[idx]<<1 | (1-ml);
					if(SquarePrun[idxx] == check) {
						++done;
						SquarePrun[inv ? i : idxx] = (byte) (depth);
						if (inv) continue OUT;
					}

					//try turning top layer
					idxx = idx;
					for(int m=0; m<4; m++) {
						idxx = TopMove[idxx];
						if(SquarePrun[idxx<<1|ml] == check){
							++done;
							SquarePrun[inv ? i : (idxx<<1|ml)] = (byte) (depth);
							if (inv) continue OUT;
						}
					}
					assert idxx == idx;
					//try turning bottom layer
					for(int m=0; m<4; m++) {
						idxx = BottomMove[idxx];
						if(SquarePrun[idxx<<1|ml] == check){
							++done;
							SquarePrun[inv ? i : (idxx<<1|ml)] = (byte) (depth);
							if (inv) continue OUT;
						}
					}
					
				}
			}
//			++depth;
			System.out.print(depth);
			System.out.print('\t');
			System.out.println(done);
		}
/*
		for (int i=0; i<40320*4*70*2; i++) {
			PermCombPrunEdge[i] = -1;
		}
		PermCombPrunEdge[4] = 0;
		depth = 0;
		done = 1;
		boolean inv;
		int select, check;
		while (done < 40320 * 4 * 70 * 2) {
			inv = depth > 11;
			select = inv ? -1 : depth;
			check = inv ? depth : -1;
			depth++;

			OUT:
			for (int i=0; i<40320 * 4 * 70 * 2; i++) {
				if (PermCombPrunEdge[i] == select) {
					int corner = (i>>3)/70;
					int edge = Comb2Perm[(i>>3)%70];
					boolean topEdgeFirst = (i & 2) == 2;
					boolean botEdgeFirst = (i & 4) == 4;
					int ml = i & 1;
					
					//try twist
					int idxx = (TwistMove[corner] * 70 + Perm2Comb[TwistMove[edge]]) << 3 | (topEdgeFirst?2:0) | (botEdgeFirst?4:0) | (1-ml);
					if(PermCombPrunEdge[idxx] == check) {
						++done;
						PermCombPrunEdge[inv ? i : idxx] = depth;
						if (inv) continue OUT;
					}
					assert PermCombPrunEdge[idxx]==depth 
						|| PermCombPrunEdge[idxx]==depth-1 
						|| PermCombPrunEdge[idxx]==depth-2
						|| PermCombPrunEdge[idxx]==-1;

					//try turning top layer
					int edge0 = edge;
					int m = 0;
					while (m < 12) {
						topEdgeFirst = !topEdgeFirst;
						if (topEdgeFirst) {
							edge = TopMove[edge];
							m += 1;
						} else {
							corner = TopMove[corner];
							m += 2;
						}
						assert edge < 40320;
						idxx = (corner * 70 + Perm2Comb[edge]) << 3 | (topEdgeFirst?2:0) | (botEdgeFirst?4:0) | ml;
						if(PermCombPrunEdge[idxx] == check) {
							++done;
							PermCombPrunEdge[inv ? i : idxx] = depth;
							if (inv) continue OUT;
						}
					}
					assert m==12;
					assert edge0==edge;
					
					m=0;
					while (m < 12) {
						botEdgeFirst = !botEdgeFirst;
						if (botEdgeFirst) {
							edge = BottomMove[edge];
							m += 1;
						} else {
							corner = BottomMove[corner];
							m += 2;
						}
						idxx = (corner * 70 + Perm2Comb[edge]) << 3 | (topEdgeFirst?2:0) | (botEdgeFirst?4:0) | ml;
						if(PermCombPrunEdge[idxx] == check) {
							++done;
							PermCombPrunEdge[inv ? i : idxx] = depth;
							if (inv) continue OUT;
						}
					}

					
				}
			}
//			++depth;
			System.out.print(depth);
			System.out.print('\t');
			System.out.println(done);
		}

		for (int i=0; i<40320*4*70*2; i++) {
			PermCombPrunCorner[i] = -1;
		}
		PermCombPrunCorner[4] = 0;
		depth = 0;
		done = 1;
		while (done < 40320 * 4 * 70 * 2) {
			for (int i=0; i<40320 * 4 * 70 * 2; i++) {
				if (PermCombPrunCorner[i] == depth) {
					int edge = (i>>3)/70;
					int corner = Comb2Perm[(i>>3)%70];
					boolean topEdgeFirst = (i & 2) == 2;
					boolean botEdgeFirst = (i & 4) == 4;
					int ml = i & 1;
					
					//try twist
					int idxx = (TwistMove[edge] * 70 + Perm2Comb[TwistMove[corner]]) << 3 | (topEdgeFirst?2:0) | (botEdgeFirst?4:0) | (1-ml);
					if(PermCombPrunCorner[idxx] == -1) {
						++done;
						PermCombPrunCorner[idxx] = depth+1;
					}

					//try turning top layer
					int edge0 = edge;
					int m = 0;
					while (m < 12) {
						topEdgeFirst = !topEdgeFirst;
						if (topEdgeFirst) {
							edge = TopMove[edge];
							m += 1;
						} else {
							corner = TopMove[corner];
							m += 2;
						}
						assert edge < 40320;
						idxx = (edge * 70 + Perm2Comb[corner]) << 3 | (topEdgeFirst?2:0) | (botEdgeFirst?4:0) | ml;
						if(PermCombPrunCorner[idxx] == -1) {
							++done;
							PermCombPrunCorner[idxx] = depth+1;
						}
					}
					assert m==12;
					assert edge0==edge;
					
					m=0;
					while (m < 12) {
						botEdgeFirst = !botEdgeFirst;
						if (botEdgeFirst) {
							edge = BottomMove[edge];
							m += 1;
						} else {
							corner = BottomMove[corner];
							m += 2;
						}
						idxx = (edge * 70 + Perm2Comb[corner]) << 3 | (topEdgeFirst?2:0) | (botEdgeFirst?4:0) | ml;
						if(PermCombPrunCorner[idxx] == -1) {
							++done;
							PermCombPrunCorner[idxx] = depth+1;
						}
					}

					
				}
			}
			++depth;
			System.out.print(depth);
			System.out.print('\t');
			System.out.println(done);
		}*/
	}
	
//	public static void main(String[] args) {
//		init();
//	}
}
