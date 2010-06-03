package net.gnehzr.cct.scrambles;

import static net.gnehzr.cct.scrambles.ScrambleUtils.GSON;
import static net.gnehzr.cct.scrambles.ScrambleUtils.exceptionToString;
import static net.gnehzr.cct.scrambles.ScrambleUtils.parseExtension;
import static net.gnehzr.cct.scrambles.ScrambleUtils.parseQuery;
import static net.gnehzr.cct.scrambles.ScrambleUtils.sendBytes;
import static net.gnehzr.cct.scrambles.ScrambleUtils.sendJSON;
import static net.gnehzr.cct.scrambles.ScrambleUtils.sendText;
import static net.gnehzr.cct.scrambles.ScrambleUtils.toInt;
import static net.gnehzr.cct.scrambles.ScrambleUtils.toLong;

import java.awt.Color;
import java.awt.Dimension;
import java.awt.Graphics2D;
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

		private ByteArrayOutputStream createPdf(ScrambleGenerator generator, int count, boolean isSeeded, String title, String scheme) {
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
				for(int i = 1; i <= count; i++) {
					Chunk ch = new Chunk(i+".");
					maxWidth = Math.max(maxWidth, ch.getWidthPoint());
					PdfPCell nthscramble = new PdfPCell(new Paragraph(ch));
					nthscramble.setVerticalAlignment(PdfPCell.ALIGN_MIDDLE);
					table.addCell(nthscramble);
					
					String scramble = generator.generateScramble(isSeeded);
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
				//listing available scrambles
				ArrayList<String> keys = new ArrayList<String>(scramblers.keySet());
				//sorting in a way that will take into account numbers (so 10x10x10 appears after 3x3x3)
				Collections.sort(keys, Strings.getNaturalComparator());
				sendJSON(t, GSON.toJson(keys), query.get("callback"));
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

				String seedStr = query.get("seed");
				boolean isSeeded = seedStr != null && !seedStr.isEmpty();
				if(isSeeded)
					generator.setSeed(toLong(seedStr, (long) seedStr.hashCode()));

				int count = toInt(query.get("count"), 1);
				
				if(ext == null || ext.equals("txt")) {
					StringBuilder sb = new StringBuilder();
					for(int i = 0; i < count; i++) {
						//we replace newlines with spaces because clients will assume that scrambles
						//are separated by newlines
						sb.append(generator.generateScramble(isSeeded).replaceAll("\n", " ")).append('\n');
					}
					sendText(t, sb.toString());
				} else if(ext.equals("json")) {
					String[] scrambles = new String[count];
					for(int i = 0; i < count; i++) {
						scrambles[i] = generator.generateScramble(isSeeded);
					}
					System.out.println(Arrays.toString(scrambles));
					System.out.println(GSON.toJson(scrambles));
					sendJSON(t, GSON.toJson(scrambles), query.get("callback"));
				} else if(ext.equals("pdf")) {
					ByteArrayOutputStream pdf = createPdf(generator, count, isSeeded, title, query.get("scheme"));
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
