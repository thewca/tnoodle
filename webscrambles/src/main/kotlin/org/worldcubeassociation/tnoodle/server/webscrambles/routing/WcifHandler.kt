package org.worldcubeassociation.tnoodle.server.webscrambles.routing

import io.ktor.application.ApplicationCall
import io.ktor.application.call
import io.ktor.http.ContentType
import io.ktor.request.receive
import io.ktor.request.uri
import io.ktor.response.respond
import io.ktor.response.respondBytes
import io.ktor.routing.Routing
import io.ktor.routing.post
import org.worldcubeassociation.tnoodle.server.RouteHandler
import org.worldcubeassociation.tnoodle.server.util.ServerEnvironmentConfig
import org.worldcubeassociation.tnoodle.server.webscrambles.serial.WcifScrambleRequest
import org.worldcubeassociation.tnoodle.server.webscrambles.wcif.WCIFDataBuilder
import org.worldcubeassociation.tnoodle.server.webscrambles.wcif.WCIFScrambleMatcher
import org.worldcubeassociation.tnoodle.server.webscrambles.wcif.model.Competition
import java.time.LocalDateTime

class WcifHandler(val environmentConfig: ServerEnvironmentConfig) : RouteHandler {
    private suspend fun ApplicationCall.yieldScrambledWcif(suspendRequest: WcifScrambleRequest? = null): Competition {
        // suspend fn not supported as default argument…
        val request = suspendRequest ?: this.receive()

        val wcif = request.wcif

        val optionalExtensions = listOfNotNull(
            request.multiCubes?.to("333mbf"),
            request.fmcLanguages?.to("333fm")
        ).toMap()

        val extendedWcif = WCIFScrambleMatcher.installExtensions(wcif, optionalExtensions)
        return WCIFScrambleMatcher.fillScrambleSets(extendedWcif)
    }

    override fun install(router: Routing) {
        router.post("/wcif/scrambles") {
            val wcif = call.yieldScrambledWcif()
            call.respond(wcif)
        }

        router.post("/wcif/zip") {
            val generationDate = LocalDateTime.now()
            val wcifRequest = call.receive<WcifScrambleRequest>()

            val wcif = call.yieldScrambledWcif(wcifRequest)

            val pdfPassword = wcifRequest.pdfPassword
            val zip = WCIFDataBuilder.wcifToZip(wcif, pdfPassword, generationDate, environmentConfig.projectTitle, call.request.uri)

            val zipPassword = wcifRequest.zipPassword
            val bytes = zip.compress(zipPassword)

            call.respondBytes(bytes, ContentType.Application.Zip)
        }
    }
}
