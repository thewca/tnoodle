package net.gnehzr.tnoodle.server;

import java.io.OutputStream;
import java.util.LinkedHashMap;
import java.util.Scanner;

import javax.servlet.RequestDispatcher;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.petebevin.markdown.MarkdownProcessor;

@SuppressWarnings("serial")
public class MarkdownServlet extends SafeHttpServlet {
	private static final MarkdownProcessor mp = new MarkdownProcessor();

	@Override
	protected void wrappedService(HttpServletRequest request,
			HttpServletResponse response, String[] path,
			LinkedHashMap<String, String> query) throws Exception {
		RequestDispatcher rd = getServletContext().getNamedDispatcher("default");

		GenericResponseWrapper wrapper = new GenericResponseWrapper(response);
		rd.include(request, wrapper);
		byte[] data = wrapper.getData();
		if(data.length == 0) {
			// We can't distinguish between an empty file, and a 404. This is
			// because WinstonseResponse only actually sets an error code if
			// isIncluding == false.

			response.sendError(HttpServletResponse.SC_NOT_FOUND, "File " + request.getRequestURI() + " not found");
			return;
		}
		byte[] markdown = markdownToHTML(data).getBytes();
		response.setContentType("text/html");
		response.setContentLength(markdown.length);
		OutputStream out = response.getOutputStream();
		out.write(markdown);
	}

	private String markdownToHTML(byte[] dataString) {
		return markdownToHTML(new String(dataString));
	}
	private String markdownToHTML(String dataString) {
		String titleCode = "";
		// We assume that a title line is the first line, starts with one #, and possibly ends with one #
		if (dataString.startsWith("#")) {
			String title = new Scanner(dataString).nextLine();
			title = title.substring(1);
			if (title.endsWith("#")) {
				title = title.substring(0, title.length()-1);
			}
			title = title.trim();
			titleCode = "<title>" + title + "</title>\n";
		}

		return "<html><head>\n" +
			titleCode +
			"<link href=\"/css/markdown.css\" rel=\"stylesheet\" type=\"text/css\" />\n" +
			"</head>\n<body>\n" + mp.markdown(dataString) + "</body>\n</html>\n";
	}

}
