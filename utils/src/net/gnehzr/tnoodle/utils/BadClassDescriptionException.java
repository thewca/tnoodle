package net.gnehzr.tnoodle.utils;


@SuppressWarnings("serial")
public class BadClassDescriptionException extends Exception {
    public BadClassDescriptionException(String description) {
        super(description);
    }
}