package net.gnehzr.tnoodle.server.webscrambles;

import com.itextpdf.text.DocumentException;
import net.gnehzr.tnoodle.server.SafeHttpServlet;
import net.lingala.zip4j.exception.ZipException;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.Date;
import java.util.LinkedHashMap;

import static net.gnehzr.tnoodle.utils.GsonUtils.GSON;

@SuppressWarnings("serial")
public class ScrambleHandler extends SafeHttpServlet {

    public ScrambleHandler() {}

    protected void wrappedService(HttpServletRequest request, HttpServletResponse response, String[] path, LinkedHashMap<String, String> query) throws IOException, InvalidScrambleRequestException, DocumentException, ZipException {
        if(path.length == 0) {
            response.sendError(404);
        } else {
            Date generationDate = new Date();

            // TODO - this means you can't have a round named "seed" or "showIndices" or "callback" or "generationUrl"!
            String seed = query.remove("seed");
            String generationUrl = query.remove("generationUrl");
            boolean showIndices = query.remove("showIndices") != null;
            query.remove("callback");

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
                sendText(request, response, sb.toString());
            } else if(ext.equals("json")) {
                ScrambleRequest[] scrambleRequests = ScrambleRequest.parseScrambleRequests(query, seed);
                sendJSON(request, response, GSON.toJson(scrambleRequests));
            } else if(ext.equals("pdf")) {
                ScrambleRequest[] scrambleRequests = ScrambleRequest.parseScrambleRequests(query, seed);
                ByteArrayOutputStream totalPdfOutput = ScrambleRequest.requestsToPdf(globalTitle, generationDate, scrambleRequests, null);
                response.setHeader("Content-Disposition", "inline");
                sendBytes(request, response, totalPdfOutput, "application/pdf");
            } else if(ext.equals("zip")) {
                ScrambleRequest[] scrambleRequests = ScrambleRequest.parseScrambleRequests(query, seed);
                ByteArrayOutputStream baosZip = ScrambleRequest.requestsToZip(getServletContext(), globalTitle, generationDate, scrambleRequests, seed, generationUrl);
                sendBytes(request, response, baosZip, "application/zip");
            } else {
                throw new InvalidScrambleRequestException("Invalid extension: " + ext);
            }
        }
    }

}
