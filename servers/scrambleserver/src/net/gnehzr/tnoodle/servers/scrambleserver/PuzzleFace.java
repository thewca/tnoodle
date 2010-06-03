package net.gnehzr.tnoodle.servers.scrambleserver;

import java.awt.Color;
import java.awt.geom.FlatteningPathIterator;
import java.awt.geom.GeneralPath;
import java.util.LinkedList;

/**
 * This is simply a wrapper class that Gson will convert to json when necessary.
 * @author Jeremy Fleischman
 */
public class PuzzleFace {
	public int[] color;
	public LinkedList<double[]> area;
	public PuzzleFace() {} //for gson deserialization
	public PuzzleFace(Color c, GeneralPath path) {
		color = new int[] { c.getRed(), c.getGreen(), c.getBlue() };
		area = new LinkedList<double[]>();
		FlatteningPathIterator fpi = new FlatteningPathIterator(path.getPathIterator(null), 1.0);
		while(!fpi.isDone()) {
			double[] coords = new double[2];
			if(fpi.currentSegment(coords) != FlatteningPathIterator.SEG_CLOSE)
				area.add(coords);
			fpi.next();
		}
	}
	
	public Color getColor() {
		return new Color(color[0], color[1], color[2]);
	}
	
	public GeneralPath getArea() {
		GeneralPath path = new GeneralPath();
		path.moveTo(area.get(0)[0], area.get(0)[1]);
		for(int i = 1; i < area.size(); i++)
			path.lineTo(area.get(i)[0], area.get(i)[1]);
		return path;
	}
}
