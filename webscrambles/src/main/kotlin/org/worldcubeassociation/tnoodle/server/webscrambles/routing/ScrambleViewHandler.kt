package org.worldcubeassociation.tnoodle.server.webscrambles.routing

import io.ktor.application.call
import io.ktor.http.ContentType
import io.ktor.request.receiveText
import io.ktor.request.uri
import io.ktor.response.header
import io.ktor.response.respond
import io.ktor.response.respondBytes
import io.ktor.response.respondText
import io.ktor.routing.Routing
import io.ktor.routing.get
import io.ktor.routing.post
import io.ktor.routing.route
import net.gnehzr.tnoodle.scrambles.PuzzleIcon
import net.gnehzr.tnoodle.scrambles.PuzzleImageInfo
import org.apache.batik.anim.dom.SVGDOMImplementation
import org.apache.batik.transcoder.TranscoderInput
import org.apache.batik.transcoder.TranscoderOutput
import org.apache.batik.transcoder.TranscodingHints
import org.apache.batik.transcoder.image.ImageTranscoder
import org.apache.batik.util.SVGConstants
import org.worldcubeassociation.tnoodle.server.RouteHandler
import org.worldcubeassociation.tnoodle.server.RouteHandler.Companion.parseQuery
import org.worldcubeassociation.tnoodle.server.util.GsonUtil.GSON
import net.gnehzr.tnoodle.plugins.PuzzlePlugins
import org.worldcubeassociation.tnoodle.server.webscrambles.ScrambleRequest
import org.worldcubeassociation.tnoodle.server.webscrambles.wcif.WCIFHelper
import java.awt.image.BufferedImage
import java.io.ByteArrayOutputStream
import java.util.*
import javax.imageio.ImageIO

object ScrambleViewHandler : RouteHandler {
    private val scramblers = PuzzlePlugins.PUZZLES

    // Copied from http://bbgen.net/blog/2011/06/java-svg-to-bufferedimage/
    internal class BufferedImageTranscoder : ImageTranscoder() {
        var bufferedImage: BufferedImage? = null
            private set

        override fun createImage(w: Int, h: Int): BufferedImage {
            return BufferedImage(w, h, BufferedImage.TYPE_INT_ARGB)
        }

        override fun writeImage(img: BufferedImage, output: TranscoderOutput) {
            this.bufferedImage = img
        }
    }

    override fun install(router: Routing) {
        router.route("/view") {
            get("/{puzzleExt}") {
                val puzzleExt = call.parameters["puzzleExt"] ?: return@get call.respondText("Please specify a puzzle")

                val (name, extension) = puzzleExt.split(".", limit = 2)

                if (extension.isEmpty()) {
                    return@get call.respondText("No extension specified.")
                }

                val scrambler by scramblers[name] ?: return@get call.respondText("Invalid scrambler: $name")

                val queryStr = call.request.uri.substringAfter('?', "")
                val query = parseQuery(queryStr).toMutableMap()

                val colorScheme = query["scheme"]?.let { scrambler.parseColorScheme(it) } ?: hashMapOf()
                val scramble = query["scramble"]

                when (extension) {
                    "png" -> {
                        if (query.containsKey("icon")) {
                            val icon = PuzzleIcon.loadPuzzleIconPng(scrambler.shortName)

                            call.respondBytes(icon.toByteArray(), ContentType.Image.PNG)
                        } else {
                            val svg = scrambler.drawScramble(scramble, colorScheme)
                            val svgFile = svg.toString().byteInputStream()

                            val (width, height) = scrambler.preferredSize.let { it.width to it.height }
                            val imageTranscoder = BufferedImageTranscoder()

                            // Copied from http://stackoverflow.com/a/6634963
                            // with some tweaks.
                            val impl = SVGDOMImplementation.getDOMImplementation()

                            val hints = TranscodingHints().apply {
                                this[ImageTranscoder.KEY_WIDTH] = width.toFloat()
                                this[ImageTranscoder.KEY_HEIGHT] = height.toFloat()
                                this[ImageTranscoder.KEY_DOM_IMPLEMENTATION] = impl
                                this[ImageTranscoder.KEY_DOCUMENT_ELEMENT_NAMESPACE_URI] = SVGConstants.SVG_NAMESPACE_URI
                                this[ImageTranscoder.KEY_DOCUMENT_ELEMENT_NAMESPACE_URI] = SVGConstants.SVG_NAMESPACE_URI
                                this[ImageTranscoder.KEY_DOCUMENT_ELEMENT] = SVGConstants.SVG_SVG_TAG
                                this[ImageTranscoder.KEY_XML_PARSER_VALIDATING] = false
                            }

                            imageTranscoder.transcodingHints = hints

                            val input = TranscoderInput(svgFile)
                            imageTranscoder.transcode(input, TranscoderOutput())

                            val img = imageTranscoder.bufferedImage

                            val bytes = ByteArrayOutputStream().also { ImageIO.write(img, "png", it) }

                            call.respondBytes(bytes.toByteArray(), ContentType.Image.PNG)
                        }
                    }
                    "svg" -> {
                        val svg = scrambler.drawScramble(scramble, colorScheme)

                        call.respondText(svg.toString(), ContentType.Image.SVG)
                    }
                    "json" -> call.respond(PuzzleImageInfo(scrambler))
                    else -> call.respondText("Invalid extension: $extension")
                }
            }

            post("/{puzzleExt}") {
                val puzzleExt = call.parameters["puzzleExt"] ?: return@post call.respondText("Please specify a puzzle")

                val (name, extension) = puzzleExt.split(".", limit = 2)

                if (extension.isEmpty()) {
                    return@post call.respondText("No extension specified.")
                }

                val body = call.receiveText()
                val query = parseQuery(body)

                val scrambleRequests = GSON.fromJson(query["sheets"], Array<ScrambleRequest>::class.java).toList()
                val password = query["password"]

                val generationDate = Date()

                when (extension) {
                    "pdf" -> {
                        val totalPdfOutput = ScrambleRequest.requestsToCompletePdf(name, generationDate, scrambleRequests)

                        call.response.header("Content-Disposition", "inline")

                        // Workaround for Chrome bug with saving PDFs:
                        // https://bugs.chromium.org/p/chromium/issues/detail?id=69677#c35
                        call.response.header("Cache-Control", "public")

                        call.respondBytes(totalPdfOutput.render(), ContentType.Application.Pdf)
                    }
                    "zip" -> {
                        val generationUrl = query["generationUrl"]
                        val schedule = query["schedule"] ?: "{}"

                        val wcifHelper = WCIFHelper(schedule)

                        val zipOutput = ScrambleRequest.requestsToZip(name, generationDate, scrambleRequests, password, generationUrl, wcifHelper)

                        val safeTitle = name.replace("\"".toRegex(), "'")

                        call.response.header("Content-Disposition", "attachment; filename=\"$safeTitle.zip\"")
                        call.respondBytes(zipOutput.toByteArray(), ContentType.Application.Zip)
                    }
                    else -> call.respondText("Invalid extension: $extension")
                }
            }
        }
    }
}
