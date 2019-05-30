package org.worldcubeassociation.tnoodle.server.webscrambles

import io.ktor.application.Application
import io.ktor.routing.routing
import net.gnehzr.tnoodle.scrambles.Puzzle
import net.gnehzr.tnoodle.scrambles.PuzzleImageInfo
import net.gnehzr.tnoodle.svglite.Color
import org.worldcubeassociation.tnoodle.server.ApplicationHandler
import org.worldcubeassociation.tnoodle.server.TNoodleServer
import org.worldcubeassociation.tnoodle.server.util.GsonUtil
import org.worldcubeassociation.tnoodle.server.webscrambles.gson.Colorizer
import org.worldcubeassociation.tnoodle.server.webscrambles.gson.PuzzleImageInfoizer
import org.worldcubeassociation.tnoodle.server.webscrambles.gson.Puzzlerizer
import org.worldcubeassociation.tnoodle.server.webscrambles.routing.*

class WebscramblesServer : ApplicationHandler {
    override fun spinUp(app: Application) {
        app.routing {
            PuzzleListHandler.install(this)
            RouteRedirectHandler.install(this)
            ScrambleHandler.install(this)
            ScrambleImporterHandler.install(this)
            ReadmeHandler.install(this)
            ScrambleViewHandler.install(this)
            StaticContentHandler.install(this)
        }
    }

    companion object {
        @JvmStatic
        fun main(args: Array<String>) {
            GsonUtil.registerTypeAdapter(Color::class.java, Colorizer())
            GsonUtil.registerTypeAdapter(PuzzleImageInfo::class.java, PuzzleImageInfoizer())

            GsonUtil.registerTypeHierarchyAdapter(Puzzle::class.java, Puzzlerizer())

            TNoodleServer.registerModule(WebscramblesServer())

            TNoodleServer.launch(args)
        }
    }
}
