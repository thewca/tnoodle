package net.gnehzr.tnoodle.servers.scrambleserver;

import java.awt.Color;
import java.awt.geom.GeneralPath;
import java.awt.geom.PathIterator;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.PrintStream;
import java.lang.reflect.Type;
import java.util.HashMap;

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
import com.sun.net.httpserver.HttpExchange;

@SuppressWarnings("restriction")
public final class ScrambleUtils {
	public static final Gson GSON = new GsonBuilder()
									.registerTypeAdapter(Color.class, new Colorizer())
									.registerTypeAdapter(GeneralPath.class, new Pather())
									.create();
	
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

	//requires that m > 0
	public static final int modulo(int x, int m) {
		if(m < 0) {
			throw new RuntimeException("m must be > 0");
		}
		int y = x % m;
		if(y >= 0) return y;
		return y + m;
	}
	
	public static HashMap<String, String> parseQuery(String query) {
		HashMap<String, String> queryMap = new HashMap<String, String>();
		if(query == null) return queryMap;
		String[] pairs = query.split("&");
		for(String pair : pairs) {
			String[] key_value = pair.split("=");
			if(key_value.length == 1)
				queryMap.put(key_value[0], null);
			else
				queryMap.put(key_value[0], key_value[1]);
		}
		return queryMap;
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

	public static String exceptionToString(Exception e) {
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
	
	public static void sendJSON(HttpExchange t, String json, String callback) {
		t.getResponseHeaders().set("Content-Type", "application/json");
		if(callback != null) {
			json = callback + "(" + json + ")";
		}
		sendText(t, json);
	}
	
	public static void jsonError(HttpExchange t, String error, String callback) {
		HashMap<String, String> json = new HashMap<String, String>();
		json.put("error", error);
		sendJSON(t, GSON.toJson(json), callback);
	}
	
	public static void sendBytes(HttpExchange t, ByteArrayOutputStream bytes) {
		try {
			t.sendResponseHeaders(200, bytes.size());
			bytes.writeTo(t.getResponseBody());
		} catch (IOException e) {
			e.printStackTrace();
		} finally {
			try {
				t.getResponseBody().close();
			} catch (IOException e) {
				e.printStackTrace();
			}
		}
	}
	
	public static void sendBytes(HttpExchange t, byte[] bytes) {
		try {
			t.sendResponseHeaders(200, bytes.length);
			t.getResponseBody().write(bytes);
		} catch (IOException e) {
			e.printStackTrace();
		} finally {
			try {
				t.getResponseBody().close();
			} catch (IOException e) {
				e.printStackTrace();
			}
		}
	}
	
	public static void sendText(HttpExchange t, String text) {
		sendBytes(t, text.getBytes()); //TODO - encoding charset?
	}
}
