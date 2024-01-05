package org.worldcubeassociation.tnoodle.server.routing.api

import io.ktor.http.ContentType
import io.ktor.server.application.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import org.apache.batik.anim.dom.SVGDOMImplementation
import org.apache.batik.transcoder.TranscoderInput
import org.apache.batik.transcoder.TranscoderOutput
import org.apache.batik.transcoder.TranscodingHints
import org.apache.batik.transcoder.image.ImageTranscoder
import org.apache.batik.transcoder.image.PNGTranscoder
import org.apache.batik.util.SVGConstants
import org.worldcubeassociation.tnoodle.scrambles.Puzzle
import org.worldcubeassociation.tnoodle.server.RouteHandler
import org.worldcubeassociation.tnoodle.server.serial.api.PuzzleImageJsonData
import org.worldcubeassociation.tnoodle.server.model.PuzzleData
import org.worldcubeassociation.tnoodle.svglite.Svg
import java.io.ByteArrayOutputStream

object ScrambleViewHandler : RouteHandler {
    private const val PUZZLE_KEY_PARAM = PuzzleListHandler.PUZZLE_KEY_PARAM

    private const val QUERY_SCRAMBLE_PARAM = "scramble"
    private const val QUERY_COLOR_SCHEME_PARAM = "scheme"

    private suspend fun ApplicationCall.withScramble(handle: suspend ApplicationCall.(Puzzle, Svg) -> Unit) {
        val name = parameters[PUZZLE_KEY_PARAM]
            ?: return respondText("Please specify a puzzle")

        val scrambler = PuzzleData.WCA_PUZZLES[name]?.scrambler
            ?: return respondText("Invalid scrambler: $name")

        val scramble = request.queryParameters[QUERY_SCRAMBLE_PARAM]
        val colorScheme = request.queryParameters[QUERY_COLOR_SCHEME_PARAM]
            ?.let { scrambler.parseColorScheme(it) } ?: hashMapOf()

        val svg = scrambler.drawScramble(scramble, colorScheme)

        handle(scrambler, svg)
    }

    override fun install(router: Route) {
        router.route("view") {
            route("{$PUZZLE_KEY_PARAM}") {
                get("png") {
                    call.withScramble { puzzle, svg ->
                        val (width, height) = puzzle.preferredSize.let { it.width to it.height }

                        // Copied from http://stackoverflow.com/a/6634963
                        // with some tweaks.
                        val hints = TranscodingHints().apply {
                            this[ImageTranscoder.KEY_WIDTH] = width.toFloat()
                            this[ImageTranscoder.KEY_HEIGHT] = height.toFloat()
                            this[ImageTranscoder.KEY_DOM_IMPLEMENTATION] = SVGDOMImplementation.getDOMImplementation()
                            this[ImageTranscoder.KEY_DOCUMENT_ELEMENT_NAMESPACE_URI] = SVGConstants.SVG_NAMESPACE_URI
                            this[ImageTranscoder.KEY_DOCUMENT_ELEMENT_NAMESPACE_URI] = SVGConstants.SVG_NAMESPACE_URI
                            this[ImageTranscoder.KEY_DOCUMENT_ELEMENT] = SVGConstants.SVG_SVG_TAG
                            this[ImageTranscoder.KEY_XML_PARSER_VALIDATING] = false
                        }

                        val imageTranscoder = PNGTranscoder().apply {
                            transcodingHints = hints
                        }

                        val svgFile = svg.toString().byteInputStream()
                        val input = TranscoderInput(svgFile)

                        val outputBytes = ByteArrayOutputStream()
                        val output = TranscoderOutput(outputBytes)
                        imageTranscoder.transcode(input, output)

                        respondBytes(outputBytes.toByteArray(), ContentType.Image.PNG)
                    }
                }
                get("svg") {
                    call.withScramble { _, svg -> respondText(svg.toString(), ContentType.Image.SVG) }
                }
                get("json") {
                    call.withScramble { puzzle, _ ->
                        val pzlSize = puzzle.preferredSize
                        val jsonData = PuzzleImageJsonData(pzlSize.width, pzlSize.height, puzzle.defaultColorScheme)

                        respond(jsonData)
                    }
                }
            }
        }
    }
}
