package net.gnehzr.tnoodle.server.webscrambles;

import static net.gnehzr.tnoodle.utils.Utils.GSON;
import static net.gnehzr.tnoodle.utils.Utils.azzert;
import static net.gnehzr.tnoodle.utils.Utils.parseExtension;
import static net.gnehzr.tnoodle.utils.Utils.throwableToString;
import static net.gnehzr.tnoodle.utils.Utils.toInt;

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
import net.gnehzr.tnoodle.scrambles.Scrambler;
import net.gnehzr.tnoodle.server.SafeHttpServlet;
import net.gnehzr.tnoodle.utils.BadClassDescriptionException;
import net.gnehzr.tnoodle.utils.LazyInstantiator;
import net.lingala.zip4j.exception.ZipException;

import org.apache.batik.dom.GenericDOMImplementation;
import org.apache.batik.svggen.SVGGraphics2D;
import org.w3c.dom.DOMImplementation;
import org.w3c.dom.Document;

import com.itextpdf.text.DocumentException;

@SuppressWarnings("serial")
public class ScrambleViewHandler extends SafeHttpServlet {
	private SortedMap<String, LazyInstantiator<Scrambler>> scramblers;

	public ScrambleViewHandler() throws BadClassDescriptionException,
			IOException {
		this.scramblers = Scrambler.getScramblers();
	}

	@Override
	protected void wrappedService(HttpServletRequest request, HttpServletResponse response, String[] path, LinkedHashMap<String, String> query)
			throws ServletException, IOException, IllegalArgumentException, SecurityException, InstantiationException, IllegalAccessException, InvocationTargetException, ClassNotFoundException, NoSuchMethodException, DocumentException, ZipException {
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
			LazyInstantiator<Scrambler> lazyScrambler = scramblers.get(puzzle);
			if (lazyScrambler == null) {
				sendError(request, response, "Invalid scrambler: " + puzzle);
				return;
			}
			Scrambler scrambler = lazyScrambler.cachedInstance();
			HashMap<String, Color> colorScheme = scrambler
					.parseColorScheme(query.get("scheme"));
			String scramble = query.get("scramble");
			Dimension dimension = scrambler
					.getPreferredSize(toInt(query.get("width"), 0),
							toInt(query.get("height"), 0));

			if (extension.equals("png")) {
				try {
					ByteArrayOutputStream bytes = new ByteArrayOutputStream();
					if (query.containsKey("icon")) {
						scrambler.loadPuzzleIcon(bytes);
					} else {
						BufferedImage img = new BufferedImage(dimension.width,
								dimension.height, BufferedImage.TYPE_INT_ARGB);
						scrambler.drawScramble(img.createGraphics(), dimension,
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
				// Get a DOMImplementation.
				DOMImplementation domImpl =
					GenericDOMImplementation.getDOMImplementation();

				// Create an instance of org.w3c.dom.Document.
				String svgNS = "http://www.w3.org/2000/svg";
				Document document = domImpl.createDocument(svgNS, "svg", null);

				// Create an instance of the SVG Generator.
				SVGGraphics2D svgGenerator = new SVGGraphics2D(document);
				svgGenerator.setSVGCanvasSize(dimension);

				// This is a hack I don't fully understand that prevents aliasing of
				// vertical and horizontal lines.
				// See http://stackoverflow.com/questions/7589650/drawing-grid-with-jquery-svg-produces-2px-lines-instead-of-1px
				svgGenerator.translate(0.5, 0.5);

				try {
					scrambler.drawScramble(svgGenerator, dimension, scramble, colorScheme);
				} catch(InvalidScrambleException e) {
					sendText(request, response, throwableToString(e));
					return;
				}

				ByteArrayOutputStream bytes = new ByteArrayOutputStream();
				boolean useCSS = true; // we want to use CSS style attributes
				Writer out = new OutputStreamWriter(bytes, "UTF-8");
				svgGenerator.stream(out, useCSS);
				out.close();

				response.setHeader("Content-Type", "image/svg+xml");
				response.setContentLength(bytes.size());
				bytes.writeTo(response.getOutputStream());
			} else if (extension.equals("json")) {
				sendJSON(request, response, GSON.toJson(scrambler.getDefaultPuzzleImageInfo()));
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
}
