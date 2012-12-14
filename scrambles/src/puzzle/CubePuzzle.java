package puzzle;

import static net.gnehzr.tnoodle.utils.Utils.azzert;

import java.awt.Color;
import java.awt.Dimension;
import java.awt.Graphics2D;
import java.awt.Rectangle;
import java.awt.geom.GeneralPath;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Random;

import net.gnehzr.tnoodle.scrambles.AlgorithmBuilder;
import net.gnehzr.tnoodle.scrambles.InvalidMoveException;
import net.gnehzr.tnoodle.scrambles.InvalidScrambleException;
import net.gnehzr.tnoodle.scrambles.Puzzle;
import net.gnehzr.tnoodle.scrambles.PuzzleStateAndGenerator;
import net.gnehzr.tnoodle.scrambles.AlgorithmBuilder.MungingMode;
import net.gnehzr.tnoodle.utils.Utils;
import cs.min2phase.Search;
import cs.min2phase.Tools;

public class CubePuzzle extends Puzzle {
    private static final int THREE_BY_THREE_MAX_SCRAMBLE_LENGTH = 21;
    private static final int THREE_BY_THREE_TIMEMIN = 200; //milliseconds
    private static final int THREE_BY_THREE_TIMEOUT = 5*1000; //milliseconds

    private static final int TWO_BY_TWO_MIN_SCRAMBLE_LENGTH = 11;
    
    private static enum Face {
    	L, D, B, R, U, F;

		public Face oppositeFace() {
			return values()[(ordinal() + 3) % 6];
		}
    }
    
	private static final int gap = 2;
	private static final int cubieSize = 10;
	private static final int[] DEFAULT_LENGTHS = { 0, 0, 25, 25, 40, 60, 80, 100, 120, 140, 160, 180 };
	
	private final int size;
	private TwoByTwoSolver twoSolver = null;
	private ThreadLocal<Search> twoPhaseSearcher = null;
	private ThreadLocal<cs.threephase.Search> threePhaseSearcher = null;
	public CubePuzzle(int size) {
		azzert(size >= 0 && size < DEFAULT_LENGTHS.length, "Invalid cube size");
		this.size = size;

		if(size == 2) {
			twoSolver = new TwoByTwoSolver();
		} else if(size == 3) {
			twoPhaseSearcher = new ThreadLocal<Search>() {
				protected Search initialValue() {
					return new Search();
				};
			};
		} else if(size == 4) {
			threePhaseSearcher = new ThreadLocal<cs.threephase.Search>() {
				protected cs.threephase.Search initialValue() {
					return new cs.threephase.Search();
				};
			};
		}
	}

	public double getInitializationStatus() {
		if(size == 4) {
			return cs.threephase.Edge3.initStatus();
		}

		return 1;
	}
	
	@Override
	public String getLongName() {
		return size + "x" + size + "x" + size;
	}

	@Override
	public String getShortName() {
		return size + "" + size + "" + size;
	}

	@Override
	public PuzzleStateAndGenerator generateRandomMoves(Random r) {
		if(size == 2 || size == 3 || size == 4) {
			String scramble;
			if(size == 2) {
				scramble = twoSolver.randomScramble(r, TWO_BY_TWO_MIN_SCRAMBLE_LENGTH, true);
			} else if(size == 3) {
				scramble = twoPhaseSearcher.get().solution(Tools.randomCube(r), THREE_BY_THREE_MAX_SCRAMBLE_LENGTH, THREE_BY_THREE_TIMEOUT, THREE_BY_THREE_TIMEMIN, Search.INVERSE_SOLUTION).trim();
			} else if(size == 4) {
				scramble = threePhaseSearcher.get().randomState(r);
			} else {
				azzert(false);
				return null;
			}
			
			AlgorithmBuilder ab = new AlgorithmBuilder(this, MungingMode.MUNGE_REDUNDANT_MOVES);
			try {
				ab.appendAlgorithm(scramble);
			} catch (InvalidMoveException e) {
				azzert(false, new InvalidScrambleException(scramble, e));
			}
			return ab.getStateAndGenerator();
		} else {
			return super.generateRandomMoves(r);
		}
	}

	private void slice(Face face, int slice, int dir, int[][][] image) {
		azzert(slice >= 0 && slice < size);
		
		Face sface = face;
		int sslice = slice;
		int sdir = dir;

		if(face.ordinal() >= 3) {
			sface = face.oppositeFace();
			sslice = size - 1 - slice;
			sdir = 4 - dir;
		}
		for(int i = 0; i < sdir; i++) {
			for(int j = 0; j < size; j++) {
				if(sface.ordinal() == 0) {
					int temp = image[Face.U.ordinal()][j][sslice];
					image[Face.U.ordinal()][j][sslice] = image[Face.B.ordinal()][size-1-j][size-1-sslice];
					image[Face.B.ordinal()][size-1-j][size-1-sslice] = image[Face.D.ordinal()][j][sslice];
					image[Face.D.ordinal()][j][sslice] = image[Face.F.ordinal()][j][sslice];
					image[Face.F.ordinal()][j][sslice] = temp;
				}
				else if(sface.ordinal() == 1) {
					int temp = image[0][size-1-sslice][j];
					image[Face.L.ordinal()][size-1-sslice][j] = image[Face.B.ordinal()][size-1-sslice][j];
					image[Face.B.ordinal()][size-1-sslice][j] = image[Face.R.ordinal()][size-1-sslice][j];
					image[Face.R.ordinal()][size-1-sslice][j] = image[Face.F.ordinal()][size-1-sslice][j];
					image[Face.F.ordinal()][size-1-sslice][j] = temp;
				}
				else if(sface.ordinal() == 2) {
					int temp = image[Face.U.ordinal()][sslice][j];
					image[Face.U.ordinal()][sslice][j] = image[Face.R.ordinal()][j][size-1-sslice];
					image[Face.R.ordinal()][j][size-1-sslice] = image[Face.D.ordinal()][size-1-sslice][size-1-j];
					image[Face.D.ordinal()][size-1-sslice][size-1-j] = image[Face.L.ordinal()][size-1-j][sslice];
					image[Face.L.ordinal()][size-1-j][sslice] = temp;
				}
			}
		}
		if(slice == 0 || slice == size - 1) {
			int f;
			if(slice == 0) {
				f = face.ordinal();
				sdir = 4 - dir;
			} else if(slice == size - 1) {
				f = face.oppositeFace().ordinal();
				sdir = dir;
			} else {
				azzert(false);
				return;
			}
			for(int i = 0; i < sdir; i++) {
				for(int j = 0; j < (size+1)/2; j++) {
					for(int k = 0; k < size/2; k++) {
						int temp = image[f][j][k];
						image[f][j][k] = image[f][k][size-1-j];
						image[f][k][size-1-j] = image[f][size-1-j][size-1-k];
						image[f][size-1-j][size-1-k] = image[f][size-1-k][j];
						image[f][size-1-k][j] = temp;
					}
				}
			}
		}
	}

	private static int getCubeViewWidth(int cubie, int gap, int size) {
		return (size*cubie + gap)*4 + gap;
	}
	private static int getCubeViewHeight(int cubie, int gap, int size) {
		return (size*cubie + gap)*3 + gap;
	}
	
	private static Dimension getImageSize(int gap, int unitSize, int size) {
		return new Dimension(getCubeViewWidth(unitSize, gap, size), getCubeViewHeight(unitSize, gap, size));
	}
	private void drawCube(Graphics2D g, int[][][] state, int gap, int cubieSize, HashMap<String, Color> colorScheme) {
		paintCubeFace(g, gap, 2*gap+size*cubieSize, size, cubieSize, state[0], colorScheme);
		paintCubeFace(g, 2*gap+size*cubieSize, 3*gap+2*size*cubieSize, size, cubieSize, state[Face.D.ordinal()], colorScheme);
		paintCubeFace(g, 4*gap+3*size*cubieSize, 2*gap+size*cubieSize, size, cubieSize, state[Face.B.ordinal()], colorScheme);
		paintCubeFace(g, 3*gap+2*size*cubieSize, 2*gap+size*cubieSize, size, cubieSize, state[Face.R.ordinal()], colorScheme);
		paintCubeFace(g, 2*gap+size*cubieSize, gap, size, cubieSize, state[Face.U.ordinal()], colorScheme);
		paintCubeFace(g, 2*gap+size*cubieSize, 2*gap+size*cubieSize, size, cubieSize, state[Face.F.ordinal()], colorScheme);
	}

	private void paintCubeFace(Graphics2D g, int x, int y, int size, int cubieSize, int[][] faceColors, HashMap<String, Color> colorScheme) {
		for(int row = 0; row < size; row++) {
			for(int col = 0; col < size; col++) {
				int tempx = x + col*cubieSize;
				int tempy = y + row*cubieSize;
				g.setColor(colorScheme.get(Face.values()[faceColors[row][col]].toString()));
				g.fillRect(tempx, tempy, cubieSize, cubieSize);
				
				g.setColor(Color.BLACK);
				g.drawRect(tempx, tempy, cubieSize, cubieSize);
			}
		}
	}

	@Override
	protected Dimension getPreferredSize() {
		return getImageSize(gap, cubieSize, size);
	}

	@Override
	public HashMap<String, Color> getDefaultColorScheme() {
		HashMap<String, Color> colors = new HashMap<String, Color>();
		colors.put("B", Color.BLUE);
		colors.put("D", Color.YELLOW);
		colors.put("F", Color.GREEN);
		colors.put("L", new Color(255, 128, 0)); //orange heraldic tincture
		colors.put("R", Color.RED);
		colors.put("U", Color.WHITE);
		return colors;
	}

	@Override
	public HashMap<String, GeneralPath> getDefaultFaceBoundaries() {
		HashMap<String, GeneralPath> faces = new HashMap<String, GeneralPath>();
		faces.put("B", getFace(4*gap+3*size*cubieSize, 2*gap+size*cubieSize, size, cubieSize));
		faces.put("D", getFace(2*gap+size*cubieSize, 3*gap+2*size*cubieSize, size, cubieSize));
		faces.put("F", getFace(2*gap+size*cubieSize, 2*gap+size*cubieSize, size, cubieSize));
		faces.put("L", getFace(gap, 2*gap+size*cubieSize, size, cubieSize));
		faces.put("R", getFace(3*gap+2*size*cubieSize, 2*gap+size*cubieSize, size, cubieSize));
		faces.put("U", getFace(2*gap+size*cubieSize, gap, size, cubieSize));
		return faces;
	}
	private static GeneralPath getFace(int leftBound, int topBound, int size, int cubieSize) {
		return new GeneralPath(new Rectangle(leftBound, topBound, size * cubieSize, size * cubieSize));
	}

	@Override
	public CubeState getSolvedState() {
		return new CubeState();
	}

	@Override
	protected int getRandomMoveCount() {
		return DEFAULT_LENGTHS[size];
	}

	private int[][][] cloneImage(int[][][] image) {
		int[][][] imageCopy = new int[image.length][image[0].length][image[0][0].length];
		Utils.deepCopy(image, imageCopy);
		return imageCopy;
	}
	
	private void spinCube(int[][][] image, Face face, int dir) {
		for(int slice = 0; slice < size; slice++) {
			slice(face, slice, dir, image);
		}
	}
	
	private int[][][] normalize(int[][][] image) {
		image = cloneImage(image);
		
		// (x y)*3 places every face on U, and returns to where we started
		int dir = 1;
		Face[] cubeRotations = new Face[] { Face.R, Face.F, Face.R, Face.F, Face.R, Face.F };
		
		for(Face face : cubeRotations) {
			spinCube(image, face, dir);
			// Now that we've picked something to go on top,
			// try all 4 front faces we could have on front
			for(int count = 0; count < 4; count++) {
				if(isNormalized(image)) {
					return image;
				}
				spinCube(image, Face.U, 1);
			}
		}
		azzert(false);
		return null;
	}

	public boolean isNormalized(int[][][] image) {
		// A CubeState is normalized if the BLD piece is solved
		return image[Face.B.ordinal()][size-1][size-1] == Face.B.ordinal() &&
				image[Face.L.ordinal()][size-1][0] == Face.L.ordinal() &&
				image[Face.D.ordinal()][size-1][0] == Face.D.ordinal();
	}
	
	private class CubeState extends PuzzleState {
		int[][][] image, normalizedImage;
		
		public CubeState() {
			image = new int[6][size][size];
			for(int face = 0; face < image.length; face++) {
				for(int j = 0; j < size; j++) {
					for(int k = 0; k < size; k++) {
						image[face][j][k] = face;
					}
				}
			}
			normalizedImage = cloneImage(image);
		}
		
		public CubeState(int[][][] image) {
			this.image = image;
			if(isNormalized(image)) {
				normalizedImage = cloneImage(image);
			} else {
				normalizedImage = normalize(image);
			}
		}

		@Override
		public HashMap<String, CubeState> getSuccessors() {
			HashMap<String, CubeState> successors = new HashMap<String, CubeState>();
			for(Face face : Face.values()) {
				for(int innerSlice = 0; innerSlice < size/2; innerSlice++) {
					for(int dir = 1; dir <= 3; dir++) {
						String f = face.toString();
						String move = "";
						int outerSlice = 0;
						if(innerSlice == 0) {
							move += f;
						} else if (innerSlice == 1) {
							move += f + "w";
						} else {
							move += (innerSlice+1) + f + "w";
						}
						move += new String[] { null, "", "2", "'" }[dir];
						
						int[][][] imageCopy = cloneImage(image);
						for(int slice = outerSlice; slice <= innerSlice; slice++) {
							slice(face, slice, dir, imageCopy);
						}
						successors.put(move, new CubeState(imageCopy));
					}
				}
			}
			
			return successors;
		}

		@Override
		public boolean equals(Object other) {
			return Arrays.deepEquals(normalizedImage, ((CubeState) other).normalizedImage);
		}

		@Override
		public int hashCode() {
			return Arrays.hashCode(normalizedImage);
		}

		@Override
		protected void drawScramble(Graphics2D g, HashMap<String, Color> colorScheme) {
			drawCube(g, image, gap, cubieSize, colorScheme);
		}
		
	}
	
	public static void main(String[] args) throws InvalidScrambleException, InvalidMoveException {
		CubePuzzle fours = new CubePuzzle(4);
		CubeState solved = fours.getSolvedState();
		
		CubeState state = (CubeState) solved.applyAlgorithm("Rw Lw'");
		azzert(state.equals(solved));
		
		state = (CubeState) solved.applyAlgorithm("Uw Dw'");
		azzert(state.equals(solved));
		
		AlgorithmBuilder ab = new AlgorithmBuilder(fours, MungingMode.MUNGE_REDUNDANT_MOVES);
		ab.appendMove("Uw");
		ab.appendMove("Dw'");
		ab.appendMove("L");
		ab.appendMove("Uw");
		ab.appendMove("Dw");
		ab.appendMove("L");
		System.out.println(ab.toString());
		
		CubePuzzle threes = new CubePuzzle(3);
		
		CubeState state1 = (CubeState) threes.getSolvedState().applyAlgorithm("D2 U'");
		CubeState state2 = (CubeState) threes.getSolvedState().applyAlgorithm("D");
		System.out.println(state1.equals(state2));
		System.out.println(Arrays.deepToString(state1.image));
		System.out.println(Arrays.deepToString(state2.image));
		System.out.println();
		System.out.println(Arrays.deepToString(state1.normalizedImage));
		System.out.println(Arrays.deepToString(state2.normalizedImage));
		
		AlgorithmBuilder ab3 = new AlgorithmBuilder(threes, MungingMode.MUNGE_REDUNDANT_MOVES);
		ab3.appendAlgorithm("D2 U' L2 B2 F2 D B2 U' B2 F D' F U' R F2 L2 D' B D F'");
		System.out.println(ab3.toString());
	}
}
