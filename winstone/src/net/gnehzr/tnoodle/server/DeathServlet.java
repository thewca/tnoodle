package net.gnehzr.tnoodle.server;

import java.net.InetAddress;
import java.util.LinkedHashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import net.gnehzr.tnoodle.server.SafeHttpServlet;


@SuppressWarnings("serial")
public class DeathServlet extends SafeHttpServlet {

	@Override
	protected void wrappedService(HttpServletRequest request,
			HttpServletResponse response, String[] path,
			LinkedHashMap<String, String> query) throws Exception {

		if(path.length == 1 && path[0].equals("now")) {
			// If localhost makes a request to
			// http://localhost:PORT/kill/now
			// that's enough for us to commit honorable suicide.
			InetAddress remote = InetAddress.getByName(request.getRemoteAddr());
			System.out.print("Asked to kill myself by " + remote + "...");
			if(remote.isLoopbackAddress()) {
				// Only kill ourselves if someone on this machine requested it
				sendText(request, response, "Nice knowing ya'!");
				System.out.println("committing suicide");
				System.exit(0);
			}
			System.out.println("ignoring request");
		}
		sendText(request, response, TNoodleServer.NAME + "-" + TNoodleServer.VERSION);
	}

}
