package net.gnehzr.tnoodle.servers.scrambleserver;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.PrintStream;
import java.util.HashMap;

import com.google.gson.Gson;
import com.sun.net.httpserver.HttpExchange;

@SuppressWarnings("restriction")
public final class ScrambleUtils {
	public static final Gson GSON = new Gson();
	
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

	public static String colorToString(Color c) {
		if(c == null)
			return "";
		return padWith0s(Integer.toHexString(c.getRGB() & 0xffffff));
	}

	private static String padWith0s(String s) {
		int pad = 6 - s.length();
		if(pad > 0) {
			for(int i = 0; i < pad; i++)
				s = "0" + s;
		}
		return s;
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
