package org.worldcubeassociation.tnoodle.server

import io.ktor.routing.Routing
import org.markdownj.MarkdownProcessor
import java.util.*
import java.io.UnsupportedEncodingException
import java.net.URLDecoder
import java.util.LinkedHashMap


interface RouteHandler {
    fun install(router: Routing)

    companion object {
        private val mp = MarkdownProcessor()

        fun markdownToHTML(dataString: String): String {
            var titleCode = ""
            // We assume that a title line is the first line, starts with one #, and possibly ends with one #
            if (dataString.startsWith("#")) {
                var title = Scanner(dataString).nextLine()
                title = title.substring(1)
                if (title.endsWith("#")) {
                    title = title.substring(0, title.length - 1)
                }
                title = title.trim { it <= ' ' }
                titleCode = "<title>$title</title>\n"
            }

            return "<html><head>\n" +
                titleCode +
                "<link href=\"/css/markdown.css\" rel=\"stylesheet\" type=\"text/css\" />\n" +
                "</head>\n<body>\n" + mp.markdown(dataString) + "</body>\n</html>\n"
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

    }
}
