package net.gnehzr.tnoodle.utils;

/*
 * This is in its own class so we can override it in gwt
 */
public class EnvGetter {
    private EnvGetter() {}

    public native static final String getenv(String key) /*-{
        if ($wnd.TNOODLE_ENV) return $wnd.TNOODLE_ENV[key];
        return null;
    }-*/;
}
