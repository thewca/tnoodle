package net.gnehzr.tnoodle.utils;

import java.util.logging.Level;
import java.util.logging.LogRecord;

@SuppressWarnings("serial")
public class TimedLogRecordStart extends LogRecord {
    private long startNanos;
    private String msg;

    public TimedLogRecordStart(Level level, String msg) {
        this(level, msg, System.nanoTime());
    }

    public TimedLogRecordStart(Level level, String msg, long startNanos) {
        super(level, "STARTED " + msg);
        this.startNanos = startNanos;
        this.msg = msg;
    }

    public TimedLogRecordEnd finishedNow() {
        return finishedNow(null);
    }

    public TimedLogRecordEnd finishedNow(String extraMsg) {
        return finishedAt(System.nanoTime(), extraMsg);
    }

    public TimedLogRecordEnd finishedAt(long endNanos) {
        return finishedAt(endNanos, null);
    }

    public TimedLogRecordEnd finishedAt(long endNanos, String extraMsg) {
        return new TimedLogRecordEnd(getLevel(), msg, extraMsg, this.startNanos, endNanos);
    }
}
