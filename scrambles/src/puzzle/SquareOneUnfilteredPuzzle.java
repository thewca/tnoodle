package puzzle;

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
