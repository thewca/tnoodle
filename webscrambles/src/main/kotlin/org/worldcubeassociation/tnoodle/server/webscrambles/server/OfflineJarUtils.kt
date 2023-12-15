package org.worldcubeassociation.tnoodle.server.webscrambles.server

import dorkbox.systemTray.SystemTray
import dorkbox.systemTray.MenuItem
import org.slf4j.LoggerFactory
import org.worldcubeassociation.tnoodle.server.config.LocalServerEnvironmentConfig
import java.awt.*
import java.io.IOException
import java.net.URI
import java.net.URISyntaxException
import kotlin.system.exitProcess

data class OfflineJarUtils(val port: Int) {
    val url = "http://localhost:$port"

    fun openTabInBrowser() {
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

    /*
     * Sets the dock icon in the operating system.
     */
    fun setApplicationIcon(isWrapper: Boolean = false) {
        // Find out which icon to use.
        val iconFileName = if (isWrapper) ICON_WRAPPER else ICON_WORKER

        val trayAdapter = SystemTray.get()

        if (trayAdapter == null) {
            LOG.warn("SystemTray is not supported")
            return
        }

        val openItem = MenuItem("Open") { openTabInBrowser() }
        trayAdapter.menu.add(openItem)

        val exitItem = MenuItem("Exit") {
            LOG.info("Exit initiated from tray icon")
            exitProcess(0)
        }

        trayAdapter.menu.add(exitItem)

        val tooltip = "${LocalServerEnvironmentConfig.projectName} v${LocalServerEnvironmentConfig.projectVersion}"
        trayAdapter.setTooltip(tooltip)
        trayAdapter.status = tooltip

        // Get the file name of the icon.
        val fullFileName = "/${ICONS_FOLDER}/$iconFileName"
        val imageUrl = OfflineJarUtils::class.java.getResource(fullFileName)

        trayAdapter.setImage(imageUrl)
    }

    companion object {
        val LOG = LoggerFactory.getLogger(OfflineJarUtils::class.java)

        const val TNOODLE_DEFAULT_PORT = 2014
        const val TNOODLE_PORT_ENV_KEY = "TNOODLE_PORT"

        val TNOODLE_PORT = System.getenv(TNOODLE_PORT_ENV_KEY)?.toIntOrNull()
            ?: TNOODLE_DEFAULT_PORT

        const val ICONS_FOLDER = "icons"

        const val ICON_WORKER = "tnoodle_logo_1024.png"
        const val ICON_WRAPPER = "tnoodle_logo_1024_gray.png"
    }
}
