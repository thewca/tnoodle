package net.gnehzr.tnoodle.utils;

/*
 * This is in its own class so we can override it in gwt
 */
public class EnvGetter {
    private EnvGetter() {}

    public native static final String getenv(String key) /*-{
        var val = null;
        if($wnd.TNOODLE_ENV) {
            val = $wnd.TNOODLE_ENV[key];
            if(val === undefined) {
                val = null;
            }
        }
        return val;
    }-*/;
}
