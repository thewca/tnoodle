package net.gnehzr.tnoodle.scrambles;

import java.io.IOException;
import java.lang.reflect.InvocationTargetException;
import java.util.SortedMap;

import net.gnehzr.tnoodle.utils.BadClassDescriptionException;
import net.gnehzr.tnoodle.utils.LazyClassLoader;

public class Main {
	public static void main(String[] args) throws IllegalArgumentException, SecurityException, InstantiationException, IllegalAccessException, InvocationTargetException, ClassNotFoundException, NoSuchMethodException, BadClassDescriptionException, IOException {
		//TODO - this can be really slow for some reason
		SortedMap<String, LazyClassLoader<Scrambler>> scramblers = Scrambler.getScramblers();
		if(args.length < 1) {
			System.err.println("missing puzzle, try one of " + scramblers.keySet());
			System.exit(1);
		} else if(args.length > 1) {
			System.err.println("too many arguments");
			System.exit(1);
		}
		LazyClassLoader<Scrambler> lazyScrambler = scramblers.get(args[0]);
		if(lazyScrambler == null) {
			System.err.println("couldn't find puzzle " + args[0] + ", try one of " + scramblers.keySet());
			System.exit(1);
		}
		Scrambler s = lazyScrambler.cachedInstance();
		System.out.println(s.generateScramble());
	}
}
