package org.worldcubeassociation.tnoodle.server.logging

import org.worldcubeassociation.tnoodle.server.WebServerUtils
import java.io.File
import java.io.IOException
import java.util.logging.ConsoleHandler
import java.util.logging.FileHandler
import java.util.logging.Formatter
import java.util.logging.Level
import java.util.logging.Logger

object TNoodleLogging {
    private val l = Logger.getLogger(TNoodleLogging::class.java.name)

    private val MAX_BYTES = 1024 * 1024 * 5
    private val FILE_COUNT = 5
    private val DEFAULT_LOG_LEVEL = Level.INFO

    private var ch: ConsoleHandler? = null
    private var fh: FileHandler? = null
    private var rootLogger: Logger? = null
    private var formatter: Formatter? = null

    val logFile: File
        get() = File(WebServerUtils.resourceDirectory, "log/tnoodle.log")

    val levels: Array<Level>
        get() = arrayOf(Level.ALL, Level.FINEST, Level.FINER, Level.FINE, Level.CONFIG, Level.INFO, Level.WARNING, Level.SEVERE, Level.OFF)

    fun initializeLogging() {
        rootLogger = Logger.getLogger("")
        rootLogger!!.level = Level.FINEST

        for (h in rootLogger!!.handlers) {
            rootLogger!!.removeHandler(h)
        }

        // By default, we print logs of level Level.INFO or higher
        // or more important to the screen.
        formatter = OneLineLogFormatter()
        ch = ConsoleHandler()
        setConsoleLogLevel(DEFAULT_LOG_LEVEL)
        ch!!.formatter = formatter!!
        rootLogger!!.addHandler(ch!!)

        val fileLogLevel = System.getenv("TNOODLE_FILE_LOG_LEVEL")
        if (fileLogLevel != null) {
            val fl = Level.parse(fileLogLevel)
            setFileLogLevel(fl)
        }
        val consoleLogLevel = System.getenv("TNOODLE_CONSOLE_LOG_LEVEL")
        if (consoleLogLevel != null) {
            val cl = Level.parse(consoleLogLevel)
            setConsoleLogLevel(cl)
        }
    }

    fun setConsoleLogLevel(level: Level) {
        ch!!.level = level
        l.config("Console log level $level")
    }

    fun setFileLogLevel(level: Level) {
        if (fh == null) {
            try {
                val logFile = logFile
                logFile.parentFile.mkdirs()
                fh = FileHandler(logFile.absolutePath, MAX_BYTES, FILE_COUNT, true)
                setFileLogLevel(DEFAULT_LOG_LEVEL)
                fh!!.formatter = formatter!!
                rootLogger!!.addHandler(fh!!)
            } catch (e: SecurityException) {
                e.printStackTrace()
            } catch (e: IOException) {
                e.printStackTrace()
            }

        }
        fh!!.level = level
        l.config("$logFile log level $level")
    }
}
