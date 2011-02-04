package net.gnehzr.tnoodle.scrambles;

import static net.gnehzr.tnoodle.scrambles.utils.ScrambleUtils.ceil;
import static net.gnehzr.tnoodle.scrambles.utils.ScrambleUtils.toColor;

import java.awt.Color;
import java.awt.Dimension;
import java.awt.Graphics2D;
import java.awt.geom.GeneralPath;
import java.awt.image.BufferedImage;
import java.io.BufferedReader;
import java.io.File;
import java.io.FileFilter;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.ByteArrayOutputStream;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.lang.reflect.Modifier;
import java.net.MalformedURLException;
import java.net.URISyntaxException;
import java.net.URL;
import java.net.URLClassLoader;
import java.security.AccessControlException;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.LinkedList;
import java.util.Random;
import java.util.SortedMap;
import java.util.TreeMap;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;

import javax.imageio.ImageIO;

import net.goui.util.MTRandom;

import com.eekboom.utils.Strings;

import net.gnehzr.tnoodle.scrambles.utils.Base64;
import net.gnehzr.tnoodle.scrambles.utils.ScrambleUtils;

/**
 * Subclasses of Scrambler must have a method with the following signature
 * <p><code>public static synchronized Scrambler[] createScramblers();</code></p>
 * Note the synchronized keyword! This method should return an array of Scramblers.
 * This is useful for CubeScrambler, so one class can deal with 2x2 through NxN cube scrambles.<br>
	//TODO - optimal cross solver? lol
 * @author Jeremy Fleischman
 */
public abstract class Scrambler {
	private static final int DEFAULT_CACHE_SIZE = 100;
	private static final String SCRAMBLE_PLUGIN_PACKAGE = "scramblers.";
	private static final String SCRAMBLE_PLUGIN_LIST = "/scramblers/plugins.txt";
	private static final String PLUGIN_EXTENSION = ".class";
	
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
	 * Subclasses of ScrambleImageGenerator are expected to produce scrambles of one size,
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
		for(int i = 0; i < count; i++)
			scrambles[i] = generateScramble(r);
		return scrambles;
	}

	private final ScrambleCacher cacher = new ScrambleCacher(this, DEFAULT_CACHE_SIZE);

	/** fast (cached) scrambles **/
	public final String generateScramble() {
		return cacher.newScramble();
	}
	public final String[] generateScrambles(int count) {
		return cacher.newScrambles(count);
	}
	
	/** seeded scrambles, these can't be cached, so they'll be a little slower **/
	public final String generateSeededScramble(String seed) {
		return generateSeededScramble(seed, 0);
	}
	public final String[] generateSeededScrambles(String seed, int count) {
		return generateSeededScrambles(seed, count, 0);
	}
	
	/** seeded scrambles with offset **/
	public final String generateSeededScramble(String seed, int offset) {
		return generateSeededScramble(seed.hashCode(), offset); //TODO - do something that will get us a long?
	}
	public final String[] generateSeededScrambles(String seed, int count, int offset) {
		return generateSeededScrambles(seed.hashCode(), count, offset); //TODO - do something that will get us a long?
	}
	
	private final String generateSeededScramble(long seed, int offset) {
		Random r = new MTRandom(seed);
		r.setSeed(seed);
		generateScrambles(r, offset); //burn up scrambles we don't care about
		return generateScramble(r);
	}
	private final String[] generateSeededScrambles(long seed, int count, int offset) {
		Random r = new MTRandom(seed);
		r.setSeed(seed);
		generateScrambles(r, offset); //burn up scrambles we don't care about
		return generateScrambles(r, count);
	}
	
	/**
	 * @return Simply returns getLongName()
	 */
	public String toString() {
		return getLongName();
	}

	/**
	 * @return A File representing the directory in which this program resides.
	 * If this is a jar file, this should be obvious, otherwise things are a little ambiguous.
	 */
	protected static File getScramblePluginDirectory() {
		File defaultScrambleFolder;
		try {
			defaultScrambleFolder = new File(Scrambler.class.getProtectionDomain().getCodeSource().getLocation().toURI().getPath());
		} catch (URISyntaxException e) {
			return new File(".");
		}
		if(defaultScrambleFolder.isFile()) //this should indicate a jar file
			defaultScrambleFolder = defaultScrambleFolder.getParentFile();
		return new File(defaultScrambleFolder, "scramblers");
	}
	
    /**
     * TODO - comment!
     */
    private static HashSet<String> findLoadedGenerators() {
    	HashSet<String> classNames = new HashSet<String>();
    	InputStream is = Scrambler.class.getResourceAsStream(SCRAMBLE_PLUGIN_LIST);
    	if(is == null)
    		return classNames;
    	BufferedReader in = new BufferedReader(new InputStreamReader(is));
    	try {
    		String line = null;
			while((line = in.readLine()) != null) {
				classNames.add(SCRAMBLE_PLUGIN_PACKAGE + line);
			}
		} catch (IOException e) {
			e.printStackTrace();
		}
		return classNames;
    }
    
    private static HashSet<String> findPluginGenerators(File folder) {
    	HashSet<String> potentialClasses = new HashSet<String>();
		File[] files = folder.listFiles(new FileFilter() {
			@Override
			public boolean accept(File f) {
				return f.isFile() && f.getName().indexOf('$') == -1 && f.getName().endsWith(PLUGIN_EXTENSION);
			}
		});
		if(files != null) {
			for(File f : files) {
				potentialClasses.add(SCRAMBLE_PLUGIN_PACKAGE + f.getName().substring(0, f.getName().length()-PLUGIN_EXTENSION.length()));
			}
		}
		return potentialClasses;
    }
    
    private static ArrayList<Class<? extends Scrambler>> loadGenerators(ClassLoader cl, HashSet<String> potentialClassNames) {
		ArrayList<Class<? extends Scrambler>> found = new ArrayList<Class<? extends Scrambler>>();
		if(cl == null)
			return found;
		for(String className : potentialClassNames) {
			try {
				Class<? extends Scrambler> clz = cl.loadClass(className).asSubclass(Scrambler.class);
				found.add(clz);
			} catch (ClassNotFoundException e) {
				e.printStackTrace();
			}
		}
    	return found;
    }
	
	/**
	 * TODO - comment on merging w/ curr classpath
	 * @param folder The folder containing the Scrambler classes.
	 * If null, looks for a directory named scramblers in the "program's directory", as defined by getScramblePluginDirectory(). 
	 * @return A HashMap mapping shortNames to valid Scramblers found in folder
	 *  sorted in a "natural" order (such that 3x3x3 comes before 10x10x10).
	 *  Returns null if the directory was invalid. 
	 */
	public static SortedMap<String, Scrambler> getScramblers(File folder) {
		if(folder == null) {
			try {
				folder = getScramblePluginDirectory();
			} catch(AccessControlException e) {
				//we must be in an applet
			}
		}

		ArrayList<Class<? extends Scrambler>> loadedGenerators = null;
		HashSet<String> loadedGeneratorNames = findLoadedGenerators();
		if(folder == null) {
			//we're must be in an applet, so we look to our classloader
			loadedGenerators = loadGenerators(Scrambler.class.getClassLoader(), loadedGeneratorNames);
		} else {
			//we're not in an applet
			HashSet<String> pluginGeneratorNames = findPluginGenerators(folder);
			loadedGeneratorNames.removeAll(pluginGeneratorNames); //we default to plugins

			loadedGenerators = loadGenerators(Scrambler.class.getClassLoader(), loadedGeneratorNames);
			URLClassLoader cl = null;
			try {
				cl = new URLClassLoader(new URL[] { folder.getParentFile().toURI().toURL() });
			} catch (MalformedURLException e2) {
				e2.printStackTrace();
			}
			ArrayList<Class<? extends Scrambler>> pluginGenerators = loadGenerators(cl, pluginGeneratorNames);
			loadedGenerators.addAll(pluginGenerators); //now all the classpath generators are in loadedGenerators, followed by the plugins
		}
		
		//sorting in a way that will take into account numbers (so 10x10x10 appears after 3x3x3)
		TreeMap<String, Scrambler> scramblers = new TreeMap<String, Scrambler>(Strings.getNaturalComparator());
		for(Class<? extends Scrambler> clz : loadedGenerators) {
			try {
				Method createScramblers = clz.getMethod("createScramblers");
				if(!Modifier.isSynchronized(createScramblers.getModifiers())) {
					throw new NoSuchMethodException("createScramblers() must be synchronized (class " + clz.getCanonicalName() + ")");
				}
				Scrambler[] generators = (Scrambler[]) createScramblers.invoke(null);
				for(Scrambler scrambler : generators) {
					scramblers.put(scrambler.getShortName(), scrambler);
				}
			} catch(NoSuchMethodException e) {
				e.printStackTrace();
			} catch (IllegalArgumentException e) {
				e.printStackTrace();
			} catch (InvocationTargetException e) {
				e.printStackTrace();
			} catch (IllegalAccessException e) {
				e.printStackTrace();
			}
		}
		return scramblers;
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
	 */
	public final void loadPuzzleIcon(ByteArrayOutputStream bytes) {
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
			Dimension dim = new Dimension(16, 16);
			BufferedImage img = new BufferedImage(dim.width, dim.height, BufferedImage.TYPE_INT_ARGB);
			drawPuzzleIcon((Graphics2D) img.getGraphics(), dim);
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
interface ScrambleCacherListener {
	public void scrambleCacheUpdated(ScrambleCacher src);
}
/*
 * In addition to speeding things up, this class provides thread safety.
 */
class ScrambleCacher {
	/**
	 * Scramblers will get passed this instance of Random
	 * in order to have nice, as-secure-as-can-be scrambles.
	 */
	private static final Random r;
	static {
		byte[] seed = null;
		try{
			seed = SecureRandom.getInstance("SHA1PRNG").generateSeed(9);
		} catch(NoSuchAlgorithmException e) {
			seed = new SecureRandom().generateSeed(9);
		}
		r = new MTRandom(seed);
	}

	private String[] scrambles;
	private volatile int startBuf = 0;
	private volatile int available = 0;

	public ScrambleCacher(final Scrambler scrambler, int cacheSize) {
		scrambles = new String[cacheSize];

		new Thread() {
			public void run() {
				synchronized(scrambler.getClass()) {
					//this thread starts running while scrambler
					//is still initializing, we must wait until
					//it has finished before we attempt to generate
					//any scrambles
				}
				for(;;) {
					String scramble = scrambler.generateScramble(r);

					synchronized(scrambles) {
						while(available == scrambles.length) {
							try {
								scrambles.wait();
							} catch(InterruptedException e) {}
						}
						scrambles[(startBuf + available) % scrambles.length] = scramble;
						available++;
						scrambles.notifyAll();
					}
					fireScrambleCacheUpdated();
				}
			}
		}.start();
	}
	private LinkedList<ScrambleCacherListener> ls = new LinkedList<ScrambleCacherListener>();
	public void addScrambleCacherListener(ScrambleCacherListener l) {
		ls.add(l);
	}
	/**
	 * This method will notify all listeners that the cache size has changed.
	 * NOTE: Do NOT call this method while holding any monitors!
	 */
	private void fireScrambleCacheUpdated() {
		for(ScrambleCacherListener l : ls)
			l.scrambleCacheUpdated(this);
	}
	
	public int getAvailableCount() {
		return available;
	}

	/**
	 * Get a new scramble from the cache. Will block if necessary.
	 * @return A new scramble from the cache.
	 */
	public String newScramble() {
		String scramble;
		synchronized(scrambles) {
			while(available == 0) {
				try {
					scrambles.wait();
				} catch(InterruptedException e) {}
			}
			scramble = scrambles[startBuf];
			startBuf = (startBuf + 1) % scrambles.length;
			available--;
			scrambles.notifyAll();
		}
		fireScrambleCacheUpdated();
		return scramble;
	}

	public String[] newScrambles(int count) {
		String[] scrambles = new String[count];
		for(int i = 0; i < count; i++)
			scrambles[i] = newScramble();
		return scrambles;
	}
}
