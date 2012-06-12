package cg.fivephase;

import static cg.fivephase.Constants.*;

public final class Symmetry {

	static byte[][] symEdges = new byte[N_SYM_ALL][24];
	static byte[][] symCornersPerm = new byte[N_SYM_ALL][8];
	static byte[][] symCornersOrient = new byte[N_SYM_ALL][8];
	static byte[][] symCenters = new byte[N_SYM_ALL][24];

	static void init (){
		initSymTables();
		initInvSymIdx();
		initSymIdxMultiply();
		initMoveConjugate();
		initMoveConjugateStage();
	}

	static void initSymTables (){

		byte[] symRLEdges = {4, 5, 6, 7, 0, 1, 2, 3, 14, 15, 12, 13, 10, 11, 8, 9, 21, 20, 23, 22, 17, 16, 19, 18};
		byte[] symRLCorners = {1, 0, 3, 2, 5, 4, 7, 6};
		byte[] symRLCenters = {2, 3, 0, 1, 6, 7, 4, 5, 14, 15, 12, 13, 10, 11, 8, 9, 19, 18, 17, 16, 23, 22, 21, 20};

		int i, a, b, c, d, e, idx=0;
		CubeState cube = new CubeState();
		for (i = 0; i < 24; ++i) {
			cube.m_edge[i] = (byte)i;
			cube.m_cen[i] = (byte)i;
		}
		for (i = 0; i < 8; ++i) {
			cube.m_cor[i] = (byte)i;
		}

		for (a=0;a<2;a++){ //Inverse
			for (b=0;b<3;b++){ //SymUR3
				for (c=0;c<2;c++){ //SymU
					for (d=0;d<2;d++){ //SymF2
						for (e=0;e<2;e++){ //SymU2
							//SymLR2
							for (i=0; i<24; i++){
								symEdges[idx][i] = cube.m_edge[i];
								symEdges[idx+1][i] = cube.m_edge[symRLEdges[i]];
								symCenters[idx][i] = cube.m_cen[i];
								symCenters[idx+1][i] = cube.m_cen[symRLCenters[i]];
							}
							for (i=0; i<8; i++){
								symCornersPerm[idx][i] = (byte)(cube.m_cor[i] % 8);
								symCornersPerm[idx+1][i] = (byte)(cube.m_cor[symRLCorners[i]] % 8);
								symCornersOrient[idx][i] = (byte)(cube.m_cor[i] / 8);
								symCornersOrient[idx+1][i] = (byte)(3 + (cube.m_cor[symRLCorners[i]] / 8));
							}
							idx += 2;

							cube.do_move (Us2, FTM);
							cube.do_move (Ds2, FTM);
						}
						cube.do_move (Fs2, FTM);
						cube.do_move (Bs2, FTM);
					}
					cube.do_move (Us, FTM);
					cube.do_move (Ds3, FTM);
				}
				cube.do_move (Us3, FTM);
				cube.do_move (Ds, FTM);
				cube.do_move (Rs3, FTM);
				cube.do_move (Ls, FTM);
			}
			cube.inverse();
		}
	}

	static int[] invSymIdx = new int[N_SYM_ALL];

	static void initInvSymIdx(){

		for (int i=0; i<N_SYM_ALL; i++)
			for (int j=0; j<N_SYM_ALL; j++)
				if( symCornersPerm[i][symCornersPerm[j][0]] == 0 &&
				    symCornersPerm[i][symCornersPerm[j][1]] == 1 &&
				    symCornersPerm[i][symCornersPerm[j][2]] == 2    ){
					invSymIdx[i] = j;
					break;
				}
	}

	static int[][] symIdxMultiply = new int[N_SYM_ALL][N_SYM_ALL];

	static void initSymIdxMultiply(){

		for (int i=0; i<N_SYM_ALL; i++)
			for (int j=0; j<N_SYM_ALL; j++)
				for (int k=0; k<N_SYM_ALL; k++)
					if( symEdges[k][0] == symEdges[i][symEdges[j][0]] &&
					    symEdges[k][1] == symEdges[i][symEdges[j][1]]    ){
						symIdxMultiply[i][j] = k;
						break;
					}
	}

	static int[][] moveConjugate = new int[N_BASIC_MOVES][N_SYM_ALL];

	static void initMoveConjugate(){

		CubeState cube = new CubeState();
		CubeState cube2 = new CubeState();
		CubeState cube3 = new CubeState();

		for (int i=0; i<N_BASIC_MOVES; i++){
			cube.init();
			cube.do_move(i);
			for (int j=0; j<N_SYM_ALL; j++){
				cube.copyTo(cube2);
				cube2.conjugate(j);
				for (int k=0; k<N_BASIC_MOVES; k++){
					cube3.init();
					cube3.do_move(k);
					boolean isMove = true;
					for (int l=0; l<24; l++){
						if( cube3.m_edge[l] != cube2.m_edge[l] ){
							isMove = false;
							break;
						}
					}
					if( isMove ){
						moveConjugate[i][j] = k;
						break;
					}
				}
			}
		}
	}

	static int[][] moveConjugate2 = new int[N_STAGE2_SLICE_MOVES][N_SYM_STAGE2];
	static int[][] moveConjugate3 = new int[N_STAGE3_SLICE_MOVES][N_SYM_STAGE3];
	static int[][] moveConjugate4 = new int[N_STAGE4_SLICE_MOVES][N_SYM_STAGE4];
	static int[][] moveConjugate5 = new int[N_STAGE5_MOVES][N_SYM_STAGE5];

	static void initMoveConjugateStage(){

		int i, j;

		for (i=0; i<N_STAGE2_SLICE_MOVES; i++)
			for (j=0; j<N_SYM_STAGE2; j++)
				moveConjugate2[i][j] = stage2_inv_slice_moves[moveConjugate[stage2_slice_moves[i]][j]];

		for (i=0; i<N_STAGE3_SLICE_MOVES; i++)
			for (j=0; j<N_SYM_STAGE3; j++)
				moveConjugate3[i][j] = stage3_inv_slice_moves[moveConjugate[stage3_slice_moves[i]][j]];

		for (i=0; i<N_STAGE4_SLICE_MOVES; i++)
			for (j=0; j<N_SYM_STAGE4; j++)
				moveConjugate4[i][j] = stage4_inv_slice_moves[moveConjugate[stage4_slice_moves[i]][j]];

		for (i=0; i<N_STAGE5_MOVES; i++)
			for (j=0; j<N_SYM_STAGE5; j++)
				moveConjugate5[i][j] = stage5_inv_slice_moves[moveConjugate[stage5_slice_moves[i]][j]];
	}
}
