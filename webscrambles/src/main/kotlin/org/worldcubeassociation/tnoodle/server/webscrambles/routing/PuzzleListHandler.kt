package org.worldcubeassociation.tnoodle.server.webscrambles.routing

import io.ktor.application.ApplicationCall
import io.ktor.application.call
import io.ktor.response.respond
import io.ktor.response.respondText
import io.ktor.routing.Routing
import io.ktor.routing.get
import io.ktor.routing.route
import org.worldcubeassociation.tnoodle.server.RouteHandler
import org.worldcubeassociation.tnoodle.server.webscrambles.PuzzlePlugins
import org.worldcubeassociation.tnoodle.server.webscrambles.serial.PuzzleInfoJsonData

object PuzzleListHandler : RouteHandler {
    private fun getPuzzleInfo(scramblerKey: String, includeStatus: Boolean): PuzzleInfoJsonData? {
        val plugin = PuzzlePlugins.WCA_PUZZLES[scramblerKey] ?: return null

        val nameData = PuzzleInfoJsonData(scramblerKey, plugin.description)

        if (includeStatus) {
            return nameData.copy(
                initializationStatus = plugin.scrambler.initializationStatus,
                cacheQueue = plugin.cacheSize)
        }

        return nameData
    }

    private suspend fun ApplicationCall.respondPuzzles(format: String?, puzzleKeys: Set<String> = emptySet()) {
        val includeStatus = "includeStatus" in request.queryParameters

        if (format == "json") {
            val puzzleInfos = puzzleKeys
                .mapNotNull { getPuzzleInfo(it, includeStatus) }

            val responseItem = puzzleInfos.singleOrNull()
                ?: puzzleInfos

            respond(responseItem)
        } else {
            respondText("Invalid extension: $format")
        }
    }

    override fun install(router: Routing) {
        router.route("puzzles") {
            // FIXME ktor apparently has a problem with {optional?} parameters in the middle of a route.
            // therefore this code is currently effectively duplicated.
            get("{puzzleKey}/{format}") {
                val format = call.parameters["format"]
                val puzzleKey = call.parameters["puzzleKey"].orEmpty()

                call.respondPuzzles(format, setOf(puzzleKey))
            }

            get("{format}") {
                val format = call.parameters["format"]

                call.respondPuzzles(format, PuzzlePlugins.WCA_PUZZLES.keys)
            }
        }
    }
}
