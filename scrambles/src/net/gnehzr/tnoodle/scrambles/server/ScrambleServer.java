package net.gnehzr.tnoodle.scrambles.server;

import static net.gnehzr.tnoodle.scrambles.utils.ScrambleUtils.exceptionToString;
import static net.gnehzr.tnoodle.scrambles.utils.ScrambleUtils.parseExtension;
import static net.gnehzr.tnoodle.scrambles.utils.ScrambleUtils.parseQuery;
import static net.gnehzr.tnoodle.scrambles.utils.ScrambleUtils.toColor;
import static net.gnehzr.tnoodle.scrambles.utils.ScrambleUtils.toHex;
import static net.gnehzr.tnoodle.scrambles.utils.ScrambleUtils.toInt;

import java.awt.Color;
import java.awt.Dimension;
import java.awt.Graphics2D;
import java.awt.geom.GeneralPath;
import java.awt.geom.PathIterator;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.lang.reflect.Type;
import java.net.InetAddress;
import java.net.InetSocketAddress;
import java.net.URISyntaxException;
import java.util.Arrays;
import java.util.HashMap;
import java.util.SortedMap;
import java.util.Map.Entry;

import javax.imageio.ImageIO;

import joptsimple.OptionParser;
import joptsimple.OptionSet;
import joptsimple.OptionSpec;
import net.gnehzr.tnoodle.scrambles.InvalidScrambleException;
import net.gnehzr.tnoodle.scrambles.ScrambleGenerator;
import net.gnehzr.tnoodle.scrambles.ScrambleImageGenerator;

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
		SortedMap<String, ScrambleGenerator> scramblers = ScrambleGenerator.getScrambleGenerators(scrambleFolder);
		if(scramblers == null) {
			throw new IOException("Invalid directory: " + scrambleFolder.getAbsolutePath());
		}
		HttpServer server = HttpServer.create(new InetSocketAddress(port), 0);
		server.createContext("/", new ReadmeHandler());
		server.createContext("/scrambler", new ScramblerHandler(scramblers));
		server.createContext("/viewer", new ScrambleViewerHandler(scramblers));
		// the default executor invokes everything in 1 thread, so threading isn't an issue!
		server.setExecutor(null);
		server.start();
		
		String addr = InetAddress.getLocalHost().getHostAddress() + ":" + port;
		System.out.println("Server started on " + addr);
		System.out.println("Visit http://" + addr + " for a readme and demo.");
	}
	
	private class ReadmeHandler implements HttpHandler {
		
		@Override
		public void handle(HttpExchange t) throws IOException {
			try {
				wrapped(t);
			} catch(Exception e) {
				sendText(t, exceptionToString(e));
			}
		}

		private void wrapped(HttpExchange t) throws IOException {
			InputStream is = getClass().getResourceAsStream("readme.html");
			ByteArrayOutputStream bytes = new ByteArrayOutputStream();
			final byte[] buffer = new byte[0x10000];
			for(;;) {
				int read = is.read(buffer);
				if(read < 0)
					break;
				bytes.write(buffer, 0, read);
			}
			sendHtml(t, bytes.toByteArray());
		}
	}
	
	private class ScrambleViewerHandler implements HttpHandler {
		private SortedMap<String, ScrambleGenerator> scramblers;
		public ScrambleViewerHandler(SortedMap<String, ScrambleGenerator> scramblers) {
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
					sendText(t, exceptionToString(e));
				}
			} else if(extension.equals("json")) {
				sendJSON(t, GSON.toJson(generator.getDefaultPuzzleImageInfo().jsonize()), query.get("callback"));
			} else {
				sendText(t, "Invalid extension: " + extension);
			}
		}
	}

	private class ScramblerHandler implements HttpHandler {
		private SortedMap<String, ScrambleGenerator> scramblers;
		private String puzzleNamesJSON;
		public ScramblerHandler(SortedMap<String, ScrambleGenerator> scramblers) {
			this.scramblers = scramblers;
			
			//listing available scrambles
			String[][] puzzleNames = new String[scramblers.size()][2];
			int i = 0;
			for(Entry<String, ScrambleGenerator> scrambler : scramblers.entrySet()) {
				String shortName = scrambler.getValue().getShortName();
				String longName = scrambler.getValue().getLongName();
				puzzleNames[i][0] = shortName;
				puzzleNames[i][1] = longName;
				i++;
			}
			puzzleNamesJSON = GSON.toJson(puzzleNames);
		}
		
		@Override
		public void handle(HttpExchange t) {
			try {
				wrapped(t);
			} catch(Exception e) {
				e.printStackTrace();
				sendText(t, exceptionToString(e));
			}
		}
		
		private final DefaultSplitCharacter SPLIT_ON_SPACES = new DefaultSplitCharacter() {
			@Override
			public boolean isSplitCharacter(int start,
					int current, int end, char[] cc,
					PdfChunk[] ck) {
				return getCurrentCharacter(current, cc, ck) == ' '; //only allow splitting on spaces
			}
		};

		private ByteArrayOutputStream createPdf(ScrambleGenerator generator, String[] scrambles, String title, String scheme) {
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

				ScrambleImageGenerator sig = null;
				Dimension dim = new Dimension(0, 0);
				HashMap<String, Color> colorScheme = null;
				if(generator instanceof ScrambleImageGenerator) {
					sig = (ScrambleImageGenerator)generator;
					dim = sig.getPreferredSize(200, (int) (PageSize.LETTER.getHeight()/5)); //optimizing for 5 scrambles per page
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
		
		private void wrapped(HttpExchange t) {
			//substring(1) gets rid of the leading /
			String[] path = t.getRequestURI().getPath().substring(1).split("/");
			HashMap<String, String> query = parseQuery(t.getRequestURI().getQuery());

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
				ScrambleGenerator generator = scramblers.get(puzzle);
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
						//are separated by newlines
						sb.append(scramble.replaceAll("\n", " ")).append('\n');
					}
					sendText(t, sb.toString());
				} else if(ext.equals("json")) {
					sendJSON(t, GSON.toJson(scrambles), query.get("callback"));
				} else if(ext.equals("pdf")) {
					ByteArrayOutputStream pdf = createPdf(generator, scrambles, title, query.get("scheme"));
					t.getResponseHeaders().set("Content-Type", "application/pdf");
					t.getResponseHeaders().set("Content-Disposition", "inline");
					//TODO - what's the right way to do caching?
					sendBytes(t, pdf);
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
	
	public static void sendJSON(HttpExchange t, String json, String callback) {
		t.getResponseHeaders().set("Content-Type", "application/json");
		if(callback != null) {
			json = callback + "(" + json + ")";
		}
		sendText(t, json);
	}
	
	public static void jsonError(HttpExchange t, String error, String callback) {
		HashMap<String, String> json = new HashMap<String, String>();
		json.put("error", error);
		sendJSON(t, GSON.toJson(json), callback);
	}
	
	public static void sendBytes(HttpExchange t, ByteArrayOutputStream bytes) {
		try {
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
	
	public static void sendBytes(HttpExchange t, byte[] bytes) {
		try {
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
	
	public static void sendHtml(HttpExchange t, byte[] bytes) {
		t.getResponseHeaders().set("Content-Type", "text/html");
		sendBytes(t, bytes);
	}
	
	public static void sendText(HttpExchange t, String text) {
		sendBytes(t, text.getBytes()); //TODO - encoding charset?
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
