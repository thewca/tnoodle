package net.gnehzr.tnoodle.utils;

import java.text.DecimalFormat;
import java.util.logging.Level;
import java.util.logging.LogRecord;

@SuppressWarnings("serial")
public class TimedLogRecordEnd extends LogRecord {
	private static final DecimalFormat df = new DecimalFormat("#.###");
	
	public TimedLogRecordEnd(String msg, long startNanos, long endNanos) {
		this(Level.INFO, msg, startNanos, endNanos);
	}

	public TimedLogRecordEnd(Level level, String msg, long startNanos, long endNanos) {
		super(level, "FINISHED " + msg + " (took " + df.format((endNanos-startNanos)/1e9) + " seconds)");
	}

}
