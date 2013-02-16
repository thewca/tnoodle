package puzzle;

import static net.gnehzr.tnoodle.utils.Utils.azzert;
import java.util.Random;

public class PyraminxSolver {
	public PyraminxSolver() {}

		/** There are 4 corners on the pyraminx that are in a fixed position.
		  * There are 3 different orientations for each corner.
		  *
		  *                         U
		  *     ____  ____  ____          ____  ____  ____ 
		  *    \    /\    /\    /   /\   \    /\    /\    /
		  *     \  /3 \  /0 \  /   /  \   \  /0 \  /3 \  /
		  *      \/____\/____\/   /____\   \/____\/____\/
		  *       \    /\    /   /\    /\   \    /\    /
		  *        \  /1 \  /   /  \0 /  \   \  /2 \  /
		  *         \/____\/   /____\/____\   \/____\/
		  *          \    /   /\    /\    /\   \    /
		  *           \  /   /  \1 /  \2 /  \   \  /
		  *            \/   /____\/____\/____\   \/
		  *               L                    R
		  *                  ____  ____  ____    
		  *                 \    /\    /\    /
		  *                  \  /1 \  /2 \  /
		  *                   \/____\/____\/
		  *                    \    /\    /
		  *                     \  /3 \  /
		  *                      \/____\/
		  *                       \    /
		  *                        \  /
		  *                         \/
		  *
		  *                         B
		  *
		  * There are 6 edges, each one having 2 different orientations.
		  * Dollars mark the primary facelet position.
		  *                         U
		  *     ____  ____  ____          ____  ____  ____ 
		  *    \    /\    /\    /   /\   \    /\    /\    /
		  *     \  /  \5$/  \  /   /  \   \  /  \5 /  \  /
		  *      \/____\/____\/   /____\   \/____\/____\/
		  *       \    /\    /   /\    /\   \    /\    /
		  *        \2 /  \1 /   /1$\  /3$\   \3 /  \4 /
		  *         \/____\/   /____\/____\   \/____\/
		  *          \    /   /\    /\    /\   \    /
		  *           \  /   /  \  /0$\  /  \   \  /
		  *            \/   /____\/____\/____\   \/
		  *               L                    R
		  *                  ____  ____  ____    
		  *                 \    /\    /\    /
		  *                  \  /  \0 /  \  /
		  *                   \/____\/____\/
		  *                    \    /\    /
		  *                     \2$/  \4$/
		  *                      \/____\/
		  *                       \    /
		  *                        \  /
		  *                         \/
		  *
		  *                         B
		  */
	static final int N_EDGE_PERM = 720; // Number of permutations of edges
	static final int N_EDGE_ORIENT = 32; // Number of orientations of edges
	static final int N_CORNER_ORIENT = 81; // Number of orientations of corners
	static final int N_ORIENT = N_EDGE_ORIENT * N_CORNER_ORIENT;
	static final int N_TIPS = 81; // Number of tips positions
	static final int N_MOVES = 8; // Number of moves
	static final int MAX_LENGTH = 20;
	static final String[] moveToString = {"U", "U'", "L", "L'", "R", "R'", "B", "B'"};
	static final String[] inverseMoveToString = {"U'", "U", "L'", "L", "R'", "R", "B'", "B"};
	static final String[] tipToString = {"u", "u'", "l", "l'", "r", "r'", "b", "b'"};

	static final int[] fact = {1, 1, 2, 6, 24, 120, 720}; // fact[x] = x!

	/**
	 * Converts the list of edges into a number representing the permutation of the edges.
	 * @param edges   edges representation (ori << 3 + perm)
	 * @return        an integer between 0 and 719 representing the permutation of 6 elements
	 */
	public static int packEdgePerm(int[] edges) {
		int idx = 0;
		int val = 0x543210;
		for (int i = 0; i < 5; i++) {
			int v = ( edges[i] & 0x7 ) << 2;
			idx = (6 - i) * idx + ((val >> v) & 0x7);
			val -= 0x111110 << v;
		}
		return idx;
	}

	/**
	 * Converts an integer representing a permutation of 6 elements into a list of edges.
	 * @param perm     an integer between 0 and 719 representing the permutation of 6 elements
	 * @param edges    edges representation (ori << 3 + perm)
	 */
	private static void unpackEdgePerm(int perm, int[] edges) {
		int val = 0x543210;
		for (int i = 0; i < 5; i++) {
			int p = fact[5-i];
			int v = perm / p;
			perm -= v*p;
			v <<= 2;
			edges[i] = (val >> v) & 0x7;
			int m = (1 << v) - 1;
			val = (val & m) + ((val >> 4) & ~m);
		}
		edges[5] = val;
	}

	/**
	 * Converts the list of edges into a number representing the orientation of the edges.
	 * @param edges    edges representation (ori << 3 + perm)
	 * @return         an integer between 0 and 31 representing the orientation of 5 elements (the 6th is fixed)
	 */
	public static int packEdgeOrient(int[] edges) {
		int ori = 0;
		for (int i=0; i<5; i++) {
			ori = 2 * ori + ( edges[i] >> 3 );
		}
		return ori;
	}

	/**
	 * Converts an integer representing the orientation of 5 elements into a list of cubies.
	 * @param ori      an integer between 0 and 31 representing the orientation of 5 elements (the 6th is fixed)
	 * @param edges    edges representation (ori << 3 + perm)
	 */
	private static void unpackEdgeOrient(int ori, int[] edges) {
		int sum_ori = 0;
		for (int i = 4; i >= 0; i--) {
			edges[i] = ( ori & 1 ) << 3;
			sum_ori ^= ori & 1;
			ori >>= 1;
		}
		edges[5] = sum_ori << 3;
	}

	/**
	 * Converts the list of corners into a number representing the orientation of the corners.
	 * @param corners   corner representation
	 * @return          an integer between 0 and 80 representing the orientation of 4 elements
	 */
	public static int packCornerOrient(int[] corners) {
		int ori = 0;
		for (int i = 0; i < 4; i++) {
			ori = 3 * ori + corners[i];
		}
		return ori;
	}

	/**
	 * Converts an integer representing the orientation of 4 elements into a list of corners.
	 * @param ori       an integer between 0 and 80 representing the orientation of 4 elements
	 * @param corners   corners representation
	 */
	private static void unpackCornerOrient(int ori, int[] corners) {
		for (int i = 3; i >= 0; i--) {
			corners[i] = ori % 3;
			ori /= 3;
		}
	}

	/**
	 * Cycle three elements of an array. Also orient first and second elements.
	 * @param edges    edges representation (ori << 3 + perm)
	 * @param a        first element to cycle
	 * @param b        second element to cycle
	 * @param c        third element to cycle
	 * @param times    number of times to cycle
	 */
	private static void cycleAndOrient(int[] edges, int a, int b, int c, int times) {
		int temp = edges[c];
		edges[c] = (edges[b] + 8) % 16;
		edges[b] = (edges[a] + 8) % 16;
		edges[a] = temp;
		if( times > 1 )
			cycleAndOrient(edges, a, b, c, times - 1);
	}

	/**
	 * Apply a move on the edges representation.
	 * @param edges    edges representation (ori << 3 + perm)
	 * @param move     move to apply to the edges
	 */
	private static void moveEdges(int[] edges, int move) {
		int face = move / 2;
		int times = ( move % 2 ) + 1;
		switch (face) {
			case 0: // U face
				cycleAndOrient(edges, 5, 3, 1, times);
				break;
			case 1: // L face
				cycleAndOrient(edges, 2, 1, 0, times);
				break;
			case 2: // R face
				cycleAndOrient(edges, 0, 3, 4, times);
				break;
			case 3: // B face
				cycleAndOrient(edges, 2, 4, 5, times);
				break;
		}
	}

	/**
	 * Apply a move on the corners representation.
	 * @param corners  corners representation
	 * @param move     move to apply to the corners
	 */
	private static void moveCorners(int[] corners, int move) {
		int face = move / 2;
		int times = ( move % 2 ) + 1;
		corners[face] = ( corners[face] + times ) % 3;
	}

	/**
	 * Fill the arrays to move permutation and orientation coordinates.
	 */
	public static int[][] moveEdgePerm = new int[N_EDGE_PERM][N_MOVES];
	public static int[][] moveEdgeOrient = new int[N_EDGE_ORIENT][N_MOVES];
	public static int[][] moveCornerOrient = new int[N_CORNER_ORIENT][N_MOVES];
	private static void initMoves() {
		int[] edges1 = new int[6];
		int[] edges2 = new int[6];
		for (int perm=0; perm < N_EDGE_PERM; perm++) {
			unpackEdgePerm(perm, edges1);
			for (int move=0; move < N_MOVES; move++) {
				System.arraycopy(edges1, 0, edges2, 0, 6);
				moveEdges(edges2, move);
				int newPerm = packEdgePerm(edges2);
				moveEdgePerm[perm][move] = newPerm;
			}
		}

		for (int orient=0; orient < N_EDGE_ORIENT; orient++) {
			unpackEdgeOrient(orient, edges1);
			for (int move=0; move < N_MOVES; move++) {
				System.arraycopy(edges1, 0, edges2, 0, 6);
				moveEdges(edges2, move);
				int newOrient = packEdgeOrient(edges2);
				moveEdgeOrient[orient][move] = newOrient;
			}
		}

		int[] corners1 = new int[4];
		int[] corners2 = new int[4];
		for(int orient = 0; orient < N_CORNER_ORIENT; orient++) {
			unpackCornerOrient(orient, corners1);
			for(int move = 0; move < N_MOVES; move++) {
				System.arraycopy(corners1, 0, corners2, 0, 4);
				moveCorners(corners2, move);
				int newOrient = packCornerOrient(corners2);
				moveCornerOrient[orient][move] = newOrient;
			}
		}
	}

	/**
	 * Fill the pruning tables for the permutation and orientation coordinates.
	 */
	private static int[] prunPerm = new int[N_EDGE_PERM];
	private static int[] prunOrient = new int[N_ORIENT];
	private static void initPrun() {
		for (int perm = 0; perm < N_EDGE_PERM; perm++) {
			prunPerm[perm] = -1;
		}
		prunPerm[0] = 0;

		int done = 1;
		for(int length = 0; done < N_EDGE_PERM/2; length++) { // Only half of the permutations are accessible due to parity
			for(int perm = 0; perm < N_EDGE_PERM; perm++) {
				if(prunPerm[perm] == length) {
					for(int move=0; move < N_MOVES; move++) {
						int newPerm = moveEdgePerm[perm][move];
						if(prunPerm[newPerm] == -1) {
							prunPerm[newPerm] = length + 1;
							done++;
						}
					}
				}
			}
		}

		for(int orient = 0; orient < N_ORIENT; orient++) {
			prunOrient[orient] = -1;
		}
		prunOrient[0] = 0;

		done = 1;
		for(int length = 0; done < N_ORIENT; length++) {
			for(int orient = 0; orient < N_ORIENT; orient++) {
				if(prunOrient[orient] == length ) {
					for(int move=0; move < N_MOVES; move++) {
						int newEdgeOrient = moveEdgeOrient[orient % N_EDGE_ORIENT][move];
						int newCornerOrient = moveCornerOrient[orient / N_EDGE_ORIENT][move];
						int newOrient = newCornerOrient * N_EDGE_ORIENT + newEdgeOrient;
						if(prunOrient[newOrient] == -1) {
							prunOrient[newOrient] = length + 1;
							done++;
						}
					}
				}
			}
		}
	}

	static {
		initMoves();
		initPrun();
	}

	/**
	 * Search a solution from a position given by permutation and orientation coordinates
	 * @param edgePerm       edge permutation coordinate to solve
	 * @param edgeOrient     edge orientation coordinate to solve
	 * @param cornerOrient   corner orientation coordinate to solve
	 * @param depth          current depth of the search (first called with 0)
	 * @param length         the remaining number of moves we can apply
	 * @param last_move      what was the last move done (first called with an int >= 9)
	 * @param solution       the array containing the current moves done.
	 * @return               true if a solution was found (stored in the solution array)
	 *                       false if no solution was found
	 */
	private boolean search(int edgePerm, int edgeOrient, int cornerOrient, int depth, int length, int last_move, int solution[], Random randomiseMoves) {

		/* If there are no moves left to try (length=0), returns if the current position is solved */
		if( length == 0 ) {
			return ( edgePerm == 0 ) && ( edgeOrient == 0 ) && ( cornerOrient == 0 );
		}

		/* Check if we might be able to solve the permutation or the orientation of the position
		 * given the remaining number of moves ('length' parameter), using the pruning tables.
		 * If not, there is no point keeping searching for a solution, just stop.
		 */
		if(( prunPerm[edgePerm] > length ) || ( prunOrient[cornerOrient*N_EDGE_ORIENT+edgeOrient] > length ))
			return false;

		/* The recursive part of the search function.
		 * Try every move from the current position, and call the search function with the new position
		 * and the updated parameters (depth -> depth+1; length -> length-1; last_move -> move)
		 * We don't need to try a move of the same face as the last move.
		 * We randomise the move order by generating a random offset.
		 */
		int randomOffset = randomiseMoves.nextInt(N_MOVES);
		for( int move=0; move<N_MOVES; move++) {
			int randomMove = ( move + randomOffset ) % N_MOVES;
			// Check if the tested move is of the same face as the previous move (last_move).
			if(( randomMove / 2 ) == ( last_move / 2 ))
				continue;
			// Apply the move
			int newEdgePerm = moveEdgePerm[edgePerm][randomMove];
			int newEdgeOrient = moveEdgeOrient[edgeOrient][randomMove];
			int newCornerOrient = moveCornerOrient[cornerOrient][randomMove];
			// Call the recursive function
			if( search( newEdgePerm, newEdgeOrient, newCornerOrient, depth+1, length-1, randomMove, solution, randomiseMoves )) {
				// Store the move
				solution[depth] = randomMove;
				return true;
			}
		}
		return false;
	}

	public static class PyraminxSolverState {
		public int edgePerm, edgeOrient, cornerOrient, tips;

		public int unsolvedTips() {
			int numberUnsolved = 0;
			int tempTips = this.tips;
			while(tempTips != 0){
				if((tempTips % 3) > 0)
					numberUnsolved++;
				tempTips /= 3;
			}
			azzert(numberUnsolved <= 4);
			return numberUnsolved;
		}
	}

	/**
	 * Generate a random pyraminx position.
	 * @param r         random int generator
	 */
	public PyraminxSolverState randomState(Random r) {
		PyraminxSolverState state = new PyraminxSolverState();
		do {
			state.edgePerm = r.nextInt(N_EDGE_PERM);
		} while(prunPerm[state.edgePerm] == -1); // incorrect permutation (bad parity)
		state.edgeOrient = r.nextInt(N_EDGE_ORIENT);
		state.cornerOrient = r.nextInt(N_CORNER_ORIENT);
		state.tips = r.nextInt(N_TIPS);
		return state;
	}

	/**
	 * Solve a given position in less than or equal to length number of turns.
	 * Returns either the solution or the generator (inverse solution)
	 * @param state         state
	 * @param length        length of the desired solution
	 * @param includingTips do we want to include tips in the solution lenght ?
	 * @return              a string representing the solution or the scramble of a random position
	 */
	public String solveIn(PyraminxSolverState state, int length, boolean includingTips) {
		return solve(state, length, false, false, includingTips);
	}
	
	/**
	 * Return a generator of a given position in exactly length number of turns or not at all.
	 * Returns either the solution or the generator (inverse solution)
	 * @param state         state
	 * @param length        length of the desired solution
	 * @param includingTips do we want to include tips in the solution lenght ?
	 * @return              a string representing the solution or the scramble of a random position
	 */
	public String generateExactly(PyraminxSolverState state, int length, boolean includingTips) {
		return solve(state, length, true, true, includingTips);
	}
	
	private String solve(PyraminxSolverState state, int desiredLength, boolean exactLength, boolean inverse, boolean includingTips) {
		Random r = new Random();
		int[] solution = new int[MAX_LENGTH];
		boolean foundSolution = false;

		// If we count the tips in the desired length, we have to subtract the number of unsolved tips from the length of the main puzzle search.
		if(includingTips)
			desiredLength -= state.unsolvedTips();
		int length = exactLength ? desiredLength : 0;

		while(length <= desiredLength) {
			if(search(state.edgePerm, state.edgeOrient, state.cornerOrient, 0, length, 42, solution, r)) {
				foundSolution = true;
				break;
			}
			length++;
		}

		if(!foundSolution) {
			return null;
		}
		
		StringBuilder scramble = new StringBuilder((MAX_LENGTH+4)*3);
		if(inverse){
			for(int i = length - 1; i >= 0; i--) {
				scramble.append(" ").append(inverseMoveToString[solution[i]]);
			}
		}
		else {
			for(int i = 0; i < length; i++) {
				scramble.append(" ").append(moveToString[solution[i]]);
			}
		}

		// Scramble the tips
		int tempTip = state.tips;
		for(int tip = 0; tip < 4; tip++) {
			int dir = tempTip % 3;
			if(dir > 0) {
				scramble.append(" ").append(tipToString[tip*2+dir-1]);
			}
			tempTip /= 3;
		}
		
		return scramble.toString().trim();
	}
}
