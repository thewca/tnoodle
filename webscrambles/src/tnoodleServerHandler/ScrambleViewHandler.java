package tnoodleServerHandler;

import static net.gnehzr.tnoodle.utils.Utils.GSON;
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
import java.lang.reflect.InvocationTargetException;
import java.util.Date;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.SortedMap;

import javax.imageio.ImageIO;

import net.gnehzr.tnoodle.scrambles.InvalidScrambleException;
import net.gnehzr.tnoodle.scrambles.Scrambler;
import net.gnehzr.tnoodle.server.SafeHttpHandler;
import net.gnehzr.tnoodle.utils.BadClassDescriptionException;
import net.gnehzr.tnoodle.utils.LazyClassLoader;

import com.itextpdf.text.DocumentException;
import com.sun.net.httpserver.HttpExchange;

@SuppressWarnings("restriction")
public class ScrambleViewHandler extends SafeHttpHandler {
	private SortedMap<String, LazyClassLoader<Scrambler>> scramblers;
	public ScrambleViewHandler() throws BadClassDescriptionException, IOException {
		this.scramblers = Scrambler.getScramblers();
	}
	
	protected void wrappedHandle(HttpExchange t, String path[], LinkedHashMap<String, String> query) throws IOException, IllegalArgumentException, SecurityException, InstantiationException, IllegalAccessException, InvocationTargetException, ClassNotFoundException, NoSuchMethodException, InvalidScrambleRequestException, DocumentException {
		String callback = query.get("callback");
		if(path.length == 0) {
			sendJSONError(t, "Please specify a puzzle.", callback);
			return;
		}
		String[] name_extension = parseExtension(path[0]);
		if(name_extension[1] == null) {
			sendJSONError(t, "Please specify an extension", callback);
			return;
		}
		String name = name_extension[0];
		String extension = name_extension[1];
		
		if(extension.equals("png") || extension.equals("json")) {
			String puzzle = name;
			LazyClassLoader<Scrambler> lazyScrambler = scramblers.get(puzzle);
			if(lazyScrambler == null) {
				sendJSONError(t, "Invalid scrambler: " + puzzle, callback);
				return;
			}
			Scrambler scrambler = lazyScrambler.cachedInstance();
			HashMap<String, Color> colorScheme = scrambler.parseColorScheme(query.get("scheme"));
			String scramble = query.get("scramble");
			Dimension dimension = scrambler.getPreferredSize(toInt(query.get("width"), 0), toInt(query.get("height"), 0));
			
			if(extension.equals("png")) {
				try {
					ByteArrayOutputStream bytes = new ByteArrayOutputStream();
					if(query.containsKey("icon")) {
						scrambler.loadPuzzleIcon(bytes);
					} else {
						BufferedImage img = new BufferedImage(dimension.width, dimension.height, BufferedImage.TYPE_INT_ARGB);
						scrambler.drawScramble(img.createGraphics(), dimension, scramble, colorScheme);
						ImageIO.write(img, "png", bytes);
					}

					t.getResponseHeaders().set("Content-Type", "image/png");
					t.sendResponseHeaders(200, bytes.size());
					t.getResponseBody().write(bytes.toByteArray());
					t.getResponseBody().close();
				} catch(InvalidScrambleException e) {
					e.printStackTrace();
					sendText(t, throwableToString(e));
				}
			} else if(extension.equals("json")) {
				sendJSON(t, GSON.toJson(scrambler.getDefaultPuzzleImageInfo()), callback);
			} else {
				assert false;
			}
		} else if(extension.equals("pdf") || extension.equals("zip")) {
			if(t.getRequestMethod().equals("POST")) {
				BufferedReader in = new BufferedReader(new InputStreamReader(t.getRequestBody()));
				StringBuilder body = new StringBuilder();
				String line;
				while((line = in.readLine()) != null) {
					body.append(line);
				}
				query = parseQuery(body.toString());
			}

			String json = query.get("scrambles");
			ScrambleRequest[] scrambleRequests = GSON.fromJson(json, ScrambleRequest[].class);
			
			Date generationDate = new Date();
			String globalTitle = name;
			
			if(extension.equals("pdf")) {
				ByteArrayOutputStream totalPdfOutput = ScrambleRequest.requestsToPdf(globalTitle, generationDate, scrambleRequests);
				t.getResponseHeaders().set("Content-Disposition", "inline");
				sendBytes(t, totalPdfOutput, "application/pdf");
			} else if(extension.equals("zip")) {
				ByteArrayOutputStream zipOutput = ScrambleRequest.requestsToZip(globalTitle, generationDate, scrambleRequests);
				sendBytes(t, zipOutput, "application/zip");
			} else {
				assert false;
			}
		} else {
			sendJSONError(t, "Invalid extension: " + extension, callback);
		}
	}
}
