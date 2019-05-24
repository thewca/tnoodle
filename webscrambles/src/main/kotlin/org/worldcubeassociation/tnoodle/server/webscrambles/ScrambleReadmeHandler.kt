package org.worldcubeassociation.tnoodle.server.webscrambles

import io.ktor.application.call
import io.ktor.response.respondText
import io.ktor.routing.Routing
import io.ktor.routing.get
import org.worldcubeassociation.tnoodle.server.RouteHandler
import org.worldcubeassociation.tnoodle.server.RouteHandler.Companion.markdownToHTML

import java.io.File

object ScrambleReadmeHandler : RouteHandler {
    private var scramblers = PuzzlePlugins.getScramblers()

    override fun install(router: Routing) {
        router.get("/readme/scramble") {
            val scramblesReadmePath = "wca/readme-scramble.md" // TODO actual resource path
            val dataStructureInputStream = File(scramblesReadmePath)
            val rawReadme = dataStructureInputStream.readText()

            val scrambleFilteringInfo = StringBuilder()

            for (s in scramblers.values) {
                // those 2 spaces at the end are no accident: http://meta.stackoverflow.com/questions/26011/should-the-markdown-renderer-treat-a-single-line-break-as-br
                val line = "${s.longName}: &ge; ${s.wcaMinScrambleDistance} moves away from solved  \n"

                scrambleFilteringInfo.append(line)
            }

            val scramblesReadme = rawReadme.replace("%SCRAMBLE_FILTERING_THRESHOLDS%",
                scrambleFilteringInfo.toString())

            call.respondText(markdownToHTML(scramblesReadme))
        }
    }
}
