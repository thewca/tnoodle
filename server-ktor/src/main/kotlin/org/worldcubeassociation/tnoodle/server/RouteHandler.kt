package org.worldcubeassociation.tnoodle.server

import io.ktor.routing.Routing
import org.markdownj.MarkdownProcessor
import java.util.*
import java.io.UnsupportedEncodingException
import java.net.URLDecoder


interface RouteHandler {
    fun install(router: Routing)

    companion object {
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

        fun parseQuery(query: String): Map<String, String> {
            val queryMap = mutableMapOf<String, String>()

            val pairs = query.split("&")

            for (pair in pairs) {
                val keyValuePair = pair.split("=")

                if (keyValuePair.size == 1) {
                    queryMap[keyValuePair[0]] = "" // this allows for flags such as http://foo/blah?kill&burn
                } else {
                    queryMap[keyValuePair[0]] = try {
                        URLDecoder.decode(keyValuePair[1], "utf-8")
                    } catch (e: UnsupportedEncodingException) {
                        keyValuePair[1] //worst case, just put the undecoded string
                    }

                }
            }

            return queryMap
        }

        fun splitNameAndExtension(input: String): Pair<String, String> {
            val nameParts = input.split(".")

            val name = nameParts.dropLast(1).joinToString(".")
            val extension = nameParts.lastOrNull().orEmpty()

            return name to extension
        }
    }
}
