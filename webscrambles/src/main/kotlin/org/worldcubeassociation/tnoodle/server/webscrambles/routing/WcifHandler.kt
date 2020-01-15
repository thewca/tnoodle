package org.worldcubeassociation.tnoodle.server.webscrambles.routing

import io.ktor.application.call
import io.ktor.request.receiveText
import io.ktor.response.respond
import io.ktor.routing.Routing
import io.ktor.routing.post
import org.worldcubeassociation.tnoodle.server.RouteHandler
import org.worldcubeassociation.tnoodle.server.RouteHandler.Companion.parseQuery
import org.worldcubeassociation.tnoodle.server.webscrambles.wcif.WCIFParser
import org.worldcubeassociation.tnoodle.server.webscrambles.wcif.WCIFRequestBinding.Companion.generateBindings

object WcifHandler : RouteHandler {
    override fun install(router: Routing) {
        router.post("/wcif/requests") {
            val body = call.receiveText()
            val query = parseQuery(body)

            val schedule = query["schedule"]
                ?: return@post call.respond("Please specify a schedule in WCIF format")

            val wcif = WCIFParser.parse(schedule)
            val bindings = wcif.generateBindings()

            val flatRequests = bindings.activityScrambleRequests
                .values.flatten()

            call.respond(flatRequests)
        }
    }
}
