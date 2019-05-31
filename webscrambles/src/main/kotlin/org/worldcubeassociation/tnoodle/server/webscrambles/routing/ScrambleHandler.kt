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
import org.worldcubeassociation.tnoodle.server.webscrambles.InvalidScrambleRequestException
import org.worldcubeassociation.tnoodle.server.webscrambles.ScrambleRequest

import java.util.Date

object ScrambleHandler : RouteHandler {
    override fun install(router: Routing) {
        router.get("/scramble/{filename}") {
            val filename = call.parameters["filename"]!!

            val generationDate = Date()

            val queryStr = call.request.uri.substringAfter('?', "")
            val query = parseQuery(queryStr).toMutableMap()

            // TODO - this means you can't have a round named "seed" or "showIndices" or "callback" or "generationUrl"!
            val seed = query.remove("seed")
            val generationUrl = query.remove("generationUrl")
            val showIndicesTag = query.remove("showIndices") ?: "0"

            val showIndices = showIndicesTag == "1"

            // FIXME why do we blindly remove this?
            query.remove("callback")

            val (title, extension) = filename.split(".", limit = 2)

            if (extension.isEmpty()) {
                throw InvalidScrambleRequestException("No extension specified")
            }

            val scrambleRequests = ScrambleRequest.parseScrambleRequests(query, seed)

            when (extension) {
                "txt" -> {
                    val sb = StringBuilder()
                    for (scrambleRequest in scrambleRequests) {
                        for (j in 0 until scrambleRequest.copies) {
                            for (i in scrambleRequest.scrambles.indices) {
                                val scramble = scrambleRequest.scrambles[i]

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
                    val totalPdfOutput = ScrambleRequest.requestsToCompletePdf(title, generationDate, scrambleRequests)
                    call.response.header("Content-Disposition", "inline")

                    // Workaround for Chrome bug with saving PDFs:
                    //  https://bugs.chromium.org/p/chromium/issues/detail?id=69677#c35
                    call.response.header("Cache-Control", "public")

                    call.respondBytes(totalPdfOutput.render(), ContentType.Application.Pdf)
                }
                "zip" -> {
                    val baosZip = ScrambleRequest.requestsToZip(title, generationDate, scrambleRequests, seed, generationUrl, null)

                    call.respondBytes(baosZip.toByteArray(), ContentType.Application.Zip)
                }
                else -> throw InvalidScrambleRequestException("Invalid extension: $extension")
            }
        }
    }
}
