package net.gnehzr.cct.scrambles;

import java.io.File;
import java.io.FileFilter;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.net.MalformedURLException;
import java.net.URL;
import java.net.URLClassLoader;
import java.util.HashMap;
import java.util.Random;

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
	private static final String PLUGIN_EXTENSION = ".class";
	
	/**
	 * ScrambleGenerators will get passed this instance of Random
	 * in order to get seeded correctly.
	 */
	private Random r = new Random();
	
	/**
	 * @param seed with which to seed the ScrambleGenerator
	 */
	public void setSeed(long seed) {
		r.setSeed(seed);
	}
	
	/**
	 * Generates a scramble.
	 * @param obeySeed Set this to true if you want the scramble generator 
	 * to use the seeded instance of Random. If false, it may still choose to use it, however.
	 * @return A String array where each element is one turn.
	 */
	public final String[] generateScramble(boolean obeySeed) {
		return generateScramble(r, obeySeed);
	}
	
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
	 * Generates a scramble appropriate for this ScrambleGenerator.
	 * @param r The instance of Random to use as your source of randomness when generating scrambles.
	 * @param obeySeed If this is true, the ScrambleGenerator must use r as its source of randomness.
	 * If false, the generator could grab a scramble from a precomputed list.
	 * This is useful for something like CubeScrambler, as generating random state solutions
	 * is an expensive operation best done in a separate thread.
	 * Most implementations of ScrambleGenerator can safely ignore this parameter. 
	 * @return A String array where each element is one turn.
	 */
	protected abstract String[] generateScramble(Random r, boolean obeySeed);
	
	/**
	 * @return Simply returns getLongName()
	 */
	public String toString() {
		return getLongName();
	}
	
	/**
	 * @param folder The folder containing the ScrambleGenerator classes.
	 * @return A HashMap mapping shortNames to valid ScrambleGenerators found in folder.
	 */
	public static HashMap<String, ScrambleGenerator> getScrambleGenerators(File folder) {
		File[] files = folder.listFiles(new FileFilter() {
			@Override
			public boolean accept(File f) {
				return f.isFile() && f.getName().indexOf('$') == -1 && f.getName().endsWith(PLUGIN_EXTENSION);
			}
		});
		HashMap<String, ScrambleGenerator> scramblers = new HashMap<String, ScrambleGenerator>(files.length);
		try {
			ClassLoader cl = new URLClassLoader(new URL[] { folder.toURI().toURL() });
			for(File f : files) {
				try {
					String className = SCRAMBLE_PLUGIN_PACKAGE + f.getName().substring(0, f.getName().length()-PLUGIN_EXTENSION.length());
					Class<? extends ScrambleGenerator> clz = cl.loadClass(className).asSubclass(ScrambleGenerator.class);
					try {
						Method createScramblers = clz.getMethod("createScramblers");
						ScrambleGenerator[] generators = (ScrambleGenerator[]) createScramblers.invoke(null);
						for(ScrambleGenerator scrambler : generators) {
							scramblers.put(scrambler.getShortName(), scrambler);
						}
					} catch(NoSuchMethodException e) {
						ScrambleGenerator scrambler = clz.newInstance();
						scramblers.put(scrambler.getShortName(), scrambler);
					} catch (IllegalArgumentException e) {
						e.printStackTrace();
					} catch (InvocationTargetException e) {
						e.printStackTrace();
					}
				} catch (ClassNotFoundException e) {
					e.printStackTrace();
				} catch (InstantiationException e) {
					e.printStackTrace();
				} catch (IllegalAccessException e) {
					e.printStackTrace();
				}
			}
		}
		catch (MalformedURLException e) {
			e.printStackTrace();
		}
		return scramblers;
	}
}
