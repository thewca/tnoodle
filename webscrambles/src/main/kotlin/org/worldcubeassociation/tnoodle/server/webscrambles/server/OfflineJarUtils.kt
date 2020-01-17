package org.worldcubeassociation.tnoodle.server.webscrambles.server

import dorkbox.systemTray.SystemTray
import dorkbox.systemTray.MenuItem
import org.slf4j.LoggerFactory
import java.awt.*
import java.io.IOException
import java.net.URI
import java.net.URISyntaxException
import javax.swing.ImageIcon
import kotlin.system.exitProcess

object OfflineJarUtils {
    val LOG = LoggerFactory.getLogger(OfflineJarUtils::class.java)

    const val TNOODLE_PORT = 2014

    const val ICONS_FOLDER = "icons"

    const val ICON_WORKER = "tnoodle_logo_1024.png"
    const val ICON_WRAPPER = "tnoodle_logo_1024_gray.png"

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

    /*
     * Sets the dock icon in OSX. Could be made to have uses in other operating systems.
     */
    fun setApplicationIcon() {
        // Find out which icon to use.
        val processType = MainLauncher.processType

        val iconFileName = if (processType === MainLauncher.ProcessType.WORKER) ICON_WORKER else ICON_WRAPPER

        if (iconFileName != ICON_WORKER) {
            // Only want to create one tray icon.
            return
        }

        val trayAdapter = SystemTray.get()

        if (trayAdapter == null) {
            LOG.warn("SystemTray is not supported")
            return
        }

        val openItem = MenuItem("Open") { openTabInBrowser(true) }
        trayAdapter.menu.add(openItem)

        val exitItem = MenuItem("Exit") {
            LOG.info("Exit initiated from tray icon")
            exitProcess(0)
        }

        trayAdapter.menu.add(exitItem)

        val tooltip = "${LocalServerEnvironmentConfig.projectName} v${LocalServerEnvironmentConfig.version}"
        trayAdapter.setTooltip(tooltip)
        trayAdapter.status = tooltip

        // Get the file name of the icon.
        val fullFileName = "/${ICONS_FOLDER}/$iconFileName"
        val imageUrl = OfflineJarUtils::class.java.getResource(fullFileName)

        trayAdapter.setImage(imageUrl)
    }
}
