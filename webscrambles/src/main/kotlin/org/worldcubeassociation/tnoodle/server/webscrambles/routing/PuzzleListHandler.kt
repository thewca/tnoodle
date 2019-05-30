package org.worldcubeassociation.tnoodle.server.webscrambles.routing

import io.ktor.application.call
import io.ktor.response.respond
import io.ktor.response.respondText
import io.ktor.routing.Routing
import io.ktor.routing.get
import net.gnehzr.tnoodle.scrambles.Puzzle
import org.worldcubeassociation.tnoodle.server.RouteHandler
import org.worldcubeassociation.tnoodle.server.webscrambles.PuzzlePlugins

object PuzzleListHandler : RouteHandler {
    private val puzzleInfoByShortName: Map<String, Map<String, String>>

    private val puzzleInfos: List<Map<String, String?>>

    init {
        val scramblers = PuzzlePlugins.PUZZLES

        puzzleInfos = scramblers.keys.map {
            mapOf(
                "shortName" to it,
                "longName" to PuzzlePlugins.getScramblerLongName(it)!!
            )
        }

        puzzleInfoByShortName = puzzleInfos.associateBy { it["shortName"]!! }
    }

    private fun getPuzzleInfo(scrambler: Puzzle, includeStatus: Boolean): Map<String, Any> {
        val info: Map<String, Any> = puzzleInfoByShortName[scrambler.shortName]!!

        // info is unmodifiable, so we copy it
        return info.toMutableMap().apply {
            if (includeStatus) {
                this["initializationStatus"] = scrambler.initializationStatus
            }
        }
    }

    override fun install(router: Routing) {
        router.get("/puzzles/{puzzleExt}") {
            val includeStatus = call.request.queryParameters["includeStatus"] != null

            val puzzleExt = call.parameters["puzzleExt"]!!

            val (puzzle, extension) = puzzleExt.split(".", limit = 2)

            if (extension.isEmpty()) {
                return@get call.respondText("Please specify an extension")
            }

            val scramblers = PuzzlePlugins.PUZZLES

            if (extension == "json") {
                if (puzzle == "") {
                    val puzzleInfosWithStatus = puzzleInfos
                        .map { scramblers[it["shortName"]]!! }
                        .map { getPuzzleInfo(it, includeStatus) }

                    call.respond(puzzleInfosWithStatus)
                } else {
                    val cachedPuzzle = scramblers[puzzle] ?: return@get call.respondText("Invalid scrambler: $puzzle")
                    val puzzleInfo = getPuzzleInfo(cachedPuzzle, includeStatus)

                    call.respond(puzzleInfo)
                }
            } else {
                call.respond("Invalid extension: $extension")
            }
        }
    }
}
