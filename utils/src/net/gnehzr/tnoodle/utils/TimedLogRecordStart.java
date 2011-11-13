package net.gnehzr.tnoodle.utils;

import java.util.logging.Level;
import java.util.logging.LogRecord;

@SuppressWarnings("serial")
public class TimedLogRecordStart extends LogRecord {
	private long startNanos;
	private String msg;
	public TimedLogRecordStart(String msg) {
		this(Level.INFO, msg, System.nanoTime());
	}

	public TimedLogRecordStart(Level level, String msg, long startNanos) {
		super(level, "STARTED " + msg);
		this.startNanos = startNanos;
		this.msg = msg;
	}
	
	public TimedLogRecordEnd finishedNow() {
		return finishedAt(System.nanoTime());
	}
	
	public TimedLogRecordEnd finishedAt(long endNanos) {
		return new TimedLogRecordEnd(msg, this.startNanos, endNanos);
	}
}
