package net.gnehzr.tnoodle.js;

import static net.gnehzr.tnoodle.utils.GwtSafeUtils.azzert;

import java.util.logging.Level;
import java.util.logging.Logger;

import org.timepedia.exporter.client.Exportable;
import org.timepedia.exporter.client.Export;
import org.timepedia.exporter.client.ExportPackage;

@ExportPackage("")
@Export("tnoodlejs")
public class TNoodleJsUtils implements Exportable {
    private TNoodleJsUtils() {}
    
    public static void setLogLevel(String levelStr) {
        setLogLevel(levelStr, "");
    }
    public static void setLogLevel(String levelStr, String loggerStr) {
        Level level = Level.parse(levelStr);
        azzert(level != null);
        Logger logger = Logger.getLogger(loggerStr);
        logger.setLevel(level);
    }

    public static String getLogLevel() {
        return getLogLevel("");
    }
    public static String getLogLevel(String loggerStr) {
        Level level = Logger.getLogger(loggerStr).getLevel();
        return level == null ? null : level.getName();
    }
}
