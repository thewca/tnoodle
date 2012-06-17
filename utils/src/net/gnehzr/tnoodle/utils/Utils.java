package net.gnehzr.tnoodle.utils;

import java.awt.Color;
import java.awt.geom.GeneralPath;
import java.awt.geom.PathIterator;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.PrintStream;
import java.lang.reflect.Field;
import java.lang.reflect.Type;
import java.net.URISyntaxException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.jar.JarEntry;
import java.util.jar.JarInputStream;

import java.nio.channels.FileChannel;

import sun.reflect.Reflection;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.JsonArray;
import com.google.gson.JsonDeserializationContext;
import com.google.gson.JsonDeserializer;
import com.google.gson.JsonElement;
import com.google.gson.JsonParseException;
import com.google.gson.JsonPrimitive;
import com.google.gson.JsonSerializationContext;
import com.google.gson.JsonSerializer;

public final class Utils {
	private static final String RESOURCE_FOLDER = "tnoodle_resources";
	public static final SimpleDateFormat SDF = new SimpleDateFormat("yyyy/MM/dd");
	
	private Utils() {}
	
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
	
	public static String join(Object[] arr, String separator) {
		if(separator == null) {
			separator = ",";
		}
		StringBuilder sb = new StringBuilder();
		for(int i = 0; i < arr.length; i++) {
			if(i > 0) {
				sb.append(separator);
			}
			sb.append(arr[i].toString());
		}
		return sb.toString();
	}

	public static void fullyReadInputStream(InputStream is, ByteArrayOutputStream bytes) throws IOException {
		final byte[] buffer = new byte[0x10000];
		try {
			for(;;) {
				int read = is.read(buffer);
				if(read < 0)
					break;
				bytes.write(buffer, 0, read);
			}
		} finally {
			is.close();
		}
	}

	public static void copyFile(File sourceFile, File destFile) throws IOException {
		if(!destFile.exists()) {
			destFile.createNewFile();
		}

		FileChannel source = null;
		FileChannel destination = null;
		try {
			source = new FileInputStream(sourceFile).getChannel();
			destination = new FileOutputStream(destFile).getChannel();
			destination.transferFrom(source, 0, source.size());
		}
		finally {
			if(source != null) {
				source.close();
			}
			if(destination != null) {
				destination.close();
			}
		}
	}


	private static GsonBuilder gsonBuilder = new GsonBuilder();
	public static Gson GSON;
	public static synchronized void registerTypeAdapter(Class<?> clz, Object typeAdapter) {
		gsonBuilder = gsonBuilder.registerTypeAdapter(clz, typeAdapter);
		GSON = gsonBuilder.create();

		Class<?> c = GSON.getClass();
		try {
			// GSON encodes the string "'" as "\u0027" by default.
			// This behavior is controlled by the htmlSafe attribute, but
			// htmlSafe is not publicly accessible ... unless you use a
			// little bit of reflection =).
			Field f = c.getDeclaredField("htmlSafe");
			f.setAccessible(true);
			f.setBoolean(GSON, false);
		} catch (SecurityException e) {
			e.printStackTrace();
		} catch (NoSuchFieldException e) {
			e.printStackTrace();
		} catch (IllegalArgumentException e) {
			e.printStackTrace();
		} catch (IllegalAccessException e) {
			e.printStackTrace();
		}
	}
	static {
		registerTypeAdapter(Color.class, new Colorizer());
		registerTypeAdapter(GeneralPath.class, new Pather());
	}
	
	private static class Colorizer implements JsonSerializer<Color>, JsonDeserializer<Color> {

		@Override
		public JsonElement serialize(Color c, Type t, JsonSerializationContext context) {
			return new JsonPrimitive(toHex(c));
		}

		@Override
		public Color deserialize(JsonElement json, Type t, JsonDeserializationContext context) throws JsonParseException {
			Color c = toColor(json.getAsString());
			if(c == null)
				throw new JsonParseException("Invalid color");
			return c;
		}

	}
	
	private static class Pather implements JsonSerializer<GeneralPath>, JsonDeserializer<GeneralPath> {

		/*
		 * NOTE: this is ported from Utils.toPoints()
		 */
		@Override
		public JsonElement serialize(GeneralPath s, Type t, JsonSerializationContext context) {
			JsonArray areas = new JsonArray();
			JsonArray area = null;
			double[] coords = new double[2];
			PathIterator pi = s.getPathIterator(null, 1.0);
			while(!pi.isDone()) {
				int val = pi.currentSegment(coords);
				switch(val) {
				case PathIterator.SEG_MOVETO:
					area = new JsonArray();
					areas.add(area);
				case PathIterator.SEG_LINETO:
				case PathIterator.SEG_CLOSE:
					JsonArray pt = new JsonArray();
					pt.add(new JsonPrimitive(coords[0]));
					pt.add(new JsonPrimitive(coords[1]));
					area.add(pt);
					break;
				default:
					return null;
				}
				pi.next();
			}
			return areas;
		}

		@Override
		public GeneralPath deserialize(JsonElement json, Type t, JsonDeserializationContext context) throws JsonParseException {
			GeneralPath path = new GeneralPath();
			
			JsonArray areas = json.getAsJsonArray();
			for(int c = 0; c < areas.size(); c++) {
				JsonArray area = areas.get(c).getAsJsonArray();
				if(area.size() == 0)
					continue;
				
				JsonArray pt = area.get(0).getAsJsonArray();
				path.moveTo(pt.get(0).getAsDouble(), pt.get(1).getAsDouble());
				for(int i = 1; i < area.size(); i++) {
					pt = area.get(1).getAsJsonArray();
					path.lineTo(pt.get(0).getAsDouble(), pt.get(1).getAsDouble());
				}
			}
			path.closePath();
			return path;
		}
	}
	
	public static File getResourceDirectory() {
		File f = getProgramDirectory();
		if(getCallerClass().getClassLoader() instanceof LazyClassLoader) {
			// Plugins are loaded from the resource folder, so we've already got the right folder.
			azzert(f.getName().equals(RESOURCE_FOLDER));
		} else {
			f = new File(f, RESOURCE_FOLDER);
		}
		azzert(f.isDirectory());
		return f;
	}
	/**
	 * @return A File representing the directory in which this program resides.
	 * If this is a jar file, this should be obvious, otherwise it's the directory in which
	 * our calling class resides.
	 */
	public static File getProgramDirectory() {
		File programDirectory = getJarFileOrDirectory();
		if(programDirectory.isFile()) { //this should indicate a jar file
			programDirectory = programDirectory.getParentFile();
		}
		return programDirectory;
	}
	
	private static Class<?> getCallerClass() {
		Class<?> callerClass = Utils.class;
		int i = 2;
		while(callerClass.getPackage().equals(Utils.class.getPackage())) {
			callerClass = Reflection.getCallerClass(i++);
		}
		return callerClass;
	}
	
	private static File getJarFileOrDirectory() {
		Class<?> callerClass = getCallerClass();
		File programDirectory;
		try {
			programDirectory = new File(callerClass.getProtectionDomain().getCodeSource().getLocation().toURI().getPath());
		} catch (URISyntaxException e) {
			return new File(".");
		}
		return programDirectory;
	}
	
	public static File getJarFile() {
		File potentialJarFile = getJarFileOrDirectory();
		if(potentialJarFile.isFile()) {
			return potentialJarFile;
		}
		return null;
	}
	
	public static void doFirstRunStuff() throws FileNotFoundException, IOException {
		File jarFile = getJarFile();
		
		if(jarFile != null) {
			File destDirectory = jarFile.getParentFile();
			if(new File(destDirectory, RESOURCE_FOLDER).isDirectory()) {
				// If the resource folder already exists, we don't bother re-extracting the
				// files.
				return;
			}
			
			JarInputStream jarIs = new JarInputStream(new FileInputStream(jarFile));
			JarEntry entry;
			byte[] buf = new byte[1024];
			while((entry = jarIs.getNextJarEntry()) != null) {
				if(entry.isDirectory()) {
					continue;
				}
				
				if(entry.getName().startsWith(RESOURCE_FOLDER)) {
					File destFile = new File(destDirectory, entry.getName());
					destFile.getParentFile().mkdirs();
					FileOutputStream out = new FileOutputStream(destFile);

					int n;
					while ((n = jarIs.read(buf, 0, buf.length)) > -1) {
						out.write(buf, 0, n);
					}
					out.close();
				}
				jarIs.closeEntry();
			}
		}
	}

	public static void azzert(boolean expr) {
		if(!expr) {
			throw new AssertionError();
		}
	}
	
}
