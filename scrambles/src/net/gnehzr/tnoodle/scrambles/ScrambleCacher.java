package net.gnehzr.tnoodle.scrambles;

import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.util.LinkedList;
import java.util.Random;

import net.goui.util.MTRandom;

/*
 * In addition to speeding things up, this class provides thread safety.
 */
public class ScrambleCacher {
	private static final int DEFAULT_CACHE_SIZE = 100;
	
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

	public ScrambleCacher(final Scrambler scrambler) {
		this(scrambler, DEFAULT_CACHE_SIZE);
	}
	
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

interface ScrambleCacherListener {
	public void scrambleCacheUpdated(ScrambleCacher src);
}