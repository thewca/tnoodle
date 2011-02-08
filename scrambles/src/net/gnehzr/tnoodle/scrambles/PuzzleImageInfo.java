package net.gnehzr.tnoodle.scrambles;

import static net.gnehzr.tnoodle.utils.Utils.toHex;
import static net.gnehzr.tnoodle.utils.Utils.toPoints;

import java.awt.Color;
import java.awt.Dimension;
import java.awt.geom.GeneralPath;
import java.util.HashMap;

public class PuzzleImageInfo {
	public HashMap<String, GeneralPath> faces;
	public HashMap<String, Color> colorScheme;
	public Dimension size;
	
	public PuzzleImageInfo() {}
	
	/**
	 * This method allows GSON to handle this object, and also allows js to
	 * deal with PuzzleImageInfo objects through liveconnect.
	 * @return An object safe to pass to GSON.
	 */
	public HashMap<String, Object> jsonize() {
		HashMap<String, Object> jsonable = new HashMap<String, Object>();
		jsonable.put("size", size);
		
		HashMap<String, String> jsonColorScheme = new HashMap<String, String>();
		for(String key : colorScheme.keySet())
			jsonColorScheme.put(key, toHex(colorScheme.get(key)));
		jsonable.put("colorScheme", jsonColorScheme);
		
		HashMap<String, double[][][]> jsonFaces = new HashMap<String, double[][][]>();
		for(String key : faces.keySet())
			jsonFaces.put(key, toPoints(faces.get(key)));
		jsonable.put("faces", jsonFaces);
		
		return jsonable;
	}
}
