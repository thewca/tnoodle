package net.gnehzr.tnoodle.js;

import static net.gnehzr.tnoodle.utils.GwtSafeUtils.azzert;

import java.awt.geom.AffineTransform;
import org.vectomatic.dom.svg.utils.SVGConstants;
import net.gnehzr.tnoodle.scrambles.Puzzle;
import net.gnehzr.tnoodle.scrambles.InvalidScrambleException;
import net.gnehzr.tnoodle.scrambles.PuzzleImageInfo;

import java.awt.Color;
import java.awt.geom.GeneralPath;
import java.awt.Graphics2D;
import java.awt.Dimension;
import org.vectomatic.dom.svg.OMSVGPathElement;

import java.util.HashMap;
import java.util.logging.Level;
import java.util.logging.Logger;

import org.timepedia.exporter.client.Exportable;
import org.timepedia.exporter.client.Export;
import org.timepedia.exporter.client.ExportPackage;

import com.google.gwt.dom.client.Element;
import com.google.gwt.user.client.ui.Image;

import org.vectomatic.dom.svg.OMSVGDocument;
import org.vectomatic.dom.svg.OMSVGLength;
import org.vectomatic.dom.svg.OMSVGSVGElement;
import org.vectomatic.dom.svg.utils.OMSVGParser;

import com.google.gwt.json.client.JSONObject;
import com.google.gwt.json.client.JSONString;
import com.google.gwt.json.client.JSONNumber;
import com.google.gwt.json.client.JSONArray;
import com.google.gwt.json.client.JSONValue;
import com.google.gwt.core.client.JavaScriptObject;

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

    private static OMSVGSVGElement createSVG(int width, int height) {
        OMSVGDocument doc = OMSVGParser.currentDocument();
        OMSVGSVGElement svg = doc.createSVGSVGElement();
        svg.setWidth(OMSVGLength.SVG_LENGTHTYPE_PX, width);
        svg.setHeight(OMSVGLength.SVG_LENGTHTYPE_PX, height);
        svg.setViewBox(0, 0, width, height);
        return svg;
    }

    public static Element scrambleToSvg(String scramble, Puzzle puzzle, int maxWidth, int maxHeight, String scheme) throws InvalidScrambleException {
        Dimension size = puzzle.getPreferredSize(maxWidth, maxHeight);
        OMSVGSVGElement svg = createSVG(size.width, size.height);
        Graphics2D g2d = new Graphics2D((OMSVGDocument) svg.getOwnerDocument(), svg);
        HashMap<String, Color> colorScheme = puzzle.parseColorScheme(scheme);
        puzzle.drawScramble(g2d, size, scramble, colorScheme);

        HashMap<String, GeneralPath> faces = puzzle.getDefaultFaceBoundaries();
        Dimension preferredSize = puzzle.getPreferredSize(0, 0);
        for(String face : faces.keySet()) {
            GeneralPath gp = faces.get(face);

            // Scale face to appropriate size
            gp.transform(AffineTransform.getScaleInstance(
                (float) size.width / preferredSize.width,
                (float) size.height / preferredSize.height
            ));

            OMSVGPathElement path = g2d.shapeToPathElement(gp);
            path.getStyle().setSVGProperty(SVGConstants.CSS_STROKE_PROPERTY, "#ffffff");
            path.getStyle().setSVGProperty(SVGConstants.CSS_FILL_PROPERTY, "#ffffff");
            path.getStyle().setSVGProperty(SVGConstants.CSS_OPACITY_PROPERTY, "0");
            path.setId(face);
            path.addClassNameBaseVal("puzzleface");
            g2d.g.appendChild(path);
        }

        return svg.getElement();
    }

    public static String getVersion() {
        return ScrambleJsEntryPoint.VERSION;
    }

    public static Element getPuzzleIcon(Puzzle puzzle) {
        String filename = "puzzle/" + puzzle.getShortName() + ".png";
        if(ScrambleJsEntryPoint.resources.containsKey(filename)) {
            Image image = new Image();
            image.setUrl("data:image/png;base64," + ScrambleJsEntryPoint.resources.get(filename));
            return image.getElement();
        }

        Dimension size = new Dimension(32, 32);
        OMSVGSVGElement svg = createSVG(size.width, size.height);
        Graphics2D g2d = new Graphics2D((OMSVGDocument) svg.getOwnerDocument(), svg);
        puzzle.drawPuzzleIcon(g2d, size);
        return svg.getElement();
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
