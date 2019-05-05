package net.gnehzr.tnoodle.svglite;

@SuppressWarnings("serial")
public class InvalidHexColorException extends Exception {
    public InvalidHexColorException(String invalidHex) {
        super(invalidHex);
    }
}
