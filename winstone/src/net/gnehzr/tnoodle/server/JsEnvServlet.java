package net.gnehzr.tnoodle.server;

import static net.gnehzr.tnoodle.utils.GwtSafeUtils.azzert;
import static net.gnehzr.tnoodle.utils.GsonUtils.GSON;

import java.util.HashMap;
import java.util.LinkedHashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@SuppressWarnings("serial")
public class JsEnvServlet extends SafeHttpServlet {
    
    private static HashMap<String, String> jsEnv = new HashMap<String, String>();
    public static void putJsEnv(String key, String value) {
        jsEnv.put(key, value);
    }

    @Override
    protected void wrappedService(HttpServletRequest request,
            HttpServletResponse response, String[] path,
            LinkedHashMap<String, String> query) throws Exception {
        String extension = SafeHttpServlet.getExtension(request);
        if(extension.equals("js")) {
            String js = "window.TNOODLE_ENV = " + GSON.toJson(jsEnv) + ";";
            sendJS(request, response, js);
        } else if(extension.equals("json")) {
            sendJSON(request, response, GSON.toJson(jsEnv));
        } else {
            azzert(false);
        }
    }

}
