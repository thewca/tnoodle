package org.worldcubeassociation.tnoodle.server.util

import com.apple.eawt.Application
import org.worldcubeassociation.tnoodle.server.TNoodleServer
import tray.SystemTrayProvider
import tray.java.JavaIconAdapter
import java.awt.*
import java.io.*
import java.net.URI
import java.net.URISyntaxException
import java.nio.file.Files
import java.nio.file.StandardCopyOption
import java.text.SimpleDateFormat
import java.util.Random
import javax.swing.ImageIcon
import kotlin.system.exitProcess

object WebServerUtils {
    val SDF = SimpleDateFormat("YYYY-mm-dd")

    val PRUNING_FOLDER = "tnoodle_pruning_cache"
    val DEVEL_VERSION = "devel-TEMP"

    /**
     * @return A File representing the directory in which this program resides.
     * If this is a jar file, this should be obvious, otherwise it's the directory in which
     * our calling class resides.
     */
    val programDirectory: File
        get() {
            val programDirectory = jarFileOrDirectory
            return programDirectory.takeUnless { it.isFile } ?: programDirectory.parentFile
        }

    // Classes that are part of a web app were loaded with the
    // servlet container's classloader, so we can't necessarily
    // find them.
    val callerClass: Class<*>?
        get() {
            val stElements = Thread.currentThread().stackTrace

            for (i in 2 until stElements.size) {
                val ste = stElements[i]

                val callerClass = try {
                    Class.forName(ste.className)
                } catch (e: ClassNotFoundException) {
                    return null
                }

                if (WebServerUtils::class.java.getPackage() != callerClass.getPackage()) {
                    return callerClass
                }
            }

            return null
        }

    private val jarFileOrDirectory: File
        get() {
            // We don't know where the class is (it was probably loaded
            // by the servlet container), so just use Util.
            val callerClass = callerClass
                ?: WebServerUtils::class.java

            return try {
                File(callerClass.protectionDomain.codeSource.location.toURI().path)
            } catch (e: URISyntaxException) {
                File(".")
            }
        }

    val jarFile: File?
        get() = jarFileOrDirectory.takeIf { it.isFile }

    val SEEDED_RANDOM: Random by lazy {
        val randSeedEnvVar = "TNOODLE_RANDSEED"

        val seed = System.getenv(randSeedEnvVar) ?: System.currentTimeMillis().toString()
        println("Using TNOODLE_RANDSEED=$seed")

        Random(seed.hashCode().toLong())
    }

    fun throwableToString(e: Throwable) =
        ByteArrayOutputStream().apply {
            e.printStackTrace(PrintStream(this))
        }.toString()

    fun copyFile(sourceFile: File, destFile: File) =
        Files.copy(sourceFile.toPath(), destFile.toPath(), StandardCopyOption.REPLACE_EXISTING)

    // Preferred way to detect OSX according to https://developer.apple.com/library/mac/#technotes/tn2002/tn2110.html
    fun isOSX() = "OS X" in System.getProperty("os.name")

    fun openTabInBrowser(browse: Boolean): String {
        val url = "http://localhost:${TNoodleServer.TNOODLE_PORT}"

        if (browse) {
            if (Desktop.isDesktopSupported()) {
                val d = Desktop.getDesktop()

                if (d.isSupported(Desktop.Action.BROWSE)) {
                    try {
                        val uri = URI(url)
                        TNoodleServer.LOG.info("Attempting to open $uri in browser.")
                        d.browse(uri)
                    } catch (e: URISyntaxException) {
                        TNoodleServer.LOG.warn("Could not convert $url to URI", e)
                    } catch (e: IOException) {
                        TNoodleServer.LOG.warn("Error opening tab in browser", e)
                    }

                } else {
                    TNoodleServer.LOG.error("Sorry, it appears the Desktop api is supported on your platform, but the BROWSE action is not.")
                }
            } else {
                TNoodleServer.LOG.error("Sorry, it appears the Desktop api is not supported on your platform.")
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

        val iconFileName = if (processType === MainLauncher.ProcessType.WORKER) TNoodleServer.ICON_WORKER else TNoodleServer.ICON_WRAPPER

        // Get the file name of the icon.
        val fullFileName = "/${TNoodleServer.ICONS_FOLDER}/$iconFileName"
        val imageUrl = TNoodleServer::class.java.getResource(fullFileName)

        val image = ImageIcon(imageUrl).image

        // OSX-specific code to set the dock icon.
        if (isOSX()) {
            try {
                Application.getApplication().dockIconImage = image
            } catch (e: Exception) {
                TNoodleServer.LOG.warn("Error setting OSX dock icon", e)
            }
        } else {
            if (iconFileName != TNoodleServer.ICON_WORKER) {
                // Only want to create one tray icon.
                return
            }

            if (!SystemTray.isSupported()) {
                TNoodleServer.LOG.warn("SystemTray is not supported")
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
                TNoodleServer.LOG.info("Exit initiated from tray icon")
                exitProcess(0)
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
