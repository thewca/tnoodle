package org.worldcubeassociation.tnoodle.server.cloudscrambles.routing

import io.ktor.application.ApplicationCall
import io.ktor.application.call
import io.ktor.response.respond
import io.ktor.response.respondText
import io.ktor.routing.Route
import io.ktor.routing.get
import io.ktor.routing.route
import org.worldcubeassociation.tnoodle.server.RouteHandler
import org.worldcubeassociation.tnoodle.server.cloudscrambles.serial.PuzzleInfoJsonData
import org.worldcubeassociation.tnoodle.server.plugins.PuzzlePlugins

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

    private suspend fun ApplicationCall.withPuzzleData(puzzleKeys: Set<String>, handle: suspend ApplicationCall.(List<PuzzleInfoJsonData>) -> Unit) {
        val includeStatus = "includeStatus" in request.queryParameters

        val puzzleInfos = puzzleKeys
            .mapNotNull { getPuzzleInfo(it, includeStatus) }

        handle(puzzleInfos)
    }

    override fun install(router: Route) {
        router.route("puzzles") {
            get {
                call.withPuzzleData(PuzzlePlugins.WCA_PUZZLES.keys) {
                    respond(it)
                }
            }

            get("{puzzleKey}") {
                val puzzleKey = call.parameters["puzzleKey"].orEmpty()

                call.withPuzzleData(setOf(puzzleKey)) {
                    val singleItem = it.singleOrNull()
                        ?: return@withPuzzleData respondText("Invalid puzzle ID: $puzzleKey")

                    respond(singleItem)
                }
            }
        }
    }
}
