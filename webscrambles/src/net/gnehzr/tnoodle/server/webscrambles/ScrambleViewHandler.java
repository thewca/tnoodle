package net.gnehzr.tnoodle.server.webscrambles;

import static net.gnehzr.tnoodle.utils.GwtSafeUtils.azzert;
import static net.gnehzr.tnoodle.utils.GwtSafeUtils.parseExtension;
import static net.gnehzr.tnoodle.utils.GsonUtils.GSON;
import static net.gnehzr.tnoodle.utils.Utils.throwableToString;

import net.gnehzr.tnoodle.svglite.Svg;
import net.gnehzr.tnoodle.utils.GsonUtils;
import net.gnehzr.tnoodle.utils.BadLazyClassDescriptionException;
import net.gnehzr.tnoodle.utils.LazyInstantiatorException;
import java.lang.reflect.Type;

import com.google.gson.JsonElement;
import com.google.gson.JsonSerializationContext;
import com.google.gson.JsonSerializer;
import com.google.gson.JsonDeserializationContext;
import com.google.gson.JsonDeserializer;
import com.google.gson.JsonParseException;
import com.google.gson.JsonPrimitive;

import net.gnehzr.tnoodle.svglite.Color;
import net.gnehzr.tnoodle.svglite.Dimension;
import java.awt.image.BufferedImage;
import java.io.BufferedReader;
import java.io.ByteArrayOutputStream;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStreamReader;
import java.lang.reflect.InvocationTargetException;
import java.util.Date;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.SortedMap;
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.imageio.ImageIO;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.batik.dom.svg.SVGDOMImplementation;
import org.apache.batik.util.SVGConstants;
import org.apache.batik.transcoder.TranscoderInput;
import org.apache.batik.transcoder.TranscoderOutput;
import org.apache.batik.transcoder.TranscoderException;
import org.apache.batik.transcoder.TranscodingHints;
import org.apache.batik.transcoder.image.ImageTranscoder;

import net.gnehzr.tnoodle.scrambles.InvalidScrambleException;
import net.gnehzr.tnoodle.scrambles.Puzzle;
import net.gnehzr.tnoodle.scrambles.PuzzleIcon;
import net.gnehzr.tnoodle.scrambles.PuzzlePlugins;
import net.gnehzr.tnoodle.scrambles.PuzzleImageInfo;
import net.gnehzr.tnoodle.server.SafeHttpServlet;
import net.gnehzr.tnoodle.utils.LazyInstantiator;
import net.lingala.zip4j.exception.ZipException;

import org.w3c.dom.DOMImplementation;

import com.itextpdf.text.DocumentException;

@SuppressWarnings("serial")
public class ScrambleViewHandler extends SafeHttpServlet {
    private static final Logger l = Logger.getLogger(ScrambleViewHandler.class.getName());

    private SortedMap<String, LazyInstantiator<Puzzle>> scramblers;

    public ScrambleViewHandler() throws IOException, BadLazyClassDescriptionException {
        this.scramblers = PuzzlePlugins.getScramblers();
    }


    // Copied from http://bbgen.net/blog/2011/06/java-svg-to-bufferedimage/
    class BufferedImageTranscoder extends ImageTranscoder {
        @Override
        public BufferedImage createImage(int w, int h) {
            BufferedImage bi = new BufferedImage(w, h, BufferedImage.TYPE_INT_ARGB);
            return bi;
        }

        @Override
        public void writeImage(BufferedImage img, TranscoderOutput output) {
            this.img = img;
        }

        public BufferedImage getBufferedImage() {
            return img;
        }
        private BufferedImage img = null;
    }

    static {
        GsonUtils.registerTypeHierarchyAdapter(Puzzle.class, new Puzzlerizer());
    }

    private static class Puzzlerizer implements JsonSerializer<Puzzle>, JsonDeserializer<Puzzle> {
        @Override
        public Puzzle deserialize(JsonElement json, Type typeOfT, JsonDeserializationContext context) throws JsonParseException {
            try {
                String scramblerName = json.getAsString();
                SortedMap<String, LazyInstantiator<Puzzle>> scramblers = PuzzlePlugins.getScramblers();
                LazyInstantiator<Puzzle> lazyScrambler = scramblers.get(scramblerName);
                if(lazyScrambler == null) {
                    throw new JsonParseException(scramblerName + " not found in: " + scramblers.keySet());
                }
                return lazyScrambler.cachedInstance();
            } catch(Exception e) {
                throw new JsonParseException(e);
            }
        }

        @Override
        public JsonElement serialize(Puzzle scrambler, Type typeOfT, JsonSerializationContext context) {
            return new JsonPrimitive(scrambler.getShortName());
        }
    }

    @Override
    protected void wrappedService(HttpServletRequest request, HttpServletResponse response, String[] path, LinkedHashMap<String, String> query) throws ServletException, IOException, IllegalArgumentException, SecurityException, InstantiationException, IllegalAccessException, InvocationTargetException, ClassNotFoundException, NoSuchMethodException, DocumentException, ZipException, BadLazyClassDescriptionException, LazyInstantiatorException {
        if (path.length == 0) {
            sendError(request, response, "Please specify a puzzle.");
            return;
        }
        String[] name_extension = parseExtension(path[0]);
        String name = name_extension[0];
        String extension = name_extension[1];
        if (extension == null) {
            sendError(request, response, "Please specify an extension");
            return;
        }

        if (extension.equals("png") || extension.equals("json") || extension.equals("svg")) {
            String puzzle = name;
            LazyInstantiator<Puzzle> lazyScrambler = scramblers.get(puzzle);
            if (lazyScrambler == null) {
                sendError(request, response, "Invalid scrambler: " + puzzle);
                return;
            }
            Puzzle scrambler = lazyScrambler.cachedInstance();
            HashMap<String, Color> colorScheme = scrambler
                    .parseColorScheme(query.get("scheme"));
            String scramble = query.get("scramble");

            if (extension.equals("png")) {
                ByteArrayOutputStream bytes;
                if (query.containsKey("icon")) {
                    bytes = PuzzleIcon.loadPuzzleIconPng(scrambler.getShortName());
                } else {
                    Svg svg;
                    try {
                        svg = scrambler.drawScramble(scramble, colorScheme);
                    } catch(InvalidScrambleException e) {
                        sendText(request, response, throwableToString(e));
                        return;
                    }
                    ByteArrayInputStream svgFile = new ByteArrayInputStream(svg.toString().getBytes());

                    Dimension size = scrambler.getPreferredSize();
                    BufferedImageTranscoder imageTranscoder = new BufferedImageTranscoder();

                    // Copied from http://stackoverflow.com/a/6634963
                    // with some tweaks.
                    DOMImplementation impl = SVGDOMImplementation.getDOMImplementation();
                    TranscodingHints hints = new TranscodingHints();
                    hints.put(ImageTranscoder.KEY_WIDTH, Float.valueOf(size.width));
                    hints.put(ImageTranscoder.KEY_HEIGHT, Float.valueOf(size.height));
                    hints.put(ImageTranscoder.KEY_DOM_IMPLEMENTATION, impl);
                    hints.put(ImageTranscoder.KEY_DOCUMENT_ELEMENT_NAMESPACE_URI,SVGConstants.SVG_NAMESPACE_URI);
                    hints.put(ImageTranscoder.KEY_DOCUMENT_ELEMENT_NAMESPACE_URI,SVGConstants.SVG_NAMESPACE_URI);
                    hints.put(ImageTranscoder.KEY_DOCUMENT_ELEMENT, SVGConstants.SVG_SVG_TAG);
                    hints.put(ImageTranscoder.KEY_XML_PARSER_VALIDATING, false);

                    imageTranscoder.setTranscodingHints(hints);

                    TranscoderInput input = new TranscoderInput(svgFile);
                    try {
                        imageTranscoder.transcode(input, null);
                    } catch(TranscoderException e) {
                        l.log(Level.SEVERE, "Failed to rasterize SVG.", e);
                        sendText(request, response, throwableToString(e));
                        return;
                    }

                    BufferedImage img = imageTranscoder.getBufferedImage();
                    bytes = new ByteArrayOutputStream();
                    ImageIO.write(img, "png", bytes);
                }

                response.setHeader("Content-Type", "image/png");
                response.setContentLength(bytes.size());
                bytes.writeTo(response.getOutputStream());
            } else if(extension.equals("svg")) {
                Svg svg;
                try {
                    svg = scrambler.drawScramble(scramble, colorScheme);
                } catch(InvalidScrambleException e) {
                    sendText(request, response, throwableToString(e));
                    return;
                }

                response.setHeader("Content-Type", "image/svg+xml");
                byte[] bytes = svg.toString().getBytes();
                response.setContentLength(bytes.length);
                response.getOutputStream().write(bytes, 0, bytes.length);
            } else if (extension.equals("json")) {
                sendJSON(request, response, GSON.toJson(new PuzzleImageInfo(scrambler)));
            } else {
                azzert(false);
            }
        } else if (extension.equals("pdf") || extension.equals("zip")) {
            if (!request.getMethod().equals("POST")) {
                sendText(request, response, "You must POST to this url. Copying and pasting the url won't work.");
                return;
            }

            BufferedReader in = new BufferedReader(new InputStreamReader(request.getInputStream()));
            StringBuilder body = new StringBuilder();
            String line;
            while ((line = in.readLine()) != null) {
                body.append(line);
            }
            query = parseQuery(body.toString());

            String json = query.get("sheets"); // all the scrambles
            System.out.println(json);
            ScrambleRequest[] scrambleRequests = GSON.fromJson(json, ScrambleRequest[].class);

            String password = query.get("password");
            String generationUrl = query.get("generationUrl");
            
            Date generationDate = new Date();
            String globalTitle = name;

            if (extension.equals("pdf")) {
                ByteArrayOutputStream totalPdfOutput = ScrambleRequest
                        .requestsToPdf(globalTitle, generationDate, scrambleRequests, password);
                response.setHeader("Content-Disposition", "inline");

                // Workaround for Chrome bug with saving PDFs:
                //  https://bugs.chromium.org/p/chromium/issues/detail?id=69677#c35
                response.setHeader("Cache-Control", "public");

                sendBytes(request, response, totalPdfOutput, "application/pdf");
            } else if (extension.equals("zip")) {
                String schedule = query.remove("schedule");
                
                ByteArrayOutputStream zipOutput = ScrambleRequest
                        .requestsToZip(getServletContext(), globalTitle, generationDate, scrambleRequests, password, generationUrl, schedule, json);

                String safeTitle = globalTitle.replaceAll("\"", "'");
                response.setHeader("Content-Disposition", "attachment; filename=\"" + safeTitle + ".zip\"");
                sendBytes(request, response, zipOutput, "application/zip");
            } else {
                azzert(false);
            }
        } else {
            sendError(request, response, "Invalid extension: " + extension);
        }
    }

    static {
        GsonUtils.registerTypeAdapter(PuzzleImageInfo.class, new PuzzleImageInfoizer());
    }
    private static class PuzzleImageInfoizer implements JsonSerializer<PuzzleImageInfo> {
        @Override
        public JsonElement serialize(PuzzleImageInfo pii, Type typeOfT, JsonSerializationContext context) {

            return context.serialize(pii.toJsonable());
        }
    }

}
