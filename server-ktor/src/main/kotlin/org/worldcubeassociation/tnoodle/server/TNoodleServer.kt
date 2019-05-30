package org.worldcubeassociation.tnoodle.server

import com.apple.eawt.Application
import com.xenomachina.argparser.ArgParser
import com.xenomachina.argparser.default
import io.ktor.server.cio.CIO
import io.ktor.server.engine.applicationEngineEnvironment
import io.ktor.server.engine.connector
import io.ktor.server.engine.embeddedServer
import io.ktor.util.KtorExperimentalAPI
import org.slf4j.LoggerFactory
import org.worldcubeassociation.tnoodle.server.application.TNoodleBaseServer
import org.worldcubeassociation.tnoodle.server.routing.JsEnvHandler
import org.worldcubeassociation.tnoodle.server.util.MainLauncher
import org.worldcubeassociation.tnoodle.server.util.MainLauncher.NO_REEXEC_OPT
import org.worldcubeassociation.tnoodle.server.util.WebServerUtils
import tray.SystemTrayProvider
import tray.java.JavaIconAdapter
import java.awt.*
import java.io.IOException
import java.net.URI
import java.net.URISyntaxException
import javax.swing.ImageIcon

object TNoodleServer {
    const val TNOODLE_PORT = 2014

    const val MIN_HEAP_SIZE_MEGS = 512

    val LOG = LoggerFactory.getLogger(TNoodleServer::class.java)

    val NAME = WebServerUtils.projectName
    val VERSION = WebServerUtils.version

    private val SERVER_MODULES = mutableListOf<ApplicationHandler>()

    fun registerModule(app: ApplicationHandler) = SERVER_MODULES.add(app)

    @KtorExperimentalAPI
    fun launch(cliArgs: Array<String>) {
        WebServerUtils.doFirstRunStuff()

        val parser = ArgParser(cliArgs)

        val desiredPort by parser.storing("-p", "--http", help = "The port to run the http server on", transform = String::toInt).default(TNOODLE_PORT)

        val desiredJsEnv by parser.adding("--jsenv", help = "Add entry to global js object TNOODLE_ENV in /env.js. Treated as strings, so FOO=42 will create the entry TNOODLE_ENV['FOO'] = '42';")

        for (jsEnv in desiredJsEnv) {
            val (key, strValue) = jsEnv.split("=", limit = 2)
            JsEnvHandler.putJsEnv(key, strValue)
        }

        val noBrowser by parser.flagging("-n", "--nobrowser", help = "Don't open the browser when starting the server")
        // val noUpgrade by parser.flagging("-u", "--noupgrade", help = "If an instance of $NAME is running on the desired port(s), do not attempt to kill it and start up")
        val noReexec by parser.flagging(NO_REEXEC_OPT, help = "Do not reexec. This is sometimes done to rename java.exe on Windows, or to get a larger heap size.")

        setApplicationIcon()

        if (!noReexec) {
            MainLauncher.wrapMain(cliArgs, MIN_HEAP_SIZE_MEGS)

            // This second call to setApplicationIcon() is intentional.
            // We want different icons for the parent and child processes.
            setApplicationIcon()
        }

        val env = applicationEngineEnvironment {
            module {
                TNoodleBaseServer().spinUp(this)
            }

            for (serverModule in SERVER_MODULES) {
                module {
                    serverModule.spinUp(this)
                }
            }

            connector {
                host = "localhost"
                port = desiredPort
            }
        }

        embeddedServer(CIO, env).start()

        LOG.info("$NAME-$VERSION started")

        val url = openTabInBrowser(!noBrowser)
        LOG.info("Visit $url for a readme and demo.")
    }

    fun openTabInBrowser(browse: Boolean): String {
        val url = "http://localhost:$TNOODLE_PORT"

        if (browse) {
            if (Desktop.isDesktopSupported()) {
                val d = Desktop.getDesktop()

                if (d.isSupported(Desktop.Action.BROWSE)) {
                    try {
                        val uri = URI(url)
                        LOG.info("Attempting to open $uri in browser.")
                        d.browse(uri)
                    } catch (e: URISyntaxException) {
                        LOG.warn("Could not convert $url to URI", e)
                    } catch (e: IOException) {
                        LOG.warn("Error opening tab in browser", e)
                    }

                } else {
                    LOG.error("Sorry, it appears the Desktop api is supported on your platform, but the BROWSE action is not.")
                }
            } else {
                LOG.error("Sorry, it appears the Desktop api is not supported on your platform.")
            }
        }

        return url
    }

    // Preferred way to detect OSX according to https://developer.apple.com/library/mac/#technotes/tn2002/tn2110.html
    fun isOSX() = "OS X" in System.getProperty("os.name")

    const val ICONS_FOLDER = "icons"

    const val ICON_WORKER = "tnoodle_logo_1024.png"
    const val ICON_WRAPPER = "tnoodle_logo_1024_gray.png"

    /*
     * Sets the dock icon in OSX. Could be made to have uses in other operating systems.
     */
    private fun setApplicationIcon() {
        // Find out which icon to use.
        val processType = MainLauncher.processType

        val iconFileName = if (processType === MainLauncher.ProcessType.WORKER) ICON_WORKER else ICON_WRAPPER

        // Get the file name of the icon.
        val fullFileName = "/$ICONS_FOLDER/$iconFileName"
        val imageUrl = TNoodleServer.javaClass.getResource(fullFileName)

        val image = ImageIcon(imageUrl).image

        // OSX-specific code to set the dock icon.
        if (isOSX()) {
            try {
                Application.getApplication().dockIconImage = image
            } catch (e: Exception) {
                LOG.warn("Error setting OSX dock icon", e)
            }
        } else {
            if (iconFileName != ICON_WORKER) {
                // Only want to create one tray icon.
                return
            }

            if (!SystemTray.isSupported()) {
                LOG.warn("SystemTray is not supported")
                return
            }

            val trayAdapter = SystemTrayProvider().systemTray

            val popup = PopupMenu()

            val openItem = MenuItem("Open")
            popup.add(openItem)

            val exitItem = MenuItem("Exit")
            popup.add(exitItem)

            openItem.addActionListener { openTabInBrowser(true) }

            exitItem.addActionListener {
                LOG.info("Exit initiated from tray icon")
                System.exit(0)
            }

            val trayIconAdapter = trayAdapter.createAndAddTrayIcon(imageUrl, "$NAME v$VERSION", popup)

            if (trayIconAdapter is JavaIconAdapter) {
                // Unfortunately, java internally uses some shitty resizing
                // algorithm for this, so we have to do this ourselves.
                //trayIconAdapter.setImageAutoSize(true);

                val st = SystemTray.getSystemTray()
                val ti = trayIconAdapter.trayIcon

                ti.image = image.getScaledInstance(st.trayIconSize.width, -1, Image.SCALE_SMOOTH)
            }
        }
    }
}
