package org.worldcubeassociation.tnoodle.server.webscrambles

import com.xenomachina.argparser.ArgParser
import com.xenomachina.argparser.default
import io.ktor.http.HttpStatusCode
import io.ktor.server.application.*
import io.ktor.server.cio.*
import io.ktor.server.engine.commandLineEnvironment
import io.ktor.server.engine.embeddedServer
import io.ktor.server.plugins.statuspages.*
import io.ktor.server.routing.*
import io.ktor.server.websocket.*
import kotlinx.serialization.SerializationException
import org.slf4j.LoggerFactory
import org.worldcubeassociation.tnoodle.server.ApplicationHandler
import org.worldcubeassociation.tnoodle.server.TNoodleServer
import org.worldcubeassociation.tnoodle.server.ServerEnvironmentConfig
import org.worldcubeassociation.tnoodle.server.webscrambles.config.LocalServerEnvironmentConfig
import org.worldcubeassociation.tnoodle.server.webscrambles.server.MainLauncher.NO_REEXEC_OPT
import org.worldcubeassociation.tnoodle.server.webscrambles.routing.*
import org.worldcubeassociation.tnoodle.server.webscrambles.routing.job.JobSchedulingHandler
import org.worldcubeassociation.tnoodle.server.webscrambles.exceptions.BadWcifParameterException
import org.worldcubeassociation.tnoodle.server.webscrambles.exceptions.ScheduleMatchingException
import org.worldcubeassociation.tnoodle.server.webscrambles.exceptions.ScrambleMatchingException
import org.worldcubeassociation.tnoodle.server.webscrambles.exceptions.TranslationException
import org.worldcubeassociation.tnoodle.server.webscrambles.routing.frontend.ApplicationDataHandler
import org.worldcubeassociation.tnoodle.server.webscrambles.routing.frontend.PuzzleDrawingHandler
import org.worldcubeassociation.tnoodle.server.webscrambles.routing.frontend.WcifDataHandler
import org.worldcubeassociation.tnoodle.server.webscrambles.serial.FrontendErrorMessage.Companion.frontendException
import org.worldcubeassociation.tnoodle.server.webscrambles.server.MainLauncher
import org.worldcubeassociation.tnoodle.server.webscrambles.server.OfflineJarUtils
import java.io.IOException
import java.net.URL

class WebscramblesServer(val environmentConfig: ServerEnvironmentConfig) : ApplicationHandler {
    private val baseServer = TNoodleServer(environmentConfig)

    override fun spinUp(app: Application) {
        val wcifHandler = WcifHandler(environmentConfig)

        app.install(WebSockets)

        app.routing {
            route("frontend") {
                ApplicationDataHandler.install(this)
                WcifDataHandler.install(this)
                PuzzleDrawingHandler.install(this)
            }

            route("jobs") {
                JobSchedulingHandler.install(this)
            }

            HomepageHandler.install(this)
            IconHandler.install(this)
            ReadmeHandler.install(this)
            StaticResourceHandler.install(this)
            wcifHandler.install(this)
        }

        app.install(StatusPages) {
            frontendException<ScheduleMatchingException>(HttpStatusCode.BadRequest)
            frontendException<ScrambleMatchingException>(HttpStatusCode.BadRequest)
            frontendException<BadWcifParameterException>(HttpStatusCode.BadRequest)

            frontendException<SerializationException>(HttpStatusCode.BadRequest)

            frontendException<TranslationException>(HttpStatusCode.FailedDependency)
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

            val cliPort by parser.storing("-p", "--port", help = "Start TNoodle on given port. Should be numeric. Defaults to ${OfflineJarUtils.TNOODLE_PORT}", transform = String::toInt)
                .default(OfflineJarUtils.TNOODLE_PORT)

            val noBrowser by parser.flagging("-n", "--nobrowser", help = "Don't open the browser when starting the server")
            val noUpgrade by parser.flagging("-u", "--noupgrade", help = "If an instance of TNoodle is running on the desired port(s), do not attempt to kill it and start up")
            val noReexec by parser.flagging(NO_REEXEC_OPT, help = "Do not reexec. This is sometimes done to rename java.exe on Windows, or to get a larger heap size.")
            val onlineConfig by parser.flagging("-o", "--online", help = "Change configuration for online mode. This will override port bindings and sun.awt.fontconfig")

            val port = System.getenv("PORT")?.takeIf { onlineConfig }?.toIntOrNull() ?: cliPort
            val offlineHandler = OfflineJarUtils(port)

            val isWrapped = if (!noReexec) {
                MainLauncher.wrapMain(args, MIN_HEAP_SIZE_MEGS)
            } else false

            offlineHandler.setApplicationIcon(isWrapped)

            if (!noUpgrade) {
                try {
                    val shutdownMaybe = URL("${offlineHandler.url}${TNoodleServer.KILL_URL}").openStream()
                    shutdownMaybe.close()
                } catch (ignored: IOException) {
                    // NOOP. This means we couldn't connect to localhost:$PORT
                    // in which case the shutdown attempt is unnecessary anyways.
                }
            }

            // ktor specifically requires ONE dash, but our parsing library specifically requires TWO dashes
            val ktorArgs = args + arrayOf("-port=$port")

            val cliEnv = commandLineEnvironment(ktorArgs)
            embeddedServer(CIO, cliEnv).start()

            LOG.info("${LocalServerEnvironmentConfig.title} started")

            if (!noBrowser) {
                offlineHandler.openTabInBrowser()
            } else {
                LOG.info("Visit ${offlineHandler.url} for a readme and demo.")
            }
        }
    }
}
