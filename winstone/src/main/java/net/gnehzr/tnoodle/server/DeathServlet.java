package net.gnehzr.tnoodle.server;

import java.io.IOException;
import java.net.InetAddress;

import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@SuppressWarnings("serial")
@WebServlet(name = "DeathServlet", urlPatterns = {"/kill/*"})
public class DeathServlet extends SafeHttpServlet {
    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        String[] path = parsePath(req.getPathInfo());

        if (path.length == 1 && path[0].equals("now")) {
            // If localhost makes a request to
            // http://localhost:PORT/kill/now
            // that's enough for us to commit honorable suicide.
            InetAddress remote = InetAddress.getByName(req.getRemoteAddr());
            System.out.println("Asked to kill myself by " + remote + "…");

            if (remote.isLoopbackAddress()) {
                // Only kill ourselves if someone on this machine requested it
                sendText(req, resp, "Nice knowing ya'!");

                System.out.println("committing suicide");
                System.exit(0);
            }

            System.out.println("ignoring request");
        }

        sendText(req, resp, TNoodleServer.NAME + "-" + TNoodleServer.VERSION);
    }
}
