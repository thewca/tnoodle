package net.gnehzr.tnoodle.server;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.PrintWriter;

import javax.servlet.ServletOutputStream;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpServletResponseWrapper;

public class GenericResponseWrapper extends HttpServletResponseWrapper {
	private ByteArrayOutputStream output;
	private int contentLength;
	private String contentType;
	private HttpServletResponse response;

	public GenericResponseWrapper(HttpServletResponse response) {
		super(response);
		this.response = response;
		output = new ByteArrayOutputStream();
	}

	public byte[] getData() {
		return output.toByteArray();
	}

	public ServletOutputStream getOutputStream() {
		return new FilterServletOutputStream(output);
	}

	public PrintWriter getWriter() {
		return new PrintWriter(getOutputStream(), true);
	}

	public void setContentLength(int length) {
		this.contentLength = length;
		super.setContentLength(length);
	}

	public int getContentLength() {
		return contentLength;
	}

	public void setContentType(String type) {
		this.contentType = type;
		super.setContentType(type);
	}

	public String getContentType() {
		return contentType;
	}

	@Override
	public void sendError(int sc, String msg) throws IOException {
		response.sendError(sc, msg);
	}
}
