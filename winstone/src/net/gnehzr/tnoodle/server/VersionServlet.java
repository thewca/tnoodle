package net.gnehzr.tnoodle.server;

import static net.gnehzr.tnoodle.utils.Utils.GSON;
import static net.gnehzr.tnoodle.utils.GwtSafeUtils.azzert;

import net.gnehzr.tnoodle.utils.Utils;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.URL;
import java.net.SocketException;
import java.net.UnknownHostException;

import java.util.HashMap;
import java.util.LinkedHashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;


@SuppressWarnings("serial")
public class VersionServlet extends SafeHttpServlet {
    private static final String API_VERSION = "0";
    private static final String BASE_URL = "https://www.worldcubeassociation.org/api/v" + API_VERSION + "/scramble-program";

    @Override
    protected void wrappedService(HttpServletRequest request,
            HttpServletResponse response, String[] path,
            LinkedHashMap<String, String> query) throws Exception {
        BufferedReader reader = null;
        try {
            URL url = new URL(BASE_URL);
            reader = new BufferedReader(new InputStreamReader(url.openStream()));
            HashMap<String, Object> json = GSON.fromJson(reader, HashMap.class);
            String runningVersionKey = "running_version";
            azzert(!json.containsKey(runningVersionKey));
            json.put(runningVersionKey, TNoodleServer.NAME + "-" + TNoodleServer.VERSION);
            sendJSON(request, response, GSON.toJson(json));
        } catch(SocketException e) {
            HashMap<String, Object> json = new HashMap<String, Object>();
            json.put("ignorableError", Utils.throwableToString(e));
            sendJSON(request, response, GSON.toJson(json));
        } catch(UnknownHostException e) {
            HashMap<String, Object> json = new HashMap<String, Object>();
            json.put("ignorableError", Utils.throwableToString(e));
            sendJSON(request, response, GSON.toJson(json));
        } finally {
            if(reader != null) {
                reader.close();
            }
        }
    }

}
