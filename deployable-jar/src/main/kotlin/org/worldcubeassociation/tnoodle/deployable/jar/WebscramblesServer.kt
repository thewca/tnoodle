package org.worldcubeassociation.tnoodle.deployable.jar

import com.xenomachina.argparser.ArgParser
import com.xenomachina.argparser.default
import io.ktor.server.application.*
import io.ktor.server.netty.*
import io.ktor.server.engine.CommandLineConfig
import io.ktor.server.engine.embeddedServer
import io.ktor.server.engine.loadCommonConfiguration
import io.ktor.server.routing.*
import org.slf4j.LoggerFactory
import org.worldcubeassociation.tnoodle.server.ApplicationHandler
import org.worldcubeassociation.tnoodle.server.TNoodleServer
import org.worldcubeassociation.tnoodle.server.ServerEnvironmentConfig
import org.worldcubeassociation.tnoodle.deployable.jar.config.LocalServerEnvironmentConfig
import org.worldcubeassociation.tnoodle.deployable.jar.routing.HomepageHandler
import org.worldcubeassociation.tnoodle.deployable.jar.routing.IconHandler
import org.worldcubeassociation.tnoodle.deployable.jar.routing.ReadmeHandler
import org.worldcubeassociation.tnoodle.deployable.jar.routing.StaticResourceHandler
import org.worldcubeassociation.tnoodle.deployable.jar.server.MainLauncher.NO_REEXEC_OPT
import org.worldcubeassociation.tnoodle.deployable.jar.server.MainLauncher
import org.worldcubeassociation.tnoodle.deployable.jar.server.OfflineJarUtils
import java.io.IOException
import java.net.URI

class WebscramblesServer(environmentConfig: ServerEnvironmentConfig) : ApplicationHandler {
    private val baseServer = TNoodleServer(environmentConfig)

    override fun spinUp(app: Application) {
        app.routing {
            HomepageHandler.install(this)
            IconHandler.install(this)
            ReadmeHandler.install(this)
            StaticResourceHandler.install(this)
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
            val noIconBar by parser.flagging("-b", "--noiconbar", help = "Don't add an icon to the system bar")
            val noUpgrade by parser.flagging("-u", "--noupgrade", help = "If an instance of TNoodle is running on the desired port(s), do not attempt to kill it and start up")
            val noReexec by parser.flagging(NO_REEXEC_OPT, help = "Do not reexec. This is sometimes done to rename java.exe on Windows, or to get a larger heap size.")

            val onlineModeEnv = System.getenv("REACT_APP_TNOODLE_ONLINE_MODE")
            val isEnvOnlineMode = onlineModeEnv != null && onlineModeEnv.isNotEmpty()

            val isCliOnlineMode by parser.flagging("-o", "--online", help = "Change configuration for online mode. This will override port bindings and sun.awt.fontconfig")

            val isOnlineMode = isCliOnlineMode || isEnvOnlineMode

            val port = System.getenv("PORT")?.takeIf { isOnlineMode }?.toIntOrNull() ?: cliPort
            val offlineHandler = OfflineJarUtils(port)

            val isWrapped = if (!noReexec) {
                MainLauncher.wrapMain(args, MIN_HEAP_SIZE_MEGS)
            } else false

            if (!noIconBar) {
                offlineHandler.setApplicationIcon(isWrapped)
            }

            if (!noUpgrade) {
                try {
                    val shutdownMaybe = URI("${offlineHandler.url}${TNoodleServer.KILL_URL}").toURL().openStream()
                    shutdownMaybe.close()
                } catch (ignored: IOException) {
                    // NOOP. This means we couldn't connect to localhost:$PORT
                    // in which case the shutdown attempt is unnecessary anyways.
                }
            }

            LOG.info("${LocalServerEnvironmentConfig.title} started${if (isOnlineMode) " in online mode" else ""}")

            // ktor specifically requires ONE dash, but our parsing library specifically requires TWO dashes
            val ktorArgs = args + arrayOf("-port=$port")
            val cliConfig = CommandLineConfig(ktorArgs)

            embeddedServer(
                factory = Netty,
                environment = cliConfig.environment,
                configure = {
                    takeFrom(cliConfig.engineConfig)
                    loadCommonConfiguration(cliConfig.environment.config)
                },
            ).start(wait = noIconBar)

            if (!noBrowser) {
                offlineHandler.openTabInBrowser()
            } else {
                LOG.info("Visit ${offlineHandler.url} for a readme and demo.")
            }
        }
    }
}
