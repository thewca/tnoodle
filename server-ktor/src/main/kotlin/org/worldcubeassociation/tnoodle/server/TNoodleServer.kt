package org.worldcubeassociation.tnoodle.server

import com.apple.eawt.Application
import com.xenomachina.argparser.ArgParser
import io.ktor.application.install
import io.ktor.features.ContentNegotiation
import io.ktor.features.DefaultHeaders
import io.ktor.gson.gson
import io.ktor.routing.routing
import io.ktor.server.engine.ShutDownUrl
import io.ktor.server.engine.commandLineEnvironment
import io.ktor.server.engine.embeddedServer
import io.ktor.server.netty.Netty
import org.slf4j.LoggerFactory
import org.worldcubeassociation.tnoodle.server.routing.JsEnvHandler
import org.worldcubeassociation.tnoodle.server.routing.StylesheetHandler
import org.worldcubeassociation.tnoodle.server.routing.VersionHandler
import org.worldcubeassociation.tnoodle.server.util.GsonUtil.configureLoaded
import org.worldcubeassociation.tnoodle.server.util.MainLauncher
import org.worldcubeassociation.tnoodle.server.util.MainLauncher.NO_REEXEC_OPT
import org.worldcubeassociation.tnoodle.server.util.ServerCacheConfig
import org.worldcubeassociation.tnoodle.server.util.WebServerUtils.isOSX
import org.worldcubeassociation.tnoodle.server.util.WebServerUtils.openTabInBrowser
import org.worldcubeassociation.tnoodle.server.util.WebServerUtils.setApplicationIcon
import tray.SystemTrayProvider
import tray.java.JavaIconAdapter
import java.awt.*
import javax.swing.ImageIcon
import kotlin.system.exitProcess

class TNoodleServer(val cacheConfig: ServerCacheConfig) : ApplicationHandler {
    val NAME = cacheConfig.projectName
    val VERSION = cacheConfig.version

    override fun spinUp(app: io.ktor.application.Application) {
        cacheConfig.createLocalPruningCache()

        app.routing {
            JsEnvHandler.install(this)
            StylesheetHandler.install(this)
            VersionHandler.install(this)
        }

        app.install(ShutDownUrl.ApplicationCallFeature) {
            shutDownUrl = "/kill/now"
            exitCodeSupplier = { 0 }
        }

        app.install(DefaultHeaders) {
            header("Access-Control-Allow-Origin", "*")
        }

        app.install(ContentNegotiation) {
            gson {
                configureLoaded()
            }
        }
    }

    companion object {
        val LOG = LoggerFactory.getLogger(TNoodleServer::class.java)

        const val TNOODLE_PORT = 2014

        const val MIN_HEAP_SIZE_MEGS = 512

        const val ICONS_FOLDER = "icons"

        const val ICON_WORKER = "tnoodle_logo_1024.png"
        const val ICON_WRAPPER = "tnoodle_logo_1024_gray.png"

        @JvmStatic
        fun main(args: Array<String>) {
            val parser = ArgParser(args)

            val desiredJsEnv by parser.adding("--jsenv", help = "Add entry to global js object TNOODLE_ENV in /env.js. Treated as strings, so FOO=42 will create the entry TNOODLE_ENV['FOO'] = '42';")

            val noBrowser by parser.flagging("-n", "--nobrowser", help = "Don't open the browser when starting the server")
            // val noUpgrade by parser.flagging("-u", "--noupgrade", help = "If an instance of $NAME is running on the desired port(s), do not attempt to kill it and start up")
            val noReexec by parser.flagging(NO_REEXEC_OPT, help = "Do not reexec. This is sometimes done to rename java.exe on Windows, or to get a larger heap size.")

            setApplicationIcon()

            if (!noReexec) {
                MainLauncher.wrapMain(args, MIN_HEAP_SIZE_MEGS)

                // This second call to setApplicationIcon() is intentional.
                // We want different icons for the parent and child processes.
                setApplicationIcon()
            }

            for (jsEnv in desiredJsEnv) {
                val (key, strValue) = jsEnv.split("=", limit = 2)
                JsEnvHandler.putJsEnv(key, strValue)
            }

            val cliEnv = commandLineEnvironment(args)
            embeddedServer(Netty, cliEnv).start()

            LOG.info("$NAME-$VERSION started")

            val url = openTabInBrowser(!noBrowser)
            LOG.info("Visit $url for a readme and demo.")
        }
    }
}
