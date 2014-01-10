package net.gnehzr.tnoodle.utils;

import java.io.File;
import java.io.IOException;
import java.util.logging.ConsoleHandler;
import java.util.logging.FileHandler;
import java.util.logging.Formatter;
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
    private static Logger rootLogger;
    private static Formatter formatter;
    public static void initializeLogging() {
        rootLogger = Logger.getLogger("");
        rootLogger.setLevel(Level.FINEST);

        for(Handler h : rootLogger.getHandlers()) {
            rootLogger.removeHandler(h);
        }

        // By default, we print logs of level Level.INFO or higher
        // or more important to the screen.
        formatter = new OneLineLogFormatter();
        ch = new ConsoleHandler();
        setConsoleLogLevel(DEFAULT_LOG_LEVEL);
        ch.setFormatter(formatter);
        rootLogger.addHandler(ch);

        String fileLogLevel = System.getenv("TNOODLE_FILE_LOG_LEVEL");
        if(fileLogLevel != null) {
            Level fl = Level.parse(fileLogLevel);
            setFileLogLevel(fl);
        }
        String consoleLogLevel = System.getenv("TNOODLE_CONSOLE_LOG_LEVEL");
        if(consoleLogLevel != null) {
            Level cl = Level.parse(consoleLogLevel);
            setConsoleLogLevel(cl);
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
        if(fh == null) {
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
        fh.setLevel(level);
        l.config(getLogFile() + " log level " + level);
    }
}
