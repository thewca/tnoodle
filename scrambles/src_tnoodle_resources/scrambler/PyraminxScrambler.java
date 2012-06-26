package scrambler;

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
import java.util.Collections;
import java.util.HashMap;
import java.util.Random;

import net.gnehzr.tnoodle.scrambles.InvalidScrambleException;
import net.gnehzr.tnoodle.scrambles.Scrambler;

public class PyraminxScrambler extends Scrambler {
	private static final int MIN_SCRAMBLE_LENGTH = 11;
	private static final int pieceSize = 30;
	private static final int gap = 5;
	
	private static String regexp = "^[ULRBulrb]'?$";
	private int[][] validateScramble(String scramble) {
		int[][] image = new int[4][9];
		for(int i = 0; i < image.length; i++){
			for(int j = 0; j < image[0].length; j++){
				image[i][j] = i;
			}
		}
		if(scramble == null || scramble.isEmpty())
			return image;
		String[] strs = scramble.split("\\s+");

		for(int i = 0; i < strs.length; i++){
			if(!strs[i].matches(regexp)) return null;
		}

		try{
			for(int i = 0; i < strs.length; i++){
				int face = "ULRBulrb".indexOf(strs[i].charAt(0));
				if(face == -1) return null;
				int dir = (strs[i].length() == 1 ? 1 : 2);
				if(face >= 4) turnTip(face - 4, dir, image);
				else turn(face, dir, image);
			}
		} catch(Exception e){
			e.printStackTrace();
			return null;
		}

		return image;
	}

	static int[] g = new int[720];
	static int[] f = new int[2592];
	static int[][] d = new int[720][];
	static int[][] e = new int[2592][];

	static {
		int c, p, q, l, m;
		for (p = 0; p < 720; p++) {
			g[p] = -1;
			d[p] = new int[4];
			for (m = 0; m < 4; m++)
				d[p][m] = w(p, m);
		}
		g[0] = 0;
		for (l = 0; l <= 6; l++)
			for (p = 0; p < 720; p++)
				if (g[p] == l)
					for (m = 0; m < 4; m++) {
						q = p;
						for (c = 0; c < 2; c++) {
							q = d[q][m];
							if (g[q] == -1)
								g[q] = l + 1;
						}
					}
		for (p = 0; p < 2592; p++) {
			f[p] = -1;
			e[p] = new int[4];
			for (m = 0; m < 4; m++)
				e[p][m] = x(p, m);
		}
		f[0] = 0;
		for (l = 0; l <= 5; l++)
			for (p = 0; p < 2592; p++)
				if (f[p] == l)
					for (m = 0; m < 4; m++) {
						q = p;
						for (c = 0; c < 2; c++) {
							q = e[q][m];
							if (f[q] == -1)
								f[q] = l + 1;
						}
					}
	}

	private static final String TIPS = "lrbu";
	private static final String SIDES = "ULRB";
	private static final String[] DIR_TO_STR = new String[] { "", "'" };
	protected String generateScramble(Random r) {
		ArrayList<Integer> turns = new ArrayList<Integer>();
		int t = 0, s = 0, q = 0, m, l, p;
		int[] h = new int[] { 0, 1, 2, 3, 4, 5 };
		for (m = 0; m < 4; m++) {
			p = m + r.nextInt(6 - m);
			l = h[m];
			h[m] = h[p];
			h[p] = l;
			if (m != p)
				s++;
		}
		if (s % 2 == 1) {
			l = h[4];
			h[4] = h[5];
			h[5] = l;
		}
		s = 0;
		int[] i = new int[10];
		for (m = 0; m < 5; m++) {
			i[m] = r.nextInt(2);
			s += i[m];
		}
		i[5] = s % 2;
		for (m = 6; m < 10; m++) {
			i[m] = r.nextInt(3);
		}
		for (m = 0; m < 6; m++) {
			l = 0;
			for (p = 0; p < 6; p++) {
				if (h[p] == m)
					break;
				if (h[p] > m)
					l++;
			}
			q = q * (6 - m) + l;
		}
		for (m = 9; m >= 6; m--)
			t = t * 3 + i[m];
		for (m = 4; m >= 0; m--)
			t = t * 2 + i[m];
		if (q != 0 || t != 0)
			for (m = MIN_SCRAMBLE_LENGTH; m < 12; m++)
				if (v(q, t, m, -1, turns))
					break;

		Collections.reverse(turns);
		StringBuffer scramble = new StringBuffer(2*(turns.size()+4));
		for (p = 0; p < turns.size(); p++) {
			scramble.append(" " + SIDES.charAt(turns.get(p) & 7) + DIR_TO_STR[(turns.get(p) & 8) / 8]);
		}
		for (p = 0; p < 4; p++) {
			q = r.nextInt(3);
			if (q < 2)
				scramble.append(" " + TIPS.charAt(p) + DIR_TO_STR[q]);
		}
		return scramble.substring(1);
	}

	private boolean v(int q, int t, int l, int c, ArrayList<Integer> turns) {
		if (l == 0) {
			if (q == 0 && t == 0)
				return true;
		} else {
			if (g[q] > l || f[t] > l)
				return false;
			int p, s, a, m;
			for (m = 0; m < 4; m++)
				if (m != c) {
					p = q;
					s = t;
					for (a = 0; a < 2; a++) {
						p = d[p][m];
						s = e[s][m];
						if (v(p, s, l - 1, m, turns)) {
							turns.add(m + 8 * a);
							return true;
						}
					}
				}
		}
		return false;
	}

	private static int w(int p, int m) {
		int a, l, c, q = p;
		int[] s = new int[7];
		for (a = 1; a <= 6; a++) {
			c = (int) Math.floor(q / a);
			l = q - a * c;
			q = c;
			for (c = a - 1; c >= l; c--) {
				int val = c < s.length ? s[c] : 0;
				s[c + 1] = val;
			}
			s[l] = 6 - a;
		}
		if (m == 0)
			y(s, 0, 3, 1);
		if (m == 1)
			y(s, 1, 5, 2);
		if (m == 2)
			y(s, 0, 2, 4);
		if (m == 3)
			y(s, 3, 4, 5);
		q = 0;
		for (a = 0; a < 6; a++) {
			l = 0;
			for (c = 0; c < 6; c++) {
				if (s[c] == a)
					break;
				if (s[c] > a)
					l++;
			}
			q = q * (6 - a) + l;
		}
		return q;
	}

	private static int x(int p, int m) {
		int a, l, c, t = 0, q = p;
		int[] s = new int[10];
		for (a = 0; a <= 4; a++) {
			s[a] = q & 1;
			q >>= 1;
			t ^= s[a];
		}
		s[5] = t;
		for (a = 6; a <= 9; a++) {
			c = (int) Math.floor(q / 3);
			l = q - 3 * c;
			q = c;
			s[a] = l;
		}
		if (m == 0) {
			s[6] = s[6] + 1;
			if (s[6] == 3)
				s[6] = 0;
			y(s, 0, 3, 1);
			s[1] ^= 1;
			s[3] ^= 1;
		}
		if (m == 1) {
			s[7]++;
			if (s[7] == 3)
				s[7] = 0;
			y(s, 1, 5, 2);
			s[2] ^= 1;
			s[5] ^= 1;
		}
		if (m == 2) {
			s[8]++;
			if (s[8] == 3)
				s[8] = 0;
			y(s, 0, 2, 4);
			s[0] ^= 1;
			s[2] ^= 1;
		}
		if (m == 3) {
			s[9]++;
			if (s[9] == 3)
				s[9] = 0;
			y(s, 3, 4, 5);
			s[3] ^= 1;
			s[4] ^= 1;
		}
		q = 0;
		for (a = 9; a >= 6; a--)
			q = q * 3 + s[a];
		for (a = 4; a >= 0; a--)
			q = q * 2 + s[a];
		return q;
	}
	 
	private static void y(int[] p, int a, int c, int t) {
		int s = p[a];
		p[a] = p[c];
		p[c] = p[t];
		p[t] = s;
	}

	private void turn(int side, int dir, int[][] image){
		for(int i = 0; i < dir; i++){
			turn(side, image);
		}
	}

	private void turnTip(int side, int dir, int[][] image){
		for(int i = 0; i < dir; i++){
			turnTip(side, image);
		}
	}

	private void turn(int s, int[][] image){
		switch(s){
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
		}
		turnTip(s, image);
	}

	private void turnTip(int s, int[][] image){
		switch(s){
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
		}
	}

	private void swap(int f1, int s1, int f2, int s2, int f3, int s3, int[][] image){
		int temp = image[f1][s1];
		image[f1][s1] = image[f2][s2];
		image[f2][s2] = image[f3][s3];
		image[f3][s3] = temp;
	}

	public static Dimension getImageSize(int gap, int pieceSize) {
		return new Dimension(getPyraminxViewWidth(gap, pieceSize), getPyraminxViewHeight(gap, pieceSize));
	}

	private void drawMinx(Graphics2D g, int gap, int pieceSize, Color[] colorScheme, int[][] image){
		drawTriangle(g, 2*gap+3*pieceSize, gap+Math.sqrt(3)*pieceSize, true, image[0], pieceSize, colorScheme);
		drawTriangle(g, 2*gap+3*pieceSize, 2*gap+2*Math.sqrt(3)*pieceSize, false, image[1], pieceSize, colorScheme);
		drawTriangle(g, gap+1.5*pieceSize, gap+Math.sqrt(3)/2*pieceSize, false, image[2], pieceSize, colorScheme);
		drawTriangle(g, 3*gap+4.5*pieceSize, gap+Math.sqrt(3)/2*pieceSize,  false, image[3], pieceSize, colorScheme);
	}

	private void drawTriangle(Graphics2D g, double x, double y, boolean up, int[] state, int pieceSize, Color[] colorScheme){
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
		for(int i = 0; i < 3; i++){
			xs[i]=1/3.*xpoints[(i+1)%3]+2/3.*xpoints[i];
			ys[i]=1/3.*ypoints[(i+1)%3]+2/3.*ypoints[i];
			xs[i+3]=2/3.*xpoints[(i+1)%3]+1/3.*xpoints[i];
			ys[i+3]=2/3.*ypoints[(i+1)%3]+1/3.*ypoints[i];
		}

		GeneralPath[] ps = new GeneralPath[9];
		for(int i = 0; i < ps.length; i++){
			ps[i] = new GeneralPath();
		}

		Point2D.Double center = getLineIntersection(xs[0], ys[0], xs[4], ys[4], xs[2], ys[2], xs[3], ys[3]);

		for(int i = 0; i < 3; i++){
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

		for(int i = 0; i < ps.length; i++){
			g.setColor(colorScheme[state[i]]);
			g.fill(ps[i]);
			g.setColor(Color.BLACK);
			g.draw(ps[i]);
		}
	}

	private static GeneralPath triangle(boolean pointup, int pieceSize){
		int rad = (int)(Math.sqrt(3) * pieceSize);
		double[] angs = { 7/6., 11/6., .5 };
		if(pointup) for(int i = 0; i < angs.length; i++) angs[i] += 1/3.;
		for(int i = 0; i < angs.length; i++) angs[i] *= Math.PI;
		double[] x = new double[angs.length];
		double[] y = new double[angs.length];
		for(int i = 0; i < x.length; i++){
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

	public static Point2D.Double getLineIntersection(double x1, double y1, double x2, double y2, double x3, double y3, double x4, double y4){
		return new Point2D.Double(
			det(det(x1, y1, x2, y2), x1 - x2,
					det(x3, y3, x4, y4), x3 - x4)/
				det(x1 - x2, y1 - y2, x3 - x4, y3 - y4),
			det(det(x1, y1, x2, y2), y1 - y2,
					det(x3, y3, x4, y4), y3 - y4)/
				det(x1 - x2, y1 - y2, x3 - x4, y3 - y4));
	}

	public static double det(double a, double b, double c, double d){
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

	@Override
	protected void drawScramble(Graphics2D g, String scramble, HashMap<String, Color> colorScheme) throws InvalidScrambleException {
		int[][] image = validateScramble(scramble);
		if(image == null) {
			throw new InvalidScrambleException(scramble);
		}
		
		Color[] scheme = new Color[4];
		for(int i = 0; i < scheme.length; i++) {
			scheme[i] = colorScheme.get("FDLR".charAt(i)+"");
		}
		drawMinx(g, gap, pieceSize, scheme, image);
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
}
