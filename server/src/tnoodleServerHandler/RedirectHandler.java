package tnoodleServerHandler;

import java.io.IOException;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.LinkedHashMap;

import com.sun.net.httpserver.HttpExchange;

import net.gnehzr.tnoodle.server.SafeHttpHandler;
import net.gnehzr.tnoodle.utils.Utils;

public class RedirectHandler extends SafeHttpHandler {
	private String destinationPath;
	public RedirectHandler(String destinationPath) {
		this.destinationPath = destinationPath;
	}

	protected void wrappedHandle(HttpExchange t, String[] requestPath, LinkedHashMap<String, String> query) throws IOException, URISyntaxException {
		if(requestPath.length != 1 || !requestPath[0].isEmpty()) {
			send404(t, "[" + Utils.join(requestPath, ",") + "]");
			return;
		}
		URI request = t.getRequestURI();
		URI destination = new URI(request.getScheme(), 
			request.getUserInfo(), 
			request.getHost(), 
			request.getPort(), 
			destinationPath,
			request.getQuery(),
			request.getFragment());
		send30N(1, t, destination);
	}
}
