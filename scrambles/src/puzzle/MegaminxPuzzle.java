package puzzle;

import static net.gnehzr.tnoodle.utils.GwtSafeUtils.azzert;

//<<<import java.awt.Color;
//<<<import java.awt.Dimension;
//<<<import java.awt.Graphics2D;
//<<<import java.awt.geom.AffineTransform;
//<<<import java.awt.geom.GeneralPath;
//<<<import java.awt.geom.PathIterator;
//<<<import java.awt.geom.Point2D;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Random;

import net.gnehzr.tnoodle.scrambles.InvalidScrambleException;
import net.gnehzr.tnoodle.scrambles.Puzzle;
import net.gnehzr.tnoodle.scrambles.PuzzleStateAndGenerator;
import net.gnehzr.tnoodle.utils.GwtSafeUtils;

import org.timepedia.exporter.client.Export;

@Export
public class MegaminxPuzzle extends Puzzle {
    private static enum Face {
        U, BL, BR, R, F, L, D, DR, DBR, B, DBL, DL;

        // TODO We could rename faces so we can just do +6 mod 12 here instead.
        public Face oppositeFace() {
            switch(this) {
                case U:
                    return D;
                case BL:
                    return DR;
                case BR:
                    return DL;
                case R:
                    return DBL;
                case F:
                    return B;
                case L:
                    return DBR;
                case D:
                    return U;
                case DR:
                    return BL;
                case DBR:
                    return L;
                case B:
                    return F;
                case DBL:
                    return R;
                case DL:
                    return BR;
                default:
                    azzert(false);
                    return null;
            }
        }
    }
    private static final int gap = 2;
    private static final int minxRad = 30;

    public MegaminxPuzzle() {}

    @Override
    public String getLongName() {
        return "Megaminx";
    }

    @Override
    public String getShortName() {
        return "minx";
    }

    /*<<<
    @Override
    protected Dimension getPreferredSize() {
        return getImageSize(gap, minxRad, null);
    }
    */

    private static final double UNFOLDHEIGHT = 2 + 3 * Math.sin(.3 * Math.PI) + Math.sin(.1 * Math.PI);
    private static final double UNFOLDWIDTH = 4 * Math.cos(.1 * Math.PI) + 2 * Math.cos(.3 * Math.PI);

    private static void turn(int[][] image, Face side, int dir) {
        dir = GwtSafeUtils.modulo(dir, 5);
        for(int i = 0; i < dir; i++) {
            turn(image, side);
        }
    }

    private static void turn(int[][] image, Face face) {
        int s = face.ordinal();
        int b = (s >= 6 ? 6 : 0);
        switch(s % 6) {
            case 0:
                swapOnSide(image, b, 1, 6, 5, 4, 4, 2, 3, 0, 2, 8); break;
            case 1:
                swapOnSide(image, b, 0, 0, 2, 0, 9, 6, 10, 6, 5, 2); break;
            case 2:
                swapOnSide(image, b, 0, 2, 3, 2, 8, 4, 9, 4, 1, 4); break;
            case 3:
                swapOnSide(image, b, 0, 4, 4, 4, 7, 2, 8, 2, 2, 6); break;
            case 4:
                swapOnSide(image, b, 0, 6, 5, 6, 11, 0, 7, 0, 3, 8); break;
            case 5:
                swapOnSide(image, b, 0, 8, 1, 8, 10, 8, 11, 8, 4, 0); break;
            default:
                azzert(false);
        }

        rotateFace(image, face);
    }

    private static void swapOnSide(int[][] image, int b, int f1, int s1, int f2, int s2, int f3, int s3, int f4, int s4, int f5, int s5) {
        for(int i = 0; i < 3; i++) {
            int temp = image[(f1+b)%12][(s1+i)%10];
            image[(f1+b)%12][(s1+i)%10] = image[(f2+b)%12][(s2+i)%10];
            image[(f2+b)%12][(s2+i)%10] = image[(f3+b)%12][(s3+i)%10];
            image[(f3+b)%12][(s3+i)%10] = image[(f4+b)%12][(s4+i)%10];
            image[(f4+b)%12][(s4+i)%10] = image[(f5+b)%12][(s5+i)%10];
            image[(f5+b)%12][(s5+i)%10] = temp;
        }
    }

    private static void swapOnFace(int[][] image, Face face, int s1, int s2, int s3, int s4, int s5) {
        int f = face.ordinal();
        int temp = image[f][s1];
        image[f][s1] = image[f][s2];
        image[f][s2] = image[f][s3];
        image[f][s3] = image[f][s4];
        image[f][s4] = image[f][s5];
        image[f][s5] = temp;
    }

    private static void rotateFace(int[][] image, Face f) {
        swapOnFace(image, f, 0, 8, 6, 4, 2);
        swapOnFace(image, f, 1, 9, 7, 5, 3);
    }

    private static void bigTurn(int[][] image, Face side, int dir) {
        dir = GwtSafeUtils.modulo(dir, 5);
        for(int i = 0; i < dir; i++) {
            bigTurn(image, side);
        }
    }

    private static void bigTurn(int[][] image, Face f) {
        if(f == Face.DBR) {
            for(int i = 0; i < 7; i++) {
                swap(image, 0, (1+i)%10, 4, (3+i)%10, 11, (1+i)%10, 10, (1+i)%10, 1, (1+i)%10);
            }
            swapCenters(image, 0, 4, 11, 10, 1);

            swapWholeFace(image, 2, 0, 3, 0, 7, 0, 6, 8, 9, 8);

            rotateFace(image, Face.DBR);
        } else {
            azzert(f == Face.D);
            for(int i = 0; i < 7; i++) {
                swap(image, 1, (9+i)%10, 2, (1+i)%10, 3, (3+i)%10, 4, (5+i)%10, 5, (7+i)%10);
            }
            swapCenters(image, 1, 2, 3, 4, 5);

            swapWholeFace(image, 11, 0, 10, 8, 9, 6, 8, 4, 7, 2);

            rotateFace(image, Face.D);
        }
    }

    private static void swap(int[][] image, int f1, int s1, int f2, int s2, int f3, int s3, int f4, int s4, int f5, int s5) {
        int temp = image[f1][s1];
        image[f1][s1] = image[f2][s2];
        image[f2][s2] = image[f3][s3];
        image[f3][s3] = image[f4][s4];
        image[f4][s4] = image[f5][s5];
        image[f5][s5] = temp;
    }

    private static void swapCenters(int[][] image, int f1, int f2, int f3, int f4, int f5) {
        swap(image, f1, 10, f2, 10, f3, 10, f4, 10, f5, 10);
    }

    private static void swapWholeFace(int[][] image, int f1, int s1, int f2, int s2, int f3, int s3, int f4, int s4, int f5, int s5) {
        for(int i = 0; i < 10; i++) {
            int temp = image[(f1)%12][(s1+i)%10];
            image[(f1)%12][(s1+i)%10] = image[(f2)%12][(s2+i)%10];
            image[(f2)%12][(s2+i)%10] = image[(f3)%12][(s3+i)%10];
            image[(f3)%12][(s3+i)%10] = image[(f4)%12][(s4+i)%10];
            image[(f4)%12][(s4+i)%10] = image[(f5)%12][(s5+i)%10];
            image[(f5)%12][(s5+i)%10] = temp;
        }
        swapCenters(image, f1, f2, f3, f4, f5);
    }

    /*<<<
    private static Dimension getImageSize(int gap, int minxRad, String variation) {
        return new Dimension(getMegaminxViewWidth(gap, minxRad), getMegaminxViewHeight(gap, minxRad));
    }

    private static GeneralPath pentagon(boolean pointup, int minxRad) {
        double[] angs = { 1.3, 1.7, .1, .5, .9 };
        for(int i = 0; i < angs.length; i++) {
            if(pointup) {
                angs[i] -= .2;
            }
            angs[i] *= Math.PI;
        }
        double[] x = new double[angs.length];
        double[] y = new double[angs.length];
        for(int i = 0; i < x.length; i++) {
            x[i] = minxRad * Math.cos(angs[i]);
            y[i] = minxRad * Math.sin(angs[i]);
        }
        GeneralPath p = new GeneralPath();
        p.moveTo(x[0], y[0]);
        for(int ch = 1; ch < x.length; ch++) {
            p.lineTo(x[ch], y[ch]);
        }
        p.lineTo(x[0], y[0]); // TODO - this is retarded, why do i need to do this? it would appear that closePath() isn't doing it's job
        p.closePath();
        return p;
    }

    private static Point2D.Double getLineIntersection(double x1, double y1, double x2, double y2, double x3, double y3, double x4, double y4) {
        return new Point2D.Double(
            det(det(x1, y1, x2, y2), x1 - x2,
                    det(x3, y3, x4, y4), x3 - x4)/
                det(x1 - x2, y1 - y2, x3 - x4, y3 - y4),
            det(det(x1, y1, x2, y2), y1 - y2,
                    det(x3, y3, x4, y4), y3 - y4)/
                det(x1 - x2, y1 - y2, x3 - x4, y3 - y4));
    }

    private static double det(double a, double b, double c, double d) {
        return a * d - b * c;
    }

    private static int getMegaminxViewWidth(int gap, int minxRad) {
        return (int)(UNFOLDWIDTH * 2 * minxRad + 3 * gap);
    }
    private static int getMegaminxViewHeight(int gap, int minxRad) {
        return (int)(UNFOLDHEIGHT * minxRad + 2 * gap);
    }
    private static int getNewUnitSize(int width, int height, int gap, String variation) {
        return (int) Math.round(Math.min((width - 3*gap) / (UNFOLDWIDTH * 2),
                (height - 2*gap) / UNFOLDHEIGHT));
    }

    private static GeneralPath getPentagon(double x, double y, boolean up, int minxRad) {
        GeneralPath p = pentagon(up, minxRad);
        p.transform(AffineTransform.getTranslateInstance(x, y));
        return p;
    }

    @Override
    public HashMap<String, Color> getDefaultColorScheme() {
        HashMap<String, Color> colors = new HashMap<String, Color>();
        colors.put("U", new Color(0xFFFFFF));
        colors.put("BL", new Color(0x882222));
        colors.put("BR", new Color(0x0000FF));
        colors.put("R", new Color(0x880088));
        colors.put("F", new Color(0x008800));
        colors.put("L", new Color(0x88DDFF));
        colors.put("D", new Color(0xFFFF00));
        colors.put("DR", new Color(0xFF0000));
        colors.put("DBR", new Color(0x000088));
        colors.put("B", new Color(0xFF44FF));
        colors.put("DBL", new Color(0x00FF00));
        colors.put("DL", new Color(0xFF8800));
        return colors;
    }

    double x = minxRad*Math.sqrt(2*(1-Math.cos(.6*Math.PI)));
    double a = minxRad*Math.cos(.1*Math.PI);
    double b = x*Math.cos(.1*Math.PI);
    double c = x*Math.cos(.3*Math.PI);
    double d = x*Math.sin(.1*Math.PI);
    double e = x*Math.sin(.3*Math.PI);

    double leftCenterX = gap + a + b + d/2;
    double leftCenterY = gap + x + minxRad - d;

    double f = Math.cos(.1*Math.PI);
    double gg = Math.cos(.2*Math.PI);
    double magicShiftNumber = d*0.6+minxRad*(f+gg);
    double shift = leftCenterX+magicShiftNumber;

    public HashMap<Face, GeneralPath> getFaceBoundaries() {
        HashMap<Face, GeneralPath> faces = new HashMap<Face, GeneralPath>();
        faces.put(Face.U,   getPentagon(leftCenterX  , leftCenterY  , true , minxRad));
        faces.put(Face.BL,  getPentagon(leftCenterX-c, leftCenterY-e, false, minxRad));
        faces.put(Face.BR,  getPentagon(leftCenterX+c, leftCenterY-e, false, minxRad));
        faces.put(Face.R,   getPentagon(leftCenterX+b, leftCenterY+d, false, minxRad));
        faces.put(Face.F,   getPentagon(leftCenterX  , leftCenterY+x, false, minxRad));
        faces.put(Face.L,   getPentagon(leftCenterX-b, leftCenterY+d, false, minxRad));

        faces.put(Face.D,   getPentagon(shift+gap+a+b  , gap+x+minxRad  , false, minxRad));
        faces.put(Face.DR,  getPentagon(shift+gap+a+b-c, gap+x+e+minxRad, true , minxRad));
        faces.put(Face.DBR, getPentagon(shift+gap+a    , gap+x-d+minxRad, true , minxRad));
        faces.put(Face.B,   getPentagon(shift+gap+a+b  , gap+minxRad    , true , minxRad));
        faces.put(Face.DBL, getPentagon(shift+gap+a+2*b, gap+x-d+minxRad, true , minxRad));
        faces.put(Face.DL,  getPentagon(shift+gap+a+b+c, gap+x+e+minxRad, true , minxRad));
        return faces;
    }

    @Override
    public HashMap<String, GeneralPath> getDefaultFaceBoundaries() {
        HashMap<String, GeneralPath> stringy = new HashMap<String, GeneralPath>();
        HashMap<Face, GeneralPath> faces = getFaceBoundaries();
        for(Face f : faces.keySet()) {
            stringy.put(f.toString(), faces.get(f));
        }
        return stringy;
    }
    */

    @Override
    public PuzzleState getSolvedState() {
        return new MegaminxState();
    }

    @Override
    protected int getRandomMoveCount() {
        return 11*7;
    }

    @Override
    public PuzzleStateAndGenerator generateRandomMoves(Random r) {
        StringBuilder scramble = new StringBuilder();

        int width = 10, height = 7;
        for(int i = 0; i < height; i++) {
            if(i > 0) {
                scramble.append("\n");
            }
            int dir = 0;
            for(int j = 0; j < width; j++) {
                if(j > 0) {
                    scramble.append(" ");
                }
                char side = (j % 2 == 0) ? 'R' : 'D';
                dir = r.nextInt(2);
                scramble.append(side + ((dir == 0) ? "++" : "--"));
            }
            scramble.append(" U");
            if(dir != 0) {
                scramble.append("'");
            }
        }

        String scrambleStr = scramble.toString();

        PuzzleState state = getSolvedState();
        try {
            state = state.applyAlgorithm(scrambleStr);
        } catch(InvalidScrambleException e) {
            azzert(false, e);
            return null;
        }
        return new PuzzleStateAndGenerator(state, scrambleStr);
    }

    private int centerIndex = 10;
    private boolean isNormalized(int[][] image) {
        return image[Face.U.ordinal()][centerIndex] == Face.U.ordinal() && image[Face.F.ordinal()][centerIndex] == Face.F.ordinal();
    }

    private int[][] cloneImage(int[][] image) {
        int[][] imageCopy = new int[image.length][image[0].length];
        GwtSafeUtils.deepCopy(image, imageCopy);
        return imageCopy;
    }

    private void spinMinx(int[][] image, Face face, int dir) {
        turn(image, face, dir);
        bigTurn(image, face.oppositeFace(), 5 - dir);
    }

    private void spinToTop(int[][] image, Face face) {
        switch(face) {
            case U:
                break;
            case BL:
                spinMinx(image, Face.L, 1);
                break;
            case BR:
                spinMinx(image, Face.U, 1);
                spinToTop(image, Face.R);
                break;
            case R:
                spinMinx(image, Face.U, 1);
                spinToTop(image, Face.F);
                break;
            case F:
                spinMinx(image, Face.L, -1);
                break;
            case L:
                spinMinx(image, Face.U, 1);
                spinToTop(image, Face.BL);
                break;
            case D:
                spinMinx(image, Face.L, -2);
                spinToTop(image, Face.R);
                break;
            case DR:
                spinMinx(image, Face.L, -1);
                spinToTop(image, Face.R);
                break;
            case DBR:
                spinMinx(image, Face.U, 1);
                spinMinx(image, Face.L, -1);
                spinToTop(image, Face.R);
                break;
            case B:
                spinMinx(image, Face.L, -3);
                spinToTop(image, Face.R);
                break;
            case DBL:
                spinMinx(image, Face.L, 2);
                break;
            case DL:
                spinMinx(image, Face.L, -2);
                break;
            default:
                azzert(false);
        }
    }

    private int[][] normalize(int[][] image) {
        if(isNormalized(image)) {
            return image;
        }

        image = cloneImage(image);
        for(Face face : Face.values()) {
            if(image[face.ordinal()][centerIndex] == Face.U.ordinal()) {
                spinToTop(image, face);
                azzert(image[Face.U.ordinal()][centerIndex] == Face.U.ordinal());
                for(int chooseF = 0; chooseF < 5; chooseF++) {
                    spinMinx(image, Face.U, 1);
                    if(isNormalized(image)) {
                        return image;
                    }
                }
                azzert(false);
            }
        }
        azzert(false);
        return null;
    }

    class MegaminxState extends PuzzleState {
        private final int[][] image, normalizedImage;
        public MegaminxState() {
            image = new int[12][11];
            for(int i = 0; i < image.length; i++) {
                for(int j = 0; j < image[0].length; j++) {
                    image[i][j] = i;
                }
            }
            azzert(isNormalized(image));
            normalizedImage = image;
        }

        public MegaminxState(int[][] image) {
            this.image = image;
            normalizedImage = normalize(image);
        }

        @Override
        public HashMap<String, MegaminxState> getSuccessors() {
            HashMap<String, MegaminxState> successors = new HashMap<String, MegaminxState>();

            String[] prettyDir = new String[] { null, "", "2", "2'", "'" };
            for(Face face : Face.values()) {
                for(int dir = 1; dir <= 4; dir++) {
                    String move = face.toString();
                    move += prettyDir[dir];

                    int[][] imageCopy = cloneImage(image);
                    turn(imageCopy, face, dir);

                    successors.put(move, new MegaminxState(imageCopy));
                }
            }

            HashMap<String, Face> pochmannFaceNames = new HashMap<String, Face>();
            pochmannFaceNames.put("R", Face.DBR);
            pochmannFaceNames.put("D", Face.D);
            String[] prettyPochmannDir = new String[] { null, null, "++", "--" };
            for(String pochmannFaceName : pochmannFaceNames.keySet()) {
                for(int dir : new int[] { 2, 3 }) {
                    String move = pochmannFaceName + prettyPochmannDir[dir];

                    int[][] imageCopy = cloneImage(image);
                    bigTurn(imageCopy, pochmannFaceNames.get(pochmannFaceName), dir);

                    successors.put(move, new MegaminxState(imageCopy));
                }
            }
            return successors;
        }

        @Override
        public HashMap<String, MegaminxState> getScrambleSuccessors() {
            HashMap<String, MegaminxState> successors = getSuccessors();
            HashMap<String, MegaminxState> scrambleSuccessors = new HashMap<String, MegaminxState>();
            for(String turn : new String[] { "R++", "R--", "D++", "D--", "U", "U2", "U2'", "U'" }) {
                scrambleSuccessors.put(turn, successors.get(turn));
            }
            return scrambleSuccessors;
        }

        @Override
        public boolean equals(Object other) {
            MegaminxState o = ((MegaminxState) other);
            return Arrays.deepEquals(normalizedImage, o.normalizedImage);
        }

        @Override
        public int hashCode() {
            return Arrays.deepHashCode(normalizedImage);
        }

        /*<<<
        @Override
        protected void drawScramble(Graphics2D g, HashMap<String, Color> colorScheme) {
            drawMinx(g, gap, minxRad, colorScheme);
        }

        private void drawMinx(Graphics2D g, int gap, int minxRad, HashMap<String, Color> colorScheme) {
            HashMap<Face, GeneralPath> pentagons = getFaceBoundaries();
            for(Face face : pentagons.keySet()) {
                int f = face.ordinal();
                int rotateCounterClockwise;
                if(face == Face.U) {
                    rotateCounterClockwise = 0;
                } else if(f >= 1 && f <= 5) {
                    rotateCounterClockwise = 1;
                } else if(f >= 6 && f <= 11) {
                    rotateCounterClockwise = 2;
                } else {
                    azzert(false);
                    return;
                }
                String label = null;
                if(face == Face.U || face == Face.F) {
                    label = face.toString();
                }
                drawPentagon(g, pentagons.get(face), image[f], rotateCounterClockwise, label, colorScheme);
            }
        }

        private void drawPentagon(Graphics2D g, GeneralPath p, int[] state, int rotateCounterClockwise, String label, HashMap<String, Color> colorScheme) {
            double[] xpoints = new double[5];
            double[] ypoints = new double[5];
            PathIterator iter = p.getPathIterator(null);
            for(int ch = 0; ch < 5; ch++) {
                double[] coords = new double[6];
                int type = iter.currentSegment(coords);
                if(type == PathIterator.SEG_MOVETO || type == PathIterator.SEG_LINETO) {
                    xpoints[ch] = coords[0];
                    ypoints[ch] = coords[1];
                }
                iter.next();
            }

            double[] xs = new double[10];
            double[] ys = new double[10];
            for(int i = 0; i < 5; i++) {
                xs[i]=.4*xpoints[(i+1)%5]+.6*xpoints[i];
                ys[i]=.4*ypoints[(i+1)%5]+.6*ypoints[i];
                xs[i+5]=.6*xpoints[(i+1)%5]+.4*xpoints[i];
                ys[i+5]=.6*ypoints[(i+1)%5]+.4*ypoints[i];
            }

            GeneralPath[] ps = new GeneralPath[11];
            for(int i = 0 ; i < ps.length; i++) {
                ps[i] = new GeneralPath();
            }
            Point2D.Double[] intpent = new Point2D.Double[5];
            for(int i = 0; i < intpent.length; i++) {
                intpent[i] = getLineIntersection(xs[i], ys[i], xs[5+(3+i)%5], ys[5+(3+i)%5], xs[(i+1)%5], ys[(i+1)%5], xs[5+(4+i)%5], ys[5+(4+i)%5]);
                if(i == 0) {
                    ps[10].moveTo(intpent[i].x, intpent[i].y);
                } else {
                    ps[10].lineTo(intpent[i].x, intpent[i].y);
                }
            }
            ps[10].closePath();

            for(int i = 0; i < 5; i++) {
                ps[2*i].moveTo(xpoints[i], ypoints[i]);
                ps[2*i].lineTo(xs[i], ys[i]);
                ps[2*i].lineTo(intpent[i].x, intpent[i].y);
                ps[2*i].lineTo(xs[5+(4+i)%5], ys[5+(4+i)%5]);
                ps[2*i].closePath();

                ps[2*i+1].moveTo(xs[i], ys[i]);
                ps[2*i+1].lineTo(xs[i+5], ys[i+5]);
                ps[2*i+1].lineTo(intpent[(i+1)%5].x, intpent[(i+1)%5].y);
                ps[2*i+1].lineTo(intpent[i].x, intpent[i].y);
                ps[2*i+1].closePath();
            }


            for(int i = 0; i < ps.length; i++) {
                int j = i;
                if(j < 10) {
                    // This is a bit convoluted, but tries to keep the intuitive derivation clear.
                    j = (j + 2*rotateCounterClockwise) % 10;
                }
                g.setColor(colorScheme.get("" + Face.values()[state[j]]));
                g.fill(ps[i]);
                g.setColor(Color.BLACK);
                g.draw(ps[i]);
            }

            if(label != null) {
                double centerX = 0;
                double centerY = 0;
                for(Point2D.Double pt : intpent) {
                    centerX += pt.x;
                    centerY += pt.y;
                }
                centerX /= intpent.length;
                centerY /= intpent.length;
                int width = g.getFontMetrics().stringWidth(label);
                int ascent = g.getFontMetrics().getAscent();
                int magicPushUpNumber = 2;
                g.drawString(label, (float) (centerX - width/2.0), (float) (centerY + .5*(ascent) - magicPushUpNumber));
            }
        }
        */
    }
}
