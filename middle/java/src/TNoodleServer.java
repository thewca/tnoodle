import java.awt.Image;


public abstract class TNoodleServer {
	public TNoodleServer(String url, int port) {
		
	}
	
	public abstract String[] getAvailablePuzzles();
	public abstract String[] getScramble(String puzzle);
	public abstract Image getScrambleImage(String puzzle, String scramble);
}
