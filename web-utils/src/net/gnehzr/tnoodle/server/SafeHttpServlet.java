package net.gnehzr.tnoodle.server;

import static net.gnehzr.tnoodle.utils.Utils.azzert;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.net.URLDecoder;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import net.gnehzr.tnoodle.utils.Utils;

@SuppressWarnings("serial")
public abstract class SafeHttpServlet extends HttpServlet {
	private static final Logger l = Logger.getLogger(SafeHttpServlet.class.getName());

	@Override
	protected final void service(HttpServletRequest request, HttpServletResponse response)
			throws ServletException, IOException {
		LinkedHashMap<String, String> query = parseQuery(request.getQueryString());
		String pathInfo = request.getPathInfo();
		String[] path;
		if(pathInfo != null) {
			path = pathInfo.substring(1).split("/"); // skip leading /
		} else {
			path = new String[0];
		}

		try {
			wrappedService(request, response, path, query);
		} catch(Throwable e) {
			sendError(request, response, e);
		}
	}

	public static String getCompletePath(HttpServletRequest request) {
		String path = request.getServletPath();
		if(request.getPathInfo() != null) {
			path += request.getPathInfo();
		}
		return path;
	}
	
	public static String getExtension(HttpServletRequest request) {
		String[] filename_ext = Utils.parseExtension(getCompletePath(request));
		return filename_ext[1];
	}
	
	protected abstract void wrappedService(HttpServletRequest request, HttpServletResponse response, String[] path, LinkedHashMap<String, String> query) throws Exception;

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

	protected static void sendJS(HttpServletRequest request, HttpServletResponse response, String js) {
		sendBytes(request, response, js.getBytes(), "application/javascript"); //TODO - charset?
	}
	
	protected static void sendJSON(HttpServletRequest request, HttpServletResponse response, String json) {
		String callback = parseQuery(request.getQueryString()).get("callback");
		String ext = getExtension(request);

		// Here we enforce that JSON is only sent in response to URLs ending in .json.
		// This is important, because if clients were to expect to get JSON from urls not ending in
		// .json, our catch(Throwable e) {...} in handle() above will wrap up exceptions
		// as text, and we'll respond to a request that expects JSON with plaintext.
		azzert("json".equals(ext), "Attempted to respond with JSON to a url not ending in .json.");
		response.setHeader("Access-Control-Allow-Origin", "*"); //this allows x-domain ajax
		if(callback != null) {
			json = callback + "(" + json + ")";
		}
		sendBytes(request, response, json.getBytes(), "application/json"); //TODO - charset?
	}

	protected static void sendError(HttpServletRequest request, HttpServletResponse response, Throwable error) {
		sendError(request, response, Utils.throwableToString(error));
	}
	protected static void sendError(HttpServletRequest request, HttpServletResponse response, String error) {
		String extension = getExtension(request);
		if("json".equals(extension)) {
			HashMap<String, String> json = new HashMap<String, String>();
			json.put("error", error);
			sendJSON(request, response, Utils.GSON.toJson(json));
		} else {
			sendText(request, response, error);
		}
	}

	protected static void sendBytes(HttpServletRequest request, HttpServletResponse response, ByteArrayOutputStream bytes, String contentType) {
		try {
			response.setHeader("Content-Type", contentType);
			response.setContentLength(bytes.size());
			bytes.writeTo(response.getOutputStream());
		} catch (IOException e) {
			// This happens whenever the client closes the connection before we
			// got a chance to respond. No reason to freak out.
			l.log(Level.INFO, "", e);
		}
	}

	protected static void sendBytes(HttpServletRequest request, HttpServletResponse response, byte[] bytes, String contentType) {
		try {
			response.setHeader("Content-Type", contentType);
			response.setContentLength(bytes.length);
			response.getOutputStream().write(bytes);
		} catch (IOException e) {
			// This happens whenever the client closes the connection before we
			// got a chance to respond. No reason to freak out.
			l.log(Level.INFO, "", e);
		}
	}

	protected static void sendHtml(HttpServletRequest request, HttpServletResponse response, ByteArrayOutputStream bytes) {
		sendBytes(request, response, bytes, "text/html");
	}
	protected static void sendHtml(HttpServletRequest request, HttpServletResponse response, byte[] bytes) {
		sendBytes(request, response, bytes, "text/html");
	}

	protected static void sendText(HttpServletRequest request, HttpServletResponse response, String text) {
		sendBytes(request, response, text.getBytes(), "text/plain"); //TODO - encoding charset?
	}

}
