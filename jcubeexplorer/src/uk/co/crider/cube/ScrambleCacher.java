/**
 * Date: 15th May 2010
 * Authors: Jeremy Fleischman and Conrad Rider
 * Description: Maintains a cache of scrambles to supply ScramblerApplet
*/
package uk.co.crider.cube;


import java.security.SecureRandom;
import java.security.NoSuchAlgorithmException;
import java.util.LinkedList;

import net.goui.util.MTRandom;

import org.kociemba.twophase.CoordCube;
import org.kociemba.twophase.Search;
import org.kociemba.twophase.Tools;

public class ScrambleCacher {
    private static final int DEFAULT_CACHE_SIZE = 4;
    private static final int DEFAULT_MAX_SCRAMBLE_LENGTH = 25;
    private static final int TIMEOUT = 15; //seconds
    
	private String[] scrambles;
	private volatile int startBuf = 0;
	private volatile int available = 0;
	private MTRandom rand; // Mersenne Twister Random Generator

	public ScrambleCacher() {
		this(DEFAULT_CACHE_SIZE, DEFAULT_MAX_SCRAMBLE_LENGTH);
	}
	
	public ScrambleCacher(int cacheSize, final int maxScrambleLength) {
		scrambles = new String[cacheSize];
		// Initialise random generator
		byte[] seed = null;
		try{
			seed = SecureRandom.getInstance("SHA1PRNG").generateSeed(9);
		} catch(NoSuchAlgorithmException e) {
			seed = new SecureRandom().generateSeed(9);
		}
		rand = new MTRandom(seed);
		
		new Thread() {
			public void run() {
				CoordCube.setDebug(true);
				CoordCube.init();
				for(;;) {
					String scramble;
					do {
						scramble = Tools.invert(Search.solution(Tools.randomCube(rand), maxScrambleLength, TIMEOUT, false));
					} while(scramble.startsWith("Error"));
					
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
	
	public interface ScrambleCacherListener {
		public void scrambleCacheUpdated(ScrambleCacher src);
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
	
	public static void main(String[] args) throws InterruptedException {
		ScrambleCacher sc = new ScrambleCacher();

		Thread.sleep(1000);
		for(int i = 0; i < 10; i++)
			System.out.println(i + ": " + sc.newScramble());
	}
}
