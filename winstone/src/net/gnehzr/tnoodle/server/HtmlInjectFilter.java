package net.gnehzr.tnoodle.server;

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

	private static String headInjectCode = null;
	public static void setHeadInjectCode(String newHeadInjectCode) {
		headInjectCode = newHeadInjectCode;
	}
	public static String getHeadInjectCode() {
		return headInjectCode;
	}
	

	@Override
	public void init(FilterConfig filterConfig) throws ServletException {}

	@Override
	public void destroy() {}
	
	@Override
	public void doFilter(ServletRequest request, ServletResponse response,
			FilterChain chain) throws IOException, ServletException {
		if(headInjectCode == null) {
			chain.doFilter(request, response);
			return;
		}
		
		OutputStream out = response.getOutputStream();
		GenericResponseWrapper wrapper = new GenericResponseWrapper((HttpServletResponse) response);
		chain.doFilter(request, wrapper);
		byte[] data;
		if(HTML_CONTENT_TYPE.equals(wrapper.getContentType())) {
			StringBuilder html = new StringBuilder(new String(wrapper.getData()));
			int closingHeadIndex = html.indexOf("</head>");
			if(closingHeadIndex < 0) {
				// If there is no <head>...</head> tag, we conjure up one of our own.
				int closingHtmlIndex = html.indexOf("</html>");
				if(closingHtmlIndex == -1) {
					closingHtmlIndex = html.length();
					html.append("</html>\n");
				}
				String openingHead = "<head>\n";
				String closingHead = "</head>\n";
				html.insert(closingHtmlIndex, openingHead + closingHead);
				closingHeadIndex = closingHtmlIndex + openingHead.length();
			}
			html.insert(closingHeadIndex, "\n" + headInjectCode + "\n");
			data = html.toString().getBytes();
		} else {
			data = wrapper.getData();
		}
		response.setContentLength(data.length);
		out.write(data);
	}

}
