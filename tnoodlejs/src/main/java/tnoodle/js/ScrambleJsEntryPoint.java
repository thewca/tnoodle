package net.gnehzr.tnoodle.js;

import com.google.gwt.core.client.EntryPoint;
import com.google.gwt.core.client.GWT;
import org.timepedia.exporter.client.ExporterUtil;

import java.util.HashMap;

public class ScrambleJsEntryPoint implements EntryPoint {
    public static final String VERSION = "%%VERSION%%";
    public static HashMap<String, String> resources = new HashMap<String, String>();
    static {
        //%%RESOURCES%%
    }

    public void onModuleLoad() {
        // By default, GWT is setting an UncaughtExceptionHandler,
        // which prevents exceptions from percolating up into javascriptland.
        // I think this is a bad default behavior, as it hides real errors,
        // so here we clobber it.
        GWT.setUncaughtExceptionHandler(null);

        ExporterUtil.exportAll();
        onLoadImpl();

        net.gnehzr.tnoodle.js.ConsolePrintStream cps = new net.gnehzr.tnoodle.js.ConsolePrintStream();
        System.setOut(cps);
        System.setErr(cps);
    }

    private native void onLoadImpl() /*-{
        var scramblers = "%%PUZZLES%%";
        var puzzles = {};

        // This is ported from net.gnehzr.tnoodle.utils.Plugins
        var lines = scramblers.split("\n");
        var lastComment = null;
        for(var i = 0; i < lines.length; i++) {
            var line = lines[i].trim();
            // lines starting with # and empty lines are ignored
            if(line.length == 0) {
                lastComment = null;
                continue;
            }
            if(line[0] == '#') {
                lastComment = line.substring(1);
                continue;
            }

            var name_def = line.match(/([^\s]*)(.*)/);
            var name = name_def[1];
            var definition = name_def[2];
            puzzles[name] = eval("new " + definition);
        }
        if ($wnd.puzzlesLoaded && typeof $wnd.puzzlesLoaded == 'function') $wnd.puzzlesLoaded(puzzles);
    }-*/;
}
