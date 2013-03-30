package net.gnehzr.tnoodle.scrambles;

@SuppressWarnings("serial")
public class InvalidScrambleException extends Exception {
    public InvalidScrambleException(String scramble) {
        super(scramble, null);
    }
    public InvalidScrambleException(String scramble, Throwable t) {
        super("Invalid scramble: " + scramble, t);
    }
}
