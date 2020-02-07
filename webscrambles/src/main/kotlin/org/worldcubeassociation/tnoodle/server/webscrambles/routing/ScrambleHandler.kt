package org.worldcubeassociation.tnoodle.server.webscrambles.routing

import io.ktor.application.call
import io.ktor.http.ContentType
import io.ktor.request.uri
import io.ktor.response.header
import io.ktor.response.respond
import io.ktor.response.respondBytes
import io.ktor.response.respondText
import io.ktor.routing.Routing
import io.ktor.routing.get
import org.worldcubeassociation.tnoodle.server.RouteHandler
import org.worldcubeassociation.tnoodle.server.RouteHandler.Companion.parseQuery
import org.worldcubeassociation.tnoodle.server.RouteHandler.Companion.splitNameAndExtension
import org.worldcubeassociation.tnoodle.server.util.ServerEnvironmentConfig
import org.worldcubeassociation.tnoodle.server.webscrambles.InvalidScrambleRequestException
import org.worldcubeassociation.tnoodle.server.webscrambles.ScrambleRequest
import org.worldcubeassociation.tnoodle.server.webscrambles.wcif.WCIFBuilder
import org.worldcubeassociation.tnoodle.server.webscrambles.wcif.WCIFBindingGenerator
import java.time.LocalDateTime

class ScrambleHandler(val environmentConfig: ServerEnvironmentConfig) : RouteHandler {
    override fun install(router: Routing) {
        router.get("/scramble/{filename}") {
            val filename = call.parameters["filename"]!!

            val generationDate = LocalDateTime.now()

            val queryStr = call.request.uri.substringAfter('?', "")
            val query = parseQuery(queryStr).toMutableMap()

            // TODO - this means you can't have a round named "seed" or "showIndices" or "callback" or "generationUrl"!
            val seed = query.remove("seed")
            val generationUrl = query.remove("generationUrl")
            val showIndicesTag = query.remove("showIndices") ?: "0"

            val showIndices = showIndicesTag == "1"

            // FIXME why do we blindly remove this?
            query.remove("callback")

            val (title, extension) = splitNameAndExtension(filename)

            if (extension.isEmpty()) {
                throw InvalidScrambleRequestException("No extension specified")
            }

            if (query.isEmpty()) {
                throw InvalidScrambleRequestException("Must specify at least one scramble request")
            }

            val scrambleRequests = query.map { (title, reqUrl) ->
                ScrambleRequest.parseScrambleRequest(title, reqUrl, seed)
            }

            val wcif = WCIFBindingGenerator.requestsToPseudoWCIF(scrambleRequests)

            when (extension) {
                "txt" -> {
                    val sb = StringBuilder()
                    for (scrambleRequest in scrambleRequests) {
                        repeat(scrambleRequest.copies) {
                            for ((i, scramble) in scrambleRequest.scrambles.withIndex()) {
                                if (showIndices) {
                                    sb.append(i + 1).append(". ")
                                }

                                // We replace newlines with spaces
                                sb.append(scramble.replace("\n".toRegex(), " "))
                                sb.append("\r\n")
                            }
                        }
                    }

                    call.respondText(sb.toString())
                }
                "json" -> call.respond(scrambleRequests)
                "pdf" -> {
                    val totalPdfOutput = WCIFBuilder.wcifToCompletePdf(wcif, generationDate.toLocalDate(), environmentConfig.projectTitle)
                    call.response.header("Content-Disposition", "inline")

                    // Workaround for Chrome bug with saving PDFs:
                    //  https://bugs.chromium.org/p/chromium/issues/detail?id=69677#c35
                    call.response.header("Cache-Control", "public")

                    call.respondBytes(totalPdfOutput.render(), ContentType.Application.Pdf)
                }
                "zip" -> {
                    val modelZip = WCIFBuilder.wcifToZip(wcif, null, generationDate, environmentConfig.projectTitle, generationUrl.orEmpty())
                    val baosZip = modelZip.compress()

                    call.respondBytes(baosZip, ContentType.Application.Zip)
                }
                else -> throw InvalidScrambleRequestException("Invalid extension: $extension")
            }
        }
    }
}
