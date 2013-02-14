package puzzle;

import static net.gnehzr.tnoodle.utils.Utils.azzert;
import static net.gnehzr.tnoodle.utils.Utils.azzertEquals;
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

import puzzle.PyraminxSolver.PyraminxSolverState;

import net.gnehzr.tnoodle.scrambles.InvalidScrambleException;
import net.gnehzr.tnoodle.scrambles.Puzzle;
import net.gnehzr.tnoodle.scrambles.PuzzleStateAndGenerator;
import net.gnehzr.tnoodle.utils.Utils;

public class PyraminxPuzzle extends Puzzle {
	private static final int MIN_SCRAMBLE_LENGTH = 11;
	private static final boolean SCRAMBLE_LENGTH_INCLUDES_TIPS = true;
	private static final Logger l = Logger.getLogger(PyraminxPuzzle.class.getName());
	private PyraminxSolver pyraminxSolver = null;

	public PyraminxPuzzle() {
		pyraminxSolver = new PyraminxSolver();
		wcaMinScrambleDistance = 7;
	}

	@Override
	public PuzzleStateAndGenerator generateRandomMoves(Random r) {
		PyraminxSolverState state = pyraminxSolver.randomState(r);
		String scramble = pyraminxSolver.solveExactly(state, MIN_SCRAMBLE_LENGTH, false);

		PuzzleState pState;
		try {
			pState = getSolvedState().applyAlgorithm(scramble);
		} catch (InvalidScrambleException e) {
			azzert(false, e);
			return null;
		}
		
		return new PuzzleStateAndGenerator(pState, scramble);
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
	
	public class PyraminxState extends PuzzleState {
		private int[][] image;
		/** Trying to make an ascii art of the pyraminx stickers position...
		  *
		  *                                    U
		  *              ____  ____  ____              ____  ____  ____ 
		  *             \    /\    /\    /     /\     \    /\    /\    /
		  *              \0 /1 \2 /4 \3 /     /0 \     \0 /1 \2 /4 \3 /
		  *               \/____\/____\/     /____\     \/____\/____\/
		  *                \    /\    /     /\    /\     \    /\    /
		  *        face 2   \8 /7 \5 /     /8 \1 /2 \     \8 /7 \5 / face 3
		  *                  \/____\/     /____\/____\     \/____\/
		  *                   \    /     /\    /\    /\     \    /
		  *                    \6 /     /6 \7 /5 \4 /3 \     \6 /
		  *                     \/     /____\/____\/____\     \/
		  *                                  face 0
		  *                        L    ____  ____  ____    R
		  *                            \    /\    /\    /
		  *                             \0 /1 \2 /4 \3 /
		  *                              \/____\/____\/
		  *                               \    /\    /
		  *                                \8 /7 \5 /
		  *                         face 1  \/____\/
		  *                                  \    /
		  *                                   \6 /
		  *                                    \/
		  *
		  *                                    B
		  */

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

		public PyraminxSolverState toPyraminxSolverState() {
			PyraminxSolverState state = new PyraminxSolverState();

			/** Each face color is assigned a value so that the sum of the color (minus 1) of each edge gives a unique integer.
			  * These edge values match the edge numbering in the PyraminxSolver class, making the following code simpler.
			  *                                    U
			  *              ____  ____  ____              ____  ____  ____ 
			  *             \    /\    /\    /     /\     \    /\    /\    /
			  *              \  /  \5 /  \  /     /  \     \  /  \5 /  \  /
			  *               \/____\/____\/     /____\     \/____\/____\/
			  *                \    /\    /     /\    /\     \    /\    /
			  *        face +2  \2 /  \1 /     /1 \  /3 \     \3 /  \4 / face +4
			  *                  \/____\/     /____\/____\     \/____\/
			  *                   \    /     /\    /\    /\     \    /
			  *                    \  /     /  \  /0 \  /  \     \  /
			  *                     \/     /____\/____\/____\     \/
			  *                                  face +0
			  *                        L    ____  ____  ____    R
			  *                            \    /\    /\    /
			  *                             \  /  \0 /  \  /
			  *                              \/____\/____\/
			  *                               \    /\    /
			  *                                \2 /  \4 /
			  *                         face +1 \/____\/
			  *                                  \    /
			  *                                   \  /
			  *                                    \/
			  *
			  *                                    B
			  */
			int[][] stickersToEdges = new int[][] {
				{ image[0][5], image[1][2] },
				{ image[0][8], image[2][5] },
				{ image[1][8], image[2][8] },
				{ image[0][2], image[3][8] },
				{ image[1][5], image[3][5] },
				{ image[2][2], image[3][2] }
			};

			int[] colorToValue = new int[] {0, 1, 2, 4};

			int[] edges = new int[6];
			for (int i = 0; i < edges.length; i++){
				edges[i] = colorToValue[stickersToEdges[i][0]] + colorToValue[stickersToEdges[i][1]] - 1;
				// In the PyraminxSolver class, the primary facelet of each edge correspond to the lowest face number.
				if( stickersToEdges[i][0] > stickersToEdges[i][1] )
					edges[i] += 8;
			}

			state.edgePerm = PyraminxSolver.packEdgePerm(edges);
			state.edgeOrient = PyraminxSolver.packEdgeOrient(edges);

			int[][] stickersToCorners = new int[][] {
				{ image[0][1], image[2][4], image[3][1] },
				{ image[0][7], image[1][1], image[2][7] },
				{ image[0][4], image[3][7], image[1][4] },
				{ image[1][7], image[3][4], image[2][1] }
			};

			/* The corners are supposed to be fixed, so we are also checking if they are in the right place.
			 * We can use the sum trick, but here, no need for transition table :) */
			int[] correctSum = new int[] {5, 3, 4, 6};

			int[] corners = new int[4];
			for (int i = 0; i < corners.length; i++){
				azzertEquals(stickersToCorners[i][0] + stickersToCorners[i][1] + stickersToCorners[i][2], correctSum[i]);
				// The following code is not pretty, sorry...
				if(( stickersToCorners[i][0] < stickersToCorners[i][1] ) && ( stickersToCorners[i][0] < stickersToCorners[i][2] ))
					corners[i] = 0;
				if(( stickersToCorners[i][1] < stickersToCorners[i][0] ) && ( stickersToCorners[i][1] < stickersToCorners[i][2] ))
					corners[i] = 1;
				if(( stickersToCorners[i][2] < stickersToCorners[i][1] ) && ( stickersToCorners[i][2] < stickersToCorners[i][0] ))
					corners[i] = 2;
			}

			state.cornerOrient = PyraminxSolver.packCornerOrient(corners);

			/* For the tips, we use the same numbering */
			int[][] stickersToTips = new int[][] {
				{ image[0][0], image[2][3], image[3][0] },
				{ image[0][6], image[1][0], image[2][6] },
				{ image[0][3], image[3][6], image[1][3] },
				{ image[1][6], image[3][3], image[2][0] }
			};

			int[] tips = new int[4];
			for (int i = 0; i < tips.length; i++){
				int[] stickers = stickersToTips[i];
				// We can use the same color check as for the corners.
				azzertEquals(stickers[0] + stickers[1] + stickers[2], correctSum[i]);

				// For the tips, we don't have to check colors against face, but against the attached corner.
				int cornerPrimaryColor = stickersToCorners[i][0];
				int clockwiseTurnsToMatchCorner = 0;
				while(stickers[clockwiseTurnsToMatchCorner] != cornerPrimaryColor) {
					clockwiseTurnsToMatchCorner++;
					azzert(clockwiseTurnsToMatchCorner < 3);
				}
				tips[i] = clockwiseTurnsToMatchCorner;
			}

			state.tips = PyraminxSolver.packCornerOrient(tips); // Same function as for corners.

			return state;
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
