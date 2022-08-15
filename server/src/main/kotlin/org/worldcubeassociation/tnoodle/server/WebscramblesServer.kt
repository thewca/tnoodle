package org.worldcubeassociation.tnoodle.server

import com.xenomachina.argparser.ArgParser
import com.xenomachina.argparser.default
import io.ktor.http.HttpStatusCode
import io.ktor.server.application.*
import io.ktor.server.engine.commandLineEnvironment
import io.ktor.server.engine.embeddedServer
import io.ktor.server.netty.Netty
import io.ktor.server.plugins.statuspages.*
import io.ktor.server.routing.*
import io.ktor.server.websocket.*
import kotlinx.serialization.SerializationException
import org.slf4j.LoggerFactory
import org.worldcubeassociation.tnoodle.core.ApplicationHandler
import org.worldcubeassociation.tnoodle.core.TNoodleServer
import org.worldcubeassociation.tnoodle.core.ServerEnvironmentConfig
import org.worldcubeassociation.tnoodle.core.routing.JsEnvHandler
import org.worldcubeassociation.tnoodle.core.model.wcif.exception.BadWcifParameterException
import org.worldcubeassociation.tnoodle.server.exception.ScheduleMatchingException
import org.worldcubeassociation.tnoodle.server.exception.ScrambleMatchingException
import org.worldcubeassociation.tnoodle.server.exception.TranslationException
import org.worldcubeassociation.tnoodle.server.routing.*
import org.worldcubeassociation.tnoodle.server.routing.frontend.ApplicationDataHandler
import org.worldcubeassociation.tnoodle.server.routing.frontend.WcifDataHandler
import org.worldcubeassociation.tnoodle.server.routing.job.JobSchedulingHandler
import org.worldcubeassociation.tnoodle.server.routing.statics.HomepageHandler
import org.worldcubeassociation.tnoodle.server.routing.statics.ReadmeHandler
import org.worldcubeassociation.tnoodle.server.routing.statics.StaticResourceHandler
import org.worldcubeassociation.tnoodle.server.serial.FrontendErrorMessage.Companion.frontendException
import org.worldcubeassociation.tnoodle.server.util.JvmUtil
import org.worldcubeassociation.tnoodle.server.util.UserInteractionUtil
import java.io.IOException
import java.net.URI
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
            }

            route("jobs") {
                JobSchedulingHandler.install(this)
            }

            HomepageHandler.install(this)
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
            WebscramblesServer(LocalServerEnvironmentConfig()).spinUp(app)

        @JvmStatic
        fun main(args: Array<String>) {
            val parser = ArgParser(args)

            val desiredJsEnv by parser.adding("--jsenv", help = "Add entry to global js object TNOODLE_ENV in /env.js. Treated as strings, so FOO=42 will create the entry TNOODLE_ENV['FOO'] = '42';")

            val cliPort by parser.storing("-p", "--port", help = "Start TNoodle on given port. Should be numeric. Defaults to ${LocalServerEnvironmentConfig.TNOODLE_PORT}", transform = String::toInt)
                .default(LocalServerEnvironmentConfig.TNOODLE_PORT)

            val noBrowser by parser.flagging("-n", "--nobrowser", help = "Don't open the browser when starting the server")
            val noUpgrade by parser.flagging("-u", "--noupgrade", help = "If an instance of TNoodle is running on the desired port(s), do not attempt to kill it and start up")
            val noReexec by parser.flagging(JvmUtil.NO_REEXEC_OPT, help = "Do not reexec. This is sometimes done to rename java.exe on Windows, or to get a larger heap size.")
            val onlineConfig by parser.flagging("-o", "--online", help = "Change configuration for online mode. This will override port bindings and sun.awt.fontconfig")

            val port = System.getenv("PORT")?.takeIf { onlineConfig }?.toIntOrNull() ?: cliPort
            val offlineConfig = LocalServerEnvironmentConfig(port)

            val isWrapped = noReexec || JvmUtil.wrapMain(args, MIN_HEAP_SIZE_MEGS)

            UserInteractionUtil.setApplicationIcon(offlineConfig, isWrapped)

            for (jsEnv in desiredJsEnv) {
                val (key, strValue) = jsEnv.split("=", limit = 2)
                JsEnvHandler.putJsEnv(key, strValue)
            }

            if (!noUpgrade) {
                try {
                    val shutdownMaybe = URL("${offlineConfig.url}${TNoodleServer.KILL_URL}").openStream()
                    shutdownMaybe.close()
                } catch (ignored: IOException) {
                    // NOOP. This means we couldn't connect to localhost:$PORT
                    // in which case the shutdown attempt is unnecessary anyways.
                }
            }

            // ktor specifically requires ONE dash, but our parsing library specifically requires TWO dashes
            val ktorArgs = args + arrayOf("-port=$port")

            val cliEnv = commandLineEnvironment(ktorArgs)
            embeddedServer(Netty, cliEnv).start()

            LOG.info("${offlineConfig.title} started")

            if (!noBrowser) {
                UserInteractionUtil.openTabInBrowser(URI(offlineConfig.url))
            } else {
                LOG.info("Visit ${offlineConfig.url} for a readme and demo.")
            }
        }
    }
}
