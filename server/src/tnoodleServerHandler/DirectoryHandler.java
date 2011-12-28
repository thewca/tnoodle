package tnoodleServerHandler;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.LinkedHashMap;

import javax.activation.MimetypesFileTypeMap;

import net.gnehzr.tnoodle.server.SafeHttpHandler;
import net.gnehzr.tnoodle.utils.Utils;

import com.petebevin.markdown.MarkdownProcessor;
import com.sun.net.httpserver.HttpExchange;

public class DirectoryHandler extends SafeHttpHandler {
	private static final String PLUGIN_DIRECTORY = DirectoryHandler.class.getPackage().getName();
	private static final MarkdownProcessor mp = new MarkdownProcessor();
	
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
	
	private String path;
	public DirectoryHandler(String path) {
		if(path.endsWith("/")) {
			path = path.substring(0, path.length() - 1);
		}
		this.path = path;
	}
	
	// TODO - this would probably benefit from caching 
	protected void wrappedHandle(HttpExchange t, String[] requestPath, LinkedHashMap<String, String> query) throws IOException {
		File f = new File(Utils.getResourceDirectory(), PLUGIN_DIRECTORY + "/" + path + "/" + Utils.join(requestPath, "/"));
		if(!f.exists()) {
			send404(t, f.getAbsolutePath());
		}
		if(f.isDirectory()) {
			File directory = f;
			if(!t.getRequestURI().getPath().endsWith("/")) {
				sendTrailingSlashRedirect(t);
				return;
			}
			f = new File(f, "index.html");
			if(!f.exists()) {
				String[] fileNames = directory.list();
				sendText(t, Utils.join(fileNames, "\n"));
				return;
			}
		}

		InputStream is = new FileInputStream(f);
		ByteArrayOutputStream bytes = new ByteArrayOutputStream();
		Utils.fullyReadInputStream(is, bytes);
		String fileName = f.getName();
		if(fileName.endsWith(".md")) {
			String html = mp.markdown(bytes.toString());
			sendHtml(t, html.getBytes());
		} else {
			String contentType = mimes.getContentType(fileName);
			sendBytes(t, bytes, contentType);
		}
	}
}
