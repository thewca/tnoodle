package org.worldcubeassociation.tnoodle.server.webscrambles.routing

import io.ktor.application.call
import io.ktor.http.ContentType
import io.ktor.response.respondText
import io.ktor.routing.Routing
import io.ktor.routing.get
import io.ktor.routing.route
import org.worldcubeassociation.tnoodle.server.RouteHandler
import org.worldcubeassociation.tnoodle.server.RouteHandler.Companion.markdownToHTML
import org.worldcubeassociation.tnoodle.server.webscrambles.PuzzlePlugins

object ReadmeHandler : RouteHandler {
    override fun install(router: Routing) {
        router.route("/readme") {
            get("/scramble") {
                val scramblesReadmeStream = ReadmeHandler.javaClass.getResourceAsStream("/wca/readme-scramble.md")
                val rawReadme = scramblesReadmeStream.bufferedReader().readText()

                val scrambleFilteringInfo = PuzzlePlugins.WCA_PUZZLES.values
                    .map { it.value }
                    .joinToString("\n") {
                        // those 2 spaces at the end are no accident: http://meta.stackoverflow.com/questions/26011/should-the-markdown-renderer-treat-a-single-line-break-as-br
                        "${it.longName}: &ge; ${it.wcaMinScrambleDistance} moves away from solved  "
                    }

                val scramblesReadme = rawReadme.replace("%SCRAMBLE_FILTERING_THRESHOLDS%", scrambleFilteringInfo)

                call.respondText(markdownToHTML(scramblesReadme), ContentType.Text.Html)
            }

            get("/tnoodle") {
                val tnoodleReadmeStream = ReadmeHandler.javaClass.getResourceAsStream("/wca/readme-tnoodle.md")
                val readme = tnoodleReadmeStream.bufferedReader().readText()

                call.respondText(markdownToHTML(readme), ContentType.Text.Html)
            }
        }
    }
}
