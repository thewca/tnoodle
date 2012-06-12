package cg.fivephase;

import static cg.fivephase.Constants.*;

import java.util.Random;
import java.io.ObjectOutputStream;
import java.io.ObjectInputStream;
import java.io.PipedOutputStream;
import java.io.PipedInputStream;
import java.io.File;

public final class Search {

// EDGE CONVENTION:

// There are 24 "edge" cubies, numbered 0 to 23.
// The home positions of these cubies are labeled in the diagram below.
// Each edge cubie has two exposed faces, so there are two faces labelled with
// each number.

//             -------------
//             |    5  1   |
//             |12   UP  10|
//             | 8       14|
//             |    0  4   |
// -------------------------------------------------
// |   12  8   |    0  4   |   14 10   |    1  5   |
// |22  LHS  16|16  FRT  21|21  RHS  19|19  BAK  22|
// |18       20|20       17|17       23|23       18|
// |    9 13   |    6  2   |   11 15   |    7  3   |
// -------------------------------------------------
//             |    6  2   |
//             |13  DWN  11|
//             | 9       15|
//             |    3  7   |
//             -------------


// There are 8 "corner" cubies, numbered 0 to 7.
// The home positions of these cubies are labeled in the diagram below.
// Each corner cubie has three exposed faces, so there are three faces labelled
// with each number. Asterisks mark the primary facelet position. Orientation
// will be the number of clockwise rotations the primary facelet is from the
// primary facelet position where it is located.

//            +----------+
//            |*3*    *2*|
//            |    UP    |
//            |*0*    *1*|
// +----------+----------+----------+----------+
// | 7      0 | 0      1 | 1      2 | 2      3 |
// |   LEFT   |  FRONT   |  RIGHT   |  BACK    |
// | 7      4 | 4      5 | 5      6 | 6      7 |
// +----------+----------+----------+----------+
//            |*4*    *5*|
//            |   DOWN   |
//            |*7*    *6*|
//            +----------+

//For squares calculation, corners are numbered as given below.
//This makes the corners look much like a set of 8 edges of a
//given pair of inner slices.
//            +----------+
//            | 5      1 |
//            |    UP    |
//            | 0      4 |
// +----------+----------+----------+----------+
// | 5      0 | 0      4 | 4      1 | 1      5 |
// |   LEFT   |  FRONT   |  RIGHT   |  BACK    |
// | 3      6 | 6      2 | 2      7 | 7      3 |
// +----------+----------+----------+----------+
//            | 6      2 |
//            |   DOWN   |
//            | 3      7 |
//            +----------+

// There are 24 "center" cubies. For the squares analysis, they are numbered 0 to 23 as shown.
//             -------------
//             |           |
//             |    2  3   |
//             |    0  1   |
//             |           |
// -------------------------------------------------
// |           |           |           |           |
// |    9  8   |   16 18   |   12 13   |   22 20   |
// |   11 10   |   17 19   |   14 15   |   23 21   |
// |           |           |           |           |
// -------------------------------------------------
//             |           |
//             |    4  5   |
//             |    6  7   |
//             |           |
//             -------------

// For the other analyses, they are numbered 0 to 23 as shown.
//             -------------
//             |           |
//             |    3  1   |
//             |    0  2   |
//             |           |
// -------------------------------------------------
// |           |           |           |           |
// |   10  8   |   16 19   |   14 12   |   21 22   |
// |    9 11   |   18 17   |   13 15   |   23 20   |
// |           |           |           |           |
// -------------------------------------------------
//             |           |
//             |    6  4   |
//             |    5  7   |
//             |           |
//             -------------


	byte[] move_list_stage1 = new byte[50];
	byte[] move_list_stage2 = new byte[50];
	byte[] move_list_stage3 = new byte[50];
	byte[] move_list_stage4 = new byte[50];
	byte[] move_list_stage5 = new byte[50];
	int length1, length2, length3, length4, length5;
	int rotate, rotate2;
	int total_length;
	long endtime;

	byte[] move_list_sub_stage1 = new byte[50];
	byte[] move_list_sub_stage2 = new byte[50];
	byte[] move_list_sub_stage3 = new byte[50];
	byte[] move_list_sub_stage4 = new byte[50];
	byte[] move_list_sub_stage5 = new byte[50];
	int length1_sub, length2_sub, length3_sub, length4_sub, length5_sub, lengthall_sub;
	int best_sol;
	boolean found_sol;
	int r1, r2;
	int ori;
	int r1_sub, r2_sub;
	boolean found1, found2, found3;

	int solver_mode;
	static final int SUB_123 = 0;
	static final int SUB_234 = 1;
	static final int SUB_345 = 2;

	static int MAX_STAGE2 = 7;
	//static int MAX_STAGE2 = 6;
	static int MIN_STAGE3 = 7;

	static int MAX_STAGE3 = 9;
	static int MIN_STAGE4 = 8;

	static int MAX_STAGE4 = 10;
	static int MIN_STAGE5 = 8;

	CubeState c = new CubeState();
	CubeState cr = new CubeState();
	CubeState cr2 = new CubeState();
	CubeState c1 = new CubeState();
	CubeState c1r = new CubeState();
	CubeState c2 = new CubeState();
	CubeState c3 = new CubeState();
	CubeState c4 = new CubeState();

	CubeStage1[] list1 = new CubeStage1[20];
	CubeStage2[] list2 = new CubeStage2[20];
	// TODO: Use it for all stages or don't use it.

	int time_per_stage;

	static int DEBUG_LEVEL = 0;

	public String solve (CubeState cube, int timeOut, boolean inverse) {
		int i, j;

		Tools.init();
		for( i=0; i<20; i++ ){
			list1[i] = new CubeStage1();
			list2[i] = new CubeStage2();
		}

		time_per_stage = timeOut;

		StringBuffer sb;
		String sol = "";
		
		best_sol = 100;
		found_sol = false;
		for( j = 0; j < 3; j++ ){
			sb = new StringBuffer();
			cube.copyTo (c);
			cube.leftMultEdges  ( 16 );
			cube.leftMultCenters( 16 );
			cube.leftMultCorners( 16 );

			solver_mode = SUB_123;
			init_stage1 ();

			/* Prepare for next step */
			System.arraycopy(move_list_sub_stage1, 0, move_list_stage1, 0, length1_sub);
			length1 = length1_sub;
			found1 = false;

			solver_mode = SUB_234;
			init_stage2 ( r1_sub, ori );

			/* Prepare for next step */
			System.arraycopy(move_list_sub_stage2, 0, move_list_stage2, 0, length2_sub);
			length2 = length2_sub;
			found2 = false;

			solver_mode = SUB_345;
			init_stage3 ( r2_sub );

			if( ! found3 ) continue;
			found3 = false;
			best_sol = length1_sub + length2_sub + length3_sub + length4_sub + length5_sub;
			/* Transform rotations before outputing the solution */
			for (i = 0; i < length2_sub; ++i)
				move_list_sub_stage2[i] = xlate_r6[stage2_slice_moves[move_list_sub_stage2[i]]][rotate];
			for (i = 0; i < length3_sub; ++i)
				move_list_sub_stage3[i] = xlate_r6[stage3_slice_moves[move_list_sub_stage3[i]]][rotate2];
			for (i = 0; i < length4_sub; ++i)
				move_list_sub_stage4[i] = xlate_r6[stage4_slice_moves[move_list_sub_stage4[i]]][rotate2];
			for (i = 0; i < length5_sub; ++i)
				move_list_sub_stage5[i] = xlate_r6[stage5_slice_moves[move_list_sub_stage5[i]]][rotate2];

			if( inverse ){
				sb.append(print_move_list (length5_sub, move_list_sub_stage5, inverse));
				sb.append(print_move_list (length4_sub, move_list_sub_stage4, inverse));
				sb.append(print_move_list (length3_sub, move_list_sub_stage3, rotate2+3, inverse));
				sb.append(print_move_list (length2_sub, move_list_sub_stage2, rotate, inverse));
				sb.append(print_move_list (length1_sub, move_list_sub_stage1, inverse));
			}
			else{
				sb.append(print_move_list (length1_sub, move_list_sub_stage1, inverse));
				sb.append(print_move_list (length2_sub, move_list_sub_stage2, rotate, inverse));
				sb.append(print_move_list (length3_sub, move_list_sub_stage3, rotate2+3, inverse));
				sb.append(print_move_list (length4_sub, move_list_sub_stage4, inverse));
				sb.append(print_move_list (length5_sub, move_list_sub_stage5, inverse));
			}

			sol = sb.toString();
		}
		//System.out.println( best_sol );
		return sol;
	}

	public void init_stage1 () {
		CubeStage1 s1 = new CubeStage1();
		CubeStage1 s2 = new CubeStage1();
		CubeStage1 s3 = new CubeStage1();
		c.convert_to_stage1 (s1);

		int d = s1.getDistance();

		endtime = System.currentTimeMillis() + time_per_stage;

		total_length = 100;
		found1 = false;
		for (length1 = d; length1 < total_length; ++length1) {
			if( DEBUG_LEVEL >= 1 ) System.out.println( "Stage 1 - length "+length1 );
			if ( search_stage1 (s1, length1, 0, N_BASIC_MOVES, d, 0 )){
				break;
			}
		}
	}

	public boolean search_stage1 (CubeStage1 cube1, int depth, int moves_done, int last_move, int dist, int r){
		//CubeStage1 cube2 = new CubeStage1();
		int mov_idx, j;
		if (depth == 0){
			if (! cube1.is_solved ()) {
				return false;
			}
			return init_stage2 (r, 0);
		}
		for (mov_idx = 0; mov_idx < N_BASIC_MOVES; ++mov_idx) {
			if (stage1_slice_moves_to_try[last_move][mov_idx])
				continue;

			/* Move cube1 to list1[depth] */
			if (( METRIC == FTM ) || (( mov_idx % 6 ) < 3 ))
				list1[depth].corner = Tables.move_table_co[cube1.corner][basic_to_face[mov_idx]];
			else
				list1[depth].corner = cube1.corner;
			int newEdge = Tables.move_table_symEdgeSTAGE1[cube1.edge][Symmetry.moveConjugate[mov_idx][cube1.sym]];
			list1[depth].sym = Symmetry.symIdxMultiply[newEdge & 0x3F][cube1.sym];
			list1[depth].edge = newEdge >> 6 ;

			/* Compute new distance */
			int newDist = list1[depth].prune_table.new_dist(N_CORNER_ORIENT * list1[depth].edge + Tables.move_table_co_conj[list1[depth].corner][list1[depth].sym], dist);
			if (newDist > depth-1) continue;
			move_list_stage1[moves_done] = (byte)mov_idx;
			if (search_stage1 (list1[depth], depth - 1, moves_done + 1, mov_idx, newDist, r)) return true;
		}
		return false;
	}

	public boolean init_stage2 (int r, int orientation){
		int i;
		int cubeDistCenF1 = 0;
		int cubeDistCenB1 = 0;
		int d21 = 999;
		int cubeDistCenF2 = 0;
		int cubeDistCenB2 = 0;
		int d22 = 999;
		if( found1 && ( endtime < System.currentTimeMillis() )) return true;
		r1 = r;
		c.copyTo(c1);	

		c1.scramble( length1, move_list_stage1 );

		rotate = c1.m_cor[0] >> 3;
		switch (rotate) {
		case 0:
			break;	//no whole cube rotation
		case 1:
			c1.do_move (Ls3, FTM);
			c1.do_move (Rs, FTM);
			c1.do_move (Us3, FTM);
			c1.do_move (Ds, FTM);
			break;
		case 2:
			c1.do_move (Fs, FTM);
			c1.do_move (Bs3, FTM);
			c1.do_move (Us, FTM);
			c1.do_move (Ds3, FTM);
			break;
		default:
			System.out.println ("Invalid cube rotation state.");
		}

		int min2 = 999;
		if( solver_mode == SUB_234 ){
			endtime = System.currentTimeMillis() + time_per_stage;
			total_length = 100;
			found2 = false;
			length1 = 0;
		}
		if( solver_mode == SUB_123 )
			min2 = Math.min( MAX_STAGE2 + 1, total_length - length1 - MIN_STAGE3);

		CubeStage2 s1 = new CubeStage2();
		CubeStage2 s2 = new CubeStage2();

		if( orientation >= 0 ){
			c1.convert_to_stage2 (s1);
			cubeDistCenF1 = s1.prune_table_edgcen.ptable[N_STAGE2_EDGE_CONFIGS * s1.centerF + Tables.move_table_edge_conjSTAGE2[s1.edge][s1.symF]];
			if( cubeDistCenF1 < min2 ){
				cubeDistCenB1 = s1.prune_table_edgcen.ptable[N_STAGE2_EDGE_CONFIGS * s1.centerB + Tables.move_table_edge_conjSTAGE2[s1.edge][s1.symB]];
				if( cubeDistCenB1 < min2 ){
					d21 = Math.max(cubeDistCenF1, cubeDistCenB1);
				}
			}
		}

		if( orientation <= 0 ){
			c1.copyTo (c1r);
			c1r.leftMultEdges  ( 8 );
			c1r.leftMultCenters( 8 );
			c1r.leftMultCorners( 8 );
			c1r.convert_to_stage2 (s2);
			cubeDistCenF2 = s2.prune_table_edgcen.ptable[N_STAGE2_EDGE_CONFIGS * s2.centerF + Tables.move_table_edge_conjSTAGE2[s2.edge][s2.symF]];
			if( cubeDistCenF2 < min2 ){
				cubeDistCenB2 = s2.prune_table_edgcen.ptable[N_STAGE2_EDGE_CONFIGS * s2.centerB + Tables.move_table_edge_conjSTAGE2[s2.edge][s2.symB]];
				if( cubeDistCenB2 < min2 ){
					d22 = Math.max(cubeDistCenF2, cubeDistCenB2);
				}
			}
		}

		for (length2 = Math.min(d21, d22); length2 < min2; ++length2) {
			if( DEBUG_LEVEL >= 1 ) System.out.println( "  Stage 2 - length "+length2 );
			if((( length2 >= d21 ) && search_stage2 (s1, length2, 0, N_STAGE2_SLICE_MOVES, 0 )) ||
			   (( length2 >= d22 ) && search_stage2 (s2, length2, 0, N_STAGE2_SLICE_MOVES, 1 ))){
				return false;
			}
		}
		return false;
	}

	public boolean search_stage2 (CubeStage2 cube1, int depth, int moves_done, int last_move, int r ){
		//CubeStage2 cube2 = new CubeStage2();
		int mov_idx, mc, j;
		if (depth == 0) {
			if (! cube1.is_solved ()) {
				return false;
			}
			return init_stage3 (r);
		}
		for (mov_idx = 0; mov_idx < N_STAGE2_SLICE_MOVES; ++mov_idx) {
			if (stage2_slice_moves_to_try[last_move][mov_idx])
				continue;

			/* Move cube1 to list2[depth] */
			int newCen;
			newCen = Tables.move_table_symCenterSTAGE2[cube1.centerF][Symmetry.moveConjugate2[mov_idx][cube1.symF]];
			list2[depth].symF = Symmetry.symIdxMultiply[newCen & 0xF][cube1.symF];
			list2[depth].centerF = newCen >> 4;
			newCen = Tables.move_table_symCenterSTAGE2[cube1.centerB][Symmetry.moveConjugate2[mov_idx][cube1.symB]];
			list2[depth].symB = Symmetry.symIdxMultiply[newCen & 0xF][cube1.symB];
			list2[depth].centerB = newCen >> 4;
			list2[depth].edge = Tables.move_table_edgeSTAGE2[cube1.edge][mov_idx];

			int newDistCenF = list2[depth].prune_table_edgcen.ptable[N_STAGE2_EDGE_CONFIGS * list2[depth].centerF + Tables.move_table_edge_conjSTAGE2[list2[depth].edge][list2[depth].symF]];
			if (newDistCenF > depth-1) continue;
			int newDistCenB = list2[depth].prune_table_edgcen.ptable[N_STAGE2_EDGE_CONFIGS * list2[depth].centerB + Tables.move_table_edge_conjSTAGE2[list2[depth].edge][list2[depth].symB]];
			if (newDistCenB > depth-1) continue;
			move_list_stage2[moves_done] = (byte)mov_idx;
			if (search_stage2 (list2[depth], depth - 1, moves_done + 1, mov_idx, r)) return true;
		}
		return false;
	}

	public boolean init_stage3 (int r){
		int i;
		if ( found2 && ( endtime < System.currentTimeMillis()) ) return true;

		r2 = r;
		switch (r) {
		case 0:
			c1.copyTo(c2);
			break;	//no whole cube rotation
		case 1:
			c1r.copyTo(c2);
			break;	//no whole cube rotation
		default:
			System.out.println ("Invalid cube rotation state.");
		}

		c2.scramble( length2, move_list_stage2, stage2_slice_moves, Lf );

		rotate2 = rotate;

		if (c2.m_cen[16] < 4) {
			c2.do_move (Us, FTM);
			c2.do_move (Ds3, FTM);
			rotate2 += 3;
		}

		CubeStage3 s1 = new CubeStage3();
		c2.convert_to_stage3 (s1);

		if( solver_mode == SUB_345 ){
			endtime = System.currentTimeMillis() + time_per_stage;
			total_length = best_sol - length1_sub - length2_sub;
			found3 = false;
			length1 = 0;
			length2 = 0;
		}

		int min3;
		switch( solver_mode ){
			case SUB_234: 
				min3 = Math.min( MAX_STAGE3 + 1, total_length - length2 - MIN_STAGE4 );
				break;
			case SUB_123:
				min3 = total_length - length2 - length1;
				break;
			default:
				min3 = 999;
		}

		int cubeDistCen = s1.prune_table_cen.ptable[s1.center];
		if( cubeDistCen >= min3 ) return false;
		int cubeDistEdg = s1.prune_table_edg.ptable[( s1.edge<<1 ) + (s1.edge_odd?1:0)];
		int d3 = Math.max(cubeDistCen, cubeDistEdg);

		for (length3 = d3; length3 < min3; ++length3) {
			if(( DEBUG_LEVEL >= 1 ) && ( solver_mode != SUB_123 )) System.out.println( "    Stage 3 - length "+length3 );
			if( search_stage3 (s1, length3, 0, N_STAGE3_SLICE_MOVES )){
				if( solver_mode == SUB_123 ){
					if( DEBUG_LEVEL >= 1 ) System.out.println( "    Stage 3 - length "+length3 );
					total_length = length1+length2+length3;
					/* Save current solution */
					found1 = true;
					r1_sub = r1;
					ori = ( r2 == 0 ) ? 1 : -1;
					System.arraycopy(move_list_stage1, 0, move_list_sub_stage1, 0, length1);
					System.arraycopy(move_list_stage2, 0, move_list_sub_stage2, 0, length2);
					length1_sub = length1;
					length2_sub = length2;
				}
				return false;
			}
		}
		return false;
	}

	public boolean search_stage3 (CubeStage3 cube1, int depth, int moves_done, int last_move){
		CubeStage3 cube2 = new CubeStage3();
		int mov_idx, j;
		if (depth == 0) {
			if (! cube1.is_solved ()) {
				return false;
			}
			if(( solver_mode == SUB_123 ))
				return true;
			if(( solver_mode == SUB_234 ) || ( solver_mode == SUB_345 ))
				return init_stage4 ();
		}
		for (mov_idx = 0; mov_idx < N_STAGE3_SLICE_MOVES; ++mov_idx) {
			if (stage3_slice_moves_to_try[last_move][mov_idx])
				continue;

			/* Move cube1 to cube2 */
			cube2.edge = Tables.move_table_edgeSTAGE3[cube1.edge][mov_idx];
			cube2.edge_odd = cube1.edge_odd ^ stage3_move_parity[mov_idx];
			int newCen = Tables.move_table_symCenterSTAGE3[cube1.center][Symmetry.moveConjugate3[mov_idx][cube1.sym]];
			cube2.sym = Symmetry.symIdxMultiply[newCen & 0x7][cube1.sym];
			cube2.center = newCen >> 3;

			int newDistCen = cube2.prune_table_cen.ptable[cube2.center];
			if (newDistCen > depth-1) continue;
			int newDistEdg = cube2.prune_table_edg.ptable[( cube2.edge<<1 ) + (cube2.edge_odd?1:0)];
			if (newDistEdg > depth-1) continue;
			move_list_stage3[moves_done] = (byte)mov_idx;
			if (search_stage3 (cube2, depth - 1, moves_done + 1, mov_idx)) return true;
		}
		return false;
	}

	public boolean init_stage4 (){
		int i;
		if ( found_sol && ( endtime < System.currentTimeMillis())) return true;

		c2.copyTo(c3);
		c3.scramble( length3, move_list_stage3, stage3_slice_moves, Ff );
		CubeStage4 s1 = new CubeStage4();
		c3.convert_to_stage4 (s1);

		int d4 = s1.getDistance();

		int min4;
		if( solver_mode == SUB_345 )
			min4 = Math.min( MAX_STAGE4 + 1, total_length - length3 - MIN_STAGE5 );
		else
			min4 = total_length - length3 - length2;

		for (length4 = d4; length4 < min4; ++length4) {
			if( DEBUG_LEVEL >= 1 ) System.out.println( "      Stage 4 - length "+length4 );
			if( search_stage4 (s1, length4, 0, N_STAGE4_SLICE_MOVES, d4 )) {
				if( solver_mode == SUB_234 ){
					total_length = length2+length3+length4;
					/* Save current solution */
					found2 = true;
					r2_sub = r2;
					System.arraycopy(move_list_stage2, 0, move_list_sub_stage2, 0, length2);
					System.arraycopy(move_list_stage3, 0, move_list_sub_stage3, 0, length3);
					length2_sub = length2;
					length3_sub = length3;
				}
				return false;
			}
		}
		return false;
	}

	public boolean search_stage4 (CubeStage4 cube1, int depth, int moves_done, int last_move, int dist){
		CubeStage4 cube2 = new CubeStage4();
		int mov_idx, j;
		if (depth == 0) {
			if (! cube1.is_solved ()) {
				return false;
			}
			if( solver_mode == SUB_234 )
				return true;
			if( solver_mode == SUB_345 )
				return init_stage5 ();
		}
		for (mov_idx = 0; mov_idx < N_STAGE4_SLICE_MOVES; ++mov_idx) {
			if (stage4_slice_moves_to_try[last_move][mov_idx])
				continue;

			/* Move to cube2 */
			cube2.center = Tables.move_table_cenSTAGE4[cube1.center][mov_idx];
			cube2.corner = Tables.move_table_cornerSTAGE4[cube1.corner][mov_idx];
			int newEdge = Tables.move_table_symEdgeSTAGE4[cube1.edge][Symmetry.moveConjugate4[mov_idx][cube1.sym]];
			cube2.sym = Symmetry.symIdxMultiply[newEdge & 0xF][cube1.sym];
			cube2.edge = newEdge >> 4;

			/* Compute new distance */
			int newDist = cube2.prune_table.new_dist((( cube2.edge * N_STAGE4_CORNER_CONFIGS + Tables.move_table_corner_conjSTAGE4[cube2.corner][cube2.sym] ) * N_STAGE4_CENTER_CONFIGS ) + Tables.move_table_cen_conjSTAGE4[cube2.center][cube2.sym], dist);
			if (newDist > depth-1) continue;
			move_list_stage4[moves_done] = (byte)mov_idx;
			if (search_stage4 (cube2, depth - 1, moves_done + 1, mov_idx, newDist)) return true;
		}
		return false;
	}

	public boolean init_stage5 (){
		int i;

		c3.copyTo(c4);
		c4.scramble( length4, move_list_stage4, stage4_slice_moves );

		CubeStage5 s1 = new CubeStage5();
		c4.convert_to_stage5 (s1);

		int min5 = total_length-length4-length3;

		int cubeDistEdgCor = s1.prune_table_edgcor.ptable[s1.edge * N_STAGE5_CORNER_PERM + Tables.move_table_corner_conjSTAGE5[s1.corner][s1.sym]];
		if( cubeDistEdgCor >= min5 ) return false;
		int cubeDistEdgCen = s1.getDistanceEdgCen();
		int d5 = Math.max(cubeDistEdgCen, cubeDistEdgCor);

		for (length5 = d5; length5 < min5; ++length5) {
			if( search_stage5 (s1, length5, 0, N_STAGE5_MOVES, cubeDistEdgCen)){
				if( DEBUG_LEVEL >= 1 ) System.out.println( "        Stage 5 - length "+length5 );
				total_length = length3+length4+length5;
				/* Save current solution */
				found3 = true;
				found_sol = true;
				System.arraycopy(move_list_stage3, 0, move_list_sub_stage3, 0, length3);
				System.arraycopy(move_list_stage4, 0, move_list_sub_stage4, 0, length4);
				System.arraycopy(move_list_stage5, 0, move_list_sub_stage5, 0, length5);
				length3_sub = length3;
				length4_sub = length4;
				length5_sub = length5;
				return false;
			}
		}
		return false;
	}

	public boolean search_stage5 (CubeStage5 cube1, int depth, int moves_done, int last_move, int distEdgCen){
		CubeStage5 cube2 = new CubeStage5();
		int mov_idx, j;
		if (depth == 0) {
			if (! cube1.is_solved ()) {
				return false;
			}
			return true;
		}
		for (mov_idx = 0; mov_idx < N_STAGE5_MOVES; ++mov_idx) {
			if (sqs_slice_moves_to_try[last_move][mov_idx])
				continue;

			/* Move cube1 to cube2 */
			cube2.center = Tables.move_table_cenSTAGE5[cube1.center][mov_idx];
			cube2.corner = Tables.move_table_cornerSTAGE5[cube1.corner][mov_idx];
			int newEdge = Tables.move_table_symEdgeSTAGE5[cube1.edge][Symmetry.moveConjugate5[mov_idx][cube1.sym]];
			cube2.sym = Symmetry.symIdxMultiply[newEdge & 0x3F][cube1.sym];
			cube2.edge = newEdge >> 6;

			int newDistEdgCor = cube2.prune_table_edgcor.ptable[cube2.edge * N_STAGE5_CORNER_PERM + Tables.move_table_corner_conjSTAGE5[cube2.corner][cube2.sym]];
			if (newDistEdgCor > depth-1) continue;
			int newDistEdgCen = cube2.new_dist_edgcen(distEdgCen);
			if (newDistEdgCen > depth-1) continue;
			move_list_stage5[moves_done] = (byte)mov_idx;
			if (search_stage5 (cube2, depth - 1, moves_done + 1, mov_idx, newDistEdgCen)) return true;
		}
		return false;
	}
}
