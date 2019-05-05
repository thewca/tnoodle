package net.gnehzr.tnoodle.utils;

import java.util.logging.Level;
import java.util.logging.LogRecord;

@SuppressWarnings("serial")
public class TimedLogRecordStart extends LogRecord {
    private long startMillis;
    private String msg;

    public TimedLogRecordStart(Level level, String msg) {
        this(level, msg, System.currentTimeMillis());
    }

    public TimedLogRecordStart(Level level, String msg, long startMillis) {
        super(level, "STARTED " + msg);
        this.startMillis = startMillis;
        this.msg = msg;
    }

    public net.gnehzr.tnoodle.utils.TimedLogRecordEnd finishedNow() {
        return finishedNow(null);
    }

    public net.gnehzr.tnoodle.utils.TimedLogRecordEnd finishedNow(String extraMsg) {
        return finishedAt(System.currentTimeMillis(), extraMsg);
    }

    public net.gnehzr.tnoodle.utils.TimedLogRecordEnd finishedAt(long endMillis) {
        return finishedAt(endMillis, null);
    }

    public net.gnehzr.tnoodle.utils.TimedLogRecordEnd finishedAt(long endMillis, String extraMsg) {
        return new TimedLogRecordEnd(getLevel(), msg, extraMsg, this.startMillis, endMillis);
    }
}
