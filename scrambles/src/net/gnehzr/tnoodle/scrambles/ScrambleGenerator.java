package net.gnehzr.tnoodle.scrambles;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileFilter;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
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

import net.goui.util.MTRandom;

import com.eekboom.utils.Strings;

/**
 * Subclasses of ScrambleGenerator must method with the following signature
 * <p><code>public static synchronized ScrambleGenerator[] createScramblers();</code></p>
 * Note the synchronized keyword! This method should return an array of ScrambleGenerators.
 * This is useful for CubeScrambler, so one class can deal with 2x2 through NxN cube scrambles.<br>
	//TODO - optimal cross solver? lol
 * @author Jeremy Fleischman
 */
public abstract class ScrambleGenerator {
	private static final String SCRAMBLE_PLUGIN_PACKAGE = "scramblers.";
	private static final String SCRAMBLE_PLUGIN_LIST = "/scramblers/plugins.txt";
	private static final String PLUGIN_EXTENSION = ".class";
	
	/**
	 * Returns a String describing this ScrambleGenerator
	 * appropriate for use in a url. This shouldn't contain any periods.
	 * @return a url appropriate String unique to this ScrambleGenerator
	 */
	public abstract String getShortName();
	
	/**
	 * Returns a String fully describing this ScrambleGenerator.
	 * Unlike shortName(), may contain spaces and other url-inappropriate characters.
	 * This will also be used for the toString method of this ScrambleGenerator.
	 * @return a String
	 */
	public abstract String getLongName();
	
	/**
	 * Generates a scramble appropriate for this ScrambleGenerator. It's important to note that
	 * it's ok if this method takes some time to run, as it's going to be called many times and get queued up
	 * by ScrambleGenerator (think of it as a sort of cache).
	 * @param r The instance of Random you must use as your source of randomness when generating scrambles.
	 * @return A String containing the scramble, where turns are assumed to be separated by whitespace.
	 */
	protected abstract String generateScramble(Random r);
	
	private String[] generateScrambles(Random r, int count) {
		String[] scrambles = new String[count];
		for(int i = 0; i < count; i++)
			scrambles[i] = generateScramble(r);
		return scrambles;
	}

	/**
	 * TODO - USEEE
	 */
	private final ScrambleCacher cacher = new ScrambleCacher(this);


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
	private static File getProgramDirectory() {
		File defaultScrambleFolder;
		try {
			defaultScrambleFolder = new File(ScrambleGenerator.class.getProtectionDomain().getCodeSource().getLocation().toURI().getPath());
		} catch (URISyntaxException e) {
			return new File(".");
		}
		if(defaultScrambleFolder.isFile()) //this should indicate a jar file
			defaultScrambleFolder = defaultScrambleFolder.getParentFile();
		return defaultScrambleFolder;
	}
	
    /**
     * Searches for subclasses of the given class in the given package already loaded into the jvm.
     * @param pkg The package to search.
     * @param c The class we're looking to find subclasses of.
     * @return An ArrayList of the matching classes.
     */
    private static HashSet<String> findLoadedGenerators() {
    	HashSet<String> classNames = new HashSet<String>();
    	InputStream is = ScrambleGenerator.class.getResourceAsStream(SCRAMBLE_PLUGIN_LIST);
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
    
    private static ArrayList<Class<? extends ScrambleGenerator>> loadGenerators(ClassLoader cl, HashSet<String> potentialClassNames) {
		ArrayList<Class<? extends ScrambleGenerator>> found = new ArrayList<Class<? extends ScrambleGenerator>>();
		if(cl == null)
			return found;
		for(String className : potentialClassNames) {
			try {
				Class<? extends ScrambleGenerator> clz = cl.loadClass(className).asSubclass(ScrambleGenerator.class);
				found.add(clz);
			} catch (ClassNotFoundException e) {
				e.printStackTrace();
			}
		}
    	return found;
    }
	
	/**
	 * TODO - comment on merging w/ curr classpath
	 * @param folder The folder containing the ScrambleGenerator classes.
	 * If null, looks for a directory named scramblers in the "program's directory", as defined by getProgramDirectory(). 
	 * @return A HashMap mapping shortNames to valid ScrambleGenerators found in folder
	 *  sorted in a "natural" order (such that 3x3x3 comes before 10x10x10).
	 *  Returns null if the directory was invalid. 
	 */
	public static SortedMap<String, ScrambleGenerator> getScrambleGenerators(File folder) {
		if(folder == null) {
			try {
				folder = new File(getProgramDirectory(), "scramblers");
			} catch(AccessControlException e) {
				//we must be in an applet
			}
		}

		ArrayList<Class<? extends ScrambleGenerator>> loadedGenerators = null;
		HashSet<String> loadedGeneratorNames = findLoadedGenerators();
		if(folder == null) {
			//we're must be in an applet, so we look to our classloader
			loadedGenerators = loadGenerators(ScrambleGenerator.class.getClassLoader(), loadedGeneratorNames);
		} else {
			//we're not in an applet
			HashSet<String> pluginGeneratorNames = findPluginGenerators(folder);
			loadedGeneratorNames.removeAll(pluginGeneratorNames); //we default to plugins

			loadedGenerators = loadGenerators(ScrambleGenerator.class.getClassLoader(), loadedGeneratorNames);
			URLClassLoader cl = null;
			try {
				cl = new URLClassLoader(new URL[] { folder.getParentFile().toURI().toURL() });
			} catch (MalformedURLException e2) {
				e2.printStackTrace();
			}
			ArrayList<Class<? extends ScrambleGenerator>> pluginGenerators = loadGenerators(cl, pluginGeneratorNames);
			loadedGenerators.addAll(pluginGenerators); //now all the classpath generators are in loadedGenerators, followed by the plugins
		}
		
		//sorting in a way that will take into account numbers (so 10x10x10 appears after 3x3x3)
		TreeMap<String, ScrambleGenerator> scramblers = new TreeMap<String, ScrambleGenerator>(Strings.getNaturalComparator());
		for(Class<? extends ScrambleGenerator> clz : loadedGenerators) {
			try {
				Method createScramblers = clz.getMethod("createScramblers");
				if(!Modifier.isSynchronized(createScramblers.getModifiers())) {
					throw new NoSuchMethodException("createScramblers() must be synchronized (class " + clz.getCanonicalName() + ")");
				}
				ScrambleGenerator[] generators = (ScrambleGenerator[]) createScramblers.invoke(null);
				for(ScrambleGenerator scrambler : generators) {
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
}
interface ScrambleCacherListener {
public void scrambleCacheUpdated(ScrambleCacher src);
}
class ScrambleCacher {
	private static final int DEFAULT_CACHE_SIZE = 4;

	/**
	 * ScrambleGenerators will get passed this instance of Random
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

	public ScrambleCacher(ScrambleGenerator scrambler) {
		this(scrambler, DEFAULT_CACHE_SIZE);
	}

	public ScrambleCacher(final ScrambleGenerator scrambler, int cacheSize) {
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
