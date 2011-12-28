package tnoodleServerHandler.webscrambles;

import static net.gnehzr.tnoodle.utils.Utils.GSON;
import static net.gnehzr.tnoodle.utils.Utils.toInt;

import java.awt.Color;
import java.awt.Dimension;
import java.awt.Graphics2D;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.net.URLDecoder;
import java.util.Date;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.SortedMap;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

import net.gnehzr.tnoodle.scrambles.InvalidScrambleException;
import net.gnehzr.tnoodle.scrambles.ScrambleCacher;
import net.gnehzr.tnoodle.scrambles.Scrambler;
import net.gnehzr.tnoodle.utils.BadClassDescriptionException;
import net.gnehzr.tnoodle.utils.LazyInstance;
import net.gnehzr.tnoodle.utils.Utils;

import com.itextpdf.text.BaseColor;
import com.itextpdf.text.Chunk;
import com.itextpdf.text.Document;
import com.itextpdf.text.DocumentException;
import com.itextpdf.text.Element;
import com.itextpdf.text.Font;
import com.itextpdf.text.Image;
import com.itextpdf.text.List;
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
import com.itextpdf.text.pdf.PdfImportedPage;
import com.itextpdf.text.pdf.PdfPCell;
import com.itextpdf.text.pdf.PdfPTable;
import com.itextpdf.text.pdf.PdfReader;
import com.itextpdf.text.pdf.PdfSmartCopy;
import com.itextpdf.text.pdf.PdfTemplate;
import com.itextpdf.text.pdf.PdfWriter;
import static net.gnehzr.tnoodle.utils.Utils.azzert;

class ScrambleRequest {
	private static final int SCRAMBLES_PER_PAGE = 5;
	
	private static final int MAX_COUNT = 100;
	private static final int MAX_COPIES = 100;
	
	private static HashMap<String, ScrambleCacher> scrambleCachers = new HashMap<String, ScrambleCacher>();
	private static SortedMap<String, LazyInstance<Scrambler>> scramblers;
	static {
		try {
			scramblers = Scrambler.getScramblers();
		} catch (BadClassDescriptionException e) {
			e.printStackTrace();
		} catch (IOException e) {
			e.printStackTrace();
		}
		
		// This is an awful workaround for https://github.com/jfly/tnoodle/issues/1.
		// Hopefully someday this problem will go away, and this code can simply be deleted.
		try {
			ScrambleRequest r = new ScrambleRequest("title", "3x3x3", null);
			requestsToPdf("", new Date(), new ScrambleRequest[] { r });
		} catch (Throwable e) {
			e.printStackTrace();
			System.out.println("Yikes! Did you just see a warning similar to this " +
					"\"java.lang.Error: Probable fatal error:No fonts found.\"? " +
					"This exception may have been expected. See " +
					"https://github.com/jfly/tnoodle/issues/1 for more details.");
		}
	}
	
	// This is here just to make GSON work.
	public ScrambleRequest(){}
	
	
	public String[] scrambles;
	public Scrambler scrambler;
	public int count;
	public int copies;
	public String title;
	public boolean fmc;
	public HashMap<String, Color> colorScheme;
	public ScrambleRequest(String title, String scrambleRequestUrl, String seed) throws InvalidScrambleRequestException, UnsupportedEncodingException {
		String[] puzzle_count_copies_scheme = scrambleRequestUrl.split("\\*");
		title = URLDecoder.decode(title, "utf-8");
		for(int i = 0; i < puzzle_count_copies_scheme.length; i++) {
			puzzle_count_copies_scheme[i] = URLDecoder.decode(puzzle_count_copies_scheme[i], "utf-8");
		}
		String countStr = "";
		String copiesStr = "";
		String scheme = "";
		String puzzle;
		switch(puzzle_count_copies_scheme.length) {
		case 4:
			scheme = puzzle_count_copies_scheme[3];
		case 3:
			copiesStr = puzzle_count_copies_scheme[2];
		case 2:
			countStr = puzzle_count_copies_scheme[1];
		case 1:
			puzzle = puzzle_count_copies_scheme[0];
			break;
		default:
			throw new InvalidScrambleRequestException("Invalid puzzle request " + scrambleRequestUrl);
		}
		
		LazyInstance<Scrambler> lazyScrambler = scramblers.get(puzzle);
		if(lazyScrambler == null) {
			throw new InvalidScrambleRequestException("Invalid scrambler: " + puzzle);
		}
		
		try {
			this.scrambler = lazyScrambler.cachedInstance();
		} catch (Exception e) {
			throw new InvalidScrambleRequestException(e);
		}
		
		ScrambleCacher scrambleCacher = scrambleCachers.get(puzzle);
		if(scrambleCacher == null) {
			scrambleCacher = new ScrambleCacher(scrambler);
			scrambleCachers.put(puzzle, scrambleCacher);
		}

		this.title = title;
		fmc = countStr.equals("fmc");
		if(fmc) {
			this.count = 1;
		} else {
			this.count = Math.min(toInt(countStr, 1), MAX_COUNT);
		}
		this.copies = Math.min(toInt(copiesStr, 1), MAX_COPIES);
		if(seed != null) {
			this.scrambles = scrambler.generateSeededScrambles(seed, count);
		} else {
			this.scrambles = scrambleCacher.newScrambles(count);
		}
		
		this.colorScheme = scrambler.parseColorScheme(scheme);
	}
	
	public static ScrambleRequest[] parseScrambleRequests(LinkedHashMap<String, String> query, String seed) throws UnsupportedEncodingException, InvalidScrambleRequestException {
		ScrambleRequest[] scrambleRequests;
		if(query.size() == 0) {
			throw new InvalidScrambleRequestException("Must specify at least one scramble request");
		} else {
			scrambleRequests = new ScrambleRequest[query.size()];
			int i = 0;
			for(String title : query.keySet()) {
				// Note that we prefix the seed with the title of the round! This ensures that we get unique
				// scrambles in different rounds. Thanks to Ravi Fernando for noticing this at Stanford Fall 2011. 
				// (http://www.worldcubeassociation.org/results/c.php?i=StanfordFall2011).
				String uniqueSeed = null;
				if(seed != null) {
					uniqueSeed = title + seed;
				}
				scrambleRequests[i++] = new ScrambleRequest(title, query.get(title), uniqueSeed);
			}
		}
		return scrambleRequests;
	}
	

	private static final DefaultSplitCharacter SPLIT_ON_SPACES = new DefaultSplitCharacter() {
		@Override
		public boolean isSplitCharacter(int start, int current, int end, char[] cc, PdfChunk[] ck) {
			return getCurrentCharacter(current, cc, ck) == ' '; //only allow splitting on spaces
		}
	};


	private static PdfReader createPdf(String globalTitle, Date creationDate, ScrambleRequest scrambleRequest) throws DocumentException, IOException {
		ByteArrayOutputStream pdfOut = new ByteArrayOutputStream();
		Document doc = new Document(PageSize.LETTER, 0, 0, 75, 75);
		PdfWriter docWriter = PdfWriter.getInstance(doc, pdfOut);

		docWriter.setBoxSize("art", new Rectangle(36, 54, PageSize.LETTER.getWidth()-36, PageSize.LETTER.getHeight()-54));
		
		doc.addCreationDate();
		doc.addProducer();
//		doc.addAuthor(this.getClass().getName());
//		doc.addCreator(this.getClass().getName());
		if(globalTitle != null) {
			doc.addTitle(globalTitle);
		}
		
		doc.open();
		// Note that we ignore scrambleRequest.copies here.
		addScrambles(docWriter, doc, scrambleRequest, globalTitle);
		doc.close();
		
		// TODO - is there a better way to convert from a PdfWriter to a PdfReader?
		PdfReader pr = new PdfReader(pdfOut.toByteArray());
		if(scrambleRequest.fmc) {
			// We don't watermark the FMC sheets because they already have
			// the competition name on them.
			return pr;
		}
		
		pdfOut = new ByteArrayOutputStream();
		doc = new Document(PageSize.LETTER, 0, 0, 75, 75);
		docWriter = PdfWriter.getInstance(doc, pdfOut);
		doc.open();
		
		PdfContentByte cb = docWriter.getDirectContent();

		for(int pageN = 1; pageN <= pr.getNumberOfPages(); pageN++) {
			PdfImportedPage page = docWriter.getImportedPage(pr, pageN);
			
			doc.newPage();
			cb.addTemplate(page, 0, 0);

			Rectangle rect = pr.getBoxSize(pageN, "art");

			ColumnText.showTextAligned(cb,
					Element.ALIGN_LEFT, new Phrase(Utils.SDF.format(creationDate)),
					rect.getLeft(), rect.getTop(), 0);

			if(pr.getNumberOfPages() > 1) {
				ColumnText.showTextAligned(cb,
						Element.ALIGN_RIGHT, new Phrase(pageN + "/" + pr.getNumberOfPages()),
						rect.getRight(), rect.getTop(), 0);
			}
		}

		doc.close();

		// TODO - is there a better way to convert from a PdfWriter to a PdfReader?
		pr = new PdfReader(pdfOut.toByteArray());
		return pr;

//		The PdfStamper class doesn't seem to be working.
//		pdfOut = new ByteArrayOutputStream();
//		PdfStamper ps = new PdfStamper(pr, pdfOut);
//		
//		for(int pageN = 1; pageN <= pr.getNumberOfPages(); pageN++) {
//			PdfContentByte pb = ps.getUnderContent(pageN);
//			Rectangle rect = pr.getBoxSize(pageN, "art");
//			System.out.println(rect.getLeft());
//			System.out.println(rect.getWidth());
//	        ColumnText.showTextAligned(pb,
//	                Element.ALIGN_LEFT, new Phrase("Hello people!"), 36, 540, 0);
////			ColumnText.showTextAligned(pb,
////					Element.ALIGN_CENTER, new Phrase("HELLO WORLD"),
////					(rect.getLeft() + rect.getRight()) / 2, rect.getTop(), 0);
//		}
//		ps.close();
//		return ps.getReader();
	}
	
	private static void addScrambles(PdfWriter docWriter, Document doc, ScrambleRequest scrambleRequest, String globalTitle) throws DocumentException, IOException {
		azzert(scrambleRequest.count == scrambleRequest.scrambles.length);
		
		HashMap<String, Color> colorScheme = scrambleRequest.colorScheme;
		Rectangle pageSize = PageSize.LETTER;
		
		if(scrambleRequest.fmc) {
			azzert(scrambleRequest.count == 1);
			String scramble = scrambleRequest.scrambles[0];
			
			PdfContentByte cb = docWriter.getDirectContent();
			BaseFont bf = BaseFont.createFont(BaseFont.HELVETICA, BaseFont.CP1252, BaseFont.NOT_EMBEDDED);
			
			int bottom = 50;
			int left = 35;
			int right = (int) (pageSize.getWidth()-left);
			int top = (int) (pageSize.getHeight()-bottom);
			
			int height = top - bottom;
			int width = right - left;
			
			int solutionBorderTop = bottom + (int) (height*.5);
			int scrambleBorderTop = solutionBorderTop + 40;
			
			int rulesRight = left + (int) (width*.7);
			
			int competitorInfoBottom = top - (int) (height*.18);
			int gradeBottom = competitorInfoBottom - 40;
			int competitorInfoLeft = right - (int) (width*.45);
			
			int padding = 5;
			
			// Outer border
			cb.setLineWidth(2f); 
			cb.moveTo(left, top);
			cb.lineTo(left, bottom);
			cb.lineTo(right, bottom);
			cb.lineTo(right, top);
			
			// Solution border
			cb.moveTo(left, solutionBorderTop);
			cb.lineTo(right, solutionBorderTop);
			
			// Rules bottom border
			cb.moveTo(left, scrambleBorderTop);
			cb.lineTo(rulesRight, scrambleBorderTop);

			// Rules right border
			cb.lineTo(rulesRight, gradeBottom);
			
			// Grade bottom border
			cb.moveTo(competitorInfoLeft, gradeBottom);
			cb.lineTo(right, gradeBottom);
			
			// Competitor info bottom border
			cb.moveTo(competitorInfoLeft, competitorInfoBottom);
			cb.lineTo(right, competitorInfoBottom);
			
			// Competitor info left border
			cb.moveTo(competitorInfoLeft, gradeBottom);
			cb.lineTo(competitorInfoLeft, top);
			
			// Solution lines
			int availableSolutionWidth = right - left;
			int availableSolutionHeight = scrambleBorderTop - bottom;
			int lineWidth = 25;
			int lineHeight = 40;
			int linesX = (availableSolutionWidth/lineWidth + 1)/2;
			int allocatedX = (2*linesX-1)*lineWidth;
			int offsetX = (availableSolutionWidth-allocatedX)/2;
			int linesY = (availableSolutionHeight / lineHeight) - 1;
			for(int y = 0; y < linesY; y++) {
				for(int x = 0; x < linesX; x++) {
					int xPos = left + offsetX + 2*x*lineWidth;
					int yPos = solutionBorderTop - (y+1)*lineHeight;
					cb.moveTo(xPos, yPos);
					cb.lineTo(xPos+lineWidth, yPos);
				}
			}
			
			cb.stroke();
			
			cb.beginText();
			int availableScrambleSpace = right-left - 2*padding;
			int scrambleFontSize = 20;
			String scrambleStr = "Scramble: " + scramble;
			float scrambleWidth;
			do {
				scrambleFontSize--;
				scrambleWidth = bf.getWidthPoint(scrambleStr, scrambleFontSize);
			} while(scrambleWidth > availableScrambleSpace);
			
			cb.setFontAndSize(bf, scrambleFontSize);
			int scrambleY = 3 + solutionBorderTop+(scrambleBorderTop-solutionBorderTop-scrambleFontSize)/2;
			cb.showTextAligned(PdfContentByte.ALIGN_LEFT, scrambleStr, left+padding, scrambleY, 0);
			cb.endText();
			
			int availableScrambleWidth = right-rulesRight;
			int availableScrambleHeight = gradeBottom-scrambleBorderTop;
			Dimension dim = scrambleRequest.scrambler.getPreferredSize(availableScrambleWidth-2, availableScrambleHeight-2);
			PdfTemplate tp = cb.createTemplate(dim.width, dim.height);
			Graphics2D g2 = tp.createGraphics(dim.width, dim.height, new DefaultFontMapper());

			try {
				scrambleRequest.scrambler.drawScramble(g2, dim, scramble, colorScheme);
			} catch (InvalidScrambleException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
			g2.dispose();
			cb.addImage(Image.getInstance(tp), dim.width, 0, 0, dim.height, rulesRight + (availableScrambleWidth-dim.width)/2, scrambleBorderTop + (availableScrambleHeight-dim.height)/2);
			
			ColumnText ct = new ColumnText(cb);
			
			int offsetTop = 20;
			int marginBottom = 10;
			
			cb.beginText();
			int fontSize = 15;
			cb.setFontAndSize(bf, fontSize);
			cb.showTextAligned(PdfContentByte.ALIGN_CENTER, globalTitle, competitorInfoLeft+(right-competitorInfoLeft)/2, top-offsetTop, 0);
			offsetTop += fontSize + 2;
			cb.endText();
			
			cb.beginText();
			cb.setFontAndSize(bf, fontSize);
			cb.showTextAligned(PdfContentByte.ALIGN_CENTER, scrambleRequest.title, competitorInfoLeft+(right-competitorInfoLeft)/2, top-offsetTop, 0);
			offsetTop += fontSize + marginBottom;
			cb.endText();
			
			cb.beginText();
			fontSize = 15;
			cb.setFontAndSize(bf, fontSize);
			cb.showTextAligned(PdfContentByte.ALIGN_LEFT, "Competitor: __________________", competitorInfoLeft+padding, top-offsetTop, 0);
			offsetTop += fontSize + marginBottom;
			cb.endText();
			
			cb.beginText();
			
			fontSize = 15;
			cb.setFontAndSize(bf, fontSize);
			cb.showTextAligned(PdfContentByte.ALIGN_LEFT, "WCA ID:", competitorInfoLeft+padding, top-offsetTop, 0);
			
			cb.setFontAndSize(bf, 19);
			int wcaIdLength = 63;
			cb.showTextAligned(PdfContentByte.ALIGN_LEFT, "_ _ _ _  _ _ _ _  _ _", competitorInfoLeft+padding+wcaIdLength, top-offsetTop, 0);
			
			offsetTop += fontSize + marginBottom;
			cb.endText();
			
			cb.beginText();
			fontSize = 15;
			cb.setFontAndSize(bf, fontSize);
			cb.showTextAligned(PdfContentByte.ALIGN_LEFT, "Signature: ___________________", competitorInfoLeft+padding, top-offsetTop, 0);
			offsetTop += fontSize + marginBottom;
			cb.endText();
			
			cb.beginText();
			fontSize = 11;
			cb.setFontAndSize(bf, fontSize);
			cb.showTextAligned(PdfContentByte.ALIGN_CENTER, "DO NOT FILL IF YOU ARE THE COMPETITOR", competitorInfoLeft + (right-competitorInfoLeft)/2, top-offsetTop, 0);
			offsetTop += fontSize + marginBottom;
			cb.endText();
			
			cb.beginText();
			fontSize = 11;
			cb.setFontAndSize(bf, fontSize);
			cb.showTextAligned(PdfContentByte.ALIGN_CENTER, "Graded by: _______________ Result: ______", competitorInfoLeft + (right-competitorInfoLeft)/2, top-offsetTop, 0);
			offsetTop += fontSize + marginBottom;
			cb.endText();
			
			cb.beginText();
			cb.setFontAndSize(bf, 25f);
			int MAGIC_NUMBER = 40; // kill me now
			cb.showTextAligned(PdfContentByte.ALIGN_CENTER, "Fewest Moves Challenge", left+(competitorInfoLeft-left)/2, top-MAGIC_NUMBER, 0);
			cb.endText();
			
			List rules = new List(List.UNORDERED);
			rules.add("Notate your solution by writing one move per bar.");
			rules.add("To delete moves, clearly erase/blacken them.");
			rules.add("Face moves are clockwise.");
			rules.add("Rotations x, y, and z follow R, U, and F.");
			rules.add("Slice moves M, E, and S follow L, D, and F.");
			rules.add("' inverts a move; 2 doubles it. w makes a face turn into double-layer, [ ] into a cube rotation.");
			
			ct.addElement(rules);
			int rulesTop = competitorInfoBottom+70;
			ct.setSimpleColumn(left+padding, scrambleBorderTop, competitorInfoLeft-padding, rulesTop, 0, Element.ALIGN_LEFT);
			ct.go();
			
			rules = new List(List.UNORDERED);
			rules.add("You have 1 hour to find a solution. Your solution length will be counted in HTM.");
			int spaces = linesX*linesY;
			rules.add("There are " + spaces + " spaces on this page. Therefore, your solution must be at most " + spaces + " moves, including rotations.");
			rules.add("Your solution must not be related to the scrambling algorithm in any way.");
			ct.addElement(rules);
			MAGIC_NUMBER = 125; // kill me now
			ct.setSimpleColumn(left+padding, scrambleBorderTop, rulesRight-padding, rulesTop-MAGIC_NUMBER, 0, Element.ALIGN_LEFT);
			ct.go();
		} else {
			int scrambleWidth = 0;
			if(scrambleRequest.scrambler.getShortName().equals("mega")) {
				// TODO - If we allow the megaminx image to be too wide, the
				// megaminx scrambles wrap when they don't have to. This is
				// a quick hack to make it just look pretty. I'm not sure what
				// a better solution would be.
				scrambleWidth = 200;
			}
			int scrambleHeight = (int) (PageSize.LETTER.getHeight()/SCRAMBLES_PER_PAGE);
			Dimension dim = scrambleRequest.scrambler.getPreferredSize(scrambleWidth, scrambleHeight);
			PdfContentByte cb = docWriter.getDirectContent();
			
			float maxWidth = 0;
			PdfPTable table = new PdfPTable(3);
			for(int i = 0; i < scrambleRequest.scrambles.length; i++) {
				String scramble = scrambleRequest.scrambles[i];
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
				} catch(IOException e) {
					e.printStackTrace();
				} catch(DocumentException e) {
					e.printStackTrace();
				}
				PdfPCell scrambleCell = new PdfPCell(new Paragraph(scrambleChunk));
				scrambleCell.setVerticalAlignment(PdfPCell.ALIGN_MIDDLE);
				table.addCell(scrambleCell);

				if(dim.width > 0 && dim.height > 0) {
					try {
						PdfTemplate tp = cb.createTemplate(dim.width, dim.height);
						Graphics2D g2 = tp.createGraphics(dim.width, dim.height, new DefaultFontMapper());

						scrambleRequest.scrambler.drawScramble(g2, dim, scramble, colorScheme);
						g2.dispose();
						PdfPCell imgCell = new PdfPCell(Image.getInstance(tp), true);
						imgCell.setBackgroundColor(BaseColor.GRAY);
						imgCell.setVerticalAlignment(PdfPCell.ALIGN_MIDDLE);
						table.addCell(imgCell);
					} catch (Exception e) {
						table.addCell("Error drawing scramble: " + e.getMessage());
						e.printStackTrace();
					}
				} else {
					table.addCell("");
				}
			}
			maxWidth*=2; //TODO - I have no freaking clue why I need to do this.
			table.setTotalWidth(new float[] { maxWidth, doc.getPageSize().getWidth()-maxWidth-dim.width, dim.width });
			
			ColumnText.showTextAligned(cb,
					Element.ALIGN_CENTER, new Phrase(globalTitle),
					(pageSize.getLeft() + pageSize.getRight()) / 2, pageSize.getTop() - 60, 0);
			
			ColumnText.showTextAligned(cb,
					Element.ALIGN_CENTER, new Phrase(scrambleRequest.title),
					(pageSize.getLeft() + pageSize.getRight()) / 2, pageSize.getTop() - 45, 0);
			doc.add(table);
		}
		doc.newPage();
	}
	
	public static ByteArrayOutputStream requestsToZip(String globalTitle, Date generationDate, ScrambleRequest[] scrambleRequests) throws IOException, DocumentException {
		ByteArrayOutputStream baosZip = new ByteArrayOutputStream();
		ZipOutputStream zipOut = new ZipOutputStream(baosZip);
		zipOut.setComment(globalTitle + " zip created on " + Utils.SDF.format(generationDate));
		for(ScrambleRequest scrambleRequest : scrambleRequests) {
			String pdfFileName = "pdf/" + scrambleRequest.title + ".pdf";
			ZipEntry entry = new ZipEntry(pdfFileName);
			zipOut.putNextEntry(entry);

			PdfReader pdfReader = createPdf(globalTitle, generationDate, scrambleRequest);
			byte[] b = new byte[pdfReader.getFileLength()];
			pdfReader.getSafeFile().readFully(b);
			zipOut.write(b);

			zipOut.closeEntry();
			
			String txtFileName = "txt/" + scrambleRequest.title + ".txt";
			entry = new ZipEntry(txtFileName);
			zipOut.putNextEntry(entry);
			zipOut.write(Utils.join(scrambleRequest.scrambles, "\r\n").getBytes());
			zipOut.closeEntry();
		}
		
		ZipEntry entry = new ZipEntry(globalTitle + ".json");
		zipOut.putNextEntry(entry);
		zipOut.write(GSON.toJson(scrambleRequests).getBytes());
		zipOut.closeEntry();
		
		zipOut.close();
		
		return baosZip;
	}

	public static ByteArrayOutputStream requestsToPdf(String globalTitle, Date generationDate, ScrambleRequest[] scrambleRequests) throws DocumentException, IOException {
		Document doc = new Document();
		ByteArrayOutputStream totalPdfOutput = new ByteArrayOutputStream();
		PdfSmartCopy totalPdfWriter = new PdfSmartCopy(doc, totalPdfOutput);
		doc.open();

		for(int i = 0; i < scrambleRequests.length; i++) {
			ScrambleRequest scrambleRequest = scrambleRequests[i];
			PdfReader pdfReader = createPdf(globalTitle, generationDate, scrambleRequest);
			for(int j = 0; j < scrambleRequest.copies; j++) {
				for(int pageN = 1; pageN <= pdfReader.getNumberOfPages(); pageN++) {
					PdfImportedPage page = totalPdfWriter.getImportedPage(pdfReader, pageN);
					totalPdfWriter.addPage(page);
				}
			}
		}
		doc.close();
		return totalPdfOutput;
	}
	
	public static void main(String[] args) throws UnsupportedEncodingException, InvalidScrambleRequestException {
		ScrambleRequest[] requests = new ScrambleRequest[] { new ScrambleRequest("title", "3x3x3", "seeding") };
		String json = GSON.toJson(requests);
		ScrambleRequest[] sr = GSON.fromJson(json, ScrambleRequest[].class);
		System.out.println(sr[0].scrambler);
	}
}
