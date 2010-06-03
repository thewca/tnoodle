package net.gnehzr.tnoodle.servers.scrambleserver;

@SuppressWarnings("serial")
public class InvalidScrambleException extends Exception {
	public InvalidScrambleException(String scramble) {
		super("Invalid scramble: " + scramble);
	}
}
