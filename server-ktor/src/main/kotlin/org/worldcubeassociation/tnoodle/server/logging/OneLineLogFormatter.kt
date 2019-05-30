package org.worldcubeassociation.tnoodle.server.logging

import org.worldcubeassociation.tnoodle.server.util.WebServerUtils
import java.util.logging.Formatter
import java.util.logging.LogRecord

class OneLineLogFormatter : Formatter() {
    override fun format(record: LogRecord): String {
        val throwableMsg = record.thrown?.let { WebServerUtils.throwableToString(it) } ?: ""
        val formatString = "${record.level} ${record.threadID} ${record.millis} ${record.sourceClassName}:${record.sourceMethodName} ${formatMessage(record)} $throwableMsg"

        return "${formatString.trim()}\n"
    }

}
