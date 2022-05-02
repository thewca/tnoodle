package org.worldcubeassociation.tnoodle.server.webscrambles.routing

import io.ktor.http.ContentType
import io.ktor.server.application.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import org.markdownj.MarkdownProcessor
import org.worldcubeassociation.tnoodle.server.RouteHandler
import org.worldcubeassociation.tnoodle.server.model.PuzzleData

object ReadmeHandler : RouteHandler {
    override fun install(router: Route) {
        router.route("readme") {
            get("scramble") {
                val scramblesReadmeStream = ReadmeHandler.javaClass.getResourceAsStream("/wca/readme-scramble.md")
                val rawReadme = scramblesReadmeStream.bufferedReader().readText()

                val scrambleFilteringInfo = PuzzleData.values()
                    .map { it.scrambler }
                    .joinToString("\n") {
                        // those 2 spaces at the end are no accident: http://meta.stackoverflow.com/questions/26011/should-the-markdown-renderer-treat-a-single-line-break-as-br
                        "${it.longName}: &ge; ${it.wcaMinScrambleDistance} moves away from solved  "
                    }

                val scramblesReadme = rawReadme.replace("%SCRAMBLE_FILTERING_THRESHOLDS%", scrambleFilteringInfo)

                call.respondText(markdownToHTML(scramblesReadme), ContentType.Text.Html)
            }

            get("tnoodle") {
                val tnoodleReadmeStream = ReadmeHandler.javaClass.getResourceAsStream("/wca/readme-tnoodle.md")
                val readme = tnoodleReadmeStream.bufferedReader().readText()

                call.respondText(markdownToHTML(readme), ContentType.Text.Html)
            }
        }
    }

    private val MD_PROCESSOR = MarkdownProcessor()

    const val MARKDOWN_TITLE_CHAR = '#'

    fun markdownToHTML(dataString: String): String {
        val titleLine = dataString.lineSequence()
            .firstOrNull()

        // We assume that a title line is the first line, starts with one #, and possibly ends with one #
        val titleContent = titleLine?.takeIf { it.startsWith(MARKDOWN_TITLE_CHAR) }
            ?.substringAfter(MARKDOWN_TITLE_CHAR)
            ?.trimEnd(MARKDOWN_TITLE_CHAR)
            ?.trim()

        val titleCode = titleContent
            ?.let { "<title>$it</title>\n" }
            .orEmpty()

        return "<html><head>\n$titleCode<link href=\"/css/markdown.css\" rel=\"stylesheet\" type=\"text/css\" />\n</head>\n<body>\n${MD_PROCESSOR.markdown(dataString)}</body>\n</html>\n"
    }
}
