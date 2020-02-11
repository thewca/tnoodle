package org.worldcubeassociation.tnoodle.server.webscrambles.routing

import io.ktor.application.ApplicationCall
import io.ktor.application.call
import io.ktor.http.ContentType
import io.ktor.request.receive
import io.ktor.http.HttpStatusCode
import io.ktor.request.uri
import io.ktor.response.respond
import io.ktor.response.respondBytes
import io.ktor.routing.Routing
import io.ktor.routing.get
import io.ktor.routing.post
import org.worldcubeassociation.tnoodle.server.RouteHandler
import io.ktor.routing.put
import kotlinx.coroutines.asCoroutineDispatcher
import kotlinx.coroutines.launch
import org.worldcubeassociation.tnoodle.server.serial.JsonConfig
import org.worldcubeassociation.tnoodle.server.util.ServerEnvironmentConfig
import org.worldcubeassociation.tnoodle.server.webscrambles.serial.WcifScrambleRequest
import org.worldcubeassociation.tnoodle.server.webscrambles.wcif.WCIFDataBuilder
import org.worldcubeassociation.tnoodle.server.webscrambles.wcif.WCIFScrambleMatcher
import org.worldcubeassociation.tnoodle.server.webscrambles.wcif.model.Competition
import java.time.LocalDateTime
import java.util.concurrent.Executors

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

    override fun install(router: Routing) {
        router.post("/wcif/scrambles") {
            val extWcif = call.yieldExtendedWcif()
            val wcif = WCIFScrambleMatcher.fillScrambleSets(extWcif)

            call.respond(wcif)
        }

        router.put("/wcif/scrambles") {
            val extWcif = call.yieldExtendedWcif()

            val jobId = nextJobID()

            launch(context = JOB_CONTEXT) {
                val wcif = WCIFScrambleMatcher.fillScrambleSetsAsync(extWcif) { pzl, _ ->
                    val progress = JOBS.getOrPut(jobId) { mutableMapOf() }
                    progress.merge(pzl.key, 1, Int::plus)
                }

                val resultBytes = JsonConfig.SERIALIZER.stringify(Competition.serializer(), wcif)
                RESULTS[jobId] = ContentType.Application.Json to resultBytes.toByteArray()
            }

            call.respond(HttpStatusCode.Created, jobId)
        }

        router.post("/wcif/zip") {
            val generationDate = LocalDateTime.now()
            val wcifRequest = call.receive<WcifScrambleRequest>()

            val extWcif = call.yieldExtendedWcif(wcifRequest)
            val wcif = WCIFScrambleMatcher.fillScrambleSets(extWcif)

            val pdfPassword = wcifRequest.pdfPassword
            val zip = WCIFDataBuilder.wcifToZip(wcif, pdfPassword, generationDate, environmentConfig.projectTitle, call.request.uri)

            val zipPassword = wcifRequest.zipPassword
            val bytes = zip.compress(zipPassword)

            call.respondBytes(bytes, ContentType.Application.Zip)
        }

        router.put("/wcif/zip") {
            val generationDate = LocalDateTime.now()
            val query = call.receive<WcifScrambleRequest>()

            val extWcif = call.yieldExtendedWcif(query)

            val pdfPassword = query.pdfPassword
            val zipPassword = query.zipPassword

            val jobId = nextJobID()

            launch(context = JOB_CONTEXT) {
                val wcif = WCIFScrambleMatcher.fillScrambleSetsAsync(extWcif) { pzl, _ ->
                    val progress = JOBS.getOrPut(jobId) { mutableMapOf() }
                    progress.merge(pzl.key, 1, Int::plus)
                }

                JOBS[jobId]?.put("PDF", 0)
                val zip = WCIFDataBuilder.wcifToZip(wcif, pdfPassword, generationDate, environmentConfig.projectTitle, call.request.uri)

                JOBS[jobId]?.put("PDF", 1)
                RESULTS[jobId] = ContentType.Application.Zip to zip.compress(zipPassword)
            }

            call.respond(HttpStatusCode.Created, jobId)
        }

        router.get("/wcif/job-status/{jobId}") {
            val jobId = call.parameters["jobId"]?.toIntOrNull() ?: 0

            val progress = JOBS[jobId]
                ?: return@get call.respond(HttpStatusCode.NoContent)

            return@get call.respond(HttpStatusCode.PartialContent, progress)
        }

        router.get("/wcif/result/{jobId}") {
            val jobId = call.parameters["jobId"]?.toIntOrNull() ?: 0

            val (contentType, result) = RESULTS[jobId]
                ?: return@get call.respond(HttpStatusCode.NoContent)

            return@get call.respondBytes(result, contentType)
        }
    }

    companion object {
        private val JOB_CONTEXT = Executors.newSingleThreadExecutor().asCoroutineDispatcher()

        private val JOBS = mutableMapOf<Int, MutableMap<String, Int>>()
        private val RESULTS = mutableMapOf<Int, Pair<ContentType, ByteArray>>()

        private var JOB_INC = 0

        private fun nextJobID(): Int {
            synchronized(JOB_INC) {
                return JOB_INC.inc()
                    .also { JOB_INC = it }
                    .also { RESULTS.remove(it) }
            }
        }
    }
}
