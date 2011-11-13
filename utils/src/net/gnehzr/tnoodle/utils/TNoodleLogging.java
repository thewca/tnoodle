package net.gnehzr.tnoodle.utils;

import java.io.File;
import java.io.IOException;
import java.util.logging.ConsoleHandler;
import java.util.logging.FileHandler;
import java.util.logging.Handler;
import java.util.logging.Level;
import java.util.logging.Logger;

public class TNoodleLogging {
	private static final int MAX_BYTES = 1024*1024*5;
	private static final int FILE_COUNT = 5;

	public static void initializeLogging() {
		Logger rootLogger = Logger.getLogger("");
		rootLogger.setLevel(Level.FINEST);
		
		for(Handler h : rootLogger.getHandlers()) {
			rootLogger.removeHandler(h);
		}
		
		// We print logs of WARNING or more important to the screen (and to file).
		// Everything above INFO gets saved to a file.
		// Everything below INFO is lost forever =(.
		OneLineLogFormatter formatter = new OneLineLogFormatter();
		ConsoleHandler ch = new ConsoleHandler();
		ch.setLevel(Level.WARNING);
		ch.setFormatter(formatter);
		rootLogger.addHandler(ch);
		
		try {
			File logFile = new File(Utils.getProgramDirectory(), "tnoodle.log");
			FileHandler fh = new FileHandler(logFile.getAbsolutePath(), MAX_BYTES, FILE_COUNT, true);
			fh.setLevel(Level.INFO);
			fh.setFormatter(formatter);
			rootLogger.addHandler(fh);
		} catch (SecurityException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}
}
