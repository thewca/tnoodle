package net.gnehzr.tnoodle.utils;

import java.text.DecimalFormat;
import java.util.logging.Level;
import java.util.logging.LogRecord;

@SuppressWarnings("serial")
public class TimedLogRecordEnd extends LogRecord {
    private static final DecimalFormat df = new DecimalFormat("#.###");

    public TimedLogRecordEnd(Level level, String msg, String extraMsg, long startNanos, long endNanos) {
        super(level, format(msg, extraMsg, startNanos, endNanos));
    }

    private static String format(String msg, String extraMsg, long startNanos, long endNanos) {
        String str = "FINISHED " + msg + " (took " + df.format((endNanos-startNanos)/1e9) + " seconds";
        if(extraMsg != null) {
            str += ", " + extraMsg;
        }
        str += ")";
        return str;
    }
}
