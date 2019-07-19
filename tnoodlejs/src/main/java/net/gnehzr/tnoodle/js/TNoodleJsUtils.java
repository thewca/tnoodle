package net.gnehzr.tnoodle.js;

import com.google.gwt.core.client.JavaScriptObject;
import com.google.gwt.dom.client.Element;
import com.google.gwt.json.client.*;
import com.google.gwt.user.client.ui.Image;
import net.gnehzr.tnoodle.scrambles.InvalidScrambleException;
import net.gnehzr.tnoodle.scrambles.Puzzle;
import net.gnehzr.tnoodle.scrambles.PuzzleImageInfo;
import net.gnehzr.tnoodle.svglite.Color;
import net.gnehzr.tnoodle.svglite.Svg;
import org.timepedia.exporter.client.Export;
import org.timepedia.exporter.client.ExportPackage;
import org.timepedia.exporter.client.Exportable;

import java.util.HashMap;
import java.util.logging.Level;
import java.util.logging.Logger;

import static net.gnehzr.tnoodle.utils.GwtSafeUtils.azzert;

@ExportPackage("")
@Export("tnoodlejs")
public class TNoodleJsUtils implements Exportable {
    private static final String PUZZLE_PACKAGE = "net.gnehzr.tnoodle.puzzle";

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

    public static String scrambleToSvg(String scramble, Puzzle puzzle, String scheme) throws InvalidScrambleException {
        HashMap<String, Color> colorScheme = puzzle.parseColorScheme(scheme);
        Svg svg = puzzle.drawScramble(scramble, colorScheme);
        return svg.toString();
    }

    public static String getVersion() {
        return net.gnehzr.tnoodle.js.ScrambleJsEntryPoint.VERSION;
    }

    public static Element getPuzzleIcon(Puzzle puzzle) {
        String filename = PUZZLE_PACKAGE + "/" + puzzle.getShortName() + ".png";
        if(net.gnehzr.tnoodle.js.ScrambleJsEntryPoint.resources.containsKey(filename)) {
            Image image = new Image();
            image.setUrl("data:image/png;base64," + net.gnehzr.tnoodle.js.ScrambleJsEntryPoint.resources.get(filename));
            return image.getElement();
        }

        return null;
    }

    private static JSONValue toJSONValue(Object obj) {
        if(obj instanceof HashMap) {
            HashMap<String, Object> map = (HashMap<String, Object>) obj;
            JSONObject jsonObj = new JSONObject();
            for(String key : map.keySet()) {
                jsonObj.put(key, toJSONValue(map.get(key)));
            }
            return jsonObj;
        } else if(obj instanceof String) {
            return new JSONString((String) obj);
        } else if(obj instanceof Integer) {
            return new JSONNumber((Integer) obj);
        } else if(obj instanceof double[]) {
            JSONArray jsonArr = new JSONArray();
            double[] arr = (double[]) obj;
            for(int i = 0; i < arr.length; i++) {
                jsonArr.set(i, new JSONNumber(arr[i]));
            }
            return jsonArr;
        } else if(obj instanceof Object[]) {
            JSONArray jsonArr = new JSONArray();
            Object[] arr = (Object[]) obj;
            for(int i = 0; i < arr.length; i++) {
                jsonArr.set(i, toJSONValue(arr[i]));
            }
            return jsonArr;
        } else {
            azzert(false, "Unrecognized type " + obj.getClass());
            return null;
        }
    }

    public static JavaScriptObject getPuzzleImageInfo(Puzzle puzzle) {
        HashMap<String, Object> pii = new PuzzleImageInfo(puzzle).toJsonable();
        JSONObject jso = (JSONObject) toJSONValue(pii);
        return jso.getJavaScriptObject();
    }

}
