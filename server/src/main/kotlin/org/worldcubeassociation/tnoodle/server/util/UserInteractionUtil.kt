package org.worldcubeassociation.tnoodle.server.util

import dorkbox.systemTray.SystemTray
import dorkbox.systemTray.MenuItem
import org.slf4j.LoggerFactory
import org.worldcubeassociation.tnoodle.server.LocalServerEnvironmentConfig
import java.awt.*
import java.io.IOException
import java.net.URI
import kotlin.system.exitProcess

object UserInteractionUtil {
    val LOG = LoggerFactory.getLogger(UserInteractionUtil::class.java)

    const val ICONS_FOLDER = "icons"

    const val ICON_WORKER = "tnoodle_logo_1024.png"
    const val ICON_WRAPPER = "tnoodle_logo_1024_gray.png"

    fun openTabInBrowser(uri: URI) {
        if (Desktop.isDesktopSupported()) {
            val d = Desktop.getDesktop()

            if (d.isSupported(Desktop.Action.BROWSE)) {
                try {
                    LOG.info("Attempting to open $uri in browser.")
                    d.browse(uri)
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
    fun setApplicationIcon(env: LocalServerEnvironmentConfig, isWrapper: Boolean = false) {
        // Find out which icon to use.
        val iconFileName = if (isWrapper) ICON_WRAPPER else ICON_WORKER

        val os = System.getProperty("os.name").lowercase()

        if (os.contains("mac") || os.contains("darwin")) {
            LOG.debug("Detected MacOS implementation for os.name value $os")
            LOG.debug("Using workaround for BigSur SystemTray error!")

            SystemTray.FORCE_TRAY_TYPE = SystemTray.TrayType.Awt
        }

        val trayAdapter = SystemTray.get()

        if (trayAdapter == null) {
            LOG.warn("SystemTray is not supported")
            return
        }

        val openItem = MenuItem("Open") { openTabInBrowser(URI(env.url)) }
        trayAdapter.menu.add(openItem)

        val exitItem = MenuItem("Exit") {
            LOG.info("Exit initiated from tray icon")
            exitProcess(0)
        }

        trayAdapter.menu.add(exitItem)

        val tooltip = env.title
        trayAdapter.setTooltip(tooltip)
        trayAdapter.status = tooltip

        // Get the file name of the icon.
        val fullFileName = "/$ICONS_FOLDER/$iconFileName"
        val imageUrl = UserInteractionUtil::class.java.getResource(fullFileName)

        trayAdapter.setImage(imageUrl)
    }
}
