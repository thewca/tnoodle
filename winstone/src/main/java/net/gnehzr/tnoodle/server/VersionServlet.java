package net.gnehzr.tnoodle.server;

import static net.gnehzr.tnoodle.utils.GsonUtils.GSON;
import static net.gnehzr.tnoodle.utils.GwtSafeUtils.azzert;

import net.gnehzr.tnoodle.utils.Utils;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.URL;
import java.net.SocketException;
import java.net.UnknownHostException;

import java.util.HashMap;

import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@SuppressWarnings("serial")
@WebServlet(name = "VersionServlet", urlPatterns = {"/version.json"})
public class VersionServlet extends SafeHttpServlet {
    private static final String API_VERSION = "0";
    private static final String BASE_URL = "https://www.worldcubeassociation.org/api/v" + API_VERSION + "/scramble-program";

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        try(BufferedReader reader = new BufferedReader(new InputStreamReader((new URL(BASE_URL).openStream())))) {
            HashMap<String, Object> json = GSON.fromJson(reader, HashMap.class);

            String runningVersionKey = "running_version";
            azzert(!json.containsKey(runningVersionKey));

            json.put(runningVersionKey, TNoodleServer.NAME + "-" + TNoodleServer.VERSION);

            sendJSON(req, resp, GSON.toJson(json));
        } catch (SocketException | UnknownHostException e) {
            HashMap<String, Object> json = new HashMap<>();
            json.put("ignorableError", Utils.throwableToString(e));

            sendJSON(req, resp, GSON.toJson(json));
        }
    }
}
