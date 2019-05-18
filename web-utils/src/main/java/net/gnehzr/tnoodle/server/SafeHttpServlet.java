package net.gnehzr.tnoodle.server;

import static net.gnehzr.tnoodle.utils.GwtSafeUtils.azzert;
import static net.gnehzr.tnoodle.utils.GsonUtils.GSON;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.*;
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import net.gnehzr.tnoodle.utils.Utils;
import net.gnehzr.tnoodle.utils.GwtSafeUtils;

import org.markdownj.MarkdownProcessor;

@SuppressWarnings("serial")
public abstract class SafeHttpServlet extends HttpServlet {
    private static final Logger l = Logger.getLogger(SafeHttpServlet.class.getName());

    @Override
    protected final void service(HttpServletRequest request, HttpServletResponse response) {
        try {
            response.setHeader("Access-Control-Allow-Origin", "*"); //this allows x-domain ajax
            super.service(request, response);
        } catch (Throwable e) {
            sendError(request, response, e);
        }
    }

    public static String getCompletePath(HttpServletRequest request) {
        String path = request.getServletPath();

        if (request.getPathInfo() != null) {
            return path + request.getPathInfo();
        }

        return path;
    }

    public static String getExtension(HttpServletRequest request) {
        String[] filenameExt = GwtSafeUtils.parseExtension(getCompletePath(request));

        return filenameExt[1];
    }

    public static String[] parsePath(String pathInfo) {
        return pathInfo != null ? pathInfo.substring(1).split("/") : new String[0];
    }

    public static HashMap<String, String> parseQuery(String query) {
        return Utils.parseQuery(query);
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

        if (callback != null) {
            json = callback + "(" + json + ")";
        }

        sendBytes(request, response, json.getBytes(), "application/json"); //TODO - charset?
    }

    protected static void sendError(HttpServletRequest request, HttpServletResponse response, Throwable error) {
        sendError(request, response, Utils.throwableToString(error));
    }

    protected static void sendError(HttpServletRequest request, HttpServletResponse response, String error) {
        response.setStatus(500);

        String extension = getExtension(request);
        if ("json".equals(extension)) {
            HashMap<String, String> json = new HashMap<>();
            json.put("error", error);
            sendJSON(request, response, GSON.toJson(json));
        } else {
            sendText(request, response, error);
        }
    }

    protected static void sendBytes(HttpServletRequest request, HttpServletResponse response, ByteArrayOutputStream bytes, String contentType) {
        try {
            response.setContentType(contentType);
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
            response.setContentType(contentType);
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

    private static final MarkdownProcessor MP = new MarkdownProcessor();

    private static String markdownToHTML(String dataString) {
        String titleCode = "";
        // We assume that a title line is the first line, starts with one #, and possibly ends with one #
        if (dataString.startsWith("#")) {
            String title = new Scanner(dataString).nextLine();
            title = title.substring(1);
            if (title.endsWith("#")) {
                title = title.substring(0, title.length() - 1);
            }
            title = title.trim();
            titleCode = "<title>" + title + "</title>\n";
        }

        return "<html><head>\n" +
            titleCode +
            "<link href=\"/css/markdown.css\" rel=\"stylesheet\" type=\"text/css\" />\n" +
            "</head>\n<body>\n" + MP.markdown(dataString) + "</body>\n</html>\n";
    }

    protected static void sendMarkdown(HttpServletRequest request, HttpServletResponse response, String markdown) {
        sendHtml(request, response, markdownToHTML(markdown).getBytes());
    }

}
