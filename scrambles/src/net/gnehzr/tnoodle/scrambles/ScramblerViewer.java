package net.gnehzr.tnoodle.scrambles;

import static net.gnehzr.tnoodle.scrambles.utils.ScrambleUtils.ceil;
import static net.gnehzr.tnoodle.scrambles.utils.ScrambleUtils.toColor;

import java.awt.Color;
import java.awt.Dimension;
import java.awt.Graphics2D;
import java.awt.geom.GeneralPath;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.InputStream;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;

import javax.imageio.ImageIO;

import net.gnehzr.tnoodle.scrambles.utils.Base64;
import net.gnehzr.tnoodle.scrambles.utils.ScrambleUtils;

/**
 * Any classes that wish to provide scramble images as well as scrambles
 * should extend this class rather than Scrambler.
 * @author Jeremy Fleischman
 */
public abstract class ScramblerViewer extends Scrambler {
	/**
	 * Subclasses of ScrambleImageGenerator are expected to produce scrambles of one size,
	 * this abstract class will resize appropriately.
	 * @return The size of the images this Scrambler will produce.
	 */
	protected abstract Dimension getPreferredSize();
	
	/**
	 * @return A *new* HashMap mapping face names to PuzzleFaces.
	 */
	public abstract HashMap<String, Color> getDefaultColorScheme();
	
	/**
	 * @return A HashMap mapping face names to GeneralPaths.
	 */
	public abstract HashMap<String, GeneralPath> getDefaultFaceBoundaries();

	/**
	 * Draws the result of the puzzle after applying scramble.
	 * NOTE: It is assumed that this method is thread safe! That means unless you know what you're doing, 
	 * use the synchronized keyword when implementing this method.<br>
	 * <code>protected synchronized void drawScramble();</code>
	 * @param g The Graphics2D object to draw upon (guaranteed to be big enough for getScrambleSize())
	 * @param scramble The scramble to validate and apply to the puzzle. NOTE: May be null!
	 * @param colorScheme A HashMap mapping face names to Colors, must have an entry for every face!
	 * @throws InvalidScrambleException If scramble is invalid.
	 */
	protected abstract void drawScramble(Graphics2D g, String scramble, HashMap<String, Color> colorScheme) throws InvalidScrambleException;

	/**
	 * TODO - comment
	 */
	protected void drawPuzzleIcon(Graphics2D g) {
		g.setColor(Color.RED);
		g.fillRect(0, 0, 16, 16);
	}

	/**
	 * TODO - comment
	 */
	public final void getPuzzleIcon(ByteArrayOutputStream bytes) {
		InputStream in;
		try {
			File f = new File(getScramblePluginDirectory(), getShortName() + ".png");
			in = new FileInputStream(f);
		} catch(FileNotFoundException e) {
			in = getClass().getResourceAsStream(getShortName() + ".png");
		} 
		if(in != null) {
			try {
				ScrambleUtils.fullyReadInputStream(in, bytes);
			} catch(IOException e) {
				return;
			}
		} else {
			BufferedImage img = new BufferedImage(16, 16, BufferedImage.TYPE_INT_ARGB);
			drawPuzzleIcon((Graphics2D) img.getGraphics());
			try {
				ImageIO.write(img, "png", bytes);
			} catch(IOException e) {
				e.printStackTrace();
			}
		}
	}
	
	/**
	 * Computes the best size to draw the scramble image.
	 * @param maxWidth The maximum allowed width of the resulting image, 0 or null if it doesn't matter.
	 * @param maxHeight The maximum allowed height of the resulting image, 0 or null if it doesn't matter.
	 * @return The best size of the resulting image, constrained to maxWidth and maxHeight.
	 */
	public Dimension getPreferredSize(Integer maxWidth, Integer maxHeight) {
		if(maxWidth == null) maxWidth = 0;
		if(maxHeight == null) maxHeight = 0;
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
			String[] faces = getFaceNames();
			String[] colors;
			if(scheme.indexOf(',') > 0)
				colors = scheme.split(",");
			else {
				char[] cols = scheme.toCharArray();
				colors = new String[cols.length];
				for(int i = 0; i < cols.length; i++) {
					colors[i] = cols[i] + "";
				}
			}
			if(colors.length != faces.length) {
//				sendText(t, String.format("Incorrect number of colors specified (expecting %d, got %d)", faces.length, colors.length));
				//TODO - exception
				return null;
			}
			for(int i = 0; i < colors.length; i++) {
				Color c = toColor(colors[i]);
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
	
	public PuzzleImageInfo getDefaultPuzzleImageInfo() {
		PuzzleImageInfo sii = new PuzzleImageInfo();
		sii.faces = getDefaultFaceBoundaries();
		sii.colorScheme = getDefaultColorScheme();
		sii.size = getPreferredSize();
		return sii;
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
	
	public String getScrambleImageDataUrl(String scramble, HashMap<String, Color> colorScheme, Integer width, Integer height) {
		Dimension dim = getPreferredSize(width, height);
		BufferedImage img = new BufferedImage(dim.width, dim.height, BufferedImage.TYPE_INT_ARGB);
		try {
			drawScramble(img.createGraphics(), dim, scramble, colorScheme);
			ByteArrayOutputStream bytes = new ByteArrayOutputStream();
			ImageIO.write(img.getSubimage(0, 0, dim.width, dim.height), "png", bytes);
			StringBuffer sb = new StringBuffer();
			sb.append("data:image/png;base64,");
			sb.append(Base64.encodeBytes(bytes.toByteArray()));
			return sb.toString();
		} catch (InvalidScrambleException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		//TODO - handle errors!
		return null;
	}
	public String getScrambleImageDataUrl(String scramble, String colorScheme, Integer width, Integer height) {
		try {
			return getScrambleImageDataUrl(scramble, parseColorScheme(colorScheme), width, height);
		} catch(Throwable e) {
			e.printStackTrace();
		}
		return null;
	}
}
