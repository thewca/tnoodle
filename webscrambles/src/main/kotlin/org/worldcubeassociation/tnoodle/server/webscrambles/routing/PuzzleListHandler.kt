package org.worldcubeassociation.tnoodle.server.webscrambles.routing

import io.ktor.application.call
import io.ktor.response.respond
import io.ktor.response.respondText
import io.ktor.routing.Routing
import io.ktor.routing.get
import org.worldcubeassociation.tnoodle.scrambles.Puzzle
import org.worldcubeassociation.tnoodle.server.RouteHandler
import org.worldcubeassociation.tnoodle.server.RouteHandler.Companion.splitNameAndExtension
import org.worldcubeassociation.tnoodle.server.webscrambles.PuzzlePlugins
import org.worldcubeassociation.tnoodle.server.webscrambles.serial.PuzzleInfoJsonData

object PuzzleListHandler : RouteHandler {
    private fun getPuzzleInfo(scrambler: Puzzle, includeStatus: Boolean): PuzzleInfoJsonData {
        val nameData = PuzzleInfoJsonData(scrambler.shortName, PuzzlePlugins.getScramblerLongName(scrambler.shortName))

        if (includeStatus) {
            return nameData.copy(initializationStatus = scrambler.initializationStatus)
        }

        return nameData
    }

    override fun install(router: Routing) {
        router.get("/puzzles/{filename}") {
            val includeStatus = call.request.queryParameters["includeStatus"] != null

            val fileName = call.parameters["filename"]!!
            val (puzzleName, fileExt) = splitNameAndExtension(fileName)

            val scramblers = PuzzlePlugins.PUZZLES

            if (fileExt == "json") {
                if (puzzleName.isBlank()) {
                    val puzzleInfos = scramblers.values
                        .map { getPuzzleInfo(it.value, includeStatus) }

                    call.respond(puzzleInfos)
                } else {
                    val cachedPuzzle by scramblers[puzzleName]
                        ?: return@get call.respondText("Invalid scrambler: $puzzleName")

                    val puzzleInfo = getPuzzleInfo(cachedPuzzle, includeStatus)

                    call.respond(puzzleInfo)
                }
            } else {
                call.respond("Invalid extension: $fileExt")
            }
        }
    }
}
