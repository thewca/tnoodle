package net.gnehzr.tnoodle.server;

import java.util.LinkedHashMap;

import javax.servlet.RequestDispatcher;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;


@SuppressWarnings("serial")
public class MarkdownServlet extends SafeHttpServlet {

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

        sendMarkdown(request, response, new String(data));
    }

}
