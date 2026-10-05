package org.worldcubeassociation.tnoodle.deployable.jar.routing

import io.ktor.server.application.*
import io.ktor.server.html.*
import io.ktor.server.routing.*
import kotlinx.html.*
import org.markdownj.MarkdownProcessor
import org.worldcubeassociation.tnoodle.server.RouteHandler
import org.worldcubeassociation.tnoodle.server.model.PuzzleData

object ReadmeHandler : RouteHandler {
    override fun install(router: Route) {
        router.route("readme") {
            get("scramble") {
                val scramblesReadmeStream = ReadmeHandler.javaClass.getResourceAsStream("/wca/readme-scramble.md")
                val rawReadme = scramblesReadmeStream.bufferedReader().readText()

                val scrambleFilteringInfo = PuzzleData.entries
                    .map { it.scrambler }
                    .joinToString("\n") {
                        // those 2 spaces at the end are no accident: http://meta.stackoverflow.com/questions/26011/should-the-markdown-renderer-treat-a-single-line-break-as-br
                        "${it.longName}: &ge; ${it.wcaMinScrambleDistance} moves away from solved  "
                    }

                val scramblesReadme = rawReadme.replace("%SCRAMBLE_FILTERING_THRESHOLDS%", scrambleFilteringInfo)

                call.respondMarkdown(scramblesReadme)
            }

            get("tnoodle") {
                val tnoodleReadmeStream = ReadmeHandler.javaClass.getResourceAsStream("/wca/readme-tnoodle.md")
                val readme = tnoodleReadmeStream.bufferedReader().readText()

                call.respondMarkdown(readme)
            }
        }
    }

    private val MD_PROCESSOR = MarkdownProcessor()

    const val MARKDOWN_TITLE_CHAR = '#'

    suspend fun ApplicationCall.respondMarkdown(markdownRaw: String) {
        val titleLine = markdownRaw.lineSequence()
            .firstOrNull()

        // We assume that a title line is the first line, starts with one #, and possibly ends with one #
        val titleContent = titleLine?.takeIf { it.startsWith(MARKDOWN_TITLE_CHAR) }
            ?.substringAfter(MARKDOWN_TITLE_CHAR)
            ?.trimEnd(MARKDOWN_TITLE_CHAR)
            ?.trim()

        return respondHtml {
            head {
                if (titleContent != null) {
                    title {
                        +titleContent
                    }
                }

                link {
                    rel = "stylesheet"
                    type = "text/css"
                    href = "/css/markdown.css"
                }
            }

            body {
                unsafe {
                    +MD_PROCESSOR.markdown(markdownRaw)
                }
            }
        }
    }
}
