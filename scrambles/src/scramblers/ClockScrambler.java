package scramblers;

import java.util.Random;
import java.util.HashMap;
import java.awt.geom.GeneralPath;
import java.awt.Graphics2D;
import java.awt.Dimension;
import java.awt.Color;

import net.gnehzr.tnoodle.scrambles.InvalidScrambleException;
import net.gnehzr.tnoodle.scrambles.Scrambler;

public class ClockScrambler extends Scrambler {
//	private boolean verbose = false;
	
	public static synchronized ClockScrambler[] createScramblers() {
		return new ClockScrambler[] { new ClockScrambler() };
	}
	
	@Override
	public String getLongName() {
		return "Clock";
	}

	@Override
	public String getShortName() {
		return "clock";
	}
	
	@Override
	public synchronized String generateScramble(Random r) {
		StringBuffer scramble = new StringBuffer();
		
		String[] peg={"U","d"};
//		String[] pegs={"UUdd ","dUdU ","ddUU ","UdUd "};
//		String[] upegs={"dUUU ","UdUU ","UUUd ","UUdU ","UUUU "};
		for(int x=0; x<4; x++) {
//			if (verbose) {
//				scram.append(pegs[x]);
//			}
			scramble.append("u=" + (r.nextInt(12)-5) + ",d=" + (r.nextInt(12)-5) + " /");
		}
		for(int x=0;x<5; x++) {
//			if (verbose) {	
//				scram.append(upegs[x]);
//			}
			scramble.append("u=" + (r.nextInt(12)-5) + " /");
		}
//		if (verbose) {
//			scram.append("dddd ");
//		}
		scramble.append("d=" + (r.nextInt(12)-5) + " /");
		for(int x=0;x<4;x++) {
			scramble.append(peg[r.nextInt(2)]);
		}
		
		return scramble.toString();
	}

	protected Dimension getPreferredSize() {
		return new Dimension(0, 0);
	}
	public HashMap<String, Color> getDefaultColorScheme() {
		return new HashMap<String, Color>();
	}
	public HashMap<String, GeneralPath> getDefaultFaceBoundaries() {
		return new HashMap<String, GeneralPath>();
	}
	protected void drawScramble(Graphics2D g, String scramble, HashMap<String, Color> colorScheme) throws InvalidScrambleException {}
}
