package tnoodleServerHandler.webscrambles;

import static net.gnehzr.tnoodle.utils.Utils.GSON;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.lang.reflect.InvocationTargetException;
import java.net.URISyntaxException;
import java.util.Date;
import java.util.LinkedHashMap;

import net.gnehzr.tnoodle.server.SafeHttpHandler;
import tnoodleServerHandler.FileHandler;

import com.itextpdf.text.DocumentException;
import com.sun.net.httpserver.HttpExchange;

import net.lingala.zip4j.exception.ZipException;

public class ScrambleHandler extends SafeHttpHandler {
	// TODO - there has to be a better way of getting the benefit of a FileHandler...
	private FileHandler wcaScramblerHandler = new FileHandler("webscrambles/interface/scramblegen.html") {
		protected void wrappedHandle(HttpExchange t, String[] requestPath, java.util.LinkedHashMap<String,String> query) throws IOException, URISyntaxException {
			super.wrappedHandle(t, new String[0], query);
		};
	};

	public ScrambleHandler() {}
	
	protected void wrappedHandle(HttpExchange t, String[] path, LinkedHashMap<String, String> query) throws IllegalArgumentException, SecurityException, InstantiationException, IllegalAccessException, InvocationTargetException, ClassNotFoundException, NoSuchMethodException, DocumentException, InvalidScrambleRequestException, IOException, ZipException {
		if(path.length == 0) {
			wcaScramblerHandler.handle(t);
		} else {
			Date generationDate = new Date();

			// TODO - this means you can't have a round named "seed" or "showIndices" or "callback"!
			String seed = query.remove("seed");
			boolean showIndices = query.remove("showIndices") != null;
			String callback = query.remove("callback");
			
			String globalTitle, ext;
			int lastDot = path[0].lastIndexOf(".");
			if(lastDot < 0) {
				throw new InvalidScrambleRequestException("No extension specified");
			}
			globalTitle = path[0].substring(0, lastDot);
			ext = path[0].substring(lastDot+1);
			
			if(ext == null || ext.equals("txt")) {
				// Note that we parse the scramble requests *after* checking the extension.
				// This way, someone who makes a request for "/scramble/foo.bar" will get a warning about 
				// the ".bar" extension, rather than incorrect scramble requests.
				ScrambleRequest[] scrambleRequests = ScrambleRequest.parseScrambleRequests(query, seed);
				
				StringBuilder sb = new StringBuilder();
				for(ScrambleRequest scrambleRequest : scrambleRequests) {
					for(int j = 0; j < scrambleRequest.copies; j++) {
						for(int i = 0; i < scrambleRequest.scrambles.length; i++) {
							String scramble = scrambleRequest.scrambles[i];
							if(showIndices) {
								sb.append((i+1)).append(". ");
							}
							// We replace newlines with spaces
							sb.append(scramble.replaceAll("\n", " "));
							sb.append("\r\n");
						}
					}
				}
				sendText(t, sb.toString());
			} else if(ext.equals("json")) {
				ScrambleRequest[] scrambleRequests = ScrambleRequest.parseScrambleRequests(query, seed);
				sendJSON(t, GSON.toJson(scrambleRequests), callback);
			} else if(ext.equals("pdf")) {
				ScrambleRequest[] scrambleRequests = ScrambleRequest.parseScrambleRequests(query, seed);
				ByteArrayOutputStream totalPdfOutput = ScrambleRequest.requestsToPdf(globalTitle, generationDate, scrambleRequests);
				t.getResponseHeaders().set("Content-Disposition", "inline");
				sendBytes(t, totalPdfOutput, "application/pdf");
			} else if(ext.equals("zip")) {
				ScrambleRequest[] scrambleRequests = ScrambleRequest.parseScrambleRequests(query, seed);
				ByteArrayOutputStream baosZip = ScrambleRequest.requestsToZip(globalTitle, generationDate, scrambleRequests, seed);
				sendBytes(t, baosZip, "application/zip");
			} else if(ext.equals("html")) {
				wcaScramblerHandler.handle(t);
			} else {
				throw new InvalidScrambleRequestException("Invalid extension: " + ext);
			}
		}
	}
}
