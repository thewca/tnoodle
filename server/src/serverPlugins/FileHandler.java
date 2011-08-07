package serverPlugins;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.HashMap;

import javax.activation.MimetypesFileTypeMap;

import net.gnehzr.tnoodle.server.SafeHttpHandler;
import net.gnehzr.tnoodle.utils.Utils;

import com.sun.net.httpserver.HttpExchange;

public class FileHandler extends SafeHttpHandler {
	private static MimetypesFileTypeMap mimes = new MimetypesFileTypeMap();
	static {
		mimes.addMimeTypes("text/css css");
		mimes.addMimeTypes("text/html html htm");
		mimes.addMimeTypes("text/plain txt");
		
		mimes.addMimeTypes("image/png png");
		mimes.addMimeTypes("image/gif gif");
		mimes.addMimeTypes("image/vnd.microsoft.icon ico");
		
		mimes.addMimeTypes("application/x-font-ttf ttf");
		
		mimes.addMimeTypes("application/x-javascript js");
		mimes.addMimeTypes("application/json json");
		mimes.addMimeTypes("application/octet-stream *");
	}
	
	private String directory;
	public FileHandler(String directory) {
		if(directory.endsWith("/")) {
			directory = directory.substring(0, directory.length() - 1);
		}
		this.directory = directory;
	}
	
	protected void wrappedHandle(HttpExchange t, String[] path, HashMap<String, String> query) throws IOException {
		ByteArrayOutputStream bytes = new ByteArrayOutputStream();
		String fileName = t.getRequestURI().getPath().substring(1);
		if(fileName.isEmpty() || fileName.endsWith("/")) {
			fileName += "index.html";
		} else {
			// It's impossible to check if a URI (what getResource() returns) is a directory,
			// so we rely upon appending /index.html and checking if that path exists. If it does
			// we redirect the browser to the given path with a trailing / appended.
			boolean isDir = getClass().getResource("/" + directory + "/" + fileName + "/index.html") != null;
			if(isDir) {
				sendTrailingSlashRedirect(t);
				return;
			}
		}
		String resource = "/serverPlugins" + "/" + directory + "/" + fileName;
		InputStream is = getClass().getResourceAsStream(resource);
		if(is == null) {
			System.out.println(resource);
			send404(t, fileName);
			return;
		}
		Utils.fullyReadInputStream(is, bytes);
		sendBytes(t, bytes, mimes.getContentType(fileName));
	}
}