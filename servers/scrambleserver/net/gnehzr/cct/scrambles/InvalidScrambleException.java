package net.gnehzr.cct.scrambles;

@SuppressWarnings("serial")
public class InvalidScrambleException extends Exception {
	public InvalidScrambleException(String scramble) {
		super("Invalid scramble: " + scramble);
	}
}
