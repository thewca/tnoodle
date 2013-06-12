package net.gnehzr.tnoodle.js;

import static net.gnehzr.tnoodle.utils.GwtSafeUtils.azzert;

import net.gnehzr.tnoodle.scrambles.Puzzle;
import net.gnehzr.tnoodle.scrambles.InvalidScrambleException;

import java.awt.Color;
import java.awt.Graphics2D;
import java.awt.Dimension;

import java.util.HashMap;
import java.util.logging.Level;
import java.util.logging.Logger;

import org.timepedia.exporter.client.Exportable;
import org.timepedia.exporter.client.Export;
import org.timepedia.exporter.client.ExportPackage;

import com.google.gwt.dom.client.Element;

import org.vectomatic.dom.svg.OMSVGDocument;
import org.vectomatic.dom.svg.OMSVGLength;
import org.vectomatic.dom.svg.OMSVGSVGElement;
import org.vectomatic.dom.svg.utils.OMSVGParser;

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

    public static Element scrambleToSvg(String scramble, Puzzle puzzle, int maxWidth, int maxHeight) throws InvalidScrambleException {
        Dimension size = puzzle.getPreferredSize(maxWidth, maxHeight);
        OMSVGDocument doc = OMSVGParser.currentDocument();
        OMSVGSVGElement svg = doc.createSVGSVGElement();
        svg.setWidth(OMSVGLength.SVG_LENGTHTYPE_PX, size.width);
        svg.setHeight(OMSVGLength.SVG_LENGTHTYPE_PX, size.height);
        svg.setViewBox(0, 0, size.width, size.height);
        Graphics2D g2d = new Graphics2D(doc, svg);
        // TODO - support color scheme
        HashMap<String, Color> colorScheme = null;
        puzzle.drawScramble(g2d, size, scramble, colorScheme);
        return svg.getElement();
    }

    public static String getVersion() {
        return ScrambleJsEntryPoint.VERSION;
    }

}
