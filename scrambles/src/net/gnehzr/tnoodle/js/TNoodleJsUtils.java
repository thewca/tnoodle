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
import com.google.gwt.user.client.ui.Image;

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

    private static OMSVGSVGElement createSVG(int width, int height) {
        OMSVGDocument doc = OMSVGParser.currentDocument();
        OMSVGSVGElement svg = doc.createSVGSVGElement();
        svg.setWidth(OMSVGLength.SVG_LENGTHTYPE_PX, width);
        svg.setHeight(OMSVGLength.SVG_LENGTHTYPE_PX, height);
        svg.setViewBox(0, 0, width, height);
        return svg;
    }

    public static Element scrambleToSvg(String scramble, Puzzle puzzle, int maxWidth, int maxHeight) throws InvalidScrambleException {
        Dimension size = puzzle.getPreferredSize(maxWidth, maxHeight);
        OMSVGSVGElement svg = createSVG(size.width, size.height);
        Graphics2D g2d = new Graphics2D((OMSVGDocument) svg.getOwnerDocument(), svg);
        // TODO - support color scheme
        HashMap<String, Color> colorScheme = null;
        puzzle.drawScramble(g2d, size, scramble, colorScheme);
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

}
