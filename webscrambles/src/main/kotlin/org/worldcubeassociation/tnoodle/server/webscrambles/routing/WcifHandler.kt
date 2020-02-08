package org.worldcubeassociation.tnoodle.server.webscrambles.routing

import io.ktor.application.call
import io.ktor.request.receiveText
import io.ktor.response.respond
import io.ktor.response.respondText
import io.ktor.routing.Routing
import io.ktor.routing.post
import org.worldcubeassociation.tnoodle.server.RouteHandler
import org.worldcubeassociation.tnoodle.server.RouteHandler.Companion.parseQuery
import org.worldcubeassociation.tnoodle.server.webscrambles.wcif.WCIFScrambleMatcher
import org.worldcubeassociation.tnoodle.server.webscrambles.wcif.WCIFParser

object WcifHandler : RouteHandler {
    override fun install(router: Routing) {
        router.post("/wcif/requests") {
            val body = call.receiveText()
            val query = parseQuery(body)

            val wcifJson = query["wcif"]
                ?: return@post call.respond("Please specify a WCIF JSON")

            val wcif = WCIFParser.parseComplete(wcifJson)

            val extendedWcif = query["multi-cubes"]?.let {
                val count = it.toIntOrNull()
                    ?: return@post call.respondText("Not a valid number: $it")

                WCIFScrambleMatcher.installMultiCount(wcif, count)
            } ?: wcif

            val bindings = WCIFScrambleMatcher.fillScrambleSets(extendedWcif)

            call.respond(bindings)
        }
    }
}
