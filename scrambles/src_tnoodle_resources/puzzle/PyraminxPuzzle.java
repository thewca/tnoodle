package puzzle;

import static net.gnehzr.tnoodle.utils.Utils.azzert;
import static net.gnehzr.tnoodle.utils.Utils.toColor;

import java.awt.Color;
import java.awt.Dimension;
import java.awt.Graphics2D;
import java.awt.RenderingHints;
import java.awt.geom.AffineTransform;
import java.awt.geom.GeneralPath;
import java.awt.geom.PathIterator;
import java.awt.geom.Point2D;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Random;
import java.util.logging.Level;
import java.util.logging.Logger;

import net.gnehzr.tnoodle.scrambles.InvalidMoveException;
import net.gnehzr.tnoodle.scrambles.Puzzle;
import net.gnehzr.tnoodle.utils.Utils;

public class PyraminxPuzzle extends Puzzle {
	private static final Logger l = Logger.getLogger(PyraminxPuzzle.class.getName());
	
	public PyraminxPuzzle() {
		initMoves();
		initPrun();
	}

	static final int N_EDGE_PERM = 720; // Number of permutations of edges
	static final int N_EDGE_ORIENT = 32; // Number of orientations of edges
	static final int N_CORNER_ORIENT = 81; // Number of orientations of corners
	static final int N_ORIENT = N_EDGE_ORIENT * N_CORNER_ORIENT;
	static final int N_MOVES = 8; // Number of moves
	static final int SCRAMBLE_LENGTH = 11;
	static final String[] inverseMoveToString = {"U'", "U", "L'", "L", "R'", "R", "B'", "B"};
	static final String[] tipToString = {"u", "u'", "l", "l'", "r", "r'", "b", "b'"};

	static final int[] fact = {1, 1, 2, 6, 24, 120, 720}; // fact[x] = x!

	/**
	 * Converts the list of edges into a number representing the permutation of the edges.
	 * @param edges   edges representation (ori << 3 + perm)
	 * @return        an integer between 0 and 719 representing the permutation of 6 elements
	 */
	private int packEdgePerm(int[] edges) {
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
	private void unpackEdgePerm(int perm, int[] edges) {
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
	private int packEdgeOrient(int[] edges) {
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
	private void unpackEdgeOrient(int ori, int[] edges) {
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
	private int packCornerOrient(int[] corners) {
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
	private void unpackCornerOrient(int ori, int[] corners) {
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
	private void cycleAndOrient(int[] edges, int a, int b, int c, int times) {
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
	private void moveEdges(int[] edges, int move) {
		int face = move / 2;
		int times = ( move % 2 ) + 1;
		switch (face) {
			case 0: // U face
				cycleAndOrient(edges, 0, 3, 1, times);
				break;
			case 1: // L face
				cycleAndOrient(edges, 1, 5, 2, times);
				break;
			case 2: // R face
				cycleAndOrient(edges, 4, 0, 2, times);
				break;
			case 3: // B face
				cycleAndOrient(edges, 5, 3, 4, times);
				break;
		}
	}

	/**
	 * Apply a move on the corners representation.
	 * @param corners  corners representation
	 * @param move     move to apply to the corners
	 */
	private void moveCorners(int[] corners, int move) {
		int face = move / 2;
		int times = ( move % 2 ) + 1;
		corners[face] = ( corners[face] + times ) % 3;
	}

	/**
	 * Fill the arrays to move permutation and orientation coordinates.
	 */
	private static int[][] moveEdgePerm = new int[N_EDGE_PERM][N_MOVES];
	private static int[][] moveEdgeOrient = new int[N_EDGE_ORIENT][N_MOVES];
	private static int[][] moveCornerOrient = new int[N_CORNER_ORIENT][N_MOVES];
	private void initMoves() {
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
	private void initPrun() {
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
	
	/**
	 * Generate a random position and solve it.
	 * @param r random int generator
	 * @return a string representing a sequence of turns to get to that random position
	 */
	@Override
	public PuzzleStateAndGenerator generateRandomMoves(Random r) {
		// Generate a random position
		int randomEdgePerm;
		do {
			randomEdgePerm = r.nextInt(N_EDGE_PERM);
		} while(prunPerm[randomEdgePerm] == -1); // incorrect permutation (bad parity)
		int randomEdgeOrient = r.nextInt(N_EDGE_ORIENT);
		int randomCornerOrient = r.nextInt(N_CORNER_ORIENT);

		// Solve that position
		int[] solution = new int[SCRAMBLE_LENGTH];
		if(!search(randomEdgePerm, randomEdgeOrient, randomCornerOrient, 0, SCRAMBLE_LENGTH, 42, solution, r)) {
			// No solution was found
			l.log(Level.SEVERE, "Could not find a solution to state with edgePerm: " + randomEdgePerm +
					" edgeOrient: " + randomEdgeOrient + " randomCornerOrient: " + randomCornerOrient);
			azzert(false);
		}

		ArrayList<String> scramble = new ArrayList<String>();
		PuzzleState state = getSolvedState();
		scramble.add(inverseMoveToString[solution[SCRAMBLE_LENGTH-1]]);
		for(int i = SCRAMBLE_LENGTH - 2; i >= 0; i--) {
			String turn = inverseMoveToString[solution[i]];
			try {
				state = state.apply(turn);
			} catch(InvalidMoveException e) {
				l.log(Level.SEVERE, "", e);
				azzert(false);
			}
			scramble.add(turn);
		}

		// Scramble the tips
		for(int tip = 0; tip < 4; tip++) {
			int dir = r.nextInt(3);
			if( dir < 2 ) {
				scramble.add(tipToString[tip*2+dir]);
			}
		}
		
		return new PuzzleStateAndGenerator(state, Utils.join(scramble, " "));
	}

	/*************************************************************
	 * Functions to display the puzzle
	 */

	private static final int pieceSize = 30;
	private static final int gap = 5;

	public static Dimension getImageSize(int gap, int pieceSize) {
		return new Dimension(getPyraminxViewWidth(gap, pieceSize), getPyraminxViewHeight(gap, pieceSize));
	}

	private void drawMinx(Graphics2D g, int gap, int pieceSize, Color[] colorScheme, int[][] image) {
		drawTriangle(g, 2*gap+3*pieceSize, gap+Math.sqrt(3)*pieceSize, true, image[0], pieceSize, colorScheme);
		drawTriangle(g, 2*gap+3*pieceSize, 2*gap+2*Math.sqrt(3)*pieceSize, false, image[1], pieceSize, colorScheme);
		drawTriangle(g, gap+1.5*pieceSize, gap+Math.sqrt(3)/2*pieceSize, false, image[2], pieceSize, colorScheme);
		drawTriangle(g, 3*gap+4.5*pieceSize, gap+Math.sqrt(3)/2*pieceSize,  false, image[3], pieceSize, colorScheme);
	}

	private void drawTriangle(Graphics2D g, double x, double y, boolean up, int[] state, int pieceSize, Color[] colorScheme) {
		GeneralPath p = triangle(up, pieceSize);
		g.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
		p.transform(AffineTransform.getTranslateInstance(x, y));

		double[] xpoints = new double[3];
		double[] ypoints = new double[3];
		PathIterator iter = p.getPathIterator(null);
		for(int ch = 0; ch < 3; ch++) {
			double[] coords = new double[6];
			int type = iter.currentSegment(coords);
			if(type == PathIterator.SEG_MOVETO || type == PathIterator.SEG_LINETO) {
				xpoints[ch] = coords[0];
				ypoints[ch] = coords[1];
			}
			iter.next();
		}

		double[] xs = new double[6];
		double[] ys = new double[6];
		for(int i = 0; i < 3; i++) {
			xs[i]=1/3.*xpoints[(i+1)%3]+2/3.*xpoints[i];
			ys[i]=1/3.*ypoints[(i+1)%3]+2/3.*ypoints[i];
			xs[i+3]=2/3.*xpoints[(i+1)%3]+1/3.*xpoints[i];
			ys[i+3]=2/3.*ypoints[(i+1)%3]+1/3.*ypoints[i];
		}

		GeneralPath[] ps = new GeneralPath[9];
		for(int i = 0; i < ps.length; i++) {
			ps[i] = new GeneralPath();
		}

		Point2D.Double center = getLineIntersection(xs[0], ys[0], xs[4], ys[4], xs[2], ys[2], xs[3], ys[3]);

		for(int i = 0; i < 3; i++) {
			ps[3*i].moveTo(xpoints[i], ypoints[i]);
			ps[3*i].lineTo(xs[i], ys[i]);
			ps[3*i].lineTo(xs[3+(2+i)%3], ys[3+(2+i)%3]);
			ps[3*i].closePath();

			ps[3*i+1].moveTo(xs[i], ys[i]);
			ps[3*i+1].lineTo(xs[3+(i+2)%3], ys[3+(i+2)%3]);
			ps[3*i+1].lineTo(center.x, center.y);
			ps[3*i+1].closePath();

			ps[3*i+2].moveTo(xs[i], ys[i]);
			ps[3*i+2].lineTo(xs[i+3], ys[i+3]);
			ps[3*i+2].lineTo(center.x, center.y);
			ps[3*i+2].closePath();
		}

		for(int i = 0; i < ps.length; i++) {
			g.setColor(colorScheme[state[i]]);
			g.fill(ps[i]);
			g.setColor(Color.BLACK);
			g.draw(ps[i]);
		}
	}

	private static GeneralPath triangle(boolean pointup, int pieceSize) {
		int rad = (int)(Math.sqrt(3) * pieceSize);
		double[] angs = { 7/6., 11/6., .5 };
		if(pointup) for(int i = 0; i < angs.length; i++) angs[i] += 1/3.;
		for(int i = 0; i < angs.length; i++) angs[i] *= Math.PI;
		double[] x = new double[angs.length];
		double[] y = new double[angs.length];
		for(int i = 0; i < x.length; i++) {
			x[i] = rad * Math.cos(angs[i]);
			y[i] = rad * Math.sin(angs[i]);
		}
		GeneralPath p = new GeneralPath();
		p.moveTo(x[0], y[0]);
		for(int ch = 1; ch < x.length; ch++) {
			p.lineTo(x[ch], y[ch]);
		}
		p.closePath();
		return p;
	}

	public static Point2D.Double getLineIntersection(double x1, double y1, double x2, double y2, double x3, double y3, double x4, double y4) {
		return new Point2D.Double(
			det(det(x1, y1, x2, y2), x1 - x2,
					det(x3, y3, x4, y4), x3 - x4)/
				det(x1 - x2, y1 - y2, x3 - x4, y3 - y4),
			det(det(x1, y1, x2, y2), y1 - y2,
					det(x3, y3, x4, y4), y3 - y4)/
				det(x1 - x2, y1 - y2, x3 - x4, y3 - y4));
	}

	public static double det(double a, double b, double c, double d) {
		return a * d - b * c;
	}

	private static int getPyraminxViewWidth(int gap, int pieceSize) {
		return (2 * 3 * pieceSize + 4 * gap);
	}
	private static int getPyraminxViewHeight(int gap, int pieceSize) {
		return (int)(2 * 1.5 * Math.sqrt(3) * pieceSize + 3 * gap);
	}
	public static int getNewUnitSize(int width, int height, int gap, String variation) {
		return (int) Math.round(Math.min((width - 4*gap) / (3 * 2),
				(height - 3*gap) / (3 * Math.sqrt(3))));
	}

	private static GeneralPath getTriangle(double x, double y, int pieceSize, boolean up) {
		GeneralPath p = triangle(up, pieceSize);
		p.transform(AffineTransform.getTranslateInstance(x, y));
		return p;
	}

	private static final HashMap<String, Color> defaultColorScheme = new HashMap<String, Color>();
	static {
		defaultColorScheme.put("F", toColor("00FF00"));
		defaultColorScheme.put("D", toColor("FFFF00"));
		defaultColorScheme.put("L", toColor("FF0000"));
		defaultColorScheme.put("R", toColor("0000FF"));
	}
	
	@Override
	public HashMap<String, Color> getDefaultColorScheme() {
		return new HashMap<String, Color>(defaultColorScheme);
	}

	@Override
	public HashMap<String, GeneralPath> getDefaultFaceBoundaries() {
		HashMap<String, GeneralPath> faces = new HashMap<String, GeneralPath>();
		faces.put("F", getTriangle(2*gap+3*pieceSize, gap+Math.sqrt(3)*pieceSize, pieceSize, true));
		faces.put("D", getTriangle(2*gap+3*pieceSize, 2*gap+2*Math.sqrt(3)*pieceSize, pieceSize, false));
		faces.put("L", getTriangle(gap+1.5*pieceSize, gap+Math.sqrt(3)/2*pieceSize, pieceSize, false));
		faces.put("R", getTriangle(3*gap+4.5*pieceSize, gap+Math.sqrt(3)/2*pieceSize, pieceSize, false));
		return faces;
	}

	@Override
	protected Dimension getPreferredSize() {
		return getImageSize(gap, pieceSize);
	}

	@Override
	public String getLongName() {
		return "Pyraminx";
	}

	@Override
	public String getShortName() {
		return "pyram";
	}

	@Override
	public PuzzleState getSolvedState() {
		return new PyraminxState();
	}

	@Override
	protected int getRandomMoveCount() {
		return 15;
	}
	
	private class PyraminxState extends PuzzleState {
		private int[][] image;
		public PyraminxState() {
			image = new int[4][9];
			for(int i = 0; i < image.length; i++) {
				for(int j = 0; j < image[0].length; j++) {
					image[i][j] = i;
				}
			}
		}
		
		public PyraminxState(int[][] image) {
			this.image = image;
		}
		
		private void turn(int side, int dir, int[][] image) {
			for(int i = 0; i < dir; i++) {
				turn(side, image);
			}
		}

		private void turnTip(int side, int dir, int[][] image) {
			for(int i = 0; i < dir; i++) {
				turnTip(side, image);
			}
		}

		private void turn(int s, int[][] image) {
			switch(s) {
				case 0:
					swap(0, 8, 3, 8, 2, 2, image);
					swap(0, 1, 3, 1, 2, 4, image);
					swap(0, 2, 3, 2, 2, 5, image);
					break;
				case 1:
					swap(2, 8, 1, 2, 0, 8, image);
					swap(2, 7, 1, 1, 0, 7, image);
					swap(2, 5, 1, 8, 0, 5, image);
					break;
				case 2:
					swap(3, 8, 0, 5, 1, 5, image);
					swap(3, 7, 0, 4, 1, 4, image);
					swap(3, 5, 0, 2, 1, 2, image);
					break;
				case 3:
					swap(1, 8, 2, 2, 3, 5, image);
					swap(1, 7, 2, 1, 3, 4, image);
					swap(1, 5, 2, 8, 3, 2, image);
					break;
				default:
					azzert(false);
			}
			turnTip(s, image);
		}

		private void turnTip(int s, int[][] image) {
			switch(s) {
				case 0:
					swap(0, 0, 3, 0, 2, 3, image);
					break;
				case 1:
					swap(0, 6, 2, 6, 1, 0, image);
					break;
				case 2:
					swap(0, 3, 1, 3, 3, 6, image);
					break;
				case 3:
					swap(1, 6, 2, 0, 3, 3, image);
					break;
				default:
					azzert(false);
			}
		}

		private void swap(int f1, int s1, int f2, int s2, int f3, int s3, int[][] image) {
			int temp = image[f1][s1];
			image[f1][s1] = image[f2][s2];
			image[f2][s2] = image[f3][s3];
			image[f3][s3] = temp;
		}


		@Override
		public HashMap<String, PuzzleState> getSuccessors() {
			HashMap<String, PuzzleState> successors = new HashMap<String, PuzzleState>();
			
			String axes = "ulrb";
			for(int axis = 0; axis < axes.length(); axis++) {
				for(boolean tip : new boolean[] { true, false }) {
					char face = axes.charAt(axis);
					face = tip ? Character.toLowerCase(face) : Character.toUpperCase(face);
					for(int dir = 1; dir <= 2; dir++) {
						String turn = "" + face;
						if(dir == 2) {
							turn += "'";
						}

						int[][] imageCopy = new int[image.length][image[0].length];
						Utils.deepCopy(image, imageCopy);

						if(tip) {
							turnTip(axis, dir, imageCopy);
						} else {
							turn(axis, dir, imageCopy);
						}

						successors.put(turn, new PyraminxState(imageCopy));
					}
				}
			}

			return successors;
		}

		@Override
		public boolean equals(Object other) {
			// Sure this could blow up with a cast exception, but shouldn't it? =)
			return Arrays.deepEquals(image, ((PyraminxState) other).image);
		}

		@Override
		public int hashCode() {
			return Arrays.deepHashCode(image);
		}

		@Override
		protected void drawScramble(Graphics2D g, HashMap<String, Color> colorScheme) {
			Color[] scheme = new Color[4];
			for(int i = 0; i < scheme.length; i++) {
				scheme[i] = colorScheme.get("FDLR".charAt(i)+"");
			}
			drawMinx(g, gap, pieceSize, scheme, image);
		}

	}
}