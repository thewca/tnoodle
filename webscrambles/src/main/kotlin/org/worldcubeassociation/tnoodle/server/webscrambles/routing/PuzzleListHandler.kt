package org.worldcubeassociation.tnoodle.server.webscrambles.routing

import io.ktor.application.call
import io.ktor.response.respond
import io.ktor.response.respondText
import io.ktor.routing.Routing
import io.ktor.routing.get
import org.worldcubeassociation.tnoodle.server.RouteHandler
import org.worldcubeassociation.tnoodle.server.RouteHandler.Companion.splitNameAndExtension
import org.worldcubeassociation.tnoodle.server.webscrambles.PuzzlePlugins
import org.worldcubeassociation.tnoodle.server.webscrambles.serial.PuzzleInfoJsonData

object PuzzleListHandler : RouteHandler {
    private fun getPuzzleInfo(scramblerKey: String, includeStatus: Boolean): PuzzleInfoJsonData? {
        val plugin = PuzzlePlugins.WCA_PUZZLES[scramblerKey] ?: return null

        val nameData = PuzzleInfoJsonData(scramblerKey, plugin.description)

        if (includeStatus) {
            return nameData.copy(initializationStatus = plugin.scrambler.initializationStatus)
        }

        return nameData
    }

    override fun install(router: Routing) {
        router.get("/puzzles/{filename}") {
            val includeStatus = call.request.queryParameters["includeStatus"] != null

            val fileName = call.parameters["filename"]!!
            val (puzzleName, fileExt) = splitNameAndExtension(fileName)

            if (fileExt == "json") {
                if (puzzleName.isBlank()) {
                    val puzzleInfos = PuzzlePlugins.WCA_PUZZLES.keys
                        .mapNotNull { getPuzzleInfo(it, includeStatus) }

                    call.respond(puzzleInfos)
                } else {
                    val puzzleInfo = getPuzzleInfo(puzzleName, includeStatus)
                        ?: return@get call.respondText("Invalid scrambler: $puzzleName")

                    call.respond(puzzleInfo)
                }
            } else {
                call.respond("Invalid extension: $fileExt")
            }
        }
    }
}
