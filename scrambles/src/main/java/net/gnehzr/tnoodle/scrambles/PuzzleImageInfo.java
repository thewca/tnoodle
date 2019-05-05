package net.gnehzr.tnoodle.scrambles;

import net.gnehzr.tnoodle.svglite.Color;
import net.gnehzr.tnoodle.svglite.Dimension;
import java.util.HashMap;

public class PuzzleImageInfo {
    public HashMap<String, Color> colorScheme;
    public Dimension size;

    public PuzzleImageInfo() {}
    public PuzzleImageInfo(Puzzle p) {
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
            jsonColorScheme.put(key, this.colorScheme.get(key).toHex());
        }
        jsonable.put("colorScheme", jsonColorScheme);

        return jsonable;
    }
}
