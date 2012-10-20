package scrambler;

import java.awt.Color;
import java.awt.Dimension;
import java.awt.Graphics2D;
import java.awt.Rectangle;
import java.awt.geom.GeneralPath;
import java.util.HashMap;
import java.util.Random;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.ArrayList;

import net.gnehzr.tnoodle.scrambles.InvalidScrambleException;
import net.gnehzr.tnoodle.scrambles.Scrambler;
import cs.min2phase.Search;
import cs.min2phase.Tools;

import static net.gnehzr.tnoodle.utils.Utils.azzert;

//TODO - massive cleanup! so much vestigial code
public class CubeScrambler extends Scrambler {
    private static final int THREE_BY_THREE_MAX_SCRAMBLE_LENGTH = 21;
    private static final int THREE_BY_THREE_TIMEMIN = 200; //milliseconds
    private static final int THREE_BY_THREE_TIMEOUT = 5*1000; //milliseconds

    private static final int TWO_BY_TWO_MIN_SCRAMBLE_LENGTH = 11;
    
	private static final String FACES = "LDBRUFldbruf";
	private static final int gap = 2;
	private static final int cubieSize = 10;
	private static final int[] DEFAULT_LENGTHS = { 0, 0, 25, 25, 40, 60, 80, 100, 120, 140, 160, 180 };
	
	private final int size;
	private int length;
	private TwoByTwoSolver twoSolver = null;
	private ThreadLocal<Search> twoPhaseSearcher = null;
	private ThreadLocal<cs.threephase.Search> threePhaseSearcher = null;
	public CubeScrambler(int size) {
		if(size <= 0 || size >= DEFAULT_LENGTHS.length)
			throw new IllegalArgumentException("Invalid cube size");
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
		} else {
			length = DEFAULT_LENGTHS[size];
		}
	}

	public double getInitializationStatus() {
		if(size != 4) {
			return 1;
		}

		return cs.threephase.Edge3.initStatus();
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
	public String generateScramble(Random r) {
		if(size == 2) {
			return twoSolver.randomScramble(r, TWO_BY_TWO_MIN_SCRAMBLE_LENGTH, true);
		} else if(size == 3) {
			return twoPhaseSearcher.get().solution(Tools.randomCube(r), THREE_BY_THREE_MAX_SCRAMBLE_LENGTH, THREE_BY_THREE_TIMEOUT, THREE_BY_THREE_TIMEMIN, Search.INVERSE_SOLUTION).trim();
		} else if(size == 4) {
			return threePhaseSearcher.get().randomState(r);
		} else {
			StringBuffer scramble = new StringBuffer(length*3);
			int lastAxis = -1;
			int axis = 0;
			int slices = size - 1;
			int[] slicesMoved = new int[slices];
			int moved = 0;
	
			for(int i = 0; i < length; i += moved) {
				moved = 0;
				do {
					axis = r.nextInt(3);
				} while(axis == lastAxis);
	
				for(int j = 0; j < slicesMoved.length; j++) slicesMoved[j] = 0;
	
				do {
					int slice;
					do {
						slice = r.nextInt(slices);
					} while(slicesMoved[slice] != 0);

					int direction = r.nextInt(3) + 1;
					moved++;
					slicesMoved[slice] = direction;
				} while(r.nextInt(3) == 0 && moved < slices && moved + i < length);
	
				for(int j = 0; j < slices; j++) {
					if(slicesMoved[j] > 0) {
						int direction = slicesMoved[j];
						int face = axis;
						int innerSlice = j;
						if(2 * j + 1 >= slices) {
							face += 3;
							innerSlice = slices - 1 - innerSlice;
							direction = 4 - direction;
						}
	
						Turn t = new Turn();
						t.face = face;
						t.innerSlice = innerSlice;
						t.outerSlice = 0;
						t.dir = direction;
						scramble.append(" " + t.toString());
					}
				}
				lastAxis = axis;
			}
			return scramble.substring(1);
		}
	}

	//TODO - change to not rely upon whitespace
	private final static String regexp2 = "^(\\s*[LDBRUF]2?'?)*\\s*$";
	private final static String regexp345 = "^(\\s*(?:[LDBRUF]w?|[ldbruf])2?'?)*\\s*$";
	private final static String regexp = "^(\\s*(\\d+)?([LDBRUF])w?2?'?)*\\s*$";
	private final static Pattern shortPattern = Pattern.compile(regexp);

	private class Turn {
		int face;
		int innerSlice, outerSlice;
		int dir;

		public Turn() {}

		public String toString() {
			if(dir == 0) {
				return null;
			}

			azzert(innerSlice >= outerSlice);

			String f = "" + FACES.charAt(face);
			String move = "";
			if(innerSlice == 0)
				move += f;
			else if (innerSlice == 1)
				move += f + "w";
			else
				move += (innerSlice+1) + f + "w";

			if(dir > 1) {
				move += "  2'".charAt(dir);
			}

			return move;
		}
	}

	private Turn[] parseScramble(String scramble) {
		if(size < 2) return null;
		else if(size == 2 && !scramble.matches(regexp2))
			return null;
		else if(size <= 5 && !scramble.matches(regexp345))
			return null;
		else if(size > 5 && !scramble.matches(regexp))
			return null;
		String[] strs = scramble.split("\\s+");
		ArrayList<Turn> turns = new ArrayList<Turn>();
		for(int i = 0; i < strs.length; i++) {
			if(strs[i].isEmpty()) continue;
			int face;
			String slice1 = null;
			if(size > 5) {
				Matcher m = shortPattern.matcher(strs[i]);
				if(!m.matches()) {
					return null;
				}
				slice1 = m.group(2);
				face = FACES.indexOf(m.group(3));
			} else {
				face = FACES.indexOf(strs[i].charAt(0) + "");
			}

			int innerSlice = face / 6;
			int outerSlice = innerSlice;
			face %= 6;
			if(strs[i].indexOf("w") >= 0) {
				innerSlice++;
				if(slice1 != null) {
					innerSlice = Integer.parseInt(slice1) - 1;
					outerSlice = 0;
				}
			}

			int dir = "  2'".indexOf(strs[i].substring(strs[i].length() - 1));
			if(dir < 0) {
				dir = 1;
			}

			Turn turn = new Turn();
			turn.face = face;
			turn.innerSlice = innerSlice;
			turn.outerSlice = outerSlice;
			turn.dir = dir;
			turns.add(turn);
		}
		return turns.toArray(new Turn[turns.size()]);
	}

	private boolean validateScramble(String scramble, int[][][] image) {
		Turn[] turns = parseScramble(scramble);
		if(turns == null) {
			return false;
		}

		for(Turn turn : turns) {
			for(int slice = turn.outerSlice; slice <= turn.innerSlice; slice++) {
				slice(turn.face, slice, turn.dir, image);
			}
		}

		return true;
	}

	private void slice(int face, int slice, int dir, int[][][] image) {
		int sface = face;
		int sslice = slice;
		int sdir = dir;

		if(face > 2){
			sface -= 3;
			sslice = size - 1 - slice;
			sdir = 4 - dir;
		}
		for(int i = 0; i < sdir; i++){
			for(int j = 0; j < size; j++){
				if(sface == 0){
					int temp = image[4][j][sslice];
					image[4][j][sslice] = image[2][size-1-j][size-1-sslice];
					image[2][size-1-j][size-1-sslice] = image[1][j][sslice];
					image[1][j][sslice] = image[5][j][sslice];
					image[5][j][sslice] = temp;
				}
				else if(sface == 1){
					int temp = image[0][size-1-sslice][j];
					image[0][size-1-sslice][j] = image[2][size-1-sslice][j];
					image[2][size-1-sslice][j] = image[3][size-1-sslice][j];
					image[3][size-1-sslice][j] = image[5][size-1-sslice][j];
					image[5][size-1-sslice][j] = temp;
				}
				else if(sface == 2){
					int temp = image[4][sslice][j];
					image[4][sslice][j] = image[3][j][size-1-sslice];
					image[3][j][size-1-sslice] = image[1][size-1-sslice][size-1-j];
					image[1][size-1-sslice][size-1-j] = image[0][size-1-j][sslice];
					image[0][size-1-j][sslice] = temp;
				}
			}
		}
		if(slice == 0){
			for(int i = 0; i < 4 - dir; i++){
				for(int j = 0; j < (size+1)/2; j++){
					for(int k = 0; k < size/2; k++){
						int temp = image[face][j][k];
						image[face][j][k] = image[face][k][size-1-j];
						image[face][k][size-1-j] = image[face][size-1-j][size-1-k];
						image[face][size-1-j][size-1-k] = image[face][size-1-k][j];
						image[face][size-1-k][j] = temp;
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
		paintCubeFace(g, 2*gap+size*cubieSize, 3*gap+2*size*cubieSize, size, cubieSize, state[1], colorScheme);
		paintCubeFace(g, 4*gap+3*size*cubieSize, 2*gap+size*cubieSize, size, cubieSize, state[2], colorScheme);
		paintCubeFace(g, 3*gap+2*size*cubieSize, 2*gap+size*cubieSize, size, cubieSize, state[3], colorScheme);
		paintCubeFace(g, 2*gap+size*cubieSize, gap, size, cubieSize, state[4], colorScheme);
		paintCubeFace(g, 2*gap+size*cubieSize, 2*gap+size*cubieSize, size, cubieSize, state[5], colorScheme);
	}

	private void paintCubeFace(Graphics2D g, int x, int y, int size, int cubieSize, int[][] faceColors, HashMap<String, Color> colorScheme) {
		for(int row = 0; row < size; row++) {
			for(int col = 0; col < size; col++) {
				int tempx = x + col*cubieSize;
				int tempy = y + row*cubieSize;
				g.setColor(colorScheme.get(""+FACES.charAt(faceColors[row][col])));
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
	protected void drawScramble(Graphics2D g, String scramble, HashMap<String, Color> colorScheme) throws InvalidScrambleException {
		if(scramble == null) scramble = "";
		
		int[][][] image = new int[6][size][size];
		for(int i = 0; i < 6; i++) {
			for(int j = 0; j < size; j++) {
				for(int k = 0; k < size; k++) {
					image[i][j][k] = i;
				}
			}
		}
		
		if(!validateScramble(scramble, image))
			throw new InvalidScrambleException(scramble);
	
		drawCube(g, image, gap, cubieSize, colorScheme);
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
	
}
