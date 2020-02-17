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
    internal class ScramblingJob(val scrambledToResult: suspend ApplicationCall.(Competition, WcifScrambleRequest, Int) -> Pair<ContentType, ByteArray>) : LongRunningJob() {
        override val targetStatus: Map<String, Int>
            get() = emptyMap() // TODO

        override suspend fun ApplicationCall.compute(jobId: Int): Pair<ContentType, ByteArray> {
            val wcifRequest = receive<WcifScrambleRequest>()
            val baseWcif = yieldExtendedWcif(wcifRequest)

            val wcif = WCIFScrambleMatcher.fillScrambleSetsAsync(baseWcif) { pzl, _ ->
                JobSchedulingHandler.registerProgress(jobId, pzl.key)
            }

            return scrambledToResult(wcif, wcifRequest, jobId)
        }
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
                val job = ScramblingJob { wcif, req, jobId ->
                    val generationDate = LocalDateTime.now()

                    val pdfPassword = req.pdfPassword
                    val zipPassword = req.zipPassword

                    val zip = WCIFDataBuilder.wcifToZip(wcif, pdfPassword, generationDate, environmentConfig.projectTitle, request.uri)
                    val bytes = zip.compress(zipPassword)

                    JobSchedulingHandler.registerProgress(jobId, "PDF")
                    ContentType.Application.Zip to bytes
                }

                registerJobPaths(job)
            }
        }
    }

    companion object {
        private suspend fun ApplicationCall.yieldExtendedWcif(suspendRequest: WcifScrambleRequest? = null): Competition {
            // suspend fn not supported as default argument…
            val request = suspendRequest ?: this.receive()

            val wcif = request.wcif

            val optionalExtensions = listOfNotNull(
                request.multiCubes?.to("333mbf"),
                request.fmcLanguages?.to("333fm")
            ).toMap()

            return WCIFScrambleMatcher.installExtensions(wcif, optionalExtensions)
        }

    }
}
