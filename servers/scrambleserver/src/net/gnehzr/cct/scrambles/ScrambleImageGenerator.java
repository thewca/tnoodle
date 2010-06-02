package net.gnehzr.cct.scrambles;

import static net.gnehzr.cct.scrambles.ScrambleUtils.ceil;

import java.awt.Color;
import java.awt.Dimension;
import java.awt.Graphics2D;
import java.awt.geom.AffineTransform;
import java.awt.geom.GeneralPath;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;

/**
 * Any classes that wish to provide scramble images as well as scrambles
 * should extend this class rather than ScrambleGenerator.
 * @author Jeremy Fleischman
 */
public abstract class ScrambleImageGenerator extends ScrambleGenerator {
	/**
	 * Subclasses of ScrambleImageGenerator are expected to produce scrambles of one size,
	 * this abstract class will resize appropriately.
	 * @return The size of the images this ScrambleGenerator will produce.
	 */
	protected abstract Dimension getPreferredSize();
	
	/**
	 * @return A HashMap mapping face names to PuzzleFaces
	 */
	public abstract HashMap<String, Color> getDefaultColorScheme();
	
	/**
	 * @return A HashMap mapping face names to GeneralPaths.
	 */
	public abstract HashMap<String, GeneralPath> getFaceBoundaries();

	/**
	 * Draws the result of the puzzle after applying scramble.
	 * @param g The Graphics2D object to draw upon (guaranteed to be big enough for getScrambleSize())
	 * @param scramble The scramble to validate and apply to the puzzle. NOTE: May be null!
	 * @param colorScheme A HashMap mapping face names to Colors, must have an entry for every face!
	 * @throws InvalidScrambleException If scramble is invalid.
	 */
	protected abstract void drawScramble(Graphics2D g, String scramble, HashMap<String, Color> colorScheme) throws InvalidScrambleException;
	
	/**
	 * Computes the best size to draw the scramble image.
	 * @param maxWidth The maximum allowed width of the resulting image, 0 if it doesn't matter.
	 * @param maxHeight The maximum allowed height of the resulting image, 0 if it doesn't matter.
	 * @return The best size of the resulting image, constrained to maxWidth and maxHeight.
	 */
	public Dimension getPreferredSize(int maxWidth, int maxHeight) {
		if(maxWidth == 0 && maxHeight == 0)
			return getPreferredSize();
		if(maxWidth == 0)
			maxWidth = Integer.MAX_VALUE;
		else if(maxHeight == 0)
			maxHeight = Integer.MAX_VALUE;
		double ratio = 1.0 * getPreferredSize().width / getPreferredSize().height;
		int resultWidth = Math.min(maxWidth, ceil(maxHeight*ratio));
		int resultHeight = Math.min(maxHeight, ceil(maxWidth/ratio));
		return new Dimension(resultWidth, resultHeight);
	}
	
	/**
	 * TODO - document! alphabetical
	 * @return
	 */
	public String[] getFaceNames() {
		ArrayList<String> faces = new ArrayList<String>(getDefaultColorScheme().keySet());
		Collections.sort(faces);
		return faces.toArray(new String[faces.size()]);
	}
	
	
	/**
	 * TODO - document!
	 * @param colorScheme
	 * @return
	 */
	public HashMap<String, Color> parseColorScheme(String scheme) {
		HashMap<String, Color> colorScheme = getDefaultColorScheme();
		if(scheme != null && !scheme.isEmpty()) {
			String[] colors = scheme.split(",");
			String[] faces = getFaceNames();
			if(colors.length != faces.length) {
//				sendText(t, String.format("Incorrect number of colors specified (expecting %d, got %d)", faces.length, colors.length));
				//TODO - exception
				return null;
			}
			for(int i = 0; i < colors.length; i++) {
				Color c = ScrambleUtils.toColor(colors[i]);
				if(c == null) {
//					sendText(t, "Invalid color: " + colors[i]);
					//TODO - exception
					return null;
				}
				colorScheme.put(faces[i], c);
			}
		}
		return colorScheme;
	}

	/**
	 * TODO - document!
	 * @param size
	 * @return
	 */
	public HashMap<String, PuzzleFace> getFaces(Dimension size, HashMap<String, Color> colors) {
		HashMap<String, PuzzleFace> faces = new HashMap<String, PuzzleFace>();
		HashMap<String, GeneralPath> areas = getFaceBoundaries(size);
		for(String face : colors.keySet()) {
			faces.put(face, new PuzzleFace(colors.get(face), areas.get(face)));
		}
		return faces;
	}
	
	/**
	 * @param size The size of the canvas.
	 * @return A HashMap mapping face names to GeneralPath
	 */
	public HashMap<String, GeneralPath> getFaceBoundaries(Dimension size) {
		AffineTransform scale = AffineTransform.getScaleInstance(1.0*size.width/getPreferredSize().width, 1.0*size.height/getPreferredSize().height);
		HashMap<String, GeneralPath> faces = getFaceBoundaries();
		for(GeneralPath face : faces.values())
			face.transform(scale);
		return faces;
	}
	
	/**
	 * Draws scramble onto g.
	 * @param g The Graphics2D object to draw upon (of size size)
	 * @param size The Dimension of the resulting image.
	 * @param scramble The scramble to validate and apply to the puzzle. NOTE: May be null!
	 * @param colorScheme A HashMap mapping face names to Colors.
	 * 			Any missing entries will be merged with the defaults from getDefaultColorScheme().
	 * 			If null, just the defaults are used.
	 * @throws InvalidScrambleException If scramble is invalid.
	 */
	public void drawScramble(Graphics2D g, Dimension size, String scramble, HashMap<String, Color> colorScheme) throws InvalidScrambleException {
		HashMap<String, Color> defaults = getDefaultColorScheme();
		if(colorScheme != null)
			defaults.putAll(colorScheme);
		g.scale(1.0*size.width/getPreferredSize().width, 1.0*size.height/getPreferredSize().height);
		drawScramble(g, scramble, defaults);
	}
}
