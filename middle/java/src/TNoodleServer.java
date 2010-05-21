import java.awt.Image;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.URL;
import java.net.URLConnection;

public abstract class TNoodleServer {
	private URL scrambler, viewer;
	public TNoodleServer(String urlStr) {
		String result = null;
		if(!urlStr.startsWith("http://")) {
			// TODO
		}
		scrambler = new URL(urlStr + "/scrambler");
		scrambler = new URL(urlStr + "/viewer");

		try {
			URLConnection conn = url.openConnection();
			BufferedReader rd = new BufferedReader(new InputStreamReader(conn.getInputStream()));
			StringBuffer sb = new StringBuffer();
			String line;
			while((line = rd.readLine()) != null) {
				sb.append(line);
			}
			rd.close();
			result = sb.toString();
		} catch (Exception e) {
			e.printStackTrace();
		}
	}

	public abstract String[] getAvailablePuzzles();

	public abstract String[] getScramble(String puzzle);

	public abstract Image getScrambleImage(String puzzle, String scramble);
}
