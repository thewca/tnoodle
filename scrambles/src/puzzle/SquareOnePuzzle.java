package puzzle;

import static net.gnehzr.tnoodle.utils.GwtSafeUtils.modulo;
import static net.gnehzr.tnoodle.utils.GwtSafeUtils.azzert;

import net.gnehzr.tnoodle.svglite.Color;
import net.gnehzr.tnoodle.svglite.Dimension;
import net.gnehzr.tnoodle.svglite.Svg;
import net.gnehzr.tnoodle.svglite.Transform;
import net.gnehzr.tnoodle.svglite.Path;
import net.gnehzr.tnoodle.svglite.Rectangle;
import java.util.Arrays;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.Iterator;
import java.util.Random;

import net.gnehzr.tnoodle.scrambles.InvalidScrambleException;
import net.gnehzr.tnoodle.scrambles.Puzzle;
import net.gnehzr.tnoodle.scrambles.PuzzleStateAndGenerator;
import net.gnehzr.tnoodle.utils.GwtSafeUtils;
import cs.sq12phase.FullCube;
import cs.sq12phase.Search;
import org.timepedia.exporter.client.Export;

@Export
public class SquareOnePuzzle extends Puzzle {

    private static final int radius = 32;

    public SquareOnePuzzle() {
        // TODO - we can't filter super aggresively until
        // Chen Shuang's optimal solver is fixed.
        //wcaMinScrambleDistance = 20;
        wcaMinScrambleDistance = 11;
    }

    @Override
    public PuzzleStateAndGenerator generateRandomMoves(Random r) {
        Search s = new Search();
        String scramble = s.solution(FullCube.randomCube(r)).trim();
        PuzzleState state;
        try {
            state = getSolvedState().applyAlgorithm(scramble);
        } catch (InvalidScrambleException e) {
            azzert(false, e);
            return null;
        }
        return new PuzzleStateAndGenerator(state, scramble);
    }

    private static HashMap<String, Color> defaultColorScheme = new HashMap<String, Color>();
    static {
        defaultColorScheme.put("L", new Color(0xffff00));
        defaultColorScheme.put("B", new Color(0xff0000));
        defaultColorScheme.put("R", new Color(0x0000ff));
        defaultColorScheme.put("F", new Color(0xffc800));
        defaultColorScheme.put("U", new Color(0xffffff));
        defaultColorScheme.put("D", new Color(0x00ff00));
    }
    @Override
    public HashMap<String, Color> getDefaultColorScheme() {
        return new HashMap<String, Color>(defaultColorScheme);
    }

    @Override
    public Dimension getPreferredSize() {
        return getImageSize(radius);
    }
    private static Dimension getImageSize(int radius) {
        return new Dimension(getWidth(radius), getHeight(radius));
    }
    private static final double RADIUS_MULTIPLIER = Math.sqrt(2) * Math.cos(Math.toRadians(15));
    private static final double multiplier = 1.4;
    private static int getWidth(int radius) {
        return (int) (2 * RADIUS_MULTIPLIER * multiplier * radius);
    }
    private static int getHeight(int radius) {
        return (int) (4 * RADIUS_MULTIPLIER * multiplier * radius);
    }

    private void drawFace(Svg g, Transform transform, int[] face, double x, double y, int radius, Color[] colorScheme) {
        for(int ch = 0; ch < 12; ch++) {
            if(ch < 11 && face[ch] == face[ch+1]) {
                ch++;
            }
            drawPiece(g, transform, face[ch], x, y, radius, colorScheme);
        }
    }

    private int drawPiece(Svg g, Transform transform, int piece, double x, double y, int radius, Color[] colorScheme) {
        boolean corner = isCornerPiece(piece);
        int degree = 30 * (corner ? 2 : 1);
        Path[] p = corner ? getCornerPoly(x, y, radius) : getWedgePoly(x, y, radius);

        Color[] cls = getPieceColors(piece, colorScheme);
        for(int ch = cls.length - 1; ch >= 0; ch--) {
            p[ch].setFill(cls[ch]);
            p[ch].setStroke(Color.BLACK);
            p[ch].setTransform(transform);
            g.appendChild(p[ch]);
        }
        transform.rotate(Math.toRadians(degree), x, y);
        return degree;
    }

    private boolean isCornerPiece(int piece) {
        return ((piece + (piece <= 7 ? 0 : 1)) % 2) == 0;
    }

    private Color[] getPieceColors(int piece, Color[] colorScheme) {
        boolean up = piece <= 7;
        Color top = up ? colorScheme[4] : colorScheme[5];
        if(isCornerPiece(piece)) { //corner piece
            if(!up) {
                piece = 15 - piece;
            }
            Color a = colorScheme[(piece/2+3) % 4];
            Color b = colorScheme[piece/2];
            if(!up) { //mirror for bottom
                Color t = a;
                a = b;
                b = t;
            }
            return new Color[] { top, a, b }; //ordered counter-clockwise
        } else { //wedge piece
            if(!up) {
                piece = 14 - piece;
            }
            return new Color[] { top, colorScheme[piece/2] };
        }
    }

    private Path[] getWedgePoly(double x, double y, int radius) {
        Path p = new Path();
        p.moveTo(0, 0);
        p.lineTo(radius, 0);
        double tempx = Math.sqrt(3) * radius / 2.0;
        double tempy = radius / 2.0;
        p.lineTo(tempx, tempy);
        p.closePath();
        p.translate(x, y);

        Path side = new Path();
        side.moveTo(radius, 0);
        side.lineTo(multiplier * radius, 0);
        side.lineTo(multiplier * tempx, multiplier * tempy);
        side.lineTo(tempx, tempy);
        side.closePath();
        side.translate(x, y);
        return new Path[]{ p, side };
    }
    private Path[] getCornerPoly(double x, double y, int radius) {
        Path p = new Path();
        p.moveTo(0, 0);
        p.lineTo(radius, 0);
        double tempx = radius*(1 + Math.cos(Math.toRadians(75))/Math.sqrt(2));
        double tempy = radius*Math.sin(Math.toRadians(75))/Math.sqrt(2);
        p.lineTo(tempx, tempy);
        double tempX = radius / 2.0;
        double tempY = Math.sqrt(3) * radius / 2.0;
        p.lineTo(tempX, tempY);
        p.closePath();
        p.translate(x, y);

        Path side1 = new Path();
        side1.moveTo(radius, 0);
        side1.lineTo(multiplier * radius, 0);
        side1.lineTo(multiplier * tempx, multiplier * tempy);
        side1.lineTo(tempx, tempy);
        side1.closePath();
        side1.translate(x, y);

        Path side2 = new Path();
        side2.moveTo(multiplier * tempx, multiplier * tempy);
        side2.lineTo(tempx, tempy);
        side2.lineTo(tempX, tempY);
        side2.lineTo(multiplier * tempX, multiplier * tempY);
        side2.closePath();
        side2.translate(x, y);
        return new Path[]{ p, side1, side2 };
    }

    @Override
    public String getLongName() {
        return "Square-1";
    }

    @Override
    public String getShortName() {
        return "sq1";
    }

    @Override
    public PuzzleState getSolvedState() {
        return new SquareOneState();
    }

    @Override
    protected int getRandomMoveCount() {
        return 40;
    }

    /*
    // TODO - we can't filter super aggresively until
    // Chen Shuang's optimal solver is fixed.
    @Override
    protected String solveIn(PuzzleState ps, int n) {
        FullCube f = ((SquareOneState)ps).toFullCube();
        Search s = new Search();
        String scramble = s.solutionOpt(f, n);
        return scramble == null ? null : scramble.trim();
    }
    */

    static HashMap<String, Integer> costsByMove = new HashMap<String, Integer>();
    static {
        for(int top = -5; top <= 6; top++) {
            for(int bottom = -5; bottom <= 6; bottom++) {
                if(top == 0 && bottom == 0) {
                    // No use doing nothing =)
                    continue;
                }
                //int topCost = top % 12 == 0 ? 0 : 1;
                //int bottomCost = bottom % 12 == 0 ? 0 : 1;
                //int cost = topCost + bottomCost;
                int cost = 1;
                String turn = "(" + top + "," + bottom + ")";
                costsByMove.put(turn, cost);
            }
        }
        costsByMove.put("/", 1);
    }

    public class SquareOneState extends PuzzleState {
        boolean sliceSolved;
        int[] pieces;

        public SquareOneState() {
            sliceSolved = true;
            pieces = new int[]{ 0, 0, 1, 2, 2, 3, 4, 4, 5, 6, 6, 7, 8, 9, 9, 10, 11, 11, 12, 13, 13, 14, 15, 15 }; //piece array
        }

        public SquareOneState(boolean sliceSolved, int[] pieces) {
            this.sliceSolved = sliceSolved;
            this.pieces = pieces;
        }

        FullCube toFullCube() {
            int[] map1 = new int[]{3, 2, 1, 0, 7, 6, 5, 4, 0xa, 0xb, 8, 9, 0xe, 0xf, 0xc, 0xd};
            int[] map2 = new int[]{5,4,3,2,1,0,11,10,9,8,7,6,17,16,15,14,13,12,23,22,21,20,19,18};
            FullCube f = FullCube.randomCube();
            for (int i=0; i<24; i++) {
                f.setPiece(map2[i], map1[pieces[i]]);
            }
            f.setPiece(24, sliceSolved ? 0 : 1);
            return f;
        }

        private int[] doSlash() {
            int[] newPieces = GwtSafeUtils.clone(pieces);
            for(int i = 0; i < 6; i++) {
                int c = newPieces[i+12];
                newPieces[i+12] = newPieces[i+6];
                newPieces[i+6] = c;
            }
            return newPieces;
        }

        private boolean canSlash() {
            if(pieces[0] == pieces[11]) {
                return false;
            }
            if(pieces[6] == pieces[5]) {
                return false;
            }
            if(pieces[12] == pieces[23]) {
                return false;
            }
            if(pieces[12+6] == pieces[(12+6)-1]) {
                return false;
            }
            return true;
        }

        /**
         *
         * @param top Amount to rotate top
         * @param bottom Amount to rotate bottom
         * @return A copy of pieces with (top, bottom) applied to it
         */
        private int[] doRotateTopAndBottom(int top, int bottom) {
            top = modulo(-top, 12);
            int[] newPieces = GwtSafeUtils.clone(pieces);
            int[] t = new int[12];
            for(int i = 0; i < 12; i++) {
                t[i] = newPieces[i];
            }
            for(int i = 0; i < 12; i++) {
                newPieces[i] = t[(top + i) % 12];
            }

            bottom = modulo(-bottom, 12);

            for(int i = 0; i < 12; i++) {
                t[i] = newPieces[i+12];
            }
            for(int i = 0; i < 12; i++) {
                newPieces[i+12] = t[(bottom + i) % 12];
            }

            return newPieces;
        }

        public int getMoveCost(String move) {
            // TODO - We do a lookup here rather than string parsing because
            // this is a very performance critical section of code.
            // I believe the best thing to do would be to change the puzzle
            // api to return move costs as part of the object returned by
            // getScrambleSuccessors(), then subclasses wouldn't have to do
            // weird stuff like this for speed.
            return costsByMove.get(move);
        }

        @Override
        public HashMap<String, SquareOneState> getScrambleSuccessors() {
            HashMap<String, SquareOneState> successors = getSuccessorsByName();
            Iterator<String> iter = successors.keySet().iterator();
            while(iter.hasNext()) {
                String key = iter.next();
                SquareOneState state = successors.get(key);
                if(!state.canSlash()) {
                    iter.remove();
                }
            }
            return successors;
        }

        @Override
        public LinkedHashMap<String, SquareOneState> getSuccessorsByName() {
            LinkedHashMap<String, SquareOneState> successors = new LinkedHashMap<String, SquareOneState>();
            for(int top = -5; top <= 6; top++) {
                for(int bottom = -5; bottom <= 6; bottom++) {
                    if(top == 0 && bottom == 0) {
                        // No use doing nothing =)
                        continue;
                    }
                    int[] newPieces = doRotateTopAndBottom(top, bottom);
                    String turn = "(" + top + "," + bottom + ")";
                    successors.put(turn, new SquareOneState(sliceSolved, newPieces));
                }
            }
            if(canSlash()) {
                successors.put("/", new SquareOneState(!sliceSolved, doSlash()));
            }
            return successors;
        }

        @Override
        public boolean equals(Object other) {
            SquareOneState o = ((SquareOneState) other);
            return Arrays.equals(pieces, o.pieces) && sliceSolved == o.sliceSolved;
        }

        @Override
        public int hashCode() {
            return Arrays.hashCode(pieces) ^ (sliceSolved ? 1 : 0);
        }

        @Override
        protected Svg drawScramble(HashMap<String, Color> colorSchemeMap) {
            Svg g = new Svg(getPreferredSize());
            g.setStroke(2, 10, "round");

            String faces = "LBRFUD";
            Color[] colorScheme = new Color[faces.length()];
            for(int i = 0; i < colorScheme.length; i++) {
                colorScheme[i] = colorSchemeMap.get(faces.charAt(i)+"");
            }
            Dimension dim = getImageSize(radius);
            int width = dim.width;
            int height = dim.height;

            double half_square_width = (radius * RADIUS_MULTIPLIER * multiplier) / Math.sqrt(2);
            double edge_width = 2 * radius * multiplier * Math.sin(Math.toRadians(15));
            double corner_width = half_square_width - edge_width / 2.;
            Rectangle left_mid = new Rectangle(width / 2. - half_square_width, height / 2. - radius * (multiplier - 1) / 2., corner_width, radius * (multiplier - 1));
            left_mid.setFill(colorScheme[3]); //front
            Rectangle right_mid;
            if(sliceSolved) {
                right_mid = new Rectangle(width / 2. - half_square_width, height / 2. - radius * (multiplier - 1) / 2., 2*corner_width + edge_width, radius * (multiplier - 1));
                right_mid.setFill(colorScheme[3]); //front
            } else {
                right_mid = new Rectangle(width / 2. - half_square_width, height / 2. - radius * (multiplier - 1) / 2., corner_width + edge_width, radius * (multiplier - 1));
                right_mid.setFill(colorScheme[1]); //back
            }
            g.appendChild(right_mid);
            g.appendChild(left_mid); //this will clobber part of the other guy

            right_mid = new Rectangle(right_mid);
            right_mid.setStroke(Color.BLACK);
            right_mid.setFill(null);
            left_mid = new Rectangle(left_mid);
            left_mid.setStroke(Color.BLACK);
            left_mid.setFill(null);

            g.appendChild(right_mid);
            g.appendChild(left_mid);

            Transform transform;
            double x = width / 2.0;
            double y = height / 4.0;
            transform = Transform.getRotateInstance(
                    Math.toRadians(90 + 15), x, y);
            drawFace(g, transform, pieces, x, y, radius, colorScheme);

            y *= 3.0;
            transform = Transform.getRotateInstance(
                    Math.toRadians(-90 - 15), x, y);
            drawFace(g, transform, GwtSafeUtils.copyOfRange(pieces, 12, pieces.length), x, y, radius, colorScheme);

            return g;
        }

        public String toString() {
            return "sliceSolved: " + sliceSolved + " " + Arrays.toString(pieces);
        }

    }
}
