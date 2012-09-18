package net.gnehzr.tnoodle.scrambles;

import static net.gnehzr.tnoodle.utils.Utils.ceil;
import static net.gnehzr.tnoodle.utils.Utils.toColor;
import static net.gnehzr.tnoodle.utils.Utils.azzert;

import java.awt.Color;
import java.awt.Dimension;
import java.awt.Graphics2D;
import java.awt.geom.GeneralPath;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.lang.reflect.Type;
import java.security.NoSuchAlgorithmException;
import java.security.NoSuchProviderException;
import java.security.SecureRandom;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.logging.Level;
import java.util.logging.Logger;
import java.util.Random;
import java.util.SortedMap;
import java.util.TreeMap;

import javax.imageio.ImageIO;

import net.gnehzr.tnoodle.utils.BadClassDescriptionException;
import net.gnehzr.tnoodle.utils.Base64;
import net.gnehzr.tnoodle.utils.LazyInstantiator;
import net.gnehzr.tnoodle.utils.Plugins;
import net.gnehzr.tnoodle.utils.Strings;
import net.gnehzr.tnoodle.utils.Utils;

import com.google.gson.JsonDeserializationContext;
import com.google.gson.JsonDeserializer;
import com.google.gson.JsonElement;
import com.google.gson.JsonParseException;
import com.google.gson.JsonPrimitive;
import com.google.gson.JsonSerializationContext;
import com.google.gson.JsonSerializer;


/**
	//TODO - optimal cross solver? lol
 * @author Jeremy Fleischman
 */
public abstract class Scrambler {
	private static final Logger l = Logger.getLogger(Scrambler.class.getName());

	/**
	 * Returns a String describing this Scrambler
	 * appropriate for use in a url. This shouldn't contain any periods.
	 * @return a url appropriate String unique to this Scrambler
	 */
	public abstract String getShortName();
	
	/**
	 * Returns a String fully describing this Scrambler.
	 * Unlike shortName(), may contain spaces and other url-inappropriate characters.
	 * This will also be used for the toString method of this Scrambler.
	 * @return a String
	 */
	public abstract String getLongName();

	/**
	 * Returns a number between 0 and 1 representing how "initialized" this
	 * Scrambler is. 0 means nothing has been accomplished, and 1 means
	 * we're done, and are generating scrambles.
	 * @return A double between 0 and 1, inclusive.
	 */

	public double getInitializationStatus() {
		return 1;
	}
	
	/**
	 * Generates a scramble appropriate for this Scrambler. It's important to note that
	 * it's ok if this method takes some time to run, as it's going to be called many times and get queued up
	 * by Scrambler (think of it as a sort of cache).
	 * NOTE: It is assumed that this method is thread safe! That means unless you know what you're doing, 
	 * use the synchronized keyword when implementing this method.<br>
	 * <code>protected synchronized String generateScramble(Random r);</code>
	 * @param r The instance of Random you must use as your source of randomness when generating scrambles.
	 * @return A String containing the scramble, where turns are assumed to be separated by whitespace.
	 */
	protected abstract String generateScramble(Random r);

	/**
	 * Subclasses of Scrambler are expected to produce scrambles of one size,
	 * this abstract class will resize appropriately.
	 * @return The size of the images this Scrambler will produce.
	 */
	protected abstract Dimension getPreferredSize();
	
	/**
	 * @return A *new* HashMap mapping face names to Colors.
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


	private String[] generateScrambles(Random r, int count) {
		String[] scrambles = new String[count];
		for(int i = 0; i < count; i++) {
			scrambles[i] = generateScramble(r);
		}
		return scrambles;
	}

    private SecureRandom r = getSecureRandom();
	private static final SecureRandom getSecureRandom() {
		try {
			return SecureRandom.getInstance("SHA1PRNG", "SUN");
		} catch(NoSuchAlgorithmException e) {
			l.log(Level.SEVERE, "Couldn't get SecureRandomInstance", e);
			azzert(false);
			return null;
		} catch(NoSuchProviderException e) {
			l.log(Level.SEVERE, "Couldn't get SecureRandomInstance", e);
			azzert(false);
			return null;
		}
	}

	public final String generateScramble() {
		return generateScramble(r);
	}
	public final String[] generateScrambles(int count) {
		return generateScrambles(r, count);
	}
	
	/** seeded scrambles, these can't be cached, so they'll be a little slower **/
	public final String generateSeededScramble(String seed) {
		return generateSeededScramble(seed.getBytes());
	}
	public final String[] generateSeededScrambles(String seed, int count) {
		return generateSeededScrambles(seed.getBytes(), count);
	}
	
	private final String generateSeededScramble(byte[] seed) {
		// we must create our own Random because other threads can access the static one
		SecureRandom r = getSecureRandom();
		r.setSeed(seed);
		return generateScramble(r);
	}
	private final String[] generateSeededScrambles(byte[] seed, int count) {
		// we must create our own Random because other threads can access the static one
		SecureRandom r = getSecureRandom();
		r.setSeed(seed);
		return generateScrambles(r, count);
	}
	
	/**
	 * @return Simply returns getLongName()
	 */
	public String toString() {
		return getLongName();
	}

	private static Plugins<Scrambler> plugins = new Plugins<Scrambler>("scrambler", Scrambler.class);

	private static SortedMap<String, LazyInstantiator<Scrambler>> scramblers;
	public static synchronized SortedMap<String, LazyInstantiator<Scrambler>> getScramblers() throws BadClassDescriptionException, IOException {
		if(scramblers == null || plugins.reloadIfNeeded()) {
			// Sorting in a way that will take into account numbers (so 10x10x10 appears after 3x3x3)
			SortedMap<String, LazyInstantiator<Scrambler>> newScramblers =
				new TreeMap<String, LazyInstantiator<Scrambler>>(Strings.getNaturalComparator());
			newScramblers.putAll(plugins.getPlugins());
			scramblers = newScramblers;
		}
		return Collections.unmodifiableSortedMap(scramblers);
	}

	public static String getScramblerLongName(String shortName) throws BadClassDescriptionException, IOException {
		getScramblers(); // force reloading the plugins, if necessary
		return plugins.getPluginComment(shortName);
	}
	
	/**
	 * TODO - comment
	 */
	protected void drawPuzzleIcon(Graphics2D g, Dimension size) {
		try {
			drawScramble(g, size, "", null);
		} catch(InvalidScrambleException e) {
			e.printStackTrace();
		}
	}

	/**
	 * TODO - comment
	 * We should probably assert that the icons are of a particular size.
	 */
	public final void loadPuzzleIcon(ByteArrayOutputStream bytes) {
		try {
			File f = new File(plugins.getPluginDirectory(), getShortName() + ".png");
			InputStream in = new FileInputStream(f);
			Utils.fullyReadInputStream(in, bytes);
		} catch(FileNotFoundException e) {
			e.printStackTrace();
		} catch (IOException e) {
			e.printStackTrace();
		}
		
		Dimension dim = new Dimension(32, 32);
		BufferedImage img = new BufferedImage(dim.width, dim.height, BufferedImage.TYPE_INT_ARGB);
		Graphics2D g = (Graphics2D) img.getGraphics();
		drawPuzzleIcon(g, dim);
		try {
			ImageIO.write(img, "png", bytes);
		} catch(IOException e) {
			e.printStackTrace();
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
	

	static {
		Utils.registerTypeAdapter(Scrambler.class, new Scramblerizer());
	}
	private static class Scramblerizer implements JsonSerializer<Scrambler>, JsonDeserializer<Scrambler> {
		@Override
		public Scrambler deserialize(JsonElement json, Type typeOfT, JsonDeserializationContext context) throws JsonParseException {
			try {
				String scramblerName = json.getAsString();
				SortedMap<String, LazyInstantiator<Scrambler>> scramblers = getScramblers();
				LazyInstantiator<Scrambler> lazyScrambler = scramblers.get(scramblerName);
				if(lazyScrambler == null) {
					throw new JsonParseException(scramblerName + " not found in: " + scramblers.keySet());
				}
				return lazyScrambler.cachedInstance();
			} catch(Exception e) {
				throw new JsonParseException(e);
			}
		}

		@Override
		public JsonElement serialize(Scrambler scrambler, Type typeOfT, JsonSerializationContext context) {
			return new JsonPrimitive(scrambler.getShortName());
		}
	}
}
