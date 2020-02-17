package org.worldcubeassociation.tnoodle.server.webscrambles.routing

import io.ktor.application.ApplicationCall
import io.ktor.http.ContentType
import io.ktor.request.receive
import io.ktor.request.uri
import io.ktor.routing.Routing
import io.ktor.routing.route
import org.worldcubeassociation.tnoodle.server.RouteHandler
import org.worldcubeassociation.tnoodle.server.serial.JsonConfig
import org.worldcubeassociation.tnoodle.server.util.ServerEnvironmentConfig
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
    }

    override fun install(router: Routing) {
        router.route("/wcif") {
            route("/scrambles") {
                val job = ScramblingJob { wcif, _, _ ->
                    val resultBytes = JsonConfig.SERIALIZER.stringify(Competition.serializer(), wcif)
                    ContentType.Application.Json to resultBytes.toByteArray()
                }

                registerJobPaths(job)
            }

            route("/zip") {
                val job = ScramblingJob(mapOf("PDF" to 1)) { wcif, data, jobId ->
                    val generationDate = LocalDateTime.now()

                    val pdfPassword = data.request.pdfPassword
                    val zipPassword = data.request.zipPassword

                    val zip = WCIFDataBuilder.wcifToZip(wcif, pdfPassword, generationDate, environmentConfig.projectTitle, data.requestUrl)
                    val bytes = zip.compress(zipPassword)

                    JobSchedulingHandler.registerProgress(jobId, "PDF")
                    ContentType.Application.Zip to bytes
                }

                registerJobPaths(job)
            }
        }
    }
}
