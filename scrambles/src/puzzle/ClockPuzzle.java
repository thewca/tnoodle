package puzzle;

import static net.gnehzr.tnoodle.utils.GwtSafeUtils.azzert;

import net.gnehzr.tnoodle.svglite.Color;
import net.gnehzr.tnoodle.svglite.Dimension;
import net.gnehzr.tnoodle.svglite.Circle;
import net.gnehzr.tnoodle.svglite.Path;
import net.gnehzr.tnoodle.svglite.Svg;
import net.gnehzr.tnoodle.svglite.Transform;
import java.util.Arrays;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.Random;
import java.util.logging.Logger;

import net.gnehzr.tnoodle.scrambles.InvalidScrambleException;
import net.gnehzr.tnoodle.scrambles.Puzzle;
import net.gnehzr.tnoodle.scrambles.PuzzleStateAndGenerator;

import org.timepedia.exporter.client.Export;

@Export
public class ClockPuzzle extends Puzzle {
    private static final Logger l = Logger.getLogger(ClockPuzzle.class.getName());

    private static final String[] turns={"UR","DR","DL","UL","U","R","D","L","ALL"};
    private static final int STROKE_WIDTH = 2;
    private static final int radius = 70;
    private static final int clockRadius = 14;
    private static final int clockOuterRadius = 20;
    private static final int pointRadius = (clockRadius + clockOuterRadius) / 2;
    private static final int tickMarkRadius = 1;
    private static final int arrowHeight = 10;
    private static final int arrowRadius = 2;
    private static final int pinRadius = 4;
    private static final double arrowAngle = Math.PI / 2 - Math.acos( (double)arrowRadius / (double)arrowHeight );

    private static final int gap = 5;

    @Override
    public String getLongName() {
        return "Clock";
    }

    @Override
    public String getShortName() {
        return "clock";
    }

    private static final int[][] moves = {
        {0,1,1,0,1,1,0,0,0,  -1, 0, 0, 0, 0, 0, 0, 0, 0},// UR
        {0,0,0,0,1,1,0,1,1,   0, 0, 0, 0, 0, 0,-1, 0, 0},// DR
        {0,0,0,1,1,0,1,1,0,   0, 0, 0, 0, 0, 0, 0, 0,-1},// DL
        {1,1,0,1,1,0,0,0,0,   0, 0,-1, 0, 0, 0, 0, 0, 0},// UL
        {1,1,1,1,1,1,0,0,0,  -1, 0,-1, 0, 0, 0, 0, 0, 0},// U
        {0,1,1,0,1,1,0,1,1,  -1, 0, 0, 0, 0, 0,-1, 0, 0},// R
        {0,0,0,1,1,1,1,1,1,   0, 0, 0, 0, 0, 0,-1, 0,-1},// D
        {1,1,0,1,1,0,1,1,0,   0, 0,-1, 0, 0, 0, 0, 0,-1},// L
        {1,1,1,1,1,1,1,1,1,  -1, 0,-1, 0, 0, 0,-1, 0,-1},// A
    };

    private static HashMap<String, Color> defaultColorScheme = new HashMap<String, Color>();
    static {
        defaultColorScheme.put("Front", new Color(0x3375b2));
        defaultColorScheme.put("Back", new Color(0x55ccff));
        defaultColorScheme.put("FrontClock", new Color(0x55ccff));
        defaultColorScheme.put("BackClock", new Color(0x3375b2));
        defaultColorScheme.put("Hand", Color.YELLOW);
        defaultColorScheme.put("HandBorder", Color.RED);
        defaultColorScheme.put("PinUp", Color.YELLOW);
        defaultColorScheme.put("PinDown", new Color(0x885500));
    }
    @Override
    public HashMap<String, Color> getDefaultColorScheme() {
        return new HashMap<String, Color>(defaultColorScheme);
    }

    @Override
    public Dimension getPreferredSize() {
        return new Dimension(4*(radius+gap), 2*(radius+gap));
    }

    @Override
    public PuzzleState getSolvedState() {
        return new ClockState();
    }

    @Override
    protected int getRandomMoveCount() {
        return 19;
    }

    @Override
    public PuzzleStateAndGenerator generateRandomMoves(Random r) {
        StringBuilder scramble = new StringBuilder();

        int[] clk_state = ClockSolver.randomState(r);
        int[] solution = new int[18];
        ClockSolver.Solution(clk_state, solution);
        for (int x=0; x<9; x++) {
            int turn = solution[x];
            if (turn == 0) {
                continue;
            }
            boolean clockwise = turn <= 6;
            if (turn > 6) {
                turn = 12 - turn;
            }
            scramble.append( turns[x] + turn + (clockwise?"+":"-") + " ");
        }
        scramble.append( "y2 ");
        for (int x=9; x<18; x++) {
            int turn = solution[x];
            if (turn == 0) {
                continue;
            }
            boolean clockwise = turn <= 6;
            if (turn > 6) {
                turn = 12 - turn;
            }
            scramble.append( turns[x - 9] + turn + (clockwise?"+":"-") + " ");
        }

        boolean isFirst = true;
        for(int x=0;x<4;x++) {
            if (r.nextInt(2) == 1) {
                scramble.append((isFirst?"":" ")+turns[x]);
                isFirst = false;
            }
        }

        String scrambleStr = scramble.toString().trim();

        PuzzleState state = getSolvedState();
        try {
            state = state.applyAlgorithm(scrambleStr);
        } catch(InvalidScrambleException e) {
            azzert(false, e);
            return null;
        }
        return new PuzzleStateAndGenerator(state, scrambleStr);
    }

    public class ClockState extends PuzzleState {

        private boolean[] pins;
        private int[] posit;
        private boolean rightSideUp;
        public ClockState() {
            pins = new boolean[] {false, false, false, false};
            posit = new int[] {0,0,0,0,0,0,0,0,0,  0,0,0,0,0,0,0,0,0};
            rightSideUp = true;
        }

        public ClockState(boolean[] pins, int[] posit, boolean rightSideUp) {
            this.pins = pins;
            this.posit = posit;
            this.rightSideUp = rightSideUp;
        }

        @Override
        public LinkedHashMap<String, PuzzleState> getSuccessorsByName() {
            LinkedHashMap<String, PuzzleState> successors = new LinkedHashMap<String, PuzzleState>();

            for(int turn = 0; turn < turns.length; turn++) {
                for(int rot = 0; rot < 12; rot++) {
                    // Apply the move
                    int[] positCopy = new int[18];
                    boolean[] pinsCopy = new boolean[4];
                    for( int p=0; p<18; p++) {
                        positCopy[p] = (posit[p] + rot*moves[turn][p] + 12)%12;
                    }
                    System.arraycopy(pins, 0, pinsCopy, 0, 4);

                    // Build the move string
                    boolean clockwise = ( rot < 7 );
                    String move = turns[turn] + (clockwise?(rot+"+"):((12-rot)+"-"));

                    successors.put(move, new ClockState(pinsCopy, positCopy, rightSideUp));
                }
            }

            // Still y2 to implement
            int[] positCopy = new int[18];
            boolean[] pinsCopy = new boolean[4];
            System.arraycopy(posit, 0, positCopy, 9, 9);
            System.arraycopy(posit, 9, positCopy, 0, 9);
            System.arraycopy(pins, 0, pinsCopy, 0, 4);
            successors.put("y2", new ClockState(pinsCopy, positCopy, !rightSideUp));

            // Pins position moves
            for(int pin = 0; pin < 4; pin++) {
                int[] positC = new int[18];
                boolean[] pinsC = new boolean[4];
                System.arraycopy(posit, 0, positC, 0, 18);
                System.arraycopy(pins, 0, pinsC, 0, 4);
                int pinI = (pin==0?1:(pin==1?3:(pin==2?2:0)));
                pinsC[pinI] = true;

                successors.put(turns[pin], new ClockState(pinsC, positC, rightSideUp));
            }

            return successors;
        }

        @Override
        public boolean equals(Object other) {
            ClockState o = ((ClockState) other);
            return Arrays.equals(posit, o.posit);
        }

        @Override
        public int hashCode() {
            return Arrays.hashCode(posit);
        }

        @Override
        protected Svg drawScramble(HashMap<String, Color> colorScheme) {
            Svg svg = new Svg(getPreferredSize());
            svg.setStroke(STROKE_WIDTH, 10, "round");
            drawBackground(svg, colorScheme);

            for(int i = 0; i < 18; i++) {
                drawClock(svg, i, posit[i], colorScheme);
            }

            drawPins(svg, pins, colorScheme);
            return svg;
        }

        protected void drawBackground(Svg g, HashMap<String, Color> colorScheme) {
            String[] colorString;
            if(rightSideUp) {
                colorString = new String[]{"Front", "Back"};
            } else {
                colorString = new String[]{"Back", "Front"};
            }

            for(int s = 0; s < 2; s++) {
                Transform t = Transform.getTranslateInstance((s*2+1)*(radius + gap), radius + gap);

                // Draw puzzle
                for(int centerX : new int[] { -2*clockOuterRadius, 2*clockOuterRadius }) {
                    for(int centerY : new int[] { -2*clockOuterRadius, 2*clockOuterRadius }) {
                        Circle c = new Circle(centerX, centerY, clockOuterRadius);
                        c.setTransform(t);
                        c.setStroke(Color.BLACK);
                        g.appendChild(c);
                    }
                }

                Circle outerCircle = new Circle(0, 0, radius);
                outerCircle.setTransform(t);
                outerCircle.setStroke(Color.BLACK);
                outerCircle.setFill(colorScheme.get(colorString[s]));
                g.appendChild(outerCircle);

                for(int centerX : new int[] { -2*clockOuterRadius, 2*clockOuterRadius }) {
                    for(int centerY : new int[] { -2*clockOuterRadius, 2*clockOuterRadius }) {
                        // We don't want to clobber part of our nice
                        // thick outer border.
                        int innerClockOuterRadius = clockOuterRadius - STROKE_WIDTH/2;
                        Circle c = new Circle(centerX, centerY, innerClockOuterRadius);
                        c.setTransform(t);
                        c.setFill(colorScheme.get(colorString[s]));
                        g.appendChild(c);
                    }
                }

                // Draw clocks
                for(int i = -1; i <= 1; i++) {
                    for(int j = -1; j <= 1; j++) {
                        Transform tCopy = new Transform(t);
                        tCopy.translate(2*i*clockOuterRadius, 2*j*clockOuterRadius);
                        
                        Circle clockFace = new Circle(0, 0, clockRadius);
                        clockFace.setStroke(Color.BLACK);
                        clockFace.setFill(colorScheme.get(colorString[s]+ "Clock"));
                        clockFace.setTransform(tCopy);
                        g.appendChild(clockFace);

                        for(int k = 0; k < 12; k++) {
                            Circle tickMark = new Circle(0, -pointRadius, tickMarkRadius);
                            tickMark.setFill(colorScheme.get(colorString[s] + "Clock"));
                            tickMark.rotate(Math.toRadians(30*k));
                            tickMark.transform(tCopy);
                            g.appendChild(tickMark);
                        }

                    }
                }
            }
        }

        protected void drawClock(Svg g, int clock, int position, HashMap<String, Color> colorScheme) {
            Transform t = new Transform();
            t.rotate(Math.toRadians(position*30));
            int netX = 0;
            int netY = 0;
            int deltaX, deltaY;
            if(clock < 9) {
                deltaX = radius + gap;
                deltaY = radius + gap;
                t.translate(deltaX, deltaY);
                netX += deltaX;
                netY += deltaY;
            } else {
                deltaX = 3*(radius + gap);
                deltaY = radius + gap;
                t.translate(deltaX, deltaY);
                netX += deltaX;
                netY += deltaY;
                clock -= 9;
            }

            deltaX = 2*((clock%3) - 1)*clockOuterRadius;
            deltaY = 2*((clock/3) - 1)*clockOuterRadius;
            t.translate(deltaX, deltaY);
            netX += deltaX;
            netY += deltaY;

            Path arrow = new Path();
            arrow.moveTo(0, 0);
            arrow.lineTo(arrowRadius*Math.cos(arrowAngle), -arrowRadius*Math.sin(arrowAngle));
            arrow.lineTo(0, -arrowHeight);
            arrow.lineTo(-arrowRadius*Math.cos( arrowAngle ), -arrowRadius*Math.sin(arrowAngle));
            arrow.closePath();
            arrow.setStroke(colorScheme.get("HandBorder"));
            arrow.setTransform(t);
            g.appendChild(arrow);

            Circle handBase = new Circle(0, 0, arrowRadius);
            handBase.setStroke(colorScheme.get("HandBorder"));
            handBase.setTransform(t);
            g.appendChild(handBase);

            arrow = new Path(arrow);
            arrow.setFill(colorScheme.get("Hand"));
            arrow.setStroke(null);
            arrow.setTransform(t);
            g.appendChild(arrow);

            handBase = new Circle(handBase);
            handBase.setFill(colorScheme.get("Hand"));
            handBase.setStroke(null);
            handBase.setTransform(t);
            g.appendChild(handBase);
        }

        protected void drawPins(Svg g, boolean[] pins, HashMap<String, Color> colorScheme) {
            Transform t = new Transform();
            t.translate(radius + gap, radius + gap);
            int k = 0;
            for(int i = -1; i <= 1; i += 2) {
                for(int j = -1; j <= 1; j += 2) {
                    Transform tt = new Transform(t);
                    tt.translate(j*clockOuterRadius, i*clockOuterRadius);
                    drawPin(g, tt, pins[k++], colorScheme);
                }
            }

            t.translate(2*(radius + gap), 0);
            k = 1;
            for(int i = -1; i <= 1; i += 2) {
                for(int j = -1; j <= 1; j += 2) {
                    Transform tt = new Transform(t);
                    tt.translate(j*clockOuterRadius, i*clockOuterRadius);
                    drawPin(g, tt, !pins[k--], colorScheme);
                }
                k = 3;
            }
        }

        protected void drawPin(Svg g, Transform t, boolean pinUp, HashMap<String, Color> colorScheme) {
            Circle pin = new Circle(0, 0, pinRadius);
            pin.setTransform(t);
            pin.setStroke(Color.BLACK);
            pin.setFill(colorScheme.get( pinUp ? "PinUp" : "PinDown" ));
            g.appendChild(pin);
        }

    }

    /**
     *   1 2 3    -3 10 -1
     *   4 5 6    11 12 13
     *   7 8 9    -9 14 -7
     *  (front)    (back)
     */
    public static class ClockSolver {
        static int[][] moveArr = {
            { 0, 1, 1, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0},    //UR
            { 0, 0, 0, 0, 1, 1, 0, 1, 1, 0, 0, 0, 0, 0},    //DR
            { 0, 0, 0, 1, 1, 0, 1, 1, 0, 0, 0, 0, 0, 0},    //DL
            { 1, 1, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0},    //UL
            { 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0},    //U
            { 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 0, 0, 0, 0},    //R
            { 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0},    //D
            { 1, 1, 0, 1, 1, 0, 1, 1, 0, 0, 0, 0, 0, 0},    //L
            { 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0},    //ALL
            {11, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 1, 0},    //UR
            { 0, 0, 0, 0, 0, 0,11, 0, 0, 0, 0, 1, 1, 1},    //DR
            { 0, 0, 0, 0, 0, 0, 0, 0,11, 0, 1, 1, 0, 1},    //DL
            { 0, 0,11, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0},    //UL
            {11, 0,11, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0},    //U
            {11, 0, 0, 0, 0, 0,11, 0, 0, 1, 0, 1, 1, 1},    //R
            { 0, 0, 0, 0, 0, 0,11, 0,11, 0, 1, 1, 1, 1},    //D
            { 0, 0,11, 0, 0, 0, 0, 0,11, 1, 1, 1, 0, 1},    //L
            {11, 0,11, 0, 0, 0,11, 0,11, 1, 1, 1, 1, 1}     //ALL
        };

        static int[][] Cnk = new int[32][32];

        static {
            for (int i=0; i<32; i++) {
                Cnk[i][i] = 1;
                Cnk[i][0] = 1;
            }
            for (int i=1; i<32; i++) {
                for (int j=1; j<=i; j++) {
                    Cnk[i][j] = Cnk[i-1][j] + Cnk[i-1][j-1];
                }
            }

        }

        static int select(int n, int k, int idx) {
            int r = k;
            int val = 0;
            for (int i=n-1; i>=0; i--) {
                if (idx >= Cnk[i][r]) {
                    idx -= Cnk[i][r--];
                    val |= 1 << i;
                }
            }
            return val;
        }

        //invert table          0  1  2  3  4  5  6  7  8  9 10 11
        static int[] invert = {-1, 1,-1,-1,-1, 5,-1, 7,-1,-1,-1,11};

        public static int[] randomState(java.util.Random r) {
            int[] ret = new int[14];
            for (int i=0; i<14; i++) {
                ret[i] = r.nextInt(12);
            }
            return ret;
        }

        /**
         *
         *  @return the length of the solution (the number of non-zero elements in the solution array)
         *      -1: invalid input
         */
        public static int Solution(int[] clock, int[] solution) {
            if (clock.length != 14 || solution.length != 18) {
                return -1;
            }
            int ret = solveIn(14, clock, solution);
            return ret;
        }

        static void swap(int[][] arr, int row1, int row2) {
            int[] tmp = arr[row1];
            arr[row1] = arr[row2];
            arr[row2] = tmp;
        }

        static void addTo(int[][] arr, int row1, int row2, int startidx, int mul) {
            int length = arr[0].length;
            for (int i=startidx; i<length; i++) {
                arr[row2][i] = (arr[row2][i] + arr[row1][i] * mul) % 12;
            }
        }

        //linearly dependent
        static int[] ld_list = {7695, 42588, 47187, 85158, 86697, 156568, 181700, 209201, 231778};

        static int solveIn(int k, int[] numbers, int[] solution) {
            int n = 18;
            int min_nz = k+1;

            for (int idx=0; idx<Cnk[n][k]; idx++) {
                int val = select(n, k, idx);
                boolean isLD = false;
                for (int r: ld_list) {
                    if ((val & r) == r) {
                        isLD = true;
                        break;
                    }
                }
                if (isLD) {
                    continue;
                }
                int[] map = new int[k];
                int cnt = 0;
                for (int j=0; j<n; j++) {
                    if (((val >> j) & 1) == 1) {
                        map[cnt++] = j;
                    }
                }
                int[][] arr = new int[14][k+1];
                for (int i=0; i<14; i++) {
                    for (int j=0; j<k; j++) {
                        arr[i][j] = moveArr[map[j]][i];
                    }
                    arr[i][k] = numbers[i];
                }
                int ret = GaussianElimination(arr);
                if (ret != 0) {
                    continue;
                }
                boolean isSolved = true;
                for (int i=k; i<14; i++) {
                    if (arr[i][k] != 0) {
                        isSolved = false;
                        break;
                    }
                }
                if (!isSolved) {
                    continue;
                }
                backSubstitution(arr);
                int cnt_nz = 0;
                for (int i=0; i<k; i++) {
                    if (arr[i][k] != 0) {
                        cnt_nz++;
                    }
                }
                if (cnt_nz < min_nz) {
                    for (int i=0; i<18; i++) {
                        solution[i] = 0;
                    }
                    for (int i=0; i<k; i++) {
                        solution[map[i]] = arr[i][k];
                    }
                    min_nz = cnt_nz;
                }
            }
            return min_nz == k+1 ? -1 : min_nz;
        }

        static int GaussianElimination(int[][] arr) {
            int m = 14;
            int n = arr[0].length;
            for (int i=0; i<n-1; i++) {
                if (invert[arr[i][i]] == -1) {
                    int ivtidx = -1;
                    for (int j=i+1; j<m; j++) {
                        if (invert[arr[j][i]] != -1) {
                            ivtidx = j;
                            break;
                        }
                    }
                    if (ivtidx == -1) {
                        OUT:
                        for (int j1=i; j1<m-1; j1++) {
                            for (int j2=j1+1; j2<m; j2++) {
                                if (invert[(arr[j1][i] + arr[j2][i]) % 12] != -1) {
                                    addTo(arr, j2, j1, i, 1);
                                    ivtidx = j1;
                                    break OUT;
                                }
                            }
                        }
                    }
                    if (ivtidx == -1) { //k vectors are linearly dependent
                        for (int j=i+1; j<m; j++) {
                            if (arr[j][i] != 0) {
                                return -1;
                            }
                        }
                        return i + 1;
                    }
                    swap(arr, i, ivtidx);
                }
                int inv = invert[arr[i][i]];
                for (int j=i; j<n; j++) {
                    arr[i][j] = arr[i][j] * inv % 12;
                }
                for (int j=i+1; j<m; j++) {
                    addTo(arr, i, j, i, 12 - arr[j][i]);
                }
            }
            return 0;
        }

        static void backSubstitution(int[][] arr) {
            int m = 14;
            int n = arr[0].length;
            for (int i=n-2; i>0; i--) {
                for (int j=i-1; j>=0; j--) {
                    if (arr[j][i] != 0) {
                        addTo(arr, i, j, i, 12 - arr[j][i]);
                    }
                }
            }
        }
    }
}
