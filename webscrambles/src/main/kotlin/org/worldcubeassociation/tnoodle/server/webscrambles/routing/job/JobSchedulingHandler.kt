package org.worldcubeassociation.tnoodle.server.webscrambles.routing.job

import io.ktor.http.ContentType
import io.ktor.http.HttpStatusCode
import io.ktor.server.application.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import io.ktor.server.websocket.*
import io.ktor.websocket.*
import kotlinx.serialization.builtins.MapSerializer
import kotlinx.serialization.builtins.serializer
import org.worldcubeassociation.tnoodle.server.RouteHandler
import org.worldcubeassociation.tnoodle.server.crypto.StringEncryption.encodeBase64
import org.worldcubeassociation.tnoodle.server.serial.JsonConfig
import org.worldcubeassociation.tnoodle.server.webscrambles.serial.FrontendErrorMessage
import org.worldcubeassociation.tnoodle.server.webscrambles.serial.FrontendErrorMessage.Companion.asFrontendError

object JobSchedulingHandler : RouteHandler {
    private val JOBS = mutableMapOf<Int, MutableMap<String, Int>>()
    private val RESULTS = mutableMapOf<Int, Pair<ContentType, ByteArray>>()
    private val ERRORS = mutableMapOf<Int, Pair<HttpStatusCode, Throwable>>()

    private const val JOB_ID_PARAM = "jobId"

    const val MARKER_ERROR_MESSAGE = "%%ERROR%%"

    private suspend fun ApplicationCall.checkAndYieldJobId(): Int? {
        val jobId = parameters[JOB_ID_PARAM]?.toIntOrNull() ?: -1

        ERRORS[jobId]?.let { (status, error) ->
            respond(status, error)
            return null
        }

        return jobId
    }

    override fun install(router: Route) {
        router.route("status") {
            get("{$JOB_ID_PARAM}") {
                val jobId = call.checkAndYieldJobId() ?: return@get

                val progress = JOBS[jobId]
                    ?: return@get call.respond(HttpStatusCode.NoContent)

                return@get call.respond(HttpStatusCode.PartialContent, progress)
            }
        }

        router.route("result") {
            get("{$JOB_ID_PARAM}") {
                val jobId = call.checkAndYieldJobId() ?: return@get

                val (contentType, result) = RESULTS[jobId]
                    ?: return@get call.respond(HttpStatusCode.NoContent)

                return@get call.respondBytes(result, contentType)
            }
        }
    }

    fun nextJobID(): Int {
        synchronized(JOBS) {
            val listedJobs = JOBS.keys

            val jobId = listedJobs.indices
                .map(Int::inc)
                .firstOrNull { it !in JOBS }
                ?: listedJobs.maxOrNull()?.plus(1)
                ?: 1

            return jobId
                .also { RESULTS.remove(it) }
                .also { ERRORS.remove(it) }
        }
    }

    fun registerProgress(jobId: Int, worker: String) {
        val progress = JOBS.getOrPut(jobId) { mutableMapOf() }
        progress.merge(worker, 1, Int::plus)
    }

    fun registerResult(jobId: Int, contentType: ContentType, resultData: ByteArray) {
        RESULTS[jobId] = contentType to resultData
    }

    fun reportError(jobId: Int, statusCode: HttpStatusCode, error: Throwable) {
        ERRORS[jobId] = statusCode to error
    }

    fun <T> Route.registerJobPaths(job: LongRunningJob<T>) {
        post {
            val request = job.extractCall(call)
            val (type, data) = job.runBlocking(request)

            call.respondBytes(data, type)
        }

        put {
            val request = job.extractCall(call)
            val jobCreation = job.launch(request)

            call.respond(HttpStatusCode.Created, jobCreation)
        }

        webSocket {
            for (frame in incoming) {
                if (frame is Frame.Text) {
                    try {
                        val request = job.extractFrame(call, frame)

                        val target = job.getTargetState(request)
                        val targetEnc = JsonConfig.SERIALIZER.encodeToString(MapSerializer(String.serializer(), Int.serializer()), target)
                        send(targetEnc)

                        val (type, data) = job.channel(request, this)

                        val targetMarker = job.getResultMarker(request)
                        val encodedData = data.encodeBase64()

                        // signal that the computation result is about to start
                        send(targetMarker)

                        send(type.toString())
                        send(encodedData)

                        close()
                    } catch (e: Throwable) {
                        val errorModel = e.asFrontendError()
                        val errorSerial = JsonConfig.SERIALIZER.encodeToString(FrontendErrorMessage.serializer(), errorModel)

                        send(MARKER_ERROR_MESSAGE)
                        send(errorSerial)

                        close(CloseReason(CloseReason.Codes.INTERNAL_ERROR, MARKER_ERROR_MESSAGE))
                    }
                }
            }
        }
    }
}
