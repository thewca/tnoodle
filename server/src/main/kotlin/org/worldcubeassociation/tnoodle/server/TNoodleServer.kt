package org.worldcubeassociation.tnoodle.server

import io.ktor.http.*
import io.ktor.serialization.kotlinx.json.*
import io.ktor.server.application.*
import io.ktor.server.engine.ShutDownUrl
import io.ktor.server.plugins.contentnegotiation.*
import io.ktor.server.plugins.cors.routing.*
import io.ktor.server.plugins.defaultheaders.*
import io.ktor.server.plugins.statuspages.*
import io.ktor.server.routing.*
import io.ktor.server.websocket.*
import kotlinx.serialization.SerializationException
import org.worldcubeassociation.tnoodle.server.exceptions.BadWcifParameterException
import org.worldcubeassociation.tnoodle.server.exceptions.ScheduleMatchingException
import org.worldcubeassociation.tnoodle.server.exceptions.ScrambleMatchingException
import org.worldcubeassociation.tnoodle.server.exceptions.TranslationException
import org.worldcubeassociation.tnoodle.server.job.JobSchedulingHandler
import org.worldcubeassociation.tnoodle.server.routing.VersionHandler
import org.worldcubeassociation.tnoodle.server.routing.WcifHandler
import org.worldcubeassociation.tnoodle.server.routing.api.PuzzleListHandler
import org.worldcubeassociation.tnoodle.server.routing.api.ScrambleHandler
import org.worldcubeassociation.tnoodle.server.routing.api.ScrambleViewHandler
import org.worldcubeassociation.tnoodle.server.serial.frontend.FrontendErrorMessage.Companion.frontendException
import org.worldcubeassociation.tnoodle.server.serial.JsonConfig
import org.worldcubeassociation.tnoodle.server.routing.frontend.ApplicationDataHandler
import org.worldcubeassociation.tnoodle.server.routing.frontend.PuzzleDrawingHandler
import org.worldcubeassociation.tnoodle.server.routing.frontend.WcifDataHandler

class TNoodleServer(val environmentConfig: ServerEnvironmentConfig = TNoodleServer) : ApplicationHandler {
    override fun spinUp(app: Application) {
        val versionHandler = VersionHandler(environmentConfig)
        val wcifHandler = WcifHandler(environmentConfig)

        app.install(WebSockets)

        app.routing {
            versionHandler.install(this)
            wcifHandler.install(this)

            route("frontend") {
                ApplicationDataHandler.install(this)
                WcifDataHandler.install(this)
                PuzzleDrawingHandler.install(this)
            }

            route("api") {
                route("v0") {
                    PuzzleListHandler.install(this)
                    ScrambleHandler.install(this)
                    ScrambleViewHandler.install(this)
                }
            }

            route("jobs") {
                JobSchedulingHandler.install(this)
            }
        }

        app.install(StatusPages) {
            frontendException<ScheduleMatchingException>(HttpStatusCode.BadRequest)
            frontendException<ScrambleMatchingException>(HttpStatusCode.BadRequest)
            frontendException<BadWcifParameterException>(HttpStatusCode.BadRequest)

            frontendException<SerializationException>(HttpStatusCode.BadRequest)

            frontendException<TranslationException>(HttpStatusCode.FailedDependency)
        }

        app.install(ShutDownUrl.ApplicationCallPlugin) {
            shutDownUrl = KILL_URL
            exitCodeSupplier = { 0 }
        }

        app.install(DefaultHeaders)

        app.install(CORS) {
            anyHost()
            allowMethod(HttpMethod.Put)
            // gimme dat zesty application/json
            allowNonSimpleContentTypes = true
        }

        app.install(ContentNegotiation) {
            json(json = JsonConfig.SERIALIZER)
        }
    }

    companion object : ServerEnvironmentConfig {
        const val KILL_URL = "/kill/tnoodle/now"

        override val projectName = "TNoodle-BACKEND"
        override val projectVersion = "devel-TEMP"
    }
}
