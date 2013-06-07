package net.gnehzr.tnoodle.scrambles;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import net.gnehzr.tnoodle.utils.Utils;
import java.util.logging.Logger;
import java.util.logging.Level;
import java.awt.Dimension;
import java.awt.image.BufferedImage;
import java.awt.Graphics2D;
import javax.imageio.ImageIO;

/*
 * This is not a part of the Puzzle class because gwt
 * doesn't like any of this madness.
 */
public class PuzzleIcon {
    private static final Logger l = Logger.getLogger(PuzzleIcon.class.getName());

    private PuzzleIcon() {}

    /**
     * TODO - comment
     * We should probably assert that the icons are of a particular size.
     */

    public static final ByteArrayOutputStream loadPuzzleIcon(Puzzle p) {
        ByteArrayOutputStream bytes = new ByteArrayOutputStream();
        InputStream in = p.getClass().getResourceAsStream(p.getShortName() + ".png");
        if(in != null) {
            try {
                Utils.fullyReadInputStream(in, bytes);
                return bytes;
            } catch (IOException e) {
                l.log(Level.INFO, "", e);
            }
        }

        Dimension dim = new Dimension(32, 32);
        BufferedImage img = new BufferedImage(dim.width, dim.height, BufferedImage.TYPE_INT_ARGB);
        Graphics2D g = (Graphics2D) img.getGraphics();
        p.drawPuzzleIcon(g, dim);
        try {
            ImageIO.write(img, "png", bytes);
        } catch(IOException e) {
            l.log(Level.SEVERE, "", e);
        }
        return bytes;
    }

}
