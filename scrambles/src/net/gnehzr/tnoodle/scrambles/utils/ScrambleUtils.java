package net.gnehzr.tnoodle.scrambles.utils;

import java.awt.Color;
import java.awt.geom.GeneralPath;
import java.awt.geom.PathIterator;
import java.io.ByteArrayOutputStream;
import java.io.PrintStream;
import java.util.ArrayList;
import java.util.HashMap;

public final class ScrambleUtils {
	private ScrambleUtils() {}
	
	private static final HashMap<String, Color> WCA_COLORS = new HashMap<String, Color>();
	static {
		Color timPurple = new Color(98, 50, 122);
		Color orangeHeraldicTincture = new Color(255, 128, 0);
		WCA_COLORS.put("y", Color.YELLOW);
		WCA_COLORS.put("yellow", Color.YELLOW);
		WCA_COLORS.put("b", Color.BLUE);
		WCA_COLORS.put("blue", Color.BLUE);
		WCA_COLORS.put("r", Color.RED);
		WCA_COLORS.put("red", Color.RED);
		WCA_COLORS.put("w", Color.WHITE);
		WCA_COLORS.put("white", Color.WHITE);
		WCA_COLORS.put("g", Color.GREEN);
		WCA_COLORS.put("green", Color.GREEN);
		WCA_COLORS.put("o", orangeHeraldicTincture);
		WCA_COLORS.put("orange", orangeHeraldicTincture);
		WCA_COLORS.put("p", timPurple);
		WCA_COLORS.put("purple", timPurple);
		WCA_COLORS.put("0", Color.GRAY);
		WCA_COLORS.put("grey", Color.GRAY);
		WCA_COLORS.put("gray", Color.GRAY);
	}
	public static Color toColor(String s) {
		try {
			if(WCA_COLORS.containsKey(s))
				return WCA_COLORS.get(s);
			if(s.startsWith("#"))
				s = s.substring(1);
			if(s.length() != 6)
				return null;
			return new Color(Integer.parseInt(s, 16));
		} catch(Exception e) {
			return null;
		}
	}
	
	public static Color invertColor(Color c) {
		if(c == null)
			return Color.BLACK;
		return new Color(255 - c.getRed(), 255 - c.getGreen(), 255 - c.getBlue());
	}

	public static String toHex(Color c) {
		if(c == null)
			return "";
		return Integer.toHexString(0x1000000 | (c.getRGB() & 0xffffff)).substring(1);
	}
	
	public static double[][][] toPoints(GeneralPath s) {
		ArrayList<ArrayList<double[]>> areas = new ArrayList<ArrayList<double[]>>();
		ArrayList<double[]> area = null;
		double[] coords = new double[2];
		PathIterator pi = s.getPathIterator(null, 1.0);
		while(!pi.isDone()) {
			int val = pi.currentSegment(coords);
			switch(val) {
			case PathIterator.SEG_MOVETO:
				area = new ArrayList<double[]>();
				areas.add(area);
			case PathIterator.SEG_LINETO:
			case PathIterator.SEG_CLOSE:
				area.add(coords.clone());
				break;
			default:
				return null;
			}
			pi.next();
		}
		double[][][] areasArray = new double[areas.size()][][];
		for(int i = 0; i < areasArray.length; i++) {
			area = areas.get(i);
			areasArray[i] = new double[area.size()][];
			for(int j = 0; j < areasArray[i].length; j++) {
				areasArray[i][j] = area.get(j);
			}
		}
		return areasArray;
	}

	//requires that m > 0
	public static final int modulo(int x, int m) {
		if(m < 0) {
			throw new RuntimeException("m must be > 0");
		}
		int y = x % m;
		if(y >= 0) return y;
		return y + m;
	}

	public static Integer toInt(String string, Integer def) {
		try {
			return Integer.parseInt(string);
		} catch(Exception e) {
			return def;
		}
	}
	
	public static Long toLong(String string, Long def) {
		try {
			return Long.parseLong(string);
		} catch(Exception e) {
			return def;
		}
	}
	
	public static int ceil(double d) {
		return (int) Math.ceil(d);
	}

	public static String throwableToString(Throwable e) {
		ByteArrayOutputStream bytes = new ByteArrayOutputStream();
		e.printStackTrace(new PrintStream(bytes));
		return bytes.toString();
	}
	
	public static String[] parseExtension(String filename) {
		int lastDot = filename.lastIndexOf('.');
		String name, extension;
		if(lastDot == -1) {
			name = filename;
			extension = null;
		} else {
			name = filename.substring(0, lastDot);
			extension = filename.substring(lastDot+1);
		}
		return new String[] { name, extension };
	}
}
