package net.gnehzr.tnoodle.scrambles;

import static net.gnehzr.tnoodle.utils.Utils.azzert;

import java.awt.Dimension;
import java.awt.image.BufferedImage;
import java.security.SecureRandom;
import java.util.LinkedList;
import java.util.Random;
import java.util.logging.Level;
import java.util.logging.Logger;

/*
 * In addition to speeding things up, this class provides thread safety.
 */
public class ScrambleCacher {
	private static final Logger l = Logger.getLogger(ScrambleCacher.class.getName());
	private static final int DEFAULT_CACHE_SIZE = 100;

	/**
	 * Puzzles will get passed this instance of Random
	 * in order to have nice, as-secure-as-can-be scrambles.
	 */
	private static final Random r = new SecureRandom();

	private String[] scrambles;
	private volatile int startBuf = 0;
	private volatile int available = 0;

	public ScrambleCacher(final Puzzle puzzle) {
		this(puzzle, DEFAULT_CACHE_SIZE, false);
	}

	private volatile Throwable exception;
	private boolean running = false;
	public ScrambleCacher(final Puzzle puzzle, int cacheSize, final boolean drawScramble) {
		azzert(cacheSize > 0);
		scrambles = new String[cacheSize];
		Thread t = new Thread() {
			public void run() {
				synchronized(puzzle.getClass()) {
					// This thread starts running while scrambler
					// is still initializing, we must wait until
					// it has finished before we attempt to generate
					// any scrambles.
				}
				for(;;) {
					String scramble = puzzle.generateWCAScramble(r);

					if(drawScramble) {
						// The drawScramble option exists so we can test out generating and drawing
						// a bunch of scrambles in 2 threads at the same time. See ScrambleTest.
						BufferedImage image = new BufferedImage(10, 10, BufferedImage.TYPE_INT_ARGB);
						Dimension size = new Dimension(image.getWidth(), image.getHeight());
						try {
							puzzle.drawScramble(image.createGraphics(), size, scramble, null);
						} catch (InvalidScrambleException e1) {
							e1.printStackTrace();
						}
					}

					synchronized(scrambles) {
						while(running && available == scrambles.length) {
							try {
								scrambles.wait();
							} catch(InterruptedException e) {}
						}
						if(!running) {
							return;
						}
						scrambles[(startBuf + available) % scrambles.length] = scramble;
						available++;
						scrambles.notifyAll();
					}
					fireScrambleCacheUpdated();
				}
			}
		};
		t.setUncaughtExceptionHandler(new Thread.UncaughtExceptionHandler() {
			public void uncaughtException(Thread t, Throwable e) {
				l.log(Level.SEVERE, "", e);

				// Let everyone waiting for a scramble know that we have crashed
				exception = e;
				synchronized(scrambles) {
					scrambles.notifyAll();
				}
			}
		});
		running = true;
		t.start();
	}

	public void stop() {
		synchronized(scrambles) {
			running = false;
			scrambles.notifyAll();
		}
	}

	public boolean isRunning() {
		return running;
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
		for(ScrambleCacherListener l : ls) {
			l.scrambleCacheUpdated(this);
		}
	}

	public int getAvailableCount() {
		return available;
	}

	public int getCacheSize() {
		return scrambles.length;
	}

	/**
	 * Get a new scramble from the cache. Will block if necessary.
	 * @return A new scramble from the cache.
	 */
	public String newScramble() {
		if(exception != null) {
			throw new RuntimeException(exception);
		}

		String scramble;
		synchronized(scrambles) {
			while(available == 0) {
				try {
					scrambles.wait();
				} catch(InterruptedException e) {}

				if(exception != null) {
					throw new RuntimeException(exception);
				}
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
		for(int i = 0; i < count; i++) {
			scrambles[i] = newScramble();
		}
		return scrambles;
	}
}
