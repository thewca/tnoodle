package org.worldcubeassociation.tnoodle.server

import com.xenomachina.argparser.ArgParser
import com.xenomachina.argparser.default
import io.ktor.server.engine.applicationEngineEnvironment
import io.ktor.server.engine.connector
import io.ktor.server.engine.embeddedServer
import io.ktor.server.netty.Netty
import org.worldcubeassociation.tnoodle.server.logging.TNoodleLogging
import net.gnehzr.tnoodle.utils.Utils
import java.awt.*
import java.io.File
import java.io.IOException
import java.net.MalformedURLException
import java.net.URI
import java.net.URISyntaxException
import java.util.logging.Level
import javax.swing.ImageIcon

object TNoodleServer {
    const val TNOODLE_PORT = 2014

    var NAME = Utils.projectName
    var VERSION = Utils.version

    @JvmStatic
    fun main(args: Array<String>) {
        Utils.doFirstRunStuff()
        TNoodleLogging.initializeLogging()

        val parser = ArgParser(args)

        val desiredPort by parser.storing("-p", "--http", help = "The port to run the http server on", transform = String::toInt).default(TNOODLE_PORT)
        val desiredJsEnv by parser.storing("--jsenv", help = "Add entry to global js object TNOODLE_ENV in /env.js. Treated as strings, so FOO=42 will create the entry TNOODLE_ENV['FOO'] = '42';", transform = {}).default("")

        val noBrowser by parser.flagging("-n", "--nobrowser", help = "Don't open the browser when starting the server")
        val noUpgrade by parser.flagging("-u", "--noupgrade", help = "If an instance of $NAME is running on the desired port(s), do not attempt to kill it and start up")
        val noReexec by parser.flagging("--noreexec", help = "Do not reexec. This is sometimes done to rename java.exe on Windows, or to get a larger heap size.")

        val consoleLevels = TNoodleLogging.levels.associateBy { "--console-${it.name}" }
        val fileLevels = TNoodleLogging.levels.associateBy { "--file-${it.name}" }

        val consoleLoggingLevel by parser.mapping(consoleLevels, help = "The minimum level a log must be to be printed to the console.").default(Level.WARNING)
        val fileLoggingLevel by parser.mapping(fileLevels, help = "The minimum level a log must be to be printed to ${TNoodleLogging.logFile}").default(Level.INFO)

        TNoodleLogging.setConsoleLogLevel(consoleLoggingLevel)
        TNoodleLogging.setFileLogLevel(fileLoggingLevel)

        // Note that we set the log level *before* we do any of this.
        // These two calls to setApplicationIcon() are intentional.
        // We want different icons for the parent process and the child
        // process.
        setApplicationIcon()
        MainLauncher.wrapMain(args, MIN_HEAP_SIZE_MEGS)
        setApplicationIcon()

        val env = applicationEngineEnvironment {
            module {
                tnoodleServer()
            }

            connector {
                host = "localhost"
                port = desiredPort
            }
        }

        embeddedServer(Netty, env).start(wait = true)

        // TODO logging

        println("$NAME-$VERSION started")

        val url = openTabInBrowser(!noBrowser)
        println("Visit $url for a readme and demo.")
    }

    fun openTabInBrowser(browse: Boolean): String {
        val url = "http://localhost:$TNOODLE_PORT"

        if (browse) {
            if (Desktop.isDesktopSupported()) {
                val d = Desktop.getDesktop()

                if (d.isSupported(Desktop.Action.BROWSE)) {
                    try {
                        val uri = URI(url)
                        l.info("Attempting to open $uri in browser.")
                        d.browse(uri)
                    } catch (e: URISyntaxException) {
                        l.warning("Could not convert $url to URI", e)
                    } catch (e: IOException) {
                        l.warning("Error opening tab in browser", e)
                    }

                } else {
                    l.warning("Sorry, it appears the Desktop api is supported on your platform, but the BROWSE action is not.")
                }
            } else {
                l.warning("Sorry, it appears the Desktop api is not supported on your platform.")
            }
        }

        return url
    }

    // Preferred way to detect OSX according to https://developer.apple.com/library/mac/#technotes/tn2002/tn2110.html
    fun isOSX() = System.getProperty("os.name").contains("OS X")

    /*
     * Sets the dock icon in OSX. Could be made to have uses in other operating systems.
     */
    private fun setApplicationIcon() {
        // Find out which icon to use.
        val processType = MainLauncher.processType
        val iconFileName: String

        if (processType === MainLauncher.PROCESS_TYPE.WORKER) {
            iconFileName = ICON_WORKER
        } else {
            iconFileName = ICON_WRAPPER
        }

        // Get the file name of the icon.
        val fullFileName = "${Utils.resourceDirectory}/$ICONS_FOLDER/$iconFileName"
        val image = ImageIcon(fullFileName).image

        // OSX-specific code to set the dock icon.
        if (isOSX()) {
            try {
                val application = com.apple.eawt.Application.getApplication()
                application.setDockIconImage(image)
            } catch (e: Exception) {
                l.log(Level.WARNING, "Error setting OSX dock icon", e)
            }
        } else {
            if (iconFileName != ICON_WORKER) {
                // Only want to create one tray icon.
                return
            }

            if (!SystemTray.isSupported()) {
                l.warning("SystemTray is not supported")
                return
            }

            val imageUrl = try {
                File(fullFileName).toURI().toURL()
            } catch (e: MalformedURLException) {
                l.log(Level.WARNING, "Could not convert $fullFileName to a URL", e)
                return
            }

            val trayAdapter = SystemTrayProvider().getSystemTray()

            val popup = PopupMenu()

            val openItem = MenuItem("Open")
            popup.add(openItem)
            val exitItem = MenuItem("Exit")
            popup.add(exitItem)

            openItem.addActionListener { openTabInBrowser(true) }

            exitItem.addActionListener {
                l.info("Exit initiated from tray icon")
                System.exit(0)
            }

            val trayIconAdapter = trayAdapter.createAndAddTrayIcon(imageUrl, "$NAME v$VERSION", popup)

            if (trayIconAdapter is JavaIconAdapter) {
                // Unfortunately, java internally uses some shitty resizing
                // algorithm for this, so we have to do this ourselves.
                //trayIconAdapter.setImageAutoSize(true);

                val st = SystemTray.getSystemTray()
                val jia = trayIconAdapter as JavaIconAdapter
                val ti = jia.getTrayIcon()
                ti.setImage(image.getScaledInstance(st.trayIconSize.width, -1, Image.SCALE_SMOOTH))

            }
        }
    }
}
