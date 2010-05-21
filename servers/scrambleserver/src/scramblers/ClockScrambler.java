package scramblers;

import java.util.Random;

import net.gnehzr.cct.scrambles.ScrambleGenerator;

public class ClockScrambler extends ScrambleGenerator {
//	private boolean verbose = false;
	
	@Override
	public String getLongName() {
		return "Clock";
	}

	@Override
	public String getShortName() {
		return "clock";
	}
	
	@Override
	public String[] generateScramble(Random r, boolean obeySeed) {
		int index = 0;
		String[] scramble = new String[4+5+1+4];
		
		String[] peg={"U","d"};
//		String[] pegs={"UUdd ","dUdU ","ddUU ","UdUd "};
//		String[] upegs={"dUUU ","UdUU ","UUUd ","UUdU ","UUUU "};
		for(int x=0; x<4; x++) {
//			if (verbose) {
//				scram.append(pegs[x]);
//			}
			scramble[index++] = "u=" + (r.nextInt(12)-5) + ",d=" + (r.nextInt(12)-5) + " /";
		}
		for(int x=0;x<5; x++) {
//			if (verbose) {	
//				scram.append(upegs[x]);
//			}
			scramble[index++] = "u=" + (r.nextInt(12)-5) + " /";
		}
//		if (verbose) {
//			scram.append("dddd ");
//		}
		scramble[index++] = "d=" + (r.nextInt(12)-5) + " /";
		for(int x=0;x<4;x++) {
			scramble[index++] = peg[r.nextInt(2)];
		}
		
		return scramble;
	}
}
