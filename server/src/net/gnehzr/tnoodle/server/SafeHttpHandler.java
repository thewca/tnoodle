package net.gnehzr.tnoodle.server;

import static net.gnehzr.tnoodle.utils.Utils.GSON;
import static net.gnehzr.tnoodle.utils.Utils.throwableToString;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.net.URI;
import java.net.URISyntaxException;
import java.net.URLDecoder;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.logging.Level;
import java.util.logging.Logger;

import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import static net.gnehzr.tnoodle.utils.Utils.azzert;

public abstract class SafeHttpHandler implements HttpHandler {
	private static final Logger l = Logger.getLogger(SafeHttpHandler.class.getName());
	
	@Override
	public final void handle(HttpExchange t) throws IOException {
		LinkedHashMap<String, String> query = null;
		String[] path = null;
		try {
			query = parseQuery(t.getRequestURI().getRawQuery());
			// substring(1) gets rid of the leading /
			path = t.getRequestURI().getPath().substring(1).split("/");
			wrappedHandle(t, path, query);
		} catch(Throwable e) {
			if(path != null && path[path.length-1].endsWith(".json")) {
				azzert(query != null);
				jsonError(t, e, query.get("callback"));
			} else {
				textError(t, e);
			}
		}
	}
	
	protected abstract void wrappedHandle(HttpExchange t, String[] path, LinkedHashMap<String, String> query) throws Exception;

	public static LinkedHashMap<String, String> parseQuery(String query) {
		LinkedHashMap<String, String> queryMap = new LinkedHashMap<String, String>();
		if(query == null) return queryMap;
		String[] pairs = query.split("&");
		for(String pair : pairs) {
			String[] key_value = pair.split("=");
			if(key_value.length == 1) {
				queryMap.put(key_value[0], ""); // this allows for flags such as http://foo/blah?kill&burn
			} else {
				try {
					queryMap.put(key_value[0], URLDecoder.decode(key_value[1], "utf-8"));
				} catch (UnsupportedEncodingException e) {
					queryMap.put(key_value[0], key_value[1]); //worst case, just put the undecoded string
				}
			}
		}
		return queryMap;
	}

	protected static void sendJSON(HttpExchange t, String json, String callback) {
		t.getResponseHeaders().set("Access-Control-Allow-Origin", "*"); //this allows x-domain ajax
		if(callback != null) {
			json = callback + "(" + json + ")";
		}
		sendBytes(t, json.getBytes(), "application/json"); //TODO - charset?
	}
	
	protected static void sendJSONError(HttpExchange t, String error, String callback) {
		HashMap<String, String> json = new HashMap<String, String>();
		json.put("error", error);
		sendJSON(t, GSON.toJson(json), callback);
	}
	
	protected static void textError(HttpExchange t, Throwable error) {
		sendText(t, throwableToString(error));
	}
	
	protected static void jsonError(HttpExchange t, Throwable error, String callback) {
		sendJSONError(t, throwableToString(error), callback);
	}
	
	protected static void sendBytes(HttpExchange t, ByteArrayOutputStream bytes, String contentType) {
		try {
			t.getResponseHeaders().set("Content-Type", contentType);
			t.sendResponseHeaders(200, bytes.size());
			bytes.writeTo(t.getResponseBody());
		} catch (IOException e) {
			// This happens whenever the client closes the connection before we
			// got a chance to respond. No reason to freak out.
			l.log(Level.INFO, "", e);
		} finally {
			try {
				t.getResponseBody().close();
			} catch (IOException e) {
				l.log(Level.INFO, "", e);
			}
		}
	}
	
	protected static void sendBytes(HttpExchange t, byte[] bytes, String contentType) {
		try {
			t.getResponseHeaders().set("Content-Type", contentType);
			t.sendResponseHeaders(200, bytes.length);
			t.getResponseBody().write(bytes);
		} catch (IOException e) {
			// This happens whenever the client closes the connection before we
			// got a chance to respond. No reason to freak out.
			l.log(Level.INFO, "", e);
		} finally {
			try {
				t.getResponseBody().close();
			} catch (IOException e) {
				l.log(Level.INFO, "", e);
			}
		}
	}
	
	protected static void sendTrailingSlashRedirect(HttpExchange t) throws URISyntaxException {
		URI request = t.getRequestURI();
		//URI(String scheme, String userInfo, String host, int port, String path, String query, String fragment) 
		URI dest = new URI(request.getScheme(), 
			request.getUserInfo(), 
			request.getHost(), 
			request.getPort(), 
			request.getPath()+"/", 
			request.getQuery(),
			request.getFragment());
		send302(t, dest);
	}
	
	protected static void send30N(int n, HttpExchange t, URI destination) {
		azzert(n >= 0);
		azzert(n < 10);
		try {
			String dest = destination == null ? dest = "" : destination.toString();
			byte[] bytes = ("Sorry, try going here instead " + dest).getBytes();
			t.getResponseHeaders().set("Content-Type", "text/plain");
			t.getResponseHeaders().set("Location", destination.toString());
			t.sendResponseHeaders(300 + n, bytes.length);
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
	protected static void send302(HttpExchange t, URI destination) {
		send30N(2, t, destination);
	}
	protected static void send404(HttpExchange t, String fileName) {
		try {
			byte[] bytes = ("404! Could not find "+fileName).getBytes();
			t.getResponseHeaders().set("Content-Type", "text/plain");
			t.sendResponseHeaders(404, bytes.length);
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
	
	protected static void sendHtml(HttpExchange t, ByteArrayOutputStream bytes) {
		sendBytes(t, bytes, "text/html");
	}
	protected static void sendHtml(HttpExchange t, byte[] bytes) {
		sendBytes(t, bytes, "text/html");
	}
	
	protected static void sendText(HttpExchange t, String text) {
		sendBytes(t, text.getBytes(), "text/plain"); //TODO - encoding charset?
	}

}
