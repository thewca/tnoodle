package puzzle;

import static net.gnehzr.tnoodle.utils.GwtSafeUtils.azzert;

import net.gnehzr.tnoodle.svglite.Color;
import net.gnehzr.tnoodle.svglite.Svg;
import net.gnehzr.tnoodle.svglite.Dimension;
import net.gnehzr.tnoodle.svglite.Path;
import net.gnehzr.tnoodle.svglite.Transform;
import java.util.Arrays;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.Random;
import java.util.logging.Logger;

import puzzle.SkewbSolver.SkewbSolverState;

import net.gnehzr.tnoodle.scrambles.InvalidScrambleException;
import net.gnehzr.tnoodle.scrambles.Puzzle;
import net.gnehzr.tnoodle.scrambles.PuzzleStateAndGenerator;
import net.gnehzr.tnoodle.utils.GwtSafeUtils;

import org.timepedia.exporter.client.Export;

@Export
public class SkewbPuzzle extends Puzzle {
    private static final int MIN_SCRAMBLE_LENGTH = 11;
    private static final Logger l = Logger.getLogger(SkewbPuzzle.class.getName());
    private SkewbSolver skewbSolver = null;

    private static final int pieceSize = 30;
    private static final int gap = 3;

    private static final double sq3d2 = Math.sqrt(3) / 2;

    public SkewbPuzzle() {
        skewbSolver = new SkewbSolver();
        wcaMinScrambleDistance = 7;
    }

    @Override
    public PuzzleStateAndGenerator generateRandomMoves(Random r) {
        SkewbSolverState state = skewbSolver.randomState(r);
        String scramble = skewbSolver.generateExactly(state, MIN_SCRAMBLE_LENGTH, r);

        PuzzleState pState;
        try {
            pState = getSolvedState().applyAlgorithm(scramble);
        } catch (InvalidScrambleException e) {
            azzert(false, e);
            return null;
        }
        return new PuzzleStateAndGenerator(pState, scramble);
    }

    /*************************************************************
     * Functions to display the puzzle
     */


    private static final HashMap<String, Color> defaultColorScheme = new HashMap<String, Color>();
    static {
        defaultColorScheme.put("U", Color.WHITE);
        defaultColorScheme.put("R", Color.BLUE);
        defaultColorScheme.put("F", Color.RED);
        defaultColorScheme.put("D", Color.YELLOW);
        defaultColorScheme.put("L", Color.GREEN);
        defaultColorScheme.put("B", new Color(0xFF8000));
    }

    @Override
    public HashMap<String, Color> getDefaultColorScheme() {
        return new HashMap<String, Color>(defaultColorScheme);
    }

    private Transform[] getFaceTrans() {
        Transform[] position = {
            new Transform(pieceSize*sq3d2, -pieceSize/2, pieceSize*sq3d2, pieceSize/2, (pieceSize*4+gap*1.5)*sq3d2, pieceSize),
            new Transform(pieceSize*sq3d2, -pieceSize/2, 0, pieceSize, (pieceSize*7+gap*3)*sq3d2, pieceSize * 1.5),
            new Transform(pieceSize*sq3d2, -pieceSize/2, 0, pieceSize, (pieceSize*5+gap*2)*sq3d2, pieceSize * 2.5 + 0.5 * gap),
            new Transform(0, pieceSize, -pieceSize*sq3d2, -pieceSize/2, (pieceSize*3+gap*1)*sq3d2, pieceSize * 4.5 + 1.5 * gap),
            new Transform(pieceSize*sq3d2, pieceSize/2, 0, pieceSize, (pieceSize*3+gap*1)*sq3d2, pieceSize * 2.5 + 0.5 * gap),
            new Transform(pieceSize*sq3d2, pieceSize/2, 0, pieceSize, pieceSize*sq3d2, pieceSize * 1.5),
        };
        return position;
    }

    @Override
    public Dimension getPreferredSize() {
        return new Dimension(
                (int) Math.ceil((3 * gap + 8 * pieceSize + 1) * sq3d2),
                (int) Math.ceil(2 * gap + 6 * pieceSize + 1));
    }

    @Override
    public String getLongName() {
        return "Skewb";
    }

    @Override
    public String getShortName() {
        return "skewb";
    }

    @Override
    public PuzzleState getSolvedState() {
        return new SkewbState();
    }

    @Override
    protected int getRandomMoveCount() {
        return 15;
    }

    public class SkewbState extends PuzzleState {

        /**
         *           +---------+
         *           | 1     2 |
         *       U > |   0-0   |
         *           | 3     4 |
         * +---------+---------+---------+---------+
         * | 1     2 | 1     2 | 1     2 | 1     2 |
         * |   4-0   |   2-0   |   1-0   |   5-0   |
         * | 3     4 | 3     4 | 3     4 | 3     4 |
         * +---------+---------+---------+---------+
         *      ^    | 1     2 |
         *      FL   |   3-0   |
         *           | 3     4 |
         *           +---------+
         */
        private int[][] image = new int[6][5];

        SkewbState() {
            for (int i=0; i<6; i++) {
                for (int j=0; j<5; j++) {
                    image[i][j] = i;
                }
            }
        }

        SkewbState(int[][] _image) {
            for (int i=0; i<6; i++) {
                for (int j=0; j<5; j++) {
                    image[i][j] = _image[i][j];
                }
            }
        }

        private void turn(int axis, int pow, int[][] image) {
            //axis:0-R 1-U 2-L 3-B
            for (int p=0; p<pow; p++) {
                switch (axis) {
                    case 0:
                        swap(2, 0, 3, 0, 1, 0, image);
                        swap(2, 4, 3, 2, 1, 3, image);
                        swap(2, 2, 3, 1, 1, 4, image);
                        swap(2, 3, 3, 4, 1, 1, image);
                        swap(4, 4, 5, 3, 0, 4, image);
                        break;
                    case 1:
                        swap(0, 0, 1, 0, 5, 0, image);
                        swap(0, 2, 1, 2, 5, 1, image);
                        swap(0, 4, 1, 4, 5, 2, image);
                        swap(0, 1, 1, 1, 5, 3, image);
                        swap(4, 1, 2, 2, 3, 4, image);
                        break;
                    case 2:
                        swap(4, 0, 5, 0, 3, 0, image);
                        swap(4, 3, 5, 4, 3, 3, image);
                        swap(4, 1, 5, 3, 3, 1, image);
                        swap(4, 4, 5, 2, 3, 4, image);
                        swap(2, 3, 0, 1, 1, 4, image);
                        break;
                    case 3:
                        swap(1, 0, 3, 0, 5, 0, image);
                        swap(1, 4, 3, 4, 5, 3, image);
                        swap(1, 3, 3, 3, 5, 1, image);
                        swap(1, 2, 3, 2, 5, 4, image);
                        swap(0, 2, 2, 4, 4, 3, image);
                        break;
                    default:
                        azzert(false);
                }
            }
        }

        private void swap(int f1, int s1, int f2, int s2, int f3, int s3, int[][] image) {
            int temp = image[f1][s1];
            image[f1][s1] = image[f2][s2];
            image[f2][s2] = image[f3][s3];
            image[f3][s3] = temp;
        }

        /**
         * return a square skewb face. whose 4 corners are (-1, -1), (1, -1), (1, 1), (-1, 1). It will be transformed later.
         */
        private Path[] getFacePaths() {
            Path[] p = new Path[5];
            for (int i=0; i<5; i++) {
                p[i] = new Path();
                // In svg, by default, borders are scaled along with shapes.
                // Setting vector-effect to non-scaling-stroke disables that.
                // Unfortunately, batik doesn't support it, so we have
                // to do something hacky by explicitly setting the
                // stroke-width to something teeny.
                // If Batik ever changes to support vector-effect, we
                // can clean this up.
                //p[i].setAttribute("vector-effect", "non-scaling-stroke");
                p[i].setAttribute("stroke-width", 1.0/pieceSize + "px");
            }
            p[0].moveTo(-1, 0); p[0].lineTo( 0, 1); p[0].lineTo( 1, 0); p[0].lineTo(0,-1); p[0].closePath();
            p[1].moveTo(-1, 0); p[1].lineTo(-1,-1); p[1].lineTo( 0,-1); p[1].closePath();
            p[2].moveTo( 0,-1); p[2].lineTo( 1,-1); p[2].lineTo( 1, 0); p[2].closePath();
            p[3].moveTo(-1, 0); p[3].lineTo(-1, 1); p[3].lineTo( 0, 1); p[3].closePath();
            p[4].moveTo( 0, 1); p[4].lineTo( 1, 1); p[4].lineTo( 1, 0); p[4].closePath();
            return p;
        }

        protected Svg drawScramble(HashMap<String, Color> colorScheme) {
            Svg g = new Svg(getPreferredSize());
            Color[] scheme = new Color[6];
            for(int i = 0; i < scheme.length; i++) {
                scheme[i] = colorScheme.get("URFDLB".charAt(i)+"");
            }
            Transform[] position = getFaceTrans();
            for (int face=0; face<6; face++) {
                Path[] p = getFacePaths();
                for (int i=0; i<5; i++) {
                    p[i].transform(position[face]);
                    p[i].setFill(scheme[image[face][i]]);
                    p[i].setStroke(Color.BLACK);
                    g.appendChild(p[i]);
                }
            }
            return g;
        }

        public LinkedHashMap<String, PuzzleState> getSuccessorsByName() {
            LinkedHashMap<String, PuzzleState> successors = new LinkedHashMap<String, PuzzleState>();
            String axes = "RULB";
            for(int axis = 0; axis < axes.length(); axis++) {
                char face = axes.charAt(axis);
                for(int pow = 1; pow <= 2; pow++) {
                    String turn = "" + face;
                    if(pow == 2) {
                        turn += "'";
                    }
                    int[][] imageCopy = new int[image.length][image[0].length];
                    GwtSafeUtils.deepCopy(image, imageCopy);
                    turn(axis, pow, imageCopy);
                    successors.put(turn, new SkewbState(imageCopy));
                }
            }

            return successors;
        }

        @Override
        public boolean equals(Object other) {
            // Sure this could blow up with a cast exception, but shouldn't it? =)
            return Arrays.deepEquals(image, ((SkewbState) other).image);
        }

        @Override
        public int hashCode() {
            return Arrays.deepHashCode(image);
        }
    }

}
