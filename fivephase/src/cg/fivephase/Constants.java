package cg.fivephase;

import java.io.File;
import java.io.FileOutputStream;
import java.io.ObjectOutputStream;
import java.io.FileInputStream;
import java.io.ObjectInputStream;


/**
 * Class containing all the constants used in the program, and some useful functions.
 */
public final class Constants{

	public static final String datafiles_path = "./fivestage444/";
	public static final String tables_path = "./fivestage444/";
	public static final int STM = 0;
	public static final int FTM = 1;
	public static int METRIC = FTM;
	public static String METRIC_STR = (METRIC == STM) ? "stm" : "ftm";

	public static final int N_SYM_ALL = 96; // With inverse.
	public static final int N_SYM = 48;
	public static final int N_SYM_STAGE1 = 48;
	public static final int N_SYM_STAGE2 = 16;
	public static final int N_SYM_STAGE3 = 8;
	public static final int N_SYM_STAGE4 = 16;
	public static final int N_SYM_STAGE5 = 48;

	public static final int N_CORNER_ORIENT = 2187;

	public static final int N_EDGE_COMBO8 = 735471;	// 24!/(16!*8!)
	public static final int N_SYMEDGE_COMBO8 = 15582;

	public static final int N_STAGE2_EDGE_CONFIGS = 420;
	public static final int N_STAGE2_CENTER_CONFIGS = 51482970;	// 24!/(16!*24*24)
	public static final int N_CENTER_COMBO4 = 10626;
	public static final int N_SYMCENTER_COMBO4 = 716;

	public static final int N_STAGE3_CENTER_CONFIGS = 900900;	//(16*15*14*13/24)*(12*11*10*9/24)
	public static final int N_STAGE3_SYMCENTER_CONFIGS = 113330;
	public static final int N_COMBO_16_8 = 12870;				//16!/(8!*8!)
	public static final int N_STAGE3_EDGE_PAR = 2;
	public static final int N_STAGE3_EDGE_CONFIGS = N_COMBO_16_8;	//16!/(8!*8!), does not include parity info

	public static final int N_STAGE4_CENTER_CONFIGS = 70;	//8!/(4!*4!)
	public static final int N_STAGE4_EDGE_CONFIGS = 88200;	//420*420/2
	public static final int N_STAGE4_SYMEDGE_CONFIGS = 5968;
	public static final int N_STAGE4_CORNER_CONFIGS = 420;	//8!/96

	public static final int N_STAGE5_EDGE_PERM = 96*96*96;
	public static final int N_STAGE5_SYMEDGE_PERM = 21908;
	public static final int N_STAGE5_CENTER_PERM = 12*12*12;
	public static final int N_STAGE5_CORNER_PERM = 96;

//slice rotate codes
	public static final int Uf  = 0;	//Up "face" (top slice) clockwise wrt top
	public static final int Uf3 = 1;	//Up "face" counter-clockwise
	public static final int Uf2 = 2;	//Up "face" 180 degrees

	public static final int Us  = 3;	//Up "slice" (upper inner slice) clockwise wrt top
	public static final int Us3 = 4;	//Up "slice" counter-clockwise
	public static final int Us2 = 5;	//Up "slice" 180 degrees

	public static final int Df  = 6;	//Down "face" (bottom slice) clockwise wrt bottom
	public static final int Df3 = 7;	//Down "face" counter-clockwise
	public static final int Df2 = 8;	//Down "face" 180 degrees

	public static final int Ds  = 9;	//Down "slice" (lower inner slice) clockwise wrt bottom
	public static final int Ds3 = 10;	//Down "slice" counter-clockwise
	public static final int Ds2 = 11;	//Down "slice" 180 degrees

	public static final int Lf  = 12;	//Left "face" (left-hand outer slice) clockwise wrt left side
	public static final int Lf3 = 13;	//Left "face" counter-clockwise
	public static final int Lf2 = 14;	//Left "face" 180 degrees

	public static final int Ls  = 15;	//Left "slice" (left-hand inner slice) clockwise wrt left side
	public static final int Ls3 = 16;	//Left "slice" counter-clockwise
	public static final int Ls2 = 17;	//Left "slice" 180 degrees

	public static final int Rf  = 18;	//Right "face" (right-hand outer slice) clockwise wrt right side
	public static final int Rf3 = 19;	//Right "face" counter-clockwise
	public static final int Rf2 = 20;	//Right "face" 180 degrees

	public static final int Rs  = 21;	//Right "slice" (right-hand inner slice) clockwise wrt right side
	public static final int Rs3 = 22;	//Right "slice" counter-clockwise
	public static final int Rs2 = 23;	//Right "slice" 180 degrees

	public static final int Ff  = 24;	//Front "face" (front outer slice) clockwise wrt front
	public static final int Ff3 = 25;	//Front "face" counter-clockwise
	public static final int Ff2 = 26;	//Front "face" 180 degrees

	public static final int Fs  = 27;	//Front "slice" (front inner slice) clockwise wrt front
	public static final int Fs3 = 28;	//Front "slice" counter-clockwise
	public static final int Fs2 = 29;	//Front "slice" 180 degrees

	public static final int Bf  = 30;	//Back "face" (rear outer slice) clockwise wrt back side
	public static final int Bf3 = 31;	//Back "face" counter-clockwise
	public static final int Bf2 = 32;	//Back "face" 180 degrees

	public static final int Bs  = 33;	//Back "slice" (rear inner slice) clockwise wrt back side
	public static final int Bs3 = 34;	//Back "slice" counter-clockwise
	public static final int Bs2 = 35;	//Back "slice" 180 degrees

	public static final int N_BASIC_MOVES  = Bs2 + 1;	//last rotate code plus one

	public static final int N_FACE_MOVES = 18;

	public static final int basic_to_face[] = {
	 0,  1,  2,  0,  1,  2,  3,  4,  5,  3,  4,  5,
	 6,  7,  8,  6,  7,  8,  9, 10, 11,  9, 10, 11,
	12, 13, 14, 12, 13, 14, 15, 16, 17, 15, 16, 17
	};

	public static final boolean stage1_slice_moves_to_try [][] = new boolean[N_BASIC_MOVES + 1][N_BASIC_MOVES];
	static{
		for (int i=0; i<N_BASIC_MOVES; i++) {
			for (int j=0; j<N_BASIC_MOVES; j++) {
				stage1_slice_moves_to_try[i][j] = (i/3 == j/3) || ((i/12 == j/12) && (i>j));
				if( METRIC == STM )
					stage1_slice_moves_to_try[i][j] |= (i/12 == j/12) && ((i%3) == (j%3)) && ((i%12) >= 3);
			}
			stage1_slice_moves_to_try[N_BASIC_MOVES][i] = false;
			if( METRIC == FTM ){
				stage1_slice_moves_to_try[i][Ds] = true;
				stage1_slice_moves_to_try[i][Ds3] = true;
				stage1_slice_moves_to_try[i][Ds2] = true;
				stage1_slice_moves_to_try[i][Ls] = true;
				stage1_slice_moves_to_try[i][Ls3] = true;
				stage1_slice_moves_to_try[i][Ls2] = true;
				stage1_slice_moves_to_try[i][Bs] = true;
				stage1_slice_moves_to_try[i][Bs3] = true;
				stage1_slice_moves_to_try[i][Bs2] = true;
			}
		}
		if( METRIC == FTM ){
			stage1_slice_moves_to_try[N_BASIC_MOVES][Ds] = true;
			stage1_slice_moves_to_try[N_BASIC_MOVES][Ds3] = true;
			stage1_slice_moves_to_try[N_BASIC_MOVES][Ds2] = true;
			stage1_slice_moves_to_try[N_BASIC_MOVES][Ls] = true;
			stage1_slice_moves_to_try[N_BASIC_MOVES][Ls3] = true;
			stage1_slice_moves_to_try[N_BASIC_MOVES][Ls2] = true;
			stage1_slice_moves_to_try[N_BASIC_MOVES][Bs] = true;
			stage1_slice_moves_to_try[N_BASIC_MOVES][Bs3] = true;
			stage1_slice_moves_to_try[N_BASIC_MOVES][Bs2] = true;
		}
	}

	public static final int N_STAGE2_SLICE_MOVES = 28;
	public static final byte stage2_slice_moves[] = {
	Uf, Uf3, Uf2, Us, Us3, Us2,
	Df, Df3, Df2, Ds, Ds3, Ds2,
	Lf2, Ls, Ls3, Ls2, Rf2, Rs, Rs3, Rs2,
	Ff2, Fs, Fs3, Fs2, Bf2, Bs, Bs3, Bs2
	};

	public static final int stage2_inv_slice_moves[] = new int[N_BASIC_MOVES];
	static {
		for (int i=0; i<N_STAGE2_SLICE_MOVES; i++) {
			stage2_inv_slice_moves[stage2_slice_moves[i]] = i;
		}
	}

	public static final boolean stage2_slice_moves_to_try [][] = new boolean[N_STAGE2_SLICE_MOVES + 1][N_STAGE2_SLICE_MOVES];
	static{
		for (int i=0; i<N_STAGE2_SLICE_MOVES; i++) {
			for (int j=0; j<N_STAGE2_SLICE_MOVES; j++) {
				stage2_slice_moves_to_try[i][j] = stage1_slice_moves_to_try[stage2_slice_moves[i]][stage2_slice_moves[j]];
			}
			stage2_slice_moves_to_try[N_STAGE2_SLICE_MOVES][i] = false;
			if( METRIC == FTM ){
				stage2_slice_moves_to_try[i][13] = false; // Ls
				stage2_slice_moves_to_try[i][14] = false; // Ls3
				stage2_slice_moves_to_try[i][25] = false; // Bs
				stage2_slice_moves_to_try[i][26] = false; // Bs3
			}
		}
		if( METRIC == FTM ){
			stage2_slice_moves_to_try[N_STAGE2_SLICE_MOVES][9] = true; // Ds
			stage2_slice_moves_to_try[N_STAGE2_SLICE_MOVES][10] = true; // Ds3
			stage2_slice_moves_to_try[N_STAGE2_SLICE_MOVES][11] = true; // Ds2
			stage2_slice_moves_to_try[N_STAGE2_SLICE_MOVES][15] = true; // Ls2
			stage2_slice_moves_to_try[N_STAGE2_SLICE_MOVES][27] = true; // Bs2
		}
	}

	public static final int N_STAGE3_SLICE_MOVES = 20;
	public static final byte stage3_slice_moves[] = {
	Uf, Uf3, Uf2, Us2,
	Df, Df3, Df2, Ds2,
	Lf2, Ls2, Rf2, Rs2,
	Ff2, Fs, Fs3, Fs2, Bf2, Bs, Bs3, Bs2
	};

	public static final int stage3_inv_slice_moves[] = new int[N_BASIC_MOVES];
	static {
		for (int i=0; i<N_STAGE3_SLICE_MOVES; i++) {
			stage3_inv_slice_moves[stage3_slice_moves[i]] = i;
		}
	}

	public static final boolean stage3_slice_moves_to_try [][] = new boolean[N_STAGE3_SLICE_MOVES + 1][N_STAGE3_SLICE_MOVES];
	static{
		for (int i=0; i<N_STAGE3_SLICE_MOVES; i++) {
			for (int j=0; j<N_STAGE3_SLICE_MOVES; j++) {
				stage3_slice_moves_to_try[i][j] = stage1_slice_moves_to_try[stage3_slice_moves[i]][stage3_slice_moves[j]];
			}
			stage3_slice_moves_to_try[N_STAGE3_SLICE_MOVES][i] = false;
			if( METRIC == FTM ){
				stage3_slice_moves_to_try[i][17] = false; // Bs
				stage3_slice_moves_to_try[i][18] = false; // Bs3
			}
		}
		if( METRIC == FTM ){
			stage3_slice_moves_to_try[N_STAGE3_SLICE_MOVES][7] = true; // Ds2
			stage3_slice_moves_to_try[N_STAGE3_SLICE_MOVES][9] = true; // Ls2
			stage3_slice_moves_to_try[N_STAGE3_SLICE_MOVES][19] = true; // Bs2
		}
	}

	public static boolean stage3_move_parity[] = {
		false, false, false, false,
		false, false, false, false,
		false, false, false, false,
		false, true,  true,  false,
		false, true,  true,  false
	};

	public static final int N_STAGE4_SLICE_MOVES = 16;
	public static final byte stage4_slice_moves[] = {
	Uf, Uf3, Uf2, Us2,
	Df, Df3, Df2, Ds2,
	Lf2, Ls2, Rf2, Rs2,
	Ff2, Fs2, Bf2, Bs2
	};

	public static final int stage4_inv_slice_moves[] = new int[N_BASIC_MOVES];
	static {
		for (int i=0; i<N_STAGE4_SLICE_MOVES; i++) {
			stage4_inv_slice_moves[stage4_slice_moves[i]] = i;
		}
	}

	public static final boolean stage4_slice_moves_to_try [][] = new boolean[N_STAGE4_SLICE_MOVES + 1][N_STAGE4_SLICE_MOVES];
	static{
		for (int i=0; i<N_STAGE4_SLICE_MOVES; i++) {
			for (int j=0; j<N_STAGE4_SLICE_MOVES; j++) {
				stage4_slice_moves_to_try[i][j] = stage1_slice_moves_to_try[stage4_slice_moves[i]][stage4_slice_moves[j]];
			}
			stage4_slice_moves_to_try[N_STAGE4_SLICE_MOVES][i] = false;
		}
		if( METRIC == FTM ){
			stage4_slice_moves_to_try[N_STAGE4_SLICE_MOVES][7] = true; // Ds2
			stage4_slice_moves_to_try[N_STAGE4_SLICE_MOVES][9] = true; // Ls2
			stage4_slice_moves_to_try[N_STAGE4_SLICE_MOVES][15] = true; // Bs2
		}
	}

	public static final int N_STAGE5_MOVES = 12;

	public static final byte stage5_slice_moves[] = { Uf2, Us2, Df2, Ds2, Lf2, Ls2, Rf2, Rs2, Ff2, Fs2, Bf2, Bs2 };

	public static final int stage5_inv_slice_moves[] = new int[N_BASIC_MOVES];
	static {
		for (int i=0; i<N_STAGE5_MOVES; i++) {
			stage5_inv_slice_moves[stage5_slice_moves[i]] = i;
		}
	}

	public static final boolean sqs_slice_moves_to_try [][] = new boolean[N_STAGE5_MOVES + 1][N_STAGE5_MOVES];
	static{
		for (int i=0; i<N_STAGE5_MOVES; i++) {
			for (int j=0; j<N_STAGE5_MOVES; j++) {
				sqs_slice_moves_to_try[i][j] = stage1_slice_moves_to_try[stage5_slice_moves[i]][stage5_slice_moves[j]];
			}
			sqs_slice_moves_to_try[N_STAGE5_MOVES][i] = false;
		}
		if( METRIC == FTM ){
			sqs_slice_moves_to_try[N_STAGE5_MOVES][3] = true; // Ds2
			sqs_slice_moves_to_try[N_STAGE5_MOVES][5] = true; // Ls2
			sqs_slice_moves_to_try[N_STAGE5_MOVES][11] = true; // Bs2
		}
	}

	public static byte xlate_r6[][] = {
	{ 0, 24, 12,  0, 24, 12}, { 1, 25, 13,  1, 25, 13}, { 2, 26, 14,  2, 26, 14},
	{ 3, 27, 15,  3, 27, 15}, { 4, 28, 16,  4, 28, 16}, { 5, 29, 17,  5, 29, 17},
	{ 6, 30, 18,  6, 30, 18}, { 7, 31, 19,  7, 31, 19}, { 8, 32, 20,  8, 32, 20},
	{ 9, 33, 21,  9, 33, 21}, {10, 34, 22, 10, 34, 22}, {11, 35, 23, 11, 35, 23},
	{12,  0, 24, 24, 12,  0}, {13,  1, 25, 25, 13,  1}, {14,  2, 26, 26, 14,  2},
	{15,  3, 27, 27, 15,  3}, {16,  4, 28, 28, 16,  4}, {17,  5, 29, 29, 17,  5},
	{18,  6, 30, 30, 18,  6}, {19,  7, 31, 31, 19,  7}, {20,  8, 32, 32, 20,  8},
	{21,  9, 33, 33, 21,  9}, {22, 10, 34, 34, 22, 10}, {23, 11, 35, 35, 23, 11},
	{24, 12,  0, 18,  6, 30}, {25, 13,  1, 19,  7, 31}, {26, 14,  2, 20,  8, 32},
	{27, 15,  3, 21,  9, 33}, {28, 16,  4, 22, 10, 34}, {29, 17,  5, 23, 11, 35},
	{30, 18,  6, 12,  0, 24}, {31, 19,  7, 13,  1, 25}, {32, 20,  8, 14,  2, 26},
	{33, 21,  9, 15,  3, 27}, {34, 22, 10, 16,  4, 28}, {35, 23, 11, 17,  5, 29},
	{36, 48, 42, 36, 48, 42}, {37, 49, 43, 37, 49, 43}, {38, 50, 44, 38, 50, 44},
	{39, 51, 45, 39, 51, 45}, {40, 52, 46, 40, 52, 46}, {41, 53, 47, 41, 53, 47},
	{42, 36, 48, 48, 42, 36}, {43, 37, 49, 49, 43, 37}, {44, 38, 50, 50, 44, 38},
	{45, 39, 51, 51, 45, 39}, {46, 40, 52, 52, 46, 40}, {47, 41, 53, 53, 47, 41},
	{48, 42, 36, 45, 39, 51}, {49, 43, 37, 46, 40, 52}, {50, 44, 38, 47, 41, 53},
	{51, 45, 39, 42, 36, 48}, {52, 46, 40, 43, 37, 49}, {53, 47, 41, 44, 38, 50},
	{54, 60, 57, 54, 60, 57}, {55, 61, 58, 55, 61, 58}, {56, 62, 59, 56, 62, 59},
	{57, 54, 60, 60, 57, 54}, {58, 55, 61, 61, 58, 55}, {59, 56, 62, 62, 59, 56},
	{60, 57, 54, 58, 55, 61}, {61, 58, 55, 57, 54, 60}, {62, 59, 56, 59, 56, 62}
	};
	
	public static final int Cnk [][] = new int[25][25];
	static {
		for (int i=0; i<25; i++) {
			Cnk[i][i] = 1;
			Cnk[i][0] = 1;
		}
		for (int i=1; i<25; i++) {
			for (int j=1; j<=i; j++) {
				Cnk[i][j] = Cnk[i-1][j] + Cnk[i-1][j-1];
			}
		}
	}

	/**
	 * Extract an element from a table that stores eight numbers per byte.
	 * @param x	table index
	 * @param p	table
	 * @return	extracted value
	 */
	public static final byte get_value_1bit (int x, byte[] p)
	{
		int x2 = x >> 3;
		int j = x & 0x7;
		return (byte)((p[x2] >> j) & 0x1);
	}

	/**
	 * Write a 1 into a table.
	 * @param x	table index
	 * @param p	table
	 */
	public static final void set_1_1bit (int x, byte[] p)
	{
		int x2 = x >> 3;
		int j = x & 0x7;
		p[x2] |= (0x1 << j);
	}

	/**
	 * Converts an array of integers from 0 to n-1 into a corresponding number from 0 to n!-1.
	 * @param n		cardinal of the permutation
	 * @param array_in	permutation
	 * @param offset	index of the first element where the permutation starts in the table (can be >0)
	 * @return		an integer representing the permutation
	 */
	public static final int perm_n_pack (int n, byte[] array_in, int offset)
	{
		int idx;
		int i, j;

		idx = 0;

		for (i = 0; i < n; ++i) {
			idx *= (n - i);

			for (j = i + 1; j < n; ++j) {
				if (array_in[j+offset] < array_in[i+offset]) {
					++idx;
				}
			}
		}
		return idx;
	}

	/**
	 * Converts an integer into a permutation represented as an array of integers from 0 to n-1.
	 * @param n		cardinal of the permutation
	 * @param idx		an integer representing the permutation
	 * @param array_out	the permutation coded as an array of integers
	 * @param offset	index of the first element where the permutation is written in the table (can be >0)
	 */
	public static final void perm_n_unpack (int n, int idx, byte[] array_out, int offset)
	{
		int i, j;

		for (i = n - 1; i >= 0; --i) {
			array_out[i+offset] = (byte)(idx % (n - i));
			idx /= (n - i);

			for (j = i + 1; j < n; ++j) {
				if (array_out[j+offset] >= array_out[i+offset]) {
					array_out[j+offset]++;
				}
			}
		}
	}

	/**
	 * Compute the next permutation of an array of integers.
	 * @param array		array of integers representing the permutation
	 * @param length	length of the array
	 * @param offset	index of the first element where the permutation starts in the table (can be >0)
	 */
	public static final void nextPerm (byte[] array, int length, int offset){
		int j = length - 2;
		while (j >= 0 && ( array[j+offset] >= array[j+1+offset] ))
			--j;
			
		if (j < 0) return; // Already next perm.
		
		int m = length - 1;
		while (array[j+offset] >= array[m+offset])
			m--;
		byte temp = array[j+offset];
		array[j+offset] = array[m+offset];
		array[m+offset] = temp;
		
		int k = j + 1;
		m = length - 1;
		while (k < m) {
			temp = array[k+offset];
			array[k+offset] = array[m+offset];
			array[m+offset] = temp;
			k++;
			m--;
		}
	}

	public static final int STAGE2_NUM_SOLVED_SYMCENTER_CONFIGS = 6;
	public static final int stage2_solved_symcenters[] = {
	582, 606, 631, 641, 664, 673
	};

	public static final int STAGE3_NUM_SOLVED_SYM_CENTER_CONFIGS = 7;
	public static final int stage3_solved_sym_centers[] = {
	113311, 113319,	113320, 113322, 113323, 113324, 113329
	};

	public static final int STAGE4_NUM_SOLVED_CENTER_CONFIGS = 12;
	public static final short stage4_solved_centers_bm[] = {
	0x0F, 0xF0, 0x55, 0xAA, 0x5A, 0xA5, 0x69, 0x96, 0x66, 0x99, 0x3C, 0xC3
	};

	private static String move_strings[] = {
	"U", "U'", "U2", "u", "u'", "u2",
	"D", "D'", "D2", "d", "d'", "d2",
	"L", "L'", "L2", "l", "l'", "l2",
	"R", "R'", "R2", "r", "r'", "r2",
	"F", "F'", "F2", "f", "f'", "f2",
	"B", "B'", "B2", "b", "b'", "b2",
	"U", "U'", "U2", "Uw", "Uw'", "Uw2",
	"D", "D'", "D2", "Dw", "Dw'", "Dw2",
	"L", "L'", "L2", "Lw", "Lw'", "Lw2",
	"R", "R'", "R2", "Rw", "Rw'", "Rw2",
	"F", "F'", "F2", "Fw", "Fw'", "Fw2",
	"B", "B'", "B2", "Bw", "Bw'", "Bw2"
	};

	private static boolean rotate_move_stage23[][] = {
		// Stage 2
		{ true, false, false }, // no rotation
		{ false, false, true }, // [rd]
		{ false, true, false }, // [fu]
		// Stage 3
		{ true, true, false }, // no rotation
		{ true, false, true }, // [rd]
		{ false, true, true }, // [fu]
		{ true, false, true }, // [u]
		{ true, true, false }, // [rdu]
		{ false, true, true } // [fuu]
	};

	public static String print_move_list (int count, byte[] move_list, boolean inverse){
		int j, m;
		StringBuffer sb = new StringBuffer();
		if( inverse ){
			for (j = count-1; j >= 0; --j) {
				m = move_list[j];
				m = m + ((( m + 2 ) % 3 ) - 1); // inverse
				if( METRIC == FTM )
					m += 36;
				sb.append(move_strings[m] + ' ');
			}
		}
		else {
			for (j = 0; j < count; ++j) {
				m = move_list[j];
				if( METRIC == FTM )
					m += 36;
				sb.append(move_strings[m] + ' ');
			}
		}
		return sb.toString();
	}

	public static String print_move_list (int count, byte[] move_list, int rotate, boolean inverse){
		int j, m;
		StringBuffer sb = new StringBuffer();
		if( inverse ){
			for (j = count-1; j >= 0; --j) {
				m = move_list[j];
				m = m + ((( m + 2 ) % 3 ) - 1); // inverse
				if(( METRIC == FTM ) && (( m % 3 == 2 ) || rotate_move_stage23[rotate][m/12] ))
					m += 36;
				sb.append(move_strings[m] + ' ');
			}
		}
		else {
			for (j = 0; j < count; ++j) {
				m = move_list[j];
				if(( METRIC == FTM ) && (( m % 3 == 2 ) || rotate_move_stage23[rotate][m/12] ))
					m += 36;
				sb.append(move_strings[m] + ' ');
			}
		}
		return sb.toString();
	}
}
