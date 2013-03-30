package net.gnehzr.tnoodle.utils;

import java.util.logging.Formatter;
import java.util.logging.LogRecord;

public class OneLineLogFormatter extends Formatter {

    @Override
    public String format(LogRecord record) {
        StringBuffer buf = new StringBuffer(1000);
        buf.append(record.getLevel());
        buf.append(' ');
        buf.append(record.getThreadID());
        buf.append(' ');
        buf.append(record.getMillis());
        buf.append(' ');
        buf.append(record.getSourceClassName()).append(':').append(record.getSourceMethodName());
        buf.append(' ');
        buf.append(formatMessage(record));
        buf.append(' ');
        if(record.getThrown() != null) {
            buf.append(Utils.throwableToString(record.getThrown()));
        }
        buf.append('\n');
        return buf.toString();
    }

}
