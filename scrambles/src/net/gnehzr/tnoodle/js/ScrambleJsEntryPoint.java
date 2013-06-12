package net.gnehzr.tnoodle.js;

import org.timepedia.exporter.client.ExporterUtil;

import com.google.gwt.core.client.EntryPoint;

public class ScrambleJsEntryPoint implements EntryPoint {
    public static final String VERSION = "%%VERSION%%";

    public void onModuleLoad() {
        ExporterUtil.exportAll();
        onLoadImpl();

        ConsolePrintStream cps = new ConsolePrintStream();
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
