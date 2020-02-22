package org.worldcubeassociation.tnoodle.server.webscrambles.routing

import io.ktor.application.ApplicationCall
import io.ktor.application.call
import io.ktor.http.ContentType
import io.ktor.response.respond
import io.ktor.response.respondBytes
import io.ktor.response.respondText
import io.ktor.routing.Routing
import io.ktor.routing.get
import io.ktor.routing.route
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.apache.batik.anim.dom.SVGDOMImplementation
import org.apache.batik.transcoder.TranscoderInput
import org.apache.batik.transcoder.TranscoderOutput
import org.apache.batik.transcoder.TranscodingHints
import org.apache.batik.transcoder.image.ImageTranscoder
import org.apache.batik.util.SVGConstants
import org.worldcubeassociation.tnoodle.scrambles.Puzzle
import org.worldcubeassociation.tnoodle.server.RouteHandler
import org.worldcubeassociation.tnoodle.server.webscrambles.plugins.PuzzlePlugins
import org.worldcubeassociation.tnoodle.server.webscrambles.serial.DimensionJsonData
import org.worldcubeassociation.tnoodle.server.webscrambles.serial.PuzzleImageJsonData
import org.worldcubeassociation.tnoodle.svglite.Svg
import java.awt.image.BufferedImage
import java.io.ByteArrayOutputStream
import javax.imageio.ImageIO

object ScrambleViewHandler : RouteHandler {
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

    private suspend fun ApplicationCall.withScramble(handle: suspend ApplicationCall.(Puzzle, Svg) -> Unit) {
        val name = parameters["puzzleKey"]
            ?: return respondText("Please specify a puzzle")

        val scrambler = PuzzlePlugins.WCA_PUZZLES[name]?.scrambler
            ?: return respondText("Invalid scrambler: $name")

        val scramble = request.queryParameters["scramble"]
        val colorScheme = request.queryParameters["scheme"]
            ?.let { scrambler.parseColorScheme(it) } ?: hashMapOf()

        val svg = scrambler.drawScramble(scramble, colorScheme)

        handle(scrambler, svg)
    }

    override fun install(router: Routing) {
        router.route("view") {
            route("{puzzleKey}") {
                get("png") {
                    call.withScramble { scrambler, svg ->
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

                        val bytes = ByteArrayOutputStream().also {
                            withContext(Dispatchers.IO) { ImageIO.write(img, "png", it) }
                        }

                        respondBytes(bytes.toByteArray(), ContentType.Image.PNG)
                    }
                }
                get("svg") {
                    call.withScramble { _, svg -> respondText(svg.toString(), ContentType.Image.SVG) }
                }
                get("json") {
                    call.withScramble { puzzle, _ ->
                        val pzlSize = puzzle.preferredSize

                        val dim = DimensionJsonData(pzlSize.width, pzlSize.height)
                        val jsonData = PuzzleImageJsonData(dim, puzzle.defaultColorScheme)

                        respond(jsonData)
                    }
                }
            }
        }
    }
}
