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
import java.util.regex.Pattern;
import java.util.logging.Level;
import java.util.logging.Logger;
import java.util.SortedMap;

import net.gnehzr.tnoodle.scrambles.InvalidScrambleException;
import net.gnehzr.tnoodle.scrambles.ScrambleCacher;
import net.gnehzr.tnoodle.scrambles.Scrambler;
import net.gnehzr.tnoodle.utils.BadClassDescriptionException;
import net.gnehzr.tnoodle.utils.LazyInstantiator;
import net.gnehzr.tnoodle.utils.Utils;

import com.itextpdf.text.pdf.PdfDestination;
import com.itextpdf.text.pdf.PdfAction;
import com.itextpdf.text.pdf.PdfOutline;
import com.itextpdf.text.BaseColor;
import com.itextpdf.text.Chunk;
import com.itextpdf.text.Chapter;
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
import com.itextpdf.awt.PdfGraphics2D;
import com.itextpdf.awt.DefaultFontMapper;

import net.lingala.zip4j.exception.ZipException;
import net.lingala.zip4j.io.ZipOutputStream;
import net.lingala.zip4j.model.ZipParameters;
import net.lingala.zip4j.util.Zip4jConstants;

import static net.gnehzr.tnoodle.utils.Utils.azzert;

class ScrambleRequest {
	private static final Logger l = Logger.getLogger(ScrambleRequest.class.getName());

	private static final int SCRAMBLES_PER_PAGE = 5;
	
	private static final int MAX_COUNT = 100;
	private static final int MAX_COPIES = 100;

	private static final int WCA_MAX_MOVES_FMC = 80;
	
	private static HashMap<String, ScrambleCacher> scrambleCachers = new HashMap<String, ScrambleCacher>();
	private static SortedMap<String, LazyInstantiator<Scrambler>> scramblers;
	static {
		try {
			scramblers = Scrambler.getScramblers();
		} catch (BadClassDescriptionException e) {
			l.log(Level.INFO, "", e);
		} catch (IOException e) {
			l.log(Level.INFO, "", e);
		}
		
		// This is an awful workaround for https://github.com/jfly/tnoodle/issues/1.
		// Hopefully someday this problem will go away, and this code can simply be deleted.
		try {
			ScrambleRequest r = new ScrambleRequest("title", "333", null);
			requestsToPdf("", new Date(), new ScrambleRequest[] { r }, null);
		} catch (Throwable e) {
			l.log(Level.WARNING, "Yikes! Did you just see a warning similar to this " +
					"\"java.lang.Error: Probable fatal error:No fonts found.\"? " +
					"This exception may have been expected. See " +
					"https://github.com/jfly/tnoodle/issues/1 for more details.", e);
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
		
		LazyInstantiator<Scrambler> lazyScrambler = scramblers.get(puzzle);
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
			// We don't allow splitting on spaces that are being used as padding
			// We know a space isn't being used as padding if it is followed immediately by 
			// a non space character.
			return ( getCurrentCharacter(current, cc, ck) == ' ' && 
						( current == end || getCurrentCharacter(current+1, cc, ck) != ' ') );
		}
	};

	private static final DefaultSplitCharacter SPLIT_ON_NEWLINES = new DefaultSplitCharacter() {
		@Override
		public boolean isSplitCharacter(int start, int current, int end, char[] cc, PdfChunk[] ck) {
			return getCurrentCharacter(current, cc, ck) == '\n';
		}
	};


	private static PdfReader createPdf(String globalTitle, Date creationDate, ScrambleRequest scrambleRequest) throws DocumentException, IOException {
		azzert(scrambleRequest.scrambles.length > 0);
		ByteArrayOutputStream pdfOut = new ByteArrayOutputStream();
		Rectangle pageSize = PageSize.LETTER;
		Document doc = new Document(pageSize, 0, 0, 75, 75);
		PdfWriter docWriter = PdfWriter.getInstance(doc, pdfOut);

		docWriter.setBoxSize("art", new Rectangle(36, 54, pageSize.getWidth()-36, pageSize.getHeight()-54));
		
		doc.addCreationDate();
		doc.addProducer();
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
		doc = new Document(pageSize, 0, 0, 75, 75);
		docWriter = PdfWriter.getInstance(doc, pdfOut);
		doc.open();
		
		PdfContentByte cb = docWriter.getDirectContent();

		for(int pageN = 1; pageN <= pr.getNumberOfPages(); pageN++) {
			PdfImportedPage page = docWriter.getImportedPage(pr, pageN);
			
			doc.newPage();
			cb.addTemplate(page, 0, 0);

			Rectangle rect = pr.getBoxSize(pageN, "art");

			// Header
			ColumnText.showTextAligned(cb,
					Element.ALIGN_LEFT, new Phrase(Utils.SDF.format(creationDate)),
					rect.getLeft(), rect.getTop(), 0);

			ColumnText.showTextAligned(cb,
					Element.ALIGN_CENTER, new Phrase(globalTitle),
					(pageSize.getLeft() + pageSize.getRight()) / 2, pageSize.getTop() - 60, 0);
			
			ColumnText.showTextAligned(cb,
					Element.ALIGN_CENTER, new Phrase(scrambleRequest.title),
					(pageSize.getLeft() + pageSize.getRight()) / 2, pageSize.getTop() - 45, 0);

			if(pr.getNumberOfPages() > 1) {
				ColumnText.showTextAligned(cb,
						Element.ALIGN_RIGHT, new Phrase(pageN + "/" + pr.getNumberOfPages()),
						rect.getRight(), rect.getTop(), 0);
			}

			// Footer
			String generatedBy = "Generated by " + Utils.getProjectName() + "-" + Utils.getVersion();
			ColumnText.showTextAligned(cb,
					Element.ALIGN_CENTER, new Phrase(generatedBy),
					(pageSize.getLeft() + pageSize.getRight()) / 2, pageSize.getBottom() + 40, 0);
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
		Rectangle pageSize = doc.getPageSize();
		
		if(scrambleRequest.fmc) {
			for(int i = 0; i < scrambleRequest.scrambles.length; i++) {
				String scramble = scrambleRequest.scrambles[i];
				PdfContentByte cb = docWriter.getDirectContent();
				BaseFont bf = BaseFont.createFont(BaseFont.HELVETICA, BaseFont.CP1252, BaseFont.NOT_EMBEDDED);
				
				int bottom = 30;
				int left = 35;
				int right = (int) (pageSize.getWidth()-left);
				int top = (int) (pageSize.getHeight()-bottom);
				
				int height = top - bottom;
				int width = right - left;
				
				int solutionBorderTop = bottom + (int) (height*.5);
				int scrambleBorderTop = solutionBorderTop + 40;
				
				int competitorInfoBottom = top - (int) (height*.15);
				int gradeBottom = competitorInfoBottom - 50;
				int competitorInfoLeft = right - (int) (width*.45);

				int rulesRight = competitorInfoLeft;
				
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
				Graphics2D g2 = new PdfGraphics2D(tp, dim.width, dim.height, new DefaultFontMapper());

				try {
					scrambleRequest.scrambler.drawScramble(g2, dim, scramble, colorScheme);
				} catch (InvalidScrambleException e) {
					l.log(Level.INFO, "", e);
				}
				g2.dispose();
				cb.addImage(Image.getInstance(tp), dim.width, 0, 0, dim.height, rulesRight + (availableScrambleWidth-dim.width)/2, scrambleBorderTop + (availableScrambleHeight-dim.height)/2);
				
				ColumnText ct = new ColumnText(cb);
				
				int fontSize = 15;
				int marginBottom = 10;
				int offsetTop = 27;
				boolean showScrambleCount = scrambleRequest.scrambles.length > 1;
				if(showScrambleCount) {
					offsetTop -= fontSize + 2;
				}
				
				cb.beginText();
				cb.setFontAndSize(bf, fontSize);
				cb.showTextAligned(PdfContentByte.ALIGN_CENTER, globalTitle, competitorInfoLeft+(right-competitorInfoLeft)/2, top-offsetTop, 0);
				offsetTop += fontSize + 2;
				cb.endText();
				
				cb.beginText();
				cb.setFontAndSize(bf, fontSize);
				cb.showTextAligned(PdfContentByte.ALIGN_CENTER, scrambleRequest.title, competitorInfoLeft+(right-competitorInfoLeft)/2, top-offsetTop, 0);
				cb.endText();

				if(showScrambleCount) {
					cb.beginText();
					offsetTop += fontSize + 2;
					cb.setFontAndSize(bf, fontSize);
					cb.showTextAligned(PdfContentByte.ALIGN_CENTER, "Scramble " + (i+1) + " of " + scrambleRequest.scrambles.length, competitorInfoLeft+(right-competitorInfoLeft)/2, top-offsetTop, 0);
					cb.endText();
				}

				offsetTop += fontSize + marginBottom;
				
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
				
				offsetTop += fontSize + (int) (marginBottom*1.8);
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
				rules.add("Face moves F, B, R, L, U, and D are clockwise.");
				rules.add("Rotations x, y, and z follow R, U, and F.");
				rules.add("Slice moves M, S, and E follow L, F, and D.");
				rules.add("' inverts a move; 2 doubles it. w makes a face turn into double-layer, [ ] into a cube rotation.");
				
				ct.addElement(rules);
				int rulesTop = competitorInfoBottom+55;
				ct.setSimpleColumn(left+padding, scrambleBorderTop, competitorInfoLeft-padding, rulesTop, 0, Element.ALIGN_LEFT);
				ct.go();
				
				rules = new List(List.UNORDERED);
				rules.add("You have 1 hour to find a solution.");
				rules.add("Your solution length will be counted in HTM. (Slice moves count as two turns.)");
				int maxMoves = WCA_MAX_MOVES_FMC;
				rules.add("Your solution must be at most " + maxMoves + " moves, including rotations.");
				rules.add("Your solution must not be related to the scrambling algorithm in any way.");
				ct.addElement(rules);
				MAGIC_NUMBER = 125; // kill me now
				ct.setSimpleColumn(left+padding, scrambleBorderTop, rulesRight-padding, rulesTop-MAGIC_NUMBER, 0, Element.ALIGN_LEFT);
				ct.go();

				doc.newPage();
			}
		} else {
			final int scrambleImagePadding = 2;
			final float maxFontSize = 20;

			int scrambleWidth = 0;
			if(scrambleRequest.scrambler.getShortName().equals("minx")) {
				// TODO - If we allow the megaminx image to be too wide, the
				// megaminx scrambles get really tiny. This tweak allocates
				// a more optimal amount of space to the scrambles. This is possible
				// because the scrambles are so uniformly sized.
				scrambleWidth = 190;
			}
			
			float sideMargins = 100 + doc.leftMargin() + doc.rightMargin();
			float vertMargins = doc.topMargin() + doc.bottomMargin();
			float availableWidth = pageSize.getWidth()-sideMargins;
			float availableHeight = pageSize.getHeight()-vertMargins;
			int scrambleHeight = (int) (availableHeight/SCRAMBLES_PER_PAGE - 2*scrambleImagePadding);
			Dimension dim = scrambleRequest.scrambler.getPreferredSize(scrambleWidth, scrambleHeight);
			PdfContentByte cb = docWriter.getDirectContent();
			
			int charsWide = (int) Math.ceil(Math.log(scrambleRequest.scrambles.length)/Math.log(10));
			String wideString = "";
			for(int i = 0; i < charsWide; i++) {
				// M has got to be as wide or wider than the widest digit in our font
				wideString += "M";
			}
			wideString += ".";
			float col1Width = new Chunk(wideString).getWidthPoint();
			// I don't know why we need this, perhaps there's some padding?
			col1Width += 5;

			float availableScrambleWidth = availableWidth - col1Width - dim.width - 2*scrambleImagePadding;
			int availableScrambleHeight = dim.height - 2*scrambleImagePadding;

			PdfPTable table = new PdfPTable(3);

			table.setTotalWidth(new float[] { col1Width, availableScrambleWidth, dim.width + 2*scrambleImagePadding });
			table.setLockedWidth(true);

			String longestScramble = "";
			for(String scramble : scrambleRequest.scrambles) {
				String padded = padTurnsUniformly(scramble, "M");
				if(padded.length() > longestScramble.length()) {
					longestScramble = padded;
				}
			}
			// I don't know how to configure ColumnText.fitText's word wrapping characters,
			// so instead, I just replace each character I don't want to wrap with M, which
			// should be the widest character (we're using a monospaced font,
			// so that doesn't really matter), and won't get wrapped.
			longestScramble = longestScramble.replaceAll("\\S", "M");
			if(longestScramble.indexOf("\n") >= 0) {
				// If the scramble contains newlines, then we *only* allow wrapping at the
				// newlines.
				longestScramble = longestScramble.replaceAll(" ", "M");
			}
			Font scrambleFont = null;
			try {
				BaseFont courier = BaseFont.createFont(BaseFont.COURIER, BaseFont.CP1252, BaseFont.EMBEDDED);
				Rectangle availableArea = new Rectangle(availableScrambleWidth, availableScrambleHeight);
				float perfectFontSize = ColumnText.fitText(new Font(courier), longestScramble, availableArea, maxFontSize, PdfWriter.RUN_DIRECTION_LTR);
				scrambleFont = new Font(courier, perfectFontSize, Font.NORMAL);
			} catch(IOException e) {
				l.log(Level.INFO, "", e);
			} catch(DocumentException e) {
				l.log(Level.INFO, "", e);
			}

			for(int i = 0; i < scrambleRequest.scrambles.length; i++) {
				String scramble = scrambleRequest.scrambles[i];
				Chunk ch = new Chunk((i+1)+".");
				PdfPCell nthscramble = new PdfPCell(new Paragraph(ch));
				nthscramble.setVerticalAlignment(PdfPCell.ALIGN_MIDDLE);
				table.addCell(nthscramble);

				String paddedScramble = padTurnsUniformly(scramble, " ");
				Chunk scrambleChunk = new Chunk(paddedScramble);
				if(paddedScramble.indexOf("\n") >= 0) {
					// If the scramble contains newlines, then we *only* allow wrapping at the
					// newlines.
					scrambleChunk.setSplitCharacter(SPLIT_ON_NEWLINES);
				} else {
					scrambleChunk.setSplitCharacter(SPLIT_ON_SPACES);
				}
				scrambleChunk.setFont(scrambleFont);

				PdfPCell scrambleCell = new PdfPCell(new Paragraph(scrambleChunk));
				scrambleCell.setVerticalAlignment(PdfPCell.ALIGN_MIDDLE);
				table.addCell(scrambleCell);

				if(dim.width > 0 && dim.height > 0) {
					try {
						PdfTemplate tp = cb.createTemplate(dim.width + 2*scrambleImagePadding, dim.height + 2*scrambleImagePadding);
						Graphics2D g2 = new PdfGraphics2D(tp, tp.getWidth(), tp.getHeight(), new DefaultFontMapper());
						g2.translate(scrambleImagePadding, scrambleImagePadding);

						scrambleRequest.scrambler.drawScramble(g2, dim, scramble, colorScheme);
						g2.dispose();
						PdfPCell imgCell = new PdfPCell(Image.getInstance(tp), true);
						imgCell.setBackgroundColor(BaseColor.LIGHT_GRAY);
						imgCell.setVerticalAlignment(PdfPCell.ALIGN_MIDDLE);
						imgCell.setHorizontalAlignment(PdfPCell.ALIGN_MIDDLE);
						table.addCell(imgCell);
					} catch (Exception e) {
						table.addCell("Error drawing scramble: " + e.getMessage());
						l.log(Level.WARNING, "Error drawing scramble, if you're having font issues, try installing ttf-dejavu.", e);
					}
				} else {
					table.addCell("");
				}
			}
			
			doc.add(table);
		}
		doc.newPage();
	}

	private static String padTurnsUniformly(String scramble, String padding) {
		String[] turns = scramble.split("\\s+");
		int maxTurnLength = 0;
		for(String turn : turns) {
			maxTurnLength = Math.max(maxTurnLength, turn.length());
		}

		StringBuilder s = new StringBuilder();

		String[] lines = scramble.split("\\n");
		for(int i = 0; i < lines.length; i++) {
			String line = lines[i];
			if(i > 0) {
				s.append("\n");
			}
			turns = line.split(" ");
			for(int j = 0; j < turns.length; j++) {
				String turn = turns[j];
				if(j > 0) {
					s.append(" ");
				}

				// TODO - this is a disgusting hack for sq1. We don't pad the /
				// turns because they're guaranteed to occur as every other turn,
				// so stuff will line up nicely without padding them. I don't know
				// what a good general solution to this problem is.
				if(!turn.equals("/")) {
					while(turn.length() < maxTurnLength) {
						turn += padding;
					}
				}
				s.append(turn);
			}
		}

		return s.toString();
	}

	private static String[] stripNewlines(String[] strings) {
		String[] newStrings = new String[strings.length];
		for(int i = 0; i < strings.length; i++) {
			String newString = strings[i].replaceAll("\n", " ");
			newStrings[i] = newString;
		}
		return newStrings;
	}
	
	private static final String INVALID_CHARS = "\\/:*?\"<>|";
	public static ByteArrayOutputStream requestsToZip(String globalTitle, Date generationDate, ScrambleRequest[] scrambleRequests, String password) throws IOException, DocumentException, ZipException {
		ByteArrayOutputStream baosZip = new ByteArrayOutputStream();

		ZipParameters parameters = new ZipParameters();
		parameters.setCompressionMethod(Zip4jConstants.COMP_DEFLATE);
		parameters.setCompressionLevel(Zip4jConstants.DEFLATE_LEVEL_NORMAL);
		if(password != null) {
			parameters.setEncryptFiles(true);
			parameters.setEncryptionMethod(Zip4jConstants.ENC_METHOD_STANDARD);
			parameters.setPassword(password);
		}
		parameters.setSourceExternalStream(true);

		ZipOutputStream zipOut = new ZipOutputStream(baosZip);
		HashMap<String, Boolean> seenTitles = new HashMap<String, Boolean>();
		for(ScrambleRequest scrambleRequest : scrambleRequests) {

			String safeTitle = scrambleRequest.title;
			for(int i = 0; i < INVALID_CHARS.length(); i++) {
				String invalidChar = Pattern.quote("" + INVALID_CHARS.charAt(i));
				safeTitle = safeTitle.replaceAll(invalidChar, "");
			}
			int salt = 0;
			String tempNewSafeTitle = safeTitle;
			while(seenTitles.get(tempNewSafeTitle) != null) {
				tempNewSafeTitle = safeTitle + " (" + (++salt) + ")";
			}
			safeTitle = tempNewSafeTitle;
			seenTitles.put(safeTitle, true);

			String pdfFileName = "pdf/" + safeTitle + ".pdf";
			parameters.setFileNameInZip(pdfFileName);
			zipOut.putNextEntry(null, parameters);

			PdfReader pdfReader = createPdf(globalTitle, generationDate, scrambleRequest);
			byte[] b = new byte[(int) pdfReader.getFileLength()];
			pdfReader.getSafeFile().readFully(b);
			zipOut.write(b);

			zipOut.closeEntry();
			
			String txtFileName = "txt/" + safeTitle + ".txt";
			parameters.setFileNameInZip(txtFileName);
			zipOut.putNextEntry(null, parameters);
			zipOut.write(Utils.join(stripNewlines(scrambleRequest.scrambles), "\r\n").getBytes());
			zipOut.closeEntry();
		}
		
		parameters.setFileNameInZip(globalTitle + ".json");
		zipOut.putNextEntry(null, parameters);
		HashMap<String, Object> jsonObj = new HashMap<String, Object>();
		jsonObj.put("rounds", scrambleRequests);
		jsonObj.put("competitionName", globalTitle);
		jsonObj.put("version", Utils.getProjectName() + "-" + Utils.getVersion());
		jsonObj.put("generationDate", generationDate);
		zipOut.write(GSON.toJson(jsonObj).getBytes());
		zipOut.closeEntry();

		parameters.setFileNameInZip(globalTitle + ".pdf");
		zipOut.putNextEntry(null, parameters);
		// Note that we're not passing the password into this function. It seems pretty silly
		// to put a password protected pdf inside of a password protected zip file.
		ByteArrayOutputStream baos = requestsToPdf(globalTitle, generationDate, scrambleRequests, null);
		zipOut.write(baos.toByteArray());
		zipOut.closeEntry();
		
		zipOut.finish();
		zipOut.close();
		
		return baosZip;
	}

	public static ByteArrayOutputStream requestsToPdf(String globalTitle, Date generationDate, ScrambleRequest[] scrambleRequests, String password) throws DocumentException, IOException {
		Document doc = new Document();
		ByteArrayOutputStream totalPdfOutput = new ByteArrayOutputStream();
		PdfSmartCopy totalPdfWriter = new PdfSmartCopy(doc, totalPdfOutput);
		if(password != null) {
			totalPdfWriter.setEncryption(password.getBytes(), password.getBytes(), PdfWriter.ALLOW_PRINTING, PdfWriter.STANDARD_ENCRYPTION_128);
		}


		doc.open();

		PdfContentByte cb = totalPdfWriter.getDirectContent();
		PdfOutline root = cb.getRootOutline();

		HashMap<String, PdfOutline> outlineByPuzzle = new HashMap<String, PdfOutline>();
		boolean expandPuzzleLinks = false;

		int pages = 1;
		for(int i = 0; i < scrambleRequests.length; i++) {
			ScrambleRequest scrambleRequest = scrambleRequests[i];

			String shortName = scrambleRequest.scrambler.getShortName();

			PdfOutline puzzleLink = outlineByPuzzle.get(shortName);
			if(puzzleLink == null) {
				PdfDestination d = new PdfDestination(PdfDestination.FIT);
				puzzleLink = new PdfOutline(root,
						PdfAction.gotoLocalPage(pages, d, totalPdfWriter), scrambleRequest.scrambler.getLongName(), expandPuzzleLinks);
				outlineByPuzzle.put(shortName, puzzleLink);
			}

			PdfDestination d = new PdfDestination(PdfDestination.FIT);
			PdfOutline sheetLink = new PdfOutline(puzzleLink,
					PdfAction.gotoLocalPage(pages, d, totalPdfWriter), scrambleRequest.title);

			PdfReader pdfReader = createPdf(globalTitle, generationDate, scrambleRequest);
			for(int j = 0; j < scrambleRequest.copies; j++) {
				for(int pageN = 1; pageN <= pdfReader.getNumberOfPages(); pageN++) {
					PdfImportedPage page = totalPdfWriter.getImportedPage(pdfReader, pageN);
					totalPdfWriter.addPage(page);
					pages++;
				}
			}
		}

		doc.close();
		return totalPdfOutput;
	}
	
}
