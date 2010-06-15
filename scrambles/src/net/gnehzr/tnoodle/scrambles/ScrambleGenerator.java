package net.gnehzr.tnoodle.scrambles;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileFilter;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.net.MalformedURLException;
import java.net.URISyntaxException;
import java.net.URL;
import java.net.URLClassLoader;
import java.security.AccessControlException;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.Random;
import java.util.SortedMap;
import java.util.TreeMap;

import net.goui.util.MTRandom;

import com.eekboom.utils.Strings;

/**
 * Subclasses of ScrambleGenerator can choose to create a method with the following signature
 * <p><code>public static ScrambleGenerator[] createScramblers();</code></p>
 * This method should return an array of ScrambleGenerators.
 * This is useful for CubeScrambler, so one class can deal with 2x2 through NxN cube scrambles.<br>
 * If this method is not defined, the existence of a noarg constructor is assumed.<br>
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
	
	/**
	 * Generates a scramble appropriate for this ScrambleGenerator.
	 * @param r The instance of Random to use as your source of randomness when generating scrambles.
	 * @param obeySeed If this is true, the ScrambleGenerator must use r as its source of randomness.
	 * If false, the generator could grab a scramble from a precomputed list.
	 * This is useful for something like CubeScrambler, as generating random state solutions
	 * is an expensive operation best done in a separate thread.
	 * Most implementations of ScrambleGenerator can safely ignore this parameter. 
	 * @return A String containing the scramble, where turns are assumed to be separated by whitespace.
	 */
	protected abstract String generateScramble(Random r, boolean obeySeed);
	
	private String[] generateScrambles(Random r, boolean obeySeed, int count) {
		String[] scrambles = new String[count];
		for(int i = 0; i < count; i++)
			scrambles[i] = generateScramble(r, obeySeed);
		return scrambles;
	}
	
	/** secure, although possibly pregenerated scrambles **/
	public final String generateScramble() {
		return generateScramble(r, false);
	}
	public final String[] generateScrambles(int count) {
		return generateScrambles(r, false, count);
	}
	
	/** seeded scrambles **/
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
		generateScrambles(r, true, offset); //burn up scrambles we don't care about
		return generateScramble(r, true);
	}
	private final String[] generateSeededScrambles(long seed, int count, int offset) {
		Random r = new MTRandom(seed);
		r.setSeed(seed);
		generateScrambles(r, true, offset); //burn up scrambles we don't care about
		return generateScrambles(r, true, count);
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
    public static HashSet<String> findLoadedGenerators() {
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
    

    public static HashSet<String> findPluginGenerators(File folder) {
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
				ScrambleGenerator[] generators = (ScrambleGenerator[]) createScramblers.invoke(null);
				for(ScrambleGenerator scrambler : generators) {
					scramblers.put(scrambler.getShortName(), scrambler);
				}
			} catch(NoSuchMethodException e) {
				try {
					ScrambleGenerator scrambler = clz.newInstance();
					scramblers.put(scrambler.getShortName(), scrambler);
				} catch (InstantiationException e1) {
					e1.printStackTrace();
				} catch (IllegalAccessException e1) {
					e1.printStackTrace();
				}
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
