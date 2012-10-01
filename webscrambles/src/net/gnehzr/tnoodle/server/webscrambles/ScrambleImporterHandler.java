package net.gnehzr.tnoodle.server.webscrambles;

import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStreamWriter;
import java.net.URL;
import java.net.URLConnection;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import net.gnehzr.tnoodle.server.SafeHttpServlet;
import net.gnehzr.tnoodle.utils.Utils;

@SuppressWarnings("serial")
public class ScrambleImporterHandler extends SafeHttpServlet {
	private final Pattern BOUNDARY_PATTERN = Pattern.compile("^.+boundary\\=(.+)$");

	@Override
	protected void wrappedService(HttpServletRequest request, HttpServletResponse response, String[] path, LinkedHashMap<String, String> query) throws IOException {
		if(request.getMethod().toLowerCase().equals("post")) {
			// TODO look into http://commons.apache.org/fileupload/using.html
			// we assume a POST means we're uploading a file
			// the following isn't terribly robust, but it should work for us
			String boundary = request.getContentType();
			Matcher m = BOUNDARY_PATTERN.matcher(boundary);
			m.matches();
			boundary = "--" + m.group(1);
	
			BufferedReader in = new BufferedReader(new InputStreamReader(request.getInputStream()));
			ArrayList<String> scrambles = new ArrayList<String>();
			String line;
			boolean finishedHeaders = false;
			while((line = in.readLine()) != null) {
				if(line.equals(boundary + "--")) {
					break;
				}
				if(finishedHeaders) {
					scrambles.add(line);
				}
				if(line.isEmpty()) { //this indicates a CRLF CRLF
					finishedHeaders = true;
				}
			}
			//we need to escape our backslashes
			String json = Utils.GSON.toJson(scrambles).replaceAll("\\\\", Matcher.quoteReplacement("\\\\"));
			ByteArrayOutputStream bytes = new ByteArrayOutputStream();
			BufferedWriter html = new BufferedWriter(new OutputStreamWriter(bytes));
			html.append("<html><body><script>parent.postMessage('");
			html.append(json);
			html.append("', '*');</script></html>");
			html.close();
			sendHtml(request, response, bytes);
		} else {
			String urlStr = query.get("url");
			if(!urlStr.startsWith("http")) { //might as well give it our best shot
				urlStr = "http://" + urlStr;
			}
			URL url = new URL(urlStr);
			URLConnection conn = url.openConnection();
			ArrayList<String> scrambles = new ArrayList<String>();
			BufferedReader in = new BufferedReader(new InputStreamReader(conn.getInputStream()));
			String line;
			while((line = in.readLine()) != null) {
				scrambles.add(line);
			}
			sendJSON(request, response, Utils.GSON.toJson(scrambles));
		}
	}

}
