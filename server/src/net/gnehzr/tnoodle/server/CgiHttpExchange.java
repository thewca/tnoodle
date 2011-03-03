package net.gnehzr.tnoodle.server;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.InetSocketAddress;
import java.net.URI;
import java.net.URISyntaxException;

import com.sun.net.httpserver.Headers;
import com.sun.net.httpserver.HttpContext;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpPrincipal;

public class CgiHttpExchange extends HttpExchange {

	private final InetSocketAddress remote;
	private final String requestMethod;
	private final URI requestURI;
	public CgiHttpExchange() throws URISyntaxException {
		remote = new InetSocketAddress(System.getenv("REMOTE_ADDR"), Integer.parseInt(System.getenv("REMOTE_PORT")));
		requestMethod = System.getenv("REQUEST_METHOD");
		requestURI = new URI(System.getenv("REQUEST_URI"));
	}
	
	@Override
	public void close() {
		// TODO Auto-generated method stub
		
	}

	@Override
	public Object getAttribute(String arg0) {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public HttpContext getHttpContext() {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public InetSocketAddress getLocalAddress() {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public HttpPrincipal getPrincipal() {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public String getProtocol() {
		// TODO Auto-generated method stub
		return "HTTP/1.1";
	}

	@Override
	public InetSocketAddress getRemoteAddress() {
		return remote;
	}

	@Override
	public InputStream getRequestBody() {
		return System.in;
	}

	@Override
	public Headers getRequestHeaders() {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public String getRequestMethod() {
		return requestMethod;
	}

	@Override
	public URI getRequestURI() {
		return requestURI;
	}

	@Override
	public OutputStream getResponseBody() {
		return System.out;
	}

	@Override
	public int getResponseCode() {
		return returnCode;
	}

	private Headers responseHeaders = new Headers();
	@Override
	public Headers getResponseHeaders() {
		return responseHeaders;
	}

	private int returnCode = 0;
	@Override
	public void sendResponseHeaders(int returnCode, long responseLength) throws IOException {
		this.returnCode = returnCode;
		for(String key : responseHeaders.keySet()) {
			if(key == null) continue;
			for(String value : responseHeaders.get(key)) {
				System.out.println(key + ": " + value);
			}
		}
	}

	@Override
	public void setAttribute(String arg0, Object arg1) {
		// TODO Auto-generated method stub
		
	}

	@Override
	public void setStreams(InputStream arg0, OutputStream arg1) {
		// TODO Auto-generated method stub
		
	}

}
