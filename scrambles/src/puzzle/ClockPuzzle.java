package puzzle;

import static net.gnehzr.tnoodle.utils.Utils.azzert;
import static net.gnehzr.tnoodle.utils.Utils.toColor;

import java.awt.Color;
import java.awt.Dimension;
import java.awt.Graphics2D;
import java.awt.RenderingHints;
import java.awt.geom.AffineTransform;
import java.awt.geom.Area;
import java.awt.geom.Ellipse2D;
import java.awt.geom.GeneralPath;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Random;

import net.gnehzr.tnoodle.scrambles.InvalidScrambleException;
import net.gnehzr.tnoodle.scrambles.Puzzle;
import net.gnehzr.tnoodle.scrambles.PuzzleStateAndGenerator;

public class ClockPuzzle extends Puzzle {
    private static final String[] turns={"UR","DR","DL","UL","U","R","D","L","ALL"};
    private static final int radius = 70;
    private static final int clockRadius = 14;
    private static final int clockOuterRadius = 20;
    private static final int pointRadius = (clockRadius + clockOuterRadius) / 2;
    private static final int pointSize = 1;
    private static final int arrowHeight = 10;
    private static final int arrowRadius = 2;
    private static final int pinRadius = 5;
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

    protected Dimension getPreferredSize() {
        return new Dimension(4*(radius+gap), 2*(radius+gap));
    }

    private static HashMap<String, Color> defaultColorScheme = new HashMap<String, Color>();
    static {
        defaultColorScheme.put("Front", toColor("3375b2"));
        defaultColorScheme.put("Back", toColor("55ccff"));
        defaultColorScheme.put("FrontClock", toColor("55ccff"));
        defaultColorScheme.put("BackClock", toColor("3375b2"));
        defaultColorScheme.put("Hand", Color.YELLOW);
        defaultColorScheme.put("HandBorder", Color.RED);
        defaultColorScheme.put("PinUp", Color.YELLOW);
        defaultColorScheme.put("PinDown", toColor("885500"));
    }
    @Override
    public HashMap<String, Color> getDefaultColorScheme() {
        return new HashMap<String, Color>(defaultColorScheme);
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

    public HashMap<String, GeneralPath> getDefaultFaceBoundaries() {
        // Background
        Area backgroundFront = new Area();
        Area backgroundBack = new Area();
        backgroundFront.add(new Area(new Ellipse2D.Double(gap,gap, 2*radius, 2*radius)));
        backgroundBack.add(new Area(new Ellipse2D.Double(2*radius+3*gap,gap, 2*radius, 2*radius)));
        for(int i = -1; i < 2; i += 2) {
            for(int j = -1; j < 2; j += 2) {
                backgroundFront.add(new Area(new Ellipse2D.Double(radius+gap+2*i*clockOuterRadius-clockOuterRadius,radius+gap+2*j*clockOuterRadius-clockOuterRadius, 2*clockOuterRadius, 2*clockOuterRadius)));
                backgroundBack.add(new Area(new Ellipse2D.Double(3*radius+3*gap+2*i*clockOuterRadius-clockOuterRadius,radius+gap+2*j*clockOuterRadius-clockOuterRadius, 2*clockOuterRadius, 2*clockOuterRadius)));
            }
        }

        // Clocks
        Area clocksFront = new Area();
        Area clocksBack = new Area();
        for(int i = -1; i < 2; i++) {
            for(int j = -1; j < 2; j++) {
                clocksFront.add(new Area(new Ellipse2D.Double(radius+gap+2*i*clockOuterRadius-clockRadius,radius+gap+2*j*clockOuterRadius-clockRadius, 2*clockRadius, 2*clockRadius)));
                clocksBack.add(new Area(new Ellipse2D.Double(3*radius+3*gap+2*i*clockOuterRadius-clockRadius,radius+gap+2*j*clockOuterRadius-clockRadius, 2*clockRadius, 2*clockRadius)));
            }
        }

        // Pins
        Area pinsUp = new Area();
        Area pinsDown = new Area();
        for(int i = -1; i < 2; i += 2) {
            for(int j = -1; j < 2; j += 2) {
                pinsDown.add(new Area(new Ellipse2D.Double(radius+gap+j*clockOuterRadius-pinRadius, radius+gap+i*clockOuterRadius-pinRadius, 2*pinRadius, 2*pinRadius)));
                pinsUp.add(new Area(new Ellipse2D.Double(3*radius+3*gap+j*clockOuterRadius-pinRadius, radius+gap+i*clockOuterRadius-pinRadius, 2*pinRadius, 2*pinRadius)));
            }
        }

        HashMap<String, GeneralPath> facesMap = new HashMap<String, GeneralPath>();
        facesMap.put("Front", new GeneralPath(backgroundFront));
        facesMap.put("Back", new GeneralPath(backgroundBack));
        facesMap.put("FrontClock", new GeneralPath(clocksFront));
        facesMap.put("BackClock", new GeneralPath(clocksBack));
        facesMap.put("PinUp", new GeneralPath(pinsUp));
        facesMap.put("PinDown", new GeneralPath(pinsDown));

        return facesMap;
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

        for(int x=0; x<9; x++) {
            int turn = r.nextInt(12)-5;
            boolean clockwise = ( turn >= 0 );
            turn = Math.abs(turn);
            scramble.append( turns[x] + turn + (clockwise?"+":"-") + " ");
        }
        scramble.append( "y2 ");
        for(int x=4; x<9; x++) {
            int turn = r.nextInt(12)-5;
            boolean clockwise = ( turn >= 0 );
            turn = Math.abs(turn);
            scramble.append( turns[x] + turn + (clockwise?"+":"-") + " ");
        }

        boolean isFirst = true;
        for(int x=0;x<4;x++) {
            if (r.nextInt(2) == 1) {
                scramble.append((isFirst?"":" ")+turns[x]);
                isFirst = false;
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

    public class ClockState extends PuzzleState {

        private boolean[] pins;
        private int[] posit;
        public ClockState() {
            pins = new boolean[] {false, false, false, false};
            posit = new int[] {0,0,0,0,0,0,0,0,0,  0,0,0,0,0,0,0,0,0};
        }

        public ClockState(boolean[] pins, int[] posit) {
            this.pins = pins;
            this.posit = posit;
        }

        @Override
        public HashMap<String, PuzzleState> getSuccessors() {
            HashMap<String, PuzzleState> successors = new HashMap<String, PuzzleState>();

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

                    successors.put(move, new ClockState(pinsCopy, positCopy));
                }
            }

            // Still y2 to implement
            int[] positCopy = new int[18];
            boolean[] pinsCopy = new boolean[4];
            System.arraycopy(posit, 0, positCopy, 9, 9);
            System.arraycopy(posit, 9, positCopy, 0, 9);
            System.arraycopy(pins, 0, pinsCopy, 0, 4);
            successors.put("y2", new ClockState(pinsCopy, positCopy));

            // Pins position moves
            for(int pin = 0; pin < 4; pin++) {
                int[] positC = new int[18];
                boolean[] pinsC = new boolean[4];
                System.arraycopy(posit, 0, positC, 0, 18);
                System.arraycopy(pins, 0, pinsC, 0, 4);
                int pinI = (pin==0?1:(pin==1?3:(pin==2?2:0)));
                pinsC[pinI] = true;

                successors.put(turns[pin], new ClockState(pinsC, positC));
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
        protected void drawScramble(Graphics2D g, HashMap<String, Color> colorScheme) {
            g.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);

            drawBackground(g, colorScheme);

            for(int i = 0; i < 18; i++) {
                drawClock(g, i, posit[i], colorScheme);
            }

            drawPins(g, pins, colorScheme);
        }

        protected void drawBackground(Graphics2D g, HashMap<String, Color> colorScheme) {
            String[] colorString = {"Front", "Back"};

            for(int s = 0; s <2 ; s++) {

                g.translate((s*2+1)*(radius + gap), radius + gap);

                // Draw puzzle
                g.setColor(Color.BLACK);
                g.drawOval( 2*clockOuterRadius-clockOuterRadius,  2*clockOuterRadius-clockOuterRadius, 2*clockOuterRadius, 2*clockOuterRadius);
                g.drawOval(-2*clockOuterRadius-clockOuterRadius,  2*clockOuterRadius-clockOuterRadius, 2*clockOuterRadius, 2*clockOuterRadius);
                g.drawOval( 2*clockOuterRadius-clockOuterRadius, -2*clockOuterRadius-clockOuterRadius, 2*clockOuterRadius, 2*clockOuterRadius);
                g.drawOval(-2*clockOuterRadius-clockOuterRadius, -2*clockOuterRadius-clockOuterRadius, 2*clockOuterRadius, 2*clockOuterRadius);
                g.drawOval(-radius, -radius, 2*radius, 2*radius);
                g.setColor(colorScheme.get(colorString[s]));
                g.fillOval(-radius, -radius, 2*radius, 2*radius);
                g.fillOval( 2*clockOuterRadius-clockOuterRadius,  2*clockOuterRadius-clockOuterRadius, 2*clockOuterRadius, 2*clockOuterRadius);
                g.fillOval(-2*clockOuterRadius-clockOuterRadius,  2*clockOuterRadius-clockOuterRadius, 2*clockOuterRadius, 2*clockOuterRadius);
                g.fillOval( 2*clockOuterRadius-clockOuterRadius, -2*clockOuterRadius-clockOuterRadius, 2*clockOuterRadius, 2*clockOuterRadius);
                g.fillOval(-2*clockOuterRadius-clockOuterRadius, -2*clockOuterRadius-clockOuterRadius, 2*clockOuterRadius, 2*clockOuterRadius);

                // Draw clocks
                for(int i = -1; i < 2; i++ ) {
                    for(int j = -1; j < 2; j++ ) {
                        g.translate(2*i*clockOuterRadius, 2*j*clockOuterRadius);
                        g.setColor(colorScheme.get(colorString[s] + "Clock"));
                        g.fillOval(-clockRadius,  -clockRadius, 2*clockRadius, 2*clockRadius);
                        g.setColor(Color.BLACK);
                        g.drawOval(-clockRadius,  -clockRadius, 2*clockRadius, 2*clockRadius);

                        g.setColor(colorScheme.get(colorString[s] + "Clock"));
                        for(int k = 0; k < 12; k++) {
                            g.fillOval(-pointSize, -pointRadius-pointSize, 2*pointSize, 2*pointSize);
                            g.rotate(Math.toRadians(30));
                        }
                        g.translate(-2*i*clockOuterRadius, -2*j*clockOuterRadius);

                    }
                }

                g.translate(-(s*2+1)*(radius + gap), -(radius + gap));
            }
        }

        protected void drawClock(Graphics2D g, int clock, int position, HashMap<String, Color> colorScheme) {
            AffineTransform old = g.getTransform();

            if(clock < 9) {
                g.translate(radius + gap, radius + gap);
            } else {
                g.translate(3*(radius + gap), radius + gap);
                clock -= 9;
            }

            g.translate(2*((clock%3) - 1)*clockOuterRadius, 2*((clock/3) - 1)*clockOuterRadius);
            g.rotate(Math.toRadians(position*30));

            GeneralPath arrow = new GeneralPath();
            arrow.moveTo(0, 0);
            arrow.lineTo(arrowRadius*Math.cos(arrowAngle), -arrowRadius*Math.sin(arrowAngle));
            arrow.lineTo(0, -arrowHeight);
            arrow.lineTo(-arrowRadius*Math.cos( arrowAngle ), -arrowRadius*Math.sin(arrowAngle));
            arrow.closePath();

            g.setColor(colorScheme.get("HandBorder"));
            g.drawOval(-arrowRadius, -arrowRadius, 2*arrowRadius, 2*arrowRadius);
            g.draw(arrow);
            g.setColor(colorScheme.get("Hand"));
            g.fillOval(-arrowRadius, -arrowRadius, 2*arrowRadius, 2*arrowRadius);
            g.fill(arrow);

            g.setTransform(old);
        }

        protected void drawPins(Graphics2D g, boolean[] pins, HashMap<String, Color> colorScheme) {
            g.translate(radius + gap, radius + gap);
            int k = 0;
            for(int i = -1; i < 2; i += 2) {
                for(int j = -1; j<2; j += 2) {
                    g.translate(j*clockOuterRadius, i*clockOuterRadius);
                    drawPin(g, pins[k++], colorScheme);
                    g.translate(-j*clockOuterRadius, -i*clockOuterRadius);
                }
            }

            g.translate(2*(radius + gap), 0);
            k=1;
            for(int i = -1; i < 2; i += 2) {
                for(int j = -1; j < 2; j += 2) {
                    g.translate(j*clockOuterRadius, i*clockOuterRadius);
                    drawPin(g, !pins[k--], colorScheme);
                    g.translate(-j*clockOuterRadius, -i*clockOuterRadius);
                }
                k=3;
            }

            g.translate(-3*(radius + gap), -(radius + gap));
        }

        protected void drawPin(Graphics2D g, boolean pin, HashMap<String, Color> colorScheme) {
            g.setColor(Color.BLACK);
            g.drawOval(-pinRadius, -pinRadius, 2*pinRadius, 2*pinRadius);

            if(pin) {
                g.setColor(colorScheme.get("PinUp"));
                g.fillOval(-pinRadius, -pinRadius, 2*pinRadius, 2*pinRadius);
            } else {
                g.setColor(colorScheme.get("PinDown"));
                g.fillOval(-pinRadius, -pinRadius, 2*pinRadius, 2*pinRadius);
            }
        }
    }
}
