package net.gnehzr.tnoodle.utils;

import com.google.gwt.i18n.client.NumberFormat;

import java.util.logging.Level;
import java.util.logging.LogRecord;

@SuppressWarnings("serial")
public class TimedLogRecordEnd extends LogRecord {
    private static final NumberFormat nf = NumberFormat.getFormat("0.00");

    public TimedLogRecordEnd(Level level, String msg, String extraMsg, long startMillis, long endMillis) {
        super(level, format(msg, extraMsg, startMillis, endMillis));
    }

    private static String format(String msg, String extraMsg, long startMillis, long endMillis) {
        String str = "FINISHED " + msg + " (took " + nf.format((endMillis-startMillis)/1000) + " seconds";
        if(extraMsg != null) {
            str += ", " + extraMsg;
        }
        str += ")";
        return str;
    }
}
