package net.gnehzr.tnoodle.scrambles.server;

import static net.gnehzr.tnoodle.scrambles.utils.ScrambleUtils.parseExtension;
import static net.gnehzr.tnoodle.scrambles.utils.ScrambleUtils.throwableToString;
import static net.gnehzr.tnoodle.scrambles.utils.ScrambleUtils.toColor;
import static net.gnehzr.tnoodle.scrambles.utils.ScrambleUtils.toHex;
import static net.gnehzr.tnoodle.scrambles.utils.ScrambleUtils.toInt;

import java.awt.Color;
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
import java.lang.reflect.Type;
import java.net.InetAddress;
import java.net.InetSocketAddress;
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

import javax.activation.MimetypesFileTypeMap;
import javax.imageio.ImageIO;

import joptsimple.OptionParser;
import joptsimple.OptionSet;
import joptsimple.OptionSpec;
import net.gnehzr.tnoodle.scrambles.InvalidScrambleException;
import net.gnehzr.tnoodle.scrambles.Scrambler;
import net.gnehzr.tnoodle.scrambles.ScramblerViewer;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.JsonArray;
import com.google.gson.JsonDeserializationContext;
import com.google.gson.JsonDeserializer;
import com.google.gson.JsonElement;
import com.google.gson.JsonParseException;
import com.google.gson.JsonPrimitive;
import com.google.gson.JsonSerializationContext;
import com.google.gson.JsonSerializer;
import com.itextpdf.text.BaseColor;
import com.itextpdf.text.Chunk;
import com.itextpdf.text.Document;
import com.itextpdf.text.DocumentException;
import com.itextpdf.text.Element;
import com.itextpdf.text.Font;
import com.itextpdf.text.Image;
import com.itextpdf.text.PageSize;
import com.itextpdf.text.Paragraph;
import com.itextpdf.text.Phrase;
import com.itextpdf.text.Rectangle;
import com.itextpdf.text.pdf.BaseFont;
import com.itextpdf.text.pdf.ColumnText;
import com.itextpdf.text.pdf.DefaultFontMapper;
import com.itextpdf.text.pdf.DefaultSplitCharacter;
import com.itextpdf.text.pdf.PdfChunk;
import com.itextpdf.text.pdf.PdfContentByte;
import com.itextpdf.text.pdf.PdfPCell;
import com.itextpdf.text.pdf.PdfPTable;
import com.itextpdf.text.pdf.PdfPageEventHelper;
import com.itextpdf.text.pdf.PdfTemplate;
import com.itextpdf.text.pdf.PdfWriter;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import com.sun.net.httpserver.HttpServer;

//TODO - put logical maximums on some of the inputs for safety purposes
@SuppressWarnings("restriction")
public class ScrambleServer {
	
	public ScrambleServer(int port, File scrambleFolder) throws IOException {
		SortedMap<String, Scrambler> scramblers = Scrambler.getScrambleGenerators(scrambleFolder);
		if(scramblers == null) {
			throw new IOException("Invalid directory: " + scrambleFolder.getAbsolutePath());
		}
		HttpServer server = HttpServer.create(new InetSocketAddress(port), 0);
		server.createContext("/", new FileHandler());
		server.createContext("/import/", new ImporterHandler());
		server.createContext("/scramble/", new ScramblerHandler(scramblers));
		server.createContext("/view/", new ScrambleViewerHandler(scramblers));
		// the default executor invokes everything in 1 thread, so threading isn't an issue!
		server.setExecutor(Executors.newCachedThreadPool());
		server.start();
		
		String addr = InetAddress.getLocalHost().getHostAddress() + ":" + port;
		System.out.println("Server started on " + addr);
		System.out.println("Visit http://" + addr + " for a readme and demo.");
	}
	
	private class FileHandler extends SafeHttpHandler {
		MimetypesFileTypeMap mimes = new MimetypesFileTypeMap();
		{
			mimes.addMimeTypes("text/css css");
			mimes.addMimeTypes("text/html html htm");
			
			mimes.addMimeTypes("application/x-javascript js");
			
			mimes.addMimeTypes("application/png png");
			mimes.addMimeTypes("application/gif gif");
			mimes.addMimeTypes("application/octet-stream *");
		}
		
		protected void wrappedHandle(HttpExchange t, String[] path, HashMap<String, String> query) throws IOException {
			ByteArrayOutputStream bytes = new ByteArrayOutputStream();
			String fileName = t.getRequestURI().getPath().substring(1);
			if(fileName.isEmpty() || fileName.endsWith("/"))
				fileName += "index.html";
			
			fullyReadInputStream(getClass().getResourceAsStream("/" + fileName), bytes);
			sendBytes(t, bytes, mimes.getContentType(fileName));
		}
	}
	
	private class ImporterHandler extends SafeHttpHandler {
		private final Pattern BOUNDARY_PATTERN = Pattern.compile("^.+boundary\\=(.+)$");
		@Override
		protected void wrappedHandle(HttpExchange t, String[] path, HashMap<String, String> query) throws Exception {
			if(t.getRequestMethod().equals("POST")) {
				// we assume this means we're uploading a file
				// the following isn't terribly robust, but it should work for us
				String boundary = t.getRequestHeaders().get("Content-Type").get(0);
				Matcher m = BOUNDARY_PATTERN.matcher(boundary);
				m.matches();
				boundary = "--" + m.group(1);
				
				BufferedReader in = new BufferedReader(new InputStreamReader(t.getRequestBody()));
				ArrayList<String> scrambles = new ArrayList<String>();
				String line;
				boolean finishedHeaders = false;
				while((line = in.readLine()) != null) {
					if(line.equals(boundary + "--"))
						break;
					if(finishedHeaders)
						scrambles.add(line);
					if(line.isEmpty()) //this indicates a CRLF CRLF
						finishedHeaders = true;
				}
				//we need to escape our backslashes
				String json = GSON.toJson(scrambles).replaceAll("\\\\", Matcher.quoteReplacement("\\\\"));
				ByteArrayOutputStream bytes = new ByteArrayOutputStream();
				BufferedWriter html = new BufferedWriter(new OutputStreamWriter(bytes));
				html.append("<html><body><script>parent.postMessage('");
				html.append(json);
				html.append("', '*');</script></html>");
				html.close();
				sendHtml(t, bytes);
			} else {
				String urlStr = query.get("url");
				if(!urlStr.startsWith("http")) //might as well give it our best shot
					urlStr = "http://" + urlStr;
				URL url = new URL(urlStr);
				URLConnection conn = url.openConnection();
				ArrayList<String> scrambles = new ArrayList<String>();
				BufferedReader in = new BufferedReader(new InputStreamReader(conn.getInputStream()));
				String line;
				while((line = in.readLine()) != null) {
					scrambles.add(line);
				}
				sendJSON(t, GSON.toJson(scrambles), query.get("callback"));
			}
		}

	}
	
	private class ScrambleViewerHandler extends SafeHttpHandler {
		private SortedMap<String, Scrambler> scramblers;
		public ScrambleViewerHandler(SortedMap<String, Scrambler> scramblers) {
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
			
			Scrambler gen = scramblers.get(puzzle);
			if(gen == null) {
				sendJSONError(t, "Invalid scramble generator: " + puzzle, callback);
				return;
			} else if(!(gen instanceof ScramblerViewer)) {
				sendJSONError(t, "Specified scramble generator: " + puzzle + " does not support image generation.", callback);
				return;
			}
			ScramblerViewer generator = (ScramblerViewer) gen;

			HashMap<String, Color> colorScheme = generator.parseColorScheme(query.get("scheme"));
			
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
					sendText(t, throwableToString(e));
				}
			} else if(extension.equals("json")) {
				sendJSON(t, GSON.toJson(generator.getDefaultPuzzleImageInfo().jsonize()), callback);
			} else {
				sendJSONError(t, "Invalid extension: " + extension, callback);
			}
		}
	}

	private class ScramblerHandler extends SafeHttpHandler {
		private SortedMap<String, Scrambler> scramblers;
		private String puzzleNamesJSON;
		public ScramblerHandler(SortedMap<String, Scrambler> scramblers) {
			this.scramblers = scramblers;
			
			//listing available scrambles
			String[][] puzzleNames = new String[scramblers.size()][2];
			int i = 0;
			for(Entry<String, Scrambler> scrambler : scramblers.entrySet()) {
				String shortName = scrambler.getValue().getShortName();
				String longName = scrambler.getValue().getLongName();
				puzzleNames[i][0] = shortName;
				puzzleNames[i][1] = longName;
				i++;
			}
			puzzleNamesJSON = GSON.toJson(puzzleNames);
		}
		
		private final DefaultSplitCharacter SPLIT_ON_SPACES = new DefaultSplitCharacter() {
			@Override
			public boolean isSplitCharacter(int start,
					int current, int end, char[] cc,
					PdfChunk[] ck) {
				return getCurrentCharacter(current, cc, ck) == ' '; //only allow splitting on spaces
			}
		};

		private ByteArrayOutputStream createPdf(Scrambler generator, String[] scrambles, String title, Integer width, Integer height, String scheme) {
			if(width == null)
				width = 200;
			if(height == null)
				height = (int) (PageSize.LETTER.getHeight()/5); //optimizing for 5 scrambles per page
				
			PdfWriter docWriter = null;
			try {
				Document doc = new Document(PageSize.LETTER, 0, 0, 75, 75);
				ByteArrayOutputStream baosPDF = new ByteArrayOutputStream();
				docWriter = PdfWriter.getInstance(doc, baosPDF);
				
				doc.addAuthor(this.getClass().getName());
				doc.addCreationDate();
				doc.addProducer();
				doc.addCreator(this.getClass().getName());
				if(title != null)
					doc.addTitle(title);
				
				docWriter.setBoxSize("art", new Rectangle(36, 54, PageSize.LETTER.getWidth()-36, PageSize.LETTER.getHeight()-54));
				docWriter.setPageEvent(new HeaderFooter(generator.getLongName(), title));

				doc.setPageSize(PageSize.LETTER);

				doc.open();

				ScramblerViewer sig = null;
				Dimension dim = new Dimension(0, 0);
				HashMap<String, Color> colorScheme = null;
				if(generator instanceof ScramblerViewer && width > 0 && height > 0) {
					sig = (ScramblerViewer)generator;
					dim = sig.getPreferredSize(width, height);
					colorScheme = sig.parseColorScheme(scheme);
				}
				
				PdfPTable table = new PdfPTable(3);

				float maxWidth = 0;
				for(int i = 0; i < scrambles.length; i++) {
					String scramble = scrambles[i];
					Chunk ch = new Chunk((i+1)+".");
					maxWidth = Math.max(maxWidth, ch.getWidthPoint());
					PdfPCell nthscramble = new PdfPCell(new Paragraph(ch));
					nthscramble.setVerticalAlignment(PdfPCell.ALIGN_MIDDLE);
					table.addCell(nthscramble);
					
					Chunk scrambleChunk = new Chunk(scramble);
					scrambleChunk.setSplitCharacter(SPLIT_ON_SPACES);
					try {
						BaseFont courier = BaseFont.createFont(BaseFont.COURIER, BaseFont.CP1252, BaseFont.EMBEDDED);
						scrambleChunk.setFont(new Font(courier, 12, Font.NORMAL));
					} catch(IOException e1) {
						e1.printStackTrace();
					}
					PdfPCell scrambleCell = new PdfPCell(new Paragraph(scrambleChunk));
					scrambleCell.setVerticalAlignment(PdfPCell.ALIGN_MIDDLE);
					table.addCell(scrambleCell);
					
					if(sig == null) {
						table.addCell("Scramble images not implemented for this puzzle");
					} else {
						try {
							PdfContentByte cb = docWriter.getDirectContent();
							PdfTemplate tp = cb.createTemplate(dim.width, dim.height);
							Graphics2D g2 = tp.createGraphics(dim.width, dim.height, new DefaultFontMapper());

							sig.drawScramble(g2, dim, scramble, colorScheme);
							g2.dispose();
							PdfPCell imgCell = new PdfPCell(Image.getInstance(tp), true);
							imgCell.setBackgroundColor(BaseColor.GRAY);
							imgCell.setVerticalAlignment(PdfPCell.ALIGN_MIDDLE);
							table.addCell(imgCell);
						} catch (Exception e) {
							table.addCell("Error drawing scramble: " + e.getMessage());
							e.printStackTrace();
						}
					}
				}
				maxWidth*=2; //TODO - i have no freaking clue why i need to do this
				table.setTotalWidth(new float[] { maxWidth, doc.getPageSize().getWidth()-maxWidth-dim.width, dim.width });
				doc.add(table);

				
				doc.close();
				return baosPDF;
			} catch (DocumentException e) {
				e.printStackTrace();
			} finally {
				docWriter.close();
			}
			return null;
		}
		
	    class HeaderFooter extends PdfPageEventHelper {
	    	private String header;
	    	public HeaderFooter(String puzzle, String title) {
	    		header = puzzle + (title == null ? "" : " " + title);
	    	}
	        public void onEndPage(PdfWriter writer, Document document) {
	            Rectangle rect = writer.getBoxSize("art");
	            //TODO - urgh... http://stackoverflow.com/questions/759909/how-to-add-total-page-number-on-every-page-with-itext	            
	            ColumnText.showTextAligned(writer.getDirectContent(),
	                    Element.ALIGN_CENTER, new Phrase(header + " page " + writer.getPageNumber()),
	                    (rect.getLeft() + rect.getRight()) / 2, rect.getTop(), 0);
	        }
	    }
		
		protected void wrappedHandle(HttpExchange t, String[] path, HashMap<String, String> query) {
			if(path.length == 1) {
				sendJSON(t, puzzleNamesJSON, query.get("callback"));
			} else {
				String puzzle, title, ext;
				String[] puzzle_title_ext = path[1].split("\\.");
				switch(puzzle_title_ext.length) {
				case 1:
					puzzle = puzzle_title_ext[0];
					title = null;
					ext = null;
					break;
				case 2:
					puzzle = puzzle_title_ext[0];
					title = null;
					ext = puzzle_title_ext[1];
					break;
				case 3:
					puzzle = puzzle_title_ext[0];
					title = puzzle_title_ext[1];
					ext = puzzle_title_ext[2];
					break;
				default:
					sendText(t, "Invalid number of periods: " + path[1]);
					return;
				}
				Scrambler generator = scramblers.get(puzzle);
				if(generator == null) {
					sendText(t, "Invalid scramble generator: " + puzzle);
					return;
				}

				String seed = query.get("seed");
				int count = toInt(query.get("count"), 1);
				String[] scrambles;
				if(seed != null) {
					int offset = toInt(query.get("offset"), 0);
					scrambles = generator.generateSeededScrambles(seed, count, offset);
				} else
					scrambles = generator.generateScrambles(count);
				
				if(ext == null || ext.equals("txt")) {
					StringBuilder sb = new StringBuilder();
					for(String scramble : scrambles) {
						//we replace newlines with spaces because clients will assume that scrambles
						//are separated by carraige return line feeds
						sb.append(scramble.replaceAll("\n", " ")).append("\r\n");
					}
					sendText(t, sb.toString());
				} else if(ext.equals("json")) {
					sendJSON(t, GSON.toJson(scrambles), query.get("callback"));
				} else if(ext.equals("pdf")) {
					ByteArrayOutputStream pdf = createPdf(generator, scrambles, title, toInt(query.get("width"), null), toInt(query.get("height"), null), query.get("scheme"));
					t.getResponseHeaders().set("Content-Disposition", "inline");
					//TODO - what's the right way to do caching?
					sendBytes(t, pdf, "application/pdf");
				} else {
					sendText(t, "Invalid extension: " + ext);
				}
			}
		}
	}

	public static final Gson GSON = new GsonBuilder()
									.registerTypeAdapter(Color.class, new Colorizer())
									.registerTypeAdapter(GeneralPath.class, new Pather())
									.create();
	
	private static class Colorizer implements JsonSerializer<Color>, JsonDeserializer<Color> {

		@Override
		public JsonElement serialize(Color c, Type t, JsonSerializationContext context) {
			return new JsonPrimitive(toHex(c));
		}

		@Override
		public Color deserialize(JsonElement json, Type t, JsonDeserializationContext context) throws JsonParseException {
			Color c = toColor(json.getAsString());
			if(c == null)
				throw new JsonParseException("Invalid color");
			return c;
		}

	}
	
	private static class Pather implements JsonSerializer<GeneralPath>, JsonDeserializer<GeneralPath> {

		/*
		 * NOTE: this is ported from ScrambleUtils.toPoints()
		 */
		@Override
		public JsonElement serialize(GeneralPath s, Type t, JsonSerializationContext context) {
			JsonArray areas = new JsonArray();
			JsonArray area = null;
			double[] coords = new double[2];
			PathIterator pi = s.getPathIterator(null, 1.0);
			while(!pi.isDone()) {
				int val = pi.currentSegment(coords);
				switch(val) {
				case PathIterator.SEG_MOVETO:
					area = new JsonArray();
					areas.add(area);
				case PathIterator.SEG_LINETO:
				case PathIterator.SEG_CLOSE:
					JsonArray pt = new JsonArray();
					pt.add(new JsonPrimitive(coords[0]));
					pt.add(new JsonPrimitive(coords[1]));
					area.add(pt);
					break;
				default:
					return null;
				}
				pi.next();
			}
			return areas;
		}

		@Override
		public GeneralPath deserialize(JsonElement json, Type t, JsonDeserializationContext context) throws JsonParseException {
			GeneralPath path = new GeneralPath();
			
			JsonArray areas = json.getAsJsonArray();
			for(int c = 0; c < areas.size(); c++) {
				JsonArray area = areas.get(c).getAsJsonArray();
				if(area.size() == 0)
					continue;
				
				JsonArray pt = area.get(0).getAsJsonArray();
				path.moveTo(pt.get(0).getAsDouble(), pt.get(1).getAsDouble());
				for(int i = 1; i < area.size(); i++) {
					pt = area.get(1).getAsJsonArray();
					path.lineTo(pt.get(0).getAsDouble(), pt.get(1).getAsDouble());
				}
			}
			path.closePath();
			return path;
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

@SuppressWarnings("restriction")
abstract class SafeHttpHandler implements HttpHandler {

	@Override
	public final void handle(HttpExchange t) throws IOException {
		HashMap<String, String> query = parseQuery(t.getRequestURI().getRawQuery());
		try {
			//substring(1) gets rid of the leading /
			String[] path = t.getRequestURI().getPath().substring(1).split("/");
			wrappedHandle(t, path, query);
		} catch(Exception e) {
			jsonError(t, e, query.get("callback"));
		}
	}
	
	protected abstract void wrappedHandle(HttpExchange t, String[] path, HashMap<String, String> query) throws Exception;

	private static HashMap<String, String> parseQuery(String query) {
		HashMap<String, String> queryMap = new HashMap<String, String>();
		if(query == null) return queryMap;
		String[] pairs = query.split("&");
		for(String pair : pairs) {
			String[] key_value = pair.split("=");
			if(key_value.length == 1)
				queryMap.put(key_value[0], ""); //this allows for flags such as http://foo/blah?kill&burn
			else
				try {
					queryMap.put(key_value[0], URLDecoder.decode(key_value[1], "utf-8"));
				} catch (UnsupportedEncodingException e) {
					queryMap.put(key_value[0], key_value[1]); //worst case, just put the undecoded string
				}
		}
		return queryMap;
	}

	
	protected static void fullyReadInputStream(InputStream is, ByteArrayOutputStream bytes) throws IOException {
		final byte[] buffer = new byte[0x10000];
		for(;;) {
			int read = is.read(buffer);
			if(read < 0)
				break;
			bytes.write(buffer, 0, read);
		}
	}
	
	protected static void sendJSON(HttpExchange t, String json, String callback) {
		t.getResponseHeaders().set("Access-Control-Allow-Origin", "*"); //this allows x-domain ajax
		if(callback != null) {
			json = callback + "(" + json + ")";
		}
		sendBytes(t, json.getBytes(), "application/json"); //TODO - charset?
	}
	
	protected static void sendJSONError(HttpExchange t, String error, String callback) {
		HashMap<String, String> json = new HashMap<String, String>();
		json.put("error", error);
		sendJSON(t, ScrambleServer.GSON.toJson(json), callback);
	}
	
	protected static void jsonError(HttpExchange t, Throwable error, String callback) {
		sendJSONError(t, throwableToString(error), callback);
	}
	
	protected static void sendBytes(HttpExchange t, ByteArrayOutputStream bytes, String contentType) {
		try {
			t.getResponseHeaders().set("Content-Type", contentType);
			t.sendResponseHeaders(200, bytes.size());
			bytes.writeTo(t.getResponseBody());
		} catch (IOException e) {
			e.printStackTrace();
		} finally {
			try {
				t.getResponseBody().close();
			} catch (IOException e) {
				e.printStackTrace();
			}
		}
	}
	
	protected static void sendBytes(HttpExchange t, byte[] bytes, String contentType) {
		try {
			t.getResponseHeaders().set("Content-Type", contentType);
			t.sendResponseHeaders(200, bytes.length);
			t.getResponseBody().write(bytes);
		} catch (IOException e) {
			e.printStackTrace();
		} finally {
			try {
				t.getResponseBody().close();
			} catch (IOException e) {
				e.printStackTrace();
			}
		}
	}
	
	protected static void sendHtml(HttpExchange t, ByteArrayOutputStream bytes) {
		sendBytes(t, bytes, "text/html");
	}
	protected static void sendHtml(HttpExchange t, byte[] bytes) {
		sendBytes(t, bytes, "text/html");
	}
	
	protected static void sendText(HttpExchange t, String text) {
		sendBytes(t, text.getBytes(), "text/plain"); //TODO - encoding charset?
	}

}