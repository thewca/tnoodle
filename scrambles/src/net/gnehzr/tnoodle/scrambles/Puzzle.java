package net.gnehzr.tnoodle.scrambles;

import static net.gnehzr.tnoodle.utils.Utils.azzert;
import static net.gnehzr.tnoodle.utils.Utils.ceil;
import static net.gnehzr.tnoodle.utils.Utils.toColor;

import java.awt.Color;
import java.awt.Dimension;
import java.awt.Graphics2D;
import java.awt.geom.GeneralPath;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.lang.reflect.Type;
import java.security.NoSuchAlgorithmException;
import java.security.NoSuchProviderException;
import java.security.SecureRandom;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.LinkedList;
import java.util.Queue;
import java.util.Random;
import java.util.SortedMap;
import java.util.TreeMap;
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.imageio.ImageIO;

import net.gnehzr.tnoodle.scrambles.AlgorithmBuilder.MungingMode;
import net.gnehzr.tnoodle.utils.BadClassDescriptionException;
import net.gnehzr.tnoodle.utils.LazyInstantiator;
import net.gnehzr.tnoodle.utils.Plugins;
import net.gnehzr.tnoodle.utils.Strings;
import net.gnehzr.tnoodle.utils.TimedLogRecordStart;
import net.gnehzr.tnoodle.utils.Utils;

import com.google.gson.JsonDeserializationContext;
import com.google.gson.JsonDeserializer;
import com.google.gson.JsonElement;
import com.google.gson.JsonParseException;
import com.google.gson.JsonPrimitive;
import com.google.gson.JsonSerializationContext;
import com.google.gson.JsonSerializer;

/**
 * Puzzle and TwistyPuzzle encapsulate all the information to filter out
 * scrambles <= 1 move away from solved (see generateWCAScramble),
 * and to generate random turn scrambles generically (see generateRandomMoves).
 * 
 * The original proposal for these classes is accessible here:
 * https://docs.google.com/document/d/11ZfQPxAw0EhNNwE1yn5lZUO383qvAH6kJa2s3O9_6Zg/edit
 * 
 * @author jeremy
 *
 */
public abstract class Puzzle {
	private static final Logger l = Logger.getLogger(Puzzle.class.getName());
	protected int wcaMinScrambleDistance = 1;

	/**
	 * Returns a String describing this Scrambler
	 * appropriate for use in a url. This shouldn't contain any periods.
	 * @return a url appropriate String unique to this Scrambler
	 */
	public abstract String getShortName();
	
	/**
	 * Returns a String fully describing this Scrambler.
	 * Unlike shortName(), may contain spaces and other url-inappropriate characters.
	 * This will also be used for the toString method of this Scrambler.
	 * @return a String
	 */
	public abstract String getLongName();

	/**
	 * Returns a number between 0 and 1 representing how "initialized" this
	 * Scrambler is. 0 means nothing has been accomplished, and 1 means
	 * we're done, and are generating scrambles.
	 * @return A double between 0 and 1, inclusive.
	 */

	public double getInitializationStatus() {
		return 1;
	}
	
	/**
	 * Generates a scramble appropriate for this Scrambler. It's important to note that
	 * it's ok if this method takes some time to run, as it's going to be called many times and get queued up
	 * by ScrambleCacher.
	 * NOTE:  If a puzzle wants to provide custom scrambles
	 * (for example: Pochmann style megaminx or MRSS), it should override generateRandomMoves.
	 * @param r The instance of Random you must use as your source of randomness when generating scrambles.
	 * @return A String containing the scramble, where turns are assumed to be separated by whitespace.
	 */
	public final String generateWCAScramble(Random r) {
		PuzzleStateAndGenerator psag;
		do {
			psag = generateRandomMoves(r);
		} while(psag.state.solvableIn(wcaMinScrambleDistance));
		return psag.generator;
	}

	/**
	 * Subclasses of Scrambler are expected to produce scrambles of one size,
	 * this abstract class will resize appropriately.
	 * @return The size of the images this Scrambler will produce.
	 */
	protected abstract Dimension getPreferredSize();
	
	/**
	 * @return A *new* HashMap mapping face names to Colors.
	 */
	public abstract HashMap<String, Color> getDefaultColorScheme();
	
	/**
	 * @return A HashMap mapping face names to GeneralPaths.
	 */
	public abstract HashMap<String, GeneralPath> getDefaultFaceBoundaries();

	private String[] generateScrambles(Random r, int count) {
		String[] scrambles = new String[count];
		for(int i = 0; i < count; i++) {
			scrambles[i] = generateWCAScramble(r);
		}
		return scrambles;
	}

    private SecureRandom r = getSecureRandom();
	private static final SecureRandom getSecureRandom() {
		try {
			return SecureRandom.getInstance("SHA1PRNG", "SUN");
		} catch(NoSuchAlgorithmException e) {
			l.log(Level.SEVERE, "Couldn't get SecureRandomInstance", e);
			azzert(false, e);
			return null;
		} catch(NoSuchProviderException e) {
			l.log(Level.SEVERE, "Couldn't get SecureRandomInstance", e);
			azzert(false, e);
			return null;
		}
	}

	public final String generateScramble() {
		return generateWCAScramble(r);
	}
	public final String[] generateScrambles(int count) {
		return generateScrambles(r, count);
	}
	
	/** seeded scrambles, these can't be cached, so they'll be a little slower **/
	public final String generateSeededScramble(String seed) {
		return generateSeededScramble(seed.getBytes());
	}
	public final String[] generateSeededScrambles(String seed, int count) {
		return generateSeededScrambles(seed.getBytes(), count);
	}
	
	private final String generateSeededScramble(byte[] seed) {
		// we must create our own Random because other threads can access the static one
		SecureRandom r = getSecureRandom();
		r.setSeed(seed);
		return generateWCAScramble(r);
	}
	private final String[] generateSeededScrambles(byte[] seed, int count) {
		// we must create our own Random because other threads can access the static one
		SecureRandom r = getSecureRandom();
		r.setSeed(seed);
		return generateScrambles(r, count);
	}
	
	/**
	 * @return Simply returns getLongName()
	 */
	public String toString() {
		return getLongName();
	}

	private static Plugins<Puzzle> plugins = null;
	static {
		try {
			plugins = new Plugins<Puzzle>("puzzle", Puzzle.class, Puzzle.class.getClassLoader());
		} catch (IOException e) {
			l.log(Level.SEVERE, "", e);
		} catch (BadClassDescriptionException e) {
			l.log(Level.SEVERE, "", e);
		}
	}

	private static SortedMap<String, LazyInstantiator<Puzzle>> scramblers;
	public static synchronized SortedMap<String, LazyInstantiator<Puzzle>> getScramblers() throws BadClassDescriptionException, IOException {
		if(scramblers == null) {
			// Sorting in a way that will take into account numbers (so 10x10x10 appears after 3x3x3)
			SortedMap<String, LazyInstantiator<Puzzle>> newScramblers =
				new TreeMap<String, LazyInstantiator<Puzzle>>(Strings.getNaturalComparator());
			newScramblers.putAll(plugins.getPlugins());
			scramblers = newScramblers;
		}
		return Collections.unmodifiableSortedMap(scramblers);
	}

	public static String getScramblerLongName(String shortName) throws BadClassDescriptionException, IOException {
		getScramblers(); // force reloading the plugins, if necessary
		return plugins.getPluginComment(shortName);
	}
	
	/**
	 * TODO - comment
	 */
	protected void drawPuzzleIcon(Graphics2D g, Dimension size) {
		try {
			drawScramble(g, size, "", null);
		} catch(InvalidScrambleException e) {
			e.printStackTrace();
		}
	}

	/**
	 * TODO - comment
	 * We should probably assert that the icons are of a particular size.
	 */
	public final void loadPuzzleIcon(ByteArrayOutputStream bytes) {
		InputStream in = getClass().getResourceAsStream(getShortName() + ".png");
		if(in != null) {
			try {
				Utils.fullyReadInputStream(in, bytes);
				return;
			} catch (IOException e) {
				l.log(Level.INFO, "", e);
			}
		}
		
		Dimension dim = new Dimension(32, 32);
		BufferedImage img = new BufferedImage(dim.width, dim.height, BufferedImage.TYPE_INT_ARGB);
		Graphics2D g = (Graphics2D) img.getGraphics();
		drawPuzzleIcon(g, dim);
		try {
			ImageIO.write(img, "png", bytes);
		} catch(IOException e) {
			l.log(Level.SEVERE, "", e);
		}
	}
	
	/**
	 * Computes the best size to draw the scramble image.
	 * @param maxWidth The maximum allowed width of the resulting image, 0 or null if it doesn't matter.
	 * @param maxHeight The maximum allowed height of the resulting image, 0 or null if it doesn't matter.
	 * @return The best size of the resulting image, constrained to maxWidth and maxHeight.
	 */
	public Dimension getPreferredSize(Integer maxWidth, Integer maxHeight) {
		if(maxWidth == null) maxWidth = 0;
		if(maxHeight == null) maxHeight = 0;
		if(maxWidth == 0 && maxHeight == 0)
			return getPreferredSize();
		if(maxWidth == 0)
			maxWidth = Integer.MAX_VALUE;
		else if(maxHeight == 0)
			maxHeight = Integer.MAX_VALUE;
		double ratio = 1.0 * getPreferredSize().width / getPreferredSize().height;
		int resultWidth = Math.min(maxWidth, ceil(maxHeight*ratio));
		int resultHeight = Math.min(maxHeight, ceil(maxWidth/ratio));
		return new Dimension(resultWidth, resultHeight);
	}
	
	/**
	 * TODO - document! alphabetical
	 * @return
	 */
	public String[] getFaceNames() {
		ArrayList<String> faces = new ArrayList<String>(getDefaultColorScheme().keySet());
		Collections.sort(faces);
		return faces.toArray(new String[faces.size()]);
	}
	
	
	/**
	 * TODO - document!
	 * @param colorScheme
	 * @return
	 */
	public HashMap<String, Color> parseColorScheme(String scheme) {
		HashMap<String, Color> colorScheme = getDefaultColorScheme();
		if(scheme != null && !scheme.isEmpty()) {
			String[] faces = getFaceNames();
			String[] colors;
			if(scheme.indexOf(',') > 0)
				colors = scheme.split(",");
			else {
				char[] cols = scheme.toCharArray();
				colors = new String[cols.length];
				for(int i = 0; i < cols.length; i++) {
					colors[i] = cols[i] + "";
				}
			}
			if(colors.length != faces.length) {
//				sendText(t, String.format("Incorrect number of colors specified (expecting %d, got %d)", faces.length, colors.length));
				//TODO - exception
				return null;
			}
			for(int i = 0; i < colors.length; i++) {
				Color c = toColor(colors[i]);
				if(c == null) {
//					sendText(t, "Invalid color: " + colors[i]);
					//TODO - exception
					return null;
				}
				colorScheme.put(faces[i], c);
			}
		}
		return colorScheme;
	}
	
	public PuzzleImageInfo getDefaultPuzzleImageInfo() {
		PuzzleImageInfo sii = new PuzzleImageInfo();
		sii.faces = getDefaultFaceBoundaries();
		sii.colorScheme = getDefaultColorScheme();
		sii.size = getPreferredSize();
		return sii;
	}
	
	/**
	 * Draws scramble onto g.
	 * @param g The Graphics2D object to draw upon (of size size)
	 * @param size The Dimension of the resulting image.
	 * @param scramble The scramble to validate and apply to the puzzle. NOTE: May be null!
	 * @param colorScheme A HashMap mapping face names to Colors.
	 * 			Any missing entries will be merged with the defaults from getDefaultColorScheme().
	 * 			If null, just the defaults are used.
	 * @throws InvalidScrambleException If scramble is invalid.
	 */
	public void drawScramble(Graphics2D g, Dimension size, String scramble, HashMap<String, Color> colorScheme) throws InvalidScrambleException {
		if(scramble == null) {
			scramble = "";
		}
		HashMap<String, Color> defaults = getDefaultColorScheme();
		if(colorScheme != null) {
			defaults.putAll(colorScheme);
		}
		g.scale(1.0*size.width/getPreferredSize().width, 1.0*size.height/getPreferredSize().height);
		PuzzleState state = getSolvedState();
		state = state.applyAlgorithm(scramble);
		state.drawScramble(g, defaults);
	}

	static {
		Utils.registerTypeAdapter(Puzzle.class, new Puzzlerizer());
	}
	private static class Puzzlerizer implements JsonSerializer<Puzzle>, JsonDeserializer<Puzzle> {
		@Override
		public Puzzle deserialize(JsonElement json, Type typeOfT, JsonDeserializationContext context) throws JsonParseException {
			try {
				String scramblerName = json.getAsString();
				SortedMap<String, LazyInstantiator<Puzzle>> scramblers = getScramblers();
				LazyInstantiator<Puzzle> lazyScrambler = scramblers.get(scramblerName);
				if(lazyScrambler == null) {
					throw new JsonParseException(scramblerName + " not found in: " + scramblers.keySet());
				}
				return lazyScrambler.cachedInstance();
			} catch(Exception e) {
				throw new JsonParseException(e);
			}
		}

		@Override
		public JsonElement serialize(Puzzle scrambler, Type typeOfT, JsonSerializationContext context) {
			return new JsonPrimitive(scrambler.getShortName());
		}
	}
	
	
	
	public abstract class PuzzleState {
		public PuzzleState() {}
		
		
		/**
		 * 
		 * @param algorithm A space separated String of moves to apply to state
		 * @return
		 * @throws InvalidScrambleException 
		 */
		public PuzzleState applyAlgorithm(String algorithm) throws InvalidScrambleException {
			PuzzleState state = this;
			for(String move : AlgorithmBuilder.splitAlgorithm(algorithm)) {
				try {
					state = state.apply(move);
				} catch(InvalidMoveException e) {
					throw new InvalidScrambleException(algorithm, e);
				}
			}
			return state;
		}

		/**
		 * @return A HashMap mapping move Strings to resulting PuzzleStates.
		 * 	       The move Strings may not contain spaces.
		 */
		public abstract HashMap<String, ? extends PuzzleState> getSuccessors();
		
		/**
		 * By default, this method returns getSuccessors(). Some puzzles may wish to override
		 * this method to provide a reduced set of moves to be used for scrambling.
		 * <br><br>
		 * One example of where this is useful is a puzzle like the square one.
		 * Someone extending Puzzle to implement SquareOnePuzzle is left with the question of
		 * whether to allow turns that leave the puzzle incapable of doing a /.
		 * <br><br>
		 * If getSuccessors() returns states that cannot do a /, then generateRandomMoves() will
		 * hang because any move that can be applied to one of those states is redundant.
		 * <br><br>
		 * Alternatively, if getSuccessors() only returns states that can do a /, isRedundant()
		 * breaks. Here's why:<br>
		 * Imagine a solved square one. Lets say we pick the turn (1,0) to apply to it, and now we're
		 * considering applying (2,0) to it. Obviously this is the exact same state you would have achieved by
		 * just applying (3,0) to the solved puzzle, but isRedundant only checks for this against
		 * the previous moves that commute with (2,0). movesCommute("(1,0)", "(2,0)") will only return
		 * true if (2,0) can be applied to a solved square one, even though it results in a state that cannot
		 * be slashed.

		 * @return A HashMap mapping move Strings to resulting PuzzleStates.
		 * 	       The move Strings may not contain spaces.
		 */
		public HashMap<String, ? extends PuzzleState> getScrambleSuccessors() {
			return getSuccessors();
		}

		/**
		 * Returns true if this state is equal to other.
		 * Note that a puzzle like 4x4 must compare all orientations of the puzzle, otherwise
		 * generateRandomMoves() will allow for trivial sequences of turns like Lw Rw'. 
		 * @param other
		 * @return true if this is equal to other
		 */
		public abstract boolean equals(Object other);
		public abstract int hashCode();
		

		/**
		 * Draws the state of the puzzle.
		 * NOTE: It is assumed that this method is thread safe! That means unless you know what you're doing, 
		 * use the synchronized keyword when implementing this method:<br>
		 * <code>protected synchronized void drawScramble();</code>
		 * @param g The Graphics2D object to draw upon (guaranteed to be big enough for getScrambleSize())
		 * @param colorScheme A HashMap mapping face names to Colors, must have an entry for every face!
		 */
		protected abstract void drawScramble(Graphics2D g, HashMap<String, Color> colorScheme);
		

		public Puzzle getPuzzle() {
			return Puzzle.this;
		}
		
		public boolean isSolved() {
			return getPuzzle().getSolvedState().equals(this);
		}

		/**
		 * Applies the given move to this PuzzleState. This method is non destructive,
		 * that is, it does not mutate the current state, instead it returns a new state.
		 * @param move The move to apply
		 * @return The PuzzleState achieved after applying move
		 * @throws InvalidMoveRuntimeException if the move is unrecognized.
		 */
		public PuzzleState apply(String move) throws InvalidMoveException {
			HashMap<String, ? extends PuzzleState> successors = getSuccessors();
			if(!successors.containsKey(move)) {
				throw new InvalidMoveException("Unrecognized turn " + move);
			}
			return successors.get(move);
		}
		
		public boolean solvableIn(int n) {
			HashMap<PuzzleState, Integer> seen = new HashMap<PuzzleState, Integer>();
			Queue<PuzzleState> fringe = new LinkedList<PuzzleState>();
			PuzzleState solved = getSolvedState();
			fringe.add(solved);
			seen.put(solved, 0);
			
			TimedLogRecordStart start = new TimedLogRecordStart("Searching for solution in " + n + " moves.");
			l.log(start);
			
			boolean found = false;
			while(!fringe.isEmpty()) {
				PuzzleState node = fringe.poll();
				int distance = seen.get(node);
				if(node.equals(this)) {
					found = true;
					break;
				}
				if(distance == n) {
					// It's useless to look at the children of this node, if
					// they're any closer to solved, we've already seen them,
					// and if they're further, we don't care about them.
					continue;
				} else if(distance > n) {
					azzert(false);
				}

				for(PuzzleState next : node.getSuccessors().values()) {
					if(seen.containsKey(next)) {
						continue;
					}
					seen.put(next, distance+1);
					fringe.add(next);
				}
			}
			
			l.log(start.finishedNow("expanded " + seen.size() + " nodes"));
			
			return found;
		}

		/**
		 * Two moves A and B commute on a puzzle if regardless of
		 * the order you apply A and B, you end up in the same state.
		 * Interestingly enough, the set of moves that commute can change
		 * with the state a puzzle is in. That's why this is a method of
		 * PuzzleState instead of Puzzle.
		 * @param move1
		 * @param move2
		 * @return True iff move1 and move2 commute.
		 */
		boolean movesCommute(String move1, String move2) {
			try {
				PuzzleState state1 = apply(move1).apply(move2);
				PuzzleState state2 = apply(move2).apply(move1);
				return state1.equals(state2);
			} catch (InvalidMoveException e) {
				return false;
			}
		}
	}

	/**
	 * @return A PuzzleState representing the solved state of our puzzle
	 * from where we will begin scrambling.
	 */
	public abstract PuzzleState getSolvedState();

	/**
	 * @return The number of random moves we must apply to call a puzzle
	 * sufficiently scrambled.
	 */
	protected abstract int getRandomMoveCount();
	
	/**
	 * This function will generate getRandomTurnCount() number of non cancelling,
	 * random turns. If a puzzle wants to provide custom scrambles
	 * (for example: Pochmann style megaminx or MRSS), it should override this method.
	 * 
	 * NOTE: It is assumed that this method is thread safe! That means that if you're
	 * overriding this method and you don't know what you're doing,
	 * use the synchronized keyword when implementing this method:<br>
	 * <code>protected synchronized String generateScramble(Random r);</code>
	 * @param r An instance of Random
	 * @return A PuzzleStateAndGenerator that contains a scramble string, and the
	 *         state achieved by applying that scramble.
	 */
	public PuzzleStateAndGenerator generateRandomMoves(Random r) {
		AlgorithmBuilder ab = new AlgorithmBuilder(this, MungingMode.IGNORE_REDUNDANT_MOVES);
		for(int i = 0; i < getRandomMoveCount(); i++) {
			HashMap<String, ? extends PuzzleState> successors = ab.getState().getScrambleSuccessors();
			int length = ab.length();
			while(ab.length() == length) {
				String move = Utils.choose(r, successors.keySet());
				try {
					ab.appendMove(move);
				} catch(InvalidMoveException e) {
					azzert(false, e);
				}
				// If this move is redundant, there is no reason to select that move again in vain.
				successors.remove(move);
			}
		}
		return ab.getStateAndGenerator();
	}
	
}
