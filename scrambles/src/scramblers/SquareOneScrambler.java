package scramblers;

import static net.gnehzr.tnoodle.scrambles.utils.ScrambleUtils.modulo;
import static net.gnehzr.tnoodle.scrambles.utils.ScrambleUtils.toColor;

import java.awt.BasicStroke;
import java.awt.Color;
import java.awt.Dimension;
import java.awt.Graphics2D;
import java.awt.RenderingHints;
import java.awt.geom.AffineTransform;
import java.awt.geom.Area;
import java.awt.geom.GeneralPath;
import java.awt.geom.Rectangle2D;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Random;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import net.gnehzr.tnoodle.scrambles.InvalidScrambleException;
import net.gnehzr.tnoodle.scrambles.ScrambleImageGenerator;

public class SquareOneScrambler extends ScrambleImageGenerator {
	private static final int length = 40;
	private static final int radius = 32;
	private static final int gap = 5;
	private boolean turnTop = true, turnBottom = true;
	
	//TODO this variables aren't thread safe
	private int twistCount; //this will tell us the state of the middle pieces
	private int[] state, turns;
	private boolean slashes;

	public static synchronized SquareOneScrambler[] createScramblers() {
		return new SquareOneScrambler[] { new SquareOneScrambler(false), new SquareOneScrambler(true) };
	}
	
	public SquareOneScrambler(boolean slashes) {
		this.slashes = slashes;
	}
	
	//Ported from http://www.worldcubeassociation.org/regulations/scrambles/scramble_square1.htm by Jeremy Fleischman
	/* Javascript written by Jaap Scherphuis,  jaapsch a t yahoo d o t com */
	private void initializeImage() {
		twistCount = 0;
		state = new int[]{ 0,0,1,2,2,3,4,4,5,6,6,7,8,9,9,10,11,11,12,13,13,14,15,15 }; //piece array
		turns = new int[length];
	}

	protected String generateScramble(Random r) {
		initializeImage();
		int i,move,ls;
		ls=-1;
		for(i = 0; i < length; i++) {
			do {
				if(ls==0) {
					move=r.nextInt(22)-11;
					if(move>=0) move++;
				} else if(ls==1) {
					move=r.nextInt(12)-11;
				} else if(ls==2) {
					move=0;
				} else {
					move=r.nextInt(23)-11;
				}
				//we don't want to apply to restriction to the bottom if we're not allowed to turn the top
				//if we did, we might loop forever making scrambles for a bandaged square 1
			} while( (turnTop && twistCount>1 && move>=-6 && move<0) || domove(i, move));
			if(move>0) ls=1;
			else if(move<0) ls=2;
			else { ls=0; }
		}
		return finalizeScrambleString();
	}

	private String finalizeScrambleString() {
		StringBuilder scram = new StringBuilder();
		int l=-1;
		for(int i=0; i < turns.length; i++) {
			int k=turns[i];
			if(k==0) {
				if(l==-1) scram.append(" (0,0)");
				if(l==1) scram.append("0)");
				if(l==2) scram.append(")");
				if(l != 0 && slashes)
					scram.append(" /");
				l=0;
			}else if(k>0) {
				scram.append(" (").append(k > 6 ? k-12 : k).append(",");
				l=1;
			}else if(k<0) {
				if(l<=0) scram.append(" (0,");
				scram.append(k <= -6 ? k+12 : k);
				l=2;
			}
		}
		if(l==1) scram.append("0");
		if(l!=0) scram.append(")");
		return scram.toString().trim();
	}
	
	//returns true if invalid, false if valid
	private boolean domove(int index, int m) {
		int i,c,f=m;
		//do move f
		if(f == 0) { //slash
			for(i = 0; i < 6; i++){
				c=state[i+12];
				state[i+12]=state[i+6];
				state[i+6]=c;
			}
			twistCount++;
		} else if(f > 0) { //turn the top
			if(!turnTop) return true;
			f=modulo(12-f, 12);
			if( state[f]==state[f-1] ) return true;
			if( f<6 && state[f+6]==state[f+5] ) return true;
			if( f>6 && state[f-6]==state[f-7] ) return true;
			if( f==6 && state[0]==state[11] ) return true;
			int[] t = new int[12];
			for(i=0;i<12;i++) t[i]=state[i];
			c=f;
			for(i=0;i<12;i++){
				state[i] = t[c];
				if(c == 11)c=0; else c++;
			}
		} else if(f < 0) { //turn the bottom
			if(!turnBottom) return true;
			f=modulo(-f, 12);
			if( state[f+12]==state[f+11] ) return true;
			if( f<6 && state[f+18]==state[f+17] ) return true;
			if( f>6 && state[f+6]==state[f+5] ) return true;
			if( f==6 && state[12]==state[23] ) return true;
			int[] t = new int[12];
			for(i=0;i<12;i++) t[i]=state[i+12];
			c=f;
			for(i=0;i<12;i++){
				state[i+12]=t[c];
				if(c==11)c=0; else c++;
			}
		}
		turns[index]=m;
		return false;
	}
	//**********END JAAP's CODE***************

	private static final Pattern regexp = Pattern.compile("^ *(-?\\d+) *, *(-?\\d+) *$");
	private boolean validateScramble(String scramble) {
		initializeImage();
		if(scramble == null || scramble.isEmpty())
			return true;
		int length = 0;
		String[] trns = scramble.split("(\\(|\\)|\\( *\\))", -1);
		turns = new int[trns.length*3]; //definitely big enough, no need to trim
		for(int ch = 0; ch < trns.length; ch++) {
			Matcher match;
			if(trns[ch].matches(" *")) {

			} else if(trns[ch].matches(" */ *")) {
				domove(length++, 0);
			} else if((match = regexp.matcher(trns[ch])).matches()) {
				int top = Integer.parseInt(match.group(1));
				int bot = Integer.parseInt(match.group(2));
				top = modulo(top, 12);
				bot = modulo(bot, 12);
				if(top != 0 && domove(length++, top))
					return false;
				if(bot != 0 && domove(length++, bot-12))
					return false;
				if(!slashes)
					domove(length++, 0);
			} else
				return false;
		}
//		finalizeScrambleString();
		return true;
	}

	private void drawFace(Graphics2D g, int[] face, double x, double y, int gap, int radius, Color[] colorScheme) {
		g.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
		g.setStroke(new BasicStroke(1, BasicStroke.CAP_BUTT, BasicStroke.JOIN_ROUND));
		for(int ch = 0; ch < 12; ch++) {
			if(ch < 11 && face[ch] == face[ch+1])
				ch++;
			drawPiece(g, face[ch], x, y, gap, radius, colorScheme);
		}
	}

	private int drawPiece(Graphics2D g, int piece, double x, double y, int gap,	int radius, Color[] colorScheme) {
		boolean corner = isCornerPiece(piece);
		int degree = 30 * (corner ? 2 : 1);
		GeneralPath[] p = corner ? getCornerPoly(x, y, radius) : getWedgePoly(x, y, radius);

		Color[] cls = getPieceColors(piece, colorScheme);
		for(int ch = cls.length - 1; ch >= 0; ch--) {
			g.setColor(cls[ch]);
			g.fill(p[ch]);
			g.setColor(Color.BLACK);
			g.draw(p[ch]);
		}
		g.rotate(Math.toRadians(degree), x, y);
		return degree;
	}

	private boolean isCornerPiece(int piece) {
		return ((piece + (piece <= 7 ? 0 : 1)) % 2) == 0;
	}

	private Color[] getPieceColors(int piece, Color[] colorScheme) {
		boolean up = piece <= 7;
		Color top = up ? colorScheme[4] : colorScheme[5];
		if(isCornerPiece(piece)) { //corner piece
			if(!up)
				piece = 15 - piece;
			Color a = colorScheme[(piece/2+3) % 4];
			Color b = colorScheme[piece/2];
			if(!up) { //mirror for bottom
				Color t = a;
				a = b;
				b = t;
			}
			return new Color[] { top, a, b }; //ordered counter-clockwise
		} else { //wedge piece
			if(!up)
				piece = 14 - piece;
			return new Color[] { top, colorScheme[piece/2] };
		}
	}

	private static final double multiplier = 1.4;
	private GeneralPath[] getWedgePoly(double x, double y, int radius) {
		AffineTransform trans = AffineTransform.getTranslateInstance(x, y);
		GeneralPath p = new GeneralPath();
		p.moveTo(0, 0);
		p.lineTo(radius, 0);
		double tempx = Math.sqrt(3) * radius / 2.0;
		double tempy = radius / 2.0;
		p.lineTo(tempx, tempy);
		p.closePath();
		p.transform(trans);

		GeneralPath side = new GeneralPath();
		side.moveTo(radius, 0);
		side.lineTo(multiplier * radius, 0);
		side.lineTo(multiplier * tempx, multiplier * tempy);
		side.lineTo(tempx, tempy);
		side.closePath();
		side.transform(trans);
		return new GeneralPath[]{ p, side };
	}
	private GeneralPath[] getCornerPoly(double x, double y, int radius) {
		AffineTransform trans = AffineTransform.getTranslateInstance(x, y);
		GeneralPath p = new GeneralPath();
		p.moveTo(0, 0);
		p.lineTo(radius, 0);
		double tempx = radius*(1 + Math.cos(Math.toRadians(75))/Math.sqrt(2));
		double tempy = radius*Math.sin(Math.toRadians(75))/Math.sqrt(2);
		p.lineTo(tempx, tempy);
		double tempX = radius / 2.0;
		double tempY = Math.sqrt(3) * radius / 2.0;
		p.lineTo(tempX, tempY);
		p.closePath();
		p.transform(trans);

		GeneralPath side1 = new GeneralPath();
		side1.moveTo(radius, 0);
		side1.lineTo(multiplier * radius, 0);
		side1.lineTo(multiplier * tempx, multiplier * tempy);
		side1.lineTo(tempx, tempy);
		side1.closePath();
		side1.transform(trans);

		GeneralPath side2 = new GeneralPath();
		side2.moveTo(multiplier * tempx, multiplier * tempy);
		side2.lineTo(tempx, tempy);
		side2.lineTo(tempX, tempY);
		side2.lineTo(multiplier * tempX, multiplier * tempY);
		side2.closePath();
		side2.transform(trans);
		return new GeneralPath[]{ p, side1, side2 };
	}

	private static Dimension getImageSize(int gap, int radius) {
		return new Dimension(getWidth(gap, radius), getHeight(gap, radius));
	}
	private static final double RADIUS_MULTIPLIER = Math.sqrt(2) * Math.cos(Math.toRadians(15));
	private static int getWidth(int gap, int radius) {
		return (int) (2 * RADIUS_MULTIPLIER * multiplier * radius);
	}
	private static int getHeight(int gap, int radius) {
		return (int) (4 * RADIUS_MULTIPLIER * multiplier * radius);
	}
//	public static int getNewUnitSize(int width, int height, int gap, String variation) {
//		return (int) Math.round(Math.min(width / (2 * RADIUS_MULTIPLIER * multiplier), height / (4 * RADIUS_MULTIPLIER * multiplier)));
//	}

	//x, y are the coordinates of the center of the square
	private static Area getSquare(double x, double y, double half_width) {
		return new Area(new Rectangle2D.Double(x - half_width, y - half_width, 2 * half_width, 2 * half_width));
	}
	//type is the orientation of the triangle, in multiples of 90 degrees ccw
	private static Area getTri(double x, double y, double width, int type) {
		GeneralPath tri = new GeneralPath();
		tri.moveTo(width / 2.0, width / 2.0);
		tri.lineTo((type == 3) ? width : 0, (type < 2) ? 0 : width);
		tri.lineTo((type == 1) ? 0 : width, (type % 3 == 0) ? 0 : width);
		tri.closePath();
		tri.transform(AffineTransform.getTranslateInstance(x - width / 2.0, y - width / 2.0));
		return new Area(tri);
	}

	@Override
	protected void drawScramble(Graphics2D g, String scramble, HashMap<String, Color> colorSchemeMap) throws InvalidScrambleException {
		if(!validateScramble(scramble))
			throw new InvalidScrambleException(scramble);
		Color[] colorScheme = new Color[6];
		for(int i = 0; i < colorScheme.length; i++) {
			colorScheme[i] = colorSchemeMap.get("LBRFUD".charAt(i)+"");
		}
		Dimension dim = getImageSize(gap, radius);
		int width = dim.width;
		int height = dim.height;

		double half_square_width = (radius * RADIUS_MULTIPLIER * multiplier) / Math.sqrt(2);
		double edge_width = 2 * radius * multiplier * Math.sin(Math.toRadians(15));
		double corner_width = half_square_width - edge_width / 2.;
		Rectangle2D.Double left_mid = new Rectangle2D.Double(width / 2. - half_square_width, height / 2. - radius * (multiplier - 1) / 2., corner_width, radius * (multiplier - 1));
		Rectangle2D.Double right_mid;
		if(twistCount % 2 == 0) {
			right_mid = new Rectangle2D.Double(width / 2. - half_square_width, height / 2. - radius * (multiplier - 1) / 2., 2*corner_width + edge_width, radius * (multiplier - 1));
			g.setColor(colorScheme[3]); //front
		} else {
			right_mid = new Rectangle2D.Double(width / 2. - half_square_width, height / 2. - radius * (multiplier - 1) / 2., corner_width + edge_width, radius * (multiplier - 1));
			g.setColor(colorScheme[1]); //back
		}
		g.fill(right_mid);
		g.setColor(colorScheme[3]); //front
		g.fill(left_mid); //this will clobber part of the other guy
		g.setColor(Color.BLACK);
		g.draw(right_mid);
		g.draw(left_mid);

		double x = width / 2.0;
		double y = height / 4.0;
		AffineTransform old = g.getTransform();
		g.rotate(Math.toRadians(90 + 15), x, y);
		drawFace(g, state, x, y, gap, radius, colorScheme);
		g.setTransform(old);

		y *= 3.0;
		g.rotate(Math.toRadians(-90 - 15), x, y);
		drawFace(g, Arrays.copyOfRange(state, 12, state.length), x, y, gap, radius, colorScheme);
	}

	private static HashMap<String, Color> defaultColorScheme = new HashMap<String, Color>();
	static {
		defaultColorScheme.put("L", toColor("ffff00"));
		defaultColorScheme.put("B", toColor("ff0000"));
		defaultColorScheme.put("R", toColor("0000ff"));
		defaultColorScheme.put("F", toColor("ffc800"));
		defaultColorScheme.put("U", toColor("ffffff"));
		defaultColorScheme.put("D", toColor("00ff00"));
	}
	@Override
	public HashMap<String, Color> getDefaultColorScheme() {
		return new HashMap<String, Color>(defaultColorScheme);
	}

	@Override
	//***NOTE*** this works only for the simple case where the puzzle is a cube
	public HashMap<String, GeneralPath> getDefaultFaceBoundaries() {
		int width = getWidth(gap, radius);
		int height = getHeight(gap, radius);
		double half_width = (radius * RADIUS_MULTIPLIER) / Math.sqrt(2);

		Area up = getSquare(width / 2.0, height / 4.0, half_width);
		Area down = getSquare(width / 2.0, 3 * height / 4.0, half_width);
		Area front = new Area(new Rectangle2D.Double(width / 2. - half_width * multiplier, height / 2. - radius * (multiplier - 1) / 2., 2 * half_width * multiplier, radius * (multiplier - 1)));

		Area[] faces = new Area[6];
		for(int ch = 0; ch < 4; ch++) {
			faces[ch] = new Area();
			faces[ch].add(getTri(width / 2.0, height / 4.0, 2 * half_width * multiplier, (5-ch) % 4));
			faces[ch].add(getTri(width / 2.0, 3 * height / 4.0, 2 * half_width * multiplier, (ch+1) % 4));
			faces[ch].subtract(up);
			faces[ch].subtract(down);
		}
		faces[3].add(front);
		faces[4] = up;
		faces[5] = down;
		
		HashMap<String, GeneralPath> facesMap = new HashMap<String, GeneralPath>();
		for(int i = 0; i < faces.length; i++) {
			facesMap.put("LBRFUD".charAt(i)+"", new GeneralPath(faces[i]));
		}
		return facesMap;
	}

	@Override
	protected Dimension getPreferredSize() {
		return getImageSize(gap, radius);
	}

	@Override
	public String getLongName() {
		if(slashes)
			return "Square-1";
		else
			return "Square-1 (implicit slashes)";
	}

	@Override
	public String getShortName() {
		if(slashes)
			return "sq1";
		else
			return "sq1wca";
	}
}
