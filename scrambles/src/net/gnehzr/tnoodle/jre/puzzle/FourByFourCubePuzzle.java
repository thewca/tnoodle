package puzzle;

/*
 * Gwt can't seem to handle the 4x4 solver, so we fall back to
 * the vanilla random-turns scrambler here.
 */
public class FourByFourCubePuzzle extends CubePuzzle {
    public FourByFourCubePuzzle() {
        super(4);
    }
}
