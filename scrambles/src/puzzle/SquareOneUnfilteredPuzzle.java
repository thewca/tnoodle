package puzzle;

import org.timepedia.exporter.client.Export;

/*
 * The Square-1 solver has aggressive filtering. This gives
 * people an option for unfiltered, faster (but unofficial)
 * scrambles.
 */
@Export
public class SquareOneUnfilteredPuzzle extends SquareOnePuzzle{
    public SquareOneUnfilteredPuzzle() {
        super();
        wcaMinScrambleDistance=0;
    }

    @Override
    public String getShortName() {
        return "sq1fast";
    }

    @Override
    public String getLongName() {
        return "Square-1 (fast, unofficial)";
    }
}
