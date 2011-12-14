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

import net.gnehzr.tnoodle.scrambles.InvalidScrambleException;
import net.gnehzr.tnoodle.scrambles.Scrambler;
import cs.min2phase.Search;
import cs.min2phase.Tools;

//TODO - massive cleanup! so much vestigial code
public class CubeScrambler extends Scrambler {
    private static final int MAX_SCRAMBLE_LENGTH = 21;
    private static final int TIMEOUT = 5*1000; //milliseconds
    
	private static final String FACES = "LDBRUFldbruf";
	private static final int gap = 2;
	private static final int cubieSize = 10;
	private static final int[] DEFAULT_LENGTHS = { 0, 0, 25, 25, 40, 60, 80, 100, 120, 140, 160, 180 };
	
	private boolean multislice = true;
	private boolean wideNotation = true;
	
	private final int size;
	private int length;
	private TwoByTwoSolver twoSolver = null;
	private ThreadLocal<Search> twoPhaseSearcher = null;
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
		} else {
			length = DEFAULT_LENGTHS[size];
		}
	}
	
	@Override
	public String getLongName() {
		return getShortName();
	}

	@Override
	public String getShortName() {
		return size + "x" + size + "x" + size;
	}

	@Override
	public String generateScramble(Random r) {
		if(size == 2) {
			int[] posit = twoSolver.mix(r);
			return twoSolver.solve(posit);
		} else if(size == 3) {
			return twoPhaseSearcher.get().solution(Tools.randomCube(r), MAX_SCRAMBLE_LENGTH, TIMEOUT, false, true).trim();
		} else {
			StringBuffer scramble = new StringBuffer(length*3);
			int lastAxis = -1;
			int axis = 0;
			int slices = size - ((multislice || size % 2 != 0) ? 1 : 0);
			int[] slicesMoved = new int[slices];
			int[] directionsMoved = new int[3];
			int moved = 0;
	
			for(int i = 0; i < length; i += moved) {
				moved = 0;
				do {
					axis = r.nextInt(3);
				} while(axis == lastAxis);
	
				for(int j = 0; j < slicesMoved.length; j++) slicesMoved[j] = 0;
				for(int j = 0; j < directionsMoved.length; j++) directionsMoved[j] = 0;
	
				do {
					int slice;
					do {
						slice = r.nextInt(slices);
					} while(slicesMoved[slice] != 0);
					int direction = r.nextInt(3);
	
					if(multislice || slices != size || (directionsMoved[direction] + 1) * 2 < slices ||
							(directionsMoved[direction] + 1) * 2 == slices && directionsMoved[0] + directionsMoved[1] + directionsMoved[2] == directionsMoved[direction]) {
						directionsMoved[direction]++;
						moved++;
						slicesMoved[slice] = direction + 1;
					}
				} while(r.nextInt(3) == 0 && moved < slices && moved + i < length);
	
				for(int j = 0; j < slices; j++) {
					if(slicesMoved[j] > 0) {
						int direction = slicesMoved[j] - 1;
						int face = axis;
						int slice = j;
						if(2 * j + 1 >= slices){
							face += 3;
							slice = slices - 1 - slice;
							direction = 2 - direction;
						}
	
						int n = ((slice * 6 + face) * 4 + direction);
						scramble.append(" " + moveString(n));
					}
				}
				lastAxis = axis;
			}
			return scramble.substring(1);
		}
	}

	private String moveString(int n) {
		String move = "";
		int face = n >> 2;
		int direction = n & 3;

		if(size <= 5) {
			if(wideNotation) {
				move += FACES.charAt(face % 6);
				if(face / 6 != 0) move += "w";
			}
			else{
				move += FACES.charAt(face);
			}
		}
		else {
			String f = "" + FACES.charAt(face % 6);
			if(face / 6 == 0) {
				move += f;
			} else {
				move += (face / 6 + 1) + f;
			}
		}
		if(direction != 0) move += " 2'".charAt(direction);

		return move;
	}
	
	//TODO - change to not rely upon whitespace
	private final static String regexp2 = "^(\\s*[LDBRUF]2?'?)*\\s*$";
	private final static String regexp345 = "^(\\s*(?:[LDBRUF]w?|[ldbruf])2?'?)*\\s*$";
	private final static String regexp = "^(\\s*(\\d+)?([LDBRUF])2?'?)*\\s*$";
	private final static Pattern shortPattern = Pattern.compile(regexp);
	private boolean validateScramble(String scramble, int[][][] image) {
		if(size < 2) return false;
		else if(size == 2 && !scramble.matches(regexp2))
			return false;
		else if(size <= 5 && !scramble.matches(regexp345))
			return false;
		else if(size > 5 && !scramble.matches(regexp))
			return false;
		String[] strs = scramble.split("\\s+");
		StringBuilder newScram = new StringBuilder();
		try{
			for(int i = 0; i < strs.length; i++) {
				if(strs[i].isEmpty()) continue;
				int face;
				String slice1 = null;
				if(size > 5) {
					Matcher m = shortPattern.matcher(strs[i]);
					if(!m.matches()) {
						return false;
					}
					slice1 = m.group(2);
					face = FACES.indexOf(m.group(3));
				} else {
					face = FACES.indexOf(strs[i].charAt(0) + "");
				}

				int slice = face / 6;
				face %= 6;
				if(strs[i].indexOf("w") >= 0) slice++;
				else if(slice1 != null)
					slice = Integer.parseInt(slice1) - 1;

				int dir = " 2'".indexOf(strs[i].charAt(strs[i].length() - 1) + "");
				if(dir < 0) dir = 0;
				
				int n = ((slice * 6 + face) * 4 + dir);
				newScram.append(" ");
				newScram.append(moveString(n));

				do{
					slice(face, slice, dir, image);
					slice--;
				} while(multislice && slice >= 0);
			}
		} catch(Exception e){
			e.printStackTrace();
			return false;
		}

		if(newScram.length() > 0)
			scramble = newScram.substring(1); //we do this to force notation update when an attribute changes
		else scramble = newScram.toString();
		return true;
	}

	private void slice(int face, int slice, int dir, int[][][] image) {
		face %= 6;
		int sface = face;
		int sslice = slice;
		int sdir = dir;

		if(face > 2){
			sface -= 3;
			sslice = size - 1 - slice;
			sdir = 2 - dir;
		}
		for(int i = 0; i <= sdir; i++){
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
			for(int i = 0; i <= 2-dir; i++){
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
