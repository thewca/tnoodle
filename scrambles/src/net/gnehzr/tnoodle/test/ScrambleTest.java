package net.gnehzr.tnoodle.test;

import java.awt.Dimension;
import java.awt.image.BufferedImage;
import java.io.IOException;
import java.lang.reflect.InvocationTargetException;
import java.util.SortedMap;

import net.gnehzr.tnoodle.scrambles.InvalidScrambleException;
import net.gnehzr.tnoodle.scrambles.ScrambleCacher;
import net.gnehzr.tnoodle.scrambles.ScrambleCacherListener;
import net.gnehzr.tnoodle.scrambles.Scrambler;
import net.gnehzr.tnoodle.utils.BadClassDescriptionException;
import net.gnehzr.tnoodle.utils.LazyInstantiator;
import net.gnehzr.tnoodle.utils.Utils;

public class ScrambleTest {
	
	static class LockHolder extends Thread {
		private Object o;
		public void setObjectToLock(Object o) {
			synchronized(this) {
				this.o = o;
				if(isAlive()) {
					notify();
				} else {
					start();
				}
			}
			try {
				Thread.sleep(100); // give the locker thread a chance to grab the lock
			} catch(InterruptedException e) {
				e.printStackTrace();
			}
		}
		@Override
		public synchronized void run() {
			while(o != null) {
				synchronized(o) {
					System.out.println("GOT LOCK " + o);
					Object locked = o;
					while(o == locked) {
						try {
							wait();
						} catch (InterruptedException e) {}
					}
				}
			}
		}
	}
	
	public static void main(String[] args) throws BadClassDescriptionException, IOException, IllegalArgumentException, SecurityException, InstantiationException, IllegalAccessException, InvocationTargetException, ClassNotFoundException, NoSuchMethodException, InvalidScrambleException {
		LockHolder lh = new LockHolder();

		int SCRAMBLE_COUNT = 100;
		boolean drawScramble = true;
		SortedMap<String, LazyInstantiator<Scrambler>> lazyScramblers = Scrambler.getScramblers();
		
		// Check that the names by which the scramblers refer to themselves
		// is the same as the names by which we refer to them in the plugin definitions file.
		for(String shortName : lazyScramblers.keySet()) {
			String longName = Scrambler.getScramblerLongName(shortName);
			LazyInstantiator<Scrambler> lazyScrambler = lazyScramblers.get(shortName);
			Scrambler scrambler = lazyScrambler.cachedInstance();
			
			System.out.println(shortName + " ==? " + scrambler.getShortName());
			Utils.azzert(shortName.equals(scrambler.getShortName()));
			
			System.out.println(longName + " ==? " + scrambler.getLongName());
			Utils.azzert(longName.equals(scrambler.getLongName()));
		}
		
		for(String puzzle : lazyScramblers.keySet()) {
			LazyInstantiator<Scrambler> lazyScrambler = lazyScramblers.get(puzzle);
			final Scrambler scrambler = lazyScrambler.cachedInstance();
			
			// Generating a scramble
			System.out.println("Generating a " + puzzle + " scramble");
			String scramble;
			lh.setObjectToLock(scrambler);
			scramble = scrambler.generateScramble();
			
			// Drawing that scramble
			System.out.println("Drawing " + scramble);
			BufferedImage image = new BufferedImage(10, 10, BufferedImage.TYPE_INT_ARGB);
			Dimension size = new Dimension(image.getWidth(), image.getHeight());
			scrambler.drawScramble(image.createGraphics(), size, scramble, null);
			
			// Scramblers should support "null" as the empty scramble
			scrambler.drawScramble(image.createGraphics(), size, null, null);
			
			System.out.println("Generating & drawing 2 sets of " + SCRAMBLE_COUNT + " scrambles simultaneously." +
								" This is meant to shake out threading problems in scramblers.");
			final ScrambleCacher c1 = new ScrambleCacher(scrambler, SCRAMBLE_COUNT, drawScramble);
			final ScrambleCacher c2 = new ScrambleCacher(scrambler, SCRAMBLE_COUNT, drawScramble);
			ScrambleCacherListener cacherStopper = new ScrambleCacherListener() {
				@Override
				public void scrambleCacheUpdated(ScrambleCacher src) {
					System.out.println(Thread.currentThread() + " " + src.getAvailableCount() + " / " + src.getCacheSize());
					if(src.getAvailableCount() == src.getCacheSize()) {
						src.stop();
						synchronized(c1) {
							c1.notify();
						}
					}
				}
			};
			c1.addScrambleCacherListener(cacherStopper);
			c2.addScrambleCacherListener(cacherStopper);
			while(c1.isRunning() || c2.isRunning()) {
				synchronized(c1) {
					try {
						c1.wait();
					} catch(InterruptedException e) {
						e.printStackTrace();
					}
				}
			}
		
		}
		lh.setObjectToLock(null);
		System.out.println("Test passed!");
	}
}
