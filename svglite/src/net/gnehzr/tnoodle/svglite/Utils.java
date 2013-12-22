package net.gnehzr.tnoodle.svglite;

public class Utils {
    private Utils() {}

    public static void azzert(boolean expr) {
        if(!expr) {
            throw new AssertionError();
        }
    }

    public static void azzert(boolean expr, String message) {
        if(!expr) {
            throw new AssertionError(message);
        }
    }

    public static void azzert(boolean expr, Throwable t) {
        if(!expr) {
            throw new AssertionError(t);
        }
    }
}
