package net.gnehzr.tnoodle.serverlibs;
import java.awt.Color;
import java.awt.image.BufferedImage;
import java.io.InputStreamReader;
import java.net.URI;
import java.net.URISyntaxException;
import java.net.URLConnection;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;

import javax.imageio.ImageIO;

import net.gnehzr.tnoodle.servers.scrambleserver.PuzzleFace;
import net.gnehzr.tnoodle.servers.scrambleserver.ScrambleUtils;


import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;

//TODO comment!
//TODO proper errors/timeouts
public class TNoodleServer {
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
			// TODO
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

	public String getScramble(String puzzle, String seed) {
		return getScrambles(puzzle, 1, seed)[0];
	}
	
	public String[] getScrambles(String puzzle, int count, String seed) {
		try {
			String query = "count=" + count;
			if(seed != null)
				query += "&seed=" + seed;
			URI scramble = scramblerUri.resolve(new URI(null, null, puzzle + ".json", query, null));

			URLConnection conn = scramble.toURL().openConnection();
			return GSON.fromJson(new InputStreamReader(conn.getInputStream()), String[].class);
		} catch (Exception e) {
			e.printStackTrace();
			return null;
			// TODO
		}
	}
	
	public BufferedImage getScrambleImage(String puzzle, String scramble, Integer width, Integer height, HashMap<String, Color> colorScheme) {
		try {
			StringBuffer params = new StringBuffer("scramble=").append(scramble);
			if(width != null)
				params.append("&width=").append(width);
			if(height != null)
				params.append("&height=").append(height);
			if(colorScheme != null) {
				ArrayList<String> faces = new ArrayList<String>(colorScheme.keySet());
				Collections.sort(faces);
				params.append("scheme=");
				for(int i = 0; i < faces.size(); i++) {
					if(i > 0)
						params.append(",");
					params.append(ScrambleUtils.colorToString(colorScheme.get(faces.get(i))));
				}
			}
			URI img = viewerUri.resolve(new URI(null, null, puzzle + ".png", params.toString(), null));
			return ImageIO.read(img.toURL());
		} catch (Exception e) {
			e.printStackTrace();
			return null;
			// TODO proper error messages/timeouts!
		}
	}
	
	public HashMap<String, PuzzleFace> getFacesAndColors(String puzzle, String scramble, Integer width, Integer height) {
		try {
			StringBuffer params = new StringBuffer("scramble=").append(scramble);
			if(width != null)
				params.append("&width=").append(width);
			if(height != null)
				params.append("&height=").append(height);
			URI faceInfo = viewerUri.resolve(new URI(null, null, puzzle + ".json", params.toString(), null));
			URLConnection conn = faceInfo.toURL().openConnection();
			return GSON.fromJson(new InputStreamReader(conn.getInputStream()), new TypeToken<HashMap<String, PuzzleFace>>() {}.getType());
		} catch(Exception e) {
			e.printStackTrace();
			return null;
			// TODO proper error messages/timeouts!
		}
	}
}
