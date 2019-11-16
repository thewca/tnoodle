package org.worldcubeassociation.tnoodle.server.webscrambles

import com.xenomachina.argparser.ArgParser
import io.ktor.application.Application
import io.ktor.routing.routing
import io.ktor.server.engine.commandLineEnvironment
import io.ktor.server.engine.embeddedServer
import io.ktor.server.netty.Netty
import net.gnehzr.tnoodle.scrambles.Puzzle
import net.gnehzr.tnoodle.scrambles.PuzzleImageInfo
import net.gnehzr.tnoodle.svglite.Color
import org.slf4j.LoggerFactory
import org.worldcubeassociation.tnoodle.server.ApplicationHandler
import org.worldcubeassociation.tnoodle.server.TNoodleServer
import org.worldcubeassociation.tnoodle.server.routing.JsEnvHandler
import org.worldcubeassociation.tnoodle.server.util.GsonUtil
import org.worldcubeassociation.tnoodle.server.util.ServerCacheConfig
import org.worldcubeassociation.tnoodle.server.webscrambles.server.MainLauncher.NO_REEXEC_OPT
import org.worldcubeassociation.tnoodle.server.webscrambles.gson.Colorizer
import org.worldcubeassociation.tnoodle.server.webscrambles.gson.PuzzleImageInfoizer
import org.worldcubeassociation.tnoodle.server.webscrambles.gson.Puzzlerizer
import org.worldcubeassociation.tnoodle.server.webscrambles.routing.*
import org.worldcubeassociation.tnoodle.server.webscrambles.server.LocalServerCacheConfig
import org.worldcubeassociation.tnoodle.server.webscrambles.server.MainLauncher
import org.worldcubeassociation.tnoodle.server.webscrambles.server.OfflineJarUtils

class WebscramblesServer(val cacheConfig: ServerCacheConfig) : ApplicationHandler {
    private val baseServer = TNoodleServer(cacheConfig)

    override fun spinUp(app: Application) {
        GsonUtil.registerTypeAdapter(Color::class.java, Colorizer())
        GsonUtil.registerTypeAdapter(PuzzleImageInfo::class.java, PuzzleImageInfoizer())

        GsonUtil.registerTypeHierarchyAdapter(Puzzle::class.java, Puzzlerizer())

        val scrambleHandler = ScrambleHandler(cacheConfig)
        val scrambleViewHandler = ScrambleViewHandler(cacheConfig)

        app.routing {
            PuzzleListHandler.install(this)
            RouteRedirectHandler.install(this)
            scrambleHandler.install(this)
            ScrambleImporterHandler.install(this)
            ReadmeHandler.install(this)
            scrambleViewHandler.install(this)
            StaticContentHandler.install(this)
        }

        baseServer.spinUp(app)
    }

    companion object {
        const val MIN_HEAP_SIZE_MEGS = 512

        val LOG = LoggerFactory.getLogger(WebscramblesServer::class.java)

        @JvmStatic
        fun main(args: Array<String>) {
            val parser = ArgParser(args)

            val desiredJsEnv by parser.adding("--jsenv", help = "Add entry to global js object TNOODLE_ENV in /env.js. Treated as strings, so FOO=42 will create the entry TNOODLE_ENV['FOO'] = '42';")

            val noBrowser by parser.flagging("-n", "--nobrowser", help = "Don't open the browser when starting the server")
            // val noUpgrade by parser.flagging("-u", "--noupgrade", help = "If an instance of $NAME is running on the desired port(s), do not attempt to kill it and start up")
            val noReexec by parser.flagging(NO_REEXEC_OPT, help = "Do not reexec. This is sometimes done to rename java.exe on Windows, or to get a larger heap size.")

            OfflineJarUtils.setApplicationIcon()

            if (!noReexec) {
                MainLauncher.wrapMain(args, MIN_HEAP_SIZE_MEGS)

                // This second call to setApplicationIcon() is intentional.
                // We want different icons for the parent and child processes.
                OfflineJarUtils.setApplicationIcon()
            }

            for (jsEnv in desiredJsEnv) {
                val (key, strValue) = jsEnv.split("=", limit = 2)
                JsEnvHandler.putJsEnv(key, strValue)
            }

            val cliEnv = commandLineEnvironment(args)
            embeddedServer(Netty, cliEnv).start()

            LOG.info("${LocalServerCacheConfig.projectTitle} started")

            val url = OfflineJarUtils.openTabInBrowser(!noBrowser)
            LOG.info("Visit $url for a readme and demo.")
        }

        fun spinUpLocally(app: Application) =
            WebscramblesServer(LocalServerCacheConfig).spinUp(app)
    }
}
