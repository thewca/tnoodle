package org.worldcubeassociation.tnoodle.server.webscrambles.server

import com.apple.eawt.Application
import org.slf4j.LoggerFactory
import tray.SystemTrayProvider
import tray.java.JavaIconAdapter
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

    // Preferred way to detect OSX according to https://developer.apple.com/library/mac/#technotes/tn2002/tn2110.html
    fun isOSX() = "OS X" in System.getProperty("os.name")

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

        // Get the file name of the icon.
        val fullFileName = "/${ICONS_FOLDER}/$iconFileName"
        val imageUrl = OfflineJarUtils::class.java.getResource(fullFileName)

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
                exitProcess(0)
            }

            val tooltip = "${LocalServerCacheConfig.projectName} v${LocalServerCacheConfig.version}"
            val trayIconAdapter = trayAdapter.createAndAddTrayIcon(imageUrl, tooltip, popup)

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
