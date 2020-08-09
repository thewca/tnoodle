package org.worldcubeassociation.tnoodle.server.webscrambles.routing.job

import io.ktor.application.ApplicationCall
import io.ktor.application.call
import io.ktor.http.ContentType
import io.ktor.http.HttpStatusCode
import io.ktor.response.respond
import io.ktor.response.respondBytes
import io.ktor.routing.*
import org.worldcubeassociation.tnoodle.server.RouteHandler

object JobSchedulingHandler : RouteHandler {
    private val JOBS = mutableMapOf<Int, MutableMap<String, Int>>()
    private val RESULTS = mutableMapOf<Int, Pair<ContentType, ByteArray>>()
    private val ERRORS = mutableMapOf<Int, Pair<HttpStatusCode, Throwable>>()

    private const val JOB_ID_PARAM = "jobId"

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
            val (type, data) = job.computeBlocking(request)

            call.respondBytes(data, type)
        }

        put {
            val request = job.extractCall(call)
            val jobCreation = job.launch(request)

            call.respond(HttpStatusCode.Created, jobCreation)
        }
    }
}
