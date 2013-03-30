package net.gnehzr.tnoodle.server.webscrambles;

@SuppressWarnings("serial")
public class InvalidScrambleRequestException extends Exception {

    public InvalidScrambleRequestException(String string) {
        super(string);
    }

    public InvalidScrambleRequestException(Throwable cause) {
        super(cause);
    }

}
