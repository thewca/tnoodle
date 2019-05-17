package tnoodle.jre.java.lang;

/*
 * This is an implementation of ThreadLocal for
 * gwt. Since gwt code is single threaded, this
 * is the easiest thing in the world to implememnt.
 */
public class ThreadLocal<T> {
    private boolean initialized = false;
    private T value = null;

    public T get() {
        if(!initialized) {
            value = initialValue();
            initialized = true;
        }
        return value;
    }

    protected T initialValue() {
        return null;
    }

    public void remove() {
        value = null;
        initialized = false;
    }

    public void set(T value) {
        this.value = value;
        initialized = true;
    }
}
