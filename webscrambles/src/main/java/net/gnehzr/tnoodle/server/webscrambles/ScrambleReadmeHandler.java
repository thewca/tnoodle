package net.gnehzr.tnoodle.server.webscrambles;

import net.gnehzr.tnoodle.utils.GwtSafeUtils;

import java.util.logging.Logger;
import java.util.logging.Level;
import java.io.ByteArrayOutputStream;
import java.io.FileInputStream;
import java.io.IOException;
import javax.servlet.ServletException;
import java.lang.reflect.InvocationTargetException;
import java.util.SortedMap;
import java.util.LinkedHashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import net.gnehzr.tnoodle.scrambles.Puzzle;
import net.gnehzr.tnoodle.scrambles.PuzzlePlugins;
import net.gnehzr.tnoodle.server.SafeHttpServlet;
import net.gnehzr.tnoodle.utils.LazyInstantiator;
import net.gnehzr.tnoodle.utils.LazyInstantiatorException;
import net.gnehzr.tnoodle.utils.BadLazyClassDescriptionException;

@SuppressWarnings("serial")
public class ScrambleReadmeHandler extends SafeHttpServlet {
    private static final Logger l = Logger.getLogger(ScrambleReadmeHandler.class.getName());

    public ScrambleReadmeHandler() {}

    @Override
    public void init() throws ServletException {
        super.init();
        try {
            safeInit();
        } catch(Throwable t) {
            l.log(Level.SEVERE, "", t);
        }
    }

    private SortedMap<String, LazyInstantiator<Puzzle>> scramblers;
    private String scramblesReadme;
    private void safeInit() throws IOException, BadLazyClassDescriptionException, LazyInstantiatorException {
        scramblers = PuzzlePlugins.getScramblers();

        String scramblesReadmePath = getServletContext().getRealPath("wca/readme-scramble.md");
        FileInputStream dataStructureInputStream = new FileInputStream(scramblesReadmePath);
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        GwtSafeUtils.fullyReadInputStream(dataStructureInputStream, baos);
        scramblesReadme = baos.toString();

        StringBuilder scrambleFilteringInfo = new StringBuilder();
        for(String puzzle : scramblers.keySet()) {
            LazyInstantiator<Puzzle> lazyScrambler = scramblers.get(puzzle);
            Puzzle s = lazyScrambler.cachedInstance();
            // those 2 spaces at the end are no accident: http://meta.stackoverflow.com/questions/26011/should-the-markdown-renderer-treat-a-single-line-break-as-br
            String line = String.format("%s: &ge; %d moves away from solved  \n", s.getLongName(), s.getWcaMinScrambleDistance());
            scrambleFilteringInfo.append(line);
        }

        scramblesReadme = scramblesReadme.replace("%SCRAMBLE_FILTERING_THRESHOLDS%",
                scrambleFilteringInfo);
    }

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        sendMarkdown(req, resp, scramblesReadme);
    }
}
