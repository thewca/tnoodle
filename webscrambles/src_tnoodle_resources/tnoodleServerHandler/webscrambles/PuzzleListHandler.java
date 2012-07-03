package tnoodleServerHandler.webscrambles;

import static net.gnehzr.tnoodle.utils.Utils.GSON;
import static net.gnehzr.tnoodle.utils.Utils.azzert;
import static net.gnehzr.tnoodle.utils.Utils.parseExtension;

import java.io.IOException;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;
import java.util.ArrayList;
import java.util.SortedMap;
import java.util.Collections;
import java.util.HashMap;
import java.lang.reflect.InvocationTargetException;
import java.net.MalformedURLException;

import net.gnehzr.tnoodle.scrambles.Scrambler;
import net.gnehzr.tnoodle.server.SafeHttpHandler;
import net.gnehzr.tnoodle.utils.BadClassDescriptionException;
import net.gnehzr.tnoodle.utils.LazyInstantiator;

import com.sun.net.httpserver.HttpExchange;

public class PuzzleListHandler extends SafeHttpHandler {
	private final Map<String, Map<String, Object>> puzzleInfoByShortName;

	private final List<Map<String, Object>> puzzleInfos;
	private final String puzzleInfosJSON;

	public PuzzleListHandler() throws BadClassDescriptionException, IOException {
		SortedMap<String, LazyInstantiator<Scrambler>> scramblers = Scrambler.getScramblers();
		
		ArrayList<Map<String, Object>> puzzleInfos_ = new ArrayList<Map<String, Object>>(scramblers.size());
		HashMap<String, Map<String, Object>> puzzleInfoByShortName_ = new HashMap<String, Map<String, Object>>(scramblers.size());
		for(Entry<String, LazyInstantiator<Scrambler>> scrambler : scramblers.entrySet()) {
			String shortName = scrambler.getKey();
			String longName = Scrambler.getScramblerLongName(shortName);

			Map<String, Object> puzzleInfo = new HashMap<String, Object>();
			puzzleInfo.put("shortName", shortName);
			puzzleInfo.put("longName", longName);
			puzzleInfo = Collections.unmodifiableMap(puzzleInfo);
			puzzleInfos_.add(puzzleInfo);
			puzzleInfoByShortName_.put(shortName, puzzleInfo);
		}
		puzzleInfos = Collections.unmodifiableList(puzzleInfos_);
		puzzleInfoByShortName = Collections.unmodifiableMap(puzzleInfoByShortName_);
		puzzleInfosJSON = GSON.toJson(puzzleInfos);
	}

	private Map<String, Object> getPuzzleInfo(LazyInstantiator<Scrambler> lazyScrambler, boolean includeStatus) throws InstantiationException, IllegalAccessException, InvocationTargetException, ClassNotFoundException, NoSuchMethodException, MalformedURLException {
		Scrambler scrambler = lazyScrambler.cachedInstance();
		Map<String, Object> info = puzzleInfoByShortName.get(scrambler.getShortName());
		azzert(info != null);
		// info is unmodifiable, so we copy it
		info = new HashMap<String, Object>(info);
		if(includeStatus) {
			info.put("initializationStatus", scrambler.getInitializationStatus());
		}
		return info;
	}
	
	protected void wrappedHandle(HttpExchange t, String[] path, LinkedHashMap<String, String> query) throws InstantiationException, IllegalAccessException, InvocationTargetException, ClassNotFoundException, NoSuchMethodException, MalformedURLException, BadClassDescriptionException, IOException {
		boolean includeStatus = query.get("includeStatus") != null;
		if(path.length == 0) {
			sendError(t, "Please specify an extension (and optionally, a puzzle)");
		} else {
			String[] puzzle_extension = parseExtension(path[0]);
			String puzzle = puzzle_extension[0];
			String extension = puzzle_extension[1];
			if (extension == null) {
				sendError(t, "Please specify an extension");
				return;
			}
			SortedMap<String, LazyInstantiator<Scrambler>> scramblers = Scrambler.getScramblers();
			if(extension.equals("json")) {
				if(puzzle.equals("")) {
					if(includeStatus) {
						ArrayList<Map<String, Object>> puzzleInfosWithStatus = new ArrayList<Map<String, Object>>();
						for(Map<String, Object> puzzleInfo : puzzleInfos) {
							LazyInstantiator<Scrambler> lazyScrambler = scramblers.get(puzzleInfo.get("shortName"));
							azzert(lazyScrambler != null);
							puzzleInfosWithStatus.add(getPuzzleInfo(lazyScrambler, includeStatus));
						}
						sendJSON(t, GSON.toJson(puzzleInfosWithStatus));
					} else {
						sendJSON(t, puzzleInfosJSON);
					}
				} else {
					LazyInstantiator<Scrambler> lazyScrambler = scramblers.get(puzzle);
					if (lazyScrambler == null) {
						sendError(t, "Invalid scrambler: " + puzzle);
						return;
					}
					Map<String, Object> puzzleInfo = getPuzzleInfo(lazyScrambler, includeStatus);
					String puzzleInfoJSON = GSON.toJson(puzzleInfo);
					sendJSON(t, puzzleInfoJSON);
				}
			} else {
				sendError(t, "Invalid extension: " + extension);
			}
		}
	}
}
