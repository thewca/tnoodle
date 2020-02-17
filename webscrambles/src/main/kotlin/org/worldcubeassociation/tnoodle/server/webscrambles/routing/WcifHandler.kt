package org.worldcubeassociation.tnoodle.server.webscrambles.routing

import io.ktor.application.ApplicationCall
import io.ktor.application.call
import io.ktor.http.ContentType
import io.ktor.request.receive
import io.ktor.http.HttpStatusCode
import io.ktor.request.uri
import io.ktor.response.respond
import io.ktor.response.respondBytes
import io.ktor.routing.*
import org.worldcubeassociation.tnoodle.server.RouteHandler
import kotlinx.coroutines.launch
import org.worldcubeassociation.tnoodle.server.serial.JsonConfig
import org.worldcubeassociation.tnoodle.server.util.ServerEnvironmentConfig
import org.worldcubeassociation.tnoodle.server.webscrambles.routing.job.JobSchedulingHandler
import org.worldcubeassociation.tnoodle.server.webscrambles.routing.job.LongRunningJob
import org.worldcubeassociation.tnoodle.server.webscrambles.serial.WcifScrambleRequest
import org.worldcubeassociation.tnoodle.server.webscrambles.wcif.WCIFDataBuilder
import org.worldcubeassociation.tnoodle.server.webscrambles.wcif.WCIFScrambleMatcher
import org.worldcubeassociation.tnoodle.server.webscrambles.wcif.model.Competition
import java.time.LocalDateTime

class WcifHandler(val environmentConfig: ServerEnvironmentConfig) : RouteHandler {
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

    internal class ScramblingJob(val baseWcif: Competition, val scrambledToResult: suspend (Competition) -> Pair<ContentType, ByteArray>) : LongRunningJob() {
        override val targetStatus: Map<String, Int>
            get() = emptyMap() // TODO

        override suspend fun compute(jobId: Int): Pair<ContentType, ByteArray> {
            val wcif = WCIFScrambleMatcher.fillScrambleSetsAsync(baseWcif) { pzl, _ ->
                JobSchedulingHandler.registerProgress(jobId, pzl.key)
            }

            return scrambledToResult(wcif)
        }
    }

    override fun install(router: Routing) {
        router.post("/wcif/scrambles") {
            val extWcif = call.yieldExtendedWcif()
            val wcif = WCIFScrambleMatcher.fillScrambleSets(extWcif)

            call.respond(wcif)
        }

        router.put("/wcif/scrambles") {
            val extWcif = call.yieldExtendedWcif()

            val jobId = JobSchedulingHandler.nextJobID()

            launch(context = JobSchedulingHandler.JOB_CONTEXT) {
                val wcif = WCIFScrambleMatcher.fillScrambleSetsAsync(extWcif) { pzl, _ ->
                    JobSchedulingHandler.registerProgress(jobId, pzl.key)
                }

                val resultBytes = JsonConfig.SERIALIZER.stringify(Competition.serializer(), wcif)
                JobSchedulingHandler.registerResult(jobId, ContentType.Application.Json, resultBytes.toByteArray())
            }

            call.respond(HttpStatusCode.Created, jobId)
        }

        router.post("/wcif/zip") {
            val generationDate = LocalDateTime.now()
            val wcifRequest = call.receive<WcifScrambleRequest>()

            val extWcif = call.yieldExtendedWcif(wcifRequest)

            val pdfPassword = wcifRequest.pdfPassword
            val zipPassword = wcifRequest.zipPassword

            val wcif = WCIFScrambleMatcher.fillScrambleSets(extWcif)

            val zip = WCIFDataBuilder.wcifToZip(wcif, pdfPassword, generationDate, environmentConfig.projectTitle, call.request.uri)
            val bytes = zip.compress(zipPassword)

            call.respondBytes(bytes, ContentType.Application.Zip)
        }

        router.put("/wcif/zip") {
            val generationDate = LocalDateTime.now()
            val query = call.receive<WcifScrambleRequest>()

            val extWcif = call.yieldExtendedWcif(query)

            val pdfPassword = query.pdfPassword
            val zipPassword = query.zipPassword

            val jobId = JobSchedulingHandler.nextJobID()

            launch(context = JobSchedulingHandler.JOB_CONTEXT) {
                val wcif = WCIFScrambleMatcher.fillScrambleSetsAsync(extWcif) { pzl, _ ->
                    JobSchedulingHandler.registerProgress(jobId, pzl.key)
                }

                val zip = WCIFDataBuilder.wcifToZip(wcif, pdfPassword, generationDate, environmentConfig.projectTitle, call.request.uri)
                val bytes = zip.compress(zipPassword)

                JobSchedulingHandler.registerProgress(jobId, "PDF")
                JobSchedulingHandler.registerResult(jobId, ContentType.Application.Zip, bytes)
            }

            call.respond(HttpStatusCode.Created, jobId)
        }
    }
}
