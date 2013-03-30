package net.gnehzr.tnoodle.utils;

import java.io.File;
import java.io.IOException;
import java.util.logging.ConsoleHandler;
import java.util.logging.FileHandler;
import java.util.logging.Handler;
import java.util.logging.Level;
import java.util.logging.Logger;

public class TNoodleLogging {
    private static final Logger l = Logger.getLogger(TNoodleLogging.class.getName());

    private static final int MAX_BYTES = 1024*1024*5;
    private static final int FILE_COUNT = 5;
    private static final Level DEFAULT_LOG_LEVEL = Level.INFO;

    private static ConsoleHandler ch;
    private static FileHandler fh;
    public static void initializeLogging() {
        Logger rootLogger = Logger.getLogger("");
        rootLogger.setLevel(Level.FINEST);

        for(Handler h : rootLogger.getHandlers()) {
            rootLogger.removeHandler(h);
        }

        // We print logs of consoleLogLevel or more important to the screen (and to file).
        // Everything above INFO gets saved to a file.
        // Everything below INFO is lost forever =(.
        OneLineLogFormatter formatter = new OneLineLogFormatter();
        ch = new ConsoleHandler();
        setConsoleLogLevel(DEFAULT_LOG_LEVEL);
        ch.setFormatter(formatter);
        rootLogger.addHandler(ch);

        try {
            File logFile = getLogFile();
            logFile.getParentFile().mkdirs();
            fh = new FileHandler(logFile.getAbsolutePath(), MAX_BYTES, FILE_COUNT, true);
            setFileLogLevel(DEFAULT_LOG_LEVEL);
            fh.setFormatter(formatter);
            rootLogger.addHandler(fh);
        } catch (SecurityException e) {
            e.printStackTrace();
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    public static File getLogFile() {
        return new File(Utils.getResourceDirectory(), "log/tnoodle.log");
    }

    public static Level[] getLevels() {
        return new Level[] {
            Level.ALL,
            Level.FINEST,
            Level.FINER,
            Level.FINE,
            Level.CONFIG,
            Level.INFO,
            Level.WARNING,
            Level.SEVERE,
            Level.OFF
        };
    }

    public static void setConsoleLogLevel(Level level) {
        ch.setLevel(level);
        l.config("Console log level " + level);
    }
    public static void setFileLogLevel(Level level) {
        fh.setLevel(level);
        l.config(getLogFile() + " log level " + level);
    }
}
