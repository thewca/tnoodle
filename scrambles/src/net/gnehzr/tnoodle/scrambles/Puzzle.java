package net.gnehzr.tnoodle.scrambles;

import static net.gnehzr.tnoodle.utils.GwtSafeUtils.azzert;
import static net.gnehzr.tnoodle.utils.GwtSafeUtils.ceil;
import static net.gnehzr.tnoodle.utils.GwtSafeUtils.toColor;

import java.awt.Color;
import java.awt.Dimension;
import java.awt.RenderingHints;
import java.awt.Graphics2D;
import java.awt.geom.GeneralPath;
import java.security.NoSuchAlgorithmException;
import java.security.NoSuchProviderException;
import java.security.SecureRandom;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.LinkedList;
import java.util.Map.Entry;
import java.util.Queue;
import java.util.Random;
import java.util.logging.Level;
import java.util.logging.Logger;

import net.gnehzr.tnoodle.scrambles.AlgorithmBuilder.MungingMode;
import net.gnehzr.tnoodle.utils.TimedLogRecordStart;
import net.gnehzr.tnoodle.utils.GwtSafeUtils;


import org.timepedia.exporter.client.Export;
import org.timepedia.exporter.client.ExportClosure;
import org.timepedia.exporter.client.Exportable;
import org.timepedia.exporter.client.NoExport;

/**
 * Puzzle and TwistyPuzzle encapsulate all the information to filter out
 * scrambles <= wcaMinScrambleDistance (defaults to 1)
 * move away from solved (see generateWcaScramble),
 * and to generate random turn scrambles generically (see generateRandomMoves).
 *
 * The original proposal for these classes is accessible here:
 * https://docs.google.com/document/d/11ZfQPxAw0EhNNwE1yn5lZUO383qvAH6kJa2s3O9_6Zg/edit
 *
 * @author jeremy
 *
 */
@ExportClosure
public abstract class Puzzle implements Exportable {
    private static final Logger l = Logger.getLogger(Puzzle.class.getName());
    protected int wcaMinScrambleDistance = 1;

    /**
     * Returns a String describing this Scrambler
     * appropriate for use in a url. This shouldn't contain any periods.
     * @return a url appropriate String unique to this Scrambler
     */
    @Export
    public abstract String getShortName();

    /**
     * Returns a String fully describing this Scrambler.
     * Unlike shortName(), may contain spaces and other url-inappropriate characters.
     * This will also be used for the toString method of this Scrambler.
     * @return a String
     */
    @Export
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
     * Returns the minimum distance from solved that any scramble this Puzzle
     * generates will be.
     */
    public int getWcaMinScrambleDistance() {
        return wcaMinScrambleDistance;
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
    public final String generateWcaScramble(Random r) {
        PuzzleStateAndGenerator psag;
        do {
            psag = generateRandomMoves(r);
        } while(psag.state.solveIn(wcaMinScrambleDistance) != null);
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
            scrambles[i] = generateWcaScramble(r);
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

    @Export
    public final String generateScramble() {
        return generateWcaScramble(r);
    }
    @Export
    public final String[] generateScrambles(int count) {
        return generateScrambles(r, count);
    }

    /** seeded scrambles, these can't be cached, so they'll be a little slower **/
    @Export
    public final String generateSeededScramble(String seed) {
        return generateSeededScramble(seed.getBytes());
    }
    @Export
    public final String[] generateSeededScrambles(String seed, int count) {
        return generateSeededScrambles(seed.getBytes(), count);
    }

    private final String generateSeededScramble(byte[] seed) {
        // We must create our own Random because
        // other threads can access the static one.
        // Also, setSeed supplements an existing seed,
        // rather than replacing it.
        SecureRandom r = getSecureRandom();
        r.setSeed(seed);
        return generateWcaScramble(r);
    }
    private final String[] generateSeededScrambles(byte[] seed, int count) {
        // We must create our own Random because
        // other threads can access the static one.
        // Also, setSeed supplements an existing seed,
        // rather than replacing it.
        SecureRandom r = getSecureRandom();
        r.setSeed(seed);
        return generateScrambles(r, count);
    }

    /**
     * @return Simply returns getLongName()
     */
    @Export
    public String toString() {
        return getLongName();
    }

    /**
     * TODO - comment
     */
    public void drawPuzzleIcon(Graphics2D g, Dimension size) {
        try {
            drawScramble(g, size, "", null);
        } catch(InvalidScrambleException e) {
            l.log(Level.SEVERE, "", e);
        }
    }

    /**
     * Computes the best size to draw the scramble image.
     * @param maxWidth The maximum allowed width of the resulting image, 0 if it doesn't matter.
     * @param maxHeight The maximum allowed height of the resulting image, 0 if it doesn't matter.
     * @return The best size of the resulting image, constrained to maxWidth and maxHeight.
     */
    @Export
    public Dimension getPreferredSize(int maxWidth, int maxHeight) {
        if(maxWidth == 0 && maxHeight == 0) {
            return getPreferredSize();
        }
        if(maxWidth == 0) {
            maxWidth = Integer.MAX_VALUE;
        } else if(maxHeight == 0) {
            maxHeight = Integer.MAX_VALUE;
        }
        double ratio = 1.0 * getPreferredSize().width / getPreferredSize().height;
        int resultWidth = Math.min(maxWidth, ceil(maxHeight*ratio));
        int resultHeight = Math.min(maxHeight, ceil(maxWidth/ratio));
        return new Dimension(resultWidth, resultHeight);
    }

    /**
     * TODO - document! alphabetical
     * @return
     */
    @Export
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
            if(scheme.indexOf(',') > 0) {
                colors = scheme.split(",");
            } else {
                char[] cols = scheme.toCharArray();
                colors = new String[cols.length];
                for(int i = 0; i < cols.length; i++) {
                    colors[i] = cols[i] + "";
                }
            }
            if(colors.length != faces.length) {
//              sendText(t, String.format("Incorrect number of colors specified (expecting %d, got %d)", faces.length, colors.length));
                //TODO - exception
                return null;
            }
            for(int i = 0; i < colors.length; i++) {
                Color c = toColor(colors[i]);
                if(c == null) {
//                  sendText(t, "Invalid color: " + colors[i]);
                    //TODO - exception
                    return null;
                }
                colorScheme.put(faces[i], c);
            }
        }
        return colorScheme;
    }

    /**
     * Draws scramble onto g.
     * @param g The Graphics2D object to draw upon (of size size)
     * @param size The Dimension of the resulting image.
     * @param scramble The scramble to validate and apply to the puzzle. NOTE: May be null!
     * @param colorScheme A HashMap mapping face names to Colors.
     *          Any missing entries will be merged with the defaults from getDefaultColorScheme().
     *          If null, just the defaults are used.
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
        g.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
        PuzzleState state = getSolvedState();
        state = state.applyAlgorithm(scramble);
        state.drawScramble(g, defaults);
    }


    protected String solveIn(PuzzleState ps, int n) {
        if(ps.isSolved()) {
            return "";
        }

        // For debugging purpose.
        boolean enableSpeedup = true;

        HashMap<PuzzleState, Integer> seenSolved = new HashMap<PuzzleState, Integer>();
        Queue<PuzzleState> fringeSolved = new LinkedList<PuzzleState>();
        HashMap<PuzzleState, Integer> seenScrambled = new HashMap<PuzzleState, Integer>();
        Queue<PuzzleState> fringeScrambled = new LinkedList<PuzzleState>();

        // We are using references for a more concise code.
        HashMap<PuzzleState, Integer> seenExtending;
        Queue<PuzzleState> fringeExtending;
        HashMap<PuzzleState, Integer> seenComparing;

        PuzzleState node = getSolvedState();
        PuzzleState solved = getSolvedState();
        fringeSolved.add(solved);
        seenSolved.put(solved, 0);
        if(enableSpeedup){
            fringeScrambled.add(ps);
        }
        seenScrambled.put(ps, 0);

        TimedLogRecordStart start = new TimedLogRecordStart(Level.FINER, "Searching for solution in " + n + " moves.");
        l.log(start);

        boolean found = false;
        int max_distance = enableSpeedup ? (n+1)/2 : n;

        // The task here is to do a breadth-first search starting from both the solved state and the scrambled state.
        // When we got an intersection from the two hash maps, we are done!
        outer:
        while(!(fringeSolved.isEmpty() && fringeScrambled.isEmpty())) {
            // We have to choose on which side we are extending our search.
            // I'm choosing to take the side where the hash map is the smaller.
            // I just have to take care that the queue is not empty.
            if(((seenSolved.size() < seenScrambled.size()) && !fringeSolved.isEmpty()) || fringeScrambled.isEmpty()) {
                seenExtending = seenSolved;
                fringeExtending = fringeSolved;
                seenComparing = seenScrambled;
            } else {
                seenExtending = seenScrambled;
                fringeExtending = fringeScrambled;
                seenComparing = seenSolved;
                // Yes, I'm copying references only.
            }
            
            node = fringeExtending.poll();
            int distance = seenExtending.get(node);
            if(distance == max_distance) {
                // It's useless to look at the children of this node.
                // Either their distance is smaller so we've already seen them,
                // or we don't care about them.
                // the +1 is because if n is odd, we would have to search from one side
                // with distance n/2 and from the other side distance n/2 + 1
                // Because we don't know which is which, let's take (n+1)/2 for both.
                continue;
            } else if(distance > max_distance) {
                azzert(false);
            }

            for(PuzzleState next : node.getSuccessors().values()) {
                if(seenExtending.containsKey(next)) {
                    continue;
                }
                seenExtending.put(next, distance+1);
                fringeExtending.add(next);
                if(seenComparing.containsKey(next)) {
                    found = true;
                    node = next;
                    break outer;
                }
            }
        }

        l.log(start.finishedNow("expanded " + ( seenSolved.size() + seenScrambled.size() ) + " nodes"));

        if(!found) {
            return null;
        }

        /* We have found a solution, but we still have to recover the move sequence.
         * the `node` is the bound between the solved and the scrambled states.
         * We can travel from `node` to either states, like that:
         * solved <----- node -----> scrambled
         * However, to build a solution, we need to travel like that:
         * solved <----- node <----- scrambled
         * So we have to travel backward for the scrambled side.
         */

        /* Step 1: node -----> scrambled */


        PuzzleState state = node;
        int distanceFromScrambled = seenScrambled.get(state);

        /* We have to keep track of all states we have visited */
        PuzzleState[] linkedStates = new PuzzleState[distanceFromScrambled + 1];
        linkedStates[distanceFromScrambled] = state;

        outer:
        while(distanceFromScrambled > 0) {
            for(Entry<String, ? extends PuzzleState> next : state.getSuccessors().entrySet()) {
                if(seenScrambled.containsKey(next.getValue())) {
                    int newDistanceFromScrambled = seenScrambled.get(next.getValue());
                    if(newDistanceFromScrambled < distanceFromScrambled) {
                        state = next.getValue();
                        distanceFromScrambled = newDistanceFromScrambled;
                        linkedStates[distanceFromScrambled] = state;
                        continue outer;
                    }
                }
            }
            azzert(false);
        }

        /* Step 2: node <----- scrambled */

        AlgorithmBuilder solution = new AlgorithmBuilder(this, MungingMode.NO_MUNGING, ps);
        state = ps;
        distanceFromScrambled = 0;

        outer:
        while(!state.equals(node)) {
            for(Entry<String, ? extends PuzzleState> next : state.getSuccessors().entrySet()) {
                if(next.getValue().equals(linkedStates[distanceFromScrambled+1])) {
                    state = next.getValue();
                    try {
                        solution.appendMove(next.getKey());
                    } catch(InvalidMoveException e) {
                        azzert(false, e);
                    }
                    distanceFromScrambled = seenScrambled.get(state);
                    continue outer;
                }
            }
            azzert(false);
        }

        /* Step 3: solved <----- node */
        
        int distanceFromSolved = seenSolved.get(state);
        outer:
        while(distanceFromSolved > 0) {
            for(Entry<String, ? extends PuzzleState> next : state.getSuccessors().entrySet()) {
                if(seenSolved.containsKey(next.getValue())) {
                    int newDistanceFromSolved = seenSolved.get(next.getValue());
                    if(newDistanceFromSolved < distanceFromSolved) {
                        state = next.getValue();
                        distanceFromSolved = newDistanceFromSolved;
                        try {
                            solution.appendMove(next.getKey());
                        } catch(InvalidMoveException e) {
                            azzert(false, e);
                        }
                        continue outer;
                    }
                }
            }
            azzert(false);
        }

        return solution.toString();
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
         *         The move Strings may not contain spaces.
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
         *         The move Strings may not contain spaces.
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

        public String solveIn(int n) {
            return getPuzzle().solveIn(this, n);
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
    @NoExport
    public PuzzleStateAndGenerator generateRandomMoves(Random r) {
        AlgorithmBuilder ab = new AlgorithmBuilder(this, MungingMode.IGNORE_REDUNDANT_MOVES);
        for(int i = 0; i < getRandomMoveCount(); i++) {
            HashMap<String, ? extends PuzzleState> successors = ab.getState().getScrambleSuccessors();
            int length = ab.length();
            while(ab.length() == length) {
                String move = GwtSafeUtils.choose(r, successors.keySet());
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
