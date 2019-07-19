package net.gnehzr.tnoodle.server.webscrambles;

import static net.gnehzr.tnoodle.utils.GsonUtils.GSON;
import static net.gnehzr.tnoodle.utils.GwtSafeUtils.azzert;
import static net.gnehzr.tnoodle.utils.GwtSafeUtils.parseExtension;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;
import java.util.SortedMap;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import net.gnehzr.tnoodle.scrambles.Puzzle;
import net.gnehzr.tnoodle.scrambles.PuzzlePlugins;
import net.gnehzr.tnoodle.server.SafeHttpServlet;
import net.gnehzr.tnoodle.utils.LazyInstantiator;
import net.gnehzr.tnoodle.utils.LazyInstantiatorException;
import net.gnehzr.tnoodle.utils.BadLazyClassDescriptionException;

@SuppressWarnings("serial")
public class PuzzleListHandler extends SafeHttpServlet {
    private final Map<String, Map<String, Object>> puzzleInfoByShortName;

    private final List<Map<String, Object>> puzzleInfos;
    private final String puzzleInfosJSON;
    public PuzzleListHandler() throws IOException, BadLazyClassDescriptionException {
        SortedMap<String, LazyInstantiator<Puzzle>> scramblers = PuzzlePlugins.getScramblers();

        ArrayList<Map<String, Object>> puzzleInfos_ = new ArrayList<Map<String, Object>>(scramblers.size());
        HashMap<String, Map<String, Object>> puzzleInfoByShortName_ = new HashMap<String, Map<String, Object>>(scramblers.size());
        for(Entry<String, LazyInstantiator<Puzzle>> scrambler : scramblers.entrySet()) {
            String shortName = scrambler.getKey();
            String longName = PuzzlePlugins.getScramblerLongName(shortName);

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

    private Map<String, Object> getPuzzleInfo(LazyInstantiator<Puzzle> lazyScrambler, boolean includeStatus) throws LazyInstantiatorException {
        Puzzle scrambler = lazyScrambler.cachedInstance();
        Map<String, Object> info = puzzleInfoByShortName.get(scrambler.getShortName());
        azzert(info != null);
        // info is unmodifiable, so we copy it
        info = new HashMap<>(info);
        if(includeStatus) {
            info.put("initializationStatus", scrambler.getInitializationStatus());
        }
        return info;
    }

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException, ServletException {
        HashMap<String, String> query = parseQuery(request.getQueryString());
        String[] path = parsePath(request.getPathInfo());

        boolean includeStatus = query.get("includeStatus") != null;
        if(path.length == 0) {
            sendError(request, response, "Please specify an extension (and optionally, a puzzle)");
        } else {
            String[] puzzle_extension = parseExtension(path[0]);
            String puzzle = puzzle_extension[0];
            String extension = puzzle_extension[1];
            if (extension == null) {
                sendError(request, response, "Please specify an extension");
                return;
            }
            try {
                SortedMap<String, LazyInstantiator<Puzzle>> scramblers = PuzzlePlugins.getScramblers();
                if(extension.equals("json")) {
                    if(puzzle.equals("")) {
                        if(includeStatus) {
                            ArrayList<Map<String, Object>> puzzleInfosWithStatus = new ArrayList<>();
                            for(Map<String, Object> puzzleInfo : puzzleInfos) {
                                LazyInstantiator<Puzzle> lazyScrambler = scramblers.get(puzzleInfo.get("shortName"));
                                azzert(lazyScrambler != null);
                                puzzleInfosWithStatus.add(getPuzzleInfo(lazyScrambler, includeStatus));
                            }
                            sendJSON(request, response, GSON.toJson(puzzleInfosWithStatus));
                        } else {
                            sendJSON(request, response, puzzleInfosJSON);
                        }
                    } else {
                        LazyInstantiator<Puzzle> lazyScrambler = scramblers.get(puzzle);
                        if (lazyScrambler == null) {
                            sendError(request, response, "Invalid scrambler: " + puzzle);
                            return;
                        }
                        Map<String, Object> puzzleInfo = getPuzzleInfo(lazyScrambler, includeStatus);
                        String puzzleInfoJSON = GSON.toJson(puzzleInfo);
                        sendJSON(request, response, puzzleInfoJSON);
                    }
                } else {
                    sendError(request, response, "Invalid extension: " + extension);
                }
            } catch (BadLazyClassDescriptionException | LazyInstantiatorException e) {
                throw new ServletException(e);
            }
        }
    }
}
