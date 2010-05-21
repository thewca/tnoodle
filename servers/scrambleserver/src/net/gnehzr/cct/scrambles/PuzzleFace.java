package net.gnehzr.cct.scrambles;

import java.awt.Color;
import java.awt.geom.FlatteningPathIterator;
import java.awt.geom.GeneralPath;
import java.util.ArrayList;

/**
 * This is simply a wrapper class that Gson will convert to json when necessary.
 * @author Jeremy Fleischman
 */
public class PuzzleFace {
	public int[] color;
	public ArrayList<double[]> area;
	public PuzzleFace(Color c, GeneralPath path) {
		color = new int[] { c.getRed(), c.getGreen(), c.getBlue() };
		area = new ArrayList<double[]>();
		FlatteningPathIterator fpi = new FlatteningPathIterator(path.getPathIterator(null), 1.0);
		while(!fpi.isDone()) {
			double[] coords = new double[2];
			if(fpi.currentSegment(coords) != FlatteningPathIterator.SEG_CLOSE)
				area.add(coords);
			fpi.next();
		}
	}
}
