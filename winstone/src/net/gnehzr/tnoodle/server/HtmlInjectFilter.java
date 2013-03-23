package net.gnehzr.tnoodle.server;

import java.io.DataInputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.OutputStream;

import javax.servlet.Filter;
import javax.servlet.FilterChain;
import javax.servlet.FilterConfig;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.HttpServletResponse;

public class HtmlInjectFilter implements Filter {
	private static final String HTML_CONTENT_TYPE = "text/html";
	
	private static String tailHeadInject = null;
	private static String headHeadInject = null;
	public static void setHeadInjectFile(File injectCodeFile) throws IOException {
		DataInputStream in = new DataInputStream(new FileInputStream(injectCodeFile));
		byte[] b = new byte[(int) injectCodeFile.length()];
		in.readFully(b);
		in.close();
		tailHeadInject = new String(b);
	}

	@Override
	public void init(FilterConfig filterConfig) throws ServletException {}

	@Override
	public void destroy() {}

	@Override
	public void doFilter(ServletRequest request, ServletResponse response,
			FilterChain chain) throws IOException, ServletException {
		if(tailHeadInject == null) {
			chain.doFilter(request, response);
			return;
		}

		OutputStream out = response.getOutputStream();
		GenericResponseWrapper wrapper = new GenericResponseWrapper((HttpServletResponse) response);
		chain.doFilter(request, wrapper);
		byte[] data;
		if(HTML_CONTENT_TYPE.equals(wrapper.getContentType())) {
			StringBuilder html = new StringBuilder(new String(wrapper.getData()));
			int openingHeadIndex = html.indexOf("<head>");
			int closingHeadIndex = html.indexOf("</head>");
			String openingHead = "<head>\n";
			String closingHead = "</head>\n";
			if(openingHeadIndex < 0 || closingHeadIndex < 0) {
				// If there is no <head>...</head> tag, we conjure up one of our own.
				int closingHtmlIndex = html.indexOf("</html>");
				if(closingHtmlIndex < 0) {
					closingHtmlIndex = html.length();
					html.append("</html>\n");
				}
				html.insert(closingHtmlIndex, openingHead + closingHead);
				openingHeadIndex = closingHtmlIndex;
				closingHeadIndex = closingHtmlIndex + openingHead.length();
			}

			// To avoid screwing up indices, we inject at the bottom first
			if(tailHeadInject != null) {
				html.insert(closingHeadIndex, tailHeadInject);
			}
			
			if(headHeadInject != null) {
				int headStart = openingHeadIndex + openingHead.length();
				html.insert(headStart, headHeadInject);
			}
			
			data = html.toString().getBytes();
		} else {
			data = wrapper.getData();
		}
		response.setContentLength(data.length);
		out.write(data);
	}
}
