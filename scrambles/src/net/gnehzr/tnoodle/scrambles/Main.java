package net.gnehzr.tnoodle.scrambles;

import java.util.SortedMap;

public class Main {
	public static void main(String[] args) {
		//TODO - this can be really slow for some reason
		SortedMap<String, Scrambler> scramblers = Scrambler.getScramblers();
		if(args.length < 1) {
			System.err.println("missing puzzle, try one of " + scramblers.keySet());
			System.exit(1);
		} else if(args.length > 1) {
			System.err.println("too many arguments");
			System.exit(1);
		}
		Scrambler s = scramblers.get(args[0]);
		if(s == null) {
			System.err.println("couldn't find puzzle " + args[0] + ", try one of " + scramblers.keySet());
			System.exit(1);
		}
//		Scrambler s = new PyraminxScrambler();
		System.out.println(s.generateScramble());
//		System.exit(0); // TODO - why is this is necessary to get the process to exit?
	}
}
