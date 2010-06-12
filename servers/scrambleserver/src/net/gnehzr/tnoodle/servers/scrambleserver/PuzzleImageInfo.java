package net.gnehzr.tnoodle.servers.scrambleserver;

import java.awt.Color;
import java.awt.Dimension;
import java.awt.geom.GeneralPath;
import java.util.HashMap;

public class PuzzleImageInfo {
	public HashMap<String, GeneralPath> faces;
	public HashMap<String, Color> colorScheme;
	public Dimension size;
	
	public PuzzleImageInfo() {}
}
