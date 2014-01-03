package puzzle;

import org.timepedia.exporter.client.Export;

/*
 * The 4x4 solver is pretty resource intensive, this gives people
 * an option for lighter weight (unofficial!) scrambles.
 */
@Export
public class FourByFourRandomTurnsCubePuzzle extends CubePuzzle {
    public FourByFourRandomTurnsCubePuzzle() {
        super(4);
    }

    @Override
    public String getShortName() {
        return "444fast";
    }

    @Override
    public String getLongName() {
        return "4x4x4 (fast, unofficial)";
    }
}
