package net.gnehzr.cct.scrambles;

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
	
	public static Color toColor(String s) {
		try {
			if(s.startsWith("#"))
				s = s.substring(1);
			if(s.length() != 6)
				return null;
			return new Color(Integer.parseInt(s, 16));
		} catch(Exception e) {
			return null;
		}
	}

	public static String join(Object[] arr, String sep) {
		StringBuilder s = new StringBuilder();
		for(Object o : arr)
			s.append(sep + o.toString());
		return s.substring(sep.length());
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
	
	public static void sendText(HttpExchange t, String text) {
		try {
			t.sendResponseHeaders(200, text.length());
			t.getResponseBody().write(text.getBytes());
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
}
