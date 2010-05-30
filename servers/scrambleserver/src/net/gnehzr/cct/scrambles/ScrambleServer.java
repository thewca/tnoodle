package net.gnehzr.cct.scrambles;

import static net.gnehzr.cct.scrambles.ScrambleUtils.GSON;
import static net.gnehzr.cct.scrambles.ScrambleUtils.exceptionToString;
import static net.gnehzr.cct.scrambles.ScrambleUtils.join;
import static net.gnehzr.cct.scrambles.ScrambleUtils.parseExtension;
import static net.gnehzr.cct.scrambles.ScrambleUtils.parseQuery;
import static net.gnehzr.cct.scrambles.ScrambleUtils.sendJSON;
import static net.gnehzr.cct.scrambles.ScrambleUtils.sendText;
import static net.gnehzr.cct.scrambles.ScrambleUtils.toInt;
import static net.gnehzr.cct.scrambles.ScrambleUtils.toLong;

import java.awt.Color;
import java.awt.Dimension;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.IOException;
import java.net.InetSocketAddress;
import java.net.URISyntaxException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashMap;

import javax.imageio.ImageIO;

import joptsimple.OptionParser;
import joptsimple.OptionSet;
import joptsimple.OptionSpec;

import com.eekboom.utils.Strings;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import com.sun.net.httpserver.HttpServer;

@SuppressWarnings("restriction")
public class ScrambleServer {
	
	public ScrambleServer(int port, File scrambleFolder) throws IOException {
		HttpServer server = HttpServer.create(new InetSocketAddress(port), 0);
		HashMap<String, ScrambleGenerator> scramblers = ScrambleGenerator.getScrambleGenerators(scrambleFolder);
		if(scramblers == null) {
			throw new IOException("Invalid directory: " + scrambleFolder.getAbsolutePath());
		}
		server.createContext("/scrambler", new ScramblerHandler(scramblers));
		server.createContext("/viewer", new ScrambleViewerHandler(scramblers));
		// the default executor invokes everything in 1 thread, so threading isn't an issue!
		server.setExecutor(null);
		server.start();
		
		System.out.println("Server started on " + server.getAddress());
	}
	
	private class ScrambleViewerHandler implements HttpHandler {
		private HashMap<String, ScrambleGenerator> scramblers;
		public ScrambleViewerHandler(HashMap<String, ScrambleGenerator> scramblers) {
			this.scramblers = scramblers;
		}

		@Override
		public void handle(HttpExchange t) {
			try {
				wrapped(t);
			} catch(Exception e) {
				sendText(t, exceptionToString(e));
			}
		}
		
		private void wrapped(HttpExchange t) throws IOException {
			//substring(1) gets rid of the leading /
			String[] path = t.getRequestURI().getPath().substring(1).split("/");
			String[] name_extension = parseExtension(path[1]);
			if(name_extension[1] == null) {
				sendText(t, "Please specify an extension");
				return;
			}
			String puzzle = name_extension[0];
			String extension = name_extension[1];
			HashMap<String, String> query = parseQuery(t.getRequestURI().getQuery());
			ScrambleGenerator gen = scramblers.get(puzzle);
			if(gen == null) {
				sendText(t, "Invalid scramble generator: " + puzzle);
				return;
			} else if(!(gen instanceof ScrambleImageGenerator)) {
				sendText(t, "Specified scramble generator: " + puzzle + " does not support image generation.");
				return;
			}
			ScrambleImageGenerator generator = (ScrambleImageGenerator) gen;

			HashMap<String, Color> colorScheme = generator.getDefaultColorScheme();
			String scheme = query.get("scheme");
			if(scheme != null && !scheme.isEmpty()) {
				String[] colors = scheme.split(",");
				String[] faces = generator.getFaceNames();
				if(colors.length != faces.length) {
					sendText(t, String.format("Incorrect number of colors specified (expecting %d, got %d)", faces.length, colors.length));
					return;
				}
				for(int i = 0; i < colors.length; i++) {
					Color c = ScrambleUtils.toColor(colors[i]);
					if(c == null) {
						sendText(t, "Invalid color: " + colors[i]);
						return;
					}
					colorScheme.put(faces[i], c);
				}
			}
			
			String scramble = query.get("scramble");
			Dimension dimension = generator.getPreferredSize(toInt(query.get("width"), 0), toInt(query.get("height"), 0));
			if(extension.equals("png")) {
				try {
					BufferedImage img = new BufferedImage(dimension.width, dimension.height, BufferedImage.TYPE_INT_ARGB);
					generator.drawScramble(img.createGraphics(), dimension, scramble, colorScheme);
					ByteArrayOutputStream bytes = new ByteArrayOutputStream();
					ImageIO.write(img.getSubimage(0, 0, dimension.width, dimension.height), "png", bytes);

					t.getResponseHeaders().set("Content-Type", "image/png");
					t.sendResponseHeaders(200, bytes.size());
					t.getResponseBody().write(bytes.toByteArray());
					t.getResponseBody().close();
				} catch(InvalidScrambleException e) {
					e.printStackTrace();
					sendText(t, exceptionToString(e));
				}
			} else if(extension.equals("json")) {
				sendJSON(t, GSON.toJson(generator.getFaces(dimension, colorScheme)), query.get("callback"));
			} else {
				sendText(t, "Invalid extension: " + extension);
			}
		}
	}

	private class ScramblerHandler implements HttpHandler {
		private HashMap<String, ScrambleGenerator> scramblers;
		public ScramblerHandler(HashMap<String, ScrambleGenerator> scramblers) {
			this.scramblers = scramblers;
		}
		
		@Override
		public void handle(HttpExchange t) {
			try {
				wrapped(t);
			} catch(Exception e) {
				sendText(t, exceptionToString(e));
			}
		}

		private void wrapped(HttpExchange t) {
			//substring(1) gets rid of the leading /
			String[] path = t.getRequestURI().getPath().substring(1).split("/");
			HashMap<String, String> query = parseQuery(t.getRequestURI().getQuery());

			if(path.length == 1) {
				//listing available scrambles
				ArrayList<String> keys = new ArrayList<String>(scramblers.keySet());
				//sorting in a way that will take into account numbers (so 10x10x10 appears after 3x3x3)
				Collections.sort(keys, Strings.getNaturalComparator());
				sendJSON(t, GSON.toJson(keys), query.get("callback"));
			} else {
				String[] name_ext = parseExtension(path[1]);
				ScrambleGenerator generator = scramblers.get(name_ext[0]);
				if(generator == null) {
					sendText(t, "Invalid scramble generator: " + name_ext[0]);
					return;
				}

				String seedStr = query.get("seed");
				if(seedStr == null || seedStr.isEmpty()) {
					seedStr = null;
				} else {
					generator.setSeed(toLong(seedStr, (long) seedStr.hashCode()));
				}

				boolean penis = query.get("penis") != null;
				int count = toInt(query.get("count"), 1);
				
				if(name_ext[1] == null) {
					StringBuilder sb = new StringBuilder();
					for(int i = 0; i < count; i++) {
						if(penis)
							sb.append(i).append(" ");
						sb.append(join(generator.generateScramble(seedStr != null), " ")).append('\n');
					}
					sendText(t, sb.toString());
				} else if(name_ext[1].equals("json")) {
					String[][] scrambles = new String[count][];
					for(int i = 0; i < count; i++) {
						scrambles[i] = generator.generateScramble(seedStr != null);
					}
					sendJSON(t, GSON.toJson(scrambles), query.get("callback"));
				} else {
					sendText(t, "Invalid extension: " + name_ext[1]);
				}
			}
		}
	}
	
	/**
	 * @return A File representing the directory in which this program resides.
	 * If this is a jar file, this should be obvious, otherwise things are a little ambiguous.
	 */
	public static File getProgramDirectory() {
		File defaultScrambleFolder;
		try {
			defaultScrambleFolder = new File(ScrambleServer.class.getProtectionDomain().getCodeSource().getLocation().toURI().getPath());
		} catch (URISyntaxException e) {
			return new File(".");
		}
		if(defaultScrambleFolder.isFile()) //this should indicate a jar file
			defaultScrambleFolder = defaultScrambleFolder.getParentFile();
		return defaultScrambleFolder;
	}
	
	public static void main(String[] args) throws IOException {
		OptionParser parser = new OptionParser();
		OptionSpec<Integer> port = parser.accepts("port", "The port to run the http server on").withOptionalArg().ofType(Integer.class).defaultsTo(8080);
		OptionSpec<File> scrambleFolder = parser.accepts("scramblers", "The directory of the scramble plugins").withOptionalArg().ofType(File.class).defaultsTo(new File(getProgramDirectory(), "scramblers"));
		OptionSpec<?> help = parser.acceptsAll(Arrays.asList("h", "?"), "Show this help");
		try {
			OptionSet options = parser.parse(args);
			if(!options.has(help)) {
				new ScrambleServer(options.valueOf(port), options.valueOf(scrambleFolder));
				return;
			}
		} catch(Exception e) {
			e.printStackTrace();
		}
		parser.printHelpOn(System.out);
	}
}
