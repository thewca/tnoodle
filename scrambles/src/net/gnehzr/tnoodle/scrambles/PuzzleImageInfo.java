package net.gnehzr.tnoodle.scrambles;

import static net.gnehzr.tnoodle.utils.GwtSafeUtils.toHex;
import static net.gnehzr.tnoodle.utils.GwtSafeUtils.toPoints;

import java.awt.Color;
import java.awt.Dimension;
import java.awt.geom.GeneralPath;
import java.util.HashMap;

public class PuzzleImageInfo {
    public HashMap<String, GeneralPath> faces;
    public HashMap<String, Color> colorScheme;
    public Dimension size;

    public PuzzleImageInfo() {}
    public PuzzleImageInfo(Puzzle p) {
        faces = p.getDefaultFaceBoundaries();
        colorScheme = p.getDefaultColorScheme();
        size = p.getPreferredSize();
    }

    public HashMap<String, Object> toJsonable() {
        HashMap<String, Object> jsonable = new HashMap<String, Object>();
        HashMap<String, Integer> dim = new HashMap<String, Integer>();
        dim.put("width", size.width);
        dim.put("height", size.height);
        jsonable.put("size", dim);

        HashMap<String, String> jsonColorScheme = new HashMap<String, String>();
        for(String key : this.colorScheme.keySet()) {
            jsonColorScheme.put(key, toHex(this.colorScheme.get(key)));
        }
        jsonable.put("colorScheme", jsonColorScheme);

        HashMap<String, double[][][]> jsonFaces = new HashMap<String, double[][][]>();
        for(String key : this.faces.keySet()) {
            jsonFaces.put(key, toPoints(this.faces.get(key)));
        }
        jsonable.put("faces", jsonFaces);
        return jsonable;
    }
}
