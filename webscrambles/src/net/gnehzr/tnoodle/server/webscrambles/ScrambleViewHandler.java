package net.gnehzr.tnoodle.server.webscrambles;

import static net.gnehzr.tnoodle.utils.GwtSafeUtils.azzert;
import static net.gnehzr.tnoodle.utils.GwtSafeUtils.parseExtension;
import static net.gnehzr.tnoodle.utils.GwtSafeUtils.toInt;
import static net.gnehzr.tnoodle.utils.Utils.GSON;
import static net.gnehzr.tnoodle.utils.Utils.throwableToString;

import org.apache.batik.svggen.SVGShape;
import org.w3c.dom.Element;
import org.apache.batik.svggen.DOMGroupManager;
import net.gnehzr.tnoodle.utils.Utils;
import net.gnehzr.tnoodle.utils.BadLazyClassDescriptionException;
import net.gnehzr.tnoodle.utils.LazyInstantiatorException;
import com.google.gson.JsonElement;
import java.awt.geom.GeneralPath;
import com.google.gson.JsonSerializationContext;
import java.lang.reflect.Type;
import com.google.gson.JsonSerializer;
import java.awt.geom.AffineTransform;

import org.apache.batik.util.SVGConstants;
import java.awt.Color;
import java.awt.Dimension;
import java.awt.image.BufferedImage;
import java.io.BufferedReader;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStreamWriter;
import java.io.Writer;
import java.lang.reflect.InvocationTargetException;
import java.util.Date;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.SortedMap;

import javax.imageio.ImageIO;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import net.gnehzr.tnoodle.scrambles.InvalidScrambleException;
import net.gnehzr.tnoodle.scrambles.Puzzle;
import net.gnehzr.tnoodle.scrambles.PuzzleIcon;
import net.gnehzr.tnoodle.scrambles.PuzzlePlugins;
import net.gnehzr.tnoodle.scrambles.PuzzleImageInfo;
import net.gnehzr.tnoodle.server.SafeHttpServlet;
import net.gnehzr.tnoodle.utils.LazyInstantiator;
import net.lingala.zip4j.exception.ZipException;

import org.apache.batik.dom.GenericDOMImplementation;
import org.apache.batik.svggen.SVGGraphics2D;
import org.w3c.dom.DOMImplementation;
import org.w3c.dom.Document;

import com.itextpdf.text.DocumentException;

@SuppressWarnings("serial")
public class ScrambleViewHandler extends SafeHttpServlet {
    private SortedMap<String, LazyInstantiator<Puzzle>> scramblers;

    public ScrambleViewHandler() throws IOException, BadLazyClassDescriptionException {
        this.scramblers = PuzzlePlugins.getScramblers();
    }

    public class MySVGGraphics2D extends SVGGraphics2D {
        public MySVGGraphics2D(Document domFactory) {
            super(domFactory);
        }

        public final DOMGroupManager myGetDOMGroupManager(){
            return domGroupManager;
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
            Dimension size = scrambler
                    .getPreferredSize(toInt(query.get("width"), 0),
                            toInt(query.get("height"), 0));

            if (extension.equals("png")) {
                try {
                    ByteArrayOutputStream bytes;
                    if (query.containsKey("icon")) {
                        bytes = PuzzleIcon.loadPuzzleIcon(scrambler);
                    } else {
                        bytes = new ByteArrayOutputStream();
                        BufferedImage img = new BufferedImage(size.width,
                                size.height, BufferedImage.TYPE_INT_ARGB);
                        scrambler.drawScramble(img.createGraphics(), size,
                                scramble, colorScheme);
                        ImageIO.write(img, "png", bytes);
                    }

                    response.setHeader("Content-Type", "image/png");
                    response.setContentLength(bytes.size());
                    bytes.writeTo(response.getOutputStream());
                } catch (InvalidScrambleException e) {
                    e.printStackTrace();
                    sendText(request, response, throwableToString(e));
                }
            } else if(extension.equals("svg")) {
                DOMImplementation domImpl =
                    GenericDOMImplementation.getDOMImplementation();

                String svgNS = "http://www.w3.org/2000/svg";
                Document document = domImpl.createDocument(svgNS, "svg", null);

                MySVGGraphics2D svgGenerator = new MySVGGraphics2D(document);
                svgGenerator.setSVGCanvasSize(size);

                // This is a hack I don't fully understand that prevents aliasing of
                // vertical and horizontal lines.
                // See http://stackoverflow.com/questions/7589650/drawing-grid-with-jquery-svg-produces-2px-lines-instead-of-1px
                svgGenerator.translate(0.5, 0.5);

                try {
                    scrambler.drawScramble(svgGenerator, size, scramble, colorScheme);
                } catch(InvalidScrambleException e) {
                    sendText(request, response, throwableToString(e));
                    return;
                }

                HashMap<String, GeneralPath> faces = scrambler.getDefaultFaceBoundaries();
                Dimension preferredSize = scrambler.getPreferredSize(0, 0);
                for(String face : faces.keySet()) {
                    GeneralPath gp = faces.get(face);

                    // Scale face to appropriate size
                    gp.transform(AffineTransform.getScaleInstance(
                        (float) size.width / preferredSize.width,
                        (float) size.height / preferredSize.height
                    ));

                    SVGShape shapeConverter = svgGenerator.getShapeConverter();
                    Element svgShape = shapeConverter.toSVG(gp);
                    svgShape.setAttributeNS(null, SVGConstants.SVG_OPACITY_ATTRIBUTE, "0");
                    svgShape.setAttributeNS(null, "class", "puzzleface");
                    svgShape.setAttributeNS(null, "id", face);
                    DOMGroupManager dgm = svgGenerator.myGetDOMGroupManager();
                    dgm.addElement(svgShape, DOMGroupManager.FILL);
                }

                Element root = svgGenerator.getRoot();
                // SVGGraphics2D doesn't generate the viewBox by itself
                root.setAttributeNS(null, "viewBox", "0 0 " + size.width + " " + size.height);

                ByteArrayOutputStream bytes = new ByteArrayOutputStream();
                boolean useCSS = true; // we want to use CSS style attributes
                Writer out = new OutputStreamWriter(bytes, "UTF-8");
                svgGenerator.stream(root, out, useCSS, false);
                out.close();

                response.setHeader("Content-Type", "image/svg+xml");
                response.setContentLength(bytes.size());
                bytes.writeTo(response.getOutputStream());
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

            String json = query.get("scrambles");
            ScrambleRequest[] scrambleRequests = GSON.fromJson(json, ScrambleRequest[].class);

            String password = query.get("password");

            Date generationDate = new Date();
            String globalTitle = name;

            if (extension.equals("pdf")) {
                ByteArrayOutputStream totalPdfOutput = ScrambleRequest
                        .requestsToPdf(globalTitle, generationDate, scrambleRequests, password);
                response.setHeader("Content-Disposition", "inline");
                sendBytes(request, response, totalPdfOutput, "application/pdf");
            } else if (extension.equals("zip")) {
                ByteArrayOutputStream zipOutput = ScrambleRequest
                        .requestsToZip(globalTitle, generationDate, scrambleRequests, password);
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
        Utils.registerTypeAdapter(PuzzleImageInfo.class, new PuzzleImageInfoizer());
    }
    private static class PuzzleImageInfoizer implements JsonSerializer<PuzzleImageInfo> {
        @Override
        public JsonElement serialize(PuzzleImageInfo pii, Type typeOfT, JsonSerializationContext context) {

            return context.serialize(pii.toJsonable());
        }
    }

}
