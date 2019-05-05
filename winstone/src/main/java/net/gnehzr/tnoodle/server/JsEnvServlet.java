package net.gnehzr.tnoodle.server;

import static net.gnehzr.tnoodle.utils.GwtSafeUtils.azzert;
import static net.gnehzr.tnoodle.utils.GsonUtils.GSON;

import java.io.IOException;
import java.util.HashMap;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@SuppressWarnings("serial")
@WebServlet(name = "JsEnvServlet", urlPatterns = {"/env.js", "/env.json"})
public class JsEnvServlet extends SafeHttpServlet {
    private static HashMap<String, String> jsEnv = new HashMap<>();

    public static void putJsEnv(String key, String value) {
        jsEnv.put(key, value);
    }

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        String extension = SafeHttpServlet.getExtension(req);

        if(extension.equals("js")) {
            String js = "window.TNOODLE_ENV = " + GSON.toJson(jsEnv) + ";";
            sendJS(req, resp, js);
        } else if(extension.equals("json")) {
            sendJSON(req, resp, GSON.toJson(jsEnv));
        } else {
            azzert(false);
        }
    }
}
