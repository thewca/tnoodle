package net.gnehzr.tnoodle.scrambles.server;

import static net.gnehzr.tnoodle.utils.Utils.GSON;
import static net.gnehzr.tnoodle.utils.Utils.parseExtension;
import static net.gnehzr.tnoodle.utils.Utils.throwableToString;
import static net.gnehzr.tnoodle.utils.Utils.toColor;
import static net.gnehzr.tnoodle.utils.Utils.toHex;
import static net.gnehzr.tnoodle.utils.Utils.toInt;

import java.awt.Color;
import java.awt.Desktop;
import java.awt.Dimension;
import java.awt.Graphics2D;
import java.awt.geom.GeneralPath;
import java.awt.geom.PathIterator;
import java.awt.image.BufferedImage;
import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStreamWriter;
import java.io.UnsupportedEncodingException;
import java.lang.Package;
import java.net.BindException;
import java.net.InetAddress;
import java.net.InetSocketAddress;
import java.net.URI;
import java.net.URISyntaxException;
import java.net.URL;
import java.net.URLConnection;
import java.net.URLDecoder;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Map.Entry;
import java.util.SortedMap;
import java.util.concurrent.Executors;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import javax.imageio.ImageIO;

import com.sun.net.httpserver.HttpExchange;

import net.gnehzr.tnoodle.scrambles.Scrambler;
import net.gnehzr.tnoodle.scrambles.InvalidScrambleException;

public class ScrambleViewHandler extends SafeHttpHandler {
	private SortedMap<String, Scrambler> scramblers;
	public ScrambleViewHandler(SortedMap<String, Scrambler> scramblers) {
		this.scramblers = scramblers;
	}
	
	protected void wrappedHandle(HttpExchange t, String path[], HashMap<String, String> query) throws IOException {
		String callback = query.get("callback");
		if(path.length == 1) {
			sendJSONError(t, "Please specify a puzzle.", callback);
			return;
		}
		String[] name_extension = parseExtension(path[1]);
		if(name_extension[1] == null) {
			sendJSONError(t, "Please specify an extension", callback);
			return;
		}
		String puzzle = name_extension[0];
		String extension = name_extension[1];
		
		Scrambler scrambler = scramblers.get(puzzle);
		if(scrambler == null) {
			sendJSONError(t, "Invalid scrambler: " + puzzle, callback);
			return;
		}

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
			sendJSON(t, GSON.toJson(scrambler.getDefaultPuzzleImageInfo().jsonize()), callback);
		} else {
			sendJSONError(t, "Invalid extension: " + extension, callback);
		}
	}
}
