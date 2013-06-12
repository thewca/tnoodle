package net.gnehzr.tnoodle.scrambles;

import static net.gnehzr.tnoodle.utils.GwtSafeUtils.toHex;
import static net.gnehzr.tnoodle.utils.Utils.toPoints;

import java.awt.Color;
import java.awt.Dimension;
import java.awt.geom.GeneralPath;
import java.lang.reflect.Type;
import java.util.HashMap;

import com.google.gson.JsonElement;
import com.google.gson.JsonSerializationContext;
import com.google.gson.JsonSerializer;

import net.gnehzr.tnoodle.utils.Utils;

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

    static {
        Utils.registerTypeAdapter(PuzzleImageInfo.class, new PuzzleImageInfoizer());
    }
    private static class PuzzleImageInfoizer implements JsonSerializer<PuzzleImageInfo> {
        @Override
        public JsonElement serialize(PuzzleImageInfo pii, Type typeOfT, JsonSerializationContext context) {
            HashMap<String, Object> jsonable = new HashMap<String, Object>();
            jsonable.put("size", pii.size);

            HashMap<String, String> jsonColorScheme = new HashMap<String, String>();
            for(String key : pii.colorScheme.keySet()) {
                jsonColorScheme.put(key, toHex(pii.colorScheme.get(key)));
            }
            jsonable.put("colorScheme", jsonColorScheme);

            HashMap<String, double[][][]> jsonFaces = new HashMap<String, double[][][]>();
            for(String key : pii.faces.keySet()) {
                jsonFaces.put(key, toPoints(pii.faces.get(key)));
            }
            jsonable.put("faces", jsonFaces);

            return context.serialize(jsonable);
        }
    }

}
