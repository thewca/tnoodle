package org.worldcubeassociation.tnoodle.server.webscrambles

import com.google.gson.*
import io.ktor.application.call
import io.ktor.http.ContentType
import io.ktor.request.receiveText
import io.ktor.response.header
import io.ktor.response.respond
import io.ktor.response.respondBytes
import io.ktor.response.respondText
import io.ktor.routing.Routing
import io.ktor.routing.get
import io.ktor.routing.post
import io.ktor.util.toMap
import io.netty.handler.codec.http.QueryStringDecoder
import net.gnehzr.tnoodle.scrambles.*
import org.apache.batik.anim.dom.SVGDOMImplementation
import org.apache.batik.transcoder.TranscoderInput
import org.apache.batik.transcoder.TranscoderOutput
import org.apache.batik.transcoder.TranscodingHints
import org.apache.batik.transcoder.image.ImageTranscoder
import org.apache.batik.util.SVGConstants
import org.worldcubeassociation.tnoodle.server.RouteHandler
import net.gnehzr.tnoodle.scrambles.PuzzleImageInfo.infoToJsonable

import javax.imageio.ImageIO
import java.awt.image.BufferedImage
import java.io.*
import java.lang.reflect.Type
import java.util.Date

object ScrambleViewHandler : RouteHandler {
    private val scramblers = PuzzlePlugins.getScramblers()

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
        router.get("/view/{puzzleExt?}") {
            val puzzleExt = call.parameters["puzzleExt"]

            if (puzzleExt == null) {
                call.respondText("Please specify a puzzle")
                return@get
            }

            val (name, extension) = puzzleExt.split(".", limit = 2)
            val scrambler = scramblers[name]

            if (scrambler == null) {
                call.respondText("Invalid scrambler: $name")
                return@get
            }

            val query = call.request.queryParameters.toMap().mapValues { it.value.first() }

            val colorScheme = query["scheme"]?.let { scrambler.parseColorScheme(it) } ?: mapOf()
            val scramble = query["scramble"]

            when (extension) {
                "png" -> {
                    if (query.containsKey("icon")) {
                        val icon = PuzzleIcon.loadPuzzleIconPng(scrambler.shortName)

                        call.respondBytes(icon, ContentType.Image.PNG)
                    } else {
                        val svg = scrambler.drawScramble(scramble, colorScheme)
                        val svgFile = svg.toString().byteInputStream()

                        val (width, height) = scrambler.preferredSize
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
                        imageTranscoder.transcode(input, null)

                        val img = imageTranscoder.bufferedImage

                        val bytes = ByteArrayOutputStream().also { ImageIO.write(img, "png", it) }

                        call.respondBytes(bytes.toByteArray(), ContentType.Image.PNG)
                    }
                }
                "svg" -> {
                    val svg = scrambler.drawScramble(scramble, colorScheme)

                    call.respondText(svg.toString(), ContentType.Image.SVG)
                }
                "json" -> call.respond(scrambler.infoToJsonable())
                else -> call.respondText("Invalid extension: $extension")
            }
        }

        router.post("/view/{puzzleExt?}") {
            val puzzleExt = call.parameters["puzzleExt"]

            if (puzzleExt == null) {
                call.respondText("Please specify a puzzle")
                return@post
            }

            val (name, extension) = puzzleExt.split(".", limit = 2)
            val scrambler = scramblers[name]

            if (scrambler == null) {
                call.respondText("Invalid scrambler: $name")
                return@post
            }

            if (extension == "pdf" || extension == "zip") {
                val body = call.receiveText()
                val query = QueryStringDecoder(body).parameters().mapValues { it.value.first() }

                val scrambleRequests = GSON.fromJson(query["sheets"], Array<ScrambleRequest>::class.java)
                val password = query["password"]

                val generationDate = Date()

                when (extension) {
                    "pdf" -> {
                        val totalPdfOutput = ScrambleRequest
                            .requestsToPdf(name, generationDate, scrambleRequests, password)

                        call.response.header("Content-Disposition", "inline")

                        // Workaround for Chrome bug with saving PDFs:
                        // https://bugs.chromium.org/p/chromium/issues/detail?id=69677#c35
                        call.response.header("Cache-Control", "public")

                        call.respondBytes(totalPdfOutput.toByteArray(), ContentType.Application.Pdf)
                    }
                    "zip" -> {
                        val generationUrl = query["generationUrl"]
                        val schedule = query["schedule"]

                        val wcifHelper = WCIFHelper(schedule, scrambleRequests)

                        val zipOutput = ScrambleRequest
                            .requestsToZip(getServletContext(), name, generationDate, scrambleRequests, password, generationUrl, wcifHelper)

                        val safeTitle = name.replace("\"".toRegex(), "'")

                        call.response.header("Content-Disposition", "attachment; filename=\"$safeTitle.zip\"")
                        call.respondBytes(zipOutput.toByteArray(), ContentType.Application.Zip)
                    }
                }
            } else {
                call.respondText("Invalid extension: $extension")
            }
        }
    }

    private class Puzzlerizer : JsonSerializer<Puzzle>, JsonDeserializer<Puzzle> {
        override fun deserialize(json: JsonElement, typeOfT: Type, context: JsonDeserializationContext): Puzzle {
            try {
                val scramblerName = json.asString
                val scramblers = PuzzlePlugins.getScramblers()

                return scramblers[scramblerName]
                    ?: throw JsonParseException(scramblerName + " not found in: " + scramblers.keys)
            } catch (e: Exception) {
                throw JsonParseException(e)
            }
        }

        override fun serialize(scrambler: Puzzle, typeOfT: Type, context: JsonSerializationContext): JsonElement {
            return JsonPrimitive(scrambler.shortName)
        }
    }

    private class PuzzleImageInfoizer : JsonSerializer<PuzzleImageInfo> {
        override fun serialize(pii: PuzzleImageInfo, typeOfT: Type, context: JsonSerializationContext): JsonElement {
            return context.serialize(pii.toJsonable())
        }
    }

    init {
        GsonUtils.registerTypeHierarchyAdapter(Puzzle::class.java, Puzzlerizer())
        GsonUtils.registerTypeAdapter(PuzzleImageInfo::class.java, PuzzleImageInfoizer())
    }
}
