package scramblers;

import java.awt.Color;
import java.awt.Dimension;
import java.awt.Graphics2D;
import java.awt.Rectangle;
import java.awt.geom.GeneralPath;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Random;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import net.gnehzr.tnoodle.servers.scrambleserver.InvalidScrambleException;
import net.gnehzr.tnoodle.servers.scrambleserver.ScrambleImageGenerator;

import org.kociemba.twophase.ScrambleCacher;
import org.kociemba.twophase.Search;
import org.kociemba.twophase.Tools;

//TODO - massive cleanup! so much vestigial code
public class CubeScrambler extends ScrambleImageGenerator {
	public static CubeScrambler[] createScramblers() {
		ArrayList<CubeScrambler> scramblers = new ArrayList<CubeScrambler>();
		for(int i = 2; i <= 11; i++)
			scramblers.add(new CubeScrambler(i));
		return scramblers.toArray(new CubeScrambler[0]);
	}
	
	private static final String FACES = "LDBRUFldbruf";
	private static final int gap = 2;
	private static final int cubieSize = 10;
	private static final int[] DEFAULT_LENGTHS = { 0, 0, 25, 25, 40, 60, 80, 100, 120, 140, 160, 180 };
	
	private boolean multislice = true;
	private boolean wideNotation = false;
	
	private final int[][][] image;
	private final int size;
	private ScrambleCacher herbertScrambler;
	private int length;
	public CubeScrambler(int size) {
		if(size <= 0 || size >= DEFAULT_LENGTHS.length)
			throw new IllegalArgumentException("Invalid cube size");
		this.size = size;
		this.image = new int[6][size][size];

		if(size == 2)
			calcperm();
		else if(size == 3) {
			herbertScrambler = new ScrambleCacher();
		} else
			length = DEFAULT_LENGTHS[size];
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
	public String generateScramble(Random r, boolean obeySeed) {
		if(size == 2) {
			mix(r);
			return solve();
		} else if(size == 3) {
			return (obeySeed ?
						Search.solution(Tools.randomCube(r), 30, 60, false) :
						herbertScrambler.newScramble());
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
	
				for(int j = 0; j < slices; j++) slicesMoved[j] = 0;
				for(int j = 0; j < 3; j++) directionsMoved[j] = 0;
	
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
	private boolean validateScramble(String scramble) {
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
					slice(face, slice, dir);
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
	private void initializeImage() {
		for(int i = 0; i < 6; i++){
			for(int j = 0; j < size; j++){
				for(int k = 0; k < size; k++){
					image[i][j][k] = i;
				}
			}
		}
	}

	private void slice(int face, int slice, int dir){
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
		int size = state[0].length;
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
		initializeImage();
		if(!validateScramble(scramble))
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
	public HashMap<String, GeneralPath> getFaceBoundaries() {
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
	
	int[] posit;
	{
		initbrd();
	}
	private void initbrd(){
	    posit = new int[] {
	                1,1,1,1,
	                2,2,2,2,
	                5,5,5,5,
	                4,4,4,4,
	                3,3,3,3,
	                0,0,0,0};
	}
//	int[] seq = new int[1000];
//	private boolean solved(){
//	    for (int i=0;i<24; i+=4){
//	        int c=posit[i];
//	        for(int j=1;j<4;j++)
//	            if(posit[i+j]!=c) return false;
//	    }
//	    return true;
//	}
	int[][] cornerIndices = new int[][] { {15, 16, 21}, {14, 20, 4}, {13, 9, 17}, {12, 5, 8}, {3, 23, 18}, {2, 6, 22}, {1, 19, 11}, {0, 10, 7} };
	String[] cornerNames =   new String[] { "URF", 		"UFL", 		"UBR", 		"ULB", 			"DFR", 		"DLF", 		"DRB", 		"DBL" };
	HashMap<Character, Integer> faceToIndex = new HashMap<Character, Integer>();
	{
		faceToIndex.put('D', 1);
		faceToIndex.put('L', 2);
		faceToIndex.put('B', 5);
		faceToIndex.put('U', 4);
		faceToIndex.put('R', 3);
		faceToIndex.put('F', 0);
	}
	private void mix(Random r) {
		//Modified to choose a random state, rather than apply 500 random turns
		//-Jeremy Fleischman
		ArrayList<Integer> remaining = new ArrayList<Integer>(Arrays.asList(0, 1, 2, 3, 4, 5, 6));
		ArrayList<Integer> cp = new ArrayList<Integer>();
		while(remaining.size() > 0)
			cp.add(remaining.remove(r.nextInt(remaining.size())));
		//it would appear that the solver only works if the BLD piece is fixed, which is fine
		cp.add(7);

	    initbrd();
	    ArrayList<Integer> co = new ArrayList<Integer>();
		int sum = 0;
		for(int i = 0; i < cp.size(); i++) {
			int orientation;
			if(i == cp.size() - 1)
				orientation = 0;
			else if(i == cp.size() - 2)
				orientation = (3 - sum) % 3;
			else
				orientation = r.nextInt(3);
			co.add(orientation);
			sum = (sum + orientation) % 3;
			for(int j = 0; j < 3; j++) {
				int jj = (j + orientation) % 3;
				posit[cornerIndices[i][j]] = faceToIndex.get(cornerNames[cp.get(i)].charAt(jj));
			}
		}
	}
	int[] piece = new int[] {15,16,16,21,21,15,  13,9,9,17,17,13,  14,20,20,4,4,14,  12,5,5,8,8,12,
	                        3,23,23,18,18,3,   1,19,19,11,11,1,  2,6,6,22,22,2,    0,10,10,7,7,0};
	int[][] adj = new int[6][100];
	int[] opp=new int[100];
	int auto;
	int[] tot;
	private void calcadj(){
	    //count all adjacent pairs (clockwise around corners)
	    int a,b;
	    for(a=0;a<6;a++)for(b=0;b<6;b++) adj[a][b] = 0;
	    for(a=0;a<48;a+=2){
	        if(posit[piece[a]]<=5 && posit[piece[a+1]]<=5)
	            adj[posit[piece[a]]][posit[piece[a+1]]]++;
	    }
	}
//	private void calctot(){
//	    //count how many of each colour
//	    tot=new int[6];
//	    for(int e=0;e<24;e++)
//	    	tot[posit[e]]++;
//	}
	int[][] mov2fc = new int[6][];
	{
		mov2fc[0] = new int[] {0, 2, 3, 1, 23,19,10,6 ,22,18,11,7 }; //D
		mov2fc[1] = new int[] {4, 6, 7, 5, 12,20,2, 10,14,22,0, 8 }; //L
		mov2fc[2] = new int[] {8, 10,11,9, 12,7, 1, 17,13,5, 0, 19}; //B
		mov2fc[3] = new int[] {12,13,15,14,8, 17,21,4, 9, 16,20,5 }; //U
		mov2fc[4] = new int[] {16,17,19,18,15,9, 1, 23,13,11,3, 21 }; //R
		mov2fc[5] = new int[] {20,21,23,22,14,16,3, 6, 15,18,2, 4 }; //F
	}
//	private void domove(int y){
//	    int q=1+(y>>4);
//	    int f=y&15;
//	    while(q > 0){
//	        for(int i=0;i<mov2fc[f].length;i+=4){
//	            int c=posit[mov2fc[f][i]];
//	            posit[mov2fc[f][i]] = posit[mov2fc[f][i+3]];
//	            posit[mov2fc[f][i+3]] = posit[mov2fc[f][i+2]];
//	            posit[mov2fc[f][i+2]] = posit[mov2fc[f][i+1]];
//	            posit[mov2fc[f][i+1]] = c;
//	        }
//	        q--;
//	    }
//	}
	int[] sol=new int[100];
	static final String[] DIR_TO_STR = new String[] { "'", "2", ""};
	private String solve() {
	    calcadj();
	    int[] opp= new int[100];
	    for(int a=0;a<6;a++){
	        for(int b=0;b<6;b++){
	            if(a!=b && adj[a][b]+adj[b][a]==0) { opp[a] = b; opp[b] = a; }
	        }
	    }
	    //Each piece is determined by which of each pair of opposite colours it uses.
	    int[] ps=new int[100];
	    int[] tws=new int[100];
	    int a=0;
	    for(int d=0; d<7; d++){
	        int p=0;
	        for(int b=a;b<a+6;b+=2){
	            if(posit[piece[b]]==posit[piece[42]]) p+=4;
	            if(posit[piece[b]]==posit[piece[44]]) p+=1;
	            if(posit[piece[b]]==posit[piece[46]]) p+=2;
	        }
	        ps[d] = p;
	        if(posit[piece[a]]==posit[piece[42]] || posit[piece[a]]==opp[posit[piece[42]]]) tws[d] = 0;
	        else if(posit[piece[a+2]]==posit[piece[42]] || posit[piece[a+2]]==opp[posit[piece[42]]]) tws[d] = 1;
	        else tws[d] = 2;
	        a+=6;
	    }
	    //convert position to numbers
	    int q=0;
	    for(a=0;a<7;a++){
	        int b=0;
	        for(int c=0;c<7;c++){
	            if(ps[c]==a)break;
	            if(ps[c]>a)b++;
	        }
	        q=q*(7-a)+b;
	    }
	    int t=0;
	    for(a=5;a>=0;a--){
	        t=(int) (t*3+tws[a]-3*Math.floor(tws[a]/3));
	    }
	    if(q!=0 || t!=0){
	    	Arrays.fill(sol, -1);
	        for(int l=0;l<100;l++)
	            if(search(0,q,t,l,-1))
	            	break;
	        int turnCount = 0;
	        for(q=0;q<sol.length && sol[q] != -1;q++)
	        	turnCount++;
	        StringBuffer turns = new StringBuffer();
	        for(q=0; q<turnCount; q++) {
	            turns.append(" " + "URF".charAt(sol[q]/10) + DIR_TO_STR[sol[q]%10]);
	        }
	        return turns.substring(1);
	    }
	    return null;
	}
	private boolean search(int d, int q, int t, int l, int lm) {
	    //searches for solution, from position q|t, in l moves exactly. last move was lm, current depth=d
	    if(l==0) {
	        if(q==0 && t==0) {
	            return true;
	        }
	    } else {
	        if(perm[q]>l || twst[t]>l)
	        	return false;
	        int p,s,a,m;
	        for(m=0;m<3;m++){
	            if(m!=lm){
	                p=q; s=t;
	                for(a=0;a<3;a++){
	                    p=permmv[p][m];
	                    s=twstmv[s][m];
	                    sol[d] = 10*m+a;
	                    if(search(d+1,p,s,l-1,m))
	                    	return true;
	                }
	            }
	        }
	    }
	    return false;
	}
	int[] perm=new int[5040];
	int[] twst=new int[729];
	int[][] permmv=new int[5040][100];
	int[][] twstmv=new int[729][100];
	private void calcperm() {
	    //calculate solving arrays
	    //first permutation
	 
	    for(int p=0;p<5040;p++) {
	        perm[p] = -1;
	        for(int m=0;m<3;m++) {
	            permmv[p][m] = getprmmv(p,m);
	        }
	    }
	 
	    perm[0] = 0;
	    for(int l=0;l<=6;l++) {
	        int n=0;
	        for(int p=0;p<5040;p++) {
	            if(perm[p]==l){
	                for(int m=0;m<3;m++) {
	                    int q=p;
	                    for(int c=0;c<3;c++) {
	                        q=permmv[q][m];
	                        if(perm[q]==-1)
	                        	perm[q] = l+1; n++;
	                    }
	                }
	            }
	        }
	    }
	 
	    //then twist
	    for(int p=0;p<729;p++) {
	        twst[p] = -1;
	        for(int m=0;m<3;m++) {
	            twstmv[p][m] = gettwsmv(p,m);
	        }
	    }
	 
	    twst[0] = 0;
	    for(int l=0;l<=5;l++) {
	        int n=0;
	        for(int p=0;p<729;p++) {
	            if(twst[p]==l){
	                for(int m=0;m<3;m++) {
	                    int q=p;
	                    for(int c=0;c<3;c++) {
	                        q=twstmv[q][m];
	                        if(twst[q]==-1)
	                        	twst[q] = l+1; n++;
	                    }
	                }
	            }
	        }
	    }
	    //remove wait sign
	}
	private int getprmmv(int p, int m) {
	    //given position p<5040 and move m<3, return new position number
	    int a,b,c,q;
	    //convert number into array;
	    int[] ps=new int[100];
	    q=p;
	    for(a=1;a<=7;a++) {
	        b=q%a;
	        q=(q-b)/a;
	        for(c=a-1;c>=b;c--)
	        	ps[c+1] = ps[c];
	        ps[b] = 7-a;
	    }
	    //perform move on array
	    if(m==0){
	        //U
	        c=ps[0];ps[0] = ps[1];ps[1] = ps[3];ps[3] = ps[2];ps[2] = c;
	    }else if(m==1){
	        //R
	    	c=ps[0];ps[0] = ps[4];ps[4] = ps[5];ps[5] = ps[1];ps[1] = c;
	    }else if(m==2){
	        //F
	    	c=ps[0];ps[0] = ps[2];ps[2] = ps[6];ps[6] = ps[4];ps[4] = c;
	    }
	    //convert array back to number
	    q=0;
	    for(a=0;a<7;a++){
	        b=0;
	        for(c=0;c<7;c++){
	            if(ps[c]==a)break;
	            if(ps[c]>a)b++;
	        }
	        q=q*(7-a)+b;
	    }
	    return q;
	}
	private int gettwsmv(int p, int m){
	    //given orientation p<729 and move m<3, return new orientation number
	    int a,b,c,d,q;
	    //convert number into array;
	   	int[] ps=new int[100];
	    q=p;
	    d=0;
	    for(a=0;a<=5;a++){
	        c=(int) Math.floor(q/3);
	        b=q-3*c;
	        q=c;
	        ps[a] = b;
	        d-=b;if(d<0)d+=3;
	    }
	    ps[6] = d;
	    //perform move on array
	    if(m==0){
	        //U
	    	c=ps[0];ps[0] = ps[1];ps[1] = ps[3];ps[3] = ps[2];ps[2] = c;
	    }else if(m==1){
	        //R
	    	c=ps[0];ps[0] = ps[4];ps[4] = ps[5];ps[5] = ps[1];ps[1] = c;
	    	ps[0] += 2; ps[1]++; ps[5] += 2; ps[4]++;
	    }else if(m==2){
	        //F
	    	c=ps[0];ps[0] = ps[2];ps[2] = ps[6];ps[6] = ps[4];ps[4] = c;
	    	ps[2] += 2; ps[0]++; ps[4] += 2; ps[6]++;
	    }
	    //convert array back to number
	    q=0;
	    for(a=5;a>=0;a--){
	        q=q*3+(ps[a]%3);
	    }
	    return q;
	}
}
