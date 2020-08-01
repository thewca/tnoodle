package org.worldcubeassociation.tnoodle.server.webscrambles.routing

import io.ktor.application.ApplicationCall
import io.ktor.http.ContentType
import io.ktor.request.receive
import io.ktor.request.uri
import io.ktor.routing.Route
import io.ktor.routing.route
import org.worldcubeassociation.tnoodle.server.RouteHandler
import org.worldcubeassociation.tnoodle.server.serial.JsonConfig
import org.worldcubeassociation.tnoodle.server.ServerEnvironmentConfig
import org.worldcubeassociation.tnoodle.server.webscrambles.exceptions.BadWcifParameterException
import org.worldcubeassociation.tnoodle.server.webscrambles.routing.job.JobSchedulingHandler
import org.worldcubeassociation.tnoodle.server.webscrambles.routing.job.JobSchedulingHandler.registerJobPaths
import org.worldcubeassociation.tnoodle.server.webscrambles.routing.job.LongRunningJob
import org.worldcubeassociation.tnoodle.server.webscrambles.serial.WcifScrambleRequest
import org.worldcubeassociation.tnoodle.server.webscrambles.wcif.WCIFDataBuilder
import org.worldcubeassociation.tnoodle.server.webscrambles.wcif.WCIFScrambleMatcher
import org.worldcubeassociation.tnoodle.server.webscrambles.wcif.model.Competition
import java.time.LocalDateTime

class WcifHandler(val environmentConfig: ServerEnvironmentConfig) : RouteHandler {
    internal data class ScramblingJobData(val request: WcifScrambleRequest, val requestUrl: String)

    internal class ScramblingJob(val extraTargetData: Map<String, Int>, val scrambledToResult: suspend (Competition, ScramblingJobData, Int) -> Pair<ContentType, ByteArray>) : LongRunningJob<ScramblingJobData>() {
        constructor(scrambledToResult: suspend (Competition, ScramblingJobData, Int) -> Pair<ContentType, ByteArray>) : this(emptyMap(), scrambledToResult)

        override suspend fun ApplicationCall.extractData(): ScramblingJobData {
            val requestData = receive<WcifScrambleRequest>()
            val requestUrl = request.uri

            if (!validateRequest(requestData)) {
                // This is the most generic fallback.
                // The #validateRequest method itself _should_ throw more specific errors by itself
                BadWcifParameterException.error("WCIF request not valid")
            }

            return ScramblingJobData(requestData, requestUrl)
        }

        override suspend fun ScramblingJobData.compute(jobId: Int): Pair<ContentType, ByteArray> {
            val wcif = WCIFScrambleMatcher.fillScrambleSetsAsync(request.extendedWcif) { pzl, _ ->
                JobSchedulingHandler.registerProgress(jobId, pzl.key)
            }

            return scrambledToResult(wcif, this, jobId)
        }

        override fun getTargetState(data: ScramblingJobData) =
            WCIFScrambleMatcher.getScrambleCountsPerEvent(data.request.extendedWcif) + extraTargetData

        companion object {
            // rationale: The current 3BLD single WR is just below 20 seconds,
            // so this max assumes that somebody would do a 3BLD-WR-worthy solve
            // 60 minutes in a row (formula is (minutes * seconds) / WR)
            const val MAX_MULTI_CUBES = (60 * 60) / 20

            // see https://www.worldcubeassociation.org/regulations/#9m
            const val MAX_WCA_ROUNDS = 4

            // heuristic so that iText PDF doesn't blow up. No rationale other than experience
            const val MAX_SCRAMBLE_SET_COPIES = 100

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
                        if (round.scrambleSetCount > MAX_SCRAMBLE_SET_COPIES) {
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
                val job = ScramblingJob { wcif, _, _ ->
                    val resultBytes = JsonConfig.SERIALIZER.stringify(Competition.serializer(), wcif)
                    ContentType.Application.Json to resultBytes.toByteArray()
                }

                registerJobPaths(job)
            }

            route("zip") {
                val job = ScramblingJob(mapOf("PDF" to 1)) { wcif, data, jobId ->
                    val generationDate = LocalDateTime.now()

                    val pdfPassword = data.request.pdfPassword
                    val zipPassword = data.request.zipPassword

                    val zip = WCIFDataBuilder.wcifToZip(wcif, pdfPassword, generationDate, environmentConfig.title, data.requestUrl)
                    val bytes = zip.compress(zipPassword)

                    JobSchedulingHandler.registerProgress(jobId, "PDF")
                    ContentType.Application.Zip to bytes
                }

                registerJobPaths(job)
            }
        }
    }
}
