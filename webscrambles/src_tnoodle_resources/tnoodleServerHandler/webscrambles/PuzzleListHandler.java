package tnoodleServerHandler.webscrambles;

import static net.gnehzr.tnoodle.utils.Utils.GSON;

import java.io.IOException;
import java.util.LinkedHashMap;
import java.util.Map.Entry;
import java.util.SortedMap;

import net.gnehzr.tnoodle.scrambles.Scrambler;
import net.gnehzr.tnoodle.server.SafeHttpHandler;
import net.gnehzr.tnoodle.utils.BadClassDescriptionException;
import net.gnehzr.tnoodle.utils.LazyInstance;

import com.sun.net.httpserver.HttpExchange;

@SuppressWarnings("restriction")
public class PuzzleListHandler extends SafeHttpHandler {
	private String puzzleNamesJSON;
	public PuzzleListHandler() throws BadClassDescriptionException, IOException {
		SortedMap<String, LazyInstance<Scrambler>>  scramblers = Scrambler.getScramblers();
		
		// listing available scrambles
		String[][] puzzleNames = new String[scramblers.size()][2];
		int i = 0;
		for(Entry<String, LazyInstance<Scrambler>> scrambler : scramblers.entrySet()) {
//			String shortName = scrambler.getValue().getShortName();
//			String longName = scrambler.getValue().getLongName();
			//TODO - figure out some way of deriving both the short & long name without actually loading the class
			String shortName = scrambler.getKey();
			String longName = scrambler.getKey();
			puzzleNames[i][0] = shortName;
			puzzleNames[i][1] = longName;
			i++;
		}
		puzzleNamesJSON = GSON.toJson(puzzleNames);
	}
	
	protected void wrappedHandle(HttpExchange t, String[] path, LinkedHashMap<String, String> query) {
		sendJSON(t, puzzleNamesJSON, query.get("callback"));
	}
}
