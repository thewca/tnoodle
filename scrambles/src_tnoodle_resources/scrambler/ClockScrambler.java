package scrambler;

import java.util.Random;
import java.util.HashMap;
import java.awt.RenderingHints;
import java.awt.geom.GeneralPath;
import java.awt.geom.AffineTransform;
import java.awt.geom.Area;
import java.awt.geom.Ellipse2D;
import java.awt.Graphics2D;
import java.awt.Dimension;
import java.awt.Color;
import java.util.regex.Pattern;
import java.util.regex.Matcher;


import static net.gnehzr.tnoodle.utils.Utils.toColor;


import net.gnehzr.tnoodle.scrambles.InvalidScrambleException;
import net.gnehzr.tnoodle.scrambles.Scrambler;

public class ClockScrambler extends Scrambler {
//	private boolean verbose = false;
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
	
	@Override
	public String generateScramble(Random r) {
		StringBuffer scramble = new StringBuffer();
		
		String[] peg={"U","d"};
		String[] pegs={"UUdd","dUdU","ddUU","UdUd"};
		String[] upegs={"dUUU","UdUU","UUUd","UUdU"};
		for(int x=0; x<4; x++) {
			scramble.append( "(" + pegs[x] );
			scramble.append("," + (r.nextInt(12)-5) + "," + (r.nextInt(12)-5) + ") ");
		}
		for(int x=0;x<4; x++) {
			scramble.append( "(" + upegs[x]);
			scramble.append("," + (r.nextInt(12)-5) + ",0) ");
		}
		scramble.append("(UUUU," + (r.nextInt(12)-5) + ",0) ");
		scramble.append("(dddd,0," + (r.nextInt(12)-5) + ") ");

		scramble.append("(");
		for(int x=0;x<4;x++) {
			scramble.append(peg[r.nextInt(2)]);
		}
		scramble.append(")");
		
		return scramble.toString();
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
		                 {1,0,1,0,0,0,1,0,1,  -1,-1,-1,-1,-1,-1,-1,-1,-1},// dddd-d
		                 {1,0,1,0,0,0,0,0,1,  -1,-1,-1,-1,-1,-1,-1,-1, 0},// dddU-d
		                 {1,0,1,0,0,0,1,0,0,  -1,-1,-1,-1,-1,-1, 0,-1,-1},// ddUd-d
		                 {1,0,1,0,0,0,0,0,0,  -1,-1,-1,-1,-1,-1, 0, 0, 0},// ddUU-d
		                 {0,0,1,0,0,0,1,0,1,  -1,-1, 0,-1,-1,-1,-1,-1,-1},// dUdd-d
		                 {1,0,0,0,0,0,1,0,0,   0,-1,-1, 0,-1,-1, 0,-1,-1},// dUdU-d
		                 {0,0,1,0,0,0,1,0,0,  -1,-1, 0,-1,-1,-1, 0,-1,-1},// dUUd-d
		                 {0,0,1,0,0,0,0,0,0,  -1,-1, 0,-1,-1, 0, 0, 0, 0},// dUUU-d
		                 {1,0,0,0,0,0,1,0,1,   0,-1,-1,-1,-1,-1,-1,-1,-1},// Uddd-d
		                 {1,0,0,0,0,0,0,0,1,   0,-1,-1,-1,-1,-1,-1,-1, 0},// UddU-d
		                 {0,0,1,0,0,0,0,0,1,  -1,-1, 0,-1,-1, 0,-1,-1, 0},// UdUd-d
		                 {1,0,0,0,0,0,0,0,0,   0,-1,-1, 0,-1,-1, 0, 0, 0},// UdUU-d
		                 {0,0,0,0,0,0,1,0,1,   0, 0, 0,-1,-1,-1,-1,-1,-1},// UUdd-d
		                 {0,0,0,0,0,0,0,0,1,   0, 0, 0,-1,-1, 0,-1,-1, 0},// UUdU-d
		                 {0,0,0,0,0,0,1,0,0,   0, 0, 0, 0,-1,-1, 0,-1,-1},// UUUd-d
		                 {0,0,0,0,0,0,0,0,0,   0, 0, 0, 0, 0, 0, 0, 0, 0},// UUUU-d - not possible

		                 {0,0,0,0,0,0,0,0,0,   0, 0, 0, 0, 0, 0, 0, 0, 0},// dddd-U - not possible
		                 {0,0,0,0,1,1,0,1,1,   0, 0, 0, 0, 0, 0,-1, 0, 0},// dddU-U
		                 {0,0,0,1,1,0,1,1,0,   0, 0, 0, 0, 0, 0, 0, 0,-1},// ddUd-U
		                 {0,0,0,1,1,1,1,1,1,   0, 0, 0, 0, 0, 0,-1, 0,-1},// ddUU-U
		                 {0,1,1,0,1,1,0,0,0,  -1, 0, 0, 0, 0, 0, 0, 0, 0},// dUdd-U
		                 {0,1,1,0,1,1,0,1,1,  -1, 0, 0, 0, 0, 0,-1, 0, 0},// dUdU-U
		                 {0,1,1,1,1,1,1,1,0,  -1, 0, 0, 0, 0, 0, 0, 0,-1},// dUUd-U
		                 {0,1,1,1,1,1,1,1,1,  -1, 0, 0, 0, 0, 0,-1, 0,-1},// dUUU-U
		                 {1,1,0,1,1,0,0,0,0,   0, 0,-1, 0, 0, 0, 0, 0, 0},// Uddd-U
		                 {1,1,0,1,1,1,0,1,1,   0, 0,-1, 0, 0, 0,-1, 0, 0},// UddU-U
		                 {1,1,0,1,1,0,1,1,0,   0, 0,-1, 0, 0, 0, 0, 0,-1},// UdUd-U
		                 {1,1,0,1,1,1,1,1,1,   0, 0,-1, 0, 0, 0,-1, 0,-1},// UdUU-U
		                 {1,1,1,1,1,1,0,0,0,  -1, 0,-1, 0, 0, 0, 0, 0, 0},// UUdd-U
		                 {1,1,1,1,1,1,0,1,1,  -1, 0,-1, 0, 0, 0,-1, 0, 0},// UUdU-U
		                 {1,1,1,1,1,1,1,1,0,  -1, 0,-1, 0, 0, 0, 0, 0,-1},// UUUd-U
		                 {1,1,1,1,1,1,1,1,1,  -1, 0,-1, 0, 0, 0,-1, 0,-1},// UUUU-U

		                 };
	protected void drawScramble(Graphics2D g, String scramble, HashMap<String, Color> colorScheme) throws InvalidScrambleException {
		g.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);

		int i,j;
		int[] seq = {0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0};
		boolean[] pins = new boolean[4];
		int[] posit = {0,0,0,0,0,0,0,0,0,  0,0,0,0,0,0,0,0,0};

		parseScramble( scramble, seq, pins );

		for( i=0; i<32; i++)
			for( j=0; j<18; j++)
				posit[j]+=seq[i]*moves[i][j];

		drawBackground(g, colorScheme);

		for( i=0; i<18; i++ )
			drawClock( g, i, posit[i], colorScheme );

		drawPins( g, pins, colorScheme );

	}

	protected void parseScramble( String scramble, int[] seq, boolean[] pins ) {
		String word;
		int move;

		if(scramble == null || scramble.length() == 0) {
			return;
		}

		int i;

		Pattern p = Pattern.compile("\\(([Ud]{4}),(-?\\d),(-?\\d)?\\)");
		Matcher m = p.matcher(scramble);

		while( m.find() ){
			word = m.group(1);
			word = word.replace('U', '1');
			word = word.replace('d', '0');
			move = Integer.parseInt(word, 2);
			seq[move+16] = Integer.parseInt(m.group(2));
			seq[move] = Integer.parseInt(m.group(3));
			for( i=0; i<4; i++ )
				pins[i] = ( word.charAt(i) == '1' );
		}

		p = Pattern.compile("\\(([Ud]{4})\\)");
		m = p.matcher(scramble);

		if( m.find() ){
			String pinString = m.group(1);

			for( i=0; i<4; i++ )
				pins[i] = ( pinString.charAt(i) == 'U' );
		}
	}



	protected void drawBackground( Graphics2D g, HashMap<String, Color> colorScheme ) {

		int i, j, k, s;

		String[] colorString = {"Front", "Back"};

		for( s=0; s<2; s++ ){

			g.translate( (s*2+1)*(radius + gap), radius + gap );

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
			for( i=-1; i<2; i++ )
				for( j=-1; j<2; j++ ) {
					g.translate( 2*i*clockOuterRadius, 2*j*clockOuterRadius );
					g.setColor(colorScheme.get(colorString[s] + "Clock"));
					g.fillOval( -clockRadius,  -clockRadius, 2*clockRadius, 2*clockRadius);
					g.setColor(Color.BLACK);
					g.drawOval( -clockRadius,  -clockRadius, 2*clockRadius, 2*clockRadius);

					g.setColor(colorScheme.get(colorString[s] + "Clock"));
					for( k=0; k<12; k++ ) {
						g.fillOval( -pointSize, -pointRadius-pointSize, 2*pointSize, 2*pointSize);
						g.rotate( Math.toRadians( 30 ));
					}
					g.translate( -2*i*clockOuterRadius, -2*j*clockOuterRadius );

				}

			g.translate( -(s*2+1)*(radius + gap), -(radius + gap) );
		}
	}

	protected void drawClock( Graphics2D g, int clock, int position, HashMap<String, Color> colorScheme ) {
		AffineTransform old = g.getTransform();

		if( clock < 9 ){
			g.translate( radius + gap, radius + gap );
		}
		else {
			g.translate( 3*(radius + gap), radius + gap );
			clock -= 9;
		}

		g.translate( 2*((clock%3) - 1)*clockOuterRadius, 2*((clock/3) - 1)*clockOuterRadius );
		g.rotate( Math.toRadians( position*30 ));

		GeneralPath arrow = new GeneralPath();
		arrow.moveTo( 0, 0 );
		arrow.lineTo( arrowRadius*Math.cos( arrowAngle ), -arrowRadius*Math.sin( arrowAngle ) );
		arrow.lineTo( 0, -arrowHeight );
		arrow.lineTo( -arrowRadius*Math.cos( arrowAngle ), -arrowRadius*Math.sin( arrowAngle ) );
		arrow.closePath();

		g.setColor(colorScheme.get("HandBorder"));
		g.drawOval( -arrowRadius, -arrowRadius, 2*arrowRadius, 2*arrowRadius);
		g.draw( arrow );
		g.setColor(colorScheme.get("Hand"));
		g.fillOval( -arrowRadius, -arrowRadius, 2*arrowRadius, 2*arrowRadius);
		g.fill( arrow );

		g.setTransform(old);
	}

	protected void drawPins( Graphics2D g, boolean[] pins, HashMap<String, Color> colorScheme ) {

		int i, j, k = 0;

		g.translate( radius + gap, radius + gap );
		for( i=-1; i<2; i+=2 )
			for( j=-1; j<2; j+=2 ) {
				g.translate( j*clockOuterRadius, i*clockOuterRadius );
				drawPin( g, pins[k++], colorScheme );
				g.translate( -j*clockOuterRadius, -i*clockOuterRadius );
			}

		g.translate( 2*(radius + gap), 0 );
		k=1;
		for( i=-1; i<2; i+=2 ) {
			for( j=-1; j<2; j+=2 ) {
				g.translate( j*clockOuterRadius, i*clockOuterRadius );
				drawPin( g, ! pins[k--], colorScheme );
				g.translate( -j*clockOuterRadius, -i*clockOuterRadius );
			}
			k=3;
		}

		g.translate( -3*(radius + gap), -(radius + gap) );


	}

	protected void drawPin( Graphics2D g, boolean pin, HashMap<String, Color> colorScheme ) {

		g.setColor(Color.BLACK);
		g.drawOval( -pinRadius, -pinRadius, 2*pinRadius, 2*pinRadius);

		if( pin ) {
			g.setColor(colorScheme.get("PinUp"));
			g.fillOval( -pinRadius, -pinRadius, 2*pinRadius, 2*pinRadius);
		}
		else {
			g.setColor(colorScheme.get("PinDown"));
			g.fillOval( -pinRadius, -pinRadius, 2*pinRadius, 2*pinRadius);
		}
	}

	public HashMap<String, GeneralPath> getDefaultFaceBoundaries() {
		int i, j;

		// Background
		Area backgroundFront = new Area();
		Area backgroundBack = new Area();
		backgroundFront.add(new Area(new Ellipse2D.Double(gap,gap, 2*radius, 2*radius)));
		backgroundBack.add(new Area(new Ellipse2D.Double(2*radius+3*gap,gap, 2*radius, 2*radius)));
		for( i=-1; i<2; i+=2 )
			for( j=-1; j<2; j+=2 ) {
				backgroundFront.add(new Area(new Ellipse2D.Double(radius+gap+2*i*clockOuterRadius-clockOuterRadius,radius+gap+2*j*clockOuterRadius-clockOuterRadius, 2*clockOuterRadius, 2*clockOuterRadius)));
				backgroundBack.add(new Area(new Ellipse2D.Double(3*radius+3*gap+2*i*clockOuterRadius-clockOuterRadius,radius+gap+2*j*clockOuterRadius-clockOuterRadius, 2*clockOuterRadius, 2*clockOuterRadius)));
			}

		// Clocks
		Area clocksFront = new Area();
		Area clocksBack = new Area();
		for( i=-1; i<2; i++ )
			for( j=-1; j<2; j++ ) {
				clocksFront.add(new Area(new Ellipse2D.Double(radius+gap+2*i*clockOuterRadius-clockRadius,radius+gap+2*j*clockOuterRadius-clockRadius, 2*clockRadius, 2*clockRadius)));
				clocksBack.add(new Area(new Ellipse2D.Double(3*radius+3*gap+2*i*clockOuterRadius-clockRadius,radius+gap+2*j*clockOuterRadius-clockRadius, 2*clockRadius, 2*clockRadius)));
			}

		// Pins
		Area pinsUp = new Area();
		Area pinsDown = new Area();
		for( i=-1; i<2; i+=2 )
			for( j=-1; j<2; j+=2 ) {
				pinsDown.add(new Area(new Ellipse2D.Double(radius+gap+j*clockOuterRadius-pinRadius, radius+gap+i*clockOuterRadius-pinRadius, 2*pinRadius, 2*pinRadius)));
				pinsUp.add(new Area(new Ellipse2D.Double(3*radius+3*gap+j*clockOuterRadius-pinRadius, radius+gap+i*clockOuterRadius-pinRadius, 2*pinRadius, 2*pinRadius)));
			}

		// Does not work !
		/*
		backgroundFront.subtract(clocksFront);
		backgroundFront.subtract(pinsDown);
		backgroundBack.subtract(clocksBack);
		backgroundBack.subtract(pinsUp);
		*/

		HashMap<String, GeneralPath> facesMap = new HashMap<String, GeneralPath>();
		facesMap.put("Front", new GeneralPath(backgroundFront));
		facesMap.put("Back", new GeneralPath(backgroundBack));
		facesMap.put("FrontClock", new GeneralPath(clocksFront));
		facesMap.put("BackClock", new GeneralPath(clocksBack));
		facesMap.put("PinUp", new GeneralPath(pinsUp));
		facesMap.put("PinDown", new GeneralPath(pinsDown));

		return facesMap;
	}
}
