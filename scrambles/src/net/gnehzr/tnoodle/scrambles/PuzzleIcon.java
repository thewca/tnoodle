package net.gnehzr.tnoodle.scrambles;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import net.gnehzr.tnoodle.utils.GwtSafeUtils;
import java.util.logging.Logger;
import java.util.logging.Level;

public class PuzzleIcon {
    private static final Logger l = Logger.getLogger(PuzzleIcon.class.getName());

    private PuzzleIcon() {}

    public static final ByteArrayOutputStream loadPuzzleIconPng(String shortName) {
        ByteArrayOutputStream bytes = new ByteArrayOutputStream();
        InputStream in = PuzzleIcon.class.getResourceAsStream("/" + PuzzlePlugins.PUZZLE_PACKAGE + "/" + shortName + ".png");
        if(in != null) {
            try {
                GwtSafeUtils.fullyReadInputStream(in, bytes);
                return bytes;
            } catch (IOException e) {
                l.log(Level.INFO, "", e);
            }
        }
        return null;
    }

}
