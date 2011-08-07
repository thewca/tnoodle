package serverPlugins;

import java.io.IOException;
import java.util.HashMap;

import com.sun.net.httpserver.HttpExchange;

import net.gnehzr.tnoodle.server.SafeHttpHandler;
import net.gnehzr.tnoodle.server.TNoodleServer;

public class DeathHandler extends SafeHttpHandler {
	protected void wrappedHandle(HttpExchange t, String path[], HashMap<String, String> query) throws IOException {
		if(path.length == 2 && path[1].equals("now")) {
			// If localhost makes a request to
			// http://localhost:PORT/kill/now
			// that's enough for us to commit honorable suicide.
			String remote = t.getRemoteAddress().getAddress().getHostAddress();
			System.out.print("Asked to kill myself by " + remote + "...");
			if(remote.equals("127.0.0.1")) {
				// Only kill ourselves if someone on this machine requested it
				sendText(t, "Nice knowing ya'!");
				System.out.println("committing suicide");
				System.exit(0);
			}
			System.out.println("ignoring request");
		}
		sendText(t, TNoodleServer.NAME + "-" + TNoodleServer.VERSION);
	}
}
	