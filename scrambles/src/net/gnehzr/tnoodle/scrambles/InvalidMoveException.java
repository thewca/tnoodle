package net.gnehzr.tnoodle.scrambles;

@SuppressWarnings("serial")
public class InvalidMoveException extends Exception {
    public InvalidMoveException(String move) {
        super("Invalid move: " + move);
    }
}
