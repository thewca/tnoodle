package org.worldcubeassociation.tnoodle.server.webscrambles.routing

import io.ktor.application.ApplicationCall
import io.ktor.application.call
import io.ktor.http.ContentType
import io.ktor.request.receiveText
import io.ktor.request.uri
import io.ktor.response.respond
import io.ktor.response.respondBytes
import io.ktor.response.respondText
import io.ktor.routing.Routing
import io.ktor.routing.post
import io.ktor.util.pipeline.PipelineContext
import org.worldcubeassociation.tnoodle.server.RouteHandler
import org.worldcubeassociation.tnoodle.server.RouteHandler.Companion.parseQuery
import org.worldcubeassociation.tnoodle.server.util.ServerEnvironmentConfig
import org.worldcubeassociation.tnoodle.server.webscrambles.wcif.WCIFDataBuilder
import org.worldcubeassociation.tnoodle.server.webscrambles.wcif.WCIFScrambleMatcher
import org.worldcubeassociation.tnoodle.server.webscrambles.wcif.WCIFParser
import org.worldcubeassociation.tnoodle.server.webscrambles.wcif.model.Competition
import java.time.LocalDateTime

class WcifHandler(val environmentConfig: ServerEnvironmentConfig) : RouteHandler {
    private suspend fun PipelineContext<Unit, ApplicationCall>.readQuery(): Map<String, String> {
        val body = call.receiveText()
        return parseQuery(body)
    }

    private suspend fun PipelineContext<Unit, ApplicationCall>.yieldScrambledWcif(suspendQuery: Map<String, String>? = null): Competition? {
        // suspend fn not supported as default argument…
        val query = suspendQuery ?: readQuery()

        val wcifJson = query["wcif"]
            ?: return null.also { call.respond("Please specify a WCIF JSON") }

        val wcif = WCIFParser.parseComplete(wcifJson)

        val extendedWcifStepOne = query["multi-cubes"]?.let {
            val count = it.toIntOrNull()
                ?: return null.also { _ -> call.respondText("Not a valid number: $it") }

            WCIFScrambleMatcher.installMultiCount(wcif, count)
        } ?: wcif

        val extendedWcifStepTwo = query["fmc-languages"]?.let {
            val listing = it.split(",").map(String::trim)
            WCIFScrambleMatcher.installFmcLanguages(extendedWcifStepOne, listing)
        } ?: extendedWcifStepOne

        return WCIFScrambleMatcher.fillScrambleSets(extendedWcifStepTwo)
    }

    override fun install(router: Routing) {
        router.post("/wcif/scrambles") {
            val wcif = yieldScrambledWcif()
                ?: return@post call.respond("Something went wrong during WCIF creation.")

            call.respond(wcif)
        }

        router.post("/wcif/zip") {
            val generationDate = LocalDateTime.now()
            val query = readQuery()

            val wcif = yieldScrambledWcif(query)
                ?: return@post call.respond("Something went wrong during WCIF creation.")

            val pdfPassword = query["pdf-password"]
            val zipPassword = query["zip-password"]

            val zip = WCIFDataBuilder.wcifToZip(wcif, pdfPassword, generationDate, environmentConfig.projectTitle, call.request.uri)
            val bytes = zip.compress(zipPassword)

            call.respondBytes(bytes, ContentType.Application.Zip)
        }
    }
}
