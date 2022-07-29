package org.worldcubeassociation.tnoodle.server.webscrambles.routing

import io.ktor.http.ContentType
import io.ktor.server.application.*
import io.ktor.server.request.*
import io.ktor.server.routing.*
import io.ktor.websocket.*
import org.worldcubeassociation.tnoodle.server.RouteHandler
import org.worldcubeassociation.tnoodle.server.serial.JsonConfig
import org.worldcubeassociation.tnoodle.server.ServerEnvironmentConfig
import org.worldcubeassociation.tnoodle.server.webscrambles.Translate
import org.worldcubeassociation.tnoodle.server.webscrambles.exceptions.BadWcifParameterException
import org.worldcubeassociation.tnoodle.server.webscrambles.routing.job.JobSchedulingHandler.registerJobPaths
import org.worldcubeassociation.tnoodle.server.webscrambles.routing.job.LongRunningJob
import org.worldcubeassociation.tnoodle.server.webscrambles.routing.job.StatusBackend
import org.worldcubeassociation.tnoodle.server.webscrambles.serial.WcifScrambleRequest
import org.worldcubeassociation.tnoodle.server.webscrambles.wcif.WCIFDataBuilder
import org.worldcubeassociation.tnoodle.server.webscrambles.wcif.WCIFScrambleMatcher
import org.worldcubeassociation.tnoodle.server.webscrambles.wcif.model.Competition
import org.worldcubeassociation.tnoodle.server.webscrambles.wcif.model.extension.SheetCopyCountExtension
import java.time.LocalDateTime

class WcifHandler(val environmentConfig: ServerEnvironmentConfig) : RouteHandler {
    data class ScramblingJobData(val request: WcifScrambleRequest, val requestUrl: String)

    internal class ScramblingJob(val extraTargetData: Map<String, Int>, val scrambledToResult: suspend (ScramblingJobData, Competition, StatusBackend) -> Pair<ContentType, ByteArray>) : LongRunningJob<ScramblingJobData>() {
        constructor(scrambledToResult: suspend (ScramblingJobData, Competition, StatusBackend) -> Pair<ContentType, ByteArray>) : this(emptyMap(), scrambledToResult)

        override suspend fun extractCall(call: ApplicationCall): ScramblingJobData {
            val requestData = call.receive<WcifScrambleRequest>()
            return call.verifyAndWrapWcifRequest(requestData)
        }

        override suspend fun extractFrame(call: ApplicationCall, frame: Frame.Text): ScramblingJobData {
            val frameText = frame.readText()
            val requestData = JsonConfig.SERIALIZER.decodeFromString(WcifScrambleRequest.serializer(), frameText)

            return call.verifyAndWrapWcifRequest(requestData)
        }

        protected fun ApplicationCall.verifyAndWrapWcifRequest(requestData: WcifScrambleRequest): ScramblingJobData {
            if (!validateRequest(requestData)) {
                // This is the most generic fallback.
                // The #validateRequest method _should_ throw more specific errors by itself
                BadWcifParameterException.error("WCIF request not valid")
            }

            return ScramblingJobData(requestData, request.uri)
        }

        override suspend fun ScramblingJobData.compute(statusBackend: StatusBackend): Pair<ContentType, ByteArray> {
            val wcif = WCIFScrambleMatcher.fillScrambleSetsAsync(request.extendedWcif) { evt, _ ->
                statusBackend.onProgress(evt.key)
            }

            return scrambledToResult(this, wcif, statusBackend)
        }

        override fun getTargetState(data: ScramblingJobData) =
            WCIFScrambleMatcher.getScrambleCountsPerEvent(data.request.extendedWcif) + extraTargetData

        override fun getResultMarker(data: ScramblingJobData) =
            data.request.wcif.id

        companion object {
            // rationale: The current 3BLD single WR is just below 20 seconds,
            // so this max assumes that somebody would do a 3BLD-WR-worthy solve
            // 60 minutes in a row (formula is (minutes * seconds) / WR)
            const val MAX_MULTI_CUBES = (60 * 60) / 20

            // see https://www.worldcubeassociation.org/regulations/#9m
            const val MAX_WCA_ROUNDS = 4

            // heuristic so that iText PDF doesn't blow up. No rationale other than experience
            const val MAX_SCRAMBLE_SET_COPIES = 100

            // The WCA identifies groups with letters internally, so having more than 26 is unlikely.
            const val MAX_SCRAMBLE_SET_COUNT = 26

            fun validateRequest(req: WcifScrambleRequest): Boolean {
                val checkMultiCubes = req.multiCubes?.requestedScrambles ?: 0

                if (checkMultiCubes > MAX_MULTI_CUBES) {
                    BadWcifParameterException.error("The maximum amount of MBLD cubes is $MAX_MULTI_CUBES")
                }

                for (event in req.wcif.events) {
                    if (event.rounds.size > MAX_WCA_ROUNDS) {
                        BadWcifParameterException.error("Event ${event.id} has more than $MAX_WCA_ROUNDS rounds")
                    }

                    for (round in event.rounds) {
                        if (round.scrambleSetCount > MAX_SCRAMBLE_SET_COUNT) {
                            BadWcifParameterException.error("The maximum number of scramble sets for Round ${round.id} is $MAX_SCRAMBLE_SET_COUNT")
                        }

                        val roundCopies = round.findExtension<SheetCopyCountExtension>()
                        val checkRoundCopies = roundCopies?.numCopies ?: 0

                        if (checkRoundCopies > MAX_SCRAMBLE_SET_COPIES) {
                            BadWcifParameterException.error("The maximum number of copies for Round ${round.id} is $MAX_SCRAMBLE_SET_COPIES")
                        }
                    }
                }

                return true
            }
        }
    }

    override fun install(router: Route) {
        router.route("wcif") {
            route("scrambles") {
                val job = ScramblingJob { _, wcif, _ ->
                    val resultBytes = JsonConfig.SERIALIZER.encodeToString(Competition.serializer(), wcif)
                    ContentType.Application.Json to resultBytes.toByteArray()
                }

                registerJobPaths(job)
            }

            route("zip") {
                val job = ScramblingJob(mapOf(WORKER_PDF to 1)) { req, wcif, backend ->
                    val generationDate = LocalDateTime.now()
                    val generationUrl = req.requestUrl

                    val versionTag = environmentConfig.title

                    val pdfPassword = req.request.pdfPassword
                    val zipPassword = req.request.zipPassword

                    val fmcTranslations = req.request.fmcLanguages?.languageTags.orEmpty()
                        .mapNotNull { Translate.LOCALES_BY_LANG_TAG[it] }

                    // TODO GB allow building ZIPs in languages other than English?
                    val zip = WCIFDataBuilder.wcifToZip(wcif, pdfPassword, versionTag, Translate.DEFAULT_LOCALE, fmcTranslations, generationDate, generationUrl)
                    val bytes = zip.compress(zipPassword)

                    backend.onProgress(WORKER_PDF)
                    ContentType.Application.Zip to bytes
                }

                registerJobPaths(job)
            }
        }
    }

    companion object {
        const val WORKER_PDF = "PDF"
    }
}
