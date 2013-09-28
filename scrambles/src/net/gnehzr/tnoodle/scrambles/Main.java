package net.gnehzr.tnoodle.scrambles;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;
import java.util.SortedMap;
import java.util.HashMap;
import java.util.TreeMap;
import java.util.logging.Level;
import java.util.logging.Logger;

import joptsimple.OptionParser;
import joptsimple.OptionSet;
import joptsimple.OptionSpec;
import net.gnehzr.tnoodle.utils.BadLazyClassDescriptionException;
import net.gnehzr.tnoodle.utils.LazyInstantiatorException;
import net.gnehzr.tnoodle.utils.LazyInstantiator;
import net.gnehzr.tnoodle.utils.TNoodleLogging;
import net.gnehzr.tnoodle.utils.TimedLogRecordStart;
import net.gnehzr.tnoodle.utils.Utils;

public class Main {
    private static final Logger l = Logger.getLogger(Main.class.getName());

    public static void main(String[] args) throws IOException, BadLazyClassDescriptionException, LazyInstantiatorException {

        OptionParser parser = new OptionParser();
        OptionSpec<?> benchmark = parser.acceptsAll(Arrays.asList("b", "benchmark"), "Benchmark scramble generation");
        OptionSpec<?> dumpScramblerInfo = parser.acceptsAll(Arrays.asList("d", "dump"), "Dump scrambler info (in JSON)");
        OptionSpec<?> help = parser.acceptsAll(Arrays.asList("h", "help"), "show help");
        OptionSet options = parser.parse(args);
        if(options.has(help)) {
            parser.printHelpOn(System.out);
            return;
        }
        List<String> puzzles = options.nonOptionArguments();

        Utils.doFirstRunStuff();
        TNoodleLogging.initializeLogging();
        if(options.has(benchmark)) {
            TNoodleLogging.setConsoleLogLevel(Level.ALL);
        }

        SortedMap<String, LazyInstantiator<Puzzle>> scramblers = PuzzlePlugins.getScramblers();

        if(options.has(dumpScramblerInfo)) {
            printScramblerInfoJSON(scramblers);
        } else {
            printScrambles(scramblers, puzzles);
        }

    }

    private static void printScramblerInfoJSON(SortedMap<String, LazyInstantiator<Puzzle>> scramblers) throws LazyInstantiatorException {
        SortedMap<String, HashMap<String, Object>> puzzleInfos = new TreeMap<String, HashMap<String, Object>>();
        for(String puzzle : scramblers.keySet()) {
            LazyInstantiator<Puzzle> lazyScrambler = scramblers.get(puzzle);
            Puzzle s = lazyScrambler.cachedInstance();
            HashMap<String, Object> puzzleInfo = new HashMap<String, Object>();
            puzzleInfo.put("shortName", s.getShortName());
            puzzleInfo.put("longName", s.getLongName());
            puzzleInfo.put("wcaMinScrambleDistance", s.getWcaMinScrambleDistance());
            puzzleInfos.put(puzzle, puzzleInfo);
        }

        String puzzleInfosJSON = Utils.GSON.toJson(puzzleInfos);
        System.out.println(puzzleInfosJSON);
    }

    private static void printScrambles(SortedMap<String, LazyInstantiator<Puzzle>> scramblers, List<String> puzzles) throws LazyInstantiatorException {
        for(String puzzle : puzzles) {
            LazyInstantiator<Puzzle> lazyScrambler = scramblers.get(puzzle);
            if(lazyScrambler == null) {
                System.err.println("couldn't find puzzle " + puzzle + ", try one of " + scramblers.keySet());
                System.exit(1);
            }

            TimedLogRecordStart start = new TimedLogRecordStart(Level.INFO, "Generating " + puzzle + " scramble");
            l.log(start);

            Puzzle s = lazyScrambler.cachedInstance();
            System.out.println(s.generateScramble());

            l.log(start.finishedNow());
        }
    }
}
