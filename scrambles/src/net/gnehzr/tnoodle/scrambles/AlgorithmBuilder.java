package net.gnehzr.tnoodle.scrambles;

import static net.gnehzr.tnoodle.utils.GwtSafeUtils.azzert;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.logging.Logger;

import net.gnehzr.tnoodle.scrambles.Puzzle.PuzzleState;
import net.gnehzr.tnoodle.utils.GwtSafeUtils;

public class AlgorithmBuilder {
    private static final Logger l = Logger.getLogger(AlgorithmBuilder.class.getName());

    private ArrayList<String> moves;
    /**
     * states.get(i) = state achieved by applying moves[0]...moves[i-1]
     */
    private ArrayList<PuzzleState> states;
    /**
     * If we are in CANONICALIZE_MOVES MergingMode, then something like
     * Uw Dw' on a 4x4x4 will become Uw2. This means the state we end
     * up in is actually different than the state we would have ended up in
     * if we had just naively appended moves (NO_MERGING).
     * unNormalizedState keeps track of the state we would have been in
     * if we had just naively appended turns.
     */
    private PuzzleState unNormalizedState;
    public AlgorithmBuilder(Puzzle puzzle, MergingMode mergingMode) {
        this(puzzle, mergingMode, puzzle.getSolvedState());
    }
    
    public AlgorithmBuilder(Puzzle puzzle, MergingMode mergingMode, PuzzleState unNormalizedState) {
        this.unNormalizedState = unNormalizedState;
        this.moves = new ArrayList<String>();
        this.states = new ArrayList<PuzzleState>();
        states.add(unNormalizedState);
        setMungingMode(mergingMode);
    }

    private MergingMode mergingMode = MergingMode.NO_MERGING;
    public void setMungingMode(MergingMode mergingMode) {
        this.mergingMode = mergingMode;
    }

    public static enum MergingMode {
        // There are several degrees of manipulation we can choose to do
        // while building an algorithm. Here they are, ranging from least to
        // most aggressive. Examples are on a 3x3x3.

        // Straightforward, blindly append moves.
        // For example:
        //  - "R R" stays unmodified.
        NO_MERGING,

        // Merge together redundant moves, but preserve the exact state
        // of the puzzle (unlike CANONICALIZE_MOVES).
        // In other words, the resulting state will be the
        // same as if we had used NO_MERGING.
        // For example:
        //  - "R R" becomes "R2"
        //  - "L Rw" stays unmodified.
        //  - "F x U" will become something like "F2 x".
        //<<<MERGE_REDUNDANT_MOVES_PRESERVE_STATE,

        // Most aggressive merging.
        // See PuzzleState.getCanonicalMovesByState() for the
        // definition of "canonical" moves.
        // Canonical moves will not necessarily let us preserve the
        // exact state we would have achieved with NO_MERGING. This is
        // because canonical moves may not let us rotate the puzzle.
        // However, the resulting state when normalized will be the
        // same as the normalization of the state we would have
        // achieved if we had used NO_MERGING.
        // For example:
        //  - "R R" becomes "R2"
        //  - "L Rw" becomes "L2"
        //  - "F x U" becomes "F2"
        CANONICALIZE_MOVES;
    }

    public boolean isRedundant(String move, boolean preserveState) throws InvalidMoveException {
        //<<<MergingMode mergingMode = preserveState ? MergingMode.MERGE_REDUNDANT_MOVES_PRESERVE_STATE : MergingMode.CANONICALIZE_MOVES;
        MergingMode mergingMode = MergingMode.CANONICALIZE_MOVES;//<<<
        IndexAndMove indexAndMove = findBestIndexForMove(move, mergingMode);
        return indexAndMove.index < moves.size() || indexAndMove.move == null;
    }

    private static class IndexAndMove {
        int index;
        String move;
        public IndexAndMove(int index, String move) {
            this.index = index;
            this.move = move;
        }
    }

    private IndexAndMove findBestIndexForMove(String move, MergingMode mergingMode) throws InvalidMoveException {
        PuzzleState newUnNormalizedState = unNormalizedState.apply(move);
        if(newUnNormalizedState.equalsNormalized(unNormalizedState)) {
            // move must just be a rotation.
            if(mergingMode == MergingMode.CANONICALIZE_MOVES) {
                return new IndexAndMove(0, null);
            }
        }
        PuzzleState newNormalizedState = newUnNormalizedState.getNormalized();

        HashMap<PuzzleState, String> successors = getState().getCanonicalMovesByState();
        move = null;
        // Search for the right move to do to our current state in
        // order to match up with newNormalizedState.
        for(PuzzleState ps : successors.keySet()) {
            if(ps.equalsNormalized(newNormalizedState)) {
                move = successors.get(ps);
                break;
            }
        }
        // One of getStates()'s successors must be newNormalizedState.
        // If not, something has gone very wrong.
        azzert(move != null);

        if(mergingMode == MergingMode.CANONICALIZE_MOVES) {
            for(int lastMoveIndex = moves.size() - 1; lastMoveIndex >= 0; lastMoveIndex--) {
                String lastMove = moves.get(lastMoveIndex);
                PuzzleState stateBeforeLastMove = states.get(lastMoveIndex);
                if(!stateBeforeLastMove.movesCommute(lastMove, move)) {
                    break;
                }
                PuzzleState stateAfterLastMove = states.get(lastMoveIndex+1);
                PuzzleState stateAfterLastMoveAndNewMove = stateAfterLastMove.apply(move);

                if(stateBeforeLastMove.equals(stateAfterLastMoveAndNewMove)) {
                    // move cancels with lastMove
                    return new IndexAndMove(lastMoveIndex, null);
                } else {
                    successors = stateBeforeLastMove.getCanonicalMovesByState();
                    String alternateLastMove = successors.get(stateAfterLastMoveAndNewMove);
                    if(alternateLastMove != null) {
                        // move merges with lastMove
                        return new IndexAndMove(lastMoveIndex, alternateLastMove);
                    }
                }
            }
        }
        return new IndexAndMove(moves.size(), move);
    }

    public void appendMove(String newMove) throws InvalidMoveException {
        l.fine("appendMove(" + newMove + ")");

        IndexAndMove indexAndMove = findBestIndexForMove(newMove, mergingMode);
        if(indexAndMove.index < moves.size()) {
            // This move is redundant.
            azzert(mergingMode != MergingMode.NO_MERGING);
            if(indexAndMove.move == null) {
                // newMove cancelled perfectly with the move at
                // indexAndMove.index.
                moves.remove(indexAndMove.index);
                states.remove(indexAndMove.index + 1);
            } else {
                // newMove merged with the move at indexAndMove.index.
                moves.set(indexAndMove.index, indexAndMove.move);
            }
        } else {
            // This move is not redundant.
            moves.add(indexAndMove.move);
            // The code to update the states array is right below us,
            // but it requires that the states arary be of the correct
            // size.
            states.add(null);
        }

        // We modified moves[ indexAndMove.index ], so everything in
        // states[ indexAndMove.index+1, ... ] is now invalid
        for(int i = indexAndMove.index + 1; i < states.size(); i++) {
            states.set(i, states.get(i - 1).apply(moves.get(i - 1)));
        }

        unNormalizedState = unNormalizedState.apply(newMove);
        azzert(states.size() == moves.size() + 1);
        azzert(unNormalizedState.equalsNormalized(getState()));
    }

    public void appendAlgorithm(String algorithm) throws InvalidMoveException {
        for(String move : splitAlgorithm(algorithm)) {
            appendMove(move);
        }
    }

    public PuzzleState getState() {
        azzert(states.size() == moves.size() + 1);
        return states.get(states.size() - 1);
    }

    public int length() {
        return moves.size();
    }

    public String toString() {
        return GwtSafeUtils.join(moves, " ");
    }

    public PuzzleStateAndGenerator getStateAndGenerator() {
        return new PuzzleStateAndGenerator(getState(), toString());
    }

    public static String[] splitAlgorithm(String algorithm) {
        if(algorithm.trim().isEmpty()) {
            return new String[0];
        }
        return algorithm.split("\\s+");
    }

}
