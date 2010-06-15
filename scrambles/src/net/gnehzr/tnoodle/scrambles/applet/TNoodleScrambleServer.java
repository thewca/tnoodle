package net.gnehzr.tnoodle.scrambles.applet;
//package net.gnehzr.tnoodle.serverlibs;
//
//import static net.gnehzr.tnoodle.servers.scrambleserver.ScrambleUtils.GSON;
//
//import java.awt.Color;
//import java.awt.image.BufferedImage;
//import java.io.IOException;
//import java.io.InputStreamReader;
//import java.net.MalformedURLException;
//import java.net.URI;
//import java.net.URISyntaxException;
//import java.net.URLConnection;
//import java.util.ArrayList;
//import java.util.Collections;
//import java.util.HashMap;
//
//import javax.imageio.ImageIO;
//
//import net.gnehzr.tnoodle.servers.scrambleserver.PuzzleImageInfo;
//import net.gnehzr.tnoodle.servers.scrambleserver.ScrambleUtils;
//
////TODO comment!
////TODO timeouts! TimeLimitExceededException?
//public class TNoodleScrambleServer implements ScrambleSuite {
//	private String[][] puzzles;
//	private URI scramblerUri, viewerUri;
//	private String host;
//	private int port;
//	public TNoodleScrambleServer(String host, int port) throws URISyntaxException, IOException {
//		this.host = host;
//		this.port = port;
//		URI server = new URI("http", null, host, port, null, null, null);
//		scramblerUri = server.resolve("/scrambler/");
//		viewerUri = server.resolve("/viewer/");
//
//		URLConnection conn = scramblerUri.toURL().openConnection();
//		puzzles = GSON.fromJson(new InputStreamReader(conn.getInputStream()), String[][].class);
//	}
//	
//	@Override
//	public String toString() {
//		return host + ":" + port;
//	}
//
//	public String[][] getAvailablePuzzles() {
//		return puzzles;
//	}
//
//	public String getScramble(String puzzle, String seed) throws IOException {
//		return getScrambles(puzzle, seed, 1)[0];
//	}
//	
//	public String[] getScrambles(String puzzle, String seed, int count) throws IOException {
//		String query = "count=" + count;
//		if(seed != null)
//			query += "&seed=" + seed;
//		URI scramble;
//		try {
//			scramble = scramblerUri.resolve(new URI(null, null, puzzle + ".json", query, null));
//		} catch (URISyntaxException e) { //this shouldn't happen
//			e.printStackTrace();
//			throw new RuntimeException(e);
//		}
//
//		URLConnection conn = scramble.toURL().openConnection();
//		return GSON.fromJson(new InputStreamReader(conn.getInputStream()), String[].class);
//	}
//	
//	public BufferedImage getScrambleImage(String puzzle, String scramble, Integer width, Integer height, HashMap<String, Color> colorScheme) throws IOException {
//		StringBuffer params = new StringBuffer("scramble=").append(scramble);
//		if(width != null)
//			params.append("&width=").append(width);
//		if(height != null)
//			params.append("&height=").append(height);
//		if(colorScheme != null) {
//			ArrayList<String> faces = new ArrayList<String>(colorScheme.keySet());
//			Collections.sort(faces);
//			params.append("scheme=");
//			for(int i = 0; i < faces.size(); i++) {
//				if(i > 0)
//					params.append(",");
//				params.append(ScrambleUtils.toHex(colorScheme.get(faces.get(i))));
//			}
//		}
//		try {
//			URI img = viewerUri.resolve(new URI(null, null, puzzle + ".png", params.toString(), null));
//			return ImageIO.read(img.toURL());
//		} catch (MalformedURLException e) { //this shouldn't happen
//			e.printStackTrace();
//			throw new RuntimeException(e);
//		} catch (URISyntaxException e) { //this shouldn't happen
//			e.printStackTrace();
//			throw new RuntimeException(e);
//		}
//	}
//	
//	public PuzzleImageInfo getScrambleImageInfo(String puzzle, String scramble, Integer width, Integer height) throws MalformedURLException, IOException {
//		StringBuffer params = new StringBuffer("scramble=").append(scramble);
//		if(width != null)
//			params.append("&width=").append(width);
//		if(height != null)
//			params.append("&height=").append(height);
//		URI faceInfo;
//		try {
//			faceInfo = viewerUri.resolve(new URI(null, null, puzzle + ".json", params.toString(), null));
//		} catch (URISyntaxException e) { //this shouldn't happen
//			e.printStackTrace();
//			throw new RuntimeException(e);
//		}
//		URLConnection conn = faceInfo.toURL().openConnection();
//		return GSON.fromJson(new InputStreamReader(conn.getInputStream()), PuzzleImageInfo.class);
//	}
//}
