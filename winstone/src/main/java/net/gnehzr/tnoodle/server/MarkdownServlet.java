package net.gnehzr.tnoodle.server;

import java.io.IOException;

import javax.servlet.RequestDispatcher;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@SuppressWarnings("serial")
@WebServlet(name = "MarkdownServlet", urlPatterns = {"*.md"})
public class MarkdownServlet extends SafeHttpServlet {
    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        RequestDispatcher rd = getServletContext().getNamedDispatcher("default");

        GenericResponseWrapper wrapper = new GenericResponseWrapper(resp);
        rd.include(req, wrapper);

        byte[] data = wrapper.getData();

        if (data.length == 0) {
            // We can't distinguish between an empty file, and a 404. This is
            // because WinstonseResponse only actually sets an error code if
            // isIncluding == false.

            resp.sendError(HttpServletResponse.SC_NOT_FOUND, "File " + req.getRequestURI() + " not found");
            return;
        }

        sendMarkdown(req, resp, new String(data));
    }
}
