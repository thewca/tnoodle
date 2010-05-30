import java.awt.image.BufferedImage;
import java.io.InputStreamReader;
import java.net.URI;
import java.net.URISyntaxException;
import java.net.URLConnection;

import javax.imageio.ImageIO;

import com.google.gson.Gson;

public class TNoodleServer {
	//TODO - comment!
	//TODO - color scheme stuff/polygons
	private static final Gson GSON = new Gson();
	
	private String[] puzzles;
	private URI scramblerUri, viewerUri;
	private String host;
	private int port;
	public TNoodleServer(String host, int port) {
		this.host = host;
		this.port = port;
		try {
			URI server = new URI("http", null, host, port, null, null, null);
			scramblerUri = server.resolve("/scrambler/");
			viewerUri = server.resolve("/viewer/");
		} catch(URISyntaxException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}

		try {
			URLConnection conn = scramblerUri.toURL().openConnection();
			puzzles = GSON.fromJson(new InputStreamReader(conn.getInputStream()), String[].class);
		} catch (Exception e) {
			e.printStackTrace();
			// TODO
		}
	}
	
	@Override
	public String toString() {
		return host + ":" + port;
	}

	public String[] getAvailablePuzzles() {
		return puzzles;
	}

	public String[] getScramble(String puzzle) {
		try {
			URI scramble = scramblerUri.resolve(new URI(null, null, puzzle + ".json", null, null));

			URLConnection conn = scramble.toURL().openConnection();
			return GSON.fromJson(new InputStreamReader(conn.getInputStream()), String[][].class)[0];
		} catch (Exception e) {
			e.printStackTrace();
			return null;
			// TODO
		}
	}
	
	//TODO - scheme, callback
	public BufferedImage getScrambleImage(String puzzle, String scramble, Integer width, Integer height) {
		try {
			String params = "scramble=" + scramble;
			if(width != null)
				params += "&width=" + width;
			if(height != null)
				params += "&height=" + height;
			URI img = viewerUri.resolve(new URI(null, null, puzzle + ".png", params, null));
			return ImageIO.read(img.toURL());
		} catch (Exception e) {
			e.printStackTrace();
			return null;
			// TODO proper error messages/timeouts!
		}
	}
}
