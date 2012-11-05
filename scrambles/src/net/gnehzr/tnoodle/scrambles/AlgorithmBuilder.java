package net.gnehzr.tnoodle.scrambles;

import static net.gnehzr.tnoodle.utils.Utils.azzert;

import java.util.ArrayList;
import java.util.HashMap;

import net.gnehzr.tnoodle.scrambles.Puzzle.PuzzleState;
import net.gnehzr.tnoodle.utils.Utils;

public class AlgorithmBuilder {
	private ArrayList<String> moves;
	/**
	 * states.get(i) = state achieved by applying moves[0]...moves[i-1]
	 */
	private ArrayList<PuzzleState> states;
	/**
	 * If we absorb something like a cube rotation (consider Uw Dw' on a 4x4),
	 * then we end up in a state that is equals() to the state that had the
	 * cube rotation applied, but the successor states are labelled differently.
	 * Turns passed into appendMove() are treated as if they apply to unsanitizedState,
	 * and then we have to search for a successor to getState() that leads to the same
	 * place. 
	 */
	private PuzzleState unsanitizedState;
	public AlgorithmBuilder(Puzzle puzzle, MungingMode mungingMode) {
		moves = new ArrayList<String>();
		states = new ArrayList<PuzzleState>();
		states.add(puzzle.getSolvedState());
		unsanitizedState = puzzle.getSolvedState();
		setMungingMode(mungingMode);
	}
	
	private MungingMode mungingMode = MungingMode.NO_MUNGING;
	public void setMungingMode(MungingMode mungingMode) {
		this.mungingMode = mungingMode;
	}
	
	public static enum MungingMode {
		NO_MUNGING, IGNORE_REDUNDANT_MOVES, MUNGE_REDUNDANT_MOVES;
	}
	
	public void appendMove(String newMove) throws InvalidMoveException {
		PuzzleState sanitizedState = getState();
		azzert(unsanitizedState.equals(sanitizedState));
		PuzzleState newUnsanitizedState = unsanitizedState.apply(newMove);
		if(mungingMode != MungingMode.NO_MUNGING) {
			if(!sanitizedState.apply(newMove).equals(newUnsanitizedState)) {
				// We must have ignored something like a cube rotation when
				// we were updating sanitized state. One of our children should
				// get us to sanitizedState, though.
				HashMap<String, ? extends PuzzleState> successors = sanitizedState.getSuccessors();
				newMove = null;
				for(String sanitizedNewMove : successors.keySet()) {
					if(successors.get(sanitizedNewMove).equals(newUnsanitizedState)) {
						newMove = sanitizedNewMove;
						break;
					}
				}
				// One of sanitizedState's children *must* be newUnsanitizedState, if not, something
				// has gone very wrong.
				azzert(newMove != null);
			}

			boolean isRedundant = false;
			for(int lastMoveIndex = moves.size() - 1; lastMoveIndex >= 0; lastMoveIndex--) {
				PuzzleState stateBeforeLastMove = states.get(lastMoveIndex);
				PuzzleState stateAfterLastMove = states.get(lastMoveIndex+1);
				String lastMove = moves.get(lastMoveIndex);
				if(!stateBeforeLastMove.movesCommute(lastMove, newMove)) {
					break;
				}
				PuzzleState stateAfterNewMove = stateAfterLastMove.apply(newMove);

				// Does newMove cancel with lastMove? If so, it’s redundant. 
				if(stateBeforeLastMove.equals(stateAfterNewMove)) {
					if(mungingMode == MungingMode.IGNORE_REDUNDANT_MOVES) {
						return;
					}
					isRedundant = true;
					moves.remove(lastMoveIndex);
					states.remove(lastMoveIndex + 1);
				}
				// Does newMove merge with lastMove? If so, it’s redundant.
				HashMap<String, ? extends PuzzleState> successors = stateBeforeLastMove.getSuccessors();
				for(String alternateLastMove : successors.keySet()) {
					if(successors.get(alternateLastMove).equals(stateAfterNewMove)) {
						if(mungingMode == MungingMode.IGNORE_REDUNDANT_MOVES) {
							return;
						}
						isRedundant = true;
						moves.set(lastMoveIndex, alternateLastMove);
						break;
					}
				}
				if(isRedundant) {
					azzert(mungingMode == MungingMode.MUNGE_REDUNDANT_MOVES);
					// We modified moves[ lastMoveIndex ], so everything in
					// states[ lastMoveIndex+1, ... ] is now invalid
					for(int i = lastMoveIndex + 1; i < states.size(); i++) {
						states.set(i, states.get(i - 1).apply(moves.get(i - 1)));
					}
					unsanitizedState = newUnsanitizedState;
					azzert(states.size() == moves.size() + 1);
					azzert(unsanitizedState.equals(getState()));
					return;
				}
			}
		}
		
		// If we got get here, then we know the move is not redundant, and we can
		// just append it.
		moves.add(newMove);
		states.add(sanitizedState.apply(newMove));
		
		unsanitizedState = newUnsanitizedState;
		azzert(states.size() == moves.size() + 1);
		azzert(unsanitizedState.equals(getState()));
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
		return Utils.join(moves, " ");
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
