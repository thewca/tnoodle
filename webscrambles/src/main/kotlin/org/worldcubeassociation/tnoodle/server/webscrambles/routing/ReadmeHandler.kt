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
    private val scramblers = PuzzlePlugins.PUZZLES

    override fun install(router: Routing) {
        router.route("/readme") {
            get("/scramble") {
                val scramblesReadmeStream = ReadmeHandler.javaClass.getResourceAsStream("/wca/readme-scramble.md")
                val rawReadme = scramblesReadmeStream.bufferedReader().readText()

                val scrambleFilteringInfo = StringBuilder()

                for (s in scramblers.values) {
                    // those 2 spaces at the end are no accident: http://meta.stackoverflow.com/questions/26011/should-the-markdown-renderer-treat-a-single-line-break-as-br
                    val line = "${s.longName}: &ge; ${s.wcaMinScrambleDistance} moves away from solved  \n"

                    scrambleFilteringInfo.append(line)
                }

                val scramblesReadme = rawReadme.replace("%SCRAMBLE_FILTERING_THRESHOLDS%",
                    scrambleFilteringInfo.toString())

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
