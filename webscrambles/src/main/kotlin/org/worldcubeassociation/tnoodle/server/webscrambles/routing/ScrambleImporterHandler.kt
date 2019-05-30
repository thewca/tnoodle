package org.worldcubeassociation.tnoodle.server.webscrambles.routing

import io.ktor.application.call
import io.ktor.http.content.PartData
import io.ktor.http.content.forEachPart
import io.ktor.http.content.streamProvider
import io.ktor.request.receiveMultipart
import io.ktor.response.respond
import io.ktor.response.respondText
import io.ktor.routing.Routing
import io.ktor.routing.get
import io.ktor.routing.param
import io.ktor.routing.post
import java.net.URL
import java.util.regex.Matcher

import org.worldcubeassociation.tnoodle.server.RouteHandler
import org.worldcubeassociation.tnoodle.server.util.GsonUtil.GSON

object ScrambleImporterHandler : RouteHandler {
    override fun install(router: Routing) {
        router.post("/import") {
            val multipart = call.receiveMultipart()
            val scrambles = mutableListOf<String>()

            multipart.forEachPart {
                when (it) {
                    is PartData.FileItem -> {
                        scrambles += it.streamProvider().reader().readLines()
                    }
                }
            }

            //we need to escape our backslashes
            val json = GSON.toJson(scrambles).replace("\\\\".toRegex(), Matcher.quoteReplacement("\\\\"))
            val html = "<html><body><script>parent.postMessage('$json', '*');</script></html>"

            call.respondText(html)
        }

        router.param("url") {
            get("/import") {
                val urlStr = call.parameters["url"]!!

                val cleanUrlStr = if (urlStr.startsWith("http")) urlStr else "http://$urlStr"

                val url = URL(cleanUrlStr)
                val scrambles = url.readText().split("\n")

                call.respond(scrambles)
            }
        }
    }
}
