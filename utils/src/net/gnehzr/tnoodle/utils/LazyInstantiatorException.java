package net.gnehzr.tnoodle.utils;

@SuppressWarnings("serial")
public class LazyInstantiatorException extends Exception {
    public LazyInstantiatorException(Exception rootCause) {
        super(rootCause);
    }
}
