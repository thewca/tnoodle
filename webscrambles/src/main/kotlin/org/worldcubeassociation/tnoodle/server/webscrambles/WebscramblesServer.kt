package org.worldcubeassociation.tnoodle.server.webscrambles

import com.xenomachina.argparser.ArgParser
import io.ktor.application.Application
import io.ktor.routing.routing
import io.ktor.server.engine.commandLineEnvironment
import io.ktor.server.engine.embeddedServer
import io.ktor.server.netty.Netty
import kotlinx.io.IOException
import org.slf4j.LoggerFactory
import org.worldcubeassociation.tnoodle.server.ApplicationHandler
import org.worldcubeassociation.tnoodle.server.TNoodleServer
import org.worldcubeassociation.tnoodle.server.routing.JsEnvHandler
import org.worldcubeassociation.tnoodle.server.util.ServerEnvironmentConfig
import org.worldcubeassociation.tnoodle.server.webscrambles.server.MainLauncher.NO_REEXEC_OPT
import org.worldcubeassociation.tnoodle.server.webscrambles.routing.*
import org.worldcubeassociation.tnoodle.server.webscrambles.routing.job.JobSchedulingHandler
import org.worldcubeassociation.tnoodle.server.webscrambles.server.LocalServerEnvironmentConfig
import org.worldcubeassociation.tnoodle.server.webscrambles.server.MainLauncher
import org.worldcubeassociation.tnoodle.server.webscrambles.server.OfflineJarUtils
import java.net.URL

class WebscramblesServer(val environmentConfig: ServerEnvironmentConfig) : ApplicationHandler {
    private val baseServer = TNoodleServer(environmentConfig)

    override fun spinUp(app: Application) {
        val wcifHandler = WcifHandler(environmentConfig)

        app.routing {
            PuzzleListHandler.install(this)
            RouteRedirectHandler.install(this)
            ScrambleHandler.install(this)
            ReadmeHandler.install(this)
            ScrambleViewHandler.install(this)
            StaticContentHandler.install(this)
            wcifHandler.install(this)
            WcifDataHandler.install(this)
            JobSchedulingHandler.install(this)
            FrontendDataHandler.install(this)
        }

        baseServer.spinUp(app)
    }

    companion object {
        const val MIN_HEAP_SIZE_MEGS = 512

        val LOG = LoggerFactory.getLogger(WebscramblesServer::class.java)

        fun spinUpLocally(app: Application) =
            WebscramblesServer(LocalServerEnvironmentConfig).spinUp(app)

        @JvmStatic
        fun main(args: Array<String>) {
            val parser = ArgParser(args)

            val desiredJsEnv by parser.adding("--jsenv", help = "Add entry to global js object TNOODLE_ENV in /env.js. Treated as strings, so FOO=42 will create the entry TNOODLE_ENV['FOO'] = '42';")

            val noBrowser by parser.flagging("-n", "--nobrowser", help = "Don't open the browser when starting the server")
            val noUpgrade by parser.flagging("-u", "--noupgrade", help = "If an instance of TNoodle is running on the desired port(s), do not attempt to kill it and start up")
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

            if (!noUpgrade) {
                try {
                    val shutdownMaybe = URL("http://localhost:2014${TNoodleServer.KILL_URL}").openStream()
                    shutdownMaybe.close()
                } catch (ignored: IOException) {
                    // NOOP. This means we couldn't connect to localhost:2014
                    // in which case the shutdown attempt is unnecessary anyways.
                }
            }

            val cliEnv = commandLineEnvironment(args)
            embeddedServer(Netty, cliEnv).start()

            LOG.info("${LocalServerEnvironmentConfig.projectTitle} started")

            val url = OfflineJarUtils.openTabInBrowser(!noBrowser)
            LOG.info("Visit $url for a readme and demo.")
        }
    }
}
