package org.worldcubeassociation.tnoodle.server.routing.api

import io.ktor.server.application.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import org.worldcubeassociation.tnoodle.server.RouteHandler
import org.worldcubeassociation.tnoodle.server.serial.api.PuzzleInfoJsonData
import org.worldcubeassociation.tnoodle.server.model.PuzzleData

object PuzzleListHandler : RouteHandler {
    const val PUZZLE_KEY_PARAM = "puzzleKey"

    private fun getPuzzleInfo(scramblerKey: String, includeStatus: Boolean): PuzzleInfoJsonData? {
        val puzzle = PuzzleData.WCA_PUZZLES[scramblerKey] ?: return null

        val nameData = PuzzleInfoJsonData(scramblerKey, puzzle.description)

        if (includeStatus) {
            return nameData.copy(
                initializationStatus = puzzle.scrambler.initializationStatus,
                cacheQueue = puzzle.cacheSize)
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
                call.withPuzzleData(PuzzleData.WCA_PUZZLES.keys) {
                    respond(it)
                }
            }

            get("{$PUZZLE_KEY_PARAM}") {
                val puzzleKey = call.parameters[PUZZLE_KEY_PARAM].orEmpty()

                call.withPuzzleData(setOf(puzzleKey)) {
                    val singleItem = it.singleOrNull()
                        ?: return@withPuzzleData respondText("Invalid puzzle ID: $puzzleKey")

                    respond(singleItem)
                }
            }
        }
    }
}
