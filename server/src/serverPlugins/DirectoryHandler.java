package serverPlugins;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.LinkedHashMap;

import javax.activation.MimetypesFileTypeMap;

import net.gnehzr.tnoodle.server.SafeHttpHandler;
import net.gnehzr.tnoodle.utils.Utils;

import com.sun.net.httpserver.HttpExchange;

public class DirectoryHandler extends SafeHttpHandler {
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
	
	public DirectoryHandler(String path) {
		this(path, true);
	}
	
	private String path;
	private boolean isDirectory;
	protected DirectoryHandler(String path, boolean isDirectory) {
		if(path.endsWith("/")) {
			path = path.substring(0, path.length() - 1);
		}
		this.path = path;
		this.isDirectory = isDirectory;
	}
	
	// TODO - this would probably benefit from caching 
	protected void wrappedHandle(HttpExchange t, String[] requestPath, LinkedHashMap<String, String> query) throws IOException {
		String filePath = Utils.join(requestPath, "/");
		String resource;
		if(isDirectory) {
			resource = "/serverPlugins" + "/" + path + "/" + filePath;
			if(t.getRequestURI().getPath().endsWith("/")) {
				filePath += "index.html";
				resource += "index.html";
			} else {
				// It's impossible to check if a URI (what getResource() returns) is a directory,
				// so we rely upon appending /index.html and checking if that path exists. If it does,
				// we redirect the browser to the given path with a trailing / appended.
				String trailingIndex = resource;
				if(!trailingIndex.endsWith("/")) {
					// Resources containing "//" don't work when we're inside of a jar file.
					trailingIndex += "/";
				}
				trailingIndex += "index.html";
				boolean isDir = getClass().getResource(trailingIndex) != null;
				if(isDir) {
					sendTrailingSlashRedirect(t);
					return;
				}
			}
		} else {
			resource = "/serverPlugins" + "/" + path;
		}
		InputStream is = getClass().getResourceAsStream(resource);
		if(is == null) {
			send404(t, filePath + " as " + resource);
			return;
		}
		ByteArrayOutputStream bytes = new ByteArrayOutputStream();
		Utils.fullyReadInputStream(is, bytes);
		String contentType = mimes.getContentType(resource);
		sendBytes(t, bytes, contentType);
	}
}
